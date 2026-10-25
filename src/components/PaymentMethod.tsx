import { useState, useEffect } from 'react';
import { X, ChevronRight } from 'lucide-react';
import tummocMoneyIcon from '@/Icon assets/tummoc-money.png';
import razorpayIcon from '@/assets/razorpay-logo.png';
import discountIcon from '@/assets/discount-icon.png';

interface PaymentMethodProps {
  isOpen: boolean;
  onClose: () => void;
  totalAmount: number;
  tummocBalance: number;
  onPaymentSelect: (method: 'tummoc' | 'razorpay') => void;
  onAddMoney: () => void;
}

export const PaymentMethod = ({
  isOpen,
  onClose,
  totalAmount,
  tummocBalance,
  onPaymentSelect,
  onAddMoney,
}: PaymentMethodProps) => {
  const [selectedMethod, setSelectedMethod] = useState<'tummoc' | 'razorpay' | null>('razorpay');
  const [razorpayApiKey, setRazorpayApiKey] = useState<string | null>(null);

  useEffect(() => {
    // Check for Razorpay API key
    const apiKey = localStorage.getItem('razorpayApiKey');
    setRazorpayApiKey(apiKey);
  }, [isOpen]);

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleMakePayment = () => {
    if (selectedMethod === 'tummoc' && !isTummocSufficient) {
      onAddMoney();
    } else if (selectedMethod) {
      onPaymentSelect(selectedMethod);
    }
  };

  const isTummocSufficient = tummocBalance >= totalAmount;

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/40 z-50 flex items-end"
      onClick={handleOverlayClick}
    >
      <div
        className="w-full rounded-t-3xl animate-slide-in-bottom"
        style={{ height: '45%', minHeight: '450px', backgroundColor: '#f3f3f3' }}
      >
        {/* Header */}
        <div className="px-6 py-2">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold" style={{ color: '#1E1E1E' }}>
              Pay Using
            </h2>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <X size={24} className="text-black" />
            </button>
          </div>
          <div className="border-t border-gray-400 mt-3" />
        </div>

        {/* Payment Options */}
        <div className="px-6 py-2 space-y-4">
          {/* Merged Payment Methods */}
          <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
            {/* Tummoc Money Option */}
            <div
              className="flex items-center gap-4 py-6 px-4 cursor-pointer transition-all bg-white"
              onClick={() => setSelectedMethod('tummoc')}
            >
              <img src={tummocMoneyIcon} alt="Tummoc Money" className="w-10 h-10 border-2 border-gray-300 rounded-lg p-2" />
              <div className="flex-1">
                <div className="font-semibold" style={{ color: '#1E1E1E' }}>
                  Tummoc Money
                </div>
                {!isTummocSufficient && (
                  <div className="text-sm font-medium" style={{ color: '#D32F2F' }}>
                    Insufficient Balance
                  </div>
                )}
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="text-lg font-semibold" style={{ color: '#1E1E1E' }}>
                    ₹ {tummocBalance.toFixed(1)}
                  </div>
                </div>
                <div
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                    selectedMethod === 'tummoc'
                      ? 'border-blue-500 bg-blue-500'
                      : 'border-gray-300'
                  }`}
                >
                  {selectedMethod === 'tummoc' && (
                    <div className="w-3 h-3 rounded-full bg-white" />
                  )}
                </div>
              </div>
            </div>

            {/* Dashed Divider */}
            <div className="px-4">
              <div className="border-t-2 border-dashed border-gray-300" />
            </div>

            {/* All Payment Mode Option */}
            <div
              className="flex items-center gap-4 py-6 px-4 cursor-pointer transition-all bg-white"
              onClick={() => setSelectedMethod('razorpay')}
            >
              <img src={razorpayIcon} alt="Razorpay" className="w-10 h-10 border-2 border-gray-300 rounded-lg p-1" />
              <div className="flex-1">
                <div className="font-semibold" style={{ color: '#1E1E1E' }}>
                  All payment mode
                </div>
                <div className="text-sm" style={{ color: '#6B6B6B' }}>
                  by Razorpay
                </div>
              </div>
              <div
                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                  selectedMethod === 'razorpay'
                    ? 'border-blue-500 bg-blue-500'
                    : 'border-gray-300'
                }`}
              >
                {selectedMethod === 'razorpay' && (
                  <div className="w-3 h-3 rounded-full bg-white" />
                )}
              </div>
            </div>
          </div>

          {/* Promo Code Section */}
          <div className="flex items-center justify-between p-5 rounded-xl border border-gray-200 bg-white cursor-pointer hover:bg-gray-50 transition-colors mt-12">
            <div className="flex items-center gap-3">
              <img src={discountIcon} alt="Discount" className="w-10 h-10" />
              <div className="font-medium" style={{ color: '#1E1E1E' }}>
                Apply Promocode/Coupon
              </div>
            </div>
            <ChevronRight size={24} className="text-black" />
          </div>
        </div>

        {/* Divider after promo code */}
        <div className="px-6">
          <div className="border-t border-gray-400" />
        </div>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 px-6 py-5 border-t border-gray-200" style={{ backgroundColor: '#f3f3f3' }}>
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="text-base" style={{ color: '#6B6B6B' }}>
                Total Fare
              </div>
              <div className="text-3xl font-bold" style={{ color: '#1E1E1E' }}>
                ₹ {totalAmount.toFixed(1)}
              </div>
            </div>
            <button
              onClick={handleMakePayment}
              disabled={!selectedMethod}
              className="px-16 py-5 rounded-xl font-semibold text-lg text-white transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
              style={{
                backgroundColor: selectedMethod ? '#00BCD4' : '#E0E0E0'
              }}
            >
              {selectedMethod === 'tummoc' && !isTummocSufficient ? 'Add money & Proceed' : 'Make Payment'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
