import { Dialog, DialogContent } from "@/components/ui/dialog";
import { passesData } from "@/data/passData";

interface FinalPageFarePopupProps {
  isOpen: boolean;
  onClose: () => void;
  passName: string;
  amount: string;
}

const Rupee = () => (
  <span style={{ fontFamily: 'Arial, sans-serif', fontWeight: 600 }}>₹</span>
);

export const FinalPageFarePopup = ({ isOpen, onClose, passName, amount }: FinalPageFarePopupProps) => {
  const passInfo = passesData.find(p => p.name === passName);

  const formatVal = (val: string | undefined, fallback: string) => {
    if (!val) return fallback;
    const num = val.replace(/[₹\s]/g, '');
    return num;
  };

  const basePrice = formatVal(passInfo?.basePrice, amount);
  const gst = formatVal(passInfo?.gst, '0.0');
  const tollPrice = '0.0';
  const totalAmount = formatVal(passInfo?.totalFare, amount);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="bg-white rounded-2xl p-0 border-0 shadow-xl [&>button]:hidden"
        style={{
          width: '80%',
          maxWidth: '80%',
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
        }}
      >
        <div className="p-8">
          <div className="text-gray-900 text-3xl font-montserrat-bold font-semibold mb-6">Pass fare</div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-500 text-2xl font-montserrat-regular">Base Price</span>
              <span className="text-gray-900 text-2xl font-montserrat-regular font-semibold"><Rupee /> {basePrice}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500 text-2xl font-montserrat-regular">GST</span>
              <span className="text-gray-900 text-2xl font-montserrat-regular font-semibold"><Rupee /> {gst}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500 text-2xl font-montserrat-regular">Toll Price</span>
              <span className="text-gray-900 text-2xl font-montserrat-regular font-semibold"><Rupee /> {tollPrice}</span>
            </div>
          </div>

          <div className="border-t-2 border-gray-400 mt-5 pt-5">
            <div className="flex justify-between items-center">
              <span className="text-gray-900 text-3xl font-montserrat-bold font-semibold">Total Amount</span>
              <span className="text-gray-900 text-3xl font-montserrat-bold font-semibold"><Rupee /> {totalAmount}</span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
