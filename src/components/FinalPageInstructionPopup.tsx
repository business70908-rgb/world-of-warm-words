import React from 'react';
import mascotBird from '@/assets/mascot-bird.png';

interface InstructionPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FinalPageInstructionPopup: React.FC<InstructionPopupProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="absolute inset-0 flex items-center justify-center z-50 bg-black/50 p-8" onClick={onClose}>
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="bg-white pt-12 pb-8 flex justify-center">
          <img src={mascotBird} alt="Mascot" className="w-48 h-48 object-contain" />
        </div>
        
        <div className="px-12 pb-12 space-y-8">
          <div className="flex gap-4 ml-3">
            <div className="w-3 h-3 bg-gray-600 rounded-full mt-3 flex-shrink-0" />
            <div className="text-xl leading-relaxed">
              <span className="text-gray-600 font-montserrat-bold font-bold">SELF VALIDATION: </span>
              <span className="text-gray-600 font-montserrat-regular">Click on the button - Scan conductor QR for Validation - and scan the QR code displayed by the conductor</span>
            </div>
          </div>

          <div className="flex gap-4 ml-3">
            <div className="w-3 h-3 bg-gray-600 rounded-full mt-3 flex-shrink-0" />
            <div className="text-xl leading-relaxed">
              <span className="text-gray-600 font-montserrat-bold font-bold">CONDUCTOR VALIDATION: </span>
              <span className="text-gray-600 font-montserrat-regular">Present your pass QR code displayed here to the conductor for validation</span>
            </div>
          </div>

          <div className="flex gap-4 ml-3">
            <div className="w-3 h-3 bg-gray-600 rounded-full mt-3 flex-shrink-0" />
            <div className="text-xl leading-relaxed">
              <span className="text-gray-600 font-montserrat-bold font-bold">BUS NUMBER VALIDATION: </span>
              <span className="text-gray-600 font-montserrat-regular">Enter the bus number to validate your pass which can be found from the QR sticker in the bus, number plate, or ask the conductor.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
