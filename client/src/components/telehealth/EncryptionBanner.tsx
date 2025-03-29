import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ShieldCheck, ShieldAlert } from 'lucide-react';

interface EncryptionBannerProps {
  isEncrypted: boolean;
}

const EncryptionBanner: React.FC<EncryptionBannerProps> = ({ isEncrypted }) => {
  if (isEncrypted) {
    return (
      <Alert className="mb-4 bg-green-50 border-green-200">
        <ShieldCheck className="h-4 w-4 text-green-600" />
        <AlertTitle className="text-green-800">End-to-End Encrypted Session</AlertTitle>
        <AlertDescription className="text-green-700">
          Your telehealth session is secured with end-to-end encryption for HIPAA compliance. 
          No one, including MentalSpace, can access your video or audio.
        </AlertDescription>
      </Alert>
    );
  }
  
  return (
    <Alert variant="destructive" className="mb-4">
      <ShieldAlert className="h-4 w-4" />
      <AlertTitle>Not Encrypted</AlertTitle>
      <AlertDescription>
        Your connection is not encrypted. Please refresh your browser or try again later.
      </AlertDescription>
    </Alert>
  );
};

export default EncryptionBanner;