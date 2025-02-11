import { create } from "zustand";

interface SelectedFilters {
    difficulty: string | null;
    level: string | null;
    type: string | null;
    subject: string | null;
    topic: string | null;
    stream: string | null;
}

interface SelectedFilterStore {
    selected: SelectedFilters;
    setSelected: (filterKey: keyof SelectedFilters, value: string | null) => void;
    clearFilters: () => void;
}

export const useSelectedFilterStore = create<SelectedFilterStore>((set) => ({
    selected: {
        difficulty: null,
        level: null,
        type: null,
        subject: null,
        topic: null,
        stream: null,
    },
    setSelected: (filterKey, value) =>
        set((state) => ({
            selected: { ...state.selected, [filterKey]: value },
        })),
    clearFilters: () =>
        set({
            selected: {
                difficulty: null,
                level: null,
                type: null,
                subject: null,
                topic: null,
                stream: null,
            },
        }),
}));
