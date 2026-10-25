import { X } from "lucide-react";
import BusinessProfileImg from "@/assets/business-profile.png";

interface BusinessLinkPopupProps {
  isOpen: boolean;
  onClose: () => void;
  width?: number;
}

export const BusinessLinkPopup = ({ isOpen, onClose, width = 540 }: BusinessLinkPopupProps) => {
  if (!isOpen) return null;

  const scaledPadding = width <= 400 ? 'p-6' : 'p-10';
  const scaledTitle = width <= 400 ? 'text-2xl' : 'text-3xl';
  const scaledText = width <= 400 ? 'text-base' : 'text-xl';
  const scaledButton = width <= 400 ? 'py-4 text-xl' : 'py-5 text-2xl';
  const iconSize = width <= 400 ? '56px' : '80px';
  const imgSize = width <= 400 ? '40px' : '56px';

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-[60]" onClick={onClose} />

      <div
        className={`fixed z-[70] bg-white rounded-3xl shadow-2xl animate-in fade-in zoom-in-95 duration-200 ${scaledPadding}`}
        style={{
          width: `${width}px`,
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
        }}
      >
        {/* Header */}
        <div className="flex items-center gap-6 mb-6">
          <div className="rounded-xl flex items-center justify-center" style={{ backgroundColor: '#e0f4f4', width: iconSize, height: iconSize }}>
            <img style={{ width: imgSize, height: imgSize }} src={BusinessProfileImg} alt="Business Profile" />
          </div>
          <span className={`text-zinc-800 ${scaledTitle} font-bold font-['Inter']`}>Business Profile</span>
        </div>

        {/* Separator */}
        <div className="w-full h-[1px] mb-6" style={{ backgroundColor: '#e0e0e0' }} />

        {/* Body */}
        <p className={`${scaledText} font-normal font-['Inter'] mb-5`} style={{ color: '#a9a9a9' }}>
          A Business Profile is linked to your Personal Account and is used only for work-related bookings.
        </p>

        <p className={`${scaledText} font-bold font-['Inter'] text-zinc-800 mb-3`}>Ideal for</p>

        <p className={`${scaledText} font-normal font-['Inter'] mb-8`} style={{ color: '#a9a9a9' }}>
          A Business Profile is ideal for employees who use a business email and for those whose company is affiliated with Tummoc under the Carbon Savings initiative.
        </p>

        {/* Button */}
        <button
          className={`w-full ${scaledButton} rounded-2xl text-white font-bold font-['Inter'] cursor-pointer hover:opacity-90 transition-opacity`}
          style={{ backgroundColor: '#2596be' }}
          onClick={onClose}
        >
          Yes, continue
        </button>
      </div>
    </>
  );
};
