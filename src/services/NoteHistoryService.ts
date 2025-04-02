import { v4 as uuidv4 } from 'uuid';

export interface NoteVersion {
  versionId: string;
  content: string;
  timestamp: string;
  userId: string;
  userName: string;
  reason?: string;
  isPristine?: boolean; // If true, this is the original unedited version
}

export interface NoteHistory {
  noteId: string;
  versions: NoteVersion[];
  currentVersionId: string;
}

class NoteHistoryService {
  private histories: Record<string, NoteHistory> = {};
  
  /**
   * Initialize a note history
   */
  initializeHistory(noteId: string, content: string, userId: string, userName: string): string {
    const versionId = uuidv4();
    const initialVersion: NoteVersion = {
      versionId,
      content,
      timestamp: new Date().toISOString(),
      userId,
      userName,
      isPristine: true
    };
    
    this.histories[noteId] = {
      noteId,
      versions: [initialVersion],
      currentVersionId: versionId
    };
    
    // In a real app, this would be saved to a backend
    this.saveToLocalStorage();
    
    return versionId;
  }
  
  /**
   * Add a new version to the note's history
   */
  addVersion(noteId: string, content: string, userId: string, userName: string, reason?: string): string {
    if (!this.histories[noteId]) {
      throw new Error(`Note history not found for note ID: ${noteId}`);
    }
    
    const versionId = uuidv4();
    const newVersion: NoteVersion = {
      versionId,
      content,
      timestamp: new Date().toISOString(),
      userId,
      userName,
      reason
    };
    
    this.histories[noteId].versions.push(newVersion);
    this.histories[noteId].currentVersionId = versionId;
    
    // In a real app, this would be saved to a backend
    this.saveToLocalStorage();
    
    return versionId;
  }
  
  /**
   * Get all versions for a note
   */
  getHistory(noteId: string): NoteHistory | null {
    // Load from localStorage if needed
    this.loadFromLocalStorage();
    return this.histories[noteId] || null;
  }
  
  /**
   * Get a specific version of a note
   */
  getVersion(noteId: string, versionId: string): NoteVersion | null {
    const history = this.getHistory(noteId);
    if (!history) return null;
    
    return history.versions.find(v => v.versionId === versionId) || null;
  }
  
  /**
   * Get the current version of a note
   */
  getCurrentVersion(noteId: string): NoteVersion | null {
    const history = this.getHistory(noteId);
    if (!history) return null;
    
    return this.getVersion(noteId, history.currentVersionId);
  }
  
  /**
   * Revert to a specific version
   * Creates a new version that is based on the reverted content
   */
  revertToVersion(noteId: string, versionId: string, userId: string, userName: string): string | null {
    const version = this.getVersion(noteId, versionId);
    if (!version) return null;
    
    return this.addVersion(
      noteId,
      version.content,
      userId,
      userName,
      `Reverted to version from ${new Date(version.timestamp).toLocaleString()}`
    );
  }
  
  /**
   * Compare two versions and return the differences
   */
  compareVersions(noteId: string, versionId1: string, versionId2: string): { added: string[], removed: string[] } {
    const v1 = this.getVersion(noteId, versionId1);
    const v2 = this.getVersion(noteId, versionId2);
    
    if (!v1 || !v2) {
      return { added: [], removed: [] };
    }
    
    // Very basic diff for simplicity
    // In a real app, you'd use a proper diff library
    const lines1 = v1.content.split('\n');
    const lines2 = v2.content.split('\n');
    
    const added = lines2.filter(line => !lines1.includes(line));
    const removed = lines1.filter(line => !lines2.includes(line));
    
    return {
      added,
      removed
    };
  }
  
  /**
   * Save histories to localStorage (for demo purposes)
   * In a real app, this would be a backend API call
   */
  private saveToLocalStorage(): void {
    localStorage.setItem('noteHistories', JSON.stringify(this.histories));
  }
  
  /**
   * Load histories from localStorage (for demo purposes)
   * In a real app, this would be a backend API call
   */
  private loadFromLocalStorage(): void {
    const data = localStorage.getItem('noteHistories');
    if (data) {
      try {
        this.histories = JSON.parse(data);
      } catch (error) {
        console.error('Error loading note histories from localStorage', error);
      }
    }
  }
}

export default new NoteHistoryService(); 