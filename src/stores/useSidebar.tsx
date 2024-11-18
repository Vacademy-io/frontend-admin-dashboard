import create from "zustand";

interface SidebarStore {
    selectedItem: string;
    setSelectedItem: (item: string) => void;
}

export const useSidebarStore = create<SidebarStore>((set) => ({
    selectedItem: "Dashboard", // Default selected item (you can set a default here if needed)
    setSelectedItem: (item) => set({ selectedItem: item }),
}));
