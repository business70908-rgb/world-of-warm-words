import { useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect, useCallback } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { MobileContainer } from "@/components/MobileContainer";
import { authenticateForPayment } from "@/lib/biometricAuth";
import { toast } from "sonner";
import { walletStorage } from "@/lib/storage/walletStorage";

import backArrow from "@/assets/back-arrow.png";
import errorIcon from "@/assets/_9.png";
import tickMarkAnimation from "@/assets/tick-mark-animation.gif";

declare global {
  interface Window {
    Razorpay: any;
  }
}

const PRESET_AMOUNTS = [100, 200, 500];
const ERROR_DISPLAY_DURATION = 3000;

const AddMoney = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const returnPath = (location.state as { returnPath?: string })?.returnPath;
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState<string>("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const [currentBalance, setCurrentBalance] = useState<number>(0);
  const [isSuccessDialogOpen, setIsSuccessDialogOpen] = useState(false);
  const [amountToAdd, setAmountToAdd] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [showError, setShowError] = useState(false);

  useEffect(() => {
    const loadBalance = async () => {
      const balance = await walletStorage.getBalance();
      setCurrentBalance(balance);
    };
    
    loadBalance();

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const showErrorMessage = useCallback((message: string) => {
    setErrorMessage(message);
    setShowError(true);
    setTimeout(() => setShowError(false), ERROR_DISPLAY_DURATION);
  }, []);

  const toggleShowMore = useCallback(() => {
    setShowMore(prev => !prev);
  }, []);

  const handleCustomAmountChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    setCustomAmount(value);
    if (value) {
      setSelectedAmount(null);
    }
  }, []);

  const handlePresetAmount = useCallback((amount: number) => {
    setSelectedAmount(amount);
    setCustomAmount(amount.toString());
  }, []);

  const handlePaymentSuccess = useCallback(async (amount: number) => {
    const newBalance = currentBalance + amount;
    await walletStorage.updateBalance(newBalance);
    setCurrentBalance(newBalance);
    setAmountToAdd(amount);
    
    await walletStorage.addTransaction({
      id: Date.now().toString(),
      type: 'credit',
      amount: amount,
      description: `Added money to Tummoc Wallet`,
      timestamp: Date.now(),
      paymentMethod: 'tummoc',
    });
    
    setIsSuccessDialogOpen(true);
    setCustomAmount("");
    setSelectedAmount(null);
  }, [currentBalance]);

  const handlePayment = useCallback(async () => {
    const amount = customAmount ? parseInt(customAmount) : selectedAmount;

    if (!amount || amount <= 0) {
      showErrorMessage("Please select or enter a valid amount");
      return;
    }

    if (!termsAccepted) {
      showErrorMessage("Please accept the terms and conditions");
      return;
    }

    const savedApiKey = localStorage.getItem("razorpayApiKey");

    if (!savedApiKey && typeof window.Razorpay !== "undefined") {
      showErrorMessage("Please configure RazorPay API key in Account Settings");
      return;
    }

    if (typeof window.Razorpay !== "undefined" && savedApiKey) {
      const options = {
        key: savedApiKey,
        amount: amount * 100,
        currency: "INR",
        name: "Tummoc Money",
        description: `Add ₹${amount} to Tummoc Money`,
        handler: function () {
          handlePaymentSuccess(amount);
        },
        prefill: {
          name: "User",
          email: "user@example.com",
          contact: "9999999999",
        },
        theme: {
          color: "#14b8a6",
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } else {
      // Use native biometric authentication instead of confirm dialog
      await authenticateForPayment(
        amount,
        `Add money to Tummoc Money balance`,
        () => {
          handlePaymentSuccess(amount);
        },
        () => {
          toast.error('Payment cancelled', {
            description: 'Money was not added. Please try again.',
          });
        }
      );
    }
  }, [customAmount, selectedAmount, termsAccepted, showErrorMessage, handlePaymentSuccess]);

  const handleBack = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  const handleDialogClose = useCallback(() => {
    setIsSuccessDialogOpen(false);
    if (returnPath) {
      navigate(returnPath, { replace: true });
    } else {
      navigate('/tummoc-money', { replace: true });
    }
  }, [returnPath, navigate]);

  return (
    <MobileContainer width={713} height={1440}>
      <div className="w-[713px] h-60 left-0 top-[1197px] absolute bg-black/0">
        <div className="w-[713px] h-60 left-0 top-[-1px] absolute" style={{backgroundColor: '#fefefd'}} />
        <div className="w-[680px] h-28 left-[16px] top-[118px] absolute bg-black/0">
          <div 
            className="w-[671px] h-24 left-[5px] top-[5px] absolute bg-cyan-500 rounded-3xl border border-teal-400 cursor-pointer hover:bg-cyan-600 transition-colors" 
            onClick={handlePayment}
          />
          <div 
            className="w-40 h-10 left-[265px] top-[31px] absolute justify-center text-white text-3xl font-bold font-['Inter'] cursor-pointer"
            onClick={handlePayment}
          >
            Add Money
          </div>
        </div>
        <div className="w-[624px] h-8 left-[89px] top-[45px] absolute justify-center text-neutral-500 text-2xl font-semibold font-['Inter']">I have read and accepted the terms and conditions</div>
        <Checkbox 
          checked={termsAccepted}
          onCheckedChange={(checked) => setTermsAccepted(checked === true)}
          className="w-9 h-9 left-[25px] top-[40px] absolute border-4 border-gray-400 data-[state=checked]:bg-cyan-500 data-[state=checked]:border-cyan-500 data-[state=checked]:text-white [&>*]:scale-150 [&>*]:stroke-[3px]"
        />
      </div>
      <div className="w-[713px] h-[1195px] left-0 top-0 absolute bg-black/0">
        <div className="w-[713px] h-[1195px] left-0 top-0 absolute" style={{backgroundColor: '#f3f3f2'}} />
        <div className="w-[639px] h-[803px] left-[36px] top-[120px] absolute bg-black/0">
          <div className={`w-[637px] ${showMore ? 'h-[500px]' : 'h-96'} left-[1px] top-[450px] absolute bg-black/0 transition-all duration-300`}>
            <div className={`w-[633px] ${showMore ? 'h-[496px]' : 'h-80'} left-[3px] top-[3px] absolute bg-white rounded-3xl transition-all duration-300`} />
            <button 
              onClick={toggleShowMore}
              className={`w-40 h-6 left-[41px] ${showMore ? 'top-[460px]' : 'top-[251px]'} absolute flex items-center justify-center text-cyan-500 text-2xl font-normal font-['Inter'] cursor-pointer hover:text-cyan-600 transition-all duration-300`}
            >
              {showMore ? 'Show less' : 'Show more'}
              <svg 
                className={`w-4 h-4 ml-2 transition-transform duration-300 ${showMore ? 'rotate-180' : ''}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            <div className="w-1.5 h-1.5 left-[32px] top-[160px] absolute bg-black rounded-full" />
            <div className="w-[515px] h-24 left-[47px] top-[143px] absolute justify-center text-neutral-400 text-[22px] font-normal font-['Inter'] leading-tight">You cannot withdraw your Tummoc Money<br/>balance once added. This amount added by<br/>you will never expire.</div>
            <div className="w-1.5 h-1.5 left-[32px] top-[90px] absolute bg-black rounded-full" />
            <div className="w-[516px] h-16 left-[47px] top-[72px] absolute justify-center text-zinc-500 text-[22px] font-normal font-['Inter'] leading-tight">You can add money to your Tummoc Money<br/>using different payment methods.</div>
            <div className="w-72 h-7 left-[33px] top-[26px] absolute justify-center text-stone-500 text-[22px] font-bold font-['Inter']">Terms and Conditions</div>
            
            {showMore && (
              <div className="animate-fade-in">
                <div className="w-1.5 h-1.5 left-[32px] top-[250px] absolute bg-black rounded-full" />
                <div className="w-[515px] h-20 left-[47px] top-[243px] absolute justify-center text-neutral-400 text-[22px] font-normal font-['Inter'] leading-tight">In Case of cashbacks and referrals, the amount<br/>will be added to your Tummoc Money automatically.</div>
                <div className="w-1.5 h-1.5 left-[32px] top-[340px] absolute bg-black rounded-full" />
                <div className="w-[515px] h-24 left-[47px] top-[323px] absolute justify-center text-neutral-400 text-[22px] font-normal font-['Inter'] leading-tight">Any incentives provided to the user by the company<br/>in the form of Cashback will expire after 30 days<br/>when credited if unused.</div>
              </div>
            )}
          </div>
          <div className="w-[639px] h-96 left-0 top-0 absolute bg-black/0">
            <div className="w-[635px] h-[420px] left-[3px] top-[2px] absolute bg-white rounded-3xl border border-neutral-200" />
            {PRESET_AMOUNTS.map((amount, index) => {
              const isSelected = selectedAmount === amount;
              const positions = ['left-[104px]', 'left-[249px]', 'left-[399px]'];
              return (
                <div key={amount} className={`w-32 h-20 ${positions[index]} top-[321px] absolute bg-black/0`}>
                  <div 
                    className={`w-32 h-16 left-[5px] top-[5px] absolute rounded-[10px] border-2 cursor-pointer transition-colors ${
                      isSelected ? 'bg-cyan-50 border-cyan-400' : 'bg-white border-neutral-200'
                    }`}
                    onClick={() => handlePresetAmount(amount)}
                  />
                  <div 
                    className={`w-16 h-8 left-[33px] top-[20px] absolute justify-center text-3xl font-normal font-['Inter'] cursor-pointer ${
                      isSelected ? 'text-cyan-600' : 'text-stone-300'
                    }`}
                    onClick={() => handlePresetAmount(amount)}
                  >
                    ₹{amount}
                  </div>
                </div>
              );
            })}
            <div className="w-40 h-6 left-[243px] top-[245px] absolute justify-center text-neutral-500 text-2xl font-normal font-['Inter']">Enter amount</div>
            <input
              type="text"
              value={customAmount}
              onChange={handleCustomAmountChange}
              placeholder="00"
              className={`w-80 h-20 left-[268px] top-[140px] absolute text-left text-8xl font-normal font-['Inter'] bg-transparent border-none outline-none ${
                customAmount ? 'text-black' : 'text-zinc-400'
              }`}
              maxLength={4}
            />
            <div className="w-8 h-14 left-[218px] top-[155px] absolute justify-center text-zinc-600 text-6xl font-normal font-['Arial']">₹</div>
            <div className="w-[592px] h-px left-[24px] top-[99px] absolute bg-gray-200" />
            <div className="h-8 right-[46px] top-[41px] absolute flex items-center gap-2 text-zinc-600 text-3xl font-bold font-['Inter']"><span className="font-['Arial']">₹</span><span>{currentBalance.toFixed(1)}</span></div>
            <div className="w-56 h-7 left-[27px] top-[40px] absolute justify-center text-neutral-500 text-3xl font-normal font-['Inter']">Current Balance</div>
          </div>
        </div>
        <div className="w-[713px] h-20 left-0 top-[17px] absolute bg-black/0">
          <div className="w-48 h-11 left-[102px] top-[21px] absolute justify-center text-gray-700 text-3xl font-bold font-['Inter']">Add Money</div>
          <img 
            className="w-7 h-7 left-[37px] top-[27px] absolute cursor-pointer" 
            src={backArrow}
            onClick={handleBack}
            alt="Back"
          />
        </div>
      </div>


      {showError && (
        <div className="h-20 top-[1077px] absolute left-1/2 -translate-x-1/2 flex items-center px-6 bg-white rounded-2xl shadow-lg border border-gray-200 animate-scale-in whitespace-nowrap">
          <img src={errorIcon} alt="Error" className="w-14 h-14 rounded-full border-2 border-cyan-500 flex-shrink-0" />
          <div className="ml-4 text-gray-700 text-2xl font-medium font-['Inter']">
            {errorMessage}
          </div>
        </div>
      )}

      {/* Success Dialog */}
      <Dialog open={isSuccessDialogOpen} onOpenChange={setIsSuccessDialogOpen}>
        <DialogContent className="sm:max-w-md rounded-3xl border-none shadow-xl">
          <div className="flex flex-col items-center justify-center space-y-6 py-10 px-6">
            <div className="w-28 h-28 flex items-center justify-center">
              <img 
                src={tickMarkAnimation} 
                alt="Success" 
                className="w-28 h-28"
              />
            </div>
            <div className="text-5xl font-semibold text-gray-800 text-center">
              ₹ {amountToAdd}
            </div>
            <div className="text-2xl text-gray-600 text-center">
              Added to Tummoc Money
            </div>
            <Button
              onClick={handleDialogClose}
              className="px-14 py-6 bg-blue-500 hover:bg-blue-600 text-white rounded-xl text-2xl font-semibold"
            >
              Okay
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </MobileContainer>
  );
};

export default AddMoney;