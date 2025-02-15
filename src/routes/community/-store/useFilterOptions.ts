import { create } from "zustand";
import { InitData } from "@/types/community/types";

interface FilterStore {
    options: InitData;
    setOptions: (options: InitData) => void;
}

export const useFilterStore = create<FilterStore>((set) => ({
    options: {
        levels: [],
        streams: {},
        subjects: {},
        difficulties: [],
        topics: [],
        types: [],
    },
    setOptions: (options) => set({ options }),
}));
