import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import placeholderImage from '@/assets/8j.png';
import backArrowImage from '@/assets/back-arrow.png';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { MobileContainer } from '@/components/MobileContainer';

const Help = () => {
  const navigate = useNavigate();
  const [profileImage, setProfileImage] = useState<string>(placeholderImage);
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [feedbackText, setFeedbackText] = useState<string>('');
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);

  const handleOptionSelect = (option: string) => {
    setSelectedOptions(prev => 
      prev.includes(option) 
        ? prev.filter(item => item !== option)
        : [...prev, option]
    );
  };

  const handleBack = () => {
    navigate(-1);
  };

  const handleSubmit = () => {
    if (selectedOptions.length > 0 || feedbackText.trim()) {
      setShowSuccessDialog(true);
    }
  };

  const handleSuccessOk = () => {
    setShowSuccessDialog(false);
    navigate('/', { replace: true });
  };

  const isSubmitEnabled = selectedOptions.length > 0 || feedbackText.trim().length > 0;

  useEffect(() => {
    // Load saved profile image
    const savedProfileImage = localStorage.getItem('profileImage');
    if (savedProfileImage) {
      setProfileImage(savedProfileImage);
    }
  }, []);

  return (
    <MobileContainer width={540} height={1080}>
      <div className="w-[540px] h-[1080px] relative overflow-hidden" style={{backgroundColor: '#FEFEFE'}}>
      <div className="w-[540px] h-[1080px] left-0 top-0 absolute" style={{backgroundColor: '#FEFEFE'}}>
        <div className="w-[540px] h-44 left-0 top-0 absolute" style={{backgroundColor: '#e1e0e1'}} />
        <div className="w-[540px] h-[906px] left-0 top-[174px] absolute" style={{backgroundColor: '#FEFEFE'}} />
        <div className="w-[540px] h-[872px] left-0 top-0 absolute bg-black/0">
          <div className="w-[516px] h-20 left-[11px] top-[789px] absolute bg-black/0">
            <Button 
              onClick={handleSubmit}
              disabled={!isSubmitEnabled}
              className={`w-[508px] h-20 left-[5px] top-[6px] absolute rounded-md border border-gray-700 text-white text-xl font-bold ${
                isSubmitEnabled ? 'bg-teal-950 hover:bg-teal-900 cursor-pointer' : 'bg-gray-400 cursor-not-allowed'
              }`}
            >
              Submit
            </Button>
          </div>
          <div className="w-[523px] h-[473px] left-[17px] top-[279px] absolute bg-black/0">
            <div className="w-[526px] h-64 left-[-4px] top-[224px] absolute bg-black/0">
              <div className="w-[510px] h-48 left-[1px] top-[56px] absolute bg-black/0">
                <Textarea
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  placeholder="Describe the problems you faced or give suggestions here..."
                  className="w-[499px] h-48 left-[7px] top-[2px] absolute bg-neutral-50 rounded-tl-[3px] rounded-tr rounded-bl-[3px] border border-neutral-200 resize-none text-neutral-600 text-lg font-medium"
                />
              </div>
              <div className="w-96 h-7 left-[44px] top-[7px] absolute justify-center text-neutral-400 text-2xl font-bold font-['Inter'] whitespace-nowrap">How can we improve your experience?</div>
            </div>
            <div className="w-[517px] h-36 left-[6px] top-[77px] absolute bg-black/0">
              <div 
                className="w-24 h-16 left-[5px] top-[73px] absolute bg-black/0 cursor-pointer"
                onClick={() => handleOptionSelect('others')}
              >
                <div className={`w-20 h-14 left-[5px] top-[5px] absolute ${selectedOptions.includes('others') ? 'bg-[#e6f8fc]' : 'bg-zinc-100'}`} />
                <div className="w-20 h-5 left-[21px] top-[19px] absolute justify-center text-neutral-500 text-base font-semibold font-['Inter']">Others</div>
              </div>
              <div 
                className="w-48 h-16 left-[267px] top-[3px] absolute bg-black/0 cursor-pointer"
                onClick={() => handleOptionSelect('missing-pass')}
              >
                <div className={`w-44 h-14 left-[6px] top-[4px] absolute ${selectedOptions.includes('missing-pass') ? 'bg-[#e6f8fc]' : 'bg-neutral-100'}`} />
                <div className="w-36 h-6 left-[23px] top-[17px] absolute justify-center text-neutral-500 text-base font-bold font-['Inter']">Missing Pass Type</div>
              </div>
              <div 
                className="w-64 h-16 left-[5px] top-[3px] absolute bg-black/0 cursor-pointer"
                onClick={() => handleOptionSelect('incorrect-description')}
              >
                <div className={`w-60 h-14 left-[5px] top-[4px] absolute ${selectedOptions.includes('incorrect-description') ? 'bg-[#e6f8fc]' : 'bg-neutral-100'}`} />
                <div className="w-64 h-6 left-[22px] top-[18px] absolute justify-center text-neutral-500 text-base font-semibold font-['Inter']">Incorrect Pass Description</div>
              </div>
            </div>
            <div 
              className="w-56 h-16 left-[10px] top-[6px] absolute bg-black/0 cursor-pointer"
              onClick={() => handleOptionSelect('incorrect-fare')}
            >
              <div className={`w-52 h-14 left-[6px] top-[6px] absolute ${selectedOptions.includes('incorrect-fare') ? 'bg-[#e6f8fc]' : 'bg-zinc-100'}`} />
              <div className="w-48 h-6 left-[23px] top-[20px] absolute justify-center text-neutral-500 text-lg font-semibold font-['Inter']">Incorrect Fare or GST</div>
            </div>
          </div>
          <div className="w-[513px] h-44 left-[15px] top-[78px] absolute bg-black/0">
            <div className="w-[504px] h-44 left-[3px] top-[2px] absolute bg-white rounded-tl-md rounded-tr rounded-br-[3px] border border-neutral-200" />
            <div className="w-96 h-7 left-[73px] top-[118px] absolute justify-center text-gray-600 text-2xl font-bold font-['Inter']">What do you want to report?</div>
            <img className="w-24 h-24 left-[209px] top-[18px] absolute rounded-[43.75px] object-cover" src={profileImage} />
          </div>
          <div className="w-[540px] h-44 left-0 top-0 absolute bg-black/0">
            <div className="w-[540px] h-14 left-0 top-0 absolute bg-black/0">
              <div className="w-80 h-9 left-[100px] top-[15px] absolute justify-center text-gray-500 text-2xl font-bold font-['Inter']">Help other travellers</div>
              <img className="w-6 h-5 left-[27px] top-[21px] absolute cursor-pointer" src={backArrowImage} onClick={handleBack} />
            </div>
          </div>
        </div>
      </div>

      {/* Success Dialog */}
      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent className="sm:max-w-md mx-auto p-8 text-center bg-white">
          <div className="flex flex-col items-center space-y-6">
            {/* Green checkmark circle */}
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center">
              <svg 
                className="w-12 h-12 text-green-600" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={3} 
                  d="M5 13l4 4L19 7" 
                />
              </svg>
            </div>
            
            <DialogTitle className="text-2xl font-bold text-gray-800">
              Report Added successfully.
            </DialogTitle>
            
            <Button 
              onClick={handleSuccessOk}
              className="bg-teal-950 hover:bg-teal-900 text-white px-12 py-3 rounded-lg font-semibold text-lg"
            >
              Okay
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      </div>
    </MobileContainer>
  );
};

export default Help;