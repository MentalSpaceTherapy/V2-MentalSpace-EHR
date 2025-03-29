import { Shield, AlertTriangle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface EncryptionBannerProps {
  enabled: boolean;
}

const EncryptionBanner: React.FC<EncryptionBannerProps> = ({ enabled }) => {
  if (!enabled) {
    return (
      <Alert className="rounded-none border-t-0 border-x-0 bg-amber-50 border-amber-200">
        <div className="flex items-center">
          <AlertTriangle className="h-4 w-4 text-amber-600 mr-2" />
          <AlertDescription className="text-amber-800">
            <span className="font-medium">Warning:</span> End-to-end encryption is disabled. Your session may not be fully secure.
          </AlertDescription>
        </div>
      </Alert>
    );
  }
  
  return (
    <Alert className="rounded-none border-t-0 border-x-0 bg-green-50 border-green-200">
      <div className="flex items-center">
        <Shield className="h-4 w-4 text-green-600 mr-2" />
        <AlertDescription className="text-green-800">
          <span className="font-medium">Secure Session:</span> This telehealth session is protected with end-to-end encryption.
        </AlertDescription>
      </div>
    </Alert>
  );
};

export default EncryptionBanner;