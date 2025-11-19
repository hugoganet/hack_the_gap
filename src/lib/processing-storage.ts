/**
 * Processing state persistence using localStorage
 * Allows users to refresh the page without losing progress
 */

export type ProcessingState = {
  contentName: string;
  contentType: 'youtube' | 'pdf' | 'tiktok';
  currentPhaseIndex: number;
  progress: number;
  startedAt: number;
  url: string;
  metadata?: {
    subtitle?: string;
    thumbnail?: string;
  };
};

const STORAGE_KEY = 'hack_the_gap_processing_state';

/**
 * Save processing state to localStorage
 */
export function saveProcessingState(state: ProcessingState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.error('Failed to save processing state:', error);
  }
}

/**
 * Load processing state from localStorage
 */
export function loadProcessingState(): ProcessingState | null {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return null;
    
    const state = JSON.parse(saved) as ProcessingState;
    
    // Validate state is not too old (max 10 minutes)
    const now = Date.now();
    const maxAge = 10 * 60 * 1000; // 10 minutes
    
    if (now - state.startedAt > maxAge) {
      clearProcessingState();
      return null;
    }
    
    return state;
  } catch (error) {
    console.error('Failed to load processing state:', error);
    return null;
  }
}

/**
 * Clear processing state from localStorage
 */
export function clearProcessingState(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear processing state:', error);
  }
}

/**
 * Update specific fields in processing state
 */
export function updateProcessingState(
  updates: Partial<ProcessingState>
): void {
  try {
    const current = loadProcessingState();
    if (!current) return;
    
    const updated = { ...current, ...updates };
    saveProcessingState(updated);
  } catch (error) {
    console.error('Failed to update processing state:', error);
  }
}
