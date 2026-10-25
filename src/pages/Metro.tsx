import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Minus, Plus, ArrowUpDown } from 'lucide-react';
import { toast } from 'sonner';
import { authenticateForPayment } from '@/lib/biometricAuth';
import { walletStorage } from '@/lib/storage/walletStorage';
import backArrow from '@/assets/back-arrow.png';
import passengersIcon from '@/assets/passengers-icon.png';
import infoIcon from '@/assets/info-icon-grey.png';
import ondcLogo from '@/assets/ONDC.png';
import bmrclLogo from '@/assets/BMRCL.png';
import tickMarkAnimation from '@/assets/tick-mark-animation.gif';
import { useMetroStations, MetroStation } from '@/hooks/useMetroStations';
import { MobileContainer } from '@/components/MobileContainer';
import { PaymentMethod } from '@/components/PaymentMethod';

const MAX_PASSENGERS = 6;

// Haversine formula to calculate distance between coordinates
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// Calculate fare based on distance
const calculateFare = (distance: number): number => {
  if (distance <= 3) return 10;
  if (distance <= 5) return 20;
  if (distance <= 8) return 30;
  if (distance <= 10) return 50;
  if (distance <= 15) return 60;
  if (distance <= 20) return 70;
  if (distance <= 25) return 80;
  if (distance <= 30) return 90;
  return 90;
};

declare global {
  interface Window {
    Razorpay: any;
  }
}

const Metro = () => {
  const navigate = useNavigate();
  const { stations, loading } = useMetroStations();
  const [passengerCount, setPassengerCount] = useState(0);
  const [fromLocation, setFromLocation] = useState('');
  const [toLocation, setToLocation] = useState('');
  const [showStationSelect, setShowStationSelect] = useState(false);
  const [activeField, setActiveField] = useState<'from' | 'to' | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showMaxPassengerError, setShowMaxPassengerError] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [tummocBalance, setTummocBalance] = useState<number>(0);

  useEffect(() => {
    const loadBalance = async () => {
      const balance = await walletStorage.getBalance();
      setTummocBalance(balance);
    };
    
    loadBalance();

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      if (script.parentNode) {
        document.body.removeChild(script);
      }
    };
  }, []);

  // Calculate fare info with memoization
  const { fare, distance, totalFare } = useMemo(() => {
    if (!fromLocation || !toLocation) return { fare: 0, distance: 0, totalFare: 0 };
    
    const fromStation = stations.find(s => s.name === fromLocation);
    const toStation = stations.find(s => s.name === toLocation);
    
    if (!fromStation || !toStation) return { fare: 0, distance: 0, totalFare: 0 };
    
    const dist = calculateDistance(
      fromStation.latitude, fromStation.longitude,
      toStation.latitude, toStation.longitude
    );
    
    const calculatedFare = calculateFare(dist);
    
    return { 
      fare: calculatedFare, 
      distance: dist,
      totalFare: calculatedFare * passengerCount
    };
  }, [fromLocation, toLocation, stations, passengerCount]);

  const handleProceedToPay = useCallback(() => {
    setShowPaymentModal(true);
  }, []);

  const saveTransaction = useCallback(async (amount: number) => {
    await walletStorage.addTransaction({
      id: Date.now().toString(),
      type: 'debit',
      amount,
      description: `Metro ticket - ${fromLocation} to ${toLocation}`,
      timestamp: Date.now(),
      paymentMethod: 'tummoc',
    });
  }, [fromLocation, toLocation]);

  const handlePaymentSuccess = useCallback(() => {
    const purchaseData = {
      from: fromLocation,
      to: toLocation,
      passengers: passengerCount,
      fare,
      totalFare,
      distance,
      purchaseDate: new Date().toISOString(),
    };
    
    const existingTickets = JSON.parse(localStorage.getItem('metroTickets') || '[]');
    existingTickets.unshift(purchaseData);
    localStorage.setItem('metroTickets', JSON.stringify(existingTickets));
    
    setShowSuccessDialog(true);
  }, [fromLocation, toLocation, passengerCount, fare, totalFare, distance]);

  const handlePaymentSelect = useCallback(async (method: 'tummoc' | 'razorpay') => {
    setShowPaymentModal(false);
    
    if (method === 'tummoc') {
      // Use native biometric authentication for Tummoc Money payment
      await authenticateForPayment(
        totalFare,
        `Metro ticket - ${passengerCount} passenger(s) from ${fromLocation} to ${toLocation}`,
        async () => {
          // Payment success
          const newBalance = tummocBalance - totalFare;
          await walletStorage.updateBalance(newBalance);
          setTummocBalance(newBalance);
          await saveTransaction(totalFare);
          handlePaymentSuccess();
        },
        () => {
          // Payment cancelled
          toast.error('Payment cancelled', {
            description: 'Payment was not completed. Please try again.',
          });
        }
      );
    } else if (method === 'razorpay') {
      const razorpayApiKey = localStorage.getItem("razorpayApiKey");
      
      if (razorpayApiKey && window.Razorpay) {
        const options = {
          key: razorpayApiKey,
          amount: totalFare * 100,
          currency: "INR",
          name: "Metro Ticket",
          description: `Purchase Metro Ticket from ${fromLocation} to ${toLocation}`,
          handler: () => handlePaymentSuccess(),
          prefill: {
            name: "User",
            email: "user@example.com",
            contact: "9999999999",
          },
          theme: { color: "#11bbc3" },
        };
        
        new window.Razorpay(options).open();
      } else {
        // Use native biometric for Razorpay fallback
        await authenticateForPayment(
          totalFare,
          `Metro ticket purchase - ${passengerCount} passenger(s) from ${fromLocation} to ${toLocation}`,
          () => {
            handlePaymentSuccess();
          },
          () => {
            toast.error('Payment cancelled');
          }
        );
      }
    }
  }, [tummocBalance, totalFare, fromLocation, toLocation, passengerCount, handlePaymentSuccess, saveTransaction]);

  const handleAddMoney = useCallback(() => {
    navigate('/add-money', { state: { returnPath: '/metro' } });
  }, [navigate]);

  const handleBack = useCallback(() => {
    if (showStationSelect) {
      setShowStationSelect(false);
      setActiveField(null);
      setSearchQuery('');
    } else {
      navigate(-1);
    }
  }, [showStationSelect, navigate]);

  const incrementCount = useCallback(() => {
    setPassengerCount(prev => {
      if (prev >= MAX_PASSENGERS) {
        return prev;
      }
      if (prev === MAX_PASSENGERS - 1) {
        setShowMaxPassengerError(true);
      }
      return prev + 1;
    });
  }, []);

  const decrementCount = useCallback(() => {
    const minPassengers = (fromLocation && toLocation) ? 1 : 0;
    setPassengerCount(prev => Math.max(minPassengers, prev - 1));
    setShowMaxPassengerError(false);
  }, [fromLocation, toLocation]);

  const handleSwapLocations = useCallback(() => {
    setFromLocation(toLocation);
    setToLocation(fromLocation);
  }, [fromLocation, toLocation]);

  const handleFromClick = useCallback(() => {
    setActiveField('from');
    setShowStationSelect(true);
    setSearchQuery(fromLocation);
  }, [fromLocation]);

  const handleToClick = useCallback(() => {
    setActiveField('to');
    setShowStationSelect(true);
    setSearchQuery(toLocation);
  }, [toLocation]);

  const handleStationSelect = useCallback((station: MetroStation) => {
    if (activeField === 'from') {
      setFromLocation(station.name);
      setActiveField('to');
      setSearchQuery('');
    } else if (activeField === 'to') {
      setToLocation(station.name);
      setShowStationSelect(false);
      setActiveField(null);
      setSearchQuery('');
      
      if (fromLocation && passengerCount === 0) {
        setPassengerCount(1);
      }
    }
  }, [activeField, fromLocation, passengerCount]);

  const filteredStations = useMemo(() => {
    if (!searchQuery) return stations;
    const query = searchQuery.toLowerCase();
    return stations.filter(station => station.name.toLowerCase().includes(query));
  }, [stations, searchQuery]);

  const handleSearchChange = useCallback((value: string) => {
    setSearchQuery(value);
    if (activeField === 'from') {
      setFromLocation(value);
    } else if (activeField === 'to') {
      setToLocation(value);
    }
  }, [activeField]);
  
  if (showStationSelect) {
    return (
      <MobileContainer width={540} height={1088}>
        <div className="w-[540px] h-[1088px] relative bg-gray-100 overflow-hidden">
          <div className="w-[540px] h-16 bg-white flex items-center px-4 shadow-sm">
            <img 
              className="w-5 h-5 cursor-pointer" 
              src={backArrow} 
              alt="Back"
              onClick={handleBack}
            />
            <div className="ml-4 text-gray-700 text-xl">Select Metro Stations</div>
          </div>

          <div className="bg-white mx-4 mt-4 rounded-lg shadow-sm" style={{width: 'calc(100% - 32px)'}}>
            <div className="p-4">
              <div className="flex items-center mb-4">
                <div className="w-2.5 h-2.5 rounded-full mr-4 bg-[#9aca46]" />
                <input
                  type="text"
                  value={activeField === 'from' ? searchQuery : fromLocation}
                  onChange={(e) => activeField === 'from' ? handleSearchChange(e.target.value) : setFromLocation(e.target.value)}
                  onFocus={() => setActiveField('from')}
                  placeholder="From"
                  className="flex-1 bg-transparent border-none outline-none text-gray-700 text-lg font-medium placeholder-gray-400"
                />
              </div>
              
              <div className="w-full h-px bg-gray-200 my-4" />
              
              <div className="flex items-center">
                <div className="w-2.5 h-2.5 rounded-full mr-4 bg-[#f93a3a]" />
                <input
                  type="text"
                  value={activeField === 'to' ? searchQuery : toLocation}
                  onChange={(e) => activeField === 'to' ? handleSearchChange(e.target.value) : setToLocation(e.target.value)}
                  onFocus={() => setActiveField('to')}
                  placeholder="To"
                  className="flex-1 bg-transparent border-none outline-none text-gray-700 text-lg font-medium placeholder-gray-400"
                />
              </div>
            </div>
          </div>

          <div className="bg-white mx-4 mt-4 rounded-lg shadow-sm overflow-hidden" style={{width: 'calc(100% - 32px)', height: 'calc(100% - 220px)'}}>
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800">All Stations</h3>
            </div>
            
            <div className="overflow-y-auto scrollbar-hide" style={{height: 'calc(100% - 120px)'}}>
              {loading ? (
                <div className="flex items-center justify-center py-8 text-gray-500">Loading stations...</div>
              ) : filteredStations.length === 0 ? (
                <div className="flex items-center justify-center py-8 text-gray-500">No stations found</div>
              ) : (
                filteredStations.map((station, index) => (
                  <div
                    key={`${station.name}-${index}`}
                    onClick={() => handleStationSelect(station)}
                    className="px-4 py-3 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors"
                  >
                    <div className="text-gray-700 text-base font-medium">{station.name}</div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </MobileContainer>
    );
  }

  const showFooter = fromLocation && toLocation && passengerCount > 0;

  return (
    <MobileContainer width={540} height={1088}>
      <div className="w-[540px] h-[1088px] relative overflow-hidden">
        <img className="w-[540px] h-[1088px] absolute inset-0" src="https://placehold.co/540x1088" alt="Background" />
        
        <div className="w-[540px] h-[1009px] left-0 top-[73px] absolute bg-[#e4e5e5]">
          <div className="w-[540px] h-96 left-0 top-[15px] absolute">
            <div className={`w-[540px] h-20 left-0 absolute transition-all duration-300`} style={{ top: showMaxPassengerError ? '339px' : '297px' }}>
              <img className="w-5 h-5 left-[16px] top-[24px] absolute" src={infoIcon} alt="Info" />
              <p className="left-[51px] top-[13px] absolute text-neutral-400 text-base">
                By booking metro tickets on Tummoc, you are agreeing to <span className="text-cyan-500 font-medium">Terms and Conditions</span>
              </p>
            </div>
            
            <div className={`w-[510px] left-[14px] top-0 absolute transition-all duration-300`} style={{ height: showMaxPassengerError ? '330px' : '288px' }}>
              <div className={`w-[508px] left-[2px] top-[3px] absolute bg-white rounded-md transition-all duration-300`} style={{ height: showMaxPassengerError ? '327px' : '285px' }} />
              
              {showMaxPassengerError && (
                <div className="w-[440px] left-[35px] top-[165px] absolute bg-red-50 rounded-lg px-4 py-3">
                  <p className="text-red-600 text-center text-base font-medium">
                    You can book tickets for up to {MAX_PASSENGERS} passengers at a time
                  </p>
                </div>
              )}
              
              <div className={`w-[509px] h-32 left-[1px] absolute transition-all duration-300`} style={{ top: showMaxPassengerError ? '213px' : '173px' }}>
                <div 
                  className="w-14 h-14 left-[425px] top-[30px] absolute rounded-2xl flex items-center justify-center cursor-pointer"
                  style={{ backgroundColor: passengerCount < MAX_PASSENGERS ? '#11bbc3' : '#f5f5f5' }}
                  onClick={incrementCount}
                >
                  <Plus className={`w-8 h-8 ${passengerCount < MAX_PASSENGERS ? 'text-white' : 'text-gray-400'}`} />
                </div>
                <div className="w-5 h-7 left-[384px] top-[43px] absolute text-center text-neutral-700 text-2xl">{passengerCount}</div>
                <div 
                  className="w-14 h-14 left-[309px] top-[30px] absolute rounded-xl flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity"
                  style={{ backgroundColor: (fromLocation && toLocation ? passengerCount > 1 : passengerCount > 0) ? '#11bbc3' : '#f5f5f5' }}
                  onClick={decrementCount}
                >
                  <Minus className={`w-8 h-8 ${(fromLocation && toLocation ? passengerCount > 1 : passengerCount > 0) ? 'text-white' : 'text-gray-400'}`} />
                </div>
                <img className="w-8 h-6 left-[29px] top-[38px] absolute" src={passengersIcon} alt="Passengers" />
                <div className="left-[83px] top-[29px] absolute text-gray-600 text-xl font-bold">Passenger</div>
                {fare > 0 && (
                  <div className="left-[83px] top-[60px] absolute text-gray-600 text-base font-bold">
                    ₹ {fare.toFixed(2)}/Ticket
                  </div>
                )}
              </div>
              
              <div className="w-[496px] h-px left-[8px] top-[151px] absolute bg-neutral-200" />
              
              <div className="w-[509px] h-36 left-[1px] top-[1px] absolute">
                <div 
                  className="w-10 h-10 left-[460px] top-[60px] absolute rounded-full flex items-center justify-center border-2 bg-[#fffeff] border-[#efeeee] cursor-pointer hover:opacity-80 transition-opacity" 
                  onClick={handleSwapLocations}
                >
                  <ArrowUpDown className="w-5 h-5 text-black" />
                </div>
                
                <div onClick={handleToClick} className="cursor-pointer">
                  <input 
                    type="text"
                    value={toLocation}
                    placeholder="To"
                    className="w-80 h-5 left-[73px] top-[98px] absolute bg-transparent border-none outline-none text-stone-700 text-xl font-semibold placeholder-stone-300 cursor-pointer"
                    readOnly
                  />
                </div>
                <div className="w-2.5 h-2.5 left-[36px] top-[101px] absolute rounded-full bg-[#f93a3a]" />
                
                <div className="w-96 h-0.5 left-[65px] top-[78px] absolute bg-[#e1e1e1]" />
                
                <div className="w-1 h-7 left-[39px] top-[66px] absolute flex flex-col justify-center items-center gap-1">
                  <div className="w-1 h-1 rounded-full bg-[#bebfbf]" />
                  <div className="w-1 h-1 rounded-full bg-[#bebfbf]" />
                  <div className="w-1 h-1 rounded-full bg-[#bebfbf]" />
                </div>
                
                <div onClick={handleFromClick} className="cursor-pointer">
                  <input 
                    type="text"
                    value={fromLocation}
                    placeholder="From"
                    className="w-80 h-5 left-[74px] top-[37px] absolute bg-transparent border-none outline-none text-stone-700 text-xl font-semibold placeholder-stone-300 cursor-pointer"
                    readOnly
                  />
                </div>
                <div className="w-2.5 h-2.5 left-[36px] top-[46px] absolute rounded-full bg-[#9aca46]" />
              </div>
            </div>
          </div>
        </div>
        {showFooter && (
          <div className="w-[540px] h-20 left-0 top-[950px] absolute bg-white shadow-lg border-t border-gray-200">
            <div className="flex items-center justify-between px-6 py-4">
              <div className="flex flex-col">
                <div className="text-black text-3xl font-bold">₹ {totalFare}</div>
                <div className="text-gray-500 text-lg font-semibold">{passengerCount} Passenger{passengerCount > 1 ? 's' : ''}</div>
              </div>
              <button 
                className="text-white px-12 py-3 rounded-lg font-semibold bg-[#11bbc3] hover:bg-[#0fa0a7] transition-colors"
                onClick={handleProceedToPay}
              >
                Proceed to Buy
              </button>
            </div>
          </div>
        )}
        
        <div className={`w-[540px] h-16 left-0 top-[1030px] absolute ${showFooter ? 'bg-white' : 'flex items-center justify-center'}`}>
          {showFooter ? (
            <>
              <div className="left-[50px] top-[14px] absolute text-zinc-500 text-base">Part of</div>
              <img className="w-12 h-5 left-[110px] top-[18px] absolute object-contain" src={ondcLogo} alt="ONDC" />
              <div className="left-[165px] top-[15px] absolute text-zinc-500 text-base">Network</div>
              <div className="w-1 h-8 left-[250px] top-[8px] absolute bg-gray-300" />
              <div className="left-[270px] top-[15px] absolute text-zinc-500 text-base whitespace-nowrap">Powered by BMRL</div>
              <img className="w-12 h-6 left-[420px] top-[13px] absolute object-contain" src={bmrclLogo} alt="BMRCL" />
            </>
          ) : (
            <div className="flex items-center gap-2 text-zinc-500 text-base">
              <span>Part of</span>
              <img className="w-12 h-5 object-contain" src={ondcLogo} alt="ONDC" />
              <span>Network</span>
            </div>
          )}
        </div>
        
        <div className="w-[540px] h-16 left-0 top-0 absolute bg-[#fefefd]">
          <div className="left-[66px] top-[20px] absolute text-gray-500 text-xl">Book ticket</div>
          <img 
            className="w-5 h-5 left-[23px] top-[23px] absolute cursor-pointer" 
            src={backArrow} 
            alt="Back"
            onClick={handleBack}
          />
        </div>

        {showSuccessDialog && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="w-[420px] bg-white rounded-2xl border-2 border-gray-200 shadow-xl">
              <div className="flex flex-col items-center py-10 px-8">
                <div className="mb-6">
                  <img src={tickMarkAnimation} alt="Success" className="w-24 h-24" />
                </div>

                <h2 className="text-center text-2xl font-semibold text-gray-800 mb-6">
                  Metro Ticket Purchased Successfully!
                </h2>

                <div className="text-3xl font-semibold text-gray-700 mb-2">
                  ₹ {totalFare}
                </div>

                <div className="text-center text-gray-500 text-base mb-8">
                  {passengerCount} Passenger{passengerCount > 1 ? 's' : ''} • {fromLocation} to {toLocation}
                </div>

                <button
                  onClick={() => {
                    setShowSuccessDialog(false);
                    setFromLocation('');
                    setToLocation('');
                    setPassengerCount(0);
                  }}
                  className="w-full py-3 px-6 bg-[#11bbc3] hover:bg-[#0fa0a7] text-white text-lg font-medium rounded-lg transition-colors"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Payment Method Modal */}
      <PaymentMethod
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        totalAmount={totalFare}
        tummocBalance={tummocBalance}
        onPaymentSelect={handlePaymentSelect}
        onAddMoney={handleAddMoney}
      />
    </MobileContainer>
  );
}

export default Metro;