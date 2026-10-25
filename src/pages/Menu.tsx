import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import placeholderImage from '@/assets/8j.png';
import socialIconNew from '@/assets/social-icon-new.png';
import xLogoNew from '@/assets/x-logo-new.png';
import userProfileImage from '@/assets/user-profile-image.png';
import profileRing from '@/assets/profile-ring.png';
import accountSettingIcon from '@/Icon assets/account-setting.png';
import termsOfUsageIcon from '@/Icon assets/terms-of-usage.png';
import privacyPolicyIcon from '@/Icon assets/Privacy policy.png';
import referralsIcon from '@/Icon assets/Refferals.png';
import tummocBlogIcon from '@/Icon assets/tummoc-blog.png';
import tummocMoneyIcon from '@/Icon assets/tummoc-money.png';
import switchCityIcon from '@/Icon assets/switch-city.png';
import savedPlacesIcon from '@/Icon assets/Saved Places.png';
import languageIcon from '@/Icon assets/Language.png';
import helpSupportIcon from '@/Icon assets/Help & Support.png';
import bmtcPassIcon from '@/Icon assets/bmtc-pass.png';
import normalProfileImage from '@/assets/normal-profile.png';
import { ChevronDown } from 'lucide-react';

const MenuContent = ({ onProfileSelect }: { onProfileSelect?: () => void }) => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState<string>('User');
  const [userPhone, setUserPhone] = useState<string>('xxxxxxxxxxx');
  const [profileImage, setProfileImage] = useState<string>(placeholderImage);

  useEffect(() => {
    const userData = localStorage.getItem('userData');
    if (userData) {
      try {
        const parsedData = JSON.parse(userData);
        if (parsedData && typeof parsedData === 'object') {
          setUserName(`${parsedData.firstName || ''} ${parsedData.lastName || ''}`.trim() || 'User');
          setUserPhone(parsedData.phone || 'xxxxxxxxxxx');
        }
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
    
    // Load saved profile image
    const savedProfileImage = localStorage.getItem('profileImage');
    if (savedProfileImage) {
      setProfileImage(savedProfileImage);
    }
  }, []);
  
  const handleNavigation = (path: string) => {
    navigate(path);
  };

  return (
    <div className="w-full h-full relative bg-white overflow-y-auto scrollbar-hide">
      <div className="w-full left-0 top-0 bg-white" style={{ minHeight: '1630px', position: 'relative' }}>
        <div className="w-full h-36 left-0 top-[1490px] absolute bg-black/0">
          <div className="w-64 h-14 left-[115px] top-[67px] absolute bg-black/0">
            <a 
              href="https://www.instagram.com/tummoc/#" 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-14 h-14 left-[205px] top-0 absolute bg-black/0 flex items-center justify-center cursor-pointer"
            >
              <div className="w-12 h-12 bg-cyan-950 rounded-3xl border border-gray-800 flex items-center justify-center">
                <img className="w-8 h-8" src={socialIconNew} />
              </div>
            </a>
            <div className="w-14 h-14 left-[141px] top-0 absolute bg-black/0 flex items-center justify-center cursor-pointer" onClick={() => window.open('https://www.linkedin.com/company/tummoc/', '_blank')}>
              <div className="w-12 h-12 bg-cyan-950 rounded-3xl border border-gray-800 flex items-center justify-center text-white text-2xl font-black font-['Inter']">
                in
              </div>
            </div>
            <div className="w-14 h-14 left-[67px] top-0 absolute bg-black/0 flex items-center justify-center cursor-pointer" onClick={() => window.open('https://x.com/tummoc4u', '_blank')}>
              <div className="w-12 h-12 bg-cyan-950 rounded-3xl border border-gray-800 flex items-center justify-center">
                <img className="w-8 h-8" src={xLogoNew} />
              </div>
            </div>
            <a 
              href="https://www.facebook.com/tummoc4u/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-14 h-14 left-0 top-0 absolute bg-black/0 flex items-center justify-center cursor-pointer"
            >
              <div className="w-12 h-12 bg-cyan-950 rounded-3xl border border-gray-800 flex items-center justify-center text-white text-4xl font-normal font-['Inter']">
                f
              </div>
            </a>
          </div>
          <div className="w-16 h-6 left-[228px] top-[24px] absolute justify-center text-neutral-400 text-xl font-semibold font-['Inter']">v3.6.8</div>
        </div>
        <div className="w-full h-[1440px] left-0 top-0 absolute bg-black/0">
          <div className="w-full h-20 left-0 top-[1350px] absolute bg-black/0 cursor-pointer" onClick={() => handleNavigation('/account-settings')}>
            <div className="w-52 h-8 left-[111px] top-[29px] absolute justify-center text-neutral-600 text-2xl font-bold font-['Inter']">Account Settings</div>
            <img className="w-9 h-10 left-[44px] top-[24px] absolute" src={accountSettingIcon} />
          </div>
          <div className="w-full h-20 left-0 top-[1262px] absolute bg-black/0 cursor-pointer" onClick={() => handleNavigation('/terms-of-use')}>
            <div className="w-48 h-9 left-[111px] top-[26px] absolute justify-center text-neutral-700 text-2xl font-bold font-['Inter']">Terms of Usage</div>
            <img className="w-8 h-10 left-[47px] top-[23px] absolute" src={termsOfUsageIcon} />
          </div>
          <div className="w-full h-20 left-0 top-[1174px] absolute bg-black/0 cursor-pointer" onClick={() => handleNavigation('/privacy-policy')}>
            <div className="w-44 h-9 left-[112px] top-[27px] absolute justify-center text-neutral-700 text-2xl font-bold font-['Inter']">Privacy Policy</div>
            <img className="w-8 h-10 left-[47px] top-[24px] absolute" src={privacyPolicyIcon} />
          </div>
          <div className="w-full h-20 left-0 top-[1086px] absolute bg-black/0 cursor-pointer" onClick={() => handleNavigation('/referrals')}>
            <div className="w-28 h-6 left-[112px] top-[30px] absolute justify-center text-neutral-700 text-2xl font-bold font-['Inter']">Referrals</div>
            <img className="w-10 h-10 left-[43px] top-[24px] absolute" src={referralsIcon} />
          </div>
          <div className="w-full h-20 left-0 top-[998px] absolute bg-black/0 cursor-pointer" onClick={() => handleNavigation('/tummoc-blog')}>
            <div className="w-48 h-9 left-[111px] top-[26px] absolute justify-center text-neutral-700 text-2xl font-bold font-['Inter']">Tummoc Blogs</div>
            <img className="w-10 h-9 left-[43px] top-[24px] absolute" src={tummocBlogIcon} />
          </div>
          <div className="w-full h-20 left-0 top-[910px] absolute bg-black/0 cursor-pointer" onClick={() => handleNavigation('/tummoc-money')}>
            <div className="w-52 h-8 left-[111px] top-[28px] absolute justify-center text-zinc-700 text-2xl font-bold font-['Inter']">Tummoc Money</div>
            <img className="w-9 h-8 left-[45px] top-[25px] absolute" src={tummocMoneyIcon} />
          </div>
          <div className="w-full h-24 left-0 top-[822px] absolute bg-black/0 cursor-pointer" onClick={() => handleNavigation('/city-selection')}>
            <div className="w-36 left-[112px] top-[30px] absolute justify-center text-neutral-700 text-2xl font-bold font-['Inter']">Switch City</div>
            <img className="w-9 h-11 left-[45px] top-[22px] absolute" src={switchCityIcon} />
          </div>
          <div className="w-full h-20 left-0 top-[734px] absolute bg-black/0 cursor-pointer" onClick={() => handleNavigation('/saved-places')}>
            <div className="w-44 h-7 left-[112px] top-[27px] absolute justify-center text-neutral-700 text-2xl font-bold font-['Inter']">Saved Places</div>
            <img className="w-9 h-9 left-[44px] top-[23px] absolute" src={savedPlacesIcon} />
          </div>
          <div className="w-full h-20 left-0 top-[646px] absolute bg-black/0 cursor-pointer" onClick={() => handleNavigation('/language')}>
            <div className="w-60 h-9 left-[117px] top-[27px] absolute justify-center text-zinc-700 text-2xl font-bold font-['Inter']">Change Language</div>
            <img className="w-10 h-11 left-[42px] top-[20px] absolute" src={languageIcon} />
          </div>
          <div className="w-full h-20 left-0 top-[558px] absolute bg-black/0 cursor-pointer" onClick={() => handleNavigation('/contact')}>
            <div className="w-48 left-[112px] top-[29px] absolute justify-center text-neutral-700 text-2xl font-bold font-['Inter']">Help & Support</div>
            <img className="w-10 h-10 left-[43px] top-[23px] absolute" src={helpSupportIcon} />
          </div>
          {/* Personal Profile Section */}
          <div className="w-full left-0 top-[288px] absolute">
            <div className="mx-8 h-[2px] bg-[#e0e0e0]" />
            <div className="flex items-center px-10 py-10 cursor-pointer" onClick={onProfileSelect}>
              <img className="w-20 h-20" src={normalProfileImage} alt="Personal Profile" />
              <span className="ml-4 text-neutral-700 text-[26px] font-bold font-['Inter']">Personal Profile</span>
              <span className="ml-3 px-4 py-0.5 rounded-full text-white text-base font-montserrat-bold font-bold bg-orange-400 -mt-3">New</span>
              <ChevronDown className="ml-auto w-10 h-10 text-black -mt-3" />
            </div>
            <div className="mx-8 h-[2px] bg-[#e0e0e0]" />
          </div>

          <div className="w-full h-24 left-0 top-[470px] absolute bg-black/0 cursor-pointer" onClick={() => handleNavigation('/pass')}>
            <div className="w-36 h-7 left-[113px] top-[34px] absolute justify-center text-neutral-700 text-2xl font-bold font-['Inter']">BMTC Pass</div>
            <img className="w-11 h-11 left-[41px] top-[27px] absolute" src={bmtcPassIcon} />
          </div>
          <div className="w-full h-72 left-0 top-0 absolute bg-black/0">
            <img className="w-14 h-14 left-[430px] top-[192px] absolute rounded-3xl cursor-pointer" src={userProfileImage} onClick={() => handleNavigation('/user-info')} />
            <div className="w-36 h-7 left-[30px] top-[244px] absolute justify-center text-neutral-400 text-2xl font-normal font-['Inter']">{userPhone}</div>
            <div className="w-[385px] h-7 left-[29px] top-[203px] absolute justify-center text-zinc-800 text-3xl font-normal font-['Inter']">{userName}</div>
            <div className="relative w-44 h-44 left-[21px] top-[18px] absolute">
              <img className="w-32 h-32 absolute rounded-[64px] object-cover" style={{left: '16px', top: '24px'}} src={profileImage} />
              <img className="w-44 h-44 absolute" style={{left: '-2.1px', top: '0.2px'}} src={profileRing} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Menu = MenuContent;

export default Menu;
export { MenuContent };
