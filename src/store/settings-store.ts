import { create } from 'zustand';
import { PaperSize, MachineId } from '@/core/types';

interface SettingsState {
  // Machine
  activeMachineId: MachineId; // Keeping as string for registry compatibility, but could be MachineId
  
  // Paper
  paperSize: PaperSize;
  
  // View
  zoom: number;
  
  // Layout Options
  sensorSafe: boolean;

  // App Status
  pluginsInitialized: boolean;

  // Actions
  setMachine: (id: MachineId) => void;
  setPaperSize: (size: PaperSize) => void;
  setZoom: (zoom: number) => void;
  setSensorSafe: (safe: boolean) => void;
  setPluginsInitialized: (initialized: boolean) => void;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  activeMachineId: 'silhouette',
  paperSize: 'letter',
  zoom: 1.0,
  sensorSafe: true,
  pluginsInitialized: false,

  setMachine: (id) => set({ activeMachineId: id }),
  setPaperSize: (size) => set({ paperSize: size }),
  setZoom: (zoom) => set({ zoom }),
  setSensorSafe: (safe) => set({ sensorSafe: safe }),
  setPluginsInitialized: (initialized) => set({ pluginsInitialized: initialized }),
}));
