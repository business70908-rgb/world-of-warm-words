import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import backArrow from "@/assets/new-back-arrow.png";
import helpIcon from "@/assets/1h.png";
import kyIcon from "@/assets/Ky-new.png";
import customIcon from "@/assets/custom-icon.png";
import background4e from "@/assets/4e.png";
import { AdBanner } from "@/components/AdBanner";
import { MobileContainer } from "@/components/MobileContainer";
import BmtcPassCard from "@/components/BmtcPassCard";
import PassFareDialog from "@/components/PassFareDialog";
import { getPassesByCategory, type PassInfo } from "@/data/passData";

const tabs: Array<'all' | 'daily' | 'weekly' | 'monthly'> = ['all', 'daily', 'weekly', 'monthly'];

const BmtcPass = () => {
  const navigate = useNavigate();
  const [selectedPass, setSelectedPass] = useState<'all' | 'daily' | 'weekly' | 'monthly'>('all');
  const [showFareDialog, setShowFareDialog] = useState(false);
  const [selectedPassInfo, setSelectedPassInfo] = useState<PassInfo | null>(null);

  const handleInfoClick = (passInfo: PassInfo) => {
    setSelectedPassInfo(passInfo);
    setShowFareDialog(true);
  };

  const handleBookPass = (passName: string, passType: 'AC' | 'Ordinary') => {
    const currentDate = new Date();
    let validFromDate = new Date(currentDate);
    validFromDate.setHours(0, 0, 0, 0);
    
    let validTillDate = new Date(validFromDate);

    if (passName.includes('Day Pass')) {
      validTillDate = new Date(validFromDate);
    } else if (passName.includes('Weekly Pass')) {
      validTillDate.setDate(validFromDate.getDate() + 6);
    } else if (passName.includes('Monthly Pass') || 
               passName === 'Vayu Vajra Gold Pass' || 
               passName === 'Vajra Gold Monthly Pass') {
      validTillDate.setMonth(validFromDate.getMonth() + 1);
      validTillDate.setDate(validFromDate.getDate() - 1);
    }
    
    validTillDate.setHours(23, 59, 59, 999);

    const passData = {
      name: passName,
      type: passType,
      validFrom: validFromDate.toISOString(),
      validTill: validTillDate.toISOString()
    };

    localStorage.setItem('selectedPass', JSON.stringify(passData));
    navigate('/identity');
  };

  const getPageHeight = () => {
    if (selectedPass === 'monthly') return 'h-[1962px]';
    if (selectedPass === 'all') return 'h-[3349px]';
    if (selectedPass === 'daily') return 'h-[1344px]';
    return 'h-[1290px]';
  };

  const passes = getPassesByCategory(selectedPass);

  // Position mapping for different tabs
  const getPassPosition = (index: number) => {
    const basePositions = {
      daily: ['94px', '298px', '556px'],
      weekly: ['94px', '298px', '502px'],
      monthly: ['94px', '306px', '550px', '794px', '1006px', '1218px'],
      all: ['94px', '310px', '558px', '770px', '982px', '1240px', '1498px', '1710px', '1924px', '2138px', '2350px', '2562px']
    };

    const positions = basePositions[selectedPass] || [];
    return { top: positions[index] || '94px' };
  };

  const getAnimationDelay = (index: number) => {
    return index > 0 ? `${index * 0.1}s` : '0s';
  };

  const getPoweredByPosition = () => {
    const positions = {
      daily: '970px',
      weekly: '875px',
      monthly: '1583px',
      all: '2944px'
    };
    return positions[selectedPass];
  };

  const getBookedSectionPosition = () => {
    const positions = {
      daily: { line: '830px', text: '819px', button: '862px' },
      weekly: { line: '736px', text: '725px', button: '768px' },
      monthly: { line: '1441px', text: '1430px', button: '1472px' },
      all: { line: '2802px', text: '2791px', button: '2833px' }
    };
    return positions[selectedPass];
  };

  const bookedSection = getBookedSectionPosition();

  return (
    <MobileContainer width={540} height={1090}>
      <div 
        className="w-[540px] h-[1090px] relative bg-black/0 overflow-y-auto scrollbar-hide"
        style={{
          backgroundImage: `url(${background4e})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        <div className={`w-[540px] ${getPageHeight()} left-0 top-0 absolute bg-black/0`}>
          <div className="w-[540px] h-[1013px] left-0 top-[84px] absolute bg-black/0">
            {/* Fixed Help Banner */}
            <div 
              className="fixed bottom-0 left-0 w-[540px] h-20 z-50 cursor-pointer" 
              style={{ backgroundColor: '#fefefd' }}
              onClick={() => navigate('/help')}
            >
              <div className="w-96 h-6 left-[78px] top-[44px] absolute justify-center text-gray-500 text-lg font-normal font-['Inter']">Report an issue or suggest an improvement</div>
              <div className="w-44 h-6 left-[78px] top-[18px] absolute justify-center text-gray-500 text-base font-semibold font-['Inter']">Help other travellers</div>
              <img className="w-10 h-10 left-[20px] top-[21px] absolute rounded-[20.50px]" src={helpIcon} />
            </div>

            {/* Fixed Ad Banner */}
            <div className="fixed bottom-20 left-0 w-[540px] h-36 z-40">
              <AdBanner hideIcons={true} />
            </div>

            {/* Pass Cards */}
            {passes.map((pass, index) => (
              <BmtcPassCard
                key={`${selectedPass}-${pass.id}-${index}`}
                passName={pass.name}
                passType={pass.type}
                totalFare={pass.totalFare}
                position={getPassPosition(index)}
                hasBottomNote={pass.hasBottomNote}
                noteText={pass.noteText}
                noteColor={pass.noteColor}
                animationDelay={getAnimationDelay(index)}
                onInfoClick={() => handleInfoClick(pass)}
                onBookPass={() => handleBookPass(pass.name, pass.type)}
              />
            ))}

            {/* Booked Already Section */}
            <div className="w-40 h-[3px] left-0 absolute" style={{ backgroundColor: '#e6e6e6', top: bookedSection.line }}></div>
            <div className="w-48 h-6 left-[180px] absolute justify-center text-gray-800 text-lg font-bold font-['Inter']" style={{ top: bookedSection.text }}>Booked a pass already?</div>
            <div className="w-40 h-[3px] left-[381px] absolute" style={{ backgroundColor: '#e6e6e6', top: bookedSection.line }}></div>

            <div className="w-[504px] h-20 left-[17px] absolute bg-black/0" style={{ top: bookedSection.button }}>
              <div 
                className="w-[496px] h-16 left-[5px] top-[5px] absolute bg-teal-950 rounded-md border border-slate-800 cursor-pointer" 
                onClick={() => navigate('/pass')}
              />
              <div className="w-48 h-6 left-[184px] top-[26px] absolute justify-center text-white text-xl font-bold font-['Inter'] pointer-events-none">Go to booked passes</div>
              <img className="w-8 h-8 left-[142px] top-[21px] absolute pointer-events-none" src={customIcon} />
            </div>

            {/* Powered by BMTC */}
            <img className="w-8 h-8 left-[328px] absolute" style={{ top: getPoweredByPosition() }} src={kyIcon} />
            <div className="w-44 h-5 left-[180px] absolute justify-center text-gray-800 text-base font-bold font-['Inter']" style={{ top: `calc(${getPoweredByPosition()} + 7px)` }}>Powered by BMTC</div>
            
            <div className="w-[540px] h-16 left-0 top-0 absolute" style={{ backgroundColor: '#fefefd' }} />
          </div>

          {/* Header */}
          <div className="w-[540px] h-20 left-0 top-0 fixed bg-black/0 z-50">
            <div className="w-[540px] h-20 left-0 top-0 absolute bg-teal-950 header-teal-fix" />
            <div className="w-[540px] h-20 left-0 top-[11px] absolute bg-black/0">
              <div className="w-56 h-7 left-[77px] top-[17px] absolute justify-center text-2xl font-normal font-['Inter']" style={{ color: '#FEFEFE' }}>Select pass category</div>
              <img className="w-6 h-7 left-[27px] top-[19px] absolute cursor-pointer" src={backArrow} onClick={() => navigate(-1)} />
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="w-[540px] h-16 left-0 fixed bg-black/0 z-40" style={{ top: '76px' }}>
            <div className="w-[540px] h-16 left-0 top-[4px] absolute bg-black/0 relative" style={{ backgroundColor: '#fefefd' }}>
              <div className="w-56 h-12 left-[352px] top-[7px] absolute bg-black/0">
                <div className="w-52 h-11 left-[1px] top-[3px] absolute bg-black/0 cursor-pointer" onClick={() => setSelectedPass('monthly')}>
                  <div className={`w-48 h-6 left-[20px] top-[8px] absolute justify-center text-xl font-medium font-['Inter'] ${selectedPass === 'monthly' ? 'text-gray-800' : 'text-gray-400'}`}>Monthly Pass</div>
                </div>
              </div>
              <div className="w-40 h-14 left-[219px] top-[6px] absolute bg-black/0">
                <div className="w-36 h-6 left-[15px] top-[12px] absolute cursor-pointer" onClick={() => setSelectedPass('weekly')}>
                  <div className={`justify-center text-xl font-medium font-['Inter'] ${selectedPass === 'weekly' ? 'text-gray-800' : 'text-gray-400'}`}>Weekly Pass</div>
                </div>
              </div>
              <div className="w-44 h-14 left-[94px] top-[4px] absolute bg-black/0">
                <div className="w-36 h-6 left-[22px] top-[15px] absolute cursor-pointer" onClick={() => setSelectedPass('daily')}>
                  <div className={`justify-center text-xl font-medium font-['Inter'] whitespace-nowrap ${selectedPass === 'daily' ? 'text-gray-800' : 'text-gray-400'}`}>Daily Pass</div>
                </div>
              </div>
              <div className="w-12 h-5 left-[38px] top-[18px] absolute">
                <div className="cursor-pointer" onClick={() => setSelectedPass('all')}>
                  <div className={`justify-center text-xl font-medium font-['Inter'] ${selectedPass === 'all' ? 'text-gray-800' : 'text-zinc-400'}`}>All</div>
                </div>
              </div>
              
              {/* Tab Underlines */}
              {selectedPass === 'all' && <div className="absolute bottom-[-4px] left-0 w-[97px] h-1 rounded-full" style={{ backgroundColor: '#bfd595' }}></div>}
              {selectedPass === 'daily' && <div className="absolute bottom-[-4px] left-[90px] w-[130px] h-1 rounded-full" style={{ backgroundColor: '#bfd595' }}></div>}
              {selectedPass === 'weekly' && <div className="absolute bottom-[-4px] left-[220px] w-[140px] h-1 rounded-full" style={{ backgroundColor: '#bfd595' }}></div>}
              {selectedPass === 'monthly' && <div className="absolute bottom-[-4px] left-[345px] w-[195px] h-1 rounded-full" style={{ backgroundColor: '#bfd595' }}></div>}
            </div>
          </div>
        </div>

        {/* Fare Dialog */}
        <PassFareDialog 
          isOpen={showFareDialog} 
          onClose={() => setShowFareDialog(false)} 
          passInfo={selectedPassInfo} 
        />
      </div>
    </MobileContainer>
  );
};

export default BmtcPass;
