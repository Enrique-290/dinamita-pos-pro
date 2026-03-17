import { create } from "zustand";

export const useUIStore = create((set) => ({
  activeModule: "dashboard",
  setActiveModule: (activeModule) => set({ activeModule }),
}));
