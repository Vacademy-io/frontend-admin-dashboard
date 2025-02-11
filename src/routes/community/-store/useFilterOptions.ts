import { create } from "zustand";

interface FilterOptions {
    difficulty: string[];
    level: string[];
    type: string[];
    subject: string[];
    topic: string[];
    stream: string[];
}

interface FilterStore {
    options: FilterOptions;
    setOptions: (options: FilterOptions) => void;
}

export const useFilterStore = create<FilterStore>((set) => ({
    options: {
        difficulty: [],
        level: [],
        type: [],
        subject: [],
        topic: [],
        stream: [],
    },
    setOptions: (options) => set({ options }),
}));
