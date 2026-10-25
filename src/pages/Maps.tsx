import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { MapPin } from 'lucide-react';
import newBackArrow from '../assets/new-back-arrow.png';
import heartIcon from '../assets/heart-icon.png';
import playNow from '../assets/play-now.png';
import locationPin from '../assets/location-icon.png';
import background4e from '../assets/4e.png';
import customMapPin from '../assets/custom-map-pin.png';
import locationMapIcon from '../assets/location-map-icon.png';
import locationPinGreen from '../assets/location-pin-green.png';
import errorIcon from '@/assets/_9.png';
import { MobileContainer } from '@/components/MobileContainer';

// Geoapify API configuration
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

const Maps = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const mode = searchParams.get('mode') || 'metro';
  const [source, setSource] = useState('');
  const [destination, setDestination] = useState('');
  const [selectedTab, setSelectedTab] = useState<'location' | 'station'>('location');
  const [isRecentSearchesExpanded, setIsRecentSearchesExpanded] = useState(false);
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [activeInput, setActiveInput] = useState<'source' | 'destination' | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  
  // Dynamic text based on mode
  const headerTitle = mode === 'bus' ? 'Bus service' : mode === 'airport' ? 'Airport Rail' : 'Metro service';
  const searchByText = mode === 'bus' ? 'Search by Route' : 'Search by line';

  // Debounced API call for address suggestions
  const fetchSuggestions = useCallback(async (query: string) => {
    if (query.length < 2) {
      setSuggestions([]);
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
          lat: feature.geometry.coordinates[1],
          lon: feature.geometry.coordinates[0],
        }));
        setSuggestions(formattedSuggestions);
        setIsRecentSearchesExpanded(true);
      }
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      setSuggestions([]);
    }
  }, []);

  // Debounce effect for API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery) {
        fetchSuggestions(searchQuery);
      } else {
        setSuggestions([]);
        setIsRecentSearchesExpanded(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, fetchSuggestions]);

  const handleInputChange = (value: string, inputType: 'source' | 'destination') => {
    if (inputType === 'source') {
      setSource(value);
    } else {
      setDestination(value);
    }
    
    setSearchQuery(value);
    setActiveInput(inputType);
  };

  const handleSuggestionClick = (suggestion: AddressSuggestion) => {
    let updatedSource = source;
    let updatedDestination = destination;
    
    if (activeInput === 'source') {
      updatedSource = suggestion.formatted;
      setSource(updatedSource);
    } else if (activeInput === 'destination') {
      updatedDestination = suggestion.formatted;
      setDestination(updatedDestination);
    }
    
    setSuggestions([]);
    setIsRecentSearchesExpanded(false);
    setSearchQuery('');
    setActiveInput(null);
    
    // Check if both fields are now filled and navigate to Direction page
    if (updatedSource && updatedDestination) {
      setTimeout(() => {
        navigate(`/direction?source=${encodeURIComponent(updatedSource)}&destination=${encodeURIComponent(updatedDestination)}`);
      }, 500);
    }
  };

  const handleBack = () => {
    navigate(-1);
  };
  
  return (
    <MobileContainer width={540} height={1086}>
      <div 
        className="w-[540px] h-[1086px] relative overflow-hidden"
        style={{
          backgroundImage: `url(${background4e})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
      <div className="w-[540px] h-[1086px] left-0 top-0 absolute bg-black/0">
        <div className="w-[540px] h-96 left-0 top-[74px] absolute bg-black/0">
          <div className="w-[540px] h-40 left-0 top-[201px] absolute bg-black/0">
            <div className={`w-[505px] left-[17px] top-[65px] absolute bg-black/0 transition-all duration-300 ${
              isRecentSearchesExpanded ? (suggestions.length > 0 ? 'h-[420px]' : 'h-96') : 'h-24'
            }`}>
              <div className={`w-[500px] left-[3px] top-[2px] absolute bg-white rounded-md transition-all duration-300 ${
                isRecentSearchesExpanded ? (suggestions.length > 0 ? 'h-[420px]' : 'h-96') : 'h-24'
              }`} />
              <svg 
                className={`w-5 h-3 left-[457px] top-[31px] absolute cursor-pointer transition-transform duration-300 ${
                  isRecentSearchesExpanded ? 'rotate-180' : 'rotate-0'
                }`}
                viewBox="0 0 22 13" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
                onClick={() => setIsRecentSearchesExpanded(!isRecentSearchesExpanded)}
              >
                <path d="M2 11L11 2L20 11" stroke="#9CA3AF" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              
              {/* Dynamic header text */}
              <div className="w-96 h-5 left-[33px] top-[25px] absolute justify-center text-gray-500 text-xl font-bold font-['Inter']">
                {searchQuery ? `Showing results for "${searchQuery}"` : 'Recent searches'}
              </div>
              
              {/* Suggestions list */}
              {isRecentSearchesExpanded && suggestions.length > 0 && (
                <div className="w-[470px] left-[15px] top-[50px] absolute h-[360px]">
                  {suggestions.slice(0, 5).map((suggestion, index) => (
                    <div
                      key={index}
                      className="w-full p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors duration-200 last:border-b-0"
                      onClick={() => handleSuggestionClick(suggestion)}
                    >
                      <div className="flex items-start space-x-3">
                        <img src={locationMapIcon} alt="Location" className="w-6 h-6 mt-1 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-gray-900 truncate">
                            {suggestion.address_line1}
                          </div>
                          <div className="text-xs text-gray-500 truncate">
                            {suggestion.city}, {suggestion.state}, {suggestion.country}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="w-32 h-5 left-[331px] top-[20px] absolute justify-center text-gray-500 text-lg font-normal font-['Inter']">Locate on map</div>
            <img className="w-7 h-7 left-[291px] top-[22px] absolute" src={locationPin} alt="Location icon" />
            <div 
              className="w-28 h-5 left-[154px] top-[20px] absolute justify-center text-gray-500 text-lg font-normal font-['Inter'] cursor-pointer"
              onClick={() => navigate('/saved-places')}
            >
              Saved Places
            </div>
            <img 
              className="w-8 h-8 left-[115px] top-[18px] absolute cursor-pointer" 
              src={heartIcon} 
              alt="Saved places icon"
              onClick={() => navigate('/saved-places')}
            />
          </div>
          <div className="w-[540px] h-48 left-0 top-0 absolute bg-black/0">
            <div className="w-[540px] h-48 left-0 top-0 absolute" style={{ backgroundColor: '#fefefd' }} />
            <div className="w-[540px] h-16 left-0 top-[134px] absolute bg-black/0">
              <svg 
                className="w-5 h-4 left-[499px] top-[21px] absolute cursor-pointer" 
                viewBox="0 0 16 15" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
                onClick={() => console.log('Heart clicked - destination')}
              >
                <path d="M8 12.5C8 12.5 2 8 2 5C2 3.5 3.5 2 5 2C6.5 2 8 3 8 3S9.5 2 11 2C12.5 2 14 3.5 14 5C14 8 8 12.5 8 12.5Z" stroke="#9CA3AF" strokeWidth="1.2" fill="none"/>
              </svg>
              <input
                type="text"
                value={destination}
                onChange={(e) => handleInputChange(e.target.value, 'destination')}
                placeholder="Enter destination"
                className="w-80 left-[55px] top-[19px] absolute bg-transparent border-none outline-none text-stone-600 text-lg font-normal font-['Inter'] placeholder:text-stone-300"
              />
              
              <img src={locationPinGreen} alt="Location pin" className="w-4 h-6 left-[17px] top-[18px] absolute" />
            </div>
            <div className="w-[470px] h-0.5 left-[48px] top-[133px] absolute bg-stone-300" />
            <div className="w-[3px] h-6 left-[23px] top-[120px] absolute flex flex-col justify-between items-center">
              <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
              <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
              <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
            </div>
            <div className="w-[540px] h-16 left-0 top-[68px] absolute bg-black/0">
              <svg 
                className="w-5 h-4 left-[499px] top-[24px] absolute cursor-pointer" 
                viewBox="0 0 16 15" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
                onClick={() => console.log('Heart clicked - source')}
              >
                <path d="M8 12.5C8 12.5 2 8 2 5C2 3.5 3.5 2 5 2C6.5 2 8 3 8 3S9.5 2 11 2C12.5 2 14 3.5 14 5C14 8 8 12.5 8 12.5Z" stroke="#9CA3AF" strokeWidth="1.2" fill="none"/>
              </svg>
              <input
                type="text"
                value={source}
                onChange={(e) => handleInputChange(e.target.value, 'source')}
                placeholder="Enter source"
                className="w-80 left-[53px] top-[21px] absolute bg-transparent border-none outline-none text-stone-600 text-lg font-normal font-['Inter'] placeholder:text-stone-300"
              />
              <div className="w-3 h-3 left-[20px] top-[28px] absolute rounded-full" style={{ backgroundColor: '#18b7bf' }} />
            </div>
            {/* Sliding highlight bar */}
            <div className={`w-[270px] h-1.5 top-[61px] absolute bg-[#98C741] transition-all duration-300 ${
              selectedTab === 'station' ? 'left-0' : 'left-[270px]'
            }`}></div>
            
            {/* Thin horizontal grey line below highlight bar */}
            <div className="w-full h-px top-[67px] absolute bg-gray-300"></div>
            
            <div className="w-[540px] h-16 left-0 top-[1px] absolute bg-black/0">
              {/* Search by Location Tab */}
              <div 
                className="w-[270px] h-16 left-[270px] top-0 absolute bg-black/0 cursor-pointer"
                onClick={() => setSelectedTab('location')}
              >
                <div className={`w-48 h-7 left-[60px] top-[21px] absolute justify-center text-xl font-bold font-['Inter'] ${
                  selectedTab === 'location' ? 'text-[#98C741]' : 'text-stone-300'
                }`}>Search by Location</div>
              </div>
              {/* Station to Station Tab */}
              <div 
                className="w-[270px] h-16 left-0 top-0 absolute bg-black/0 cursor-pointer"
                onClick={() => setSelectedTab('station')}
              >
                <div className={`w-44 h-7 left-[50px] top-[21px] absolute justify-center text-xl font-bold font-['Inter'] ${
                  selectedTab === 'station' ? 'text-[#98C741]' : 'text-gray-400'
                }`}>Station to Station</div>
              </div>
            </div>
          </div>
        </div>
        <div className="w-[540px] h-20 left-0 top-0 absolute bg-black/0">
          <div className="w-[540px] h-20 left-0 top-0 absolute bg-teal-950 header-teal-fix" />
          <div className="w-48 h-12 left-[327px] top-[10px] absolute bg-black/0">
            <div className="w-48 h-10 left-[4px] top-[5px] absolute bg-white rounded-md border border-gray-400" />
            <img className="w-2 h-2.5 left-[167px] top-[21px] absolute" src={playNow} alt="Dropdown arrow" />
            <div className="w-44 h-10 left-[2px] top-[5px] absolute flex justify-center items-center text-black font-semibold font-['Inter'] whitespace-nowrap overflow-hidden" style={{ fontSize: mode === 'bus' ? '18px' : '20px' }}>{searchByText}</div>
          </div>
          <div className="w-40 h-6 left-[77px] top-[23px] absolute justify-center text-white text-xl font-bold font-['Inter']">{headerTitle}</div>
          <img 
            className="w-6 h-6 left-[27px] top-[24px] absolute cursor-pointer" 
            src={newBackArrow} 
            alt="Back arrow" 
            onClick={handleBack}
          />
        </div>

      </div>
      </div>
    </MobileContainer>
  );
};

export default Maps;