import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import backArrow from "@/assets/back-arrow.png";
import emptyStateImage from "@/assets/2b.png";
import { MobileContainer } from "@/components/MobileContainer";

interface Transaction {
  id: string;
  amount: number;
  timestamp?: number;
  date?: string;
  type: "credit" | "debit";
  description: string;
  paymentMethod?: 'tummoc' | 'razorpay';
}

const TransactionHistory = () => {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    // Load transactions from localStorage
    const savedTransactions = localStorage.getItem("tummocTransactions");
    if (savedTransactions) {
      const parsedTransactions = JSON.parse(savedTransactions);
      // Filter only Tummoc Money transactions
      const tummocOnlyTransactions = parsedTransactions.filter((t: Transaction) => 
        t.paymentMethod === 'tummoc' || !t.paymentMethod
      );
      // Normalize timestamp/date field
      const normalizedTransactions = tummocOnlyTransactions.map((t: Transaction) => ({
        ...t,
        timestamp: t.timestamp || (t.date ? new Date(t.date).getTime() : Date.now())
      }));
      // Sort by timestamp descending (newest first)
      const sortedTransactions = normalizedTransactions.sort((a: Transaction, b: Transaction) => b.timestamp! - a.timestamp!);
      setTransactions(sortedTransactions);
    }
  }, []);

  // Group transactions by month/year
  const groupedTransactions = transactions.reduce((acc, transaction) => {
    const date = new Date(transaction.timestamp!);
    const monthYear = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    
    if (!acc[monthYear]) {
      acc[monthYear] = [];
    }
    acc[monthYear].push(transaction);
    return acc;
  }, {} as Record<string, Transaction[]>);

  const formatDateTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const day = date.getDate();
    const month = date.toLocaleDateString('en-US', { month: 'short' });
    const year = date.getFullYear();
    const time = date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
    return `${day} ${month} ${year}, ${time}`;
  };

  return (
    <MobileContainer width={768} height={1400}>
      <div className="w-[768px] h-[1400px] relative bg-white">
          {/* Header */}
          <div className="w-[768px] h-24 left-0 top-0 absolute bg-white border-b border-gray-200">
            <img 
              className="w-7 h-7 left-[37px] top-[37px] absolute cursor-pointer" 
              src={backArrow}
              onClick={() => navigate(-1)}
              alt="Back"
            />
            <div className="w-96 h-11 left-[102px] top-[32px] absolute text-gray-900 text-3xl font-bold font-['Inter']">
              Transaction History
            </div>
          </div>

          {/* Transactions List */}
          <div className="absolute left-0 right-0 top-[96px] bottom-0 overflow-y-auto">
            {Object.entries(groupedTransactions).length === 0 ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <img className="w-[340px] h-[140px]" src={emptyStateImage} alt="Empty state" />
                <div className="mt-10 text-[#4C585B] text-[44px] font-inter font-bold">&quot; Uh - oh &quot;</div>
                <div className="mt-5 text-[#B0B0B0] text-[30px] font-inter font-normal">Couldn't find any information here</div>
              </div>
            ) : (
              Object.entries(groupedTransactions).map(([monthYear, monthTransactions]) => (
                <div key={monthYear} className="mb-1">
                  {/* Month/Year Header */}
                  <div 
                    className="w-full h-16 px-8 flex items-center"
                    style={{ backgroundColor: '#e3f7f8' }}
                  >
                    <div 
                      className="text-2xl font-semibold font-['Inter']"
                      style={{ color: '#427646' }}
                    >
                      {monthYear}
                    </div>
                  </div>

                  {/* Transaction Items */}
                  {monthTransactions.map((transaction) => {
                    const isCredit = transaction.type === 'credit';
                    const borderColor = isCredit ? '#4ade80' : '#ef4444';
                    const textColor = isCredit ? '#4ade80' : '#ef4444';
                    const amountColor = isCredit ? '#4ade80' : '#ef4444';
                    const icon = isCredit ? '+ ₹' : '- ₹';
                    
                    return (
                      <div 
                        key={transaction.id} 
                        className="w-full px-8 py-6 bg-white border-b border-gray-100 flex items-center justify-between"
                      >
                        {/* Left: Icon */}
                        <div className="flex-shrink-0">
                          <div 
                            className="w-14 h-14 rounded-full flex items-center justify-center border-[3px]"
                            style={{ borderColor: borderColor, backgroundColor: 'white' }}
                          >
                            <div className="text-3xl font-bold font-['Inter']" style={{ marginLeft: '-3px', color: textColor }}>
                              {icon}
                            </div>
                          </div>
                        </div>

                        {/* Center: Description and Time */}
                        <div className="flex-1 ml-6">
                          <div className="text-gray-900 text-2xl font-medium font-['Inter'] mb-1">
                            {transaction.description}
                          </div>
                          <div className="text-gray-500 text-xl font-normal font-['Inter']">
                            {formatDateTime(transaction.timestamp!)}
                          </div>
                        </div>

                        {/* Right: Amount */}
                        <div className="flex-shrink-0 ml-4">
                          <div 
                            className="text-3xl font-bold font-['Inter']"
                            style={{ color: amountColor }}
                          >
                            {isCredit ? '+' : '-'} ₹ {transaction.amount.toFixed(1)}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))
          )}
        </div>
      </div>
    </MobileContainer>
  );
};

export default TransactionHistory;
