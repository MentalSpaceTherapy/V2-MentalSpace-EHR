import { Button } from "@/components/ui/button";
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  Phone,
  ScreenShare,
  CircleSlash
} from "lucide-react";

interface VideoControlsProps {
  isAudioMuted: boolean;
  isVideoMuted: boolean;
  isScreenSharing: boolean;
  onToggleAudio: () => void;
  onToggleVideo: () => void;
  onToggleScreenShare: () => void;
  onEndCall: () => void;
}

const VideoControls: React.FC<VideoControlsProps> = ({
  isAudioMuted,
  isVideoMuted,
  isScreenSharing,
  onToggleAudio,
  onToggleVideo,
  onToggleScreenShare,
  onEndCall
}) => {
  return (
    <div className="bg-neutral-800 py-4 px-6 flex justify-center items-center">
      <div className="flex space-x-4">
        {/* Audio Toggle */}
        <Button
          variant="outline"
          size="lg"
          className={`rounded-full w-12 h-12 p-0 flex items-center justify-center ${
            isAudioMuted ? "bg-neutral-700 text-white" : "bg-neutral-600 text-white"
          }`}
          onClick={onToggleAudio}
        >
          {isAudioMuted ? (
            <MicOff className="h-5 w-5" />
          ) : (
            <Mic className="h-5 w-5" />
          )}
        </Button>
        
        {/* Video Toggle */}
        <Button
          variant="outline"
          size="lg"
          className={`rounded-full w-12 h-12 p-0 flex items-center justify-center ${
            isVideoMuted ? "bg-neutral-700 text-white" : "bg-neutral-600 text-white"
          }`}
          onClick={onToggleVideo}
        >
          {isVideoMuted ? (
            <VideoOff className="h-5 w-5" />
          ) : (
            <Video className="h-5 w-5" />
          )}
        </Button>
        
        {/* Screen Share */}
        <Button
          variant="outline"
          size="lg"
          className={`rounded-full w-12 h-12 p-0 flex items-center justify-center ${
            isScreenSharing ? "bg-neutral-700 text-white" : "bg-neutral-600 text-white"
          }`}
          onClick={onToggleScreenShare}
        >
          {isScreenSharing ? (
            <CircleSlash className="h-5 w-5" />
          ) : (
            <ScreenShare className="h-5 w-5" />
          )}
        </Button>
        
        {/* End Call */}
        <Button
          variant="destructive"
          size="lg"
          className="rounded-full w-12 h-12 p-0 flex items-center justify-center"
          onClick={onEndCall}
        >
          <Phone className="h-5 w-5 transform rotate-135" />
        </Button>
      </div>
    </div>
  );
};

export default VideoControls;