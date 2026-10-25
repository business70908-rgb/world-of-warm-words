import React from 'react';
import tickMarkAnimation from '@/assets/tick-mark-animation.gif';

interface SuccessPopupProps {
  isOpen: boolean;
  onClose: () => void;
  passId: string;
  passType: string;
  passValidTill: string;
  amount: string;
}

export const FinalPageSuccessPopup: React.FC<SuccessPopupProps> = ({
  isOpen,
  onClose,
  passId,
  passType,
  passValidTill,
  amount,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50">
      <div className="bg-white rounded-3xl shadow-2xl p-10 pt-16 overflow-y-auto" style={{ width: '80%', height: '53%', maxWidth: '614px', maxHeight: '760px' }}>
        <div className="flex justify-center mb-8">
          <img src={tickMarkAnimation} alt="Success" className="w-28 h-28 object-contain" />
        </div>
        
        <h2 className="text-center text-gray-900 text-4xl font-montserrat-bold font-bold mb-10">
          Self verification done<br />successfully
        </h2>
        
        <div className="space-y-5 mb-6">
          <div className="flex justify-between items-center">
            <span className="text-gray-500 text-2xl font-montserrat-regular">Pass number</span>
            <span className="text-gray-900 text-2xl font-montserrat-bold font-medium">{passId}</span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-gray-500 text-2xl font-montserrat-regular">Pass type</span>
            <span className="text-gray-900 text-2xl font-montserrat-bold font-medium lowercase">{passType}</span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-gray-500 text-2xl font-montserrat-regular">Pass valid till</span>
            <span className="text-gray-900 text-2xl font-montserrat-bold font-medium">{passValidTill}</span>
          </div>
        </div>
        
        <div className="border-t border-gray-200 my-8" />
        
        <div className="flex justify-between items-center mb-10">
          <span className="text-gray-900 text-2xl font-montserrat-bold font-bold">Pass fare</span>
          <span className="text-gray-900 text-3xl font-montserrat-bold font-bold">
            <span style={{ fontFamily: 'Arial, sans-serif', fontWeight: 'bold' }}>₹</span> {amount}
          </span>
        </div>
        
        <button
          onClick={onClose}
          className="w-full text-white text-3xl font-montserrat-regular py-7 rounded-xl transition-colors duration-200"
          style={{ backgroundColor: '#5bc0de' }}
        >
          Okay
        </button>
      </div>
    </div>
  );
};
