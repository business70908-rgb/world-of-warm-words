import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Check } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import placeholderImage from '@/assets/8j.png';
import editIcon from '@/assets/edit-icon.png';
import DatePicker from '@/components/DatePicker';
import femaleIcon from '@/assets/female-icon.png';
import tpIcon from '@/assets/Tp.png';
import maleIcon from '@/assets/male-icon.png';
import indiaFlag from '@/assets/india-flag.png';
import { MobileContainer } from '@/components/MobileContainer';
import { userStorage } from '@/lib/storage/userStorage';
import { Info } from 'lucide-react';
import { BusinessLinkPopup } from '@/components/BusinessLinkPopup';
import tummocIcon from '@/assets/_9.png';
import continueLinkIcon from '@/assets/Continue-Link.png';

interface UserFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other';
}

const TummocWarningPopup = ({ message, onDismiss }: { message: string; onDismiss: () => void }) => {
  const [startX, setStartX] = useState<number | null>(null);

  useEffect(() => {
    const timer = setTimeout(onDismiss, 3000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <div 
      className="fixed bottom-[120px] left-1/2 -translate-x-1/2 z-[80] bg-white rounded-2xl shadow-lg px-5 py-4 flex items-center gap-4 animate-in slide-in-from-bottom-4 duration-300 cursor-grab"
      style={{ width: '420px' }}
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
      <img src={tummocIcon} alt="Tummoc" className="w-12 h-12 rounded-full flex-shrink-0" />
      <span className="text-zinc-700 text-base font-normal font-['Inter']">{message}</span>
    </div>
  );
};

const UserInfo = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedGender, setSelectedGender] = useState<'male' | 'female' | 'other'>('male');
  const [profileImage, setProfileImage] = useState<string>(placeholderImage);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [linkBusiness, setLinkBusiness] = useState(false);
  const [businessEmail, setBusinessEmail] = useState('');
  const [showBusinessInfo, setShowBusinessInfo] = useState(false);
  const [showGmailWarning, setShowGmailWarning] = useState(false);
  const [showDiscardPopup, setShowDiscardPopup] = useState(false);
  const businessSectionRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const { register, handleSubmit, setValue, watch } = useForm<UserFormData>({
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      dateOfBirth: '',
      gender: 'male'
    }
  });

  // Check if navigated with linkBusiness flag from ProfileSelectPopup.
  // Run only once on mount so that going back through history (which restores
  // the original location.state) doesn't re-tick/re-expand the section after Discard.
  const initializedFromStateRef = useRef(false);
  useEffect(() => {
    if (initializedFromStateRef.current) return;
    initializedFromStateRef.current = true;
    if (location.state?.linkBusiness) {
      setLinkBusiness(true);
      // Clear the state so a future popstate won't restore linkBusiness=true
      navigate(location.pathname, { replace: true, state: {} });
      setTimeout(() => {
        businessSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 300);
    }
  }, [location.state, location.pathname, navigate]);

  // Use a ref so the popstate handler always reads the latest linkBusiness value
  // without re-registering the listener (which would push duplicate history entries)
  const linkBusinessRef = useRef(linkBusiness);
  useEffect(() => {
    linkBusinessRef.current = linkBusiness;
  }, [linkBusiness]);

  // Handle browser/mobile back button — set up once, use ref to check current state
  useEffect(() => {
    const handlePopState = (e: PopStateEvent) => {
      if (linkBusinessRef.current) {
        // Push state again to prevent navigation while checkbox is ticked
        window.history.pushState(null, '', window.location.href);
        businessSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        setTimeout(() => {
          setShowDiscardPopup(true);
        }, 400);
      }
      // If linkBusiness is false, let the navigation happen naturally
    };

    // Push one extra history entry so we can intercept the first back press
    window.history.pushState(null, '', window.location.href);
    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Load existing data from localStorage and userStorage on component mount
  useEffect(() => {
    const loadUserData = async () => {
      // Try to load from userStorage first (for native)
      try {
        const userProfile = await userStorage.getUserProfile();
        if (userProfile) {
          setValue('firstName', userProfile.firstName || '');
          setValue('lastName', userProfile.lastName || '');
          setValue('email', userProfile.email || '');
          setValue('phone', userProfile.phone || '');
          setValue('dateOfBirth', userProfile.dateOfBirth || '');
          setValue('gender', userProfile.gender || 'male');
          setSelectedGender(userProfile.gender || 'male');
        }
      } catch (error) {
        console.error('Error loading from userStorage:', error);
      }
      
      // Fallback to localStorage (for web)
      const savedUserData = localStorage.getItem('userData');
      if (savedUserData) {
        const userData = JSON.parse(savedUserData);
        setValue('firstName', userData.firstName || '');
        setValue('lastName', userData.lastName || '');
        setValue('email', userData.email || '');
        setValue('phone', userData.phone || '');
        setValue('dateOfBirth', userData.dateOfBirth || '');
        setValue('gender', userData.gender || 'male');
        setSelectedGender(userData.gender || 'male');
      }
      
      // Load saved profile image from userStorage
      try {
        const savedImage = await userStorage.getProfileImage();
        if (savedImage) {
          setProfileImage(savedImage);
        }
      } catch (error) {
        console.error('Error loading profile image from userStorage:', error);
      }
      
      // Fallback to localStorage for profile image
      const savedProfileImage = localStorage.getItem('profileImage');
      if (savedProfileImage) {
        setProfileImage(savedProfileImage);
      }
    };
    
    loadUserData();
  }, [setValue]);

  const handleBack = () => {
    if (linkBusiness) {
      // Only show discard popup when checkbox is ticked
      businessSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setTimeout(() => {
        setShowDiscardPopup(true);
      }, 400);
      return;
    }
    navigate('/');
  };

  const onSubmit = async (data: UserFormData) => {
    const userData = { ...data, gender: selectedGender };
    
    // Save to localStorage (for web)
    localStorage.setItem('userData', JSON.stringify(userData));
    
    // Save to userStorage (for native)
    try {
      await userStorage.updateUserProfile(userData);
    } catch (error) {
      console.error('Error saving to userStorage:', error);
    }
    
    toast.success('Profile updated successfully!');
    navigate('/', { replace: true });
  };

  const handleGenderSelect = (gender: 'male' | 'female' | 'other') => {
    setSelectedGender(gender);
    setValue('gender', gender);
  };

  const handleCameraCapture = async () => {
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Camera,
      });

      if (image.dataUrl) {
        setProfileImage(image.dataUrl);
        
        // Save to localStorage (for web)
        localStorage.setItem('profileImage', image.dataUrl);
        
        // Save to userStorage (for native)
        try {
          await userStorage.saveProfileImage(image.dataUrl);
        } catch (error) {
          console.error('Error saving profile image to userStorage:', error);
        }
        
        toast.success('Profile photo updated successfully!');
      }
    } catch (error) {
      console.error('Error capturing photo:', error);
      toast.error('Failed to capture photo. Please try again.');
    }
  };

  const handleDateSelect = (date: Date) => {
    const formattedDate = date.toLocaleDateString('en-GB', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric' 
    });
    setValue('dateOfBirth', formattedDate);
    setShowDatePicker(false);
  };

  const contentHeight = linkBusiness ? 1700 : 1400;

  return (
    <MobileContainer width={540} height={890}>
        <form onSubmit={handleSubmit(onSubmit)} className="w-[540px] h-full flex flex-col">
          {/* Scrollable content area */}
          <div ref={scrollContainerRef} className="w-[540px] overflow-y-auto scrollbar-hide flex-1 min-h-0">
            <div className="w-[540px] bg-black/0" style={{ height: `${contentHeight}px`, position: 'relative' }}>
              <div className="w-[540px] bg-white" style={{ height: `${contentHeight}px`, position: 'absolute', left: 0, top: 0 }} />
              <div className="w-[540px] left-0 top-[68px] absolute bg-black/0" style={{ height: `${contentHeight - 68}px` }}>
                <div className="w-[540px] h-60 left-0 top-[767px] absolute bg-black/0">
                  <div className="w-[517px] h-20 left-[10px] top-[49px] absolute bg-black/0">
                    <Input
                      {...register('dateOfBirth')}
                      type="text"
                      onClick={() => setShowDatePicker(true)}
                      readOnly
                      className="w-[506px] h-16 left-[7px] top-[6px] absolute bg-stone-100 rounded-[19px] border-0 text-lg cursor-pointer pl-6"
                    />
                  </div>
                  <div className="w-40 h-7 left-[18px] top-[7px] absolute justify-center text-gray-600 text-2xl font-normal font-['Inter']">Date Of Birth</div>
                </div>

                {/* FOR BUSINESS Section */}
                <div ref={businessSectionRef} className="left-[10px] top-[920px] absolute" style={{ width: '518px' }}>
                  <div className="flex items-center gap-3 mb-5">
                    <span className="text-gray-700 text-lg font-bold font-['Inter'] tracking-wide whitespace-nowrap">FOR BUSINESS</span>
                    <div className="flex-1 h-[1px] bg-gray-300" />
                  </div>
                  <div className={`border border-gray-300 rounded-xl p-5 ${!linkBusiness ? 'min-h-[80px] flex items-center' : ''}`}>
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-7 h-7 rounded-md border-2 flex items-center justify-center cursor-pointer transition-colors"
                        style={{ 
                          borderColor: linkBusiness ? '#2596be' : '#c0c0c0',
                          backgroundColor: linkBusiness ? '#2596be' : 'transparent'
                        }}
                        onClick={() => setLinkBusiness(!linkBusiness)}
                      >
                        {linkBusiness && (
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <path d="M3 8L6.5 11.5L13 4.5" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        )}
                      </div>
                      <span className="text-gray-800 text-xl font-bold font-['Inter']">Link Business Profile</span>
                      <Info 
                        className="w-5 h-5 text-gray-500 cursor-pointer" 
                        onClick={() => setShowBusinessInfo(true)}
                      />
                    </div>
                    {linkBusiness && (
                      <div className="mt-5">
                        <div className="w-full h-[1px] mb-5" style={{ backgroundColor: '#a9a9a9' }} />
                        <p className="text-gray-800 text-lg font-bold font-['Inter'] mb-1">Verify Business Email ID</p>
                        <p className="text-gray-500 text-base font-normal font-['Inter'] mb-4">You'll receive an OTP to confirm your email</p>
                        <Input
                          value={businessEmail}
                          onChange={(e) => {
                            setBusinessEmail(e.target.value);
                            setShowGmailWarning(false);
                          }}
                          placeholder="Business Email ID"
                          className="w-full h-14 bg-gray-100 rounded-xl border-0 text-lg font-normal font-['Inter'] px-4 mb-5 focus-visible:ring-0 focus-visible:ring-offset-0"
                        />
                        <button
                          type="button"
                          className="w-full h-14 rounded-2xl text-white text-xl font-bold font-['Inter'] cursor-pointer hover:opacity-90 transition-opacity bg-lime-400 mb-4"
                          onClick={() => {
                            if (businessEmail.endsWith('@gmail.com')) {
                              setShowGmailWarning(true);
                              return;
                            }
                            if (!businessEmail.includes('@') || businessEmail.endsWith('@gmail.com')) {
                              setShowGmailWarning(true);
                              return;
                            }
                            // TODO: handle OTP flow
                          }}
                        >
                          Get OTP
                        </button>
                        <p className="text-gray-500 text-base font-normal font-['Inter']">
                          I agree to the <span className="underline cursor-pointer" onClick={() => navigate('/business-linking-terms')}>Terms & Conditions</span> for creating a Business Profile
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="w-[540px] h-32 left-0 top-[624px] absolute bg-black/0">
                  <div className="w-[512px] h-20 left-[14px] top-[45px] absolute bg-black/0">
                    <div 
                      className={`w-40 h-16 left-[349px] top-[3px] absolute bg-black/0 cursor-pointer ${selectedGender === 'other' ? 'opacity-100' : 'opacity-50'}`}
                      onClick={() => handleGenderSelect('other')}
                    >
                      <div className={`w-40 h-16 left-[2px] top-[3px] absolute rounded-tr-[3px] rounded-bl-[3px] rounded-br-[3px] border ${selectedGender === 'other' ? 'bg-lime-400 border-lime-300' : 'bg-zinc-100 border-gray-200'}`} />
                      <img className="w-10 h-10 left-[117px] top-[15px] absolute" src={femaleIcon} />
                      <div className={`w-14 h-6 left-[19px] top-[21px] absolute justify-center text-xl font-normal font-['Inter'] ${selectedGender === 'other' ? 'text-lime-200' : 'text-stone-300'}`}>Other</div>
                    </div>
                    <div 
                      className={`w-44 h-20 left-[170px] top-0 absolute bg-black/0 cursor-pointer ${selectedGender === 'female' ? 'opacity-100' : 'opacity-50'}`}
                      onClick={() => handleGenderSelect('female')}
                    >
                      <div className={`w-40 h-16 left-[6px] top-[6px] absolute rounded-tl-[3px] border ${selectedGender === 'female' ? 'bg-lime-400 border-lime-300' : 'bg-zinc-100 border-gray-200'}`} />
                      <img className="w-10 h-10 left-[119px] top-[15px] absolute" src={tpIcon} />
                      <div className={`w-16 h-6 left-[24px] top-[25px] absolute justify-center text-xl font-normal font-['Inter'] ${selectedGender === 'female' ? 'text-lime-200' : 'text-zinc-400'}`}>Female</div>
                    </div>
                    <div 
                      className={`w-40 h-16 left-0 top-[4px] absolute bg-black/0 cursor-pointer ${selectedGender === 'male' ? 'opacity-100' : 'opacity-50'}`}
                      onClick={() => handleGenderSelect('male')}
                    >
                      <div className={`w-40 h-16 left-[2px] top-[1px] absolute rounded-tl rounded-tr-[3px] rounded-br-[3px] border ${selectedGender === 'male' ? 'bg-lime-400 border-lime-300' : 'bg-zinc-100 border-gray-200'}`} />
                      <img className="w-7 h-7 left-[121px] top-[18px] absolute" src={maleIcon} />
                      <div className={`w-12 h-6 left-[19px] top-[21px] absolute justify-center text-xl font-normal font-['Inter'] ${selectedGender === 'male' ? 'text-lime-200' : 'text-gray-400'}`}>Male</div>
                    </div>
                  </div>
                  <div className="w-24 h-7 left-[17px] top-[4px] absolute justify-center text-gray-600 text-2xl font-normal font-['Inter']">Gender</div>
                </div>
                <div className="w-[540px] h-32 left-0 top-[474px] absolute bg-black/0">
                  <div className="w-[514px] h-16 left-[12px] top-[50px] absolute bg-black/0">
                    <div className="w-96 h-16 left-[152px] top-0 absolute bg-black/0">
                      <Input
                        {...register('phone')}
                        className="w-96 h-16 left-[4px] top-[4px] absolute bg-zinc-100 rounded-md border-0 text-lg pl-4"
                      />
                      <div className="w-16 h-5 left-[281px] top-[24px] absolute justify-center text-lg font-normal font-['Inter'] pointer-events-none" style={{color: '#93BCA7'}}>Verified</div>
                      <Check className="w-5 h-4 left-[257px] top-[30px] absolute pointer-events-none" style={{color: '#93BCA7'}} size={16} />
                    </div>
                    <div className="w-32 h-16 left-0 top-[2px] absolute bg-black/0">
                      <div className="w-32 h-16 left-[4px] top-[2px] absolute bg-stone-100 rounded-md" />
                      <div className="w-8 h-5 left-[87px] top-[22px] absolute justify-center text-gray-500 text-lg font-normal font-['Inter']">+91</div>
                      <img className="w-12 h-8 left-[21px] top-[18px] absolute" src={indiaFlag} />
                    </div>
                  </div>
                  <div className="w-44 h-7 left-[17px] top-[6px] absolute justify-center text-gray-600 text-2xl font-normal font-['Inter']">Phone Number</div>
                </div>
                <div className="w-[540px] h-32 left-0 top-[324px] absolute bg-black/0">
                  <div className="w-[521px] h-20 left-[8px] top-[50px] absolute bg-black/0">
                    <Input
                      {...register('email')}
                      type="email"
                      className="w-[508px] h-16 left-[8px] top-[6px] absolute bg-stone-100 rounded-md border-0 text-lg"
                    />
                  </div>
                  <div className="w-24 h-7 left-[17px] top-[9px] absolute justify-center text-gray-600 text-2xl font-normal font-['Inter']">Email ID</div>
                </div>
                <div className="w-[540px] h-32 left-0 top-[175px] absolute bg-black/0">
                  <div className="w-64 h-20 left-[274px] top-[52px] absolute bg-black/0">
                    <Input
                      {...register('lastName')}
                      className="w-60 h-16 left-[6px] top-[6px] absolute bg-zinc-100 rounded-tl-lg rounded-tr-[10px] rounded-bl-md rounded-br-md border-0 text-lg"
                    />
                  </div>
                  <div className="w-64 h-20 left-[9px] top-[52px] absolute bg-black/0">
                    <Input
                      {...register('firstName')}
                      className="w-60 h-16 left-[7px] top-[6px] absolute bg-zinc-100 rounded-md border-0 text-lg"
                    />
                  </div>
                  <div className="w-32 h-7 left-[282px] top-[12px] absolute justify-center text-gray-600 text-2xl font-normal font-['Inter']">Last Name</div>
                  <div className="w-32 h-7 left-[17px] top-[11px] absolute justify-center text-gray-600 text-2xl font-normal font-['Inter']">First Name</div>
                </div>
                <div className="w-[540px] h-44 left-0 top-0 absolute bg-black/0">
                  <div className="relative w-32 h-32 left-[208px] top-[18px] absolute">
                    <img 
                      className="w-32 h-32 rounded-full object-cover" 
                      src={profileImage} 
                      alt="Profile"
                    />
                    <div 
                      className="absolute -bottom-1 -right-1 w-10 h-10 cursor-pointer"
                      onClick={handleCameraCapture}
                    >
                      <img className="w-full h-full" src={editIcon} alt="Edit" />
                    </div>
                  </div>
                </div>
              </div>
              <div className="w-[540px] h-14 left-0 top-[3px] absolute bg-black/0">
                <div className="w-36 h-7 left-[100px] top-[17px] absolute justify-center text-gray-600 text-2xl font-normal font-['Inter']">Edit Profile</div>
                <ArrowLeft 
                  className="w-6 h-5 left-[27px] top-[22px] absolute cursor-pointer text-black" 
                  onClick={handleBack}
                />
              </div>
            </div>
          </div>

          {/* Footer Submit Button - at the bottom of scrollable content */}
          <div className="w-[540px] px-[10px] pt-0 pb-4 flex justify-center">
            <Button 
              type="submit"
              className="w-[518px] h-[72px] rounded-xl text-white text-2xl font-bold hover:opacity-90"
              style={{ backgroundColor: '#2596be' }}
            >
              SUBMIT
            </Button>
          </div>
        </form>

        {/* Date Picker */}
        <DatePicker
          isOpen={showDatePicker}
          onSave={handleDateSelect}
          onCancel={() => setShowDatePicker(false)}
        />

        {/* Business Link Info Popup */}
        <BusinessLinkPopup
          isOpen={showBusinessInfo}
          onClose={() => setShowBusinessInfo(false)}
          width={390}
        />

        {/* Tummoc Pop-up - Gmail warning */}
        {showGmailWarning && (
          <TummocWarningPopup 
            message={businessEmail.endsWith('@gmail.com') ? 'Please use your business email address.' : 'Please enter a valid business email address.'}
            onDismiss={() => setShowGmailWarning(false)}
          />
        )}

        {/* Discard Business Profile Popup */}
        {showDiscardPopup && (
          <>
            <div className="fixed inset-0 bg-black/50 z-[60]" onClick={() => setShowDiscardPopup(false)} />
            <div
              className="fixed z-[70] bg-white rounded-3xl shadow-2xl animate-in fade-in zoom-in-95 duration-200 flex flex-col items-center text-center"
              style={{
                width: '390px',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                padding: '32px 28px',
              }}
            >
              <img src={continueLinkIcon} alt="Continue Link" className="w-20 h-24 mb-5" />
              <p className="text-zinc-800 text-2xl font-bold font-['Inter'] mb-3">
                Are you sure you don't want a Business Profile?
              </p>
              <p className="text-xl font-normal font-['Inter'] mb-6" style={{ color: '#a9a9a9' }}>
                Are you sure you want to cancel Business Profile linking? Your progress so far won't be saved
              </p>
              <button
                type="button"
                className="w-full py-4 rounded-2xl text-white text-lg font-bold font-['Inter'] cursor-pointer hover:opacity-90 transition-opacity mb-4"
                style={{ backgroundColor: '#2596be' }}
                onClick={() => setShowDiscardPopup(false)}
              >
                Continue Linking
              </button>
              <button
                type="button"
                className="text-lg font-bold font-['Inter'] cursor-pointer hover:opacity-80 transition-opacity bg-transparent border-0"
                style={{ color: '#2596be' }}
                onClick={() => {
                  setLinkBusiness(false);
                  setBusinessEmail('');
                  setShowGmailWarning(false);
                  setShowDiscardPopup(false);
                  // Go back past the extra history entry we pushed, so the
                  // next back press navigates away instead of re-triggering popstate
                  window.history.back();
                }}
              >
                Discard
              </button>
            </div>
          </>
        )}
    </MobileContainer>
  );
};

export default UserInfo;
