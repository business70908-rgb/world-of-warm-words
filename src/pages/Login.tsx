import { MobileContainer } from "@/components/MobileContainer";
import deskImage from "@/assets/desk.png";
import { ChevronRight } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";


const Login = () => {
  const navigate = useNavigate();
  const { isAuthenticated, login } = useAuth();
  const [phoneNumber, setPhoneNumber] = useState("");
  const [showPinDialog, setShowPinDialog] = useState(false);
  const [pin, setPin] = useState(["", "", "", ""]);
  const [activeIndex, setActiveIndex] = useState(0);
  

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "");
    if (value.length <= 10) {
      setPhoneNumber(value);
    }
  };

  const handlePinChange = async (index: number, value: string) => {
    const numericValue = value.replace(/\D/g, "");
    
    if (numericValue.length <= 1) {
      const newPin = [...pin];
      newPin[index] = numericValue;
      setPin(newPin);
      
      if (numericValue && index < 3) {
        const nextInput = document.querySelector(`input[data-pin-index="${index + 1}"]`) as HTMLInputElement;
        if (nextInput) nextInput.focus();
      }
      
      if (newPin.every(d => d !== '')) {
        const pinString = newPin.join('');
        const result = await login(phoneNumber, pinString);
        
        if (result.success) {
          toast.success("Login successful!");
          setShowPinDialog(false);
          navigate('/', { replace: true });
        } else {
          toast.error(result.message || "Login failed");
          setPin(["", "", "", ""]);
          setActiveIndex(0);
        }
      }
    }
  };

  const handlePinKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (!pin[index] && index > 0) {
        const prevInput = document.querySelector(`input[data-pin-index="${index - 1}"]`) as HTMLInputElement;
        if (prevInput) prevInput.focus();
      }
    }
  };

  return (
    <MobileContainer width={540} height={1072}>
      <div className="w-[540px] h-[1072px] left-0 top-0 absolute bg-black/0">
        <div className="w-[540px] h-[1072px] left-0 top-0 absolute bg-white" />
        <div className="w-[540px] h-[950px] left-0 top-[60px] absolute bg-black/0">
          <div className="w-[540px] h-[950px] left-0 top-0 absolute bg-black/0">
            <div className="w-48 h-24 left-[181px] top-[703px] absolute bg-black/0 flex gap-3 items-center justify-center">
              {/* Google Icon */}
              <div className="w-20 h-20 bg-white rounded-full shadow-md flex items-center justify-center">
                <svg className="w-10 h-10" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
              </div>
              {/* Facebook Icon */}
              <div className="w-20 h-20 bg-white rounded-full shadow-md flex items-center justify-center">
                <svg className="w-10 h-10" viewBox="0 0 24 24">
                  <path fill="#1877F2" d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </div>
            </div>
            <div className="w-40 h-0.5 left-[338px] top-[645px] absolute bg-gray-300" />
            <div className="w-36 h-6 left-[233px] top-[634px] absolute justify-center text-zinc-500 text-lg font-normal font-['Inter']">or login with</div>
            <div className="w-44 h-0.5 left-[45px] top-[645px] absolute bg-gray-300" />
            <div className="w-[461px] h-20 left-[38px] top-[510px] absolute bg-black/0">
              <div className="w-[453px] h-20 left-[6px] top-[6px] absolute bg-neutral-50 rounded-md border border-zinc-300" />
              <button 
                className="w-16 h-20 left-[394px] top-[6px] absolute bg-teal-950 rounded-r-md flex items-center justify-center hover:bg-teal-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={phoneNumber.length !== 10}
                onClick={() => {
                  if (phoneNumber.length === 10) {
                    setShowPinDialog(true);
                  }
                }}
              >
                <ChevronRight className="w-8 h-8 text-white" />
              </button>
              <input
                type="tel"
                value={phoneNumber}
                onChange={handlePhoneChange}
                placeholder="Enter 10-digit number"
                maxLength={10}
                className="w-72 left-[28px] top-[29px] absolute bg-transparent text-zinc-600 text-2xl font-normal font-['Inter'] outline-none px-3"
              />
            </div>
            <div className="w-[540px] h-96 left-0 top-[38px] absolute bg-black/0">
              <img className="w-80 h-72 left-[110px] top-[150px] absolute" src={deskImage} alt="Desk" />
              <div className="w-40 h-9 left-[239px] top-[81px] absolute justify-center text-sky-300 text-2xl font-semibold font-['Inter']">Login</div>
              <div className="w-64 h-11 left-[175px] top-[21px] absolute justify-center text-gray-700 text-5xl font-bold font-['Inter']">Welcome</div>
            </div>
          </div>
        </div>
        <div className="w-[540px] h-16 left-0 top-0 absolute bg-black/0">
          <div className="w-12 h-12 left-[12px] top-[1px] absolute bg-white" />
        </div>
      </div>
      {/* PIN Dialog */}
      <Dialog open={showPinDialog} onOpenChange={setShowPinDialog}>
        <DialogContent className="sm:max-w-md">
          <div className="space-y-6 py-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Enter PIN</h2>
              <p className="text-gray-600">Enter your 4-digit PIN to login</p>
            </div>
            
            <div className="flex justify-center gap-4">
              {pin.map((digit, index) => (
                <Input
                  key={index}
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={digit}
                  onChange={(e) => handlePinChange(index, e.target.value)}
                  onKeyDown={(e) => handlePinKeyDown(index, e)}
                  onFocus={() => setActiveIndex(index)}
                  maxLength={1}
                  autoFocus={index === activeIndex}
                  data-pin-index={index}
                  className="w-16 h-16 text-center text-2xl font-bold border-2 border-gray-300 focus:outline-none focus:ring-0 focus:border-gray-300"
                />
              ))}
            </div>
            
            <button
              onClick={() => {
                setShowPinDialog(false);
                setPin(["", "", "", ""]);
                setActiveIndex(0);
              }}
              className="w-full py-3 text-gray-600 hover:text-gray-900"
            >
              Cancel
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </MobileContainer>
  );
};

export default Login;
