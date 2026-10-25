import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Copy, Share2 } from "lucide-react";
import backArrow from "@/assets/back-arrow.png";
import referralMascot from "@/assets/referral-mascot.png";
import { MobileContainer } from "@/components/MobileContainer";

const Referrals = () => {
  const navigate = useNavigate();
  const [referralCode, setReferralCode] = useState("");

  // Generate random referral code
  const generateReferralCode = () => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
  };

  // Initialize with random code on component mount
  useEffect(() => {
    setReferralCode(generateReferralCode());
  }, []);

  // Copy to clipboard function
  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(referralCode);
      // Could add a toast notification here
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  return (
    <MobileContainer width={540} height={1093}>
      <div className="w-[540px] h-[1093px] left-0 top-0 absolute bg-black/0">
        <div className="w-[540px] h-[1093px] left-0 top-0 absolute bg-white" />
        <div className="w-[540px] h-[846px] left-0 top-0 absolute bg-black/0">
          <div className="w-40 h-7 left-[193px] top-[817px] absolute justify-center text-stone-300 text-xl font-normal font-['Inter']">No past referrals</div>
          <div className="w-64 h-7 left-[22px] top-[535px] absolute justify-center text-gray-600 text-2xl font-bold font-['Inter']">Successful Referrals</div>
          <div className="w-[540px] h-44 left-0 top-[323px] absolute bg-black/0">
            <div className="w-[540px] h-44 left-0 top-[-4px] absolute" style={{ backgroundColor: '#e3f7f8' }} />
            <button 
              className="w-72 h-12 left-[125px] top-[104px] absolute rounded-xl text-white text-base font-semibold flex items-center justify-center gap-2"
              style={{ backgroundColor: '#02B8B8' }}
            >
              <Share2 size={14} />
              Share your referral code
            </button>
            <div className="absolute left-0 right-0 top-[42px] flex items-center justify-center gap-3">
              <div className="text-slate-700 text-4xl font-bold font-['Inter']">{referralCode}</div>
              <button 
                onClick={handleCopyCode}
                className="cursor-pointer hover:opacity-70 transition-opacity"
              >
                <Copy size={20} className="text-gray-600" />
              </button>
            </div>
            <div className="w-40 h-6 left-[188px] top-[18px] absolute justify-center text-lg font-bold font-['Inter']" style={{ color: '#0EA3AB' }}>Your Referral Code</div>
          </div>
          <div className="w-96 h-14 left-[69px] top-[239px] absolute text-center justify-center text-neutral-400 text-xl font-bold font-['Inter'] leading-normal">Refer your friends and earn Rs 5 for every<br/>successfully sign-up!</div>
          <div className="w-[540px] h-44 left-0 top-0 absolute bg-black/0">
            <div className="w-[540px] h-44 left-0 top-0 absolute" style={{ backgroundColor: '#dfdfdf' }} />
            <div className="w-[540px] h-14 left-0 top-[4px] absolute bg-black/0">
              <div className="w-40 h-8 left-[100px] top-[15px] absolute justify-center text-gray-600 text-2xl font-normal font-['Inter']">My Referrals</div>
              <button 
                onClick={() => navigate(-1)}
                className="w-6 h-5 left-[27px] top-[21px] absolute cursor-pointer"
              >
                <img src={backArrow} alt="Back" className="w-full h-full object-contain" />
              </button>
            </div>
          </div>
          <div className="w-[511px] h-36 left-[14px] top-[84px] absolute bg-black/0">
            <div className="w-[504px] h-32 left-[4px] top-0 absolute bg-white rounded border border-neutral-200" />
            <img className="w-20 h-20 left-[392px] top-[25px] absolute object-contain" src={referralMascot} alt="Referral mascot" />
            <div className="w-7 h-9 left-[111px] top-[76px] absolute justify-center text-slate-700 text-4xl font-bold font-['Inter']">0</div>
            <div className="w-48 h-6 left-[29px] top-[25px] absolute justify-center text-gray-500 text-xl font-bold font-['Inter']">Your Referral Count</div>
          </div>
        </div>
      </div>
    </MobileContainer>
  );
};

export default Referrals;