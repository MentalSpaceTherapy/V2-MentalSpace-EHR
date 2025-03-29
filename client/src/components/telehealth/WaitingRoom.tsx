import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, VideoIcon } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface WaitingRoomProps {
  clientName: string;
  therapistName?: string;
  isTherapist: boolean;
  onCancel: () => void;
}

const WaitingRoom: React.FC<WaitingRoomProps> = ({ 
  clientName, 
  therapistName = 'your therapist',
  isTherapist,
  onCancel
}) => {
  return (
    <div className="w-full max-w-md mx-auto mt-10">
      <Card className="border-blue-200">
        <CardHeader className="bg-blue-50 border-b border-blue-100">
          <CardTitle className="text-blue-800">
            {isTherapist ? 'Waiting for client' : 'Waiting Room'}
          </CardTitle>
          <CardDescription>
            {isTherapist 
              ? `Waiting for ${clientName} to join the session`
              : `Waiting for ${therapistName} to admit you`}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="pt-6 text-center">
          <div className="bg-gray-800 rounded-lg p-10 mb-6 flex items-center justify-center">
            <VideoIcon size={64} className="text-gray-400" />
          </div>
          
          <div className="flex items-center justify-center gap-2 text-blue-600 mb-6">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>
              {isTherapist 
                ? 'Waiting for client to connect...' 
                : 'Waiting to be admitted to the session...'}
            </span>
          </div>
          
          <Alert className="bg-blue-50 border-blue-200 mb-4">
            <AlertDescription className="text-blue-700">
              {isTherapist
                ? 'You will be notified when your client joins the session. Keep this window open.'
                : 'Your therapist has been notified of your arrival. Please wait to be admitted to the session.'}
            </AlertDescription>
          </Alert>
          
          <div className="text-sm text-gray-500 mt-2">
            {isTherapist 
              ? `The session invitation has been sent to ${clientName}.`
              : `Your appointment with ${therapistName} is being prepared.`}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WaitingRoom;