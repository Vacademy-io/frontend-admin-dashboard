// stores/content-store.ts
import { create } from "zustand";
import { Slide } from "@/hooks/study-library/use-slides";

interface ContentStore {
    items: Slide[];
    activeItem: Slide | null;
    setItems: (items: Slide[]) => void;
    setActiveItem: (item: Slide | null) => void;
    reorderItems: (oldIndex: number, newIndex: number) => void;
}

export const useContentStore = create<ContentStore>((set) => ({
    items: [],
    activeItem: null,
    setItems: (items) => set({ items }),
    setActiveItem: (item) => set({ activeItem: item }),
    reorderItems: (oldIndex: number, newIndex: number) =>
        set((state) => {
            if (
                oldIndex < 0 ||
                oldIndex >= state.items.length ||
                newIndex < 0 ||
                newIndex >= state.items.length
            ) {
                return state;
            }

            const newItems = [...state.items];
            const movedItem: Slide = newItems[oldIndex]!;
            newItems.splice(oldIndex, 1);
            newItems.splice(newIndex, 0, movedItem);

            return {
                ...state,
                items: newItems,
            };
        }),
}));
