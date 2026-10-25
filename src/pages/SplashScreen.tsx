import logoImage from "@/assets/_d.png";
import indiaFlag from "@/assets/india-flag.png";
const SplashScreen = () => {
  return <div className="w-screen h-screen fixed inset-0 bg-teal-950 overflow-hidden flex flex-col">
      {/* Main content - centered logo */}
      <div className="flex-1 flex items-center justify-center -mt-16">
        <img src={logoImage} alt="App Logo" className="w-48 h-48 object-contain animate-fade-in" style={{
        animationDelay: '0.5s',
        animationFillMode: 'backwards'
      }} />
      </div>

      {/* Footer - sticks to bottom with safe area padding */}
      <div style={{
      animationDelay: '0.5s',
      animationFillMode: 'backwards',
      paddingBottom: 'max(3rem, env(safe-area-inset-bottom))'
    }} className="pb-12 flex items-center justify-center gap-2 animate-fade-in mx-0 px-0 my-0 py-0">
        <img src={indiaFlag} alt="India Flag" className="w-5 h-5 object-contain" />
        <p className="text-white text-xs font-normal">Made with love in India</p>
      </div>
    </div>;
};
export default SplashScreen;