import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { Check } from "lucide-react";
import qQImage from "@/assets/qQ.png";
import backArrowImage from "@/assets/back-arrow.png";
import voteNowIcon from "@/assets/vote-now-icon.png";
import { MobileContainer } from '@/components/MobileContainer';

const VoteNow = () => {
  const navigate = useNavigate();
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  const [showPopup, setShowPopup] = useState(false);

  const toggleFeature = (feature: string) => {
    setSelectedFeatures(prev => 
      prev.includes(feature) 
        ? prev.filter(f => f !== feature)
        : [...prev, feature]
    );
  };

  const handleSubmitVote = () => {
    if (selectedFeatures.length === 0) return;
    
    setShowPopup(true);

    setTimeout(() => {
      navigate('/', { replace: true });
    }, 1000);
  };
  
  return (
    <MobileContainer width={540} height={1090}>
      <div className="w-[540px] h-[1090px] relative overflow-hidden mx-auto" style={{backgroundColor: '#feffff'}}>
      <div className="w-[540px] h-[1090px] left-0 top-0 absolute" style={{backgroundColor: '#feffff'}}>
        <div className="w-[540px] h-[1090px] left-0 top-0 absolute" style={{backgroundColor: '#feffff'}}>
          {/* Success Popup */}
          {showPopup && (
            <div className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-[505px] h-[120px] bg-black rounded-t-lg flex items-center justify-center z-50 animate-slide-up">
              <div className="text-white text-2xl font-normal font-['Inter'] text-center leading-tight px-6">
                Thank you! Vote Submitted<br/>Successfully
              </div>
            </div>
          )}
          <div className="w-[540px] h-24 left-0 top-[976px] absolute" style={{backgroundColor: '#feffff'}}>
            <div 
              className={`w-[505px] h-20 left-[17px] top-[10px] absolute ${selectedFeatures.length > 0 ? 'cursor-pointer' : 'cursor-not-allowed'}`}
              style={{backgroundColor: '#feffff'}}
              onClick={handleSubmitVote}
            >
              <div className={`w-[496px] h-20 left-[5px] top-[5px] absolute rounded-md ${selectedFeatures.length > 0 ? 'bg-teal-950' : 'bg-neutral-200'}`} />
              <div className={`w-36 h-7 left-[182px] top-[27px] absolute justify-center text-2xl font-normal font-['Inter'] ${selectedFeatures.length > 0 ? 'text-white' : 'text-neutral-400'}`}>Submit Vote</div>
            </div>
          </div>
          <div className="w-[540px] h-96 left-0 top-[346px] absolute" style={{backgroundColor: '#feffff'}}>
            <div className="w-[540px] h-96 left-0 top-0 absolute" style={{backgroundColor: '#feffff'}}>
              <div className="w-[540px] h-96 left-0 top-0 absolute" style={{backgroundColor: '#feffff'}} />
              <div className="w-[540px] h-24 left-0 top-[310px] absolute" style={{backgroundColor: '#feffff'}}>
                <div 
                  className={`w-6 h-6 left-[478px] top-[41px] absolute border-2 border-black cursor-pointer flex items-center justify-center ${selectedFeatures.includes('live-tracking') ? 'bg-black' : 'bg-white'}`}
                  onClick={() => toggleFeature('live-tracking')}
                >
                  {selectedFeatures.includes('live-tracking') && <Check className="w-4 h-4 text-white" />}
                </div>
                <div className="w-72 h-5 left-[82px] top-[50px] absolute justify-center text-zinc-400 text-base font-normal font-['Inter']">Get live bus tracking from Tummoc App</div>
                <div className="w-40 h-6 left-[83px] top-[22px] absolute justify-center text-neutral-500 text-xl font-normal font-['Inter']">Live Bus Tracking</div>
                <img className="w-14 h-14 left-[16px] top-[21px] absolute rounded-3xl" src={voteNowIcon} alt="Live bus tracking icon" />
              </div>
              <div className="w-[540px] h-24 left-0 top-[217px] absolute" style={{backgroundColor: '#feffff'}}>
                <div 
                  className={`w-6 h-6 left-[478px] top-[35px] absolute border-2 border-black cursor-pointer flex items-center justify-center ${selectedFeatures.includes('bus-alert') ? 'bg-black' : 'bg-white'}`}
                  onClick={() => toggleFeature('bus-alert')}
                >
                  {selectedFeatures.includes('bus-alert') && <Check className="w-4 h-4 text-white" />}
                </div>
                <div className="w-48 h-5 left-[82px] top-[44px] absolute justify-center text-zinc-400 text-sm font-normal font-['Inter']">Get bus alert for your stop</div>
                <div className="w-44 h-6 left-[83px] top-[16px] absolute justify-center text-zinc-500 text-xl font-normal font-['Inter']">My Bus Stop Alert</div>
                <img className="w-14 h-14 left-[17px] top-[15px] absolute rounded-3xl" src={voteNowIcon} alt="Bus stop alert icon" />
              </div>
              <div className="w-[540px] h-24 left-0 top-[115px] absolute" style={{backgroundColor: '#feffff'}}>
                <div 
                  className={`w-6 h-6 left-[478px] top-[38px] absolute border-2 border-black cursor-pointer flex items-center justify-center ${selectedFeatures.includes('crowd-level') ? 'bg-black' : 'bg-white'}`}
                  onClick={() => toggleFeature('crowd-level')}
                >
                  {selectedFeatures.includes('crowd-level') && <Check className="w-4 h-4 text-white" />}
                </div>
                <div className="w-80 h-11 left-[82px] top-[44px] absolute justify-center text-zinc-400 text-base font-normal font-['Inter'] leading-tight">Get bus crowd level information from Tummoc<br/>App</div>
                <div className="w-40 h-6 left-[83px] top-[18px] absolute justify-center text-zinc-500 text-xl font-normal font-['Inter']">Bus Crowd Level</div>
                <img className="w-14 h-14 left-[17px] top-[18px] absolute rounded-3xl" src={voteNowIcon} alt="Bus crowd level icon" />
              </div>
              <div className="w-[527px] h-24 left-0 top-[13px] absolute" style={{backgroundColor: '#feffff'}}>
                <div 
                  className={`w-6 h-6 left-[478px] top-[41px] absolute border-2 border-black cursor-pointer flex items-center justify-center ${selectedFeatures.includes('ticketing') ? 'bg-black' : 'bg-white'}`}
                  onClick={() => toggleFeature('ticketing')}
                >
                  {selectedFeatures.includes('ticketing') && <Check className="w-4 h-4 text-white" />}
                </div>
                <div className="w-96 h-5 left-[82px] top-[50px] absolute justify-center text-zinc-400 text-sm font-normal font-['Inter']">Get bus metro, ticket and pass from Tummoc App</div>
                <div className="w-52 h-6 left-[83px] top-[21px] absolute justify-center text-gray-600 text-xl font-normal font-['Inter']">Bus & Metro Ticketing</div>
                <img className="w-14 h-14 left-[17px] top-[21px] absolute rounded-3xl" src={voteNowIcon} alt="Bus and metro ticketing icon" />
              </div>
            </div>
          </div>
          <div className="w-[540px] h-[3px] left-0 top-[314px] absolute" style={{backgroundColor: '#98C741'}} />
          <div className="w-[540px] h-60 left-0 top-[71px] absolute" style={{backgroundColor: '#feffff'}}>
            <div className="w-[480px] h-12 left-[30px] top-[174px] absolute text-center justify-center text-gray-500 text-xl font-normal font-['Inter'] leading-snug">Let us know the features that matter to you the<br/>most</div>
            <div className="w-52 h-36 left-[165px] top-[10px] absolute" style={{backgroundColor: '#feffff'}}>
              <img className="w-40 h-32 left-[24px] top-[11px] absolute" src={qQImage} alt="Voting mascot" />
            </div>
          </div>
        </div>
        <div className="w-[540px] h-16 left-0 top-0 absolute" style={{backgroundColor: '#feffff'}}>
          <img 
            className="w-6 h-5 left-[27px] top-[22px] absolute cursor-pointer" 
            src={backArrowImage} 
            alt="Back arrow" 
            onClick={() => navigate(-1)}
          />
        </div>
      </div>
      </div>
    </MobileContainer>
  );
};

export default VoteNow;