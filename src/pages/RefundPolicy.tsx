import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const RefundPolicy = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="flex items-center p-4 border-b">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(-1)}
          className="mr-3"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-lg font-semibold">Refund & Cancellation Policy</h1>
      </div>

      {/* Iframe container */}
      <div className="w-full h-[calc(100vh-73px)]">
        <iframe
          src="https://www.tummoc.com/cancellation-and-refund-policy"
          className="w-full h-full border-0"
          title="Refund & Cancellation Policy"
          sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
        />
      </div>
    </div>
  );
};

export default RefundPolicy;