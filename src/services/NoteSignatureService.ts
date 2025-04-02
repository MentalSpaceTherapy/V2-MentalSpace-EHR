import { v4 as uuidv4 } from 'uuid';

export interface Signature {
  signatureId: string;
  userId: string;
  userName: string;
  userRole: string;
  timestamp: string;
  isValid: boolean;
  signatureType: 'primary' | 'co-signature';
  invalidatedReason?: string;
  invalidatedAt?: string;
  invalidatedBy?: string;
  ipAddress?: string; // For audit purposes
}

export interface SignatureRequest {
  requestId: string;
  noteId: string;
  requestedByUserId: string;
  requestedByUserName: string;
  requestedToUserId: string;
  requestedToUserName: string;
  requestedAt: string;
  status: 'pending' | 'completed' | 'rejected';
  completedAt?: string;
  rejectedAt?: string;
  rejectionReason?: string;
  message?: string;
}

export interface SignedNote {
  noteId: string;
  primarySignature?: Signature;
  coSignatures: Signature[];
  locked: boolean;
  lockedAt?: string;
  unlockedAt?: string;
  unlockedBy?: string;
  unlockedReason?: string;
  pendingSignatureRequests: SignatureRequest[];
}

class NoteSignatureService {
  private signatures: Record<string, SignedNote> = {};
  
  constructor() {
    this.loadFromLocalStorage();
  }
  
  /**
   * Initialize a note for signing
   */
  initializeNote(noteId: string): void {
    if (!this.signatures[noteId]) {
      this.signatures[noteId] = {
        noteId,
        coSignatures: [],
        locked: false,
        pendingSignatureRequests: []
      };
      this.saveToLocalStorage();
    }
  }
  
  /**
   * Sign a note with the primary signature
   */
  signNote(
    noteId: string, 
    userId: string, 
    userName: string, 
    userRole: string,
    ipAddress?: string
  ): Signature {
    if (!this.signatures[noteId]) {
      this.initializeNote(noteId);
    }
    
    // If note is already signed, invalidate previous signature
    if (this.signatures[noteId].primarySignature) {
      this.invalidateSignature(
        noteId, 
        this.signatures[noteId].primarySignature!.signatureId,
        userId,
        'Superseded by new signature'
      );
    }
    
    const signature: Signature = {
      signatureId: uuidv4(),
      userId,
      userName,
      userRole,
      timestamp: new Date().toISOString(),
      isValid: true,
      signatureType: 'primary',
      ipAddress
    };
    
    this.signatures[noteId].primarySignature = signature;
    this.signatures[noteId].locked = true;
    this.signatures[noteId].lockedAt = new Date().toISOString();
    
    this.saveToLocalStorage();
    
    return signature;
  }
  
  /**
   * Add a co-signature to a note
   */
  coSignNote(
    noteId: string, 
    userId: string, 
    userName: string, 
    userRole: string,
    ipAddress?: string
  ): Signature | null {
    if (!this.signatures[noteId]) {
      return null;
    }
    
    // Check if the user has already co-signed
    const existingCoSign = this.signatures[noteId].coSignatures
      .find(s => s.userId === userId && s.isValid);
      
    // If already co-signed, invalidate previous co-signature
    if (existingCoSign) {
      this.invalidateSignature(
        noteId, 
        existingCoSign.signatureId,
        userId,
        'Superseded by new co-signature'
      );
    }
    
    const signature: Signature = {
      signatureId: uuidv4(),
      userId,
      userName,
      userRole,
      timestamp: new Date().toISOString(),
      isValid: true,
      signatureType: 'co-signature',
      ipAddress
    };
    
    this.signatures[noteId].coSignatures.push(signature);
    
    // Complete any pending signature requests from this user
    this.signatures[noteId].pendingSignatureRequests
      .filter(req => req.requestedToUserId === userId && req.status === 'pending')
      .forEach(req => {
        req.status = 'completed';
        req.completedAt = new Date().toISOString();
      });
    
    this.saveToLocalStorage();
    
    return signature;
  }
  
  /**
   * Invalidate a signature
   */
  invalidateSignature(
    noteId: string, 
    signatureId: string, 
    invalidatedBy: string,
    reason: string
  ): boolean {
    if (!this.signatures[noteId]) {
      return false;
    }
    
    // Check primary signature
    if (
      this.signatures[noteId].primarySignature && 
      this.signatures[noteId].primarySignature.signatureId === signatureId
    ) {
      this.signatures[noteId].primarySignature.isValid = false;
      this.signatures[noteId].primarySignature.invalidatedReason = reason;
      this.signatures[noteId].primarySignature.invalidatedAt = new Date().toISOString();
      this.signatures[noteId].primarySignature.invalidatedBy = invalidatedBy;
      this.saveToLocalStorage();
      return true;
    }
    
    // Check co-signatures
    const coSignIndex = this.signatures[noteId].coSignatures
      .findIndex(s => s.signatureId === signatureId);
      
    if (coSignIndex >= 0) {
      this.signatures[noteId].coSignatures[coSignIndex].isValid = false;
      this.signatures[noteId].coSignatures[coSignIndex].invalidatedReason = reason;
      this.signatures[noteId].coSignatures[coSignIndex].invalidatedAt = new Date().toISOString();
      this.signatures[noteId].coSignatures[coSignIndex].invalidatedBy = invalidatedBy;
      this.saveToLocalStorage();
      return true;
    }
    
    return false;
  }
  
  /**
   * Unlock a note for editing (after it's been signed)
   */
  unlockNote(noteId: string, userId: string, userName: string, reason: string): boolean {
    if (!this.signatures[noteId] || !this.signatures[noteId].locked) {
      return false;
    }
    
    this.signatures[noteId].locked = false;
    this.signatures[noteId].unlockedAt = new Date().toISOString();
    this.signatures[noteId].unlockedBy = userName;
    this.signatures[noteId].unlockedReason = reason;
    
    this.saveToLocalStorage();
    
    return true;
  }
  
  /**
   * Lock a note to prevent further editing
   */
  lockNote(noteId: string): boolean {
    if (!this.signatures[noteId]) {
      return false;
    }
    
    this.signatures[noteId].locked = true;
    this.signatures[noteId].lockedAt = new Date().toISOString();
    
    this.saveToLocalStorage();
    
    return true;
  }
  
  /**
   * Request a co-signature from another user
   */
  requestCoSignature(
    noteId: string,
    requestedByUserId: string,
    requestedByUserName: string,
    requestedToUserId: string,
    requestedToUserName: string,
    message?: string
  ): SignatureRequest {
    if (!this.signatures[noteId]) {
      this.initializeNote(noteId);
    }
    
    const request: SignatureRequest = {
      requestId: uuidv4(),
      noteId,
      requestedByUserId,
      requestedByUserName,
      requestedToUserId,
      requestedToUserName,
      requestedAt: new Date().toISOString(),
      status: 'pending',
      message
    };
    
    this.signatures[noteId].pendingSignatureRequests.push(request);
    this.saveToLocalStorage();
    
    return request;
  }
  
  /**
   * Reject a co-signature request
   */
  rejectCoSignatureRequest(
    noteId: string, 
    requestId: string, 
    userId: string,
    reason: string
  ): boolean {
    if (!this.signatures[noteId]) {
      return false;
    }
    
    const requestIndex = this.signatures[noteId].pendingSignatureRequests
      .findIndex(req => req.requestId === requestId && req.status === 'pending');
      
    if (requestIndex >= 0) {
      this.signatures[noteId].pendingSignatureRequests[requestIndex].status = 'rejected';
      this.signatures[noteId].pendingSignatureRequests[requestIndex].rejectedAt = new Date().toISOString();
      this.signatures[noteId].pendingSignatureRequests[requestIndex].rejectionReason = reason;
      this.saveToLocalStorage();
      return true;
    }
    
    return false;
  }
  
  /**
   * Check if a note is locked
   */
  isNoteLocked(noteId: string): boolean {
    return this.signatures[noteId]?.locked || false;
  }
  
  /**
   * Get the signature information for a note
   */
  getNoteSignatures(noteId: string): SignedNote | null {
    return this.signatures[noteId] || null;
  }
  
  /**
   * Get pending signature requests for a specific user
   */
  getPendingRequestsForUser(userId: string): SignatureRequest[] {
    const requests: SignatureRequest[] = [];
    
    Object.values(this.signatures).forEach(note => {
      note.pendingSignatureRequests
        .filter(req => req.requestedToUserId === userId && req.status === 'pending')
        .forEach(req => requests.push(req));
    });
    
    return requests;
  }
  
  /**
   * Save signatures to localStorage (for demo purposes)
   * In a real app, this would be a backend API call
   */
  private saveToLocalStorage(): void {
    localStorage.setItem('noteSignatures', JSON.stringify(this.signatures));
  }
  
  /**
   * Load signatures from localStorage (for demo purposes)
   * In a real app, this would be a backend API call
   */
  private loadFromLocalStorage(): void {
    const data = localStorage.getItem('noteSignatures');
    if (data) {
      try {
        this.signatures = JSON.parse(data);
      } catch (error) {
        console.error('Error loading note signatures from localStorage', error);
      }
    }
  }
}

export default new NoteSignatureService(); 