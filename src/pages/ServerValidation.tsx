import { MobileContainer } from "@/components/MobileContainer";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { serverKeyStorage } from "@/lib/serverKeyStorage";
import { Loader2, KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const ServerValidation = () => {
  const navigate = useNavigate();
  const { isAuthenticated, validateServerKey } = useAuth();
  const [status, setStatus] = useState<'checking' | 'need-key' | 'retry'>('checking');
  const [message, setMessage] = useState("");
  const [serverKey, setServerKey] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const checkStoredKey = async () => {
    const stored = serverKeyStorage.get();
    if (!stored) {
      setStatus('need-key');
      return;
    }
    setStatus('checking');
    const result = await validateServerKey(stored, false);
    if (result.success) {
      navigate('/', { replace: true });
    } else if (result.message?.startsWith('Could not reach')) {
      setStatus('retry');
      setMessage(result.message);
    } else {
      setStatus('need-key');
      setMessage(result.message || '');
    }
  };

  useEffect(() => {
    checkStoredKey();
  }, []);

  const handleSubmit = async () => {
    if (!serverKey.trim() || submitting) return;
    setSubmitting(true);
    const result = await validateServerKey(serverKey.trim(), true);
    setSubmitting(false);

    if (result.success) {
      navigate('/', { replace: true });
    } else if (result.message?.startsWith('Could not reach')) {
      setStatus('retry');
      setMessage(result.message);
    } else {
      setStatus('need-key');
      setMessage(result.message || 'Invalid server key.');
      setServerKey("");
    }
  };

  return (
    <MobileContainer width={540} height={1072}>
      <div className="w-[540px] h-[1072px] left-0 top-0 absolute bg-white flex flex-col items-center justify-center px-12">
        {/* Spinner / key icon */}
        <div className="w-24 h-24 rounded-full bg-teal-50 flex items-center justify-center mb-8">
          {status === 'checking' ? (
            <Loader2 className="w-12 h-12 text-teal-900 animate-spin" />
          ) : (
            <KeyRound className="w-12 h-12 text-teal-900" />
          )}
        </div>

        <h1 className="text-3xl font-bold text-gray-800 mb-3 text-center">Server Validation</h1>
        <p className="text-lg text-gray-600 text-center mb-10">
          {status === 'need-key'
            ? 'Please enter the server key to continue.'
            : 'Please wait, server validation is taking place...'}
        </p>

        {status === 'checking' && (
          <p className="text-sm text-gray-400 animate-pulse">Validating your access...</p>
        )}

        {status === 'retry' && (
          <div className="w-full flex flex-col items-center gap-4">
            <p className="text-red-500 text-center">{message}</p>
            <Button
              onClick={checkStoredKey}
              className="w-48 h-14 bg-teal-950 hover:bg-teal-900 text-white text-lg rounded-md"
            >
              Retry
            </Button>
          </div>
        )}

        {status === 'need-key' && (
          <div className="w-full flex flex-col gap-4">
            {message && <p className="text-red-500 text-center">{message}</p>}
            <Input
              type="text"
              value={serverKey}
              onChange={(e) => setServerKey(e.target.value)}
              placeholder="Enter server key"
              className="w-full h-16 text-xl px-5 bg-neutral-50 rounded-md border border-zinc-300 focus:outline-none focus:border-teal-900"
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSubmit();
              }}
            />
            <Button
              onClick={handleSubmit}
              disabled={!serverKey.trim() || submitting}
              className="w-full h-16 bg-teal-950 hover:bg-teal-900 text-white text-lg rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Validating...' : 'Verify & Continue'}
            </Button>
          </div>
        )}
      </div>
    </MobileContainer>
  );
};

export default ServerValidation;
