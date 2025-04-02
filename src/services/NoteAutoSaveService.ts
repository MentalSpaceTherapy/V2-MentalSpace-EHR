import { v4 as uuidv4 } from 'uuid';
import NoteHistoryService from './NoteHistoryService';
import NoteSignatureService from './NoteSignatureService';

export interface AutoSaveData {
  noteId: string;
  content: string;
  title: string;
  savedAt: string;
  userId: string;
}

class NoteAutoSaveService {
  private autoSaveDebounceTime = 5000; // 5 seconds
  private autoSaveTimers: Record<string, NodeJS.Timeout> = {};
  private autoSaveData: Record<string, AutoSaveData> = {};
  private isInitialized = false;
  
  constructor() {
    this.loadFromLocalStorage();
    this.isInitialized = true;
  }
  
  /**
   * Start tracking a note for auto-save
   */
  startTracking(
    noteId: string, 
    initialContent: string,
    initialTitle: string,
    userId: string
  ): void {
    // Don't auto-save locked notes
    if (NoteSignatureService.isNoteLocked(noteId)) {
      return;
    }
    
    this.autoSaveData[noteId] = {
      noteId,
      content: initialContent,
      title: initialTitle,
      savedAt: new Date().toISOString(),
      userId
    };
    
    this.saveToLocalStorage();
  }
  
  /**
   * Stop tracking a note for auto-save
   */
  stopTracking(noteId: string): void {
    if (this.autoSaveTimers[noteId]) {
      clearTimeout(this.autoSaveTimers[noteId]);
      delete this.autoSaveTimers[noteId];
    }
    
    // Optionally clear from storage
    // delete this.autoSaveData[noteId];
    // this.saveToLocalStorage();
  }
  
  /**
   * Register a content change and trigger a debounced auto-save
   */
  registerChange(
    noteId: string, 
    content: string,
    title: string,
    userId: string
  ): void {
    // Don't auto-save locked notes
    if (NoteSignatureService.isNoteLocked(noteId)) {
      return;
    }
    
    // Update the data
    this.autoSaveData[noteId] = {
      noteId,
      content,
      title,
      savedAt: new Date().toISOString(),
      userId
    };
    
    // Clear existing timer
    if (this.autoSaveTimers[noteId]) {
      clearTimeout(this.autoSaveTimers[noteId]);
    }
    
    // Set new timer for auto-save
    this.autoSaveTimers[noteId] = setTimeout(() => {
      this.performAutoSave(noteId);
    }, this.autoSaveDebounceTime);
    
    this.saveToLocalStorage();
  }
  
  /**
   * Perform the actual auto-save operation
   */
  private performAutoSave(noteId: string): void {
    const autoSaveData = this.autoSaveData[noteId];
    if (!autoSaveData) return;
    
    try {
      // In a real app, this would save to the server
      console.log(`Auto-saving note ${noteId} at ${new Date().toLocaleTimeString()}`);
      
      // Also add a history entry if significant changes
      const currentVersion = NoteHistoryService.getCurrentVersion(noteId);
      if (currentVersion && currentVersion.content !== autoSaveData.content) {
        // Only create a new version if content has changed significantly
        // For demo, we'll add a version every time, but in production
        // you might want to be more selective to avoid cluttering history
        NoteHistoryService.addVersion(
          noteId,
          autoSaveData.content,
          autoSaveData.userId,
          'Auto-saved version', // Use actual username in production
          'Auto-saved'
        );
      }
      
      // Update saved timestamp
      this.autoSaveData[noteId].savedAt = new Date().toISOString();
      this.saveToLocalStorage();
      
    } catch (error) {
      console.error('Error during auto-save:', error);
    }
  }
  
  /**
   * Force an immediate save
   */
  forceSave(noteId: string): boolean {
    if (!this.autoSaveData[noteId]) {
      return false;
    }
    
    this.performAutoSave(noteId);
    return true;
  }
  
  /**
   * Check if a note has unsaved changes (in memory, not committed to history)
   */
  hasUnsavedChanges(noteId: string): boolean {
    const autoSaveData = this.autoSaveData[noteId];
    if (!autoSaveData) return false;
    
    const currentVersion = NoteHistoryService.getCurrentVersion(noteId);
    if (!currentVersion) return true; // No saved version exists
    
    return currentVersion.content !== autoSaveData.content;
  }
  
  /**
   * Get the most recent auto-saved data for a note
   */
  getAutoSavedData(noteId: string): AutoSaveData | null {
    return this.autoSaveData[noteId] || null;
  }
  
  /**
   * Save auto-save data to localStorage (for demo purposes)
   * In a real app, this would be a backend API call
   */
  private saveToLocalStorage(): void {
    if (!this.isInitialized) return;
    localStorage.setItem('noteAutoSaveData', JSON.stringify(this.autoSaveData));
  }
  
  /**
   * Load auto-save data from localStorage (for demo purposes)
   * In a real app, this would be a backend API call
   */
  private loadFromLocalStorage(): void {
    const data = localStorage.getItem('noteAutoSaveData');
    if (data) {
      try {
        this.autoSaveData = JSON.parse(data);
      } catch (error) {
        console.error('Error loading auto-save data from localStorage', error);
      }
    }
  }
}

export default new NoteAutoSaveService(); 