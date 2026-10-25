import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Info, X } from "lucide-react";
import NormalProfileImg from "@/assets/normal-profile.png";
import BusinessProfileImg from "@/assets/business-profile.png";
import { BusinessLinkPopup } from "./BusinessLinkPopup";

interface ProfileSelectPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProfileSelectPopup = ({ isOpen, onClose }: ProfileSelectPopupProps) => {
  const [isBusinessPopupOpen, setIsBusinessPopupOpen] = useState(false);
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleLinkNow = () => {
    onClose();
    navigate('/user-info', { state: { linkBusiness: true } });
  };

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/40 z-40"
        onClick={onClose}
      />

      {/* Popup sliding up from bottom */}
      <div
        className="fixed bottom-0 left-0 w-[765px] z-50 bg-white rounded-t-[30px] shadow-2xl animate-in slide-in-from-bottom duration-300 pb-8"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-10 pt-8 pb-5">
          <span className="text-zinc-800 text-4xl font-bold font-['Inter']">Select Profile</span>
          <X
            className="w-10 h-10 text-zinc-800 cursor-pointer"
            onClick={onClose}
          />
        </div>

        {/* Separator */}
        <div className="w-full h-[1px] bg-gray-200" />

        {/* Personal Profile - highlighted */}
        <div className="mx-8 mt-6 px-7 py-6 rounded-2xl border-2 flex items-center gap-6" style={{ backgroundColor: '#e8f7f7', borderColor: '#10bbc3' }}>
          <div className="w-18 h-18 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#e0f4f4', width: '72px', height: '72px' }}>
            <img className="w-13 h-13" style={{ width: '52px', height: '52px' }} src={NormalProfileImg} alt="Personal Profile" />
          </div>
          <span className="text-zinc-800 text-3xl font-bold font-['Inter']">Personal Profile</span>
        </div>

        {/* Business Profile */}
        <div className="mx-8 mt-5 px-7 py-6 rounded-2xl border border-gray-200 flex items-center gap-6">
          <div className="rounded-xl flex items-center justify-center" style={{ backgroundColor: '#e0f4f4', width: '72px', height: '72px' }}>
            <img style={{ width: '52px', height: '52px' }} src={BusinessProfileImg} alt="Business Profile" />
          </div>
          <span className="text-zinc-800 text-3xl font-bold font-['Inter']">Business Profile</span>
          <Info className="w-7 h-7 text-zinc-400 cursor-pointer" onClick={() => setIsBusinessPopupOpen(true)} />
          <div className="ml-auto px-8 py-4 bg-lime-400 rounded-2xl cursor-pointer hover:opacity-90 transition-opacity" onClick={handleLinkNow}>
            <span className="text-white text-2xl font-bold font-['Inter']">Link Now</span>
          </div>
        </div>
      </div>

      <BusinessLinkPopup isOpen={isBusinessPopupOpen} onClose={() => setIsBusinessPopupOpen(false)} />
    </>
  );
};
