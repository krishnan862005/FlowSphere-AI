import { create } from 'zustand';
import type { Node, Edge } from 'reactflow';

interface HistoryEntry {
  nodes: Node[];
  edges: Edge[];
}

interface BuilderStore {
  history: HistoryEntry[];
  historyIndex: number;
  canUndo: boolean;
  canRedo: boolean;
  pushHistory: (entry: HistoryEntry) => void;
  undo: () => HistoryEntry | null;
  redo: () => HistoryEntry | null;
  clearHistory: () => void;
}

export const useBuilderStore = create<BuilderStore>((set, get) => ({
  history: [],
  historyIndex: -1,
  canUndo: false,
  canRedo: false,

  pushHistory: (entry) => {
    const { history, historyIndex } = get();
    // Truncate future if we branched
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(entry);
    // Keep max 50 entries
    if (newHistory.length > 50) newHistory.shift();
    const newIndex = newHistory.length - 1;
    set({
      history: newHistory,
      historyIndex: newIndex,
      canUndo: newIndex > 0,
      canRedo: false,
    });
  },

  undo: () => {
    const { history, historyIndex } = get();
    if (historyIndex <= 0) return null;
    const newIndex = historyIndex - 1;
    set({
      historyIndex: newIndex,
      canUndo: newIndex > 0,
      canRedo: true,
    });
    return history[newIndex] ?? null;
  },

  redo: () => {
    const { history, historyIndex } = get();
    if (historyIndex >= history.length - 1) return null;
    const newIndex = historyIndex + 1;
    set({
      historyIndex: newIndex,
      canUndo: true,
      canRedo: newIndex < history.length - 1,
    });
    return history[newIndex] ?? null;
  },

  clearHistory: () => set({ history: [], historyIndex: -1, canUndo: false, canRedo: false }),
}));
