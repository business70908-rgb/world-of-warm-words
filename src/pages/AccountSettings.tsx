import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import backArrow from "@/assets/back-arrow.png";
import logoutIcon from "@/assets/logout-icon.png";
import deleteAccountIcon from "@/assets/delete-account-icon.png";
import arrowRight from "@/assets/arrow-right.png";
import characterImage from "@/assets/2b.png";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { MobileContainer } from "@/components/MobileContainer";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/contexts/AuthContext";
const AccountSettings = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { logout } = useAuth();
  const [isApiKeyDialogOpen, setIsApiKeyDialogOpen] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState("");
  const [currentApiKey, setCurrentApiKey] = useState("");
  const [longPressTimer, setLongPressTimer] = useState<ReturnType<typeof setTimeout> | null>(null);
  const [isLogoutDrawerOpen, setIsLogoutDrawerOpen] = useState(false);
  const [isLongPress, setIsLongPress] = useState(false);
  const [isDeleteAccountDialogOpen, setIsDeleteAccountDialogOpen] = useState(false);
  useEffect(() => {
    // Load existing API key from localStorage
    const savedApiKey = localStorage.getItem("razorpayApiKey");
    if (savedApiKey) {
      setCurrentApiKey(savedApiKey);
    }
  }, []);
  const handleSaveApiKey = () => {
    if (apiKeyInput.trim()) {
      localStorage.setItem("razorpayApiKey", apiKeyInput.trim());
      setCurrentApiKey(apiKeyInput.trim());
      setIsApiKeyDialogOpen(false);
      setApiKeyInput("");
      toast({
        title: "API Key Saved",
        description: "RazorPay API key has been saved successfully."
      });
    }
  };
  const handleCancelApiKey = () => {
    setApiKeyInput("");
    setIsApiKeyDialogOpen(false);
  };
  const openApiKeyDialog = () => {
    setApiKeyInput(currentApiKey);
    setIsApiKeyDialogOpen(true);
  };
  const handleLongPressStart = (callback: () => void) => {
    setIsLongPress(false);
    const timer = setTimeout(() => {
      setIsLongPress(true);
      callback();
    }, 500); // 500ms long press
    setLongPressTimer(timer);
  };
  const handleLongPressEnd = () => {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
  };
  const handleLogoutClick = () => {
    if (!isLongPress) {
      setIsLogoutDrawerOpen(true);
    }
    setIsLongPress(false);
  };
  const handleLogoutConfirm = () => {
    logout();
    setIsLogoutDrawerOpen(false);
    navigate("/login", { replace: true });
  };
  const handleDeleteAccountClick = () => {
    setIsDeleteAccountDialogOpen(true);
  };
  const handleDeleteAccountConfirm = () => {
    logout();
    setIsDeleteAccountDialogOpen(false);
    navigate("/login", { replace: true });
  };
  const handleContinueWithTummoc = () => {
    setIsDeleteAccountDialogOpen(false);
    navigate("/");
  };
  return <MobileContainer width={709} height={1440}>
      <div className="w-[709px] h-[1440px] left-0 top-0 absolute bg-black/0">
        <div className="w-[709px] h-[1440px] left-0 top-0 absolute bg-white" />
        <div className="w-[709px] h-[3px] left-0 top-[1432px] absolute bg-white" />
        <div className="w-[709px] h-80 left-0 top-[1px] absolute bg-black/0">
          <div className="w-[709px] h-28 left-0 top-[234px] absolute bg-black/0 cursor-pointer hover:bg-gray-50/20 transition-colors" onClick={handleDeleteAccountClick}>
            <img className="w-3 h-5 left-[632px] top-[47px] absolute" src={arrowRight} />
            <div className="w-52 h-8 left-[130px] top-[38px] absolute justify-center text-delete-text text-3xl font-normal font-['Inter']">Delete Account</div>
            <img className="w-11 h-11 left-[48px] top-[35px] absolute" src={deleteAccountIcon} />
          </div>
          <div className="w-[709px] h-28 left-0 top-[115px] absolute bg-black/0 cursor-pointer hover:bg-gray-50/20 transition-colors select-none" onMouseDown={() => handleLongPressStart(openApiKeyDialog)} onMouseUp={handleLongPressEnd} onMouseLeave={handleLongPressEnd} onTouchStart={() => handleLongPressStart(openApiKeyDialog)} onTouchEnd={handleLongPressEnd} onClick={handleLogoutClick}>
            <img className="w-3 h-5 left-[632px] top-[47px] absolute" src={arrowRight} />
            <div className="w-24 h-9 left-[134px] top-[38px] absolute justify-center text-gray-600 text-3xl font-normal font-['Inter']">
              Logout
            </div>
            <img className="w-9 h-9 left-[53px] top-[38px] absolute" src={logoutIcon} />
          </div>
          <div className="w-[709px] h-28 left-0 top-0 absolute bg-black/0">
            <div className="w-72 h-11 left-[102px] top-[34px] absolute justify-center text-gray-700 text-3xl font-bold font-['Inter']">Account Settings</div>
            <img className="w-7 h-7 left-[37px] top-[38px] absolute cursor-pointer" src={backArrow} onClick={() => navigate(-1)} />
          </div>
        </div>
      </div>

      {/* RazorPay API Key Dialog */}
      <Dialog open={isApiKeyDialogOpen} onOpenChange={setIsApiKeyDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">RazorPay API Key</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="apikey" className="text-sm font-medium text-gray-700">
                Enter your RazorPay API Key
              </label>
              <Input id="apikey" type="password" placeholder="rzp_test_xxxxxxxxxxxxxxxx" value={apiKeyInput} onChange={e => setApiKeyInput(e.target.value)} className="w-full" />
              <p className="text-xs text-gray-500">
                ⚠️ Security Note: Only use publishable API keys. Never store secret keys in the browser.
              </p>
            </div>
            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" onClick={handleCancelApiKey} className="px-6">
                Cancel
              </Button>
              <Button onClick={handleSaveApiKey} className="px-6 bg-blue-600 hover:bg-blue-700 text-white">
                Save
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Logout Confirmation Drawer */}
      {isLogoutDrawerOpen && <div className="fixed inset-0 z-50 flex items-end" onClick={e => {
      if (e.target === e.currentTarget) {
        setIsLogoutDrawerOpen(false);
      }
    }}>
          <div className="w-full rounded-t-3xl animate-slide-in-bottom" style={{
        height: '35%',
        minHeight: '504px',
        backgroundColor: '#f3f3f3'
      }}>
            <div className="flex flex-col items-center pt-12 pb-8 px-8 h-full">
              <img src={logoutIcon} alt="Logout" className="w-20 h-20 mb-8" />
              <h2 className="text-4xl font-bold text-[#1a1a1a] mb-6">Account Logout</h2>
              <p className="text-2xl text-[#555] mb-8 text-center">
                Are you sure you want to logout?
              </p>
              <div className="flex flex-col gap-5 w-full mt-6">
                <button onClick={handleLogoutConfirm} className="w-full h-20 rounded-xl text-white text-2xl font-semibold" style={{
              backgroundColor: '#02B8B8'
            }}>
                  Yes
                </button>
                <button onClick={() => setIsLogoutDrawerOpen(false)} className="w-full h-20 rounded-xl bg-transparent text-2xl font-semibold" style={{
              border: '3px solid #424242',
              color: '#555'
            }}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>}

      {/* Delete Account Full Screen Dialog */}
      {isDeleteAccountDialogOpen && <div className="fixed inset-0 z-50 bg-[#FEFEFE]">
          <div className="w-full h-full flex flex-col">
            {/* Header */}
            <div className="flex items-center px-6 py-6">
              <img src={backArrow} alt="Back" className="w-7 h-7 cursor-pointer" onClick={() => setIsDeleteAccountDialogOpen(false)} />
              <h1 className="text-2xl font-bold text-gray-900 ml-6">Delete Account</h1>
            </div>

            {/* Scrollable Content */}
            <ScrollArea className="flex-1 px-8 py-6">
              <div className="flex flex-col items-center">
                <img src={characterImage} alt="Character" className="w-96 h-48 mb-8" />
                
                <h2 className="font-bold text-gray-900 mb-8 text-center text-5xl">
                  Saying goodbye is difficult!
                </h2>

                <p className="font-semibold text-gray-800 mb-8 self-start text-3xl">
                  Please remember...
                </p>

                <div className="space-y-6 text-black text-2xl leading-relaxed mb-8">
                  <div className="flex gap-4">
                    <span className="text-5xl mt-0 leading-none text-black">•</span>
                    <p>Users can request to have their account deleted via the app settings or by contacting our customer support team.</p>
                  </div>
                  
                  <div className="flex gap-4">
                    <span className="text-5xl mt-0 leading-none text-black">•</span>
                    <p>Once a user's account is deleted, all data associated with that user's account including any personal information will be deleted.</p>
                  </div>
                  
                  <div className="flex gap-4">
                    <span className="text-5xl mt-0 leading-none text-black">•</span>
                    <p>Users will be responsible if there are any active tickets or passes associated with the deleted account, as these will also not be accessible post deletion.</p>
                  </div>
                  
                  <div className="flex gap-4">
                    <span className="text-5xl mt-0 leading-none text-black">•</span>
                    <p>If there are any passes that are in the cancellation process at the time of deletion, the refunds will be processed according to the refund policy before account deletion.</p>
                  </div>
                  
                  <div className="flex gap-4">
                    <span className="text-5xl mt-0 leading-none text-black">•</span>
                    <p>Once an account is deleted, it cannot be reversed. And this process will be put into effect immediately.</p>
                  </div>
                  
                  <div className="flex gap-4">
                    <span className="text-5xl mt-0 leading-none text-black">•</span>
                    <p>Deleted accounts can't be recovered, if users want to use Tummoc again, they will have to create a new account.</p>
                  </div>

                  <div className="flex gap-4">
                    <span className="text-5xl mt-0 leading-none text-black">•</span>
                    <p>Before an account is deleted, any pending transaction or ongoing disputes must be resolved</p>
                  </div>

                  <div className="flex gap-4">
                    <span className="text-5xl mt-0 leading-none text-black">•</span>
                    <p>Tummoc reserves the right to retain certain data for legal or regulatory purposes, as required by law.</p>
                  </div>
                </div>

                <p className="font-semibold text-gray-800 mb-8 self-start text-3xl">
                  Business Profile
                </p>

                <div className="space-y-6 text-black text-2xl leading-relaxed mb-8">
                  <div className="flex gap-4">
                    <span className="text-5xl mt-0 leading-none text-black">•</span>
                    <p>Please unlink you business profile, if you have any linked before removing your this Personal Account.</p>
                  </div>

                  <div className="flex gap-4">
                    <span className="text-5xl mt-0 leading-none text-black">•</span>
                    <p>After Unlinking, you can link your Business Profile to another Personal Account.</p>
                  </div>
                </div>
              </div>
            </ScrollArea>

            {/* Fixed Bottom Buttons */}
            <div className="px-6 py-6 space-y-6 bg-[#FEFEFE]">
              <button onClick={handleContinueWithTummoc} className="w-full h-20 rounded-xl text-white text-xl font-semibold" style={{
            backgroundColor: '#02B8B8'
          }}>
                Continue with Tummoc
              </button>
              <button onClick={handleDeleteAccountConfirm} className="w-full h-20 rounded-xl bg-transparent text-xl font-semibold border-2" style={{
            borderColor: '#02B8B8',
            color: '#02B8B8'
          }}>
                Delete Account
              </button>
            </div>
          </div>
        </div>}
    </MobileContainer>;
};
export default AccountSettings;