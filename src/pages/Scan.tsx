import { useNavigate, useLocation } from "react-router-dom";
import { useRef, useState, useEffect, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { ChevronDown, Search } from "lucide-react";
import backArrow from "@/assets/new-back-arrow.png";
import { BrowserQRCodeReader } from "@zxing/browser";
import { ScanningEffect } from "@/components/ScanningEffect";
import invalidQrIcon from "@/assets/invalid-qr-icon.png";
import beepSound from "@/assets/zxing_beep.ogg";
import flashOn from "@/assets/7L.png";
import flashOff from "@/assets/8s.png";
import scanCameraBg from "@/assets/scan-camera-bg.png";
import { MobileContainer } from '@/components/MobileContainer';
import { Keyboard } from '@capacitor/keyboard';


import { requestCameraPermission, checkCameraPermission, promptForSettings } from '@/lib/permissions';
import { scanStorage } from '@/lib/storage/scanStorage';
import { passStorage } from '@/lib/storage/passStorage';

// Constants moved outside component to prevent recreation
const BUS_PREFIXES = [
  "KA57F", "KA01F", "KA53F", "KA42F", "KA51AK", "KA51AJ",
  "KA41D", "KA42FA", "KA01FA", "KA51AH", "KAS7F", "KA51AL",
  "DU01AA", "KA01AR", "KA01AQ"
] as const;

const INPUT_REFS_COUNT = 4;

// Helper functions moved outside component
const extractFromUpiQr = (text: string): string | null => {
  try {
    const url = new URL(text);
    const pn = url.searchParams.get('pn');
    if (pn && pn.includes('BMTC BUS')) {
      const busNumber = pn.replace('BMTC BUS', '').trim().toUpperCase();
      return busNumber || null;
    }
  } catch (e) {
    return null;
  }
  return null;
};

const extractFromTummocUrl = (text: string): string | null => {
  try {
    const url = new URL(text);
    const tummocQr = url.searchParams.get('tummoc_qr');
    if (tummocQr && tummocQr.includes('BMTC BUS')) {
      let busNumber = tummocQr.replace('BMTC BUS', '').trim();
      busNumber = busNumber.replace(/[A-Z][a-z]+$/, '').trim().toUpperCase();
      return busNumber || null;
    }
  } catch (e) {
    return null;
  }
  return null;
};

const extractFromPattern = (text: string): string | null => {
  // Prefix is (KA|DU) followed by 3-4 alphanumerics (letters and/or digits), then a 4-digit suffix
  const busNumberPattern = /(KA|DU)[A-Z0-9]{3,4}\s*\d{4}/i;
  const match = text.match(busNumberPattern);
  return match ? match[0].replace(/\s+/g, '').trim().toUpperCase() : null;
};

const validateBusNumber = (text: string): string | null => {
  if (text.startsWith('upi://pay')) return extractFromUpiQr(text);
  if (text.includes('tummoc_qr=')) return extractFromTummocUrl(text);
  return extractFromPattern(text);
};

const saveScanSuccess = async (busNumber: string, passId: string, purchaseTimestamp: number): Promise<void> => {
  await scanStorage.incrementScanCount();
  const timestamp = new Date().toISOString();
  await passStorage.updatePassScanData(passId, purchaseTimestamp, busNumber, timestamp);
};

interface PurchasedPass {
  passId: string;
  passData: {
    name: string;
    type: 'AC' | 'Ordinary';
    validFrom: string;
    validTill: string;
  };
  userData: {
    firstName: string;
    lastName: string;
    gender: 'male' | 'female' | 'other';
    dateOfBirth: string;
  };
  verificationData: {
    selfie: string;
    idType: string;
    idNumber: string;
  };
  purchaseDate: string;
  amount: string;
}

const Scan = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const passData = location.state?.passData as PurchasedPass | undefined;
  
  
  // State
  const [showModal, setShowModal] = useState(false);
  const [selectedPrefix, setSelectedPrefix] = useState("Select bus number prefix");
  const [zoomLevel, setZoomLevel] = useState(1);
  const [maxZoom, setMaxZoom] = useState(10);
  const [showInvalidQrPopup, setShowInvalidQrPopup] = useState(false);
  const [isFlashOn, setIsFlashOn] = useState(false);
  
  
  // Refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(new Audio(beepSound));
  const hasPlayedSoundRef = useRef(false);
  const touchStartRef = useRef(0);
  const touchEndRef = useRef(0);
  const activeTrackRef = useRef<MediaStreamTrack | null>(null);
  const qrScanIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  
  // Digits state
  const [digits, setDigits] = useState<string[]>(["", "", "", ""]);
  const [activeInputIndex, setActiveInputIndex] = useState<number>(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleValidationSuccess = useCallback(async (busNumber: string) => {
    if (hasPlayedSoundRef.current) return;
    hasPlayedSoundRef.current = true;
    audioRef.current?.play().catch(() => {});
    
    if (passData) {
      const purchaseTimestamp = new Date(passData.purchaseDate).getTime();
      await saveScanSuccess(busNumber, passData.passId, purchaseTimestamp);
    }
    
    try { await Keyboard.hide(); } catch (e) { /* not available */ }
    
    const passRef = passData ? {
      passId: passData.passId,
      purchaseTimestamp: new Date(passData.purchaseDate).getTime()
    } : undefined;
    
    navigate('/final', { state: { scanSuccess: true, passRef } });
  }, [passData, navigate]);

  const handleInputChange = (index: number, value: string) => {
    const numericValue = value.replace(/[^0-9]/g, '');
    if (numericValue.length <= 1) {
      const newDigits = [...digits];
      newDigits[index] = numericValue;
      setDigits(newDigits);
      if (numericValue && index < INPUT_REFS_COUNT - 1) {
        inputRefs.current[index + 1]?.focus();
      }
      if (newDigits.every(d => d !== '') && selectedPrefix !== "Select bus number prefix") {
        const constructedBusNumber = `${selectedPrefix}${newDigits.join('')}`;
        const busNumber = validateBusNumber(constructedBusNumber);
        if (busNumber) handleValidationSuccess(busNumber);
        else setShowInvalidQrPopup(true);
      }
    }
  };

  const handleInputKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePrefixSelect = (prefix: string) => {
    setSelectedPrefix(prefix);
    setShowModal(false);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartRef.current = e.touches[0].clientY;
    touchEndRef.current = 0;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    e.preventDefault();
    touchEndRef.current = e.touches[0].clientY;
  };

  const handleTouchEnd = () => {
    if (!touchStartRef.current || !touchEndRef.current) return;
    const distance = touchStartRef.current - touchEndRef.current;
    if (Math.abs(distance) < 30) return;
    if (distance > 0) {
      setSelectedPrefix(selectedPrefix === "Select bus number prefix" ? BUS_PREFIXES[0] : selectedPrefix);
    } else {
      setSelectedPrefix("Select bus number prefix");
    }
    touchStartRef.current = 0;
    touchEndRef.current = 0;
  };


  // ===== WEB CAMERA: getUserMedia for both native and web =====

  // ===== WEB CAMERA: Fallback for browser =====
  useEffect(() => {
    const codeReader = new BrowserQRCodeReader();
    let controls: any;
    let isMounted = true;

    const startScanner = async () => {
      try {
        const permissionStatus = await checkCameraPermission();
        if (permissionStatus === 'denied') { promptForSettings(); return; }
        if (permissionStatus === 'prompt') requestCameraPermission().catch(console.error);

        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
          if (videoRef.current && isMounted) {
            videoRef.current.srcObject = stream;
            videoRef.current.play().catch(() => {});
            const track = stream.getVideoTracks()[0];
            if (track) {
              activeTrackRef.current = track;
              const caps = track.getCapabilities() as any;
              if (caps.zoom) setMaxZoom(caps.zoom.max || 10);
            }
          }
        } catch { console.log('Pre-warm failed'); }

        if (videoRef.current && isMounted) {
          controls = await codeReader.decodeFromVideoDevice(undefined, videoRef.current, (result) => {
            if (result && isMounted) {
              const scannedText = result.getText();
              const busNumber = validateBusNumber(scannedText);
              if (busNumber) handleValidationSuccess(busNumber);
              else setShowInvalidQrPopup(true);
            }
          });
          if (videoRef.current.srcObject) {
            const stream = videoRef.current.srcObject as MediaStream;
            const track = stream.getVideoTracks()[0];
            if (track) {
              activeTrackRef.current = track;
              const caps = track.getCapabilities() as any;
              if (caps.zoom) setMaxZoom(caps.zoom.max || 10);
            }
          }
        }
      } catch (err) { console.error("Error starting QR scanner:", err); }
    };

    startScanner();
    return () => { isMounted = false; if (controls) controls.stop(); };
  }, [handleValidationSuccess]);

  // Keyboard listeners
  useEffect(() => {
    const setup = async () => {
      try {
        await Keyboard.addListener('keyboardWillShow', () => {
          document.documentElement.style.setProperty('--keyboard-shown', '1');
        });
        await Keyboard.addListener('keyboardWillHide', () => {
          document.documentElement.style.setProperty('--keyboard-shown', '0');
        });
      } catch (e) { /* not available */ }
    };
    setup();
    return () => { hasPlayedSoundRef.current = false; Keyboard.removeAllListeners().catch(() => {}); };
  }, []);

  // ===== ZOOM & FLASH via MediaStreamTrack =====

  // ===== WEB ZOOM/FLASH =====
  useEffect(() => {
    const applyControls = async () => {
      let track = activeTrackRef.current;
      if (!track || track.readyState !== 'live') {
        if (videoRef.current?.srcObject) {
          const stream = videoRef.current.srcObject as MediaStream;
          track = stream.getVideoTracks()[0];
          if (track) activeTrackRef.current = track;
        }
      }
      if (!track || track.readyState !== 'live') return;

      try {
        const caps = track.getCapabilities() as any;
        if (caps.torch !== undefined) await track.applyConstraints({ advanced: [{ torch: isFlashOn } as any] });
      } catch {}

      try {
        const caps = track.getCapabilities() as any;
        if (caps.zoom) {
          const clamped = Math.max(caps.zoom.min || 1, Math.min(caps.zoom.max || 10, zoomLevel));
          await track.applyConstraints({ advanced: [{ zoom: clamped } as any] });
        }
      } catch {}
    };
    applyControls();
  }, [isFlashOn, zoomLevel]);

  const isPrefixSelected = selectedPrefix !== "Select bus number prefix";
  
  return (
    <MobileContainer width={540} height={1097}>
        <div className="w-[540px] h-[1097px] relative bg-black/0 overflow-hidden">
      <div className="w-[540px] h-[1097px] left-0 top-0 absolute bg-black/0">
        <div 
          className={`w-[540px] left-0 absolute transition-all duration-300 ease-in-out rounded-t-[32px] ${
            isPrefixSelected ? 'h-[877px] top-[220px] z-50' : 'h-96 top-[649px]'
          }`}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          style={{ touchAction: 'none' }}
        >
          <div className="w-[540px] h-full left-0 top-0 absolute bg-[#FEFEFE] rounded-t-[32px]" />
          
          <div className="w-96 h-48 left-[81px] top-[101px] absolute bg-black/0">
            {/* Digit boxes */}
            <Input 
              ref={el => inputRefs.current[3] = el}
              type="text" inputMode="numeric" pattern="[0-9]*"
              value={digits[3]}
              onChange={(e) => handleInputChange(3, e.target.value)}
              onKeyDown={(e) => handleInputKeyDown(3, e)}
              onFocus={() => setActiveInputIndex(3)}
              maxLength={1}
              className="w-16 h-16 left-[295px] top-[115px] absolute bg-[#e0e0e0] rounded-lg text-center text-2xl border-none z-10"
            />
            <Input 
              ref={el => inputRefs.current[2] = el}
              type="text" inputMode="numeric" pattern="[0-9]*"
              value={digits[2]}
              onChange={(e) => handleInputChange(2, e.target.value)}
              onKeyDown={(e) => handleInputKeyDown(2, e)}
              onFocus={() => setActiveInputIndex(2)}
              maxLength={1}
              className="w-16 h-16 left-[202px] top-[115px] absolute bg-[#e0e0e0] rounded-lg text-center text-2xl border-none z-10"
            />
            <Input 
              ref={el => inputRefs.current[1] = el}
              type="text" inputMode="numeric" pattern="[0-9]*"
              value={digits[1]}
              onChange={(e) => handleInputChange(1, e.target.value)}
              onKeyDown={(e) => handleInputKeyDown(1, e)}
              onFocus={() => setActiveInputIndex(1)}
              maxLength={1}
              className="w-16 h-16 left-[108px] top-[115px] absolute bg-[#e0e0e0] rounded-lg text-center text-2xl border-none z-10"
            />
            <Input 
              ref={el => inputRefs.current[0] = el}
              type="text" inputMode="numeric" pattern="[0-9]*"
              value={digits[0]}
              onChange={(e) => handleInputChange(0, e.target.value)}
              onKeyDown={(e) => handleInputKeyDown(0, e)}
              onFocus={() => setActiveInputIndex(0)}
              maxLength={1}
              className="w-16 h-16 left-[15px] top-[115px] absolute bg-[#e0e0e0] rounded-lg text-center text-2xl border-none z-10"
            />
            <div className="w-96 h-16 left-[4px] top-[3px] absolute bg-black/0">
              <div 
                className="w-96 h-16 left-[6px] top-[3px] absolute bg-white rounded-md border border-zinc-400 cursor-pointer flex items-center justify-center" 
                onClick={() => setShowModal(true)}
              >
                <div className={`text-xl font-['Inter'] pointer-events-none ${isPrefixSelected ? 'font-bold text-black' : 'font-normal text-zinc-400'}`}>
                  {selectedPrefix}
                </div>
              </div>
              <ChevronDown className="w-5 h-5 left-[327px] top-[28px] absolute text-black pointer-events-none" />
            </div>
          </div>
            <div className="w-52 h-7 left-[23px] top-[42px] absolute justify-center text-gray-600 text-2xl font-normal font-['Inter']">Enter bus number</div>
            <div className="w-8 h-[5px] left-[253px] top-[18px] absolute bg-[#e0e0e0] rounded-sm" />
        </div>
        <div className="w-[540px] h-[649px] left-0 top-0 absolute bg-black/0">
          {/* Native camera renders behind WebView via the plugin; web uses video element */}
            <video 
              ref={videoRef}
              className="w-[540px] h-[649px] left-0 top-0 absolute object-cover bg-black"
              autoPlay playsInline muted preload="auto"
            />
          <ScanningEffect />
          <div className="w-[540px] h-24 left-0 top-[547px] absolute bg-black/0">
            <div 
              className="w-16 h-16 left-[427px] top-[11px] absolute rounded-[34.50px] flex items-center justify-center cursor-pointer"
              style={{ backgroundColor: '#242324' }}
              onClick={() => setIsFlashOn(!isFlashOn)}
            >
              <img src={isFlashOn ? flashOn : flashOff} alt="Flash toggle" className="w-8 h-8" />
            </div>
            <div className="w-96 h-16 left-[42px] top-[13px] absolute bg-black/0">
              <div className="w-80 h-16 left-[3px] top-[2px] absolute bg-neutral-800 rounded-3xl" />
              <div className="w-56 h-6 left-[66px] top-[20px] absolute flex items-center">
                <input
                  type="range"
                  min="1"
                  max={maxZoom}
                  step="0.1"
                  value={zoomLevel}
                  onChange={(e) => setZoomLevel(parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-600 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:cursor-pointer"
                  style={{ touchAction: 'none' }}
                />
              </div>
              <Search className="w-5 h-5 left-[20px] top-[23px] absolute text-white scale-x-[-1]" />
            </div>
          </div>
          {!isPrefixSelected && (
            <div className="w-[540px] h-20 left-0 top-[79px] absolute bg-black/0">
              <div className="w-[526px] h-20 left-[6px] top-[-1px] absolute bg-black/0">
                <div className="w-[518px] h-20 left-[5px] top-[2px] absolute bg-indigo-50 rounded-2xl" />
                <div className="w-96 h-7 left-[95px] top-[25px] absolute justify-center text-slate-400 text-xl font-normal font-['Inter']">Enter bus number or Scan QR to validate</div>
                <img className="w-11 h-11 left-[22px] top-[18px] absolute rounded-3xl" src={scanCameraBg} alt="Camera background" />
                <div className="w-11 h-3.5 left-[26px] top-[27px] absolute justify-center text-[#FEFEFE] text-[9px] font-bold font-digital">0405</div>
              </div>
            </div>
          )}
          <div className="w-[540px] h-16 left-0 top-[8px] absolute bg-black/0">
            <img 
              className="w-5 h-5 left-[34px] top-[24px] absolute cursor-pointer" 
              src={backArrow} alt="Back"
              onClick={() => {
                navigate(-1);
              }}
            />
          </div>
        </div>
      </div>

      {/* Modal Overlay */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl w-80 h-[600px] shadow-xl mx-4">
            <div className="px-6 py-6 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 text-center">Select bus number prefix</h3>
            </div>
            <div className="h-[500px] overflow-y-auto" style={{ scrollbarWidth: 'thin', scrollbarColor: '#9CA3AF #F3F4F6' }}>
              <div className="py-2">
                {BUS_PREFIXES.map((prefix, index) => (
                  <div key={prefix}>
                    <div
                      className="px-6 py-4 text-center text-gray-700 hover:bg-gray-50 cursor-pointer transition-colors duration-150 text-lg"
                      onClick={() => handlePrefixSelect(prefix)}
                    >
                      {prefix}
                    </div>
                    {index < BUS_PREFIXES.length - 1 && (
                      <div className="border-b border-gray-200 mx-6"></div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Invalid QR Code Popup */}
      {showInvalidQrPopup && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50">
          <div className="bg-white rounded-3xl w-[360px] shadow-2xl mx-4 p-8 flex flex-col items-center">
            <img src={invalidQrIcon} alt="Invalid QR" className="w-24 h-24 mb-6" />
            <p className="text-gray-700 text-center text-xl font-normal mb-8 leading-relaxed">
              Please scan a valid QR code<br />or try again
            </p>
            <button
              onClick={() => setShowInvalidQrPopup(false)}
              className="w-full bg-teal-500 hover:bg-teal-600 text-white text-xl font-medium py-4 rounded-xl transition-colors"
            >
              Okay
            </button>
          </div>
        </div>
      )}
      </div>
    </MobileContainer>
  );
};

export default Scan;
