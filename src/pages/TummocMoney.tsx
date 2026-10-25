import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import arrowRight from "@/assets/arrow-right.png";
import termsIcon from "@/assets/terms-icon.png";
import transactionHistoryIcon from "@/assets/transaction-history-icon.png";
import newBackArrow from "@/assets/new-back-arrow.png";
import walletIcon from "@/assets/wallet-icon.png";
import { MobileContainer } from "@/components/MobileContainer";

const TummocMoney = () => {
  const navigate = useNavigate();
  const [currentBalance, setCurrentBalance] = useState<number>(0);
  const [termsOpen, setTermsOpen] = useState(false);

  useEffect(() => {
    // Load current balance from localStorage
    const savedBalance = localStorage.getItem("tummocBalance");
    if (savedBalance) {
      setCurrentBalance(parseFloat(savedBalance));
    }

    // Listen for balance updates
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "tummocBalance" && e.newValue) {
        setCurrentBalance(parseFloat(e.newValue));
      }
    };

    const handleFocus = () => {
      const savedBalance = localStorage.getItem("tummocBalance");
      if (savedBalance) {
        setCurrentBalance(parseFloat(savedBalance));
      }
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("focus", handleFocus);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("focus", handleFocus);
    };
  }, []);

  return (
    <MobileContainer width={768} height={1400}>
      <div className="w-[768px] h-full left-0 top-0 absolute bg-black/0">
        <div className="w-[768px] h-full left-0 top-0 absolute bg-white" />
        <div className="w-[768px] left-0 top-[384px] absolute bg-black/0" style={{ bottom: 0 }}>
          <div className="w-[768px] h-full left-0 top-0 absolute bg-white" />
          <div className="w-[93.5%] h-52 left-[3.4%] bottom-[5%] absolute bg-black/0">
            <div className="w-[98%] h-48 left-[1%] top-[1px] absolute bg-white rounded-3xl border-2 border-neutral-300" />
            <div className="w-[708px] h-24 left-[5px] top-[101px] absolute bg-black/0 cursor-pointer" onClick={() => setTermsOpen(true)}>
              <img className="w-3 h-5 left-[667px] top-[40px] absolute" src={arrowRight} />
              <div className="w-48 h-8 left-[95px] top-[32px] absolute justify-center text-gray-600 text-3xl font-normal font-['Inter']">Terms of Use</div>
              <img className="w-7 h-8 left-[40px] top-[34px] absolute" src={termsIcon} />
            </div>
            <div className="w-[92%] h-[2px] left-[3.6%] top-[101px] absolute bg-neutral-300" />
            <div className="w-[708px] h-24 left-[5px] top-0 absolute bg-black/0 cursor-pointer" onClick={() => navigate('/transaction-history')}>
              <img className="w-3.5 h-5 left-[667px] top-[40px] absolute" src={arrowRight} />
              <div className="w-72 h-9 left-[95px] top-[30px] absolute justify-center text-gray-600 text-3xl font-normal font-['Inter']">Transaction History</div>
              <img className="w-8 h-8 left-[38px] top-[35px] absolute" src={transactionHistoryIcon} />
            </div>
          </div>
        </div>
        
        <div className="w-[768px] h-96 left-0 top-0 absolute bg-black/0">
          <div className="w-[768px] h-96 left-0 top-0 absolute bg-teal-950 header-teal-fix" />
          <div className="w-[768px] h-24 left-0 top-0 absolute bg-black/0">
            <div className="w-72 h-10 left-[110px] top-[31px] absolute justify-center text-3xl font-bold font-['Inter']" style={{color: '#fefefd'}}>Tummoc Money</div>
            <img 
              className="w-8 h-7 left-[39px] top-[37px] absolute cursor-pointer" 
              src={newBackArrow} 
              onClick={() => navigate(-1)}
              alt="Back"
            />
          </div>
        </div>
        <div className="w-[722px] h-72 left-[23px] top-[162px] absolute bg-black/0">
          <div className="w-[722px] h-72 left-0 top-0 absolute bg-black/0">
            <div className="w-[719px] h-72 left-[1px] top-0 absolute rounded-lg shadow-lg" style={{backgroundColor: '#fefefd'}} />
            <button 
              className="w-[648px] h-20 left-[37px] top-[179px] absolute rounded-xl text-white text-3xl font-semibold"
              style={{ backgroundColor: '#02B8B8' }}
              onClick={() => navigate('/add-money')}
            >
              Add Money
            </button>
            <img className="w-24 h-24 left-[583px] top-[36px] absolute" src={walletIcon} />
            <div className="w-28 h-12 left-[38px] top-[84px] absolute flex items-center gap-3 text-gray-700 font-normal font-['Inter']"><span className="font-['Arial'] text-5xl">₹</span><span className="text-5xl">{currentBalance.toFixed(1)}</span></div>
            <div className="w-64 h-9 left-[38px] top-[28px] absolute justify-center text-zinc-500 text-3xl font-normal font-['Inter']">Available Balance</div>
          </div>
        </div>
      </div>

      {termsOpen && (
        <>
          <div 
            className="absolute inset-0 bg-black/50 z-40"
            onClick={() => setTermsOpen(false)}
          />
          <div 
            className="absolute bottom-0 left-0 w-[768px] bg-white z-50"
            style={{ height: '560px', borderTopLeftRadius: '24px', borderTopRightRadius: '24px' }}
          >
            <div className="px-10 pt-8 pb-8">
              <div className="text-4xl font-bold text-gray-800 mb-8">Terms and Conditions</div>
              <ul className="space-y-5 text-gray-600 text-2xl leading-relaxed">
                <li className="flex gap-3">
                  <span>•</span>
                  <span>You can add money to your Tummoc Money using different payment methods.</span>
                </li>
                <li className="flex gap-3">
                  <span>•</span>
                  <span>You cannot withdraw your Tummoc Money balance once added. This amount added by you will never expire.</span>
                </li>
                <li className="flex gap-3">
                  <span>•</span>
                  <span>In case of cashbacks and referrals, the amount will be added to your Tummoc Money automatically.</span>
                </li>
                <li className="flex gap-3">
                  <span>•</span>
                  <span>Any incentives provided to the user by the company in the form of Cashback will expire after 30 days when credited if unused.</span>
                </li>
              </ul>
            </div>
          </div>
        </>
      )}
    </MobileContainer>
  );
};

export default TummocMoney;