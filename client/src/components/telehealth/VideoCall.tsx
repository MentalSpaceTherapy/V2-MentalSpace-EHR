import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MicOff, VideoOff } from "lucide-react";

interface VideoCallProps {
  isVideoMuted: boolean;
  isScreenSharing: boolean;
  clientName: string;
}

const VideoCall: React.FC<VideoCallProps> = ({
  isVideoMuted,
  isScreenSharing,
  clientName
}) => {
  const [localVideoStream, setLocalVideoStream] = useState<MediaStream | null>(null);
  const [remoteDummy, setRemoteDummy] = useState(false); // Dummy state for remote video
  
  // Simulated video initialization
  useEffect(() => {
    if (!isVideoMuted) {
      const getMedia = async () => {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
          setLocalVideoStream(stream);
        } catch (err) {
          console.error("Error accessing camera/microphone:", err);
        }
      };
      
      getMedia();
      
      return () => {
        if (localVideoStream) {
          localVideoStream.getTracks().forEach(track => track.stop());
        }
      };
    } else {
      if (localVideoStream) {
        localVideoStream.getTracks().forEach(track => track.stop());
        setLocalVideoStream(null);
      }
    }
  }, [isVideoMuted]);
  
  // Simulate remote video with a timeout
  useEffect(() => {
    const timer = setTimeout(() => {
      setRemoteDummy(true);
    }, 2000);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Set up local video element
  useEffect(() => {
    const videoElement = document.getElementById('localVideo') as HTMLVideoElement;
    if (videoElement && localVideoStream && !isVideoMuted) {
      videoElement.srcObject = localVideoStream;
    }
  }, [localVideoStream, isVideoMuted]);
  
  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 bg-neutral-900 relative flex items-center justify-center">
        {/* Remote Video (Therapist's view of client) */}
        <div className="w-full h-full relative">
          {remoteDummy ? (
            <div className="w-full h-full bg-neutral-800 flex items-center justify-center">
              <div className="text-center">
                <Avatar className="h-40 w-40 mx-auto mb-4">
                  <AvatarFallback className="bg-primary-200 text-primary-700 text-4xl">
                    {clientName.split(' ').map(name => name[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <h3 className="text-white text-xl font-medium">{clientName}</h3>
                <p className="text-neutral-400 mt-2">
                  {isVideoMuted ? "Camera is turned off" : "Connecting..."}
                </p>
              </div>
            </div>
          ) : (
            <div className="w-full h-full bg-neutral-800 flex items-center justify-center">
              <div className="animate-pulse flex flex-col items-center">
                <div className="h-20 w-20 rounded-full bg-neutral-700 mb-4"></div>
                <div className="h-4 w-40 bg-neutral-700 rounded"></div>
                <div className="h-3 w-24 bg-neutral-700 rounded mt-2"></div>
              </div>
            </div>
          )}
        </div>
        
        {/* Local Video (Therapist's self-view) */}
        <div className="absolute bottom-4 right-4 w-56 h-32 overflow-hidden rounded-lg shadow-lg border-2 border-white">
          {isVideoMuted ? (
            <div className="w-full h-full bg-neutral-800 flex items-center justify-center">
              <div className="text-center">
                <VideoOff className="h-6 w-6 text-white mx-auto mb-1" />
                <p className="text-white text-xs">Camera off</p>
              </div>
            </div>
          ) : (
            <video 
              id="localVideo" 
              autoPlay 
              muted 
              playsInline
              className="w-full h-full object-cover"
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoCall;