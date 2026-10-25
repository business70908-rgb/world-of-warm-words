import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import tickMark from '@/assets/tick-mark.png';
import backArrow from '@/assets/back-arrow.png';
import backgroundImage from '@/assets/4e.png';
import { MobileContainer } from '@/components/MobileContainer';

const Language = () => {
  const navigate = useNavigate();
  const [selectedLanguage, setSelectedLanguage] = useState<string>('English');

  const languages = [
    { name: 'English', displayName: 'English - English', nativeText: 'English' },
    { name: 'Kannada', displayName: 'Kannada -', nativeText: 'ಕನ್ನಡ' },
    { name: 'Hindi', displayName: 'Hindi -', nativeText: 'हिंदी' }
  ];

  const handleLanguageSelect = (languageName: string) => {
    setSelectedLanguage(languageName);
  };

  const handleContinue = () => {
    localStorage.setItem('selectedLanguage', selectedLanguage);
    navigate('/', { replace: true });
  };

  return (
    <MobileContainer width={718} height={1440}>
      <div className="w-[718px] h-[1440px] left-0 top-0 absolute bg-black/0">
        <div 
          className="w-[718px] h-[1440px] left-0 top-0 absolute bg-cover bg-center bg-no-repeat" 
          style={{ backgroundImage: `url(${backgroundImage})` }}
        />
        <div className="w-[718px] h-[816px] left-0 top-[624px] absolute bg-black/0">
          <div className="w-[639px] h-24 left-[39px] top-[681px] absolute bg-black/0 cursor-pointer" onClick={handleContinue}>
            <div className="w-[631px] h-20 left-[5px] top-[6px] absolute bg-teal-950 rounded-xl border border-slate-800" />
            <div className="w-36 left-[248px] top-[30px] absolute justify-center text-3xl font-bold font-['Inter']" style={{ color: '#fefefd' }}>Continue</div>
          </div>
        </div>
        <div className="w-[718px] h-[618px] left-0 top-0 absolute bg-black/0">
          {/* Hindi */}
          <div className="w-[627px] h-28 left-[44px] top-[510px] absolute bg-black/0 cursor-pointer" onClick={() => handleLanguageSelect('Hindi')}>
            <div 
              className="w-[614px] h-24 left-[8px] top-[6px] absolute rounded-xl border-2 border-neutral-200"
              style={{ backgroundColor: selectedLanguage === 'Hindi' ? '#eeffef' : 'white' }}
            />
            <div className="w-[621px] h-24 left-[3px] top-[3px] absolute bg-black/0">
              {selectedLanguage === 'Hindi' && (
                <img className="w-4 h-4 left-[580px] top-[40px] absolute" src={tickMark} alt="Selected" />
              )}
              <div className="w-14 h-9 left-[145px] top-[32px] absolute flex items-center justify-center text-gray-600 text-xl font-normal">हिंदी</div>
              <div className={`w-24 h-10 left-[35px] top-[29px] absolute justify-center text-gray-600 text-3xl ${selectedLanguage === 'Hindi' ? 'font-bold' : 'font-normal'} font-['Inter']`}>Hindi -</div>
            </div>
          </div>
          
          {/* Kannada */}
          <div className="w-[626px] h-28 left-[45px] top-[393px] absolute bg-black/0 cursor-pointer" onClick={() => handleLanguageSelect('Kannada')}>
            <div 
              className="w-[614px] h-24 left-[7px] top-[6px] absolute rounded-[10px] border-2 border-neutral-200"
              style={{ backgroundColor: selectedLanguage === 'Kannada' ? '#eeffef' : 'white' }}
            />
            <div className="w-[620px] h-24 left-[3px] top-[3px] absolute bg-black/0">
              {selectedLanguage === 'Kannada' && (
                <img className="w-4 h-4 left-[580px] top-[40px] absolute" src={tickMark} alt="Selected" />
              )}
              <div className="w-16 h-10 left-[210px] top-[35px] absolute flex items-center justify-center text-gray-700 text-2xl font-normal">ಕನ್ನಡ</div>
              <div className={`w-44 h-10 left-[34px] top-[29px] absolute justify-center text-gray-700 text-4xl ${selectedLanguage === 'Kannada' ? 'font-bold' : 'font-normal'} font-['Inter']`}>Kannada -</div>
            </div>
          </div>
          
          {/* English */}
          <div className="w-[627px] h-24 left-[43px] top-[279px] absolute bg-black/0 cursor-pointer" onClick={() => handleLanguageSelect('English')}>
            <div 
              className="w-[614px] h-24 left-[8px] top-[5px] absolute rounded-tl-md rounded-tr-[10px] rounded-bl-md rounded-br-[3px] border-2 border-neutral-200"
              style={{ backgroundColor: selectedLanguage === 'English' ? '#eeffef' : 'white' }}
            />
            <div className="w-[627px] h-24 left-[2px] top-[5px] absolute bg-black/0">
              {selectedLanguage === 'English' && (
                <img className="w-4 h-4 left-[580px] top-[40px] absolute" src={tickMark} alt="Selected" />
              )}
              <div className={`w-64 h-11 left-[37px] top-[27px] absolute justify-center text-gray-600 text-3xl ${selectedLanguage === 'English' ? 'font-bold' : 'font-normal'} font-['Inter']`}>English - English</div>
            </div>
          </div>
          
          <div className="w-[530px] h-10 left-[97px] top-[207px] absolute justify-center text-neutral-400 text-3xl font-normal font-['Inter']">Please select language and continue</div>
          <div className="w-[578px] h-12 left-[73px] top-[149px] absolute justify-center text-gray-700 text-4xl font-normal font-['Inter']">Choose your preferred language</div>
          <div className="w-[718px] h-20 left-0 top-[16px] absolute bg-black/0">
            <div className="w-72 h-11 left-[109px] top-[25px] absolute justify-center text-gray-600 text-4xl font-normal font-['Inter']">Choose Language</div>
            <img className="w-7 h-7 left-[45px] top-[31px] absolute cursor-pointer" src={backArrow} onClick={() => navigate(-1)} />
          </div>
        </div>
      </div>
    </MobileContainer>
  );
};

export default Language;