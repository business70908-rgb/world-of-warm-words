import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import closeIcon from "@/assets/Close-icon.png";
import type { PassInfo } from "@/data/passData";

interface PassFareDialogProps {
  isOpen: boolean;
  onClose: () => void;
  passInfo: PassInfo | null;
}

const PassFareDialog = ({ isOpen, onClose, passInfo }: PassFareDialogProps) => {
  if (!passInfo) return null;

  const isExpressPass = passInfo.name === 'Express Monthly Pass (Limited Stop)';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[450px] bg-white rounded-lg px-4 pb-4 pt-14">
        <DialogHeader className="relative">
          <button
            onClick={onClose}
            className="absolute -top-9 right-2 z-10 bg-transparent border-0 p-0"
          >
            <img src={closeIcon} alt="Close" className="h-6 w-6" />
          </button>
          <div className={`text-2xl font-normal text-gray-800 mb-[10px] text-left ${isExpressPass ? 'mt-10' : 'mt-6'}`}>
            {passInfo.name}
          </div>
        </DialogHeader>
        
        <div className="space-y-4 mt-0">
          {/* Pass Type Badge */}
          {passInfo.type === 'AC' ? (
            <div className="w-14 h-10 bg-black/0 relative">
              <div className="w-12 h-8 left-[4px] top-[5px] absolute rounded-[9.50px] border border-stone-200 flex items-center justify-center" style={{ backgroundColor: '#DCEAC3' }} />
              <div className="w-7 h-5 left-[15px] top-[11px] absolute flex items-center justify-center text-lg font-bold font-['Inter']" style={{ color: '#628524' }}>AC</div>
            </div>
          ) : (
            <div className="w-28 h-10 bg-black/0 relative">
              <div className="w-24 h-8 left-[4px] top-[4px] absolute rounded-[10px] border border-lime-50 flex items-center justify-center" style={{ backgroundColor: '#DCEAC3' }} />
              <div className="w-20 h-5 left-[15px] top-[10px] absolute flex items-center justify-center text-lg font-bold font-['Inter']" style={{ color: '#628524' }}>Ordinary</div>
            </div>
          )}
          
          <div className="space-y-1">
            <h3 className="text-xl font-bold text-gray-800">Pass fare</h3>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Base Price</span>
                <span className="font-semibold">{passInfo.basePrice}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">GST</span>
                <span className="font-semibold">{passInfo.gst}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Toll Price</span>
                <span className="font-semibold">{passInfo.tollPrice ?? '₹ 0.0'}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Convenience Fee</span>
                <span className="font-semibold">{passInfo.convenienceFee}</span>
              </div>
              <div className="text-gray-500 text-sm mt-1">(Including GST)</div>
            </div>
            
            <div className="border-t-2 border-gray-400 pt-3">
              <div className="flex justify-between text-xl font-bold">
                <span>Total Amount</span>
                <span>{passInfo.totalFare}</span>
              </div>
            </div>
          </div>
          
          <div className="text-sm text-gray-600 leading-relaxed">
            {passInfo.description.split('\n\n').map((paragraph, index) => (
              <span key={index}>
                {paragraph}
                {index < passInfo.description.split('\n\n').length - 1 && (
                  <>
                    <br />
                    <br />
                  </>
                )}
              </span>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PassFareDialog;
