import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';

interface WheelDatePickerProps {
  isOpen: boolean;
  onSave: (date: Date) => void;
  onCancel: () => void;
}

const months = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

const WheelDatePicker: React.FC<WheelDatePickerProps> = ({ isOpen, onSave, onCancel }) => {
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth());
  const [selectedDay, setSelectedDay] = useState(currentDate.getDate());
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());

  const monthRef = useRef<HTMLDivElement>(null);
  const dayRef = useRef<HTMLDivElement>(null);
  const yearRef = useRef<HTMLDivElement>(null);

  // Generate years from 1950 to 2050
  const years = Array.from({ length: 101 }, (_, i) => 1950 + i);
  
  // Calculate days in month, handling leap years
  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const days = Array.from({ length: getDaysInMonth(selectedMonth, selectedYear) }, (_, i) => i + 1);

  // Update days when month or year changes
  useEffect(() => {
    const maxDays = getDaysInMonth(selectedMonth, selectedYear);
    if (selectedDay > maxDays) {
      setSelectedDay(maxDays);
    }
  }, [selectedMonth, selectedYear]);

  const handleSave = () => {
    const selectedDate = new Date(selectedYear, selectedMonth, selectedDay);
    onSave(selectedDate);
  };

  // Center positioning function with smooth scrolling
  const scrollToCenter = (element: HTMLElement, index: number) => {
    const itemHeight = 64; // Each item is 64px tall (h-16)
    const padding = 64; // py-16 = 64px (1 item height for top/bottom padding)
    const scrollTop = padding + (index * itemHeight) - itemHeight; // Position so selected item is in center
    element.scrollTo({ top: scrollTop, behavior: 'smooth' });
  };

  // Scroll handler with debouncing and snapping
  const createScrollHandler = (items: any[], setter: (value: any) => void) => {
    let timeoutId: ReturnType<typeof setTimeout>;
    
    return (e: React.UIEvent<HTMLDivElement>) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        const element = e.target as HTMLElement;
        const itemHeight = 64; // Updated to match h-16
        const scrollTop = element.scrollTop;
        const padding = 64; // Updated to match py-16
        
        // Calculate which item is closest to center (middle position)
        const adjustedScrollTop = scrollTop - padding + itemHeight;
        const itemIndex = Math.round(adjustedScrollTop / itemHeight);
        const clampedIndex = Math.max(0, Math.min(items.length - 1, itemIndex));
        
        setter(items[clampedIndex]);
        
        // Snap to center position (don't auto-scroll during user interaction)
        const targetScrollTop = padding + (clampedIndex * itemHeight) - itemHeight;
        if (Math.abs(element.scrollTop - targetScrollTop) > 5) {
          element.scrollTo({ top: targetScrollTop, behavior: 'smooth' });
        }
      }, 150);
    };
  };

  // Initialize picker when opened
  useEffect(() => {
    if (isOpen) {
      // Reset to current date
      const now = new Date();
      setSelectedMonth(now.getMonth());
      setSelectedDay(now.getDate());
      setSelectedYear(now.getFullYear());
      
      // Center scroll positions
      setTimeout(() => {
        if (monthRef.current) scrollToCenter(monthRef.current, now.getMonth());
        if (dayRef.current) scrollToCenter(dayRef.current, now.getDate() - 1);
        if (yearRef.current) scrollToCenter(yearRef.current, years.indexOf(now.getFullYear()));
      }, 100);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-[340px] mx-auto shadow-2xl">
        {/* Picker Content */}
        <div className="flex h-64 py-10 px-4 relative">
          {/* Center selection indicator - invisible but creates the highlight zone */}
          <div className="absolute inset-x-4 top-1/2 transform -translate-y-1/2 h-16 pointer-events-none z-10"></div>
          
          {/* Month Column */}
          <div className="flex-1 relative">
            <div 
              className="h-48 overflow-y-scroll scrollbar-hide" 
              ref={monthRef}
              onScroll={createScrollHandler(months.map((_, i) => i), setSelectedMonth)}
            >
              <div className="py-16">
                {months.map((month, index) => (
                  <div
                    key={month}
                    className={`h-16 flex items-center justify-center text-xl transition-all duration-200 ${
                      selectedMonth === index 
                        ? 'text-foreground font-bold scale-105' 
                        : 'text-muted-foreground opacity-30 text-lg'
                    }`}
                  >
                    {month}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Day Column */}
          <div className="flex-1 relative mx-2">
            <div 
              className="h-48 overflow-y-scroll scrollbar-hide" 
              ref={dayRef}
              onScroll={createScrollHandler(days, setSelectedDay)}
            >
              <div className="py-16">
                {days.map((day) => (
                  <div
                    key={day}
                    className={`h-16 flex items-center justify-center text-xl transition-all duration-200 ${
                      selectedDay === day 
                        ? 'text-foreground font-bold scale-105' 
                        : 'text-muted-foreground opacity-30 text-lg'
                    }`}
                  >
                    {day.toString().padStart(2, '0')}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Year Column */}
          <div className="flex-1 relative">
            <div 
              className="h-48 overflow-y-scroll scrollbar-hide" 
              ref={yearRef}
              onScroll={createScrollHandler(years, setSelectedYear)}
            >
              <div className="py-16">
                {years.map((year) => (
                  <div
                    key={year}
                    className={`h-16 flex items-center justify-center text-xl transition-all duration-200 ${
                      selectedYear === year 
                        ? 'text-foreground font-bold scale-105' 
                        : 'text-muted-foreground opacity-30 text-lg'
                    }`}
                  >
                    {year}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 px-6 pb-6 pt-2">
          <Button
            variant="ghost"
            className="flex-1 h-14 text-muted-foreground font-semibold text-xl hover:text-foreground rounded-md"
            onClick={onCancel}
          >
            Cancel
          </Button>
          <Button
            className="flex-1 h-14 bg-teal-500 hover:bg-teal-600 text-white font-semibold text-xl rounded-md"
            onClick={handleSave}
          >
            Okay
          </Button>
        </div>
      </div>
    </div>
  );
};

export default WheelDatePicker;