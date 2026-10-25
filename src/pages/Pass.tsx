import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import EmptyState from "@/components/EmptyState";
import PassCard from "@/components/PassCard";
import backArrow from "@/assets/back-arrow.png";
import customIcon from "@/assets/custom-icon.png";
import { MobileContainer } from '@/components/MobileContainer';
import { passStorage } from '@/lib/storage/passStorage';
import { verificationStorage } from '@/lib/storage/verificationStorage';
import { getTestVerification } from '@/lib/storage/testPassData';
import type { PassData } from '@/types/storage';
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
  purchaseTimestamp: number;
  amount: string;
  colorTheme?: 'black' | 'blue';
  lastScannedBusNumber?: string;
  lastValidatedTimestamp?: string;
}
const Pass = () => {
  const navigate = useNavigate();
  const [selectedTab, setSelectedTab] = useState<'active' | 'expired'>('active');
  const [selectedTopTab, setSelectedTopTab] = useState<'passes' | 'trips'>('passes');
  const [activePasses, setActivePasses] = useState<PurchasedPass[]>([]);
  const [expiredPasses, setExpiredPasses] = useState<PurchasedPass[]>([]);
  const touchStartX = useRef<number | null>(null);
  useEffect(() => {
    const loadPasses = async () => {
      try {
        // Load all passes from native storage
        const allStoredPasses = await passStorage.getAllPasses();
        
        // Transform PassData to PurchasedPass format for UI
        const transformedPasses: PurchasedPass[] = [];
        
        for (const storedPass of allStoredPasses) {
          // Load verification data for this pass (try native first, then test data)
          let verificationData = await verificationStorage.getVerificationByPassId(storedPass.passId);
          if (!verificationData) {
            verificationData = getTestVerification(storedPass.passId);
          }
          
          transformedPasses.push({
            passId: storedPass.passId,
            passData: {
              name: storedPass.name,
              type: storedPass.type as 'AC' | 'Ordinary',
              validFrom: storedPass.validFrom,
              validTill: storedPass.validTill,
            },
            userData: {
              firstName: storedPass.userFirstName || 'User',
              lastName: storedPass.userLastName || '',
              gender: (storedPass.userGender || 'other') as 'male' | 'female' | 'other',
              dateOfBirth: storedPass.userDateOfBirth || '',
            },
            verificationData: {
              selfie: verificationData?.selfieBase64 || '',
              idType: verificationData?.idType || 'Aadhar Card',
              idNumber: verificationData?.idNumber || '0000',
            },
            purchaseDate: storedPass.purchaseDate,
            purchaseTimestamp: storedPass.purchaseTimestamp,
            amount: storedPass.amount.toString(),
            colorTheme: storedPass.colorTheme || 'black',
            lastScannedBusNumber: storedPass.lastScannedBusNumber,
            lastValidatedTimestamp: storedPass.lastValidatedTimestamp,
          });
        }
        
        const currentDate = new Date();
        const active: PurchasedPass[] = [];
        const expired: PurchasedPass[] = [];
        
        transformedPasses.forEach(pass => {
          const passExpiryDate = new Date(pass.passData.validTill);
          if (passExpiryDate.getTime() > currentDate.getTime()) {
            active.push(pass);
          } else {
            expired.push(pass);
          }
        });
        
        setActivePasses(active);
        setExpiredPasses(expired);
      } catch (error) {
        console.error('Failed to load passes:', error);
        toast('Failed to load passes');
      }
    };
    
    loadPasses();
  }, []);
  const formatDateForCard = (dateStr: string) => {
    const date = new Date(dateStr);
    const formattedDate = date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
    const formattedTime = date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
    return `${formattedDate}, ${formattedTime}`;
  };
  const getPassType = (passName: string) => {
    if (passName.includes('Day Pass')) return 'Daily';
    if (passName.includes('Weekly Pass')) return 'Weekly';
    if (passName.includes('Monthly Pass') || passName === 'Vayu Vajra Gold Pass' || passName === 'Vajra Gold Monthly Pass') return 'Monthly';
    return 'Daily';
  };
  const handleColorChange = async (pass: PurchasedPass, color: 'black' | 'blue') => {
    try {
      await passStorage.updatePassColor(pass.passId, pass.purchaseTimestamp, color);
      
      const updatePassColor = (passes: PurchasedPass[]) => passes.map(p => p.passId === pass.passId && p.purchaseTimestamp === pass.purchaseTimestamp ? {
        ...p,
        colorTheme: color
      } : p);
      const updatedActive = updatePassColor(activePasses);
      const updatedExpired = updatePassColor(expiredPasses);
      setActivePasses(updatedActive);
      setExpiredPasses(updatedExpired);
    } catch (error) {
      console.error('Failed to update pass color:', error);
      toast('Failed to update pass color');
    }
  };
  const handleDelete = async (pass: PurchasedPass) => {
    try {
      // Use the actual purchaseTimestamp from the pass object
      await passStorage.deletePass(pass.passId, pass.purchaseTimestamp);
      
      const filterPasses = (passes: PurchasedPass[]) => passes.filter(p => !(p.passId === pass.passId && p.purchaseTimestamp === pass.purchaseTimestamp));
      const updatedActive = filterPasses(activePasses);
      const updatedExpired = filterPasses(expiredPasses);
      setActivePasses(updatedActive);
      setExpiredPasses(updatedExpired);
      
      toast.success('Pass deleted successfully');
    } catch (error) {
      console.error('Failed to delete pass:', error);
      toast.error('Failed to delete pass');
    }
  };
  const handleExpire = async (pass: PurchasedPass) => {
    try {
      // Transform to PassData format with all current data including user data
      const passData: PassData = {
        passId: pass.passId,
        name: pass.passData.name,
        type: pass.passData.type,
        validFrom: pass.passData.validFrom,
        validTill: pass.passData.validTill,
        amount: parseFloat(pass.amount),
        purchaseDate: pass.purchaseDate,
        purchaseTimestamp: pass.purchaseTimestamp,
        status: 'active',
        colorTheme: pass.colorTheme,
        lastScannedBusNumber: pass.lastScannedBusNumber,
        lastValidatedTimestamp: pass.lastValidatedTimestamp,
        userFirstName: pass.userData.firstName,
        userLastName: pass.userData.lastName,
        userGender: pass.userData.gender,
        userDateOfBirth: pass.userData.dateOfBirth,
      };
      
      // This moves the pass from active to expired in userStorage
      await passStorage.expirePass(passData);
      
      // Update UI
      const updatedActive = activePasses.filter(p => !(p.passId === pass.passId && p.purchaseTimestamp === pass.purchaseTimestamp));
      const expiredPass = {
        ...pass,
        passData: {
          ...pass.passData,
          validTill: new Date().toISOString()
        }
      };
      const updatedExpired = [expiredPass, ...expiredPasses];
      setActivePasses(updatedActive);
      setExpiredPasses(updatedExpired);
      
      toast.success('Pass expired successfully');
    } catch (error) {
      console.error('Failed to expire pass:', error);
      toast.error('Failed to expire pass');
    }
  };
  const currentPasses = selectedTab === 'active' ? activePasses : expiredPasses;
  const hasContent = selectedTopTab === 'passes' ? currentPasses.length > 0 : false;
  const showEmptyMessage = selectedTopTab === 'trips' || !hasContent;
  return <MobileContainer width={540} height={1086}>
      <div className="w-[540px] h-[1086px] relative overflow-hidden">
      <div className="w-[540px] h-[1086px] left-0 top-0 absolute">
        <div className="w-[540px] h-[1086px] left-0 top-0 absolute bg-[#FEFEFE]"></div>
        <div className="w-[540px] h-[139px] left-0 top-[942px] absolute"></div>
        
        {/* Content Area - Full Page */}
        <div
          className="absolute top-[223px] left-0 right-0 bottom-0 w-[540px]"
          onTouchStart={(e) => { touchStartX.current = e.touches[0].clientX; }}
          onTouchEnd={(e) => {
            if (touchStartX.current !== null) {
              const diff = e.changedTouches[0].clientX - touchStartX.current;
              if (diff < -50) setSelectedTopTab('trips');
              if (diff > 50) setSelectedTopTab('passes');
              touchStartX.current = null;
            }
          }}
        >
          {showEmptyMessage && <EmptyState type={selectedTopTab === 'trips' ? 'trips' : 'passes'} showPurchaseSection={selectedTopTab !== 'trips'} showEmptyMessage={true} />}
          
          {/* Pass Cards and Purchase Section - Full Page Scrollable */}
          {selectedTopTab === 'passes' && hasContent && <div className="w-full h-full overflow-y-auto scrollbar-hide">
              <div className="px-4 py-4 min-h-full">
                {/* Pass Cards */}
                <div className="space-y-4">
                {currentPasses.map((pass, index) => <PassCard key={`${pass.passId}-${pass.purchaseTimestamp}-${index}`} passType={pass.passData.type} passCategory={getPassType(pass.passData.name) as 'Daily' | 'Weekly' | 'Monthly'} passName={pass.passData.name} amount={pass.amount} validTill={formatDateForCard(pass.passData.validTill)} isExpired={selectedTab === 'expired'} colorTheme={pass.colorTheme || 'black'} onColorChange={color => handleColorChange(pass, color)} onDelete={() => handleDelete(pass)} onExpire={() => handleExpire(pass)} showRenewOption={selectedTab === 'expired' && index === 0} onArrowClick={() => {
                  navigate('/final', { state: { passRef: { passId: pass.passId, purchaseTimestamp: pass.purchaseTimestamp } } });
                }} onRenew={() => {
                  // Save pass data for renewal WITHOUT the old dates
                  const renewalPassData = {
                    name: pass.passData.name,
                    type: pass.passData.type
                    // Do NOT include validFrom and validTill - let Generation calculate new dates
                  };
                  localStorage.setItem('selectedPass', JSON.stringify(renewalPassData));
                  localStorage.setItem('userData', JSON.stringify(pass.userData));
                  if (pass.verificationData) {
                    localStorage.setItem('verificationSelfie', pass.verificationData.selfie);
                    localStorage.setItem('verificationIdType', pass.verificationData.idType);
                    localStorage.setItem('verificationIdNumber', pass.verificationData.idNumber);
                  }
                  navigate('/generation');
                }} />)}
                </div>
                
                {/* Purchase section - 20px below pass cards */}
                <div className="mt-5 relative">
                  <div className="w-[572px] h-[50px] relative mb-1 -mx-4">
                    <div className="w-[177px] h-[2px] left-[395px] top-[11px] absolute" style={{
                    backgroundColor: '#ebeaea'
                  }}></div>
                    <div className="w-[229px] h-[25px] left-[172px] top-0 absolute flex justify-center items-center text-[#81898B] text-[17.40px] font-inter font-normal">Looking for pass purchase?</div>
                    <div className="w-[177px] h-[2px] left-0 top-[11px] absolute" style={{
                    backgroundColor: '#ebeaea'
                  }}></div>
                  </div>
                  <div className="w-full px-4">
                    <div className="w-[505px] h-[75px] relative">
                      <div onClick={() => navigate('/bmtc-pass')} className="w-[496px] h-[67px] left-[calc(50%-20px)] -translate-x-1/2 top-0 absolute bg-[#11B3BC] rounded-[7px] border border-[#44B0B5] cursor-pointer mx-[5px]"></div>
                      <div className="w-[159px] h-[26px] left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 absolute flex justify-center items-center text-[19.30px] font-inter font-bold" style={{
                      color: '#fefefd'
                    }}>Book a new pass</div>
                      <img className="w-[40px] h-[40px] left-1/2 -translate-x-[125px] top-1/2 -translate-y-1/2 absolute" src={customIcon} alt="Custom icon" />
                    </div>
                  </div>
                </div>
              </div>
            </div>}
        </div>
        <div className="w-[540px] h-[3px] left-0 top-[215px] absolute bg-[#FAFAFA]"></div>
        <div className="w-[540px] h-[72px] left-0 top-[143px] absolute">
          <div className="w-[278px] h-[54px] left-[7px] top-[6px] absolute">
            {/* Expired Tab */}
            <div className="w-[133px] h-[54px] left-[145px] top-0 absolute cursor-pointer" onClick={() => setSelectedTab('expired')}>
              <div className={`w-[124px] h-[47px] left-[5px] top-[4px] absolute rounded-[7px] ${selectedTab === 'expired' ? 'bg-[#E6F8FE]' : 'bg-[#F4F4F4]'}`}></div>
              <div className={`w-[65px] h-[24px] left-[36px] top-[16px] absolute flex justify-center items-center text-[17.80px] font-inter font-normal ${selectedTab === 'expired' ? 'text-[#75C3C3]' : 'text-[#9B9B9B]'}`}>Expired</div>
            </div>
            {/* Active Tab */}
            <div className="w-[131px] h-[53px] left-0 top-0 absolute cursor-pointer" onClick={() => setSelectedTab('active')}>
              <div className={`w-[122px] h-[45px] left-[5px] top-[5px] absolute rounded-[6px] ${selectedTab === 'active' ? 'bg-[#E6F8FE]' : 'bg-[#F4F4F4]'}`}></div>
              <div className={`w-[56px] left-[39px] top-[16px] absolute flex justify-center items-center text-[17.30px] font-inter font-normal ${selectedTab === 'active' ? 'text-[#75C3C3]' : 'text-[#9B9B9B]'}`}>Active</div>
            </div>
          </div>
        </div>
        <div className="w-[540px] h-[3px] left-0 top-[139px] absolute bg-[#FEFEFD]"></div>
        <div className={`w-[272px] h-[6px] top-[137px] absolute bg-[#5bc0de] transition-all duration-300 ${selectedTopTab === 'passes' ? 'left-0' : 'left-[284px]'}`}></div>
        <div className="w-[540px] h-[63px] left-0 top-[78px] absolute">
          {/* Trips/Tickets Tab */}
          <div className="w-[254px] h-[63px] left-[284px] top-0 absolute cursor-pointer" onClick={() => setSelectedTopTab('trips')}>
            <div className={`w-[125px] h-[27px] left-[59px] top-[19px] absolute flex justify-center items-center text-[19.90px] font-inter font-normal ${selectedTopTab === 'trips' ? 'text-[#5bc0de]' : 'text-[#949494]'}`}>Trips/Tickets</div>
          </div>
          {/* Passes Tab */}
          <div className="w-[282px] h-[61px] left-0 top-[1px] absolute cursor-pointer" onClick={() => setSelectedTopTab('passes')}>
            <div className={`w-[65px] h-[22px] left-[103px] top-[19px] absolute flex justify-center items-center text-[18.80px] font-inter font-normal ${selectedTopTab === 'passes' ? 'text-[#5bc0de]' : 'text-[#949494]'}`}>Passes</div>
          </div>
        </div>
        <div className="w-[540px] h-[73px] left-0 top-0 absolute">
          <div className="w-[98px] left-[77px] top-[20px] absolute flex justify-center items-center text-[#505D60] text-[22.30px] font-inter font-normal">Bookings</div>
          <img className="w-[23px] h-[22px] left-[27px] top-[25px] absolute cursor-pointer" src={backArrow} onClick={() => navigate('/', { replace: true })} />
        </div>
      </div>
      </div>
    </MobileContainer>;
};
export default Pass;