import React, { useState, useRef } from 'react';

interface TermsPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

const TERMS_CONTENT = [
  "Pass is valid for travel for the services it has been purchased and until the expiry date printed on the pass",
  "In case the conductor asks for your ID proof, you can either show a physical/digital copy of the ID used at the time of booking.",
  "Only one pass is allowed for one ID card",
  "Pass holders must show their passes to conductors or any authorised person on demand",
  "Improper/misuse of past result in withdrawal of pass attract penalty and pass holder will be liable to legal implications",
  "BMTC is not responsible if passenger/pass holder's mobile application is not working or switched off",
  "BMTC is not responsible if passenger/pass holder has entered wrong ID number in mobile pass purchased and the same cannot be accepted",
  "Pass holders should abide by and accept the conditions on which the pass is issued",
  "It is not required to carry BMTC ID card for pass holders who have purchased a digital pass"
];

export const FinalPageTermsPopup: React.FC<TermsPopupProps> = ({ isOpen, onClose }) => {
  const [heightPercent, setHeightPercent] = useState(70);
  const touchStartY = useRef<number | null>(null);
  const lastHeight = useRef(70);

  if (!isOpen) return null;

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
    lastHeight.current = heightPercent;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartY.current === null) return;
    const diff = touchStartY.current - e.touches[0].clientY;
    // diff > 0 means swiping up, diff < 0 means swiping down
    const newHeight = Math.min(90, Math.max(30, lastHeight.current + (diff / window.innerHeight) * 100));
    setHeightPercent(newHeight);
  };

  const handleTouchEnd = () => {
    const startH = lastHeight.current;
    const currentH = heightPercent;
    touchStartY.current = null;
    
    // Close if swiped down (current height is less than starting height by enough)
    if (currentH < startH - 10 || currentH < 45) {
      setHeightPercent(70);
      onClose();
    } else if (currentH < 75) {
      setHeightPercent(70);
    } else {
      setHeightPercent(85);
    }
    lastHeight.current = heightPercent;
  };

  return (
    <div className="absolute inset-0 z-50 bg-black/50" onClick={onClose}>
      <div 
        className="absolute bottom-0 left-0 right-0 bg-white overflow-hidden transition-[height] duration-200 ease-out"
        style={{ height: `${heightPercent}%`, borderTopLeftRadius: '24px', borderTopRightRadius: '24px' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drag handle */}
        <div 
          className="w-full flex justify-center pt-4 pb-2 cursor-grab active:cursor-grabbing"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div className="w-16 h-1.5 bg-gray-300 rounded-full" />
        </div>

        <div className="px-8 py-4">
          <h2 className="text-gray-900 text-3xl font-montserrat-bold font-bold">
            Terms and Conditions
          </h2>
        </div>

        <div className="px-8 py-4 overflow-y-auto" style={{ height: 'calc(100% - 100px)' }}>
          <div className="space-y-6">
            {TERMS_CONTENT.map((term, index) => (
              <div key={index} className="flex gap-4">
                <div className="w-2 h-2 bg-gray-600 rounded-full mt-3 flex-shrink-0" />
                <p className="text-gray-700 text-2xl font-montserrat-regular leading-relaxed">
                  {term}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
