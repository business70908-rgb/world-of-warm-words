import { MobileContainer } from "@/components/MobileContainer";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowUpDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { useBMTCRoutes } from "@/hooks/useBMTCRoutes";
import { PaymentMethod } from "@/components/PaymentMethod";
import { useToast } from "@/hooks/use-toast";
import { authenticateForPayment } from '@/lib/biometricAuth';
import { walletStorage } from '@/lib/storage/walletStorage';
import busIcon from "@/assets/bus-icon.png";
import metroIcon from "@/assets/metro-icon.png";
import trainIcon from "@/assets/Train.png";
import locationGrey from "@/assets/Location-grey.png";
import locationLocation from "@/assets/Location-Location.png";
import walkingIcon from "@/assets/Walking.png";
import infoIconGrey from "@/assets/info-icon-grey.png";
import moneyIcon from "@/assets/Money.png";
import fiveF from "@/assets/5f.gif";
import busImage from "@/assets/Bus.png";
import metro2 from "@/assets/Metro-2.png";
import bookBack from "@/assets/book-back.png";
import leaf1 from "@/assets/leaf-1.png";
import passengerIcon from "@/assets/passenger-icon.png";
import carImage from "@/assets/Car.png";
import sedanImage from "@/assets/Sedan.png";
import olaLogo from "@/assets/Ola.png";
import rapidoBikeLogo from "@/assets/Rapid0-bike.png";
import rapidoLogo from "@/assets/Rapido.png";
import autoImage from "@/assets/Auto.png";
import nammaYatriLogo from "@/assets/Namma-yatri.png";
import locationPinGreen from "@/assets/location-pin-green.png";
import newBackArrow from "@/assets/new-back-arrow.png";

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface RideOption {
  type: string;
  provider: string;
  baseFare: number;
  perKm: number;
  passengers: number;
  co2Saving: number;
}

interface RouteBooking {
  journeyType: string;
  fare: number;
  busNumber?: string;
  duration: string;
}

const Direction = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  
  // Get source and destination from URL parameters
  const sourceParam = searchParams.get("source");
  const destinationParam = searchParams.get("destination");
  
  const [source, setSource] = useState(sourceParam || "846, Ranganathapura, Kesava Upan");
  const [destination, setDestination] = useState(destinationParam || "Kammanahalli, Bengaluru, Karnatakc");
  const [distance, setDistance] = useState(2); // Default 2km
  const [selectedTab, setSelectedTab] = useState("all");
  const [showAllRoutes, setShowAllRoutes] = useState(false);
  const [showPaymentMethod, setShowPaymentMethod] = useState(false);
  const [tummocBalance, setTummocBalance] = useState(0);
  const [selectedRide, setSelectedRide] = useState<RideOption | null>(null);
  const [selectedRoute, setSelectedRoute] = useState<RouteBooking | null>(null);
  const {
    routes,
    loading,
    fetchRoutes
  } = useBMTCRoutes();
  const GEOAPIFY_API_KEY = "62fcaecff3f74241bf1a08e641e7b0bb";
  useEffect(() => {
    const loadBalance = async () => {
      const balance = await walletStorage.getBalance();
      setTummocBalance(balance);
    };
    
    loadBalance();

    // Load RazorPay script
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  useEffect(() => {
    if (source && destination) {
      calculateDistance();
      fetchRoutes(source, destination, selectedTab);
    }
    // Reset showAllRoutes when tab changes
    setShowAllRoutes(false);
  }, [source, destination, selectedTab]);
  const calculateDistance = async () => {
    try {
      // For demo purposes, using a fixed distance of 2km
      // In production, you would geocode addresses and calculate actual distance
      setDistance(2);
    } catch (error) {
      console.error("Error calculating distance:", error);
      setDistance(2);
    }
  };
  const rideOptions = [
    ...Array.from({ length: Math.floor(Math.random() * 25) + 1 }, (_, i) => {
      const types = ['Car', 'Sedan', 'Bike', 'Auto'];
      const providers = ['Ola', 'Rapido', 'Namma Yatri', 'Uber'];
      const type = types[Math.floor(Math.random() * types.length)];
      const provider = providers[Math.floor(Math.random() * providers.length)];
      
      const images = {
        'Car': carImage,
        'Sedan': sedanImage,
        'Bike': rapidoBikeLogo,
        'Auto': autoImage
      };
      
      const logos = {
        'Ola': olaLogo,
        'Rapido': rapidoLogo,
        'Namma Yatri': nammaYatriLogo,
        'Uber': olaLogo // Using Ola logo as fallback
      };
      
      const baseFares = {
        'Car': Math.floor(Math.random() * 30) + 20,
        'Sedan': Math.floor(Math.random() * 40) + 30,
        'Bike': Math.floor(Math.random() * 10),
        'Auto': Math.floor(Math.random() * 20) + 5
      };
      
      const perKmRates = {
        'Car': Math.floor(Math.random() * 10) + 12,
        'Sedan': Math.floor(Math.random() * 8) + 10,
        'Bike': Math.floor(Math.random() * 3) + 4,
        'Auto': Math.floor(Math.random() * 5) + 6
      };
      
      const passengers = {
        'Car': 4,
        'Sedan': 6,
        'Bike': 1,
        'Auto': 3
      };
      
      const co2Savings = {
        'Car': 70,
        'Sedan': 70,
        'Bike': 35,
        'Auto': 50
      };
      
      return {
        type,
        provider,
        image: images[type as keyof typeof images],
        logo: logos[provider as keyof typeof logos],
        baseFare: baseFares[type as keyof typeof baseFares],
        perKm: perKmRates[type as keyof typeof perKmRates],
        passengers: passengers[type as keyof typeof passengers],
        co2Saving: co2Savings[type as keyof typeof co2Savings]
      };
    })
  ];
  const calculateFare = (baseFare: number, perKm: number) => {
    return baseFare + perKm * distance;
  };
  const handleSwapLocations = () => {
    const temp = source;
    setSource(destination);
    setDestination(temp);
  };

  const handleBookRide = (ride: RideOption) => {
    setSelectedRide(ride);
    setSelectedRoute(null);
    setShowPaymentMethod(true);
  };

  const handleBookRoute = (route: RouteBooking) => {
    setSelectedRoute(route);
    setSelectedRide(null);
    setShowPaymentMethod(true);
  };

  const handlePaymentMethodSelect = async (method: 'tummoc' | 'razorpay') => {
    setShowPaymentMethod(false);

    // Determine fare and description based on what was selected
    let fare = 0;
    let description = '';

    if (selectedRide) {
      fare = calculateFare(selectedRide.baseFare, selectedRide.perKm);
      description = `Book ${selectedRide.type} ride via ${selectedRide.provider}`;
    } else if (selectedRoute) {
      fare = selectedRoute.fare;
      const routeType = selectedRoute.journeyType === 'bus-only' ? 'Bus' :
                        selectedRoute.journeyType === 'metro-only' ? 'Metro' :
                        selectedRoute.journeyType === 'bus-metro' ? 'Bus & Metro' :
                        selectedRoute.journeyType === 'train-only' ? 'Train' : 'Transit';
      description = `Book ${routeType} journey${selectedRoute.busNumber ? ` - ${selectedRoute.busNumber}` : ''}`;
    } else {
      return;
    }

    const rideFare = fare;

    if (method === 'tummoc') {
      // Use Tummoc Money with device authentication
      await handleDeviceAuth(rideFare, method);
    } else {
      // Check for RazorPay API key from localStorage (Account Settings)
      const razorpayApiKey = localStorage.getItem('razorpayApiKey');
      
      if (razorpayApiKey && window.Razorpay) {
        // Use RazorPay Gateway
        const options = {
          key: razorpayApiKey,
          amount: rideFare * 100, // Convert to paise
          currency: "INR",
          name: selectedRoute ? "Tummoc Transit" : "Tummoc Ride",
          description: description,
          handler: function (response: any) {
            handlePaymentSuccess(rideFare, method);
          },
          prefill: {
            name: "User",
            email: "user@example.com",
            contact: "9999999999",
          },
          theme: {
            color: "#06b6d4",
          },
        };
        
        const rzp = new window.Razorpay(options);
        rzp.open();
      } else {
        // No API key found - use device authentication
        await handleDeviceAuth(rideFare, method);
      }
    }
  };

  const handleDeviceAuth = async (rideFare: number, method: 'tummoc' | 'razorpay') => {
    const bookingDescription = selectedRide 
      ? `${selectedRide.type} ride via ${selectedRide.provider}` 
      : selectedRoute?.journeyType === 'bus-only' ? 'Bus journey'
      : selectedRoute?.journeyType === 'metro-only' ? 'Metro journey'
      : selectedRoute?.journeyType === 'bus-metro' ? 'Bus & Metro journey'
      : selectedRoute?.journeyType === 'train-only' ? 'Train journey'
      : 'Transit journey';

    await authenticateForPayment(
      rideFare,
      bookingDescription,
      () => {
        // Payment success
        handlePaymentSuccess(rideFare, method);
      },
      () => {
        // Payment cancelled
        toast({
          title: "Payment Cancelled",
          description: "Payment was not completed. Please try again.",
          variant: "destructive",
        });
      }
    );
  };

  const handlePaymentSuccess = async (rideFare: number, method: 'tummoc' | 'razorpay') => {
    // Determine description based on what was booked
    let transactionDescription = '';
    let successDescription = '';

    if (selectedRide) {
      transactionDescription = `Book ${selectedRide.type} ride via ${selectedRide.provider}`;
      successDescription = `Your ${selectedRide.type} ride has been booked successfully.`;
    } else if (selectedRoute) {
      const routeType = selectedRoute.journeyType === 'bus-only' ? 'Bus' :
                        selectedRoute.journeyType === 'metro-only' ? 'Metro' :
                        selectedRoute.journeyType === 'bus-metro' ? 'Bus & Metro' :
                        selectedRoute.journeyType === 'train-only' ? 'Train' : 'Transit';
      transactionDescription = `Book ${routeType} journey${selectedRoute.busNumber ? ` - ${selectedRoute.busNumber}` : ''}`;
      successDescription = `Your ${routeType} journey has been booked successfully.`;
    }

    if (method === 'tummoc') {
      // Deduct from Tummoc balance
      const newBalance = Math.max(0, tummocBalance - rideFare);
      await walletStorage.updateBalance(newBalance);
      setTummocBalance(newBalance);

      // Save transaction only for Tummoc Money payments
      await walletStorage.addTransaction({
        id: Date.now().toString(),
        type: 'debit',
        amount: rideFare,
        description: transactionDescription,
        timestamp: Date.now(),
        paymentMethod: 'tummoc',
      });
    }

    // Show success message
    toast({
      title: "Booking Confirmed!",
      description: successDescription,
    });

    // Reset selections
    setSelectedRide(null);
    setSelectedRoute(null);
  };
  return <MobileContainer width={698} height={1440}>
      <div className="w-[698px] h-[1440px] flex flex-col bg-white/95">
        {/* Fixed Header Section - 272px */}
        <div className="w-full flex-shrink-0" style={{
        height: '272px'
      }}>
          <div className="w-[698px] h-72 bg-teal-950 relative header-teal-fix">
            <svg className="w-6 h-5 left-[559px] top-[125px] absolute cursor-pointer" viewBox="0 0 16 15" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M8 12.5C8 12.5 2 8 2 5C2 3.5 3.5 2 5 2C6.5 2 8 3 8 3S9.5 2 11 2C12.5 2 14 3.5 14 5C14 8 8 12.5 8 12.5Z" stroke="#9CA3AF" strokeWidth="1.2" fill="none" />
            </svg>
            <div 
              onClick={() => navigate(-1)} 
              className="w-80 h-7 left-[135px] top-[122px] absolute text-gray-400 text-lg font-normal font-['Inter'] cursor-pointer flex items-center"
            >
              {destination || "Enter destination"}
            </div>
            <img className="w-4 h-6 left-[91px] top-[124px] absolute" src={locationPinGreen} />
            <div className="w-11 h-11 left-[627px] top-[71px] absolute rounded-3xl bg-white flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity border border-gray-200" onClick={handleSwapLocations}>
              <ArrowUpDown className="w-5 h-5 text-black" />
            </div>
            <div className="w-[489px] h-0.5 left-[130px] top-[93px] absolute bg-stone-300" />
            <div className="w-1 h-8 left-[96px] top-[75px] absolute flex flex-col justify-between items-center">
              <div className="w-1 h-1 rounded-full bg-gray-400" />
              <div className="w-1 h-1 rounded-full bg-gray-400" />
              <div className="w-1 h-1 rounded-full bg-gray-400" />
            </div>
            <svg className="w-6 h-5 left-[559px] top-[43px] absolute cursor-pointer" viewBox="0 0 16 15" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M8 12.5C8 12.5 2 8 2 5C2 3.5 3.5 2 5 2C6.5 2 8 3 8 3S9.5 2 11 2C12.5 2 14 3.5 14 5C14 8 8 12.5 8 12.5Z" stroke="#9CA3AF" strokeWidth="1.2" fill="none" />
            </svg>
            <div 
              onClick={() => navigate(-1)} 
              className="w-80 h-7 left-[134px] top-[39px] absolute text-gray-400 text-lg font-normal font-['Inter'] cursor-pointer flex items-center"
            >
              {source || "Enter source"}
            </div>
            <div className="w-3 h-3 left-[91px] top-[48px] absolute rounded-full bg-blue-500 border-2 border-white shadow-lg" />
            <img className="w-7 h-7 left-[33px] top-[57px] absolute cursor-pointer" src={newBackArrow} onClick={() => navigate(-1)} />
            
            <div className="w-[698px] h-24 left-0 top-[189px] absolute bg-black/0">
              <div className="w-28 h-14 left-[555px] top-[13px] absolute bg-black/0">
                <div className="w-28 h-12 left-[5px] top-[5px] absolute bg-teal-950 rounded-3xl border-4" style={{
                borderColor: '#80b971'
              }} />
                <div className="w-full h-12 left-[5px] top-[5px] absolute flex items-center justify-center gap-1.5">
                  <svg className="w-5 h-7" viewBox="0 0 16 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M8 3L2 9L14 9L8 3Z" fill="#80b971" />
                    <path d="M8 25L14 19L2 19L8 25Z" fill="#80b971" />
                  </svg>
                  <div className="text-xl font-normal font-['Inter']" style={{
                  color: '#80b971'
                }}>Sort</div>
                </div>
              </div>
              <div className="w-60 h-14 left-[24px] top-[14px] absolute bg-black/0">
                <div className="w-60 h-12 left-[5px] top-[5px] absolute bg-teal-950 rounded-3xl border-4" style={{
                borderColor: '#80b971'
              }} />
                <div className="w-60 h-12 left-[5px] top-[5px] absolute flex items-center gap-3 px-4">
                  <svg className="w-6 h-6" viewBox="0 0 26 26" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="13" cy="13" r="11" stroke="#80b971" strokeWidth="2" />
                    <path d="M13 7V13L17 15" stroke="#80b971" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                  <div className="flex-1 text-2xl font-normal font-['Inter'] ml-2" style={{
                  color: '#80b971'
                }}>Depart now</div>
                  <svg className="w-4 h-3 -ml-4" viewBox="0 0 13 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M6.5 7L1 1L12 1L6.5 7Z" fill="#80b971" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Fixed Tabs Section - 192px */}
        <div className="w-full flex-shrink-0" style={{
        height: '192px',
        backgroundColor: '#FEFEFE'
      }}>
          <div className="w-[698px] h-48 relative">
            <div className="w-[696px] h-36 left-[2px] top-[24px] absolute bg-black/0 overflow-x-auto scrollbar-hide scroll-smooth" style={{
            WebkitOverflowScrolling: 'touch',
            touchAction: 'pan-x'
          }}>
              <div className="w-24 h-36 left-[604px] top-[2px] absolute bg-black/0 cursor-pointer" onClick={() => setSelectedTab('walk')}>
                <div className="w-24 h-32 left-[3px] top-[5px] absolute bg-black/0">
                  <div className={`w-24 h-32 left-[4px] top-[5px] absolute rounded-tl-3xl rounded-tr-[10px] rounded-bl-3xl rounded-br-[10px] border ${selectedTab === 'walk' ? 'bg-lime-400 border-stone-400' : 'bg-white border-neutral-200'} flex flex-col items-center justify-between pt-6 pb-3`}>
                    <img className="w-8 h-10" src={walkingIcon} />
                    <div className={`text-2xl font-normal font-['Inter'] ${selectedTab === 'walk' ? 'text-lime-900' : 'text-neutral-500'}`}>Walk</div>
                  </div>
                </div>
              </div>
              <div className="w-28 h-32 left-[491px] top-[2px] absolute bg-black/0 cursor-pointer" onClick={() => setSelectedTab('direct')}>
                <div className="w-24 h-32 left-[7px] top-[3px] absolute bg-black/0">
                  <div className={`w-24 h-32 left-[6px] top-[5px] absolute rounded-3xl border ${selectedTab === 'direct' ? 'bg-lime-400 border-stone-400' : 'bg-white border-neutral-200'} flex flex-col items-center pt-6 pb-3`}>
                    <img className="w-7 h-7 mt-2" src={locationLocation} />
                    <div className={`text-2xl font-normal font-['Inter'] mt-auto ${selectedTab === 'direct' ? 'text-lime-900' : 'text-neutral-500'}`}>Direct</div>
                  </div>
                </div>
              </div>
              <div className="w-36 h-36 left-[340px] top-[2px] absolute bg-black/0 cursor-pointer" onClick={() => setSelectedTab('airport-rail')}>
                <div className="w-36 h-32 left-0 top-[5px] absolute bg-black/0">
                  <div className={`w-36 h-32 left-[3px] top-[5px] absolute rounded-3xl border ${selectedTab === 'airport-rail' ? 'bg-lime-400 border-stone-400' : 'bg-white border-neutral-200'} flex flex-col items-center pt-2`}>
                    <img className="w-20 h-20 -mt-2" src={trainIcon} />
                    <div className={`text-2xl font-normal font-['Inter'] -mt-1 ${selectedTab === 'airport-rail' ? 'text-lime-900' : 'text-zinc-600'}`}>Airport Rail</div>
                  </div>
                </div>
              </div>
              <div className="w-28 h-36 left-[226px] top-[1px] absolute bg-black/0 cursor-pointer" onClick={() => setSelectedTab('metro')}>
                <div className="w-24 h-32 left-[4px] top-[4px] absolute bg-black/0">
                  <div className={`w-24 h-32 left-[5px] top-[5px] absolute rounded-3xl border ${selectedTab === 'metro' ? 'bg-lime-400 border-stone-400' : 'bg-white border-gray-200'} flex flex-col items-center justify-between pt-6 pb-3`}>
                    <img className="w-8 h-11" src={metroIcon} />
                    <div className={`text-2xl font-normal font-['Inter'] ${selectedTab === 'metro' ? 'text-lime-900' : 'text-neutral-500'}`}>Metro</div>
                  </div>
                </div>
              </div>
              <div className="w-24 h-32 left-[123px] top-[2px] absolute bg-black/0 cursor-pointer" onClick={() => setSelectedTab('bus')}>
                <div className="w-24 h-32 left-[3px] top-[3px] absolute bg-black/0">
                  <div className={`w-24 h-32 left-[2px] top-[5px] absolute rounded-3xl border ${selectedTab === 'bus' ? 'bg-lime-400 border-stone-400' : 'bg-white border-neutral-200'} flex flex-col items-center justify-between pt-6 pb-3`}>
                    <img className="w-8 h-8" src={busIcon} />
                    <div className={`text-2xl font-normal font-['Inter'] ${selectedTab === 'bus' ? 'text-lime-900' : 'text-neutral-500'}`}>Bus</div>
                  </div>
                </div>
              </div>
              <div className="w-28 h-32 left-0 top-[2px] absolute bg-black/0 cursor-pointer" onClick={() => setSelectedTab('all')}>
                <div className="w-24 h-32 left-[15px] top-[3px] absolute bg-black/0">
                  <div className={`w-24 h-32 left-[5px] top-[4px] absolute rounded-3xl border ${selectedTab === 'all' ? 'bg-lime-400 border-stone-400' : 'bg-white border-neutral-200'} flex flex-col items-center justify-between pt-6 pb-3`}>
                    <img className="w-5 h-7" src={locationGrey} />
                    <div className={`text-2xl font-normal font-['Inter'] ${selectedTab === 'all' ? 'text-lime-900' : 'text-neutral-500'}`}>All</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scrollable Content Area - Remaining height */}
        <div className="flex-1 w-full overflow-y-auto" style={{
        backgroundColor: '#FEFEFD'
      }}>
          <div className="w-full px-[19px] py-5">
            {/* Show Direct Ride Cards for direct tab */}
            {selectedTab === 'direct' && <div className="w-full">
                <div className="flex justify-between items-center mb-5">
                  <div className="text-zinc-600 text-2xl font-normal font-['Inter']">NEED A DIRECT RIDE?</div>
                  <div className="flex items-center gap-2">
                    <div className="text-neutral-500 text-2xl font-bold font-['Inter']">CO₂e saving & emission</div>
                    <img className="w-7 h-7" src={infoIconGrey} />
                  </div>
                </div>

                {/* NOW YOU CAN PAY DIRECTLY */}
                <div className="w-full mb-5">
                  <div className="w-full bg-blue-50 rounded-lg border border-gray-400 flex items-center gap-4 px-6 py-5">
                    <img className="w-14 h-14 flex-shrink-0" src={moneyIcon} />
                    <div className="flex-1 text-2xl font-normal font-['Inter'] leading-relaxed" style={{
                  color: '#0752fc'
                }}>Now you can pay directly to driver via Cash or UPI after ride is completed</div>
                  </div>
                </div>
                
                {rideOptions.map((ride, index) => <div key={index} className="w-full mb-5 relative bg-white rounded-[19px] border border-gray-200 p-4">
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <img className="w-14 h-12" src={ride.image} />
                          <div>
                            <div className="flex items-center gap-8">
                              <div className="text-zinc-700 text-3xl font-normal font-['Inter'] ml-3">{ride.type}</div>
                              <div className="flex items-center gap-2">
                                <img className="w-5 h-5" src={passengerIcon} />
                                <div className="text-neutral-600 text-2xl font-normal font-['Inter']">{ride.passengers}</div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              <img className="w-10 h-9 rounded-[19px]" src={ride.logo} />
                              <div className="text-neutral-500 text-xl font-normal font-['Inter']">{ride.provider}</div>
                            </div>
                          </div>
                        </div>
                        <div className="text-neutral-500 text-3xl font-bold font-['Inter']">₹{calculateFare(ride.baseFare, ride.perKm)}</div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 bg-green-100 rounded border border-gray-200 px-4 py-2">
                          <img className="w-7 h-7" src={leaf1} />
                          <div className="text-lg font-bold font-['Inter']" style={{
                      color: '#80b971'
                    }}>{ride.co2Saving * distance}g CO₂e saving</div>
                        </div>
                        
                        <div 
                          className="bg-cyan-500 rounded-2xl border border-teal-400 px-8 py-3 cursor-pointer hover:bg-cyan-600 transition-colors"
                          onClick={() => handleBookRide(ride)}
                        >
                          <div className="text-2xl font-bold font-['Inter']" style={{
                      color: '#FEFEFE'
                    }}>Book Now</div>
                        </div>
                      </div>
                    </div>
                  </div>)}
              </div>}

            {/* Dynamic BMTC Routes - Only show for non-direct tabs */}
            {selectedTab !== 'direct' && <>
                {loading ? <div className="w-full h-64 flex items-center justify-center">
                    <div className="text-2xl text-gray-500">Loading routes...</div>
                  </div> : selectedTab === 'airport-rail' && routes.length === 0 ? <div className="w-full h-64 flex items-center justify-center">
                    <div className="text-2xl text-gray-500">Not Available</div>
                  </div> : routes.length > 0 ? <>
                    {(showAllRoutes ? routes : routes.slice(0, 5)).map((route, routeIndex) => <div key={routeIndex} className="w-full mb-5 relative">
                        <div className={`w-full rounded-[19px] border-2 border-gray-300 ${route.journeyType === 'walk' ? 'p-4' : 'p-6'}`} style={{
                  backgroundColor: '#FEFEFD'
                }}>
                          {/* Route Steps - Conditional Rendering */}
                          <div className="flex items-center gap-2 mb-4">
                            {route.journeyType === 'bus-only' && <>
                                <img className="w-6 h-6" src={fiveF} />
                                <svg className="w-2.5 h-4" viewBox="0 0 10 17" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <path d="M2 2L8 8.5L2 15" stroke="#000000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                                <img className="w-14 h-14" src={busImage} />
                                <div className="bg-blue-600 rounded-2xl border-4 border-blue-700 px-4 py-2">
                                  <div className="text-2xl font-normal font-['Inter']" style={{
                          color: '#FEFEFE'
                        }}>{route.busNumber}</div>
                                </div>
                                <svg className="w-2.5 h-4" viewBox="0 0 10 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <path d="M2 2L8 8L2 14" stroke="#000000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                                <img className="w-6 h-6" src={fiveF} />
                              </>}
                            
                            {route.journeyType === 'metro-only' && <>
                                <img className="w-6 h-6" src={fiveF} />
                                <svg className="w-2.5 h-4" viewBox="0 0 10 17" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <path d="M2 2L8 8.5L2 15" stroke="#000000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                                <img className="w-16 h-16" src={metro2} />
                                <div className="bg-fuchsia-900 rounded-xl border border-fuchsia-800 px-4 py-2">
                                  <div className="text-2xl font-bold font-['Inter']" style={{
                          color: '#FEFEFE'
                        }}>METRO</div>
                                </div>
                                <svg className="w-2 h-4" viewBox="0 0 10 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <path d="M2 2L8 8L2 14" stroke="#000000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                                <img className="w-6 h-6" src={fiveF} />
                              </>}
                            
                            {route.journeyType === 'bus-metro' && <>
                                <img className="w-6 h-6" src={fiveF} />
                                <svg className="w-2.5 h-4" viewBox="0 0 10 17" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <path d="M2 2L8 8.5L2 15" stroke="#000000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                                <img className="w-14 h-14" src={busImage} />
                                <div className="bg-blue-600 rounded-2xl border-4 border-blue-700 px-4 py-2">
                                  <div className="text-2xl font-normal font-['Inter']" style={{
                          color: '#FEFEFE'
                        }}>{route.busNumber}</div>
                                </div>
                                <svg className="w-2.5 h-4" viewBox="0 0 10 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <path d="M2 2L8 8L2 14" stroke="#000000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                                <img className="w-6 h-6" src={fiveF} />
                                <svg className="w-2.5 h-4" viewBox="0 0 10 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <path d="M2 2L8 8L2 14" stroke="#000000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                                <img className="w-16 h-16" src={metro2} />
                                <div className="bg-fuchsia-900 rounded-xl border border-fuchsia-800 px-4 py-2">
                                  <div className="text-2xl font-bold font-['Inter']" style={{
                          color: '#FEFEFE'
                        }}>METRO</div>
                                </div>
                                <svg className="w-2 h-4" viewBox="0 0 10 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <path d="M2 2L8 8L2 14" stroke="#000000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                                <img className="w-6 h-6" src={fiveF} />
                              </>}
                            
                            {route.journeyType === 'train-only' && <>
                                <img className="w-6 h-6" src={fiveF} />
                                <svg className="w-2.5 h-4" viewBox="0 0 10 17" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <path d="M2 2L8 8.5L2 15" stroke="#000000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                                <img className="w-20 h-20" src={trainIcon} />
                                <div className="bg-red-600 rounded-2xl border-4 border-red-700 px-4 py-2 -ml-6">
                                  <div className="text-xl font-normal font-['Inter']" style={{
                          color: '#FEFEFE'
                        }}>{route.busNumber}</div>
                                </div>
                                <svg className="w-2.5 h-4" viewBox="0 0 10 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <path d="M2 2L8 8L2 14" stroke="#000000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                                <img className="w-6 h-6" src={fiveF} />
                              </>}
                            
                            {route.journeyType === 'direct' && <>
                                {route.vehicleType === 'Bike' && <img className="w-14 h-14" src={rapidoBikeLogo} />}
                                {route.vehicleType === 'Car' && <img className="w-14 h-14" src={carImage} />}
                                {route.vehicleType === 'Sedan' && <img className="w-14 h-14" src={sedanImage} />}
                                {route.vehicleType === 'Auto' && <img className="w-14 h-14" src={autoImage} />}
                                <div className="bg-cyan-500 rounded-2xl border-4 border-teal-400 px-4 py-2">
                                  <div className="text-2xl font-normal font-['Inter']" style={{
                          color: '#FEFEFE'
                        }}>{route.vehicleType}</div>
                                </div>
                                {route.distance && <div className="text-lg text-gray-500 ml-2">{route.distance}</div>}
                              </>}
                            
                            {route.journeyType === 'walk' && <>
                                <img className="w-10 h-10" src={walkingIcon} />
                                <div className="bg-green-500 rounded-2xl border-4 border-green-600 px-4 py-2">
                                  <div className="text-2xl font-normal font-['Inter']" style={{
                          color: '#FEFEFE'
                        }}>Walking</div>
                                </div>
                                {route.distance && <div className="text-lg text-gray-500 ml-2">{route.distance}</div>}
                              </>}
                          </div>
                          
                          <div className="w-full h-px bg-fuchsia-900 mb-4" />
                          
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="text-neutral-400 text-lg font-normal font-['Inter'] mb-1">
                                {route.journeyType === 'walk' ? 'Reach in' : 'Reach by'}
                              </div>
                              {route.journeyType === 'walk' ? <div className="text-zinc-600 text-3xl font-normal font-['Inter']">{route.duration}</div> : <>
                                  <div className="text-zinc-500 text-2xl font-normal font-['Inter']">{route.arrivalTime}</div>
                                  <div className="text-stone-500 text-4xl font-normal font-['Inter'] mt-2">₹{route.fare.toFixed(1)}</div>
                                </>}
                            </div>
                            <div className="flex flex-col items-end gap-3">
                              {route.journeyType !== 'walk' && <div className="text-zinc-600 text-3xl font-normal font-['Inter']">~ {route.duration}</div>}
                              <div 
                                className="bg-cyan-500 rounded-2xl border border-teal-400 flex items-center gap-2 px-6 py-3 cursor-pointer hover:bg-cyan-600 transition-colors"
                                onClick={() => {
                                  if (route.journeyType !== 'walk') {
                                    handleBookRoute({
                                      journeyType: route.journeyType,
                                      fare: route.fare,
                                      busNumber: route.busNumber,
                                      duration: route.duration
                                    });
                                  }
                                }}
                              >
                                <img className="w-6 h-6" src={bookBack} />
                                <div className="text-2xl font-normal font-['Inter']" style={{
                          color: '#FEFEFE'
                        }}>
                                  {route.journeyType === 'walk' ? 'Navigate' : 'Book'}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>)}
                    
                    {/* Show More Button */}
                    {routes.length > 5 && !showAllRoutes && <div className="w-full mb-5 flex items-center justify-center gap-2 cursor-pointer" onClick={() => setShowAllRoutes(true)}>
                        <div className="text-cyan-500 text-2xl font-bold font-['Inter']">Show More</div>
                        <svg className="w-4 h-3" viewBox="0 0 13 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M6.5 7L1 1L12 1L6.5 7Z" fill="#06b6d4" />
                        </svg>
                      </div>}
                  </> : null}
              </>}

            {/* Show Direct Ride Options in All Tab */}
            {selectedTab === 'all' && <div className="w-full">
                <div className="flex justify-between items-center mb-5">
                  <div className="text-zinc-600 text-2xl font-normal font-['Inter']">NEED A DIRECT RIDE?</div>
                  <div className="flex items-center gap-2">
                    <div className="text-neutral-500 text-2xl font-bold font-['Inter']">CO₂e saving & emission</div>
                    <img className="w-7 h-7" src={infoIconGrey} />
                  </div>
                </div>

                {/* NOW YOU CAN PAY DIRECTLY */}
                <div className="w-full mb-5">
                  <div className="w-full bg-blue-50 rounded-lg border border-gray-400 flex items-center gap-4 px-6 py-5">
                    <img className="w-14 h-14 flex-shrink-0" src={moneyIcon} />
                    <div className="flex-1 text-2xl font-normal font-['Inter'] leading-relaxed" style={{
                  color: '#0752fc'
                }}>Now you can pay directly to driver via Cash or UPI after ride is completed</div>
                  </div>
                </div>
                
                {rideOptions.map((ride, index) => <div key={index} className="w-full mb-5 relative bg-white rounded-[19px] border border-gray-200 p-4">
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <img className="w-14 h-12" src={ride.image} />
                          <div>
                            <div className="flex items-center gap-8">
                              <div className="text-zinc-700 text-3xl font-normal font-['Inter'] ml-3">{ride.type}</div>
                              <div className="flex items-center gap-2">
                                <img className="w-5 h-5" src={passengerIcon} />
                                <div className="text-neutral-600 text-2xl font-normal font-['Inter']">{ride.passengers}</div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              <img className="w-10 h-9 rounded-[19px]" src={ride.logo} />
                              <div className="text-neutral-500 text-xl font-normal font-['Inter']">{ride.provider}</div>
                            </div>
                          </div>
                        </div>
                        <div className="text-neutral-500 text-3xl font-bold font-['Inter']">₹{calculateFare(ride.baseFare, ride.perKm)}</div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 bg-green-100 rounded border border-gray-200 px-4 py-2">
                          <img className="w-7 h-7" src={leaf1} />
                          <div className="text-lg font-bold font-['Inter']" style={{
                      color: '#80b971'
                    }}>{ride.co2Saving * distance}g CO₂e saving</div>
                        </div>
                        
                        <div 
                          className="bg-cyan-500 rounded-2xl border border-teal-400 px-8 py-3 cursor-pointer hover:bg-cyan-600 transition-colors"
                          onClick={() => handleBookRide(ride)}
                        >
                          <div className="text-2xl font-bold font-['Inter']" style={{
                      color: '#FEFEFE'
                    }}>Book Now</div>
                        </div>
                      </div>
                    </div>
                  </div>)}
              </div>}
          </div>
        </div>
      </div>

      {/* Payment Method Component */}
      <PaymentMethod
        isOpen={showPaymentMethod}
        onClose={() => setShowPaymentMethod(false)}
        totalAmount={
          selectedRide 
            ? calculateFare(selectedRide.baseFare, selectedRide.perKm) 
            : selectedRoute 
              ? selectedRoute.fare 
              : 0
        }
        tummocBalance={tummocBalance}
        onPaymentSelect={handlePaymentMethodSelect}
        onAddMoney={() => {
          setShowPaymentMethod(false);
          navigate('/add-money', { state: { returnPath: '/maps' } });
        }}
      />
    </MobileContainer>;
};
export default Direction;