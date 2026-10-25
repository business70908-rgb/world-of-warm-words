import { Info } from "lucide-react";
import type { PassType } from "@/data/passData";

interface BmtcPassCardProps {
  passName: string;
  passType: PassType;
  totalFare: string;
  position: { top: string; left?: string };
  hasBottomNote?: boolean;
  noteText?: string;
  noteColor?: string;
  animationDelay?: string;
  onInfoClick: () => void;
  onBookPass: () => void;
}

const BmtcPassCard = ({
  passName,
  passType,
  totalFare,
  position,
  hasBottomNote = false,
  noteText,
  noteColor = '#0EA3AB',
  animationDelay = '0s',
  onInfoClick,
  onBookPass
}: BmtcPassCardProps) => {
  const cardHeight = hasBottomNote ? 'h-56' : 'h-48';
  const cardHeightPx = hasBottomNote ? '56' : '44';

  return (
    <div 
      className={`w-[512px] ${cardHeight} absolute bg-black/0 animate-slide-in-down`}
      style={{ 
        top: position.top, 
        left: position.left || '13px',
        animationDelay 
      }}
    >
      <div 
        className={`w-[510px] h-${cardHeightPx} left-[2px] ${hasBottomNote ? 'top-0' : 'top-[4px]'} absolute bg-white ${hasBottomNote ? 'rounded-lg' : 'rounded-tl-lg rounded-tr-[10px] rounded-bl-md rounded-br-md'} border border-gray-200`} 
      />
      
      {/* Bottom Note Section */}
      {hasBottomNote && (
        <>
          <div 
            className="w-[510px] h-[34px] left-[2px] top-[190px] absolute rounded-b-lg" 
            style={{ backgroundColor: '#e1eaff' }} 
          />
          <div 
            className="w-[460px] h-6 left-[25px] top-[193px] absolute justify-center text-lg font-bold font-['Inter'] whitespace-nowrap overflow-hidden" 
            style={{ color: noteColor }}
          >
            {noteText}
          </div>
        </>
      )}

      {/* Book Pass Button */}
      <button 
        className={`w-36 h-12 left-[342px] ${hasBottomNote ? 'top-[112px]' : 'top-[115px]'} absolute rounded-xl text-white text-xl font-semibold`}
        style={{ backgroundColor: '#02B8B8' }}
        onClick={onBookPass}
      >
        Book Pass
      </button>

      {/* Total Fare Label */}
      <div 
        className="absolute justify-center text-zinc-400 text-base font-semibold font-['Inter']"
        style={{
          width: hasBottomNote ? '96px' : '112px',
          height: hasBottomNote ? '20px' : 'auto',
          left: hasBottomNote ? '150px' : '140px',
          top: hasBottomNote ? '127px' : '130px'
        }}
      >
        Total Fare
      </div>

      {/* Price */}
      <div 
        className="absolute flex items-center justify-start gap-2.5 text-gray-800 text-2xl font-semibold font-['Inter']"
        style={{
          width: '120px',
          height: '28px',
          left: hasBottomNote ? '25px' : '26px',
          top: hasBottomNote ? '123px' : '126px'
        }}
      >
        <span className="font-['Arial']">₹</span>
        <span>{totalFare.replace('₹', '').trim()}</span>
      </div>

      {/* Pass Type Badge */}
      <div 
        className="absolute bg-black/0"
        style={{
          width: passType === 'AC' ? '56px' : '112px',
          height: '40px',
          left: hasBottomNote ? '21px' : '22px',
          top: hasBottomNote ? '57px' : '60px'
        }}
      >
        <div 
          className={`h-8 left-[4px] absolute flex items-center justify-center ${passType === 'AC' ? 'rounded-[9.50px] border border-stone-200' : 'rounded-[10px] border border-lime-50'}`}
          style={{ 
            backgroundColor: '#DCEAC3',
            width: passType === 'AC' ? '48px' : '96px',
            top: hasBottomNote ? '5px' : '4px'
          }} 
        />
        <div 
          className="h-5 absolute flex items-center justify-center text-lg font-bold font-['Inter']"
          style={{ 
            color: '#628524',
            width: passType === 'AC' ? '28px' : '80px',
            left: '15px',
            top: hasBottomNote ? '11px' : '10px'
          }}
        >
          {passType}
        </div>
      </div>

      {/* Info Icon */}
      <Info 
        className={`w-6 h-6 left-[460px] ${hasBottomNote ? 'top-[19px]' : 'top-[23px]'} absolute cursor-pointer text-gray-600`}
        onClick={onInfoClick}
      />

      {/* Pass Name */}
      <div 
        className={`absolute justify-center text-gray-800 font-semibold font-['Inter'] whitespace-nowrap overflow-hidden ${hasBottomNote ? 'text-2xl' : 'text-xl'}`}
        style={{
          width: '420px',
          height: '32px',
          left: hasBottomNote ? '25px' : '27px',
          top: hasBottomNote ? '18px' : '20px'
        }}
      >
        {passName}
      </div>
    </div>
  );
};

export default BmtcPassCard;
