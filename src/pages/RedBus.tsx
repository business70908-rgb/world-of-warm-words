import { useNavigate } from 'react-router-dom';
import { useState, useCallback, useEffect } from 'react';
import { ArrowUpDown } from 'lucide-react';
import WheelDatePicker from '../components/DatePicker';
import { Input } from '../components/ui/input';
import newBackArrow from '../assets/new-back-arrow.png';
import redbusLogo from '@/assets/redbus-logo.png';
import locationMapIcon from '@/assets/location-map-icon.png';
import locationPinGreen from '@/assets/location-pin-green.png';
import { MobileContainer } from '@/components/MobileContainer';
import { PaymentMethod } from '@/components/PaymentMethod';
import { toast } from '@/hooks/use-toast';

const GEOAPIFY_API_KEY = '2d37f93befe44cc6b78c379784c34715';

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface AddressSuggestion {
  formatted: string;
  address_line1: string;
  address_line2: string;
  city: string;
  state: string;
  country: string;
  lat: number;
  lon: number;
}

interface BusRoute {
  id: string;
  busName: string;
  busType: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  price: number;
  seatsAvailable: number;
  rating: number;
}

const RedBus = ({ embedded = false }: { embedded?: boolean }) => {
  const navigate = useNavigate();
  const [selectedDay, setSelectedDay] = useState('today');
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const currentDate = new Date();
  const [selectedDate, setSelectedDate] = useState({ 
    month: currentDate.getMonth(), 
    day: currentDate.getDate(), 
    year: currentDate.getFullYear() 
  });
  const [fromCity, setFromCity] = useState('');
  const [toCity, setToCity] = useState('');
  const [fromLocation, setFromLocation] = useState<{ lat: number; lon: number } | null>(null);
  const [toLocation, setToLocation] = useState<{ lat: number; lon: number } | null>(null);
  const [fromSuggestions, setFromSuggestions] = useState<AddressSuggestion[]>([]);
  const [toSuggestions, setToSuggestions] = useState<AddressSuggestion[]>([]);
  const [activeInput, setActiveInput] = useState<'from' | 'to' | null>(null);
  const [busRoutes, setBusRoutes] = useState<BusRoute[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedBus, setSelectedBus] = useState<BusRoute | null>(null);
  const [tummocBalance, setTummocBalance] = useState(0);

  useEffect(() => {
    const balance = localStorage.getItem('tummocBalance');
    setTummocBalance(balance ? parseFloat(balance) : 0);
  }, []);

  const fetchSuggestions = useCallback(async (query: string, type: 'from' | 'to') => {
    if (query.length < 2) {
      if (type === 'from') {
        setFromSuggestions([]);
      } else {
        setToSuggestions([]);
      }
      return;
    }

    try {
      const response = await fetch(
        `https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(query)}&apiKey=${GEOAPIFY_API_KEY}`
      );
      const data = await response.json();
      
      if (data.features) {
        const formattedSuggestions: AddressSuggestion[] = data.features.map((feature: any) => ({
          formatted: feature.properties.formatted,
          address_line1: feature.properties.address_line1 || '',
          address_line2: feature.properties.address_line2 || '',
          city: feature.properties.city || '',
          state: feature.properties.state || '',
          country: feature.properties.country || '',
          lat: feature.properties.lat,
          lon: feature.properties.lon,
        }));
        
        if (type === 'from') {
          setFromSuggestions(formattedSuggestions);
        } else {
          setToSuggestions(formattedSuggestions);
        }
      }
    } catch (error) {
      console.error('Error fetching suggestions:', error);
    }
  }, []);

  const generateBusRoutes = async (fromLoc: { lat: number; lon: number }, toLoc: { lat: number; lon: number }) => {
    setIsSearching(true);
    
    try {
      // Calculate distance using Haversine formula
      const R = 6371; // Earth's radius in km
      const dLat = (toLoc.lat - fromLoc.lat) * Math.PI / 180;
      const dLon = (toLoc.lon - fromLoc.lon) * Math.PI / 180;
      const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(fromLoc.lat * Math.PI / 180) * Math.cos(toLoc.lat * Math.PI / 180) *
                Math.sin(dLon/2) * Math.sin(dLon/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      const distance = R * c;
      
      // Generate mock bus routes based on distance
      const baseDuration = Math.ceil(distance / 50); // Assume avg 50 km/h
      const basePrice = Math.ceil(distance * 1.5); // ₹1.5 per km
      
      const busTypes = ['AC Sleeper', 'Non-AC Seater', 'AC Seater', 'Volvo AC', 'Semi-Sleeper', 'Volvo Multi-Axle', 'Scania AC', 'Mercedes AC', 'Non-AC Sleeper', 'Seater/Sleeper'];
      const busOperators = [
        'KSRTC', 'VRL Travels', 'SRS Travels', 'KPN Travels', 'Orange Travels', 'Chartered Bus',
        'IntrCity SmartBus', 'Parveen Travels', 'Sharma Travels', 'Raj Travels', 'Intercity Express',
        'National Travels', 'Kallada Travels', 'Paulo Travels', 'Rajdhani Express', 'Sharma Transport',
        'Kaveri Travels', 'Kesineni Travels', 'Neeta Travels', 'Eagle Travels', 'Royal Travels',
        'Garuda Travels', 'Majestic Travels', 'Metro Liner', 'Sea Bird Travels', 'Manasi Travels'
      ];
      
      // Random number of buses between 1-30
      const numBuses = Math.floor(Math.random() * 30) + 1;
      
      // Create a shuffled array of operators and types for variety
      const shuffledOperators = [...busOperators].sort(() => Math.random() - 0.5);
      const shuffledTypes = [...busTypes].sort(() => Math.random() - 0.5);
      
      const routes: BusRoute[] = Array.from({ length: numBuses }, (_, i) => {
        const operator = shuffledOperators[i % shuffledOperators.length];
        const busType = shuffledTypes[i % shuffledTypes.length];
        const timeOffset = i * (Math.floor(Math.random() * 45) + 15); // Random 15-60 min intervals
        const departHour = 5 + Math.floor(timeOffset / 60);
        const departMin = timeOffset % 60;
        const arriveHour = departHour + baseDuration;
        const arriveMin = departMin;
        
        const priceMultiplier = busType.includes('AC') ? 1.5 : 1;
        const price = Math.ceil(basePrice * priceMultiplier) + Math.floor(Math.random() * 200);
        
        return {
          id: `bus-${i}-${Date.now()}`,
          busName: `${operator} ${busType}`,
          busType: busType,
          departureTime: `${String(departHour % 24).padStart(2, '0')}:${String(departMin).padStart(2, '0')}`,
          arrivalTime: `${String(arriveHour % 24).padStart(2, '0')}:${String(arriveMin).padStart(2, '0')}`,
          duration: `${baseDuration}h ${Math.floor(Math.random() * 60)}m`,
          price: price,
          seatsAvailable: Math.floor(Math.random() * 30) + 10,
          rating: 3.5 + Math.random() * 1.5,
        };
      });
      
      setBusRoutes(routes);
      setShowResults(true);
    } catch (error) {
      console.error('Error generating routes:', error);
    } finally {
      setIsSearching(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (activeInput === 'from') {
        fetchSuggestions(fromCity, 'from');
      } else if (activeInput === 'to') {
        fetchSuggestions(toCity, 'to');
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [fromCity, toCity, activeInput, fetchSuggestions]);

  const handleSelectSuggestion = (suggestion: AddressSuggestion, type: 'from' | 'to') => {
    if (type === 'from') {
      setFromCity(suggestion.formatted);
      setFromLocation({ lat: suggestion.lat, lon: suggestion.lon });
      setFromSuggestions([]);
      setActiveInput(null);
      
      // If both locations are set, generate routes
      if (toLocation) {
        generateBusRoutes({ lat: suggestion.lat, lon: suggestion.lon }, toLocation);
      }
    } else {
      setToCity(suggestion.formatted);
      setToLocation({ lat: suggestion.lat, lon: suggestion.lon });
      setToSuggestions([]);
      setActiveInput(null);
      
      // If both locations are set, generate routes
      if (fromLocation) {
        generateBusRoutes(fromLocation, { lat: suggestion.lat, lon: suggestion.lon });
      }
    }
  };

  const handleBackClick = () => {
    navigate(-1);
  };

  const handleDaySelect = (day: string) => {
    setSelectedDay(day);
    if (day === 'today') {
      const today = new Date();
      setSelectedDate({
        month: today.getMonth(),
        day: today.getDate(),
        year: today.getFullYear()
      });
    } else if (day === 'tomorrow') {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      setSelectedDate({
        month: tomorrow.getMonth(),
        day: tomorrow.getDate(),
        year: tomorrow.getFullYear()
      });
    }
  };

  const handleCalendarSave = (date: { month: number; day: number; year: number }) => {
    setSelectedDate(date);
    setSelectedDay('custom');
    setIsCalendarOpen(false);
  };

  const handleCalendarCancel = () => {
    setIsCalendarOpen(false);
  };

  const handleSwapLocations = () => {
    const tempCity = fromCity;
    const tempLoc = fromLocation;
    setFromCity(toCity);
    setToCity(tempCity);
    setFromLocation(toLocation);
    setToLocation(tempLoc);
    
    // Regenerate routes with swapped locations
    if (toLocation && tempLoc) {
      generateBusRoutes(toLocation, tempLoc);
    }
  };

  const formatDisplayDate = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${selectedDate.day} ${months[selectedDate.month]} '${selectedDate.year.toString().slice(-2)}`;
  };

  const handleViewSeats = (bus: BusRoute) => {
    setSelectedBus(bus);
    setShowPaymentModal(true);
  };

  const handlePaymentSelect = (method: 'tummoc' | 'razorpay') => {
    if (!selectedBus) return;

    if (method === 'tummoc') {
      const newBalance = tummocBalance - selectedBus.price;
      localStorage.setItem('tummocBalance', newBalance.toString());
      setTummocBalance(newBalance);
      
      const transactions = JSON.parse(localStorage.getItem('tummocTransactions') || '[]');
      transactions.unshift({
        id: Date.now().toString(),
        type: 'debit',
        amount: selectedBus.price,
        description: `Bus Ticket - ${selectedBus.busName}`,
        timestamp: Date.now(),
        date: new Date().toISOString(),
        paymentMethod: 'tummoc' as const,
      });
      localStorage.setItem('tummocTransactions', JSON.stringify(transactions));
      
      toast({
        title: "Payment Successful",
        description: `Ticket booked for ${selectedBus.busName}`,
      });
      setShowPaymentModal(false);
    } else {
      const savedApiKey = localStorage.getItem('razorpayApiKey');
      
      if (!savedApiKey && typeof window.Razorpay === 'undefined') {
        toast({
          title: "Payment Processing",
          description: "Test mode: Ticket booked successfully",
        });
        setShowPaymentModal(false);
        return;
      }

      if (typeof window.Razorpay !== 'undefined' && savedApiKey) {
        const options = {
          key: savedApiKey,
          amount: selectedBus.price * 100,
          currency: 'INR',
          name: 'Bus Ticket',
          description: `${selectedBus.busName}`,
          handler: function (response: any) {
            toast({
              title: "Payment Successful",
              description: `Ticket booked for ${selectedBus.busName}`,
            });
            setShowPaymentModal(false);
          },
          theme: {
            color: '#14b8a6',
          },
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
      }
    }
  };

  const handleAddMoney = () => {
    setShowPaymentModal(false);
    navigate('/add-money', { state: { returnPath: '/red-bus' } });
  };
  
  // Embedded mode: skip MobileContainer and header, show from "From City" field onwards
  if (embedded) {
    return (
      <div className="w-full relative flex flex-col min-h-full">
        <WheelDatePicker
          isOpen={isCalendarOpen}
          onSave={(date: Date) => {
            setSelectedDate({
              month: date.getMonth(),
              day: date.getDate(),
              year: date.getFullYear()
            });
            setSelectedDay('custom');
            setIsCalendarOpen(false);
          }}
          onCancel={handleCalendarCancel}
        />
        {/* Header inputs area */}
        <div className="w-full relative bg-teal-950 header-teal-fix">
          <div className="w-full h-44 relative">
            {/* From City Input */}
            <div className="w-full h-14 left-0 top-[10px] absolute bg-black/0 z-10">
              <div className="absolute left-[53px] top-[4px] right-[80px]">
                <Input
                  value={fromCity}
                  onChange={(e) => { setFromCity(e.target.value); setShowResults(false); }}
                  onFocus={() => { setActiveInput('from'); setShowResults(false); }}
                  placeholder="From City"
                  className="bg-transparent border-none text-white placeholder:text-slate-400 text-2xl font-normal focus-visible:ring-0 focus-visible:ring-offset-0 px-0 h-10"
                />
              </div>
              <div className="w-4 h-4 left-[20px] top-[14px] absolute rounded-full" style={{ backgroundColor: '#18b7bf' }} />
            </div>

            {/* Divider line */}
            <div className="w-full h-11 left-0 top-[66px] absolute bg-black/0">
              <div className="h-px left-[51px] right-[80px] top-[20px] absolute bg-slate-500" />
            </div>

            {/* Dots + Swap button */}
            <div className="w-full h-20 left-0 top-[55px] absolute bg-black/0">
              <div className="w-10 h-9 right-[20px] top-[9px] absolute bg-black/0">
                <div 
                  className="w-11 h-11 rounded-full bg-white flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={handleSwapLocations}
                >
                  <ArrowUpDown className="w-5 h-5 text-black pointer-events-none" />
                </div>
              </div>
              <div className="w-[3px] h-8 left-[25px] top-[10px] absolute flex flex-col justify-between items-center">
                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full"></div>
                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full"></div>
                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full"></div>
              </div>
            </div>

            {/* To City Input */}
            <div className="w-full h-14 left-0 top-[100px] absolute bg-black/0 z-10">
              <div className="absolute left-[53px] top-[4px] right-[80px]">
                <Input
                  value={toCity}
                  onChange={(e) => { setToCity(e.target.value); setShowResults(false); }}
                  onFocus={() => { setActiveInput('to'); setShowResults(false); }}
                  placeholder="To City"
                  className="bg-transparent border-none text-white placeholder:text-slate-400 text-2xl font-normal focus-visible:ring-0 focus-visible:ring-offset-0 px-0 h-10"
                />
              </div>
              <img src={locationPinGreen} alt="Location pin" className="w-5 h-7 left-[18px] top-[14px] absolute" />
            </div>
          </div>
        </div>

        {/* Date Selection Row */}
        <div className="w-full h-24 relative bg-white">
          <div className="w-full h-24 relative bg-black/0 flex items-center px-5 gap-4 justify-between">
            {/* Custom Date Picker */}
            <div className="relative">
              <div className="h-14 px-5 bg-white rounded-3xl border border-stone-300 cursor-pointer flex items-center justify-center gap-2" onClick={() => setIsCalendarOpen(true)}>
                <svg width="22" height="26" viewBox="0 0 20 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="2" y="4" width="16" height="16" rx="2" stroke="#6b7280" strokeWidth="1.5" fill="none"/>
                  <path d="M6 2v4M14 2v4" stroke="#6b7280" strokeWidth="1.5" strokeLinecap="round"/>
                  <path d="M2 10h16" stroke="#6b7280" strokeWidth="1.5"/>
                  <circle cx="7" cy="13" r="1" fill="#6b7280"/>
                  <circle cx="10" cy="13" r="1" fill="#6b7280"/>
                  <circle cx="13" cy="13" r="1" fill="#6b7280"/>
                  <circle cx="7" cy="16" r="1" fill="#6b7280"/>
                  <circle cx="10" cy="16" r="1" fill="#6b7280"/>
                </svg>
                <div className="text-zinc-500 text-xl font-bold font-['Inter']">{formatDisplayDate()}</div>
                <svg className="w-3 h-2 pointer-events-none" viewBox="0 0 10 7" fill="none">
                  <path d="M5 7L0 0h10L5 7z" fill="#65a30d" />
                </svg>
              </div>
            </div>
            
            <div className="flex gap-14">
              {/* Today Button */}
              <div 
                className={`h-14 px-6 rounded-3xl border cursor-pointer flex items-center justify-center ${
                  selectedDay === 'today' ? 'bg-lime-400 border-lime-500' : 'bg-white border-stone-300'
                }`}
                onClick={() => handleDaySelect('today')}
              >
                <div className={`text-2xl font-semibold font-['Inter'] ${
                  selectedDay === 'today' ? 'text-lime-800' : 'text-gray-500'
                }`}>Today</div>
              </div>
              
              {/* Tomorrow Button */}
              <div 
                className={`h-14 px-6 rounded-3xl border cursor-pointer flex items-center justify-center ${
                  selectedDay === 'tomorrow' ? 'bg-lime-400 border-lime-500' : 'bg-white border-stone-300'
                }`}
                onClick={() => handleDaySelect('tomorrow')}
              >
                <div className={`text-2xl font-semibold font-['Inter'] ${
                  selectedDay === 'tomorrow' ? 'text-lime-800' : 'text-gray-500'
                }`}>Tomorrow</div>
              </div>
            </div>
          </div>
        </div>

        {/* Content area */}
        <div className="w-full relative bg-black/0">
          <div className="w-full h-px left-0 top-0 absolute bg-gray-200" />
          
          {/* Bus Routes Results */}
          {showResults && busRoutes.length > 0 && (
            <div className="w-full bg-gray-50 overflow-y-auto" style={{ maxHeight: '900px', scrollbarWidth: 'none' }}>
              <div className="bg-white px-6 py-4 border-b border-gray-200 sticky top-0 z-10">
                <div className="text-gray-700 text-2xl font-semibold">{busRoutes.length} buses found</div>
                <div className="text-gray-500 text-lg mt-1">{fromCity.split(',')[0]} → {toCity.split(',')[0]}</div>
              </div>
              {busRoutes.map((bus) => (
                <div key={bus.id} className="bg-white mx-4 my-4 rounded-xl shadow-sm border border-gray-200 p-5 cursor-pointer hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="text-gray-800 text-2xl font-semibold">{bus.busName}</div>
                      <div className="text-gray-500 text-lg mt-1">{bus.busType}</div>
                    </div>
                    <div className="flex items-center gap-1 bg-green-100 px-3 py-1.5 rounded">
                      <span className="text-green-700 text-lg font-semibold">★ {bus.rating.toFixed(1)}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-10">
                      <div>
                        <div className="text-gray-800 text-2xl font-bold">{bus.departureTime}</div>
                        <div className="text-gray-500 text-base">Departure</div>
                      </div>
                      <div className="text-center">
                        <div className="text-gray-500 text-lg">{bus.duration}</div>
                        <div className="w-20 h-px bg-gray-300 my-1"></div>
                      </div>
                      <div>
                        <div className="text-gray-800 text-2xl font-bold">{bus.arrivalTime}</div>
                        <div className="text-gray-500 text-base">Arrival</div>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                    <div className="text-gray-600 text-lg">{bus.seatsAvailable} seats available</div>
                    <div className="flex items-center gap-4">
                      <div className="text-gray-800 text-2xl font-bold">₹{bus.price}</div>
                      <button onClick={() => handleViewSeats(bus)} className="bg-red-600 text-white px-6 py-3 rounded-lg text-lg font-semibold hover:bg-red-700 transition-colors">View Seats</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {isSearching && (
            <div className="w-full bg-white flex items-center justify-center py-24">
              <div className="text-center">
                <div className="animate-spin rounded-full h-14 w-14 border-b-2 border-red-600 mx-auto mb-5"></div>
                <div className="text-gray-600 text-2xl">Searching for buses...</div>
              </div>
            </div>
          )}
          
          {/* Search Suggestions */}
          {!showResults && (fromSuggestions.length > 0 || toSuggestions.length > 0) && (
            <div className="w-full bg-white overflow-y-auto" style={{ maxHeight: '900px', scrollbarWidth: 'none' }}>
              {activeInput === 'from' && fromSuggestions.map((suggestion, index) => (
                <div key={index} className="px-6 py-5 hover:bg-gray-50 cursor-pointer border-b border-gray-200 flex items-center gap-4" onClick={() => handleSelectSuggestion(suggestion, 'from')}>
                  <img className="w-8 h-8 flex-shrink-0" src={locationMapIcon} alt="Location" />
                  <div className="flex-1">
                    <div className="text-gray-800 text-2xl font-medium">{suggestion.address_line1}</div>
                    <div className="text-gray-500 text-lg">{suggestion.address_line2 || suggestion.city}</div>
                  </div>
                </div>
              ))}
              {activeInput === 'to' && toSuggestions.map((suggestion, index) => (
                <div key={index} className="px-6 py-5 hover:bg-gray-50 cursor-pointer border-b border-gray-200 flex items-center gap-4" onClick={() => handleSelectSuggestion(suggestion, 'to')}>
                  <img className="w-8 h-8 flex-shrink-0" src={locationMapIcon} alt="Location" />
                  <div className="flex-1">
                    <div className="text-gray-800 text-2xl font-medium">{suggestion.address_line1}</div>
                    <div className="text-gray-500 text-lg">{suggestion.address_line2 || suggestion.city}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Powered by RedBus - Footer */}
        <div className="w-full py-4 bg-white border-t border-neutral-200 flex items-center justify-center gap-3 mt-auto">
          <div className="text-neutral-500 text-xl font-bold font-['Inter']">Powered by</div>
          <img className="w-10 h-6" src={redbusLogo} alt="RedBus logo" />
        </div>

        <PaymentMethod
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          totalAmount={selectedBus?.price || 0}
          tummocBalance={tummocBalance}
          onPaymentSelect={handlePaymentSelect}
          onAddMoney={handleAddMoney}
        />
      </div>
    );
  }

  return (
    <MobileContainer width={540} height={1094}>
      <WheelDatePicker
              isOpen={isCalendarOpen}
              onSave={(date: Date) => {
                setSelectedDate({
                  month: date.getMonth(),
                  day: date.getDate(),
                  year: date.getFullYear()
                });
                setSelectedDay('custom');
                setIsCalendarOpen(false);
              }}
              onCancel={handleCalendarCancel}
            />
        <div className="w-[540px] h-[1094px] left-0 top-0 absolute bg-black/0">
          <div className="w-[540px] h-[1094px] left-0 top-0 absolute bg-white" />
          <div className="w-[540px] h-14 left-0 top-[1035px] absolute bg-black/0">
            <img className="w-8 h-5 left-[314px] top-[15px] absolute" src={redbusLogo} alt="RedBus logo" />
            <div className="w-28 h-6 left-[193px] top-[11px] absolute justify-center text-neutral-500 text-xl font-bold font-['Inter']">Powered by</div>
          </div>
          <div className="w-[539px] h-px left-0 top-[1035px] absolute bg-neutral-200" />
          <div className="w-[540px] h-20 left-0 top-[211px] absolute bg-white" />
          <div className="w-[540px] h-[788px] left-0 top-[246px] absolute bg-black/0">
            <div className="w-[539px] h-px left-0 top-[51px] absolute bg-gray-200" />
            
            {/* Bus Routes Results */}
            {showResults && busRoutes.length > 0 && (
              <div 
                className="absolute left-0 top-[51px] w-[540px] bg-gray-50 z-20 overflow-y-scroll"
                style={{ 
                  height: '737px',
                  scrollbarWidth: 'none',
                  msOverflowStyle: 'none',
                  WebkitOverflowScrolling: 'touch'
                }}
              >
                <style>
                  {`
                    div::-webkit-scrollbar {
                      display: none;
                    }
                  `}
                </style>
                
                {/* Header */}
                <div className="bg-white px-5 py-3 border-b border-gray-200 sticky top-0 z-10">
                  <div className="text-gray-700 text-lg font-semibold">{busRoutes.length} buses found</div>
                  <div className="text-gray-500 text-sm mt-1">{fromCity.split(',')[0]} → {toCity.split(',')[0]}</div>
                </div>
                
                {/* Bus Cards */}
                {busRoutes.map((bus) => (
                  <div
                    key={bus.id}
                    className="bg-white mx-3 my-3 rounded-lg shadow-sm border border-gray-200 p-4 cursor-pointer hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <div className="text-gray-800 text-lg font-semibold">{bus.busName}</div>
                        <div className="text-gray-500 text-sm mt-1">{bus.busType}</div>
                      </div>
                      <div className="flex items-center gap-1 bg-green-100 px-2 py-1 rounded">
                        <span className="text-green-700 text-sm font-semibold">★ {bus.rating.toFixed(1)}</span>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center mb-3">
                      <div className="flex items-center gap-8">
                        <div>
                          <div className="text-gray-800 text-xl font-bold">{bus.departureTime}</div>
                          <div className="text-gray-500 text-xs">Departure</div>
                        </div>
                        <div className="text-center">
                          <div className="text-gray-500 text-sm">{bus.duration}</div>
                          <div className="w-16 h-px bg-gray-300 my-1"></div>
                        </div>
                        <div>
                          <div className="text-gray-800 text-xl font-bold">{bus.arrivalTime}</div>
                          <div className="text-gray-500 text-xs">Arrival</div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                      <div className="text-gray-600 text-sm">
                        {bus.seatsAvailable} seats available
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-gray-800 text-xl font-bold">₹{bus.price}</div>
                        <button 
                          onClick={() => handleViewSeats(bus)}
                          className="bg-red-600 text-white px-4 py-2 rounded text-sm font-semibold hover:bg-red-700 transition-colors"
                        >
                          View Seats
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {/* Loading State */}
            {isSearching && (
              <div className="absolute left-0 top-[51px] w-[540px] bg-white z-20 flex items-center justify-center" style={{ height: '737px' }}>
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
                  <div className="text-gray-600 text-lg">Searching for buses...</div>
                </div>
              </div>
            )}
            
            {/* Search Results */}
            {!showResults && (fromSuggestions.length > 0 || toSuggestions.length > 0) && (
              <div 
                className="absolute left-0 top-[51px] w-[540px] bg-white z-20 overflow-y-scroll"
                style={{ 
                  height: '737px',
                  scrollbarWidth: 'none',
                  msOverflowStyle: 'none',
                  WebkitOverflowScrolling: 'touch'
                }}
              >
                <style>
                  {`
                    div::-webkit-scrollbar {
                      display: none;
                    }
                  `}
                </style>
                {activeInput === 'from' && fromSuggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    className="px-5 py-4 hover:bg-gray-50 cursor-pointer border-b border-gray-200 flex items-center gap-3"
                    onClick={() => handleSelectSuggestion(suggestion, 'from')}
                  >
                    <img className="w-6 h-6 flex-shrink-0" src={locationMapIcon} alt="Location" />
                    <div className="flex-1">
                      <div className="text-gray-800 text-lg font-medium">{suggestion.address_line1}</div>
                      <div className="text-gray-500 text-sm">{suggestion.address_line2 || suggestion.city}</div>
                    </div>
                  </div>
                ))}
                {activeInput === 'to' && toSuggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    className="px-5 py-4 hover:bg-gray-50 cursor-pointer border-b border-gray-200 flex items-center gap-3"
                    onClick={() => handleSelectSuggestion(suggestion, 'to')}
                  >
                    <img className="w-6 h-6 flex-shrink-0" src={locationMapIcon} alt="Location" />
                    <div className="flex-1">
                      <div className="text-gray-800 text-lg font-medium">{suggestion.address_line1}</div>
                      <div className="text-gray-500 text-sm">{suggestion.address_line2 || suggestion.city}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Date Selection Row */}
          <div className="w-[540px] h-20 left-0 top-[211px] absolute bg-black/0">
            <div className="w-[540px] h-20 left-0 top-[7px] absolute bg-black/0">
              <div className="w-[540px] h-20 left-0 top-0 absolute bg-black/0">
                {/* Tomorrow Button */}
                <div className="w-36 h-14 left-[375px] top-[7px] absolute bg-black/0" onClick={() => handleDaySelect('tomorrow')}>
                  <div className={`w-36 h-12 left-[5px] top-[5px] absolute rounded-3xl border cursor-pointer flex items-center justify-center ${
                    selectedDay === 'tomorrow' ? 'bg-lime-400 border-lime-500' : 'bg-white border-stone-300'
                  }`}>
                    <div className={`text-xl font-semibold font-['Inter'] ${
                      selectedDay === 'tomorrow' ? 'text-lime-800' : 'text-gray-500'
                    }`}>Tomorrow</div>
                  </div>
                </div>
                
                {/* Today Button */}
                <div className="w-28 h-14 left-[250px] top-[7px] absolute bg-black/0" onClick={() => handleDaySelect('today')}>
                  <div className={`w-24 h-12 left-[5px] top-[5px] absolute rounded-3xl border cursor-pointer flex items-center justify-center ${
                    selectedDay === 'today' ? 'bg-lime-400 border-lime-500' : 'bg-white border-stone-300'
                  }`}>
                    <div className={`text-xl font-semibold font-['Inter'] ${
                      selectedDay === 'today' ? 'text-lime-800' : 'text-gray-500'
                    }`}>Today</div>
                  </div>
                </div>
                
                {/* Custom Date Picker */}
                <div className="w-44 h-14 left-[17px] top-[7px] absolute bg-black/0">
                  <div className="w-40 h-12 left-[6px] top-[5px] absolute bg-white rounded-3xl border border-stone-300 cursor-pointer flex items-center justify-center" onClick={() => setIsCalendarOpen(true)}>
                    <div className="text-zinc-500 text-lg font-bold font-['Inter']">{formatDisplayDate()}</div>
                  </div>
                  <svg className="w-2.5 h-1.5 left-[145px] top-[26px] absolute pointer-events-none" viewBox="0 0 10 7" fill="none">
                    <path d="M5 7L0 0h10L5 7z" fill="#65a30d" />
                  </svg>
                  {/* Calendar Icon */}
                  <div className="w-5 h-6 left-[20px] top-[18px] absolute cursor-pointer" onClick={() => setIsCalendarOpen(true)}>
                    <svg width="20" height="24" viewBox="0 0 20 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect x="2" y="4" width="16" height="16" rx="2" stroke="#6b7280" strokeWidth="1.5" fill="none"/>
                      <path d="M6 2v4M14 2v4" stroke="#6b7280" strokeWidth="1.5" strokeLinecap="round"/>
                      <path d="M2 10h16" stroke="#6b7280" strokeWidth="1.5"/>
                      <circle cx="7" cy="13" r="1" fill="#6b7280"/>
                      <circle cx="10" cy="13" r="1" fill="#6b7280"/>
                      <circle cx="13" cy="13" r="1" fill="#6b7280"/>
                      <circle cx="7" cy="16" r="1" fill="#6b7280"/>
                      <circle cx="10" cy="16" r="1" fill="#6b7280"/>
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Header Section */}
          <div className="w-[540px] h-52 left-0 top-0 absolute bg-black/0">
            <div className="w-[540px] h-52 left-0 top-0 absolute bg-teal-950 header-teal-fix" />
            
            {/* To City Input */}
            <div className="w-[540px] h-12 left-0 top-[155px] absolute bg-black/0 z-10">
              <div className="absolute left-[52px] top-[4px] w-[460px]">
                <Input
                  value={toCity}
                  onChange={(e) => {
                    setToCity(e.target.value);
                    setShowResults(false);
                  }}
                  onFocus={() => {
                    setActiveInput('to');
                    setShowResults(false);
                  }}
                  placeholder="To City"
                  className="bg-transparent border-none text-white placeholder:text-slate-400 text-xl font-normal focus-visible:ring-0 focus-visible:ring-offset-0 px-0 h-8"
                />
              </div>
              <img src={locationPinGreen} alt="Location pin" className="w-4 h-6 left-[17px] top-[14px] absolute" />
            </div>
            
            <div className="w-[540px] h-20 left-0 top-[113px] absolute bg-black/0">
              <div className="w-10 h-9 left-[474px] top-[9px] absolute bg-black/0">
                <div 
                  className="w-8 h-8 left-[5px] top-[3px] absolute rounded-2xl bg-white flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={handleSwapLocations}
                >
                  <ArrowUpDown className="w-4 h-4 text-black pointer-events-none" />
                </div>
              </div>
              <div className="w-[3px] h-6 left-[23px] top-[15px] absolute flex flex-col justify-between items-center">
                <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
              </div>
            </div>
            
            <div className="w-[540px] h-11 left-0 top-[104px] absolute bg-black/0">
              <div className="w-96 h-px left-[51px] top-[37px] absolute bg-slate-500" />
            </div>
            
            {/* From City Input */}
            <div className="w-[540px] h-14 left-0 top-[86px] absolute bg-black/0 z-10">
              <div className="absolute left-[53px] top-[4px] w-[460px]">
                <Input
                  value={fromCity}
                  onChange={(e) => {
                    setFromCity(e.target.value);
                    setShowResults(false);
                  }}
                  onFocus={() => {
                    setActiveInput('from');
                    setShowResults(false);
                  }}
                  placeholder="From City"
                  className="bg-transparent border-none text-white placeholder:text-slate-400 text-xl font-normal focus-visible:ring-0 focus-visible:ring-offset-0 px-0 h-8"
                />
              </div>
              <div className="w-3 h-3 left-[20px] top-[12px] absolute rounded-full" style={{ backgroundColor: '#18b7bf' }} />
            </div>
            
            <div className="w-[540px] h-20 left-0 top-0 absolute bg-black/0">
              <div className="w-36 h-8 left-[81px] top-[23px] absolute justify-center text-white text-2xl font-normal font-['Inter']">Plan my trip</div>
              <img className="w-5 h-6 left-[25px] top-[25px] absolute cursor-pointer" src={newBackArrow} alt="Back" onClick={handleBackClick} />
            </div>
          </div>
        </div>

        <PaymentMethod
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          totalAmount={selectedBus?.price || 0}
          tummocBalance={tummocBalance}
          onPaymentSelect={handlePaymentSelect}
          onAddMoney={handleAddMoney}
        />
      </MobileContainer>
  );
};
export default RedBus;