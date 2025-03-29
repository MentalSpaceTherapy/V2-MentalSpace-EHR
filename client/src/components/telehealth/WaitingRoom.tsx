import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Calendar, Clock, Video, Phone } from "lucide-react";

interface WaitingRoomProps {
  session: {
    clientName: string;
    sessionType: string;
    scheduledStartTime: Date;
    duration: number;
  };
  onAdmitClient: () => void;
  onEndSession: () => void;
}

const WaitingRoom: React.FC<WaitingRoomProps> = ({
  session,
  onAdmitClient,
  onEndSession
}) => {
  const formatSessionTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
    }).format(date);
  };
  
  const formatSessionDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };
  
  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-neutral-100 p-6">
      <Card className="max-w-md w-full">
        <CardHeader>
          <CardTitle className="text-xl">Waiting Room</CardTitle>
          <CardDescription>
            You're in the session waiting room. Your client will be notified.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <div className="flex flex-col items-center justify-center py-6">
              <div className="h-20 w-20 rounded-full bg-primary-100 flex items-center justify-center mb-4">
                <User className="h-10 w-10 text-primary-600" />
              </div>
              <h2 className="text-xl font-bold">{session.clientName}</h2>
              <p className="text-neutral-500">{session.sessionType}</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center">
              <Calendar className="h-5 w-5 text-neutral-500 mr-3" />
              <div>
                <p className="text-sm font-medium">Session Date</p>
                <p className="text-neutral-600">{formatSessionDate(session.scheduledStartTime)}</p>
              </div>
            </div>
            
            <div className="flex items-center">
              <Clock className="h-5 w-5 text-neutral-500 mr-3" />
              <div>
                <p className="text-sm font-medium">Session Time</p>
                <p className="text-neutral-600">
                  {formatSessionTime(session.scheduledStartTime)} ({session.duration} minutes)
                </p>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={onEndSession}>
            <Phone className="h-4 w-4 mr-2 transform rotate-135" />
            End Session
          </Button>
          <Button onClick={onAdmitClient}>
            <Video className="h-4 w-4 mr-2" />
            Admit Client
          </Button>
        </CardFooter>
      </Card>
      
      <div className="mt-8 text-center text-neutral-500">
        <p>The session is secure and end-to-end encrypted</p>
      </div>
    </div>
  );
};

export default WaitingRoom;