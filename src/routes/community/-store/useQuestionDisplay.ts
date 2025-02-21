import { create } from "zustand";
import { Level, Stream, Subject } from "@/types/community/types";

interface SelectedFilters {
    difficulty: string | null;
    level: Level | null;
    type: string | null;
    subject: Subject | null;
    topic: string | null;
    stream: Stream | null;
}

interface QuestionDisplayStore {
    selected: SelectedFilters;
    setSelected: (
        filterKey: keyof SelectedFilters,
        value: string | Level | Stream | Subject | null,
    ) => void;
    clearFilters: () => void;
}

export const useQuestionDisplayStore = create<QuestionDisplayStore>((set) => ({
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
