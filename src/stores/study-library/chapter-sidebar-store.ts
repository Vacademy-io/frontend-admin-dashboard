// stores/content-store.ts
import { create } from "zustand";
import { SidebarContentItem } from "@/types/study-library/chapter-sidebar";
// stores/content-store.ts
interface ContentStore {
    items: SidebarContentItem[];
    activeItemId: string | null;
    addItem: (item: SidebarContentItem) => void;
    // setActiveItem: (id: string | null) => void;
    setActiveItem: (item: SidebarContentItem) => void;
    removeItem: (id: string) => void;
}
export const useContentStore = create<ContentStore>((set) => ({
    items: [],
    activeItemId: null,
    addItem: (item) =>
        set((state) => ({
            items: [...state.items, item],
            activeItemId: item.id, // Automatically select the new item
        })),
    setActiveItem: (item) => {
        set((state) => {
            const updatedItems = state.items.map((i) =>
                i.id === item.id ? { ...i, name: item.name } : i,
            );
            return { items: updatedItems, activeItemId: item.id }; // Set activeItemId here
        });
    },
    removeItem: (id) =>
        set((state) => ({
            items: state.items.filter((item) => item.id !== id),
            activeItemId: state.activeItemId === id ? null : state.activeItemId,
        })),
}));
