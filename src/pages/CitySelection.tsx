import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import tickMark from '@/assets/tick-mark.png';
import background4e from '@/assets/4e.png';
import { MobileContainer } from '@/components/MobileContainer';
import bangaloreImg from '@/city assest/Bangalore.png';
import kochiImg from '@/city assest/Kochi.png';
import mumbaiImg from '@/city assest/Mumbai.png';
import indoreImg from '@/city assest/Indore.png';
import agraImg from '@/city assest/Agra.png';
import puneImg from '@/city assest/Pune.png';
import vadodaraImg from '@/city assest/Vadodra.png';
import hubballiImg from '@/city assest/Hubbali-dharwad.png';
import delhiImg from '@/city assest/Delhi.png';
import lucknowImg from '@/city assest/Lucknow.png';
import nagpurImg from '@/city assest/Nagpur.png';
import goaImg from '@/city assest/Goa.png';
import chennaiImg from '@/city assest/chennai.png';
import jaipurImg from '@/city assest/Jaipur.png';
import patnaImg from '@/city assest/Patna.png';
import bhubaneswarImg from '@/city assest/Bhuvaneshwar.png';
import hyderabadImg from '@/city assest/Hydrebad.png';
import kolkataImg from '@/city assest/Kolkata.png';
import ahmedabadImg from '@/city assest/Ahmedabad.png';
import bhopalImg from '@/city assest/Bhopal.png';
import kanpurImg from '@/city assest/Kanpur.png';
import guwahatiImg from '@/city assest/Guwahati.png';
import boImg from '@/assets/Bo.png';
import backArrowImg from '@/assets/back-arrow.png';

const CitySelection = () => {
  const navigate = useNavigate();
  
  const [selectedCity, setSelectedCity] = useState<string>(() => {
    return localStorage.getItem('selectedCity') || 'Bengaluru';
  });
  
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  const cities = [
    { name: "Bengaluru", img: bangaloreImg, textClass: "w-44 h-11", imgClass: "w-28 h-16" },
    { name: "Kochi", img: kochiImg, textClass: "w-24 h-10", imgClass: "w-12 h-16" },
    { name: "Mumbai", img: mumbaiImg, textClass: "w-36 h-9", imgClass: "w-28 h-14" },
    { name: "Indore", img: indoreImg, textClass: "w-28 h-9", imgClass: "w-28 h-16" },
    { name: "Agra", img: agraImg, textClass: "w-20 h-10", imgClass: "w-24 h-14" },
    { name: "Pune", img: puneImg, textClass: "w-20 h-9", imgClass: "w-14 h-11" },
    { name: "Vadodara", img: vadodaraImg, textClass: "w-40 h-10", imgClass: "w-28 h-16" },
    { name: "Hubballi-Dharwad", img: hubballiImg, textClass: "w-72 h-10", imgClass: "w-28 h-16" },
    { name: "Delhi", img: delhiImg, textClass: "w-20 h-10", imgClass: "w-28 h-16" },
    { name: "Lucknow", img: lucknowImg, textClass: "w-28 h-10", imgClass: "w-28 h-20" },
    { name: "Nagpur", img: nagpurImg, textClass: "w-24 h-10", imgClass: "w-24 h-16" },
    { name: "Goa", img: goaImg, textClass: "w-16 h-10", imgClass: "w-28 h-20" },
    { name: "Chennai", img: chennaiImg, textClass: "w-28 h-10", imgClass: "w-12 h-20" },
    { name: "Jaipur", img: jaipurImg, textClass: "w-24 h-10", imgClass: "w-28 h-16" },
    { name: "Patna", img: patnaImg, textClass: "w-20 h-10", imgClass: "w-12 h-16" },
    { name: "Bhubaneswar", img: bhubaneswarImg, textClass: "w-40 h-10", imgClass: "w-28 h-16" },
    { name: "Hyderabad", img: hyderabadImg, textClass: "w-36 h-10", imgClass: "w-16 h-16" },
    { name: "Kolkata", img: kolkataImg, textClass: "w-28 h-10", imgClass: "w-28 h-16" },
    { name: "Ahmedabad", img: ahmedabadImg, textClass: "w-36 h-10", imgClass: "w-28 h-16" },
    { name: "Bhopal", img: bhopalImg, textClass: "w-24 h-10", imgClass: "w-12 h-16" },
    { name: "Kanpur", img: kanpurImg, textClass: "w-24 h-10", imgClass: "w-24 h-14" },
    { name: "Guwahati", img: guwahatiImg, textClass: "w-28 h-10", imgClass: "w-20 h-16" }
  ];
  
  // Filter cities based on search query
  const filteredCities = cities.filter(city =>
    city.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCitySelect = (cityName: string) => {
    setSelectedCity(cityName);
  };

  const handleContinue = () => {
    localStorage.setItem('selectedCity', selectedCity);
    navigate('/', { replace: true });
  };

  return (
    <MobileContainer width={768} height={1440}>
      <div 
        className="w-[768px] h-[1440px] relative overflow-hidden"
        style={{
          backgroundImage: `url(${background4e})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
          {/* Fixed Header Section */}
          <div className="w-[768px] h-[240px] left-0 top-0 absolute z-20">
            {/* Title Bar */}
            <div className="w-[768px] h-24 left-0 top-0 absolute bg-black/0 flex items-center px-12">
              <img 
                className="w-7 h-7 cursor-pointer" 
                src={backArrowImg} 
                alt="Back" 
                onClick={() => navigate(-1)}
              />
              <div className="flex-1 text-center justify-center text-gray-600 text-4xl font-normal font-['Inter']">Select City</div>
              <div className="w-7 h-7" />
            </div>
            
            {/* Search Bar */}
            <div className="w-[768px] px-12 left-0 top-[96px] absolute bg-black/0">
              <div className="w-full h-24 relative bg-black/0">
                <div className="w-full h-24 relative bg-white rounded-[10px] flex items-center px-8 gap-4">
                  <img className="w-7 h-7" src={boImg} alt="Search" />
                  <input 
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search city name, e.g. Bengaluru"
                    className="flex-1 bg-transparent text-zinc-500 text-3xl font-normal font-['Inter'] border-none outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* All Cities - Scrollable */}
          <div className="w-[768px] h-[1070px] left-0 top-[240px] absolute overflow-y-auto">
            <div className="px-12 space-y-4 py-4">
              {filteredCities.length === 0 ? (
                <div className="w-full text-center py-16">
                  <div className="text-gray-600 text-4xl font-normal font-['Inter'] mb-4">
                    We're not in your city yet!
                  </div>
                  <div className="text-gray-500 text-3xl font-normal font-['Inter']">
                    Select a city from the available options
                  </div>
                </div>
              ) : (
                filteredCities.map((city) => {
                  const isSelected = selectedCity === city.name;
                  
                  return (
                    <div 
                      key={city.name} 
                      className="w-full h-28 relative bg-black/0 cursor-pointer" 
                      onClick={() => handleCitySelect(city.name)}
                    >
                      <div 
                        className={`w-full h-28 relative rounded-xl border-2 border-neutral-200 flex items-center px-8 gap-6`}
                        style={{ backgroundColor: isSelected ? '#eeffef' : 'white' }}
                      >
                        {isSelected && (
                          <img className="w-4 h-4 absolute right-8" src={tickMark} alt="Selected" />
                        )}
                        <div className="flex items-center justify-center" style={{ width: '112px', height: '80px' }}>
                          <img className={`${city.imgClass}`} src={city.img} alt={city.name} />
                        </div>
                        <div className="flex items-center text-gray-600 text-4xl font-normal font-['Inter']" style={{ fontWeight: isSelected ? 'bold' : 'normal' }}>
                          {city.name}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Fixed Footer - Continue Button */}
          <div className="w-[768px] h-[130px] left-0 bottom-0 absolute z-20 flex justify-center items-center px-12">
            <div className="w-full max-w-[647px] h-24 relative bg-black/0 cursor-pointer" onClick={handleContinue}>
              <div className="w-full h-24 relative bg-teal-950 rounded-2xl border-2 border-gray-700 flex items-center justify-center">
                <div className="text-white text-4xl font-bold font-['Inter']">Continue</div>
              </div>
            </div>
          </div>
      </div>
    </MobileContainer>
  );
};

export default CitySelection;