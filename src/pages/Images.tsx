import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { ChevronDown, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import placeholderImage from '@/assets/8j.png';
import backArrow from '@/assets/new-back-arrow.png';
import newMascot from '@/assets/new-mascot.png';
import ldIcon from '@/assets/Ld.png';
import { MobileContainer } from '@/components/MobileContainer';

const idTypes = [
  'Pan Card',
  'Driving Licence',
  'Voter ID', 
  'College ID',
  'Government ID',
  'BMTC ID',
  'Aadhar Card'
];

const Images = () => {
  const navigate = useNavigate();
  const [selfieImage, setSelfieImage] = useState<string>(placeholderImage);
  const [idNumber, setIdNumber] = useState<string>('');
  const [selectedIdType, setSelectedIdType] = useState<string>('Select ID Type');
  const [showDropdown, setShowDropdown] = useState<boolean>(false);

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleCameraCapture = async () => {
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Camera,
      });

      if (image.dataUrl) {
        console.log('Selfie captured, size:', image.dataUrl.length, 'bytes');
        
        setSelfieImage(image.dataUrl);
        toast.success('Selfie captured successfully!');
      }
    } catch (error) {
      console.error('Error capturing photo:', error);
      toast.error('Failed to capture photo. Please try again.');
    }
  };

  const handleIdNumberChange = (value: string) => {
    // Allow alphanumeric characters (letters and numbers), max 4 characters
    const cleanValue = value.replace(/[^a-zA-Z0-9]/g, '').slice(0, 4).toUpperCase();
    setIdNumber(cleanValue);
  };

  const handleIdTypeSelect = (idType: string) => {
    setSelectedIdType(idType);
    setShowDropdown(false);
    toast.success(`Selected ${idType}`);
  };

  const handleConfirm = () => {
    // Validate all required fields before navigating
    if (selectedIdType === 'Select ID Type') {
      toast.error('Please select an ID type');
      return;
    }
    
    if (!idNumber || idNumber.length < 4) {
      toast.error('Please enter the last 4 digits of your ID');
      return;
    }
    
    if (selfieImage === placeholderImage) {
      toast.error('Please capture a selfie');
      return;
    }
    
    // Save data to localStorage before navigating
    localStorage.setItem('verificationSelfie', selfieImage);
    localStorage.setItem('verificationIdType', selectedIdType);
    localStorage.setItem('verificationIdNumber', idNumber);
    
    // All validation passed, navigate to generation
    navigate('/generation');
  };

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  // Check if all required fields are filled
  const isFormValid = selfieImage !== placeholderImage && 
                      selectedIdType !== 'Select ID Type' && 
                      idNumber.length === 4;

  return (
    <MobileContainer width={540} height={1082}>
        <div className="w-[540px] h-[1082px] relative bg-white">
      {/* Header with teal background instead of image */}
      <div className="w-[540px] h-20 left-0 top-0 absolute bg-teal-950 header-teal-fix" />
      
      <div className="w-[540px] h-[657px] left-0 top-[81px] absolute bg-black/0">
        {/* Main background with #fefefd color instead of image */}
        <div className="w-[540px] h-[657px] left-0 top-0 absolute" style={{backgroundColor: '#fefefd'}} />
        
        <div className="w-[472px] h-20 left-[33px] top-[540px] absolute bg-black/0">
          <div 
            className={`w-[462px] h-16 left-[6px] top-[5px] absolute rounded-tl-[3px] rounded-bl-[3px] border ${
              isFormValid 
                ? 'bg-teal-950 border-gray-600 cursor-pointer hover:bg-teal-900' 
                : 'bg-gray-400 border-gray-400 cursor-not-allowed'
            } transition-colors`}
            onClick={() => isFormValid && handleConfirm()}
          />
          <div className="w-20 left-[198px] top-[26px] absolute justify-center text-white text-xl font-normal font-['Inter'] pointer-events-none">Confirm</div>
        </div>
        
        <div className="w-[496px] h-[479px] left-[21px] top-[37px] absolute bg-black/0">
          <div className="w-[492px] h-[476px] left-[3px] top-[2px] absolute bg-white/95 rounded-md border-[3px] border-gray-200" />
          
          {/* ID Number input section - only show after ID type is selected */}
          {selectedIdType !== 'Select ID Type' && (
            <div className="w-[491px] h-32 left-[3px] top-[358px] absolute bg-black/0">
              <div className="w-96 h-14 left-[17px] top-[45px] absolute bg-black/0">
                <div className="w-96 h-11 left-[6px] top-[6px] absolute bg-emerald-50 rounded" />
                <Input
                  value={idNumber}
                  onChange={(e) => handleIdNumberChange(e.target.value)}
                  placeholder={`Enter ${selectedIdType} (Last 4 Digits)`}
                  className="w-full left-[20px] top-[7px] absolute bg-transparent border-0 text-gray-700 text-lg font-normal font-['Inter'] text-left p-0 outline-none focus:outline-none focus:ring-0 focus:ring-transparent focus:border-0 focus:shadow-none"
                  style={{ outline: 'none', boxShadow: 'none' }}
                  maxLength={4}
                />
              </div>
              <div className="w-72 h-6 left-[24px] top-[10px] absolute justify-center text-gray-500 text-xl font-normal font-['Inter']">Enter ID Number (Last 4 digits)</div>
            </div>
          )}
          
          {/* ID Type section - dynamic width based on content */}
          <div className="left-[22px] top-[273px] absolute bg-black/0 flex items-center gap-2">
            <div className="px-6 h-14 bg-emerald-50 rounded-md border-[3px] border-green-50 flex items-center">
              <span className="text-gray-500 text-lg font-normal font-['Inter'] whitespace-nowrap">{selectedIdType}</span>
            </div>
            
            {/* Dropdown with emerald background and down arrow */}
            <div 
              className="w-14 h-14 bg-emerald-50 rounded-xl flex items-center justify-center cursor-pointer hover:bg-emerald-100 transition-colors"
              onClick={toggleDropdown}
            >
              <ChevronDown className="w-6 h-6 text-gray-600" />
            </div>
          </div>
          
          <div className="w-20 h-6 left-[27px] top-[241px] absolute justify-center text-gray-500 text-xl font-normal font-['Inter']">ID Type</div>
          <div className="w-72 h-5 left-[164px] top-[126px] absolute justify-center text-neutral-400 text-sm font-normal font-['Inter']">Take a selfie using your phone camera</div>
          <img className="w-14 h-14 left-[400px] top-[145px] absolute" src={newMascot} alt="Mascot" />
          
          {/* Selfie section with 8j placeholder and camera functionality */}
          <div className="w-28 h-28 left-[17px] top-[118px] absolute rounded-[54.75px] cursor-pointer" onClick={handleCameraCapture}>
            <img 
              className="w-full h-full rounded-[54.75px] object-cover" 
              src={selfieImage} 
              alt="Selfie"
            />
            {selfieImage === placeholderImage && (
              <img 
                className="w-12 h-12 absolute pointer-events-none" 
                style={{ top: 'calc(50% + 4px)', left: 'calc(50% + 4px)', transform: 'translate(-50%, -50%)' }}
                src={ldIcon} 
                alt="Add image"
              />
            )}
          </div>
          <div className="w-32 h-6 left-[27px] top-[75px] absolute justify-center text-gray-500 text-xl font-normal font-['Inter']">Upload Selfie</div>
        </div>
      </div>
      
      {/* Header overlay */}
      <div className="w-[540px] h-20 left-0 top-0 absolute bg-black/0">
        <div className="w-[540px] h-20 left-0 top-[6px] absolute bg-black/0">
          <div className="w-60 h-7 left-[77px] top-[24px] absolute justify-center text-white text-xl font-bold font-['Inter']">Passenger verification</div>
          {/* Replace 23x23 image with new-back-arrow */}
          <img className="w-6 h-6 left-[27px] top-[26px] absolute cursor-pointer" src={backArrow} alt="Back" onClick={handleGoBack} />
        </div>
      </div>

      {/* ID Type Dropdown Popup */}
      {showDropdown && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 h-auto shadow-xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-gray-800">Select ID Type</h3>
              <button 
                onClick={() => setShowDropdown(false)}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-6 h-6 text-gray-600" />
              </button>
            </div>
            
            <div className="space-y-3">
              {idTypes.map((idType, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors"
                  onClick={() => handleIdTypeSelect(idType)}
                >
                  <div className="w-4 h-4 bg-black rounded-full flex-shrink-0"></div>
                  <span className="text-gray-800 text-lg">{idType}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      </div>
    </MobileContainer>
  );
};

export default Images;