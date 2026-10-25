import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import newBackArrow from '../assets/new-back-arrow.png';
import maleIcon from '../assets/male-icon.png';
import femaleIcon from '../assets/female-icon.png';
import tpIcon from '../assets/Tp.png';
import lockIcon from '../assets/lock-icon.png';
import calendarIcon from '../assets/Calendar-icon.png';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import DatePicker from '@/components/DatePicker';
import { MobileContainer } from '@/components/MobileContainer';
import { userStorage } from '@/lib/storage/userStorage';

interface PassData {
  name: string;
  type: string;
  validFrom: string;
  validTill: string;
}

interface UserData {
  firstName: string;
  lastName: string;
  gender: string;
  dateOfBirth: string;
}

const Identity = () => {
  const navigate = useNavigate();
  const [passData, setPassData] = useState<PassData | null>(null);
  const [userData, setUserData] = useState<UserData>({
    firstName: '',
    lastName: '',
    gender: 'male',
    dateOfBirth: ''
  });
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    const savedPass = localStorage.getItem('selectedPass');
    if (savedPass) {
      setPassData(JSON.parse(savedPass));
    }
    
    const savedUserData = localStorage.getItem('userData');
    if (savedUserData) {
      setUserData(JSON.parse(savedUserData));
    }
  }, []);

  const handleUserDataChange = async (field: keyof UserData, value: string) => {
    const updatedData = { ...userData, [field]: value };
    setUserData(updatedData);
    
    // Save to localStorage for web
    localStorage.setItem('userData', JSON.stringify(updatedData));
    
    // Save to userStorage for native devices
    try {
      const userProfile = await userStorage.getUserProfile();
      await userStorage.updateUserProfile({
        firstName: updatedData.firstName,
        lastName: updatedData.lastName,
        email: userProfile?.email || '',
        phone: userProfile?.phone || '',
        gender: updatedData.gender as 'male' | 'female' | 'other',
        dateOfBirth: updatedData.dateOfBirth,
      });
    } catch (error) {
      console.error('Error saving user profile:', error);
    }
  };

  const formatDateDisplay = (dateString: string) => {
    if (!dateString) return '';
    // If it's in YYYY-MM-DD format, parse it as local date
    if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
      const [year, month, day] = dateString.split('-').map(Number);
      const date = new Date(year, month - 1, day);
      return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    }
    // Otherwise parse normally
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const handleDateSelect = (date: Date) => {
    // Format as YYYY-MM-DD without timezone conversion
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const formatted = `${year}-${month}-${day}`;
    handleUserDataChange('dateOfBirth', formatted);
    setShowDatePicker(false);
  };

  const getGenderIcon = () => {
    if (userData.gender === 'female') return tpIcon;
    if (userData.gender === 'other') return femaleIcon;
    return maleIcon;
  };

  const cycleGender = () => {
    const genders: ('male' | 'female' | 'other')[] = ['male', 'female', 'other'];
    const currentIndex = genders.indexOf(userData.gender as any);
    const nextGender = genders[(currentIndex + 1) % genders.length];
    handleUserDataChange('gender', nextGender);
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  // Check if all required fields are filled
  const isFormValid = userData.firstName.trim() !== '' && 
                      userData.lastName.trim() !== '' && 
                      userData.dateOfBirth !== '';

  return (
    <MobileContainer width={540} height={1104}>
      <div className="w-[540px] h-[1104px] left-0 top-0 absolute bg-black/0 overflow-hidden">
        <img className="w-[540px] h-[1104px] left-0 top-0 absolute" src="https://placehold.co/540x1104" />
        <div className="w-[540px] h-[89px] left-0 top-[80px] absolute bg-teal-950 header-teal-fix" />
        <div className="w-[540px] h-[1015px] left-0 top-[89px] absolute bg-black/0 overflow-hidden">
          <div className="w-[540px] h-[1015px] left-0 top-0 absolute" style={{backgroundColor: '#fefefd'}} />
          <div className="w-[471px] h-20 left-[34px] top-[885px] absolute bg-black/0">
            <div 
              className={`w-[462px] h-16 left-[5px] top-[6px] absolute border ${
                isFormValid 
                  ? 'bg-teal-950 border-gray-800 cursor-pointer hover:bg-teal-900' 
                  : 'bg-gray-400 border-gray-400 cursor-not-allowed'
              } transition-colors`}
              onClick={() => isFormValid && navigate('/images')}
            />
            <div className="w-48 h-6 left-[142px] top-[26px] absolute justify-center text-xl font-bold font-['Inter'] pointer-events-none" style={{color: '#fefefd'}}>Save and Continue</div>
          </div>
          <div className="w-[496px] h-96 left-[22px] top-[499px] absolute bg-black/0">
            <div className="w-[492px] h-96 left-[2px] top-[-5px] absolute bg-white rounded-[5px]" />
            <div className="w-56 h-14 left-[252px] top-[284px] absolute bg-black/0">
              <div className="w-52 h-12 left-[6px] top-[5px] absolute bg-emerald-50 rounded-tl-md rounded-tr-[10px] rounded-bl rounded-br-md" />
              <img 
                className="w-5 h-4 left-[174px] top-[20px] absolute cursor-pointer z-10" 
                src={calendarIcon} 
                alt="Calendar icon"
                onClick={() => setShowDatePicker(true)}
              />
              <Input
                value={userData.dateOfBirth}
                onChange={(e) => handleUserDataChange('dateOfBirth', e.target.value)}
                placeholder=""
                className="w-full h-full left-0 top-0 absolute bg-transparent border-0 text-gray-600 text-lg font-normal font-['Inter'] px-4 py-2 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:outline-none"
              />
            </div>
            <div className="w-56 h-14 left-[19px] top-[284px] absolute bg-black/0">
              <div className="w-52 h-12 left-[5px] top-[5px] absolute bg-emerald-50 rounded-tl-[10px] rounded-tr-lg rounded-bl-md rounded-br-md" />
              <img 
                className="w-8 h-8 left-[168px] top-[16px] absolute cursor-pointer z-10 hover:scale-110 transition-transform" 
                src={getGenderIcon()} 
                alt="Gender icon - click to change" 
                onClick={cycleGender}
              />
              <div className="w-32 h-6 left-[16px] top-[18px] absolute text-gray-600 text-lg font-normal font-['Inter'] pointer-events-none">
                {userData.gender.charAt(0).toUpperCase() + userData.gender.slice(1)}
              </div>
            </div>
            <div className="w-32 left-[258px] top-[248px] absolute justify-center text-gray-500 text-xl font-normal font-['Inter']">Date Of Birth</div>
            <div className="w-20 h-5 left-[25px] top-[250px] absolute justify-center text-gray-500 text-xl font-normal font-['Inter']">Gender</div>
            <div className="w-96 h-14 left-[22px] top-[175px] absolute bg-black/0">
              <div className="w-96 h-12 left-[3px] top-[3px] absolute bg-emerald-50 rounded-md" />
              <Input
                value={userData.lastName}
                onChange={(e) => handleUserDataChange('lastName', e.target.value)}
                className="w-full h-full left-0 top-0 absolute bg-transparent border-0 text-gray-600 text-lg font-normal font-['Inter'] px-4 py-2 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:outline-none"
              />
            </div>
            <div className="w-32 left-[26px] top-[138px] absolute justify-center text-gray-600 text-xl font-normal font-['Inter'] whitespace-nowrap">Last Name</div>
            <div className="w-[492px] h-32 left-[2px] top-[1px] absolute bg-black/0">
              <div className="w-96 h-14 left-[20px] top-[62px] absolute bg-black/0">
                <div className="w-96 h-12 left-[2px] top-[3px] absolute bg-emerald-50 rounded-md border border-gray-200" />
              <Input
                value={userData.firstName}
                onChange={(e) => handleUserDataChange('firstName', e.target.value)}
                className="w-full h-full left-0 top-0 absolute bg-transparent border-0 text-gray-600 text-lg font-normal font-['Inter'] px-4 py-2 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:outline-none"
              />
              </div>
              <div className="w-32 h-5 left-[24px] top-[25px] absolute justify-center text-gray-500 text-xl font-normal font-['Inter'] whitespace-nowrap">First Name</div>
            </div>
          </div>
          <div className="w-56 h-6 left-[20px] top-[476px] absolute justify-center text-neutral-500 text-xl font-normal font-['Inter']">Personal information</div>
          <div className="w-[502px] h-96 left-[19px] top-[58px] absolute bg-black/0">
            <div className="w-[492px] h-96 left-[5px] top-[7px] absolute bg-white rounded-md border-2 border-gray-200" />
            <div className="w-56 h-14 left-[252px] top-[290px] absolute bg-black/0">
              <div className="w-56 h-12 left-[5px] top-[5px] absolute bg-emerald-50 rounded-md" />
              <img className="w-3.5 h-5 left-[196px] top-[19px] absolute" src={lockIcon} alt="Lock icon" />
              <div className="w-32 h-6 left-[17px] top-[16px] absolute justify-center text-gray-600 text-xl font-normal font-['Inter']">{passData?.validTill ? formatDateDisplay(passData.validTill) : '16 Sep 2025'}</div>
            </div>
            <div className="w-56 h-14 left-[22px] top-[290px] absolute bg-black/0">
              <div className="w-56 h-12 left-[6px] top-[5px] absolute bg-emerald-50/95 rounded-lg" />
              <img className="w-3.5 h-5 left-[197px] top-[19px] absolute" src={lockIcon} alt="Lock icon" />
              <div className="w-32 h-7 left-[18px] top-[16px] absolute justify-center text-gray-600 text-xl font-normal font-['Inter']">{passData?.validFrom ? formatDateDisplay(passData.validFrom) : '16 Sep 2025'}</div>
            </div>
            <div className="w-20 h-5 left-[258px] top-[254px] absolute justify-center text-zinc-500 text-xl font-normal font-['Inter']">Valid till</div>
            <div className="w-24 h-5 left-[28px] top-[255px] absolute justify-center text-zinc-500 text-xl font-normal font-['Inter']">Valid from</div>
            <div className="w-[492px] h-28 left-[5px] top-[135px] absolute bg-black/0">
              <div className="w-96 h-14 left-[20px] top-[45px] absolute bg-black/0">
                <div className="w-96 h-12 left-[3px] top-[3px] absolute bg-emerald-50 rounded-md" />
                <div className="w-20 h-6 left-[23px] top-[16px] absolute justify-center text-gray-500 text-xl font-normal font-['Inter']">{passData?.type || 'Ordinary'}</div>
              </div>
              <div className="w-28 h-5 left-[24px] top-[8px] absolute justify-center text-gray-500 text-lg font-normal font-['Inter']">Bus service</div>
            </div>
            <div className="w-[492px] h-32 left-[5px] top-[5px] absolute bg-black/0">
              <div className="w-[456px] h-14 left-[17px] top-[61px] absolute bg-black/0">
                <div className="w-96 h-12 left-[6px] top-[6px] absolute bg-emerald-50 rounded-md" />
                <div className="w-96 h-6 left-[26px] top-[18px] absolute justify-center text-gray-600 text-xl font-normal font-['Inter']">{passData?.name || 'Ordinary Day Pass'}</div>
              </div>
              <div className="w-24 h-6 left-[24px] top-[27px] absolute justify-center text-gray-500 text-xl font-normal font-['Inter']">Pass Type</div>
            </div>
          </div>
          <div className="w-32 h-6 left-[20px] top-[21px] absolute justify-center text-gray-500 text-xl font-normal font-['Inter']">Pass details</div>
        </div>
        <div className="w-[540px] h-20 left-0 top-0 absolute bg-black/0">
          <div className="w-[540px] h-20 left-0 top-0 absolute bg-teal-950 header-teal-fix" />
          <div className="w-[540px] h-16 left-0 top-[16px] absolute bg-black/0">
            <div className="w-40 h-7 left-[77px] top-[19px] absolute justify-center text-xl font-bold font-['Inter']" style={{color: '#fefefd'}}>Booking Details</div>
            <img 
              className="w-6 h-6 left-[27px] top-[21px] absolute cursor-pointer" 
              src={newBackArrow} 
              alt="Back arrow" 
              onClick={handleGoBack}
            />
          </div>
        </div>
      </div>

      {/* Date Picker */}
      <DatePicker
        isOpen={showDatePicker}
        onSave={handleDateSelect}
        onCancel={() => setShowDatePicker(false)}
      />
    </MobileContainer>
  );
};

export default Identity;