import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import backArrow from '@/assets/back-arrow.png';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';

interface OtpPopupProps {
  isOpen: boolean;
  onClose: () => void;
  phoneNumber: string;
}

export const OtpPopup: React.FC<OtpPopupProps> = ({ isOpen, onClose, phoneNumber }) => {
  const [otp, setOtp] = useState('');
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleContinue = () => {
    if (otp.length === 4) {
      navigate('/');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-white flex flex-col">
      {/* Header with back arrow */}
      <div className="w-full h-16 flex items-center px-4">
        <button onClick={onClose} className="p-2">
          <img src={backArrow} alt="Back" className="w-6 h-6" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-start pt-20 px-8">
        <h2 className="text-gray-700 text-2xl font-semibold text-center mb-12">
          Enter Your 4-digit Pin
        </h2>

        {/* OTP Input */}
        <div className="mb-auto">
          <InputOTP
            maxLength={4}
            value={otp}
            onChange={(value) => setOtp(value)}
          >
            <InputOTPGroup className="gap-4">
              <InputOTPSlot index={0} className="w-16 h-16 text-2xl border-2 border-gray-300 rounded-lg bg-gray-100" />
              <InputOTPSlot index={1} className="w-16 h-16 text-2xl border-2 border-gray-300 rounded-lg bg-gray-100" />
              <InputOTPSlot index={2} className="w-16 h-16 text-2xl border-2 border-gray-300 rounded-lg bg-gray-100" />
              <InputOTPSlot index={3} className="w-16 h-16 text-2xl border-2 border-gray-300 rounded-lg bg-gray-100" />
            </InputOTPGroup>
          </InputOTP>
        </div>
      </div>

      {/* Footer with Continue button */}
      <div className="w-full p-6 pb-8">
        <button
          onClick={handleContinue}
          disabled={otp.length !== 4}
          className={`w-full py-4 rounded-lg text-lg font-medium transition-all ${
            otp.length === 4
              ? 'bg-teal-950 text-[#FEFEFE] hover:bg-teal-900'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          Continue
        </button>
      </div>
    </div>
  );
};
