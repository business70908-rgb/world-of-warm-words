import emptyStateImage from '@/assets/2b.png';
import customIcon from '@/assets/custom-icon.png';
import { useNavigate } from 'react-router-dom';

interface EmptyStateProps {
  type?: 'passes' | 'trips';
  showPurchaseSection?: boolean;
  showEmptyMessage?: boolean;
}

const EmptyState = ({ 
  type = 'passes', 
  showPurchaseSection = true, 
  showEmptyMessage = true 
}: EmptyStateProps) => {
  const navigate = useNavigate();
  const isTrips = type === 'trips';
  
  return (
    <div className="w-[540px] h-[401px] relative">
      <div className="w-[540px] h-[401px] left-0 top-0 absolute">
        {showPurchaseSection && !isTrips && (
          <>
            <div className="w-[505px] h-[75px] left-[17px] top-[311px] absolute">
              <div className="w-[496px] h-[67px] left-[5px] top-[4px] absolute bg-[#5bc0de] rounded-[7px] border border-[#5bc0de] cursor-pointer" onClick={() => navigate('/bmtc-pass')}></div>
              <div className="w-[159px] h-[26px] left-[199px] absolute flex justify-center items-center text-[19.30px] font-inter font-bold cursor-pointer" style={{color: '#fefefd', top: '24.5px'}} onClick={() => navigate('/bmtc-pass')}>Book a new pass</div>
              <img className="w-[40px] h-[40px] left-[149px] absolute cursor-pointer" style={{top: '17.5px'}} src={customIcon} alt="Custom icon" onClick={() => navigate('/bmtc-pass')} />
            </div>
            <div className="w-[144px] h-[2px] left-[396px] top-[278px] absolute" style={{backgroundColor: '#ebeaea'}}></div>
            <div className="w-[229px] h-[25px] left-[156px] top-[267px] absolute flex justify-center items-center text-[#81898B] text-[17.40px] font-inter font-normal">Looking for pass purchase?</div>
            <div className="w-[145px] h-[2px] left-0 top-[278px] absolute" style={{backgroundColor: '#ebeaea'}}></div>
          </>
        )}
        {showEmptyMessage && (
          <>
            <div className="w-[246px] h-[24px] left-[147px] top-[216px] absolute flex justify-center items-center text-[#B0B0B0] text-[17.30px] font-inter font-normal">
              {isTrips ? "Couldn't find any trips history" : "Couldn't find any passes here"}
            </div>
            <div className="w-[123px] h-[28px] left-[210px] top-[174px] absolute flex justify-center items-center text-[#4C585B] text-[24.60px] font-inter font-normal">&quot; Uh - oh &quot;</div>
            <img className="w-[185px] h-[75px] left-[178px] top-[70px] absolute" src={emptyStateImage} alt="Empty state" />
          </>
        )}
      </div>
    </div>
  );
};

export default EmptyState;