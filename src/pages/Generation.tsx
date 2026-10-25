import { useNavigate } from 'react-router-dom';
import { useState, useEffect, useMemo } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import newBackArrow from '../assets/new-back-arrow.png';
import kyImage from '../assets/Ky-new.png';
import backgroundImage from '../assets/4e.png';
import infoIconGrey from '../assets/info-icon-grey.png';
import tickMarkAnimation from '../assets/tick-mark-animation.gif';
import { MobileContainer } from '@/components/MobileContainer';
import { PaymentMethod } from '@/components/PaymentMethod';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { authenticateForPayment } from '@/lib/biometricAuth';
import { passStorage } from '@/lib/storage/passStorage';
import { verificationStorage } from '@/lib/storage/verificationStorage';
import { walletStorage } from '@/lib/storage/walletStorage';
import { configStorage } from '@/lib/storage/configStorage';
import type { PassData as StoragePassData } from '@/types/storage';

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface PassData {
  name: string;
  type: 'AC' | 'Ordinary';
  validFrom: string;
  validTill: string;
}

interface UserData {
  firstName: string;
  lastName: string;
  gender: 'male' | 'female' | 'other';
  dateOfBirth: string;
}

const Generation = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [passData, setPassData] = useState<PassData | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [verificationData, setVerificationData] = useState({ selfie: '', idType: 'Aadhar Card', idNumber: '0000' });
  const [passId, setPassId] = useState('');
  const [isEditingPassId, setIsEditingPassId] = useState(false);
  const [longPressTimer, setLongPressTimer] = useState<ReturnType<typeof setTimeout> | null>(null);
  const [showPaymentMethod, setShowPaymentMethod] = useState(false);
  const [tummocBalance, setTummocBalance] = useState(0);
  const [showFarePopup, setShowFarePopup] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      // Load all data
      const savedPass = localStorage.getItem('selectedPass');
      const savedUser = localStorage.getItem('userData');
      
      if (savedPass) setPassData(JSON.parse(savedPass));
      if (savedUser) setUserData(JSON.parse(savedUser));
      
      setVerificationData({
        selfie: localStorage.getItem('verificationSelfie') || '',
        idType: localStorage.getItem('verificationIdType') || 'Aadhar Card',
        idNumber: localStorage.getItem('verificationIdNumber') || '0000'
      });

      setPassId(`TPASS${Math.floor(Math.random() * 1000000000).toString().padStart(9, '0')}`);
      
      // Load balance from native storage
      const balance = await walletStorage.getBalance();
      setTummocBalance(balance);

      // Load RazorPay script
      if (!document.querySelector('script[src*="razorpay"]')) {
        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.async = true;
        document.body.appendChild(script);
      }
    };
    
    loadData();
  }, []);

  // Memoized calculations for better performance
  const passPrice = useMemo(() => {
    if (!passData) return '80.0';
    
    const priceMap: Record<string, string> = {
      'Express Monthly Pass (Limited Stop)': passData.type === 'AC' ? '3500' : '1500',
      'Nice Road Monthly Pass': passData.type === 'AC' ? '3000' : '2350',
      'Vayu Vajra Gold Pass': '4000',
      'Vajra Gold Monthly Pass': '2000'
    };
    
    if (priceMap[passData.name]) return priceMap[passData.name];
    
    if (passData.name.includes('Day Pass')) return passData.type === 'AC' ? '140.0' : '80.0';
    if (passData.name.includes('Weekly Pass')) return passData.type === 'AC' ? '750' : '350';
    if (passData.name.includes('Monthly Pass')) return passData.type === 'AC' ? '2500' : '1200';
    
    return '80.0';
  }, [passData]);

  const passType = useMemo(() => {
    if (!passData) return 'Daily';
    if (passData.name.includes('Day Pass')) return 'Daily';
    if (passData.name.includes('Weekly Pass')) return 'Weekly';
    if (passData.name.includes('Monthly Pass') || passData.name === 'Vayu Vajra Gold Pass' || passData.name === 'Vajra Gold Monthly Pass') return 'Monthly';
    return 'Daily';
  }, [passData]);

  const formatDate = (dateStr: string, time: string) => {
    const date = new Date(dateStr);
    return `${date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })},${time}`;
  };

  const validityDates = useMemo(() => {
    if (passData?.validFrom && passData?.validTill) {
      return {
        validFrom: formatDate(passData.validFrom, '12:00 AM'),
        validTill: formatDate(passData.validTill, '11:59 PM')
      };
    }

    const today = new Date();
    let endDate = new Date(today);

    if (passType === 'Monthly') {
      endDate.setMonth(today.getMonth() + 1);
      endDate.setDate(today.getDate() - 1);
    } else if (passType === 'Weekly') {
      endDate.setDate(today.getDate() + 6);
    }

    return {
      validFrom: formatDate(today.toISOString(), '12:00 AM'),
      validTill: formatDate(endDate.toISOString(), '11:59 PM')
    };
  }, [passData, passType]);

  const ordinaryDivWidth = passData?.type === 'AC' ? 'w-20' : 'w-28';
  const ordinaryDivPosition = passType === 'Weekly' ? 'left-[14px]' : passType === 'Monthly' ? 'left-[21px]' : 'left-[5px]';

  const handlePassIdLongPressStart = () => {
    const timer = setTimeout(() => setIsEditingPassId(true), 500);
    setLongPressTimer(timer);
  };

  const handlePassIdLongPressEnd = () => {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
  };

  const handleProceedToPay = () => {
    if (!termsAccepted) {
      toast({
        title: "Terms Required",
        description: "Please accept the terms and conditions to proceed.",
        variant: "destructive",
      });
      return;
    }
    setShowPaymentMethod(true);
  };

  const handlePaymentMethodSelect = async (method: 'tummoc' | 'razorpay') => {
    setShowPaymentMethod(false);

    if (method === 'tummoc') {
      await handleDeviceAuth(method);
    } else {
      const razorpayApiKey = localStorage.getItem('razorpayApiKey');
      
      if (razorpayApiKey && window.Razorpay) {
        const rzp = new window.Razorpay({
          key: razorpayApiKey,
          amount: parseFloat(passPrice) * 100,
          currency: "INR",
          name: "Tummoc Pass",
          description: `Purchase ${passData?.name || 'Bus Pass'}`,
          handler: () => handlePaymentSuccess(method),
          prefill: {
            name: userData ? `${userData.firstName} ${userData.lastName}` : "User",
            email: "user@example.com",
            contact: "9999999999",
          },
          theme: { color: "#06b6d4" },
        });
        rzp.open();
      } else {
        await handleDeviceAuth(method);
      }
    }
  };

  const handleDeviceAuth = async (method: 'tummoc' | 'razorpay') => {
    await authenticateForPayment(
      parseFloat(passPrice),
      passData?.name || 'Bus Pass',
      () => {
        // Payment success
        handlePaymentSuccess(method);
      },
      () => {
        // Payment cancelled
        toast({
          title: "Payment Cancelled",
          description: "Payment was not completed. Please try again.",
          variant: "destructive",
        });
      }
    );
  };

  const handlePaymentSuccess = async (method: 'tummoc' | 'razorpay') => {
    try {
      const price = parseFloat(passPrice);
      
      if (method === 'tummoc') {
        const newBalance = Math.max(0, tummocBalance - price);
        await walletStorage.updateBalance(newBalance);
        setTummocBalance(newBalance);

        // Save transaction only for Tummoc Money payments
        await walletStorage.addTransaction({
          id: Date.now().toString(),
          type: 'debit',
          amount: price,
          description: `Purchase ${passData?.name || 'Bus Pass'}`,
          timestamp: Date.now(),
          paymentMethod: 'tummoc',
        });
      }

      // Ensure verification data is complete before saving
      const completeVerificationData = {
        selfie: verificationData.selfie || localStorage.getItem('verificationSelfie') || '',
        idType: verificationData.idType || localStorage.getItem('verificationIdType') || 'Aadhar Card',
        idNumber: verificationData.idNumber || localStorage.getItem('verificationIdNumber') || '0000'
      };

      // Validate that we have the required data
      if (!completeVerificationData.selfie) {
        console.error('Missing selfie in verification data');
        toast({
          title: "Verification Error",
          description: "Selfie image is missing. Please go back and capture a selfie.",
          variant: "destructive",
        });
        return;
      }

      const purchaseDate = new Date().toISOString();
      const purchaseTimestamp = new Date(purchaseDate).getTime();

      // Calculate validity dates if not provided (for renewal or new purchase)
      let validFromDate = passData?.validFrom;
      let validTillDate = passData?.validTill;
      
      if (!validFromDate || !validTillDate) {
        // Calculate new dates based on pass type
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        validFromDate = today.toISOString();
        
        let endDate = new Date(today);
        if (passType === 'Monthly') {
          endDate.setMonth(today.getMonth() + 1);
          endDate.setDate(today.getDate() - 1);
        } else if (passType === 'Weekly') {
          endDate.setDate(today.getDate() + 6);
        }
        // For Daily pass, endDate remains the same as today
        
        endDate.setHours(23, 59, 59, 999);
        validTillDate = endDate.toISOString();
      }

      // Normalize pass data to StoragePassData type
      const normalizedPass: StoragePassData = {
        passId,
        name: passData?.name || 'Bus Pass',
        type: passData?.type || 'Ordinary',
        validFrom: validFromDate,
        validTill: validTillDate,
        amount: price,
        purchaseDate,
        purchaseTimestamp,
        status: 'active',
        colorTheme: 'black',
        // Save user data with the pass
        userFirstName: userData?.firstName,
        userLastName: userData?.lastName,
        userGender: userData?.gender,
        userDateOfBirth: userData?.dateOfBirth,
      };
      
      try {
        // Save to native storage
        await passStorage.saveActivePass(normalizedPass);
        
        // Save verification data
        await verificationStorage.saveVerificationData(passId, {
          passId,
          selfieBase64: completeVerificationData.selfie,
          idType: completeVerificationData.idType,
          idNumber: completeVerificationData.idNumber,
          timestamp: purchaseTimestamp,
        });
        
        console.log('Pass purchased successfully:', normalizedPass);
      } catch (storageError) {
        console.error('Storage error:', storageError);
        toast({
          title: "Storage Error",
          description: "Unable to save pass data. Your device storage might be full.",
          variant: "destructive",
        });
        return;
      }
      
      // Navigate to final page with pass reference
      navigate('/final', { state: { passRef: { passId, purchaseTimestamp } } });
    } catch (error) {
      console.error('Error in payment success:', error);
      toast({
        title: "Payment Error",
        description: "There was an error processing your payment. Please contact support.",
        variant: "destructive",
      });
    }
  };

  return (
    <MobileContainer width={540} height={1090}>
      <div className="w-[540px] h-[1090px] relative bg-black/0 overflow-hidden" style={{backgroundImage: `url(${backgroundImage})`, backgroundSize: 'cover', backgroundPosition: 'center'}}>
      <div className="w-[540px] h-[1090px] left-0 top-0 absolute bg-transparent">
        <div className="w-[540px] h-[1010px] left-0 top-[80px] absolute bg-black/0">
          <div className="w-[540px] h-52 left-0 top-[794px] absolute bg-black/0">
            <div className="w-[540px] h-52 left-0 top-0 absolute bg-black/0">
              <div className="w-[540px] h-52 left-0 bottom-0 absolute" style={{backgroundColor: '#fefefe', opacity: '0.9'}}></div>
              <div className="w-96 h-20 left-[161px] top-[110px] absolute bg-black/0">
                <div 
                  className={`w-[360px] h-20 left-[6px] top-[4px] absolute rounded-2xl border border-gray-200 cursor-pointer transition-colors ${termsAccepted ? 'bg-teal-950 hover:bg-teal-900' : 'bg-neutral-200'}`}
                  onClick={handleProceedToPay}
                />
                <div 
                  className={`w-44 h-7 left-[99px] top-[28px] absolute justify-center ${termsAccepted ? 'text-[#fefefe]' : 'text-neutral-400'} text-2xl font-normal font-['Inter'] cursor-pointer`}
                  onClick={handleProceedToPay}
                >
                  Proceed To Pay
                </div>
              </div>
              <div className="w-28 h-6 left-[27px] top-[150px] absolute justify-center text-gray-600 text-2xl font-bold font-['Inter']">₹ {passPrice}</div>
              <img className="w-5 h-5 left-[115px] top-[120px] absolute cursor-pointer" src={infoIconGrey} alt="Info" onClick={() => setShowFarePopup(true)} />
              <div className="w-20 h-6 left-[27px] top-[119px] absolute justify-center text-neutral-400 text-lg font-normal font-['Inter'] underline cursor-pointer" onClick={() => setShowFarePopup(true)}>Pass fare</div>
              <div className="w-[491px] h-[1px] left-[24px] top-[101px] absolute" style={{backgroundColor: '#CDCFCE'}}></div>
              <div className="w-[540px] h-24 left-0 top-[1px] absolute bg-black/0">
                <Checkbox 
                  checked={termsAccepted}
                  onCheckedChange={(checked) => setTermsAccepted(checked === true)}
                  className="w-6 h-6 left-[34px] top-[45px] absolute border-2 border-gray-400 data-[state=checked]:bg-cyan-500 data-[state=checked]:border-cyan-500 data-[state=checked]:text-white [&>*]:scale-125 [&>*]:stroke-[2px]"
                />
                <div className="w-96 h-16 left-[85px] top-[17px] absolute text-gray-500 text-base font-semibold font-['Inter'] leading-tight">
                  • All the information entered above is accurate and matches my official ID.<br/><br/>
                  • I Understand the <span className="underline cursor-pointer" onClick={() => navigate('/refund-policy')}>Refund & Cancellation Policy</span>
                </div>
              </div>
            </div>
            <img className="w-[3px] h-[3px] left-[537px] top-[210px] absolute" src="https://placehold.co/3x3" />
          </div>
          <div className="w-[493px] h-[616px] left-[22px] top-[18px] absolute bg-black/0">
            <div className="w-[490px] h-96 left-[3px] top-[205px] absolute bg-black/0">
              <div className="w-[487px] h-[420px] left-[1px] top-[-2px] absolute bg-white/90 rounded-tl-2xl rounded-tr-xl rounded-bl-md rounded-br-md border-2 border-zinc-300" />
            <div className="w-[489px] h-44 left-0 top-[260px] absolute bg-black/0">
              <div className="w-64 left-[25px] top-[100px] absolute justify-center text-gray-500 text-xl font-bold font-['Inter']">{validityDates.validTill}</div>
              <div className="w-40 left-[25px] top-[76px] absolute justify-center text-neutral-400 text-lg font-bold font-['Inter']">Pass valid till</div>
              <div className="w-64 h-6 left-[25px] top-[44px] absolute justify-center text-gray-500 text-xl font-bold font-['Inter']">{validityDates.validFrom}</div>
              <div className="w-40 left-[25px] top-[20px] absolute justify-center text-neutral-400 text-lg font-bold font-['Inter']">Pass valid from</div>
            </div>
              <div className="w-96 h-0.5 left-[24px] top-[260px] absolute bg-stone-300" />
              <div className="w-[485px] h-64 left-[2px] top-0 absolute bg-black/0">
              <div className="w-32 h-5 left-[24px] top-[214px] absolute justify-center text-zinc-500 text-xl font-medium font-['Inter']">{verificationData.idNumber}</div>
                <div className="w-80 h-6 left-[23px] top-[188px] absolute justify-center text-neutral-400 text-lg font-semibold font-['Inter']">Identification number (Last 4 digits)</div>
                <img className="w-32 h-32 left-[337px] top-[48px] absolute rounded-[62px] object-cover" src={verificationData.selfie || "https://placehold.co/127x127"} />
                <div className="w-44 h-5 left-[23px] top-[149px] absolute justify-center text-gray-500 text-xl font-semibold font-['Inter']">{verificationData.idType}</div>
                <div className="w-48 h-6 left-[23px] top-[124px] absolute justify-center text-neutral-400 text-lg font-semibold font-['Inter']">Identification type</div>
                <div className="w-48 h-5 left-[23px] top-[85px] absolute justify-center text-gray-500 text-xl font-semibold font-['Inter']">{userData ? `${userData.firstName} ${userData.lastName}` : 'Lebron James'}</div>
                <div className="w-48 h-5 left-[23px] top-[60px] absolute justify-center text-neutral-400 text-lg font-semibold font-['Inter']">Passenger name</div>
                <div className="w-60 h-8 left-[24px] top-[20px] absolute justify-center text-gray-600 text-2xl font-semibold font-['Inter']">Booking Details</div>
              </div>
            </div>
            <div className="w-[493px] h-44 left-0 top-0 absolute bg-black/0">
              <div className="w-[487px] h-44 left-[4px] top-[6px] absolute bg-white/90 rounded-tl-xl rounded-tr-lg rounded-bl-md rounded-br-md border-2 border-neutral-200" />
              <div className="w-24 left-[28px] top-[136px] absolute justify-center text-neutral-400 text-lg font-semibold font-['Inter']">Pass ID:</div>
              {isEditingPassId ? (
                <Input
                  value={passId}
                  onChange={(e) => setPassId(e.target.value)}
                  onBlur={() => {
                    setIsEditingPassId(false);
                    localStorage.setItem('customPassId', passId);
                  }}
                  autoFocus
                  className="w-40 left-[124px] top-[133px] absolute text-zinc-500 text-lg font-bold border-2 border-cyan-500"
                />
              ) : (
                <div 
                  className="w-40 left-[124px] top-[136px] absolute justify-center text-zinc-500 text-lg font-bold font-['Inter'] cursor-pointer"
                  onMouseDown={handlePassIdLongPressStart}
                  onMouseUp={handlePassIdLongPressEnd}
                  onMouseLeave={handlePassIdLongPressEnd}
                  onTouchStart={handlePassIdLongPressStart}
                  onTouchEnd={handlePassIdLongPressEnd}
                >
                  {passId}
                </div>
              )}
              <div className="w-32 h-11 left-[218px] top-[64px] absolute bg-black/0">
                <div className={`${ordinaryDivWidth} h-9 ${ordinaryDivPosition} top-[5px] absolute bg-neutral-200 rounded-md flex items-center justify-center`}>
                  <div className="text-zinc-600 text-xl font-semibold font-['Inter']">{passData?.type || 'Ordinary'}</div>
                </div>
              </div>
              <div className="h-12 left-[119px] top-[63px] absolute bg-black/0" style={{width: 'auto', minWidth: '80px'}}>
                <div className="h-9 left-[5px] top-[5px] absolute bg-green-100 rounded-tl-md rounded-tr-md rounded-bl-md rounded-br border border-emerald-50 px-4 flex items-center justify-center whitespace-nowrap">
                  <div className="text-green-400 text-xl font-semibold font-['Inter']">{passType}</div>
                </div>
              </div>
              <div className="w-[400px] h-7 left-[125px] top-[25px] absolute justify-center text-gray-600 text-2xl font-normal font-['Inter'] whitespace-nowrap overflow-hidden text-ellipsis">{passData?.name || 'Ordinary Day Pass'}</div>
              <img className="w-16 h-16 left-[27px] top-[30px] absolute" src={kyImage} />
            </div>
          </div>
        </div>
        <div className="w-[540px] h-20 left-0 top-[1px] absolute bg-black/0">
          <div className="w-[540px] h-20 left-0 top-[-1px] absolute bg-teal-950 header-teal-fix" />
          <div className="w-36 h-7 left-[78px] top-[24px] absolute justify-center text-white text-xl font-bold font-['Inter']">Pass preview</div>
          <img className="w-6 h-6 left-[27px] top-[25px] absolute cursor-pointer" src={newBackArrow} onClick={() => navigate(-1)} />
        </div>
      </div>
      </div>

      {/* Fare Breakup Popup */}
      <Dialog open={showFarePopup} onOpenChange={() => setShowFarePopup(false)}>
        <DialogContent
          className="bg-white rounded-2xl p-0 border-0 shadow-xl [&>button]:hidden"
          style={{
            width: '70%',
            maxWidth: '70%',
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
          }}
        >
          <div className="p-5">
            <div className="text-gray-900 text-xl font-semibold mb-4">Pass fare</div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-500 text-lg">Base Price</span>
                <span className="text-gray-900 text-lg font-semibold">₹ {passPrice}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500 text-lg">GST</span>
                <span className="text-gray-900 text-lg font-semibold">₹ 0.0</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500 text-lg">Toll Price</span>
                <span className="text-gray-900 text-lg font-semibold">₹ 0.0</span>
              </div>
            </div>
            <div className="border-t-2 border-gray-400 mt-4 pt-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-900 text-xl font-semibold">Total Amount</span>
                <span className="text-gray-900 text-xl font-semibold">₹ {passPrice}</span>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Payment Method Component */}
      <PaymentMethod
        isOpen={showPaymentMethod}
        onClose={() => setShowPaymentMethod(false)}
        totalAmount={parseFloat(passPrice)}
        tummocBalance={tummocBalance}
        onPaymentSelect={handlePaymentMethodSelect}
        onAddMoney={() => {
          setShowPaymentMethod(false);
          navigate('/add-money', { state: { returnPath: '/generation' } });
        }}
      />
    </MobileContainer>
  );
};

export default Generation;