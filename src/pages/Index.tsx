import { Menu, ChevronDown } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect, useCallback, useMemo } from "react";
import { useWeather } from "@/hooks/useWeather";
import { getWeatherIcon } from "@/lib/utils";
import PassImage from "@/assets/Pass.png";
import MetroImage from "@/assets/Metro.png";
import AllInOneImage from "@/assets/All-in-one.png";
import BusBackground from "@/assets/Bus_Background.png";
import BlueLeftIcon from "@/assets/Blue-left-icon.png";
import arrowRight from "@/assets/arrow-right.png";
import TuGif from "@/assets/Tu.gif";
import img9s from "@/assets/9s.png";
import UNGif from "@/assets/UN.gif";
import qQImg from "@/assets/qQ.png";
import BusImg from "@/assets/Bus.png";
import Metro2Img from "@/assets/Metro-2.png";
import gif5f from "@/assets/5f.gif";
import TrainImg from "@/assets/Train.png";
import closeIcon from "@/assets/Close-icon-1.png";
import flyingBird from "@/assets/flying-bird.png";
import heartIcon from "@/assets/heart-icon.png";
import BoImg from "@/assets/Bo.png";
import background10g from "@/assets/10g-background.png";
import leaf1 from "@/assets/leaf-1.png";
import HomeIcon from "@/Icon assets/Home.png";
import WalletIcon from "@/Icon assets/Wallet.png";
import BookingIcon from "@/Icon assets/Booking.png";
import PersonalIcon from "@/assets/personal-profile.png";
import { MenuContent } from "./Menu";
import { AdBanner } from "@/components/AdBanner";
import { ProfileSelectPopup } from "@/components/ProfileSelectPopup";
import { MobileContainer } from "@/components/MobileContainer";
import { scanStorage } from "@/lib/storage/scanStorage";

const Index = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedCity, setSelectedCity] = useState<string>('Bengaluru');
  const [userName, setUserName] = useState<string>('');
  const [isBannerHidden, setIsBannerHidden] = useState<boolean>(false);
  const { temperature, weatherCode, loading } = useWeather(selectedCity);
  
  // Simplified typewriter effect
  const [displayText, setDisplayText] = useState<string>('');
  const [scanCount, setScanCount] = useState<number>(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfilePopupOpen, setIsProfilePopupOpen] = useState(false);

  // Memoize format function
  const formatScanCount = useCallback((count: number): string => {
    if (count > 999) {
      return `${(count / 1000).toFixed(2)} Kg`;
    }
    return `${count} g`;
  }, []);

  // Consolidated localStorage initialization
  useEffect(() => {
    const loadData = async () => {
      const savedCity = localStorage.getItem('selectedCity');
      if (savedCity) setSelectedCity(savedCity);
      
      const userData = localStorage.getItem('userData');
      if (userData) {
        try {
          const parsedData = JSON.parse(userData);
          if (parsedData?.firstName) {
            setUserName(parsedData.lastName ? `${parsedData.firstName} ${parsedData.lastName}` : parsedData.firstName);
          }
        } catch (error) {
          console.error('Error parsing user data:', error);
        }
      }

      // Load scan count from native storage
      const count = await scanStorage.getScanCount();
      setScanCount(count);
    };
    
    loadData();
  }, []);

  // Refresh scan count when user navigates back to this page
  useEffect(() => {
    const refreshScanCount = async () => {
      const count = await scanStorage.getScanCount();
      setScanCount(count);
    };
    
    // Refresh when location changes (user navigates back)
    refreshScanCount();
  }, [location]);

  // Typewriter effect - auto-erase with 0.5 second gap
  useEffect(() => {
    const texts = ['Search destination here', 'Plan your trip'];
    let textIndex = 0;
    let charIndex = 0;
    let timeoutId: ReturnType<typeof setTimeout>;
    
    const type = () => {
      const currentText = texts[textIndex];
      
      if (charIndex <= currentText.length) {
        // Typing phase
        setDisplayText(currentText.slice(0, charIndex));
        charIndex++;
        
        if (charIndex > currentText.length) {
          // Finished typing - wait 0.5 second then instantly erase
          timeoutId = setTimeout(() => {
            setDisplayText('');
            charIndex = 0;
            textIndex = (textIndex + 1) % texts.length;
            // Wait 0.5 second before starting next text
            timeoutId = setTimeout(type, 500);
          }, 500);
        } else {
          // Continue typing
          timeoutId = setTimeout(type, 100);
        }
      }
    };
    
    timeoutId = setTimeout(type, 100);
    return () => clearTimeout(timeoutId);
  }, []);

  // Reset banner when route changes
  useEffect(() => {
    setIsBannerHidden(false);
  }, [location.pathname]);

  // Memoize calculated values
  const scanCountWidth = useMemo(() => Math.max(160, 120 + (formatScanCount(scanCount).length * 14)), [scanCount, formatScanCount]);
  const scanCountBgWidth = useMemo(() => Math.max(245, 205 + (formatScanCount(scanCount).length * 14)), [scanCount, formatScanCount]);
  const scanCountTextWidth = useMemo(() => Math.max(80, 56 + (formatScanCount(scanCount).length * 14)), [scanCount, formatScanCount]);

  return (
    <MobileContainer width={765} height={1552}>
      <div className="w-[765px] h-[1552px] relative bg-black/0 overflow-hidden">
      <div className="w-[765px] h-[1552px] left-0 top-0 absolute bg-black/0 overflow-y-auto scrollbar-hide">
        <div className="w-[765px] h-[2000px] left-0 top-[321px] absolute" style={{backgroundColor: '#fefefd'}} />
        <div className={`w-[765px] h-14 left-0 absolute bg-black/0 transition-all duration-300 ${isBannerHidden ? 'top-[1055px]' : 'top-[1215px]'}`}>
          <div className="w-64 h-9 left-[28px] top-[4px] absolute justify-center text-gray-700 text-3xl font-normal font-['Inter']">Travel Outstation</div>
        </div>
        
        {/* New Layout Section */}
        <div className={`w-[765px] h-[1100px] left-0 absolute bg-white overflow-hidden transition-all duration-300 ${isBannerHidden ? 'top-[1120px]' : 'top-[1280px]'}`}>
          <div className="w-[730px] h-40 left-0 top-[20px] absolute bg-black/0">
            <img className="w-[750px] h-36 left-[9px] top-[2px] absolute rounded-3xl border-[3px]" src={BusBackground} style={{borderColor: '#029ea3'}} />
            <div className="w-[765px] h-36 left-0 top-[10px] absolute bg-black/0 cursor-pointer" onClick={() => navigate('/red-bus')}>
              <img className="w-6 h-8 left-[670px] top-[45px] absolute" src={arrowRight} alt="Arrow right" />
              <div className="w-[590px] h-16 left-[147px] top-[40px] absolute justify-center text-neutral-800 text-4xl font-bold font-['Inter']">Book outstation bus tickets</div>
              <img className="w-28 h-20 left-[20px] top-[25px] absolute" src={TuGif} />
            </div>
          </div>
          
          <img className="w-[765px] h-52 left-0 top-[200px] absolute" src={img9s} />
          
          {/* Ad Banner Section */}
          <div className="w-[635px] h-36 left-[66px] top-[450px] absolute">
            <AdBanner />
          </div>
          
          {/* Metro stations section - positioned above background */}
          <div className="w-[750px] h-32 left-[9px] top-[240px] absolute bg-black/0 z-10">
            <div className="w-[690px] h-28 left-[30px] top-[2px] absolute bg-black/0">
              <div className="w-[680px] h-28 left-[5px] top-[2px] absolute bg-white/95 rounded-3xl border border-gray-200" />
              <img className="w-16 h-16 left-[590px] top-[24px] absolute" src={BlueLeftIcon} />
              
              <img className="w-[400px] h-[70px] left-[35px] top-[21px] absolute" src={UNGif} />
            </div>
          </div>
          
          <div className="w-[750px] h-72 left-[9px] top-[640px] absolute bg-black/0">
            <img className="w-64 h-48 left-[480px] top-[70px] absolute" src={qQImg} />
            <div className="w-52 h-20 left-[4px] top-[160px] absolute bg-black/0">
              <div 
                className="w-52 h-20 left-[4px] top-[2px] absolute bg-lime-400 rounded-3xl border border-lime-400 flex items-center justify-center cursor-pointer"
                onClick={() => navigate('/vote-now')}
              >
                <div className="text-4xl font-bold font-['Inter']" style={{color: '#fefefd'}}>Vote now</div>
              </div>
            </div>
            <div className="w-[470px] h-16 left-[8px] top-[70px] absolute justify-center text-neutral-700 text-2xl font-normal font-['Inter'] leading-8">Let us know the greatest feature<br/>that matters to you the most.</div>
          </div>
        </div>
        
        <div className={`w-[715px] h-0.5 left-[25px] absolute bg-neutral-200 transition-all duration-300 ${isBannerHidden ? 'top-[1024px]' : 'top-[1184px]'}`} />
        <div className={`w-[765px] h-72 left-0 absolute bg-black/0 transition-all duration-300 ${isBannerHidden ? 'top-[734px]' : 'top-[894px]'}`}>
          <div className="w-[659px] h-48 left-[20px] top-[74px] absolute bg-black/0">
            {/* Bus */}
            <div 
              className="w-40 h-44 left-0 top-[12px] absolute bg-black/0 cursor-pointer"
              onClick={() => navigate('/maps?mode=bus')}
            >
              <div className="w-11 h-6 left-[62px] top-[145px] absolute justify-center text-gray-700 text-2xl font-normal font-['Inter']">Bus</div>
              <div className="w-28 h-28 left-[23px] top-[10px] absolute rounded-[30px] flex items-center justify-center" style={{backgroundColor: '#f3f5f5'}}>
                <img className="w-20 h-20" src={BusImg} alt="Bus" />
              </div>
            </div>
            {/* Metro */}
            <div 
              className="w-40 h-44 left-[163px] top-[11px] absolute bg-black/0 cursor-pointer" 
              onClick={() => navigate('/maps')}
            >
              <div className="w-16 h-6 left-[50px] top-[146px] absolute justify-center text-gray-700 text-2xl font-normal font-['Inter']">Metro</div>
              <div className="w-28 h-28 left-[23px] top-[11px] absolute rounded-[33px] flex items-center justify-center" style={{backgroundColor: '#f3f5f5'}}>
                <img className="w-20 h-20 mt-2" src={Metro2Img} alt="Metro" />
              </div>
            </div>
            {/* Direct Ride */}
            <div 
              className="w-40 h-48 left-[327px] top-0 absolute bg-black/0 cursor-pointer"
              onClick={() => navigate('/all-in-one?mode=ride')}
            >
              <div className="w-32 h-6 left-[20px] top-[156px] absolute justify-center text-gray-700 text-2xl font-normal font-['Inter']">Direct Ride</div>
              <div className="w-[120px] h-[116px] left-[22px] top-[15px] absolute rounded-[33px] flex items-center justify-center" style={{backgroundColor: '#f3f5f5'}}>
                <img className="w-12 h-12" src={gif5f} alt="Direct Ride" />
              </div>
              <div className="w-20 h-8 left-[41px] top-[3px] absolute bg-black/0">
                <div className="w-20 h-7 left-[2px] top-[3px] absolute bg-orange-500 rounded-2xl border border-orange-400 flex items-center justify-center">
                  <div className="text-white text-xl font-bold font-['Inter']">Cash</div>
                </div>
              </div>
            </div>
            {/* Train */}
            <div 
              className="w-44 h-48 left-[485px] top-[5px] absolute bg-black/0 cursor-pointer"
              onClick={() => navigate('/maps?mode=airport')}
            >
              <div className="w-32 left-[24px] top-[151px] absolute justify-center text-gray-700 text-2xl font-normal font-['Inter']">Airport Rail</div>
              <div className="w-28 h-28 left-[29px] top-[17px] absolute rounded-[32px] flex items-center justify-center" style={{backgroundColor: '#f3f5f5'}}>
                <img className="w-28 h-28" src={TrainImg} alt="Train" />
              </div>
            </div>
          </div>
          <div className="w-96 h-10 left-[29px] top-[9px] absolute justify-center text-gray-500 text-3xl font-normal font-['Inter']">Commute options available</div>
        </div>
        <div className={`w-[512px] h-44 left-[34px] absolute bg-black/0 transition-all duration-300 ${isBannerHidden ? 'top-[528px]' : 'top-[688px]'}`}>
          <div 
            className="w-40 h-44 left-[350px] top-[1px] absolute bg-black/0 cursor-pointer"
            onClick={() => navigate('/all-in-one')}
          >
            <div className="w-28 h-16 left-[31px] top-[104px] absolute text-center justify-center text-zinc-500 text-2xl font-bold font-['Inter'] leading-loose">All-in-One<br/>Ticket</div>
            <img className="w-44 h-48 left-[0px] top-[-54px] absolute" src={AllInOneImage} />
            
            
          </div>
          <div 
            className="w-44 h-40 left-[173px] top-[1px] absolute bg-black/0 cursor-pointer" 
            onClick={() => navigate('/metro')}
          >
            <div className="w-52 h-6 left-[16px] top-[106px] absolute justify-center text-gray-500 text-2xl font-bold font-['Inter']">Metro Ticket</div>
            <img className="w-44 h-48 left-[-10px] top-[-54px] absolute" src={MetroImage} />
          </div>
          <div 
            className="w-44 h-36 left-0 top-0 absolute bg-black/0 cursor-pointer" 
            onClick={() => navigate('/bmtc-pass')}
          >
            <div className="w-32 h-6 left-[19px] top-[106px] absolute justify-center text-zinc-500 text-2xl font-bold font-['Inter']">BMTC Pass</div>
            <img className="w-44 h-48 left-[-10px] top-[-53px] absolute rounded-2xl" src={PassImage} />
          </div>
        </div>
        <div className={`w-64 left-[30px] absolute justify-center text-zinc-500 text-3xl font-normal font-['Inter'] transition-all duration-300 ${isBannerHidden ? 'top-[444px]' : 'top-[604px]'}`}>Passes & Tickets</div>
        {!isBannerHidden && (
          <div className="w-[712px] h-36 left-[19px] top-[412px] absolute bg-white rounded-[30px] border-2 border-gray-200 flex items-center px-6 relative">
            <img className="w-[120px] h-[120px] rounded-full" src={flyingBird} alt="Business Profile" />
            <div className="ml-4 flex flex-col">
              <span className="text-zinc-800 text-2xl font-bold font-['Inter']">Business Profile</span>
              <span className="text-neutral-400 text-xl font-normal font-['Inter']">Link profile for work use</span>
            </div>
            <div className="absolute right-[40px] flex items-center gap-5">
              <div 
                className="px-7 py-4 bg-[#10bbc3] rounded-2xl flex items-center justify-center cursor-pointer hover:opacity-90 transition-opacity"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate('/user-info', { state: { linkBusiness: true } });
                }}
              >
                <span className="text-white text-[26px] font-bold font-['Inter']">Link Now</span>
              </div>
              <img 
                className="w-8 h-8 cursor-pointer" 
                src={closeIcon} 
                onClick={() => setIsBannerHidden(true)}
                alt="Close"
              />
            </div>
          </div>
        )}
        <div className="w-[765px] h-80 left-0 top-0 fixed bg-teal-950 header-teal-fix" />
        <div className="w-[765px] h-28 left-0 top-[267px] fixed bg-black/0 z-40">
          <div className="w-[723px] h-28 left-[12px] top-0 absolute bg-black/0">
            <div 
              className="w-[713px] h-24 left-[6px] top-[3px] absolute bg-white rounded-xl border border-neutral-200 cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => navigate('/plan-my-trip')}
            >
              <div className="w-[400px] text-4xl font-normal text-gray-500 ml-[108px] mt-[26px]">
                {displayText}
              </div>
            </div>
            <img className="w-11 h-11 left-[647px] top-[31px] absolute" src={heartIcon} alt="Heart" />
            <div className="w-[5px] h-16 left-[615px] top-[19px] absolute" style={{backgroundColor: '#ececec'}} />
            <img className="w-[60px] h-[60px] left-[35px] top-[22px] absolute" src={BoImg} alt="Bo" />
          </div>
        </div>
      </div>
      <div className="w-[765px] h-80 left-0 top-0 fixed bg-black/0 z-50 header-teal-fix">
          <div className="w-[765px] h-28 left-0 top-[128px] absolute bg-black/0">
          <div 
            className="h-20 left-[572px] top-[20px] absolute bg-black/0"
            style={{ width: `${scanCountWidth}px` }}
          >
            <div 
              className="h-[136px] right-[-42px] top-[-25px] absolute rounded-[32px] cursor-pointer hover:opacity-90 transition-opacity" 
              style={{
                width: `${scanCountBgWidth}px`,
                backgroundImage: `url(${background10g})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat'
              }}
              onClick={() => navigate('/environment')}
            />
            <div 
              className="h-10 left-[76px] top-[24px] absolute justify-center text-white text-3xl font-bold font-['Inter'] pointer-events-none"
              style={{ width: `${scanCountTextWidth}px` }}
            >
              {formatScanCount(scanCount)}
            </div>
            <img className="w-20 h-18 left-[3px] top-[5px] absolute pointer-events-none" src={leaf1} alt="Leaf" />
          </div>
          <div className="w-[500px] h-12 left-[29px] top-[42px] absolute justify-center text-white text-4xl font-normal font-['Inter']">Good Afternoon {userName || 'User'}</div>
        </div>
        <div className="w-[765px] h-24 left-0 top-[16px] absolute bg-black/0">
          <div className="w-96 h-20 left-[326px] top-[8px] absolute bg-black/0">
            <div className="w-96 h-20 left-[1px] top-[-4px] absolute bg-black/0">
              <div 
                className="w-96 h-20 left-[6px] top-[6px] absolute bg-slate-800 rounded-xl cursor-pointer" 
                onClick={() => navigate('/city-selection')}
              />
              <ChevronDown 
                className="w-7 h-7 left-[350px] top-[30px] absolute text-white cursor-pointer" 
                onClick={() => navigate('/city-selection')}
              />
              <div 
                className="w-36 h-10 left-[197px] top-[26px] absolute justify-center text-white text-3xl font-normal font-['Inter'] cursor-pointer"
                onClick={() => navigate('/city-selection')}
              >
                {selectedCity}
              </div>
              <div className="w-[3px] h-3.5 left-[177px] top-[37px] absolute bg-[#34525d]" />
              <div 
                className="w-24 h-9 left-[77px] top-[26px] absolute justify-center text-white text-2xl font-normal font-['Inter'] cursor-pointer"
                onClick={() => navigate('/city-selection')}
              >
                {loading ? '--°C' : `${temperature % 1 === 0 ? Math.round(temperature) : temperature}°C`}
              </div>
              <img 
                className="w-11 h-7 left-[23px] top-[30px] absolute cursor-pointer" 
                src={getWeatherIcon(weatherCode, temperature)} 
                alt="Weather"
                onClick={() => navigate('/city-selection')}
              />
            </div>
          </div>
          <Menu 
            className="w-12 h-10 left-[29px] top-[34px] absolute text-white cursor-pointer" 
            onClick={() => setIsMenuOpen(true)}
          />
          
        </div>
      </div>
        
        {/* Floating Menu Section */}
        <div className="w-[765px] h-44 left-0 bottom-0 fixed bg-white overflow-hidden z-30 border-t border-gray-200">
          <div className="w-[765px] h-44 flex items-center justify-evenly">
            {/* HOME */}
            <div 
              className="flex flex-col items-center gap-2 cursor-pointer"
              onClick={() => navigate('/', { replace: true })}
            >
              <img className="w-12 h-12" src={HomeIcon} alt="Home" />
              <span className="text-gray-700 text-2xl font-bold font-['Inter']">Home</span>
            </div>
            
            {/* TUMMOC MONEY */}
            <div 
              className="flex flex-col items-center gap-2 cursor-pointer"
              onClick={() => navigate('/tummoc-money')}
            >
              <img className="w-14 h-14" src={WalletIcon} alt="Tummoc Money" />
              <span className="text-zinc-500 text-2xl font-normal font-['Inter']">Tummoc Money</span>
            </div>
            
            {/* BOOKINGS */}
            <div 
              className="flex flex-col items-center gap-2 cursor-pointer"
              onClick={() => navigate('/pass')}
            >
              <img className="w-14 h-14" src={BookingIcon} alt="Bookings" />
              <span className="text-zinc-500 text-2xl font-normal font-['Inter']">Bookings</span>
            </div>

            {/* PERSONAL */}
            <div 
              className="flex flex-col items-center gap-2 cursor-pointer relative"
              onClick={() => setIsProfilePopupOpen(true)}
            >
              <div className="relative">
                <img className="w-20 h-20" src={PersonalIcon} alt="Personal" />
              </div>
              <span className="text-zinc-500 text-2xl font-normal font-['Inter']">Personal</span>
            </div>
          </div>
        </div>

      {/* Menu Sheet - inside scaled container */}
      {isMenuOpen && (
        <>
          {/* Overlay */}
          <div 
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setIsMenuOpen(false)}
          />
          
          {/* Menu Container */}
          <div 
            className="fixed bg-white border-r shadow-xl z-50 overflow-y-auto"
            style={{
              width: '537px',
              height: '1552px',
              left: '0',
              top: '0',
            }}
          >
            <MenuContent onProfileSelect={() => {
              setIsMenuOpen(false);
              setIsProfilePopupOpen(true);
            }} />
          </div>
        </>
      )}
      {/* Profile Select Popup */}
      <ProfileSelectPopup isOpen={isProfilePopupOpen} onClose={() => setIsProfilePopupOpen(false)} />
      </div>
    </MobileContainer>
  );
};

export default Index;
