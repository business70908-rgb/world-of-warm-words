import React, { useState, useEffect, useMemo } from 'react';
import { HelpCircle, ChevronDown } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { Check } from 'lucide-react';
import { toast } from 'sonner';
import { AdBanner } from '@/components/AdBanner';
import { MobileContainer } from '@/components/MobileContainer';
import { FinalPageSuccessPopup } from '@/components/FinalPageSuccessPopup';
import { FinalPageInstructionPopup } from '@/components/FinalPageInstructionPopup';
import { FinalPageTermsPopup } from '@/components/FinalPageTermsPopup';
import { FinalPageFarePopup } from '@/components/FinalPageFarePopup';
import { useTTQRTimestamp } from '@/lib/utils/ttqr';
import { 
  formatDateTime, 
  formatValidityDate, 
  getPassType,
  getBadgePosition,
  getBadgeLeftOffset
} from '@/lib/utils/dateFormatter';
import { passStorage } from '@/lib/storage/passStorage';
import { verificationStorage } from '@/lib/storage/verificationStorage';
import { userStorage } from '@/lib/storage/userStorage';
import type { PassData } from '@/types/storage';

import kyImage from '@/assets/Ky-new.png';
import mailIcon from '@/assets/mail-icon.png';
import newBackArrow from '@/assets/new-back-arrow.png';
import whiteClose from '@/assets/white-close.png';
import _9Image from '@/assets/_9.png';

interface PurchasedPass {
  passId: string;
  passData: {
    name: string;
    type: 'AC' | 'Ordinary';
    validFrom: string;
    validTill: string;
  };
  userData: {
    firstName: string;
    lastName: string;
    gender: 'male' | 'female' | 'other';
    dateOfBirth: string;
  };
  verificationData: {
    selfie: string;
    idType: string;
    idNumber: string;
  };
  purchaseDate: string;
  amount: string;
}

const TummocPopup = ({ message, onDismiss }: { message: string; onDismiss: () => void }) => {
  const [startX, setStartX] = useState<number | null>(null);

  useEffect(() => {
    const timer = setTimeout(onDismiss, 3000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <div 
      className="fixed bottom-[200px] left-1/2 -translate-x-1/2 z-[80] bg-white rounded-3xl shadow-lg px-7 py-6 flex items-center gap-5 animate-in slide-in-from-bottom-4 duration-300 cursor-grab"
      style={{ width: '500px', minHeight: '90px' }}
      onTouchStart={(e) => setStartX(e.touches[0].clientX)}
      onTouchEnd={(e) => {
        if (startX !== null && Math.abs(e.changedTouches[0].clientX - startX) > 60) {
          onDismiss();
        }
        setStartX(null);
      }}
      onMouseDown={(e) => setStartX(e.clientX)}
      onMouseUp={(e) => {
        if (startX !== null && Math.abs(e.clientX - startX) > 60) {
          onDismiss();
        }
        setStartX(null);
      }}
    >
      <img src={_9Image} alt="Tummoc" className="w-16 h-16 rounded-full flex-shrink-0" />
      <span className="text-zinc-700 text-xl font-normal font-['Inter']">{message}</span>
    </div>
  );
};

const Final = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const qrTimestamp = useTTQRTimestamp(500);
  
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [passData, setPassData] = useState<PurchasedPass | null>(null);
  const [lastScannedBusNumber, setLastScannedBusNumber] = useState<string>("");
  const [lastValidatedTime, setLastValidatedTime] = useState<string>("");
  const [emailSent, setEmailSent] = useState(false);
  const [userEmail, setUserEmail] = useState<string>("");
  const [showInstructionPopup, setShowInstructionPopup] = useState(false);
  const [showTermsPopup, setShowTermsPopup] = useState(false);
  const [showRandomSpace, setShowRandomSpace] = useState(() => Math.random() > 0.5);
  const [showFarePopup, setShowFarePopup] = useState(false);
  const [showFullImage, setShowFullImage] = useState(false);
  const [showEmailPopup, setShowEmailPopup] = useState(false);

  // Load data on mount
  useEffect(() => {
    const loadPassData = async () => {
      const shouldShowPopup = location.state?.scanSuccess;
      
      try {
        let loadedPass: PassData | null = null;
        
        // Try to load pass from route state first
        const passRef = (location.state as any)?.passRef;
        if (passRef?.passId && passRef?.purchaseTimestamp) {
          loadedPass = await passStorage.getActivePassById(passRef.passId, passRef.purchaseTimestamp);
        }
        
        // Fallback to newest active pass
        if (!loadedPass) {
          const activePasses = await passStorage.getActivePasses();
          if (activePasses.length > 0) {
            loadedPass = activePasses[0];
          }
        }
        
        if (loadedPass) {
          // Load verification data
          const verificationData = await verificationStorage.getVerificationByPassId(loadedPass.passId);
          
          // Load user profile from userStorage
          const userProfile = await userStorage.getUserProfile();
          
          // Fallback to localStorage if userStorage doesn't have data
          const localUserData = localStorage.getItem('userData');
          const parsedLocalUserData = localUserData ? JSON.parse(localUserData) : null;
          
          // Transform to UI format
          const uiPass: PurchasedPass = {
            passId: loadedPass.passId,
            passData: {
              name: loadedPass.name,
              type: loadedPass.type as 'AC' | 'Ordinary',
              validFrom: loadedPass.validFrom,
              validTill: loadedPass.validTill,
            },
            userData: {
              firstName: userProfile?.firstName || parsedLocalUserData?.firstName || 'User',
              lastName: userProfile?.lastName || parsedLocalUserData?.lastName || '',
              gender: (userProfile?.gender || parsedLocalUserData?.gender || 'other') as 'male' | 'female' | 'other',
              dateOfBirth: userProfile?.dateOfBirth || parsedLocalUserData?.dateOfBirth || '',
            },
            verificationData: {
              selfie: verificationData?.selfieBase64 || '',
              idType: verificationData?.idType || 'Aadhar Card',
              idNumber: verificationData?.idNumber || '0000',
            },
            purchaseDate: loadedPass.purchaseDate,
            amount: loadedPass.amount.toString(),
          };
          
          setPassData(uiPass);
          console.log('Pass data loaded successfully from native storage');
        } else {
          console.warn('No pass data found');
        }

        // Load user profile
        const userProfile = await userStorage.getUserProfile();
        if (userProfile?.email) {
          setUserEmail(userProfile.email);
        }

        // Load last scanned bus info from the pass itself
        if (loadedPass?.lastScannedBusNumber) {
          setLastScannedBusNumber(loadedPass.lastScannedBusNumber);
        }
        if (loadedPass?.lastValidatedTimestamp) {
          setLastValidatedTime(formatDateTime(loadedPass.lastValidatedTimestamp));
        }
        
        // Show success popup after data is loaded
        if (shouldShowPopup) {
          setShowSuccessPopup(true);
          window.history.replaceState({}, document.title);
        }
      } catch (error) {
        console.error('Error loading pass data:', error);
        toast.error('Error loading pass data.');
      }
    };
    
    loadPassData();
  }, [location.state, navigate]);

  // Memoized computed values
  const passType = useMemo(() => passData ? getPassType(passData.passData.name) : 'Daily', [passData]);
  const badgePosition = useMemo(() => getBadgePosition(passType), [passType]);
  const badgeLeftOffset = useMemo(() => getBadgeLeftOffset(passType), [passType]);
  const qrValue = useMemo(() => JSON.stringify({
    passID: passData?.passId || 'TPASS941507864',
    timestamp: qrTimestamp
  }), [passData?.passId, qrTimestamp]);

  return (
    <MobileContainer width={768} height={1552}>
      <div className="w-[768px] h-[1552px] relative overflow-hidden" style={{ backgroundColor: '#F5F5F5' }}>
        {/* Header */}
        <div className="w-[768px] h-28 left-0 top-0 absolute bg-teal-950 z-20 flex items-center header-teal-fix">
          <img 
            className="w-10 h-10 absolute left-[28px] cursor-pointer" 
            src={newBackArrow}
            alt="Back"
            onClick={() => navigate('/', { replace: true })}
          />
          <div className="w-80 h-10 absolute left-[55px] flex items-center justify-center text-white text-[26px] font-montserrat-bold font-bold whitespace-nowrap">
            Your Bus Pass
          </div>
          <div 
            className="w-32 h-10 absolute left-[600px] flex items-center justify-center text-2xl font-montserrat-bold font-bold cursor-pointer"
            style={{ color: '#5bc0de' }}
            onClick={() => navigate('/contact')}
          >
            Support
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="w-[768px] absolute top-[112px] bottom-0 overflow-y-auto">
          <div className="w-full pl-[25px] pr-[30px] pt-[28px] pb-40">
            {/* Pass Card */}
            <div className="w-full relative bg-white rounded-xl overflow-visible mb-6 p-0 shadow-[0_2px_12px_rgba(0,0,0,0.08)]">
              <div className="relative w-full h-96 rounded-xl" style={{ backgroundColor: '#FEFEFE' }}>
                <img className="w-28 h-28 absolute left-[35px] top-[22px] rounded-full object-cover" src={kyImage} />
                <div className="absolute left-[185px] right-[24px] top-[18px] text-gray-600 text-[26px] font-montserrat-regular font-semibold whitespace-nowrap">
                  {passData?.passData.name || "Ordinary Day Pass"}
                </div>
                
                {/* Pass Type Badge */}
                <div className="h-14 absolute left-[179px] top-[69px]" style={{width: 'auto', minWidth: '80px'}}>
                  <div className="h-12 bg-green-100 rounded-md border border-emerald-50 px-5 flex items-center justify-center whitespace-nowrap absolute left-[5px] top-[5px]">
                    <div className="text-green-400 text-[28px] font-montserrat-regular capitalize">{passType}</div>
                  </div>
                </div>

                {/* AC/Ordinary Badge */}
                <div className="w-32 h-14 absolute top-[69px]" style={{ left: badgePosition }}>
                  <div className="h-12 absolute top-[5px] bg-neutral-200 rounded-md flex items-center justify-center" style={{
                    width: passData?.passData.type === 'AC' ? '90px' : '150px',
                    left: badgeLeftOffset
                  }}>
                    <div className="text-zinc-600 text-[28px] font-montserrat-regular">
                      {passData?.passData.type || 'Ordinary'}
                    </div>
                  </div>
                </div>
                
                <div className="w-28 h-6 absolute left-[50px] top-[154px] text-gray-700 text-[26px] font-montserrat-regular">Pass ID:</div>
                <div className="w-52 h-7 absolute left-[180px] top-[154px] text-gray-600 text-[26px] font-montserrat-regular">
                  {passData?.passId || 'TPASS941507864'}
                </div>
                <div className="w-[598px] absolute left-[49px] top-[210px] border-t-2 border-dashed border-gray-300" />
                
                {/* Validate Pass Button */}
                <div 
                  className="w-[580px] h-24 absolute left-1/2 -translate-x-1/2 top-[228px] cursor-pointer"
                  onClick={() => navigate('/scan', { state: { passData } })}
                >
                  <div className="w-full h-[84px] rounded-lg border flex items-center justify-center" style={{ backgroundColor: '#5bb8d4', borderColor: '#5bb8d4' }}>
                    <div className="text-white text-[34px] font-montserrat-regular">Validate Pass</div>
                  </div>
                </div>
                
                <div 
                  className="absolute left-1/2 -translate-x-1/2 top-[320px] flex items-center gap-2 cursor-pointer"
                  onClick={() => setShowInstructionPopup(true)}
                >
                  <HelpCircle className="w-7 h-7" style={{ color: '#5bb8d4' }} />
                  <div className="text-[26px] font-montserrat-regular font-normal whitespace-nowrap" style={{ color: '#5bb8d4' }}>
                    How to Validate Your Pass?
                  </div>
                </div>
              </div>
            </div>

            {/* Random Space - Sometimes visible, sometimes not */}
            {showRandomSpace && <div className="w-full h-36 mb-6" />}

            {/* Booking Details */}
            <div className="w-full relative bg-white rounded-2xl p-8 mb-8 shadow-[0_2px_12px_rgba(0,0,0,0.08)]">
              <div className="w-60 h-10 mb-6 text-3xl font-montserrat-regular" style={{ color: '#727272' }}>Booking Details</div>
              <div className="w-full mb-4 border-t-2 border-dashed border-gray-300" />
              
              <img 
                className="w-52 h-52 absolute right-8 top-[130px] rounded-[104px] object-cover cursor-pointer" 
                src={passData?.verificationData?.selfie || "https://placehold.co/163x163"} 
                onClick={() => setShowFullImage(true)}
              />

              {/* Full Screen Image Viewer */}
              {showFullImage && (
                <div className="fixed inset-0 z-[9999] bg-black/90 flex items-center justify-center" onClick={() => setShowFullImage(false)}>
                  <img
                    onClick={(e) => { e.stopPropagation(); setShowFullImage(false); }}
                    src={whiteClose}
                    alt="Close"
                    className="absolute top-6 right-6 w-14 h-14 cursor-pointer z-10"
                  />
                  <img
                    src={passData?.verificationData?.selfie || "https://placehold.co/163x163"}
                    alt="Full view"
                    className="max-w-[90%] max-h-[90%] object-contain rounded-lg"
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
              )}
              
              <div className="mb-3">
                <div className="text-2xl font-montserrat-regular mb-1" style={{ color: '#727272' }}>Passenger name</div>
                <div className="text-black text-3xl font-montserrat-regular">
                  {passData?.userData?.firstName ? `${passData.userData.firstName} ${passData.userData.lastName}` : 'Lebron James'}
                </div>
              </div>
              
              <div className="mb-3">
                <div className="text-2xl font-montserrat-regular mb-1" style={{ color: '#727272' }}>Identification type</div>
                <div className="text-black text-3xl font-montserrat-regular">
                  {passData?.verificationData?.idType || 'Aadhar Card'}
                </div>
              </div>
              
              <div className="mb-3">
                <div className="text-2xl font-montserrat-regular mb-1" style={{ color: '#727272' }}>Identification number (Last 4 digits)</div>
                <div className="text-black text-3xl font-montserrat-regular">
                  {passData?.verificationData?.idNumber || '0000'}
                </div>
              </div>
              
              <div className="mb-3">
                <div className="text-2xl font-montserrat-regular mb-1" style={{ color: '#727272' }}>Pass purchase date</div>
                <div className="text-black text-3xl font-montserrat-regular">
                  {passData ? formatDateTime(passData.purchaseDate) : '29 Sep 2025, 08:54 AM'}
                </div>
              </div>
              
              <div className="mb-3">
                <div className="text-2xl font-montserrat-regular mb-1" style={{ color: '#727272' }}>Pass valid from</div>
                <div className="text-black text-3xl font-montserrat-regular">
                  {passData ? formatValidityDate(passData.passData.validFrom) : '29 Sep 2025, 12:00 AM'}
                </div>
              </div>
              
              <div className="flex justify-between items-end mb-3">
                <div className="flex-1">
                  <div className="text-2xl font-montserrat-regular mb-1" style={{ color: '#727272' }}>Pass valid till</div>
                  <div className="text-black text-3xl font-montserrat-regular">
                    {passData ? formatValidityDate(passData.passData.validTill, true) : '29 Sep 2025, 11:59 PM'}
                  </div>
                </div>
                <div className="text-right">
                  <div 
                    className="text-2xl font-montserrat-regular mb-1 underline cursor-pointer"
                    style={{ color: '#727272' }}
                    onClick={() => setShowFarePopup(true)}
                  >
                    Pass fare
                  </div>
                  <div className="text-black text-4xl font-montserrat-regular">
                    <span style={{ fontFamily: 'Arial, sans-serif', fontWeight: 'bold' }}>₹</span> {passData?.amount ? (passData.amount.includes('.') ? passData.amount : `${passData.amount}.0`) : '80.0'}
                  </div>
                </div>
              </div>
              
              <div className="w-full h-3.5 my-6 border-t-2 border-dashed border-gray-300" />
              
              {/* Email Receipt */}
              <div className="flex justify-center -mt-[14px] mb-6">
                <div
                  className="cursor-pointer transition-all duration-300 flex items-center justify-center"
                  style={{ width: emailSent ? 'auto' : '320px' }}
                  onClick={() => {
                    if (!emailSent) {
                      setEmailSent(true);
                      setShowEmailPopup(true);
                    }
                  }}
                >
                  <div 
                    className="rounded-md border transition-all duration-300 flex items-center justify-center"
                    style={{
                      height: '56px',
                      backgroundColor: emailSent ? '#d4f4f1' : '#FEFEFE',
                      borderColor: emailSent ? 'transparent' : '#0097d1',
                      borderWidth: '2px',
                      padding: emailSent ? '0 24px' : '0',
                      width: emailSent ? 'auto' : '100%'
                    }}
                  >
                    {!emailSent ? (
                      <div className="flex items-center justify-center gap-3">
                        <img className="w-[32px] h-[32px]" src={mailIcon} alt="Mail" />
                        <span className="text-xl font-montserrat-regular whitespace-nowrap" style={{ color: '#0097d1' }}>
                          Generate mail receipt
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3 whitespace-nowrap">
                        <span className="text-xl font-montserrat-regular" style={{ color: '#6e9867' }}>
                          Sent mail to {userEmail || 'user@example.com'}
                        </span>
                        <Check className="w-5 h-5" style={{ color: '#40BAC0' }} strokeWidth={3} />
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="w-full h-3.5 my-6 border-t-2 border-dashed border-gray-300" />
              
              {/* Last Validated Info - Only show if pass has been validated */}
              {lastValidatedTime && lastScannedBusNumber && <div className="rounded-2xl px-4 pt-4 pb-6 mb-6" style={{ backgroundColor: '#E5FFC8' }}>
                <div className="mb-2 px-2 py-1">
                  <div className="text-2xl font-montserrat-regular leading-7" style={{ color: '#6e9867' }}>
                    Last Validated<br/><span className="font-montserrat-bold font-bold">{lastValidatedTime || '29 Sep 2025, 07:09 PM'}</span>
                  </div>
                </div>
                <div className="mb-2 px-2 py-1">
                  <div className="text-2xl font-montserrat-regular leading-7" style={{ color: '#6e9867' }}>
                    Bus Number<br/><span className="font-montserrat-bold font-bold">BMTC BUS {lastScannedBusNumber || 'KA57F3541'}</span>
                  </div>
                </div>
                <div className="px-2 py-1">
                  <div className="text-2xl font-montserrat-regular leading-7" style={{ color: '#6e9867' }}>
                    Validated By<br/><span className="font-montserrat-bold font-bold">Self</span>
                  </div>
                </div>
              </div>}
              
              {/* QR Code */}
              <div className="w-full flex justify-center my-6">
                <div className="w-[420px] h-[420px] relative flex items-center justify-center">
                  <QRCodeSVG value={qrValue} size={400} level="H" className="absolute" />
                  <div className="absolute w-20 h-20 bg-white rounded-full z-10" style={{ left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }} />
                  <img 
                    src={kyImage} 
                    alt="Logo" 
                    className="absolute w-16 h-16 rounded-full object-cover z-20"
                    style={{ left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }}
                  />
                </div>
              </div>
            </div>

            {/* Terms and Conditions */}
            <div 
              className="w-full h-24 rounded-xl flex items-center justify-between px-8 border-2 border-neutral-200 mb-8 cursor-pointer shadow-[0_2px_12px_rgba(0,0,0,0.08)]"
              style={{ backgroundColor: '#FEFEFE' }}
              onClick={() => setShowTermsPopup(true)}
            >
              <div className="text-gray-700 text-3xl font-montserrat-regular">Terms and Conditions</div>
              <ChevronDown className="w-10 h-10 text-gray-600" />
            </div>
          </div>
        </div>

        {/* Popups */}
        <FinalPageSuccessPopup
          isOpen={showSuccessPopup}
          onClose={() => setShowSuccessPopup(false)}
          passId={passData?.passId || 'TPASS837925927'}
          passType={passType}
          passValidTill={passData ? formatValidityDate(passData.passData.validTill, true) : '08 Jun 2025, 11:59 PM'}
          amount={passData?.amount || '80.0'}
        />
        
        <FinalPageInstructionPopup
          isOpen={showInstructionPopup}
          onClose={() => setShowInstructionPopup(false)}
        />
        
        <FinalPageTermsPopup
          isOpen={showTermsPopup}
          onClose={() => setShowTermsPopup(false)}
        />

        <FinalPageFarePopup
          isOpen={showFarePopup}
          onClose={() => setShowFarePopup(false)}
          passName={passData?.passData.name || ''}
          amount={passData?.amount || '80.0'}
        />

        {showEmailPopup && (
          <TummocPopup 
            message={`Sent mail to ${userEmail || 'user@example.com'}`}
            onDismiss={() => setShowEmailPopup(false)}
          />
        )}
      </div>
    </MobileContainer>
  );
};

export default Final;
