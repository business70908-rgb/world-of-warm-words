import { nativeStorage } from '../nativeStorage';
import type { WalletBalance, Transaction, TransactionsData } from '@/types/storage';
import { cacheManager } from './cacheManager';

const BALANCE_PATH = 'wallet/balance.json';
const TRANSACTIONS_PATH = 'wallet/transactions.json';
const CACHE_KEY_BALANCE = 'wallet_balance';
const CACHE_KEY_TRANSACTIONS = 'wallet_transactions';
const CACHE_TTL = 30000; // 30 seconds

const DEFAULT_BALANCE: WalletBalance = {
  balance: 0,
  lastUpdated: new Date().toISOString(),
};

const DEFAULT_TRANSACTIONS: TransactionsData = {
  transactions: [],
};

export const walletStorage = {
  async getBalance(): Promise<number> {
    // Check cache first
    const cached = cacheManager.get<number>(CACHE_KEY_BALANCE);
    if (cached !== null && cached !== undefined) {
      return cached;
    }

    const data = await nativeStorage.readJSON<WalletBalance>(BALANCE_PATH, DEFAULT_BALANCE);
    const balance = data?.balance || 0;
    
    // Cache the result
    cacheManager.set(CACHE_KEY_BALANCE, balance, CACHE_TTL);
    
    return balance;
  },

  async updateBalance(newBalance: number): Promise<void> {
    const balanceData: WalletBalance = {
      balance: newBalance,
      lastUpdated: new Date().toISOString(),
    };
    await nativeStorage.writeJSON(BALANCE_PATH, balanceData);
    
    // Invalidate cache when updating
    cacheManager.invalidate(CACHE_KEY_BALANCE);
  },

  async getBalanceData(): Promise<WalletBalance> {
    const data = await nativeStorage.readJSON<WalletBalance>(BALANCE_PATH, DEFAULT_BALANCE);
    return data || DEFAULT_BALANCE;
  },

  async getTransactions(): Promise<Transaction[]> {
    // Check cache first
    const cached = cacheManager.get<Transaction[]>(CACHE_KEY_TRANSACTIONS);
    if (cached) {
      return cached;
    }

    const data = await nativeStorage.readJSON<TransactionsData>(TRANSACTIONS_PATH, DEFAULT_TRANSACTIONS);
    const transactions = data?.transactions || [];
    
    // Cache the result
    cacheManager.set(CACHE_KEY_TRANSACTIONS, transactions, CACHE_TTL);
    
    return transactions;
  },

  async addTransaction(transaction: Transaction): Promise<void> {
    const data = await nativeStorage.readJSON<TransactionsData>(TRANSACTIONS_PATH, DEFAULT_TRANSACTIONS);
    const transactions = data?.transactions || [];
    
    // Add new transaction at the beginning (most recent first)
    transactions.unshift(transaction);
    
    await nativeStorage.writeJSON(TRANSACTIONS_PATH, { transactions });
    
    // Invalidate cache when adding
    cacheManager.invalidate(CACHE_KEY_TRANSACTIONS);
  },

  async clearTransactions(): Promise<void> {
    await nativeStorage.writeJSON(TRANSACTIONS_PATH, DEFAULT_TRANSACTIONS);
    
    // Invalidate cache when clearing
    cacheManager.invalidate(CACHE_KEY_TRANSACTIONS);
  },

  async getTummocOnlyTransactions(): Promise<Transaction[]> {
    const allTransactions = await this.getTransactions();
    return allTransactions.filter(t => t.paymentMethod === 'tummoc' || !t.paymentMethod);
  },
};
