import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { MicIcon, MicOffIcon, VideoIcon, VideoOffIcon, PhoneIcon, ShieldIcon } from 'lucide-react';
import { io, Socket } from 'socket.io-client';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import EncryptionBanner from './EncryptionBanner';

interface VideoCallProps {
  roomId: string;
  userId: number;
  username: string;
  isTherapist: boolean;
  onEndCall: () => void;
}

const VideoCall: React.FC<VideoCallProps> = ({ 
  roomId, 
  userId, 
  username, 
  isTherapist, 
  onEndCall 
}) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [encryptionKey, setEncryptionKey] = useState<string | null>(null);
  const [remoteUser, setRemoteUser] = useState<{id: string, username: string} | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isCallActive, setIsCallActive] = useState(false);
  
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  
  const { toast } = useToast();

  useEffect(() => {
    // Connect to signaling server
    const newSocket = io('/'); // Connect to the current host
    setSocket(newSocket);
    
    newSocket.on('connect', () => {
      console.log('Connected to signaling server');
      setConnected(true);
      
      // Register with the server
      newSocket.emit('register', {
        userId: userId.toString(),
        username,
        isTherapist
      });
    });
    
    newSocket.on('registered', ({ success, user }) => {
      if (success) {
        console.log('Registered with server', user);
        
        // Join the specified room
        newSocket.emit('join-room', {
          roomId,
          userId: userId.toString()
        });
      }
    });
    
    newSocket.on('room-joined', (room) => {
      console.log('Joined room', room);
      setEncryptionKey(room.encryptionKey);
      
      // Start local media
      setupLocalMedia();
      
      // If we're the therapist, wait for client
      if (isTherapist) {
        // Show waiting message or something
      } 
      // If we're the client, initialize call to therapist
      else if (room.therapistId) {
        setRemoteUser({
          id: room.therapistId,
          username: 'Therapist' // In a real app, get this from the server
        });
      }
    });
    
    newSocket.on('user-joined', (user) => {
      console.log('User joined the room', user);
      
      // Set the remote user
      setRemoteUser({
        id: user.userId,
        username: user.username
      });
      
      // If we're the therapist and a client joins, initiate the call
      if (isTherapist && !user.isTherapist) {
        createPeerConnection(user.userId);
      }
    });
    
    newSocket.on('signal', async ({ userId, signal }) => {
      try {
        if (!peerConnectionRef.current) {
          await createPeerConnection(userId);
        }
        
        if (signal.type === 'offer') {
          await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(signal));
          const answer = await peerConnectionRef.current.createAnswer();
          await peerConnectionRef.current.setLocalDescription(answer);
          
          // Send answer back
          newSocket.emit('signal', {
            userId: userId.toString(),
            targetId: userId,
            signal: answer
          });
        } 
        else if (signal.type === 'answer') {
          await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(signal));
        } 
        else if (signal.candidate) {
          await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(signal.candidate));
        }
      } catch (error) {
        console.error('Error handling signal:', error);
      }
    });
    
    newSocket.on('user-left', (user) => {
      console.log('User left the room', user);
      toast({
        title: 'Call ended',
        description: `${user.username} has left the call.`,
        variant: 'default'
      });
      
      // Clean up peer connection
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
        peerConnectionRef.current = null;
      }
      
      // Clear remote video
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = null;
      }
      
      setRemoteUser(null);
      setIsCallActive(false);
    });
    
    newSocket.on('disconnect', () => {
      console.log('Disconnected from signaling server');
      setConnected(false);
      cleanupCall();
    });
    
    // Clean up on unmount
    return () => {
      cleanupCall();
      newSocket.disconnect();
    };
  }, []);
  
  const setupLocalMedia = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      localStreamRef.current = stream;
      
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      
      // Update initial mute/video state based on user preferences
      setIsMuted(false);
      setIsVideoOff(false);
      
    } catch (error) {
      console.error('Error accessing media devices:', error);
      toast({
        title: 'Camera/Microphone Error',
        description: 'Unable to access camera or microphone. Please check permissions.',
        variant: 'destructive'
      });
    }
  };
  
  const createPeerConnection = async (targetUserId: string) => {
    try {
      // Configuration with STUN/TURN servers would go here in production
      const configuration: RTCConfiguration = {
        iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
      };
      
      const pc = new RTCPeerConnection(configuration);
      peerConnectionRef.current = pc;
      
      // Add local tracks to the connection
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => {
          if (localStreamRef.current) {
            pc.addTrack(track, localStreamRef.current);
          }
        });
      }
      
      // Handle ICE candidates
      pc.onicecandidate = (event) => {
        if (event.candidate) {
          socket?.emit('signal', {
            userId: userId.toString(),
            targetId: targetUserId,
            signal: {
              candidate: event.candidate
            }
          });
        }
      };
      
      // Handle connection state changes
      pc.onconnectionstatechange = () => {
        console.log('Connection state:', pc.connectionState);
        setIsCallActive(pc.connectionState === 'connected');
      };
      
      // Handle incoming tracks
      pc.ontrack = (event) => {
        console.log('Received remote track');
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = event.streams[0];
        }
      };
      
      // If we're the caller (therapist), create and send offer
      if (isTherapist) {
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        
        socket?.emit('signal', {
          userId: userId.toString(),
          targetId: targetUserId,
          signal: offer
        });
      }
      
      return pc;
    } catch (error) {
      console.error('Error creating peer connection:', error);
      toast({
        title: 'Connection Error',
        description: 'Unable to establish call connection.',
        variant: 'destructive'
      });
      return null;
    }
  };
  
  const toggleMute = () => {
    if (localStreamRef.current) {
      const audioTracks = localStreamRef.current.getAudioTracks();
      audioTracks.forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsMuted(!isMuted);
    }
  };
  
  const toggleVideo = () => {
    if (localStreamRef.current) {
      const videoTracks = localStreamRef.current.getVideoTracks();
      videoTracks.forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsVideoOff(!isVideoOff);
    }
  };
  
  const endCall = () => {
    cleanupCall();
    onEndCall();
  };
  
  const cleanupCall = () => {
    // Close peer connection
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
    
    // Stop local media
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
      localStreamRef.current = null;
    }
    
    // Clear video elements
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null;
    }
    
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null;
    }
    
    setIsCallActive(false);
  };

  return (
    <div className="w-full max-w-6xl mx-auto">
      <EncryptionBanner isEncrypted={!!encryptionKey} />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {/* Remote Video (Larger) */}
        <div className="md:col-span-1 bg-gray-800 rounded-lg overflow-hidden relative h-64 md:h-[500px]">
          {remoteUser ? (
            <video 
              ref={remoteVideoRef} 
              autoPlay 
              playsInline 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-white">
              <div className="text-center">
                <div className="mb-2">
                  <VideoIcon size={48} className="mx-auto text-gray-400" />
                </div>
                <p>{isTherapist ? "Waiting for client to join..." : "Connecting to therapist..."}</p>
              </div>
            </div>
          )}
          {remoteUser && (
            <div className="absolute bottom-2 left-2 bg-gray-900 bg-opacity-60 text-white px-2 py-1 rounded">
              {remoteUser.username}
            </div>
          )}
        </div>
        
        {/* Local Video (Smaller) */}
        <div className="md:col-span-1 bg-gray-800 rounded-lg overflow-hidden relative h-64 md:h-[500px]">
          <video 
            ref={localVideoRef} 
            autoPlay 
            playsInline 
            muted
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-2 left-2 bg-gray-900 bg-opacity-60 text-white px-2 py-1 rounded">
            You{isVideoOff ? " (Video Off)" : ""}
          </div>
        </div>
      </div>
      
      {/* Controls */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-center space-x-4">
            <Button
              variant={isMuted ? "destructive" : "secondary"}
              size="lg"
              onClick={toggleMute}
              className="rounded-full w-12 h-12 p-0"
            >
              {isMuted ? <MicOffIcon className="h-6 w-6" /> : <MicIcon className="h-6 w-6" />}
            </Button>
            
            <Button
              variant={isVideoOff ? "destructive" : "secondary"}
              size="lg"
              onClick={toggleVideo}
              className="rounded-full w-12 h-12 p-0"
            >
              {isVideoOff ? <VideoOffIcon className="h-6 w-6" /> : <VideoIcon className="h-6 w-6" />}
            </Button>
            
            <Button
              variant="destructive"
              size="lg"
              onClick={endCall}
              className="rounded-full w-12 h-12 p-0"
            >
              <PhoneIcon className="h-6 w-6" />
            </Button>
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-between">
          <div className="text-sm text-gray-500">
            {connected ? "Connected to server" : "Disconnected"}
          </div>
          
          <div className="flex items-center space-x-1 text-sm">
            <ShieldIcon className="h-4 w-4 text-green-500" />
            <span className="text-green-500">End-to-end encrypted</span>
          </div>
        </CardFooter>
      </Card>
      
      {/* Connection Status */}
      {!connected && (
        <Alert variant="destructive" className="mt-4">
          <AlertTitle>Connection Error</AlertTitle>
          <AlertDescription>
            Not connected to the telehealth service. Please check your internet connection.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default VideoCall;