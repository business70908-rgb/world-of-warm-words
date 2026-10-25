import { useNavigate } from "react-router-dom";
import { useState, useRef } from "react";
import plusIcon from "@/assets/plus-icon.png";
import locationIcon from "@/assets/location-icon.png";
import heartIcon from "@/assets/heart-icon.png";
import newBackArrow from "@/assets/new-back-arrow.png";
import { MobileContainer } from "@/components/MobileContainer";

const SavedPlaces = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'routes' | 'locations'>('routes');
  const touchStartX = useRef<number>(0);
  const touchEndX = useRef<number>(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    touchEndX.current = e.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX.current;
    if (Math.abs(diff) > 50) {
      setActiveTab(diff > 0 ? 'locations' : 'routes');
    }
  };

  return (
    <MobileContainer width={710} height={1440}>
      <div className="w-[710px] h-[1440px] left-0 top-0 absolute bg-black/0">
        <img className="w-[710px] h-[1440px] left-0 top-0 absolute" src="https://placehold.co/710x1440" />
        <div className="w-[710px] h-[1243px] left-0 top-[196px] absolute" style={{backgroundColor: '#e5e5e5'}} onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
          <div className="w-[661px] h-24 left-[24px] top-[1125px] absolute bg-black/0">
            <div className="w-[653px] h-20 left-[5px] top-[6px] absolute bg-teal-950 rounded-xl border border-slate-800 flex items-center justify-center gap-3">
              <img className="w-5 h-5" src={plusIcon} alt="Plus icon" />
              <div className="text-2xl font-normal font-['Inter'] whitespace-nowrap" style={{color: '#fefefd'}}>
                {activeTab === 'routes' ? 'Add more route' : 'Add more location'}
              </div>
            </div>
          </div>
          <div className="w-48 h-6 left-[30px] top-[30px] absolute justify-center text-neutral-600 text-2xl font-normal font-['Inter'] whitespace-nowrap">
            {activeTab === 'routes' ? 'Saved routes' : 'Saved locations'}
          </div>
        </div>
        <div className="w-[710px] h-20 left-0 top-[109px] absolute" style={{backgroundColor: '#fefefd'}}>
          <div 
            className={`w-44 h-7 left-[475px] top-[29px] absolute justify-center text-2xl font-normal font-['Inter'] cursor-pointer ${activeTab === 'locations' ? 'text-zinc-600' : 'text-zinc-400'}`}
            onClick={() => setActiveTab('locations')}
          >
            Saved locations
          </div>
          <img className="w-10 h-10 left-[418px] top-[22px] absolute rounded-[20.75px]" src={locationIcon} />
          <div 
            className={`w-36 h-6 left-[134px] top-[30px] absolute justify-center text-2xl font-normal font-['Inter'] cursor-pointer ${activeTab === 'routes' ? 'text-zinc-600' : 'text-zinc-400'}`}
            onClick={() => setActiveTab('routes')}
          >
            Saved routes
          </div>
          <img className="w-10 h-10 left-[76px] top-[21px] absolute" src={heartIcon} />
        </div>
        {/* Underline for active tab */}
        <div 
          className="h-[10px] left-0 top-[188px] absolute transition-all duration-300"
          style={{
            width: activeTab === 'routes' ? '355px' : '355px',
            backgroundColor: '#bdd78e',
            transform: activeTab === 'routes' ? 'translateX(0px)' : 'translateX(355px)'
          }}
        />
        
        <div className="w-[710px] h-28 left-0 top-0 absolute bg-teal-950 header-teal-fix">
          <div className="w-[710px] h-24 left-0 top-[11px] absolute bg-black/0">
            <div className="w-52 h-11 left-[132px] top-[27px] absolute justify-center text-4xl font-normal font-['Inter']" style={{color: '#fefefd'}}>My Favorites</div>
            <img 
              className="w-7 h-7 left-[36px] top-[32px] absolute cursor-pointer" 
              src={newBackArrow} 
              onClick={() => navigate(-1)}
              alt="Back"
            />
          </div>
        </div>
      </div>
    </MobileContainer>
  );
};

export default SavedPlaces;