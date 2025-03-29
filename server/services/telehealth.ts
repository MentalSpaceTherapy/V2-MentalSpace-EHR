import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import crypto from 'crypto';

interface User {
  id: string;
  username: string;
  socketId: string;
  roomId?: string;
  isTherapist: boolean;
}

interface Room {
  id: string;
  name: string;
  therapistId: string | null;
  clientId: string | null;
  isLocked: boolean;
  encryptionKey?: string;
}

interface SignalData {
  type: string;
  sdp?: any;
  candidate?: any;
}

/**
 * Telehealth service for managing WebRTC signaling and secure video sessions
 */
export class TelehealthService {
  private io: Server | null = null;
  private users: Map<string, User> = new Map();
  private rooms: Map<string, Room> = new Map();
  private socketIdToUserId: Map<string, string> = new Map();

  /**
   * Initialize socket.io server
   */
  initialize(httpServer: HttpServer) {
    this.io = new Server(httpServer, {
      cors: {
        origin: "*",
        methods: ["GET", "POST"]
      }
    });

    this.setupSocketHandlers();
    console.log('Telehealth service initialized');
    return this.io;
  }

  /**
   * Set up all socket event handlers
   */
  private setupSocketHandlers() {
    if (!this.io) return;

    this.io.on('connection', (socket: Socket) => {
      console.log('New client connected:', socket.id);

      // Handle user registration (therapist or client)
      socket.on('register', ({ userId, username, isTherapist }: { userId: string, username: string, isTherapist: boolean }) => {
        const user: User = {
          id: userId,
          username,
          socketId: socket.id,
          isTherapist
        };
        
        this.users.set(userId, user);
        this.socketIdToUserId.set(socket.id, userId);
        
        console.log(`User registered: ${username} (${userId}), isTherapist: ${isTherapist}`);
        
        // Send back registration confirmation
        socket.emit('registered', { 
          success: true, 
          user: { id: userId, username, isTherapist } 
        });
      });

      // Create a secure room
      socket.on('create-room', ({ roomName, userId }: { roomName: string, userId: string }) => {
        const user = this.users.get(userId);
        
        if (!user) {
          socket.emit('room-error', { message: 'User not found' });
          return;
        }
        
        if (!user.isTherapist) {
          socket.emit('room-error', { message: 'Only therapists can create rooms' });
          return;
        }
        
        // Create a unique room ID
        const roomId = crypto.randomBytes(16).toString('hex');
        
        // Generate encryption key for end-to-end encryption
        const encryptionKey = crypto.randomBytes(32).toString('base64');
        
        // Create the room
        const room: Room = {
          id: roomId,
          name: roomName,
          therapistId: userId,
          clientId: null,
          isLocked: false,
          encryptionKey
        };
        
        this.rooms.set(roomId, room);
        
        // Update user with room ID
        user.roomId = roomId;
        this.users.set(userId, user);
        
        // Join the socket room
        socket.join(roomId);
        
        console.log(`Room created: ${roomName} (${roomId})`);
        
        // Send back room details
        socket.emit('room-created', { 
          roomId, 
          name: roomName,
          encryptionKey 
        });
      });

      // Join a room as client
      socket.on('join-room', ({ roomId, userId }: { roomId: string, userId: string }) => {
        const room = this.rooms.get(roomId);
        const user = this.users.get(userId);
        
        if (!room) {
          socket.emit('room-error', { message: 'Room not found' });
          return;
        }
        
        if (!user) {
          socket.emit('room-error', { message: 'User not found' });
          return;
        }
        
        if (room.isLocked) {
          socket.emit('room-error', { message: 'Room is locked' });
          return;
        }
        
        if (!user.isTherapist && room.clientId && room.clientId !== userId) {
          socket.emit('room-error', { message: 'Room already has a client' });
          return;
        }
        
        // Update room with client ID if the user is a client
        if (!user.isTherapist) {
          room.clientId = userId;
          this.rooms.set(roomId, room);
        }
        
        // Update user with room ID
        user.roomId = roomId;
        this.users.set(userId, user);
        
        // Join the socket room
        socket.join(roomId);
        
        console.log(`User ${user.username} joined room ${room.name}`);
        
        // Notify room members
        this.io?.to(roomId).emit('user-joined', { 
          userId, 
          username: user.username,
          isTherapist: user.isTherapist
        });
        
        // Send room info including encryption key
        socket.emit('room-joined', { 
          roomId, 
          name: room.name,
          encryptionKey: room.encryptionKey,
          therapistId: room.therapistId,
          clientId: room.clientId
        });
      });

      // Lock/unlock room (waiting room feature)
      socket.on('toggle-room-lock', ({ roomId, userId, isLocked }: { roomId: string, userId: string, isLocked: boolean }) => {
        const room = this.rooms.get(roomId);
        const user = this.users.get(userId);
        
        if (!room || !user) {
          socket.emit('room-error', { message: 'Room or user not found' });
          return;
        }
        
        if (!user.isTherapist || room.therapistId !== userId) {
          socket.emit('room-error', { message: 'Only the hosting therapist can lock/unlock a room' });
          return;
        }
        
        room.isLocked = isLocked;
        this.rooms.set(roomId, room);
        
        console.log(`Room ${room.name} ${isLocked ? 'locked' : 'unlocked'} by ${user.username}`);
        
        // Notify room members
        this.io?.to(roomId).emit('room-lock-changed', { roomId, isLocked });
      });

      // WebRTC signaling
      socket.on('signal', ({ userId, targetId, signal }: { userId: string, targetId: string, signal: SignalData }) => {
        const user = this.users.get(userId);
        const target = this.users.get(targetId);
        
        if (!user || !target) {
          console.log('Signal error: User or target not found');
          return;
        }
        
        console.log(`Signal from ${user.username} to ${target.username}`);
        
        // Forward the signal to the target user
        this.io?.to(target.socketId).emit('signal', {
          userId,
          signal
        });
      });

      // Disconnect handling
      socket.on('disconnect', () => {
        const userId = this.socketIdToUserId.get(socket.id);
        
        if (userId) {
          const user = this.users.get(userId);
          
          if (user && user.roomId) {
            const room = this.rooms.get(user.roomId);
            
            if (room) {
              // Notify others in the room
              socket.to(user.roomId).emit('user-left', { 
                userId, 
                username: user.username 
              });
              
              // If therapist leaves, delete the room
              if (user.isTherapist && room.therapistId === userId) {
                this.rooms.delete(user.roomId);
                console.log(`Room ${room.name} deleted because therapist left`);
              } 
              // If client leaves, update room
              else if (!user.isTherapist && room.clientId === userId) {
                room.clientId = null;
                this.rooms.set(user.roomId, room);
              }
            }
          }
          
          // Clean up user data
          this.users.delete(userId);
          this.socketIdToUserId.delete(socket.id);
          
          console.log(`Client disconnected: ${socket.id} (${userId})`);
        } else {
          console.log(`Unknown client disconnected: ${socket.id}`);
        }
      });
    });
  }

  /**
   * Get active rooms (for admin monitoring)
   */
  getActiveRooms() {
    return Array.from(this.rooms.values()).map(room => ({
      id: room.id,
      name: room.name,
      therapistId: room.therapistId,
      clientId: room.clientId,
      isLocked: room.isLocked,
      // Don't include encryption key in the response
    }));
  }

  /**
   * Get active users (for admin monitoring)
   */
  getActiveUsers() {
    return Array.from(this.users.values()).map(user => ({
      id: user.id,
      username: user.username,
      isTherapist: user.isTherapist,
      roomId: user.roomId
      // Don't include socketId in the response for security
    }));
  }
}

// Export singleton instance
export const telehealthService = new TelehealthService();