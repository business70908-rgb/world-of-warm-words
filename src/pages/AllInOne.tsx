import { useNavigate, useSearchParams } from "react-router-dom";
import { useState, useCallback, useEffect, useMemo } from "react";
import { ArrowUpDown } from "lucide-react";
import busIcon from "@/assets/bus-icon.png";
import metroIcon from "@/assets/metro-icon.png";
import errorIcon from "@/assets/_9.png";
import locationMapIcon from "@/assets/location-map-icon.png";
import locationIcon from "@/assets/location-icon.png";
import heartIcon from "@/assets/heart-icon.png";
import locationPinGreen from "@/assets/location-pin-green.png";
import newBackArrow from "@/assets/new-back-arrow.png";
import { MobileContainer } from "@/components/MobileContainer";

const GEOAPIFY_API_KEY = '2d37f93befe44cc6b78c379784c34715';

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

const METRO_STATIONS = [
  'Vijaynagar Metro Station',
  'Hosahalli Metro Station',
  'Attiguppe Metro Station',
  'Rajajinagar Metro Station',
  'Magadi Road Metro Station'
];

const BUS_STATIONS = [
  'Pattegarpalya Circle',
  'KHB Colony',
  'Kamakshipalya'
];

const AllInOne = ({ embedded = false }: { embedded?: boolean }) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const mode = searchParams.get('mode');
  const isRideMode = mode === 'ride';
  const [source, setSource] = useState("");
  const [destination, setDestination] = useState("");
  const [sourceSuggestions, setSourceSuggestions] = useState<AddressSuggestion[]>([]);
  const [destinationSuggestions, setDestinationSuggestions] = useState<AddressSuggestion[]>([]);
  const [activeInput, setActiveInput] = useState<'source' | 'destination' | null>(null);
  

  const fetchSuggestions = useCallback(async (query: string, type: 'source' | 'destination') => {
    if (query.length < 2) {
      if (type === 'source') {
        setSourceSuggestions([]);
      } else {
        setDestinationSuggestions([]);
      }
      return;
    }

    try {
      const response = await fetch(
        `https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(query)}&limit=5&apiKey=${GEOAPIFY_API_KEY}`
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
        
        if (type === 'source') {
          setSourceSuggestions(formattedSuggestions);
        } else {
          setDestinationSuggestions(formattedSuggestions);
        }
      }
    } catch (error) {
      console.error('Error fetching suggestions:', error);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (activeInput === 'source') {
        fetchSuggestions(source, 'source');
      } else if (activeInput === 'destination') {
        fetchSuggestions(destination, 'destination');
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [source, destination, activeInput, fetchSuggestions]);

  const navigateToDirection = useCallback((sourceVal: string, destVal: string) => {
    if (sourceVal && destVal) {
      setTimeout(() => {
        navigate(`/direction?source=${encodeURIComponent(sourceVal)}&destination=${encodeURIComponent(destVal)}`);
      }, 500);
    }
  }, [navigate]);

  const handleSelectSuggestion = useCallback((suggestion: AddressSuggestion, type: 'source' | 'destination') => {
    if (type === 'source') {
      setSource(suggestion.formatted);
      setSourceSuggestions([]);
      setActiveInput(null);
      if (destination) navigateToDirection(suggestion.formatted, destination);
    } else {
      setDestination(suggestion.formatted);
      setDestinationSuggestions([]);
      setActiveInput(null);
      if (source) navigateToDirection(source, suggestion.formatted);
    }
  }, [source, destination, navigateToDirection]);

  const handleStationClick = useCallback((stationName: string) => {
    if (!source) {
      setSource(stationName);
    } else {
      setDestination(stationName);
      navigateToDirection(source, stationName);
    }
  }, [source, navigateToDirection]);

  const handleSwapLocations = useCallback(() => {
    setSource(destination);
    setDestination(source);
  }, [source, destination]);

  const suggestionOffset = useMemo(() => 
    (sourceSuggestions.length > 0 || destinationSuggestions.length > 0) 
      ? Math.max(sourceSuggestions.length, destinationSuggestions.length) * 70 
      : 0
  , [sourceSuggestions.length, destinationSuggestions.length]);

  const activeSuggestions = useMemo(() => 
    activeInput === 'source' ? sourceSuggestions : destinationSuggestions
  , [activeInput, sourceSuggestions, destinationSuggestions]);

  const showSuggestions = sourceSuggestions.length > 0 || destinationSuggestions.length > 0;
  
  // Source/Destination input fields (shared between embedded and standalone)
  const inputFields = (
    <div className="w-[706px] h-40 relative bg-black/0">
      <div className="w-[706px] h-24 left-0 top-[75px] absolute bg-black/0">
        <svg 
          className="w-6 h-5 left-[566px] top-[27px] absolute cursor-pointer" 
          viewBox="0 0 16 15" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M8 12.5C8 12.5 2 8 2 5C2 3.5 3.5 2 5 2C6.5 2 8 3 8 3S9.5 2 11 2C12.5 2 14 3.5 14 5C14 8 8 12.5 8 12.5Z" stroke="#9CA3AF" strokeWidth="1.2" fill="none"/>
        </svg>
        <input
          type="text"
          value={destination}
          onChange={(e) => setDestination(e.target.value)}
          onFocus={() => setActiveInput('destination')}
          placeholder="Enter destination"
          className="w-[450px] left-[69px] top-[24px] absolute bg-transparent border-none outline-none text-gray-400 text-xl font-bold font-['Inter'] placeholder-gray-400"
        />
        <img className="w-4 h-6 left-[24px] top-[26px] absolute" src={locationPinGreen} alt="Location pin" />
      </div>
      <div 
        className="w-11 h-11 left-[627px] top-[53px] absolute rounded-3xl bg-white flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity border border-gray-200"
        onClick={handleSwapLocations}
      >
        <ArrowUpDown className="w-5 h-5 text-black pointer-events-none" />
      </div>
      <div className="w-[550px] h-px left-[60px] top-[70px] absolute bg-gray-400" />
      <div className="w-[528px] h-px left-[64px] top-[76px] absolute bg-gray-800" />
      <div className="w-[3px] h-8 left-[30px] top-[52px] absolute flex flex-col justify-between items-center">
        <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
        <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
        <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
      </div>
      <div className="w-[706px] h-20 left-0 top-0 absolute bg-black/0">
        <svg 
          className="w-6 h-5 left-[566px] top-[20px] absolute cursor-pointer" 
          viewBox="0 0 16 15" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M8 12.5C8 12.5 2 8 2 5C2 3.5 3.5 2 5 2C6.5 2 8 3 8 3S9.5 2 11 2C12.5 2 14 3.5 14 5C14 8 8 12.5 8 12.5Z" stroke="#9CA3AF" strokeWidth="1.2" fill="none"/>
        </svg>
        <input
          type="text"
          value={source}
          onChange={(e) => setSource(e.target.value)}
          onFocus={() => setActiveInput('source')}
          placeholder="Enter source"
          className="w-[450px] h-7 left-[71px] top-[17px] absolute bg-transparent border-none outline-none text-gray-400 text-2xl font-normal font-['Inter'] placeholder-gray-400"
        />
        <div className="w-3 h-3 left-[25px] top-[24px] absolute rounded-full" style={{ backgroundColor: '#18b7bf' }} />
      </div>
    </div>
  );

  // Station list content
  const stationContent = (
    <div className="w-[706px] relative" style={{backgroundColor: '#fefefd'}}>
      {!isRideMode && (
        <>
          <div className="w-[652px] h-px left-[25px] top-[430px] absolute bg-zinc-300" />
          
          {/* Bus Stations */}
          <div 
            className="w-[706px] h-80 absolute bg-black/0 transition-all duration-300"
            style={{ top: `${98 + suggestionOffset}px` }}
          >
            <div className="w-64 h-7 left-[29px] top-[28px] absolute justify-center text-gray-600 text-2xl font-bold font-['Inter']">Bus stations available</div>
            {BUS_STATIONS.map((station, idx) => (
              <div 
                key={station}
                className="w-[706px] h-20 absolute bg-black/0 cursor-pointer hover:bg-gray-50" 
                style={{ top: `${79 + idx * 79}px` }}
                onClick={() => handleStationClick(station)}
              >
                <div className="w-56 h-7 left-[98px] top-[20px] absolute justify-center text-gray-600 text-2xl font-normal font-['Inter']">{station}</div>
                <img className="w-11 h-11 left-[29px] top-[18px] absolute pointer-events-none" src={busIcon} />
              </div>
            ))}
          </div>

          {/* Metro Stations */}
          <div 
            className="w-[706px] h-20 absolute bg-black/0 transition-all duration-300"
            style={{ top: `${434 + suggestionOffset}px` }}
          >
            <div className="w-72 h-7 left-[29px] top-[28px] absolute justify-center text-gray-600 text-2xl font-bold font-['Inter']">Metro stations available</div>
          </div>
          {METRO_STATIONS.map((station, idx) => (
            <div 
              key={station}
              className="w-[706px] h-20 absolute bg-black/0 transition-all duration-300 cursor-pointer hover:bg-gray-50"
              style={{ top: `${515 + idx * 79 + suggestionOffset}px` }}
              onClick={() => handleStationClick(station)}
            >
              <div className="w-80 h-7 left-[94px] top-[22px] absolute justify-center text-gray-600 text-2xl font-normal font-['Inter']">{station}</div>
              <img className="w-12 h-16 left-[30px] top-[12px] absolute pointer-events-none" src={metroIcon} />
            </div>
          ))}
        </>
      )}
      {/* Search Results */}
      {showSuggestions && (
        <div className="absolute left-0 top-[2px] w-[706px] bg-white z-10 shadow-lg rounded-b-lg">
          {activeSuggestions.map((suggestion, index) => (
            <div
              key={`${suggestion.lat}-${suggestion.lon}`}
              className={`px-6 py-4 hover:bg-gray-100 cursor-pointer flex items-center gap-3 ${index < activeSuggestions.length - 1 ? 'border-b border-gray-200' : ''}`}
              onClick={() => handleSelectSuggestion(suggestion, activeInput!)}
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

      {/* Saved Places and Locate on Map */}
      {!showSuggestions && (
        <div className="w-[706px] h-24 left-0 top-[2px] absolute bg-black/0">
          <div className="w-40 h-7 left-[411px] top-[32px] absolute justify-center text-gray-600 text-2xl font-normal font-['Inter']">Locate on map</div>
          <img className="w-9 h-9 left-[359px] top-[28px] absolute" src={locationIcon} alt="Location icon" />
          <div 
            className="w-36 h-7 left-[181px] top-[31px] absolute justify-center text-zinc-600 text-2xl font-normal font-['Inter'] cursor-pointer"
            onClick={() => navigate('/saved-places')}
          >
            Saved Places
          </div>
          <img 
            className="w-9 h-9 left-[129px] top-[27px] absolute cursor-pointer" 
            src={heartIcon}
            onClick={() => navigate('/saved-places')}
          />
        </div>
      )}
      
      <div className="w-[652px] h-0.5 left-[25px] top-[945px] absolute bg-neutral-200" />
    </div>
  );

  // Embedded mode: just input fields + content, no header/MobileContainer
  if (embedded) {
    return (
      <div className="w-[706px] relative">
        <div className="w-[706px] bg-teal-950 header-teal-fix">
          {inputFields}
        </div>
        {stationContent}
      </div>
    );
  }

  return (
    <MobileContainer width={706} height={1440}>
      <div className="w-[706px] h-[1440px] left-0 top-0 absolute bg-black/0">
        <div className="w-[706px] h-[1440px] left-0 top-0 absolute bg-white" />
        <div className="w-[706px] h-[971px] left-0 top-[282px] absolute bg-black/0">
          <div className="w-[706px] h-[971px] left-0 top-0 absolute" style={{backgroundColor: '#fefefd'}} />
          {stationContent}
        </div>
        <div className="w-[706px] h-72 left-0 top-0 absolute bg-black/0">
          <div className="w-[706px] h-72 left-0 top-0 absolute bg-teal-950 header-teal-fix" />
          <div className="w-[706px] h-40 left-0 top-[116px] absolute bg-black/0">
            {inputFields}
          </div>
          <div className="w-[706px] h-28 left-0 top-0 absolute bg-black/0">
            <div className="w-80 h-10 left-[104px] top-[33px] absolute justify-center text-3xl font-normal font-['Inter']" style={{color: '#fefefd'}}>
              {isRideMode ? 'Book Ride' : 'All-in-One Ticket'}
            </div>
            <img 
              className="w-7 h-7 left-[33px] top-[39px] absolute cursor-pointer" 
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

export default AllInOne;