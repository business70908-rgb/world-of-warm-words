import { Card } from "@/components/ui/card";
import { useState, useRef, useEffect } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface PassCardProps {
  passType: 'Ordinary' | 'AC';
  passCategory: 'Daily' | 'Weekly' | 'Monthly';
  passName: string;
  amount: string;
  validTill: string;
  isExpired?: boolean;
  onArrowClick?: () => void;
  colorTheme?: 'black' | 'blue';
  onColorChange?: (color: 'black' | 'blue') => void;
  onDelete?: () => void;
  onExpire?: () => void;
  onRenew?: () => void;
  showRenewOption?: boolean;
}

const PassCard = ({ 
  passType, 
  passCategory, 
  passName, 
  amount, 
  validTill, 
  isExpired = false, 
  onArrowClick,
  colorTheme = 'black',
  onColorChange,
  onDelete,
  onExpire,
  onRenew,
  showRenewOption = false
}: PassCardProps) => {
  const [showMenu, setShowMenu] = useState(false);
  const [longPressTimer, setLongPressTimer] = useState<ReturnType<typeof setTimeout> | null>(null);

  // Determine background gradient based on color theme
  const backgroundStyle = isExpired 
    ? 'bg-gray-400' 
    : colorTheme === 'black'
      ? '' 
      : 'bg-gradient-to-r from-teal-700 to-teal-600';
  
  const inlineStyle = !isExpired && colorTheme === 'black'
    ? { background: 'linear-gradient(to right, #012f42, #087a85)' }
    : {};

  const handleLongPressStart = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    const timer = setTimeout(() => {
      setShowMenu(true);
    }, 500); // 500ms long press duration
    setLongPressTimer(timer);
  };

  const handleLongPressEnd = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
  };

  return (
    <div className={showRenewOption ? '' : 'mb-4'}>
      <DropdownMenu open={showMenu} onOpenChange={setShowMenu}>
        <DropdownMenuTrigger asChild>
          <div className="hidden" />
        </DropdownMenuTrigger>
        <Card 
          className={`w-full h-[200px] border-none shadow-md ${backgroundStyle} text-white relative overflow-hidden ${showRenewOption ? 'rounded-t-2xl' : 'rounded-2xl'} cursor-pointer`}
          style={inlineStyle}
          onClick={!isExpired ? onArrowClick : undefined}
        >
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="w-full h-full bg-gradient-to-br from-white/20 to-transparent"></div>
        </div>
        
        {/* Main Content */}
        <div className="relative z-10 pt-5 px-8 pb-8 h-full flex flex-col justify-between min-h-[200px]">
          {/* Top Row - Tags and Amount */}
          <div className="flex justify-between items-start">
            <div className="flex gap-3">
              {/* Pass Type Tag - Long press to show menu */}
              <div 
                className="bg-white/20 backdrop-blur-sm rounded-full px-4 py-0.5 cursor-pointer select-none"
                onMouseDown={handleLongPressStart}
                onMouseUp={handleLongPressEnd}
                onMouseLeave={handleLongPressEnd}
                onTouchStart={handleLongPressStart}
                onTouchEnd={handleLongPressEnd}
              >
                <span className="text-base font-medium">{passType}</span>
              </div>
              {/* Pass Category Tag */}
              <div className="bg-white/20 backdrop-blur-sm rounded-full px-4 py-0.5">
                <span className="text-base font-medium">{passCategory}</span>
              </div>
            </div>
            {/* Amount */}
            <div className="text-right">
              <span className="text-2xl font-bold">₹ {parseFloat(amount).toFixed(1)}</span>
            </div>
          </div>

          {/* Middle Row - Pass Name */}
          <div className="flex-1 flex items-center">
            <h3 className="text-2xl font-semibold leading-tight mx-0 my-[5px] whitespace-nowrap overflow-hidden text-ellipsis">{passName}</h3>
          </div>

          {/* Bottom Row - Validity and Arrow */}
          <div className="flex justify-between items-end mb-[-8px]">
            <div className="mt-2">
              <p className="opacity-90 mb-0 mx-0 my-0 text-sm text-left">Pass valid till</p>
              <p className="text-base font-medium my-0">{validTill}</p>
            </div>
            {/* Arrow Button - Only show for active passes */}
            {!isExpired && (
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm flex items-center justify-center rounded-full">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            )}
          </div>
        </div>
        </Card>
        <DropdownMenuContent 
          className="w-48 z-50 text-white border-none bg-white" 
          style={{ background: 'linear-gradient(to right, #012f42, #087a85)' }}
          align="start"
          side="bottom"
          sideOffset={8}
          alignOffset={-20}
        >
          {/* Show all options for active passes */}
          {!isExpired && (
            <>
              <DropdownMenuSub>
                <DropdownMenuSubTrigger className="cursor-pointer hover:bg-white/20 focus:bg-white/20">
                  <span>Switch Colour</span>
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent 
                  className="z-50 text-white border-none bg-white" 
                  style={{ background: 'linear-gradient(to right, #012f42, #087a85)' }}
                  sideOffset={8}
                >
                  <DropdownMenuItem 
                    onClick={() => {
                      onColorChange?.('black');
                      setShowMenu(false);
                    }}
                    className="cursor-pointer hover:bg-white/20 focus:bg-white/20"
                  >
                    Black
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => {
                      onColorChange?.('blue');
                      setShowMenu(false);
                    }}
                    className="cursor-pointer hover:bg-white/20 focus:bg-white/20"
                  >
                    Blue
                  </DropdownMenuItem>
                </DropdownMenuSubContent>
              </DropdownMenuSub>
              <DropdownMenuItem 
                onClick={() => {
                  onDelete?.();
                  setShowMenu(false);
                }}
                className="cursor-pointer hover:bg-white/20 focus:bg-white/20 text-red-300"
              >
                Delete
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => {
                  onExpire?.();
                  setShowMenu(false);
                }}
                className="cursor-pointer hover:bg-white/20 focus:bg-white/20"
              >
                Expire
              </DropdownMenuItem>
            </>
          )}
          
          {/* Show only Delete option for expired passes */}
          {isExpired && (
            <DropdownMenuItem 
              onClick={() => {
                onDelete?.();
                setShowMenu(false);
              }}
              className="cursor-pointer hover:bg-white/20 focus:bg-white/20 text-red-300"
            >
              Delete
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
      
      {/* Renew Section - Only show for the most recently expired pass */}
      {showRenewOption && (
        <div className="w-full h-[70px] bg-[#f5f5f5] rounded-b-2xl flex items-center px-6 justify-between">
          <span className="text-gray-600 text-base font-medium">Want to book again?</span>
          <div 
            onClick={onRenew}
            className="h-[48px] px-8 rounded-lg flex items-center justify-center cursor-pointer hover:opacity-90 transition-opacity bg-[#11B3BC]"
          >
            <span className="text-white text-lg font-semibold">Renew</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default PassCard;