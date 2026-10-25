import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { MobileContainer } from '@/components/MobileContainer';

const terms = [
  'A Business Profile can only be linked using a valid corporate/company email ID.',
  'Linking is initiated by the employee from the Tummoc app.',
  'OTP verification sent to the official company email is mandatory.',
  'A Business Profile is always linked to an existing Personal Account.',
  'Business Profiles cannot be created or used independently.',
  'Only verified employees can access business wallets, passes, or benefits.',
  'Once linked, the Business Profile appears as a separate switchable profile in the app.',
  'Linking gives access only to company-approved commute benefits.',
];

const BusinessLinkingTerms = () => {
  const navigate = useNavigate();

  return (
    <MobileContainer width={540} height={1040}>
      <div className="w-[540px] h-full bg-white flex flex-col">
        {/* Header */}
        <div className="w-[540px] h-14 flex items-center px-6 flex-shrink-0">
          <ArrowLeft
            className="w-6 h-5 cursor-pointer text-black"
            onClick={() => navigate(-1)}
          />
          <span className="ml-4 text-black text-xl font-bold font-['Inter']">
            Profile Linking Terms & Conditions
          </span>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-8 pt-6">
          <ul className="space-y-5 list-none">
            {terms.map((term, index) => (
              <li key={index} className="flex items-start gap-3">
                <span className="mt-2 w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: '#2d3748' }} />
                <span className="text-lg font-normal font-['Inter']" style={{ color: '#a9a9a9' }}>
                  {term}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </MobileContainer>
  );
};

export default BusinessLinkingTerms;
