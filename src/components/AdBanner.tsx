import React, { useState, useEffect } from 'react';
import { Info, MoreVertical, ArrowLeft } from 'lucide-react';

interface Ad {
  image_url: string;
  redirect_url: string;
}

interface AdBannerProps {
  hideIcons?: boolean;
}

export const AdBanner = ({ hideIcons = false }: AdBannerProps) => {
  const [showPopup, setShowPopup] = useState(false);
  const [adClosed, setAdClosed] = useState(false);
  const [currentAd, setCurrentAd] = useState<Ad | null>(null);
  const [allAds, setAllAds] = useState<Ad[]>([]);
  const [adIndex, setAdIndex] = useState(0);

  const positions = [
    { container: { right: '0px', top: '0px' } }, // top-right
    { container: { left: '0px', top: '0px' } }, // top-left
    { container: { right: '0px', bottom: '0px' } }, // bottom-right
    { container: { left: '0px', bottom: '0px' } } // bottom-left
  ];

  // Random position on each page load
  const [randomPosition] = useState(() => Math.floor(Math.random() * positions.length));

  useEffect(() => {
    const fetchAds = async () => {
      try {
        const response = await fetch('https://raw.githubusercontent.com/Ankith882/App-Assets-2/main/Ads');
        const text = await response.text();
        const cleanedText = text.replace(/,(\s*[}\]])/g, '$1');
        const data = JSON.parse(cleanedText);
        if (data.ads && data.ads.length > 0) {
          // Shuffle ads array
          const shuffled = [...data.ads].sort(() => Math.random() - 0.5);
          setAllAds(shuffled);
          setCurrentAd(shuffled[0]);
          setAdIndex(0);
        }
      } catch (error) {
        console.error('Failed to fetch ads:', error);
      }
    };

    fetchAds();
  }, []);

  return (
    <div className="w-full h-36 relative">
      {currentAd && !adClosed && (
        <a 
          href={currentAd.redirect_url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="w-full h-full absolute bg-neutral-50 rounded-lg overflow-hidden block"
        >
          <img 
            src={currentAd.image_url} 
            alt="Advertisement" 
            className="w-full h-full object-cover"
          />
        </a>
      )}
      {!currentAd && !adClosed && (
        <div className="w-full h-full absolute bg-neutral-50 rounded-lg" />
      )}
      
      {/* Popup when three dots is clicked */}
      {showPopup && !adClosed && (
        <div className="w-full h-full absolute bg-white rounded-lg shadow-lg z-10 flex flex-col items-center justify-center px-6 py-4">
          <div className="w-full flex items-center justify-between mb-4">
            <ArrowLeft 
              className="w-6 h-6 text-gray-700 cursor-pointer" 
              onClick={() => setShowPopup(false)}
            />
            <div className="flex-1 text-center text-gray-500 text-2xl font-montserrat-regular">
              Ads by <span className="font-montserrat-bold font-bold">Google</span>
            </div>
            <div className="w-6" />
          </div>
          
          <div className="flex gap-3 w-full justify-center">
            <button 
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-md text-lg font-medium transition-colors"
              onClick={() => setAdClosed(true)}
            >
              Stop seeing this ad
            </button>
            <a 
              href="https://support.google.com/ads/troubleshooter/4578507?sjid=6861902229141689499-NC#ts=6006595"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white hover:bg-gray-50 text-gray-700 px-6 py-3 rounded-md border border-gray-300 text-lg font-medium flex items-center gap-2 transition-colors"
            >
              Why this ad? <Info className="w-4 h-4" />
            </a>
          </div>
        </div>
      )}
      
      {/* Ad Closed message */}
      {adClosed && (
        <div className="absolute inset-x-4 inset-y-4 bg-white rounded-lg shadow-lg z-10 flex items-center justify-center">
          <div className="text-center text-gray-500 text-2xl font-montserrat-regular">
            Ad closed by <span className="font-montserrat-bold font-bold">Google</span>
          </div>
        </div>
      )}
      
      {/* Icon container with white background - random position on load */}
      {!adClosed && !hideIcons && (
        <div 
          className="absolute bg-white rounded-md shadow-sm flex items-center gap-2 px-2.5 py-2"
          style={{
            ...positions[randomPosition].container
          }}
        >
          <a 
            href="https://support.google.com/ads/troubleshooter/4578507?sjid=6861902229141689499-NC#ts=6006595" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center"
          >
            <Info 
              className="cursor-pointer" 
              style={{ width: '20px', height: '20px', color: '#00909b' }}
            />
          </a>
          <MoreVertical 
            className="cursor-pointer" 
            style={{ width: '17px', height: '17px', color: '#00909b' }}
            onClick={() => setShowPopup(!showPopup)}
          />
        </div>
      )}
    </div>
  );
};
