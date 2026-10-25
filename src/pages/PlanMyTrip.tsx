import { useNavigate, useSearchParams } from "react-router-dom";
import { useState, useRef } from "react";
import newBackArrow from "@/assets/new-back-arrow.png";
import { MobileContainer } from "@/components/MobileContainer";
import AllInOne from "./AllInOne";
import RedBus from "./RedBus";

const PlanMyTrip = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') === 'outstation' ? 'outstation' : 'within';
  const [activeTab, setActiveTab] = useState<'within' | 'outstation'>(initialTab);
  const touchStartX = useRef<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const diff = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(diff) > 60) {
      setActiveTab(diff < 0 ? 'outstation' : 'within');
    }
    touchStartX.current = null;
  };
  return (
    <MobileContainer width={706} height={1440}>
      <div className="w-[706px] h-[1440px] relative bg-white flex flex-col">
        {/* Header */}
        <div className="w-[706px] bg-teal-950 header-teal-fix shrink-0">
          {/* Header */}
          <div className="flex items-center px-6 py-6">
            <img
              className="w-7 h-7 cursor-pointer"
              src={newBackArrow}
              onClick={() => navigate(-1)}
              alt="Back"
            />
            <div className="ml-8 text-3xl font-normal font-['Montserrat'] tracking-normal" style={{ color: '#fefefd' }}>
              Plan my trip
            </div>
          </div>

          {/* Tabs */}
          <div className="flex">
            <div
              className="flex-1 text-center py-3 cursor-pointer text-2xl font-['Inter'] transition-colors"
              style={{ color: activeTab === 'within' ? '#fefefd' : '#9ca3af' }}
              onClick={() => setActiveTab('within')}
            >
              Within City
            </div>
            <div
              className="flex-1 text-center py-3 cursor-pointer text-2xl font-['Inter'] transition-colors"
              style={{ color: activeTab === 'outstation' ? '#fefefd' : '#9ca3af' }}
              onClick={() => setActiveTab('outstation')}
            >
              Outstation
            </div>
          </div>
          {/* Highlight bar */}
          <div className="relative h-1">
            <div
              className="absolute h-1 w-1/2 transition-transform duration-300"
              style={{
                backgroundColor: '#bdd78e',
                transform: activeTab === 'within' ? 'translateX(0)' : 'translateX(100%)',
              }}
            />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'none' }} onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
          {activeTab === 'within' ? (
            <AllInOne embedded />
          ) : (
            <RedBus embedded />
          )}
        </div>
      </div>
    </MobileContainer>
  );
};

export default PlanMyTrip;
