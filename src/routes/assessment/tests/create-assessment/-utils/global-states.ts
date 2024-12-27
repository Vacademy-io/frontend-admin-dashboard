import { create } from "zustand";

// Define the interface for the Zustand store
interface SidebarState {
    sidebarOpen: boolean;
    setSidebarOpen: (isOpen: boolean) => void;
}

// Create the Zustand store using the interface
const useSidebarStore = create<SidebarState>((set) => ({
    sidebarOpen: true,
    setSidebarOpen: (isOpen: boolean) => set({ sidebarOpen: isOpen }),
}));

export default useSidebarStore;
