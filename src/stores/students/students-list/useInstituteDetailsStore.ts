import { create } from "zustand";
import {
    InstituteDetailsType,
    LevelType,
    SessionType,
} from "@/schemas/student/student-list/institute-schema";

interface InstituteDetailsStore {
    instituteDetails: InstituteDetailsType | null;
    setInstituteDetails: (details: InstituteDetailsType) => void;
    getAllLevels: () => Array<LevelType>;
    getAllSessions: () => Array<SessionType>;
    resetStore: () => void;
}

export const useInstituteDetailsStore = create<InstituteDetailsStore>((set, get) => ({
    instituteDetails: null,
    setInstituteDetails: (details) => set({ instituteDetails: details }),

    getAllLevels: () => {
        const { instituteDetails } = get();
        return instituteDetails?.levels ?? [];
    },

    getAllSessions: () => {
        const { instituteDetails } = get();
        return instituteDetails?.sessions ?? [];
    },
    resetStore: () => set({ instituteDetails: null }),
}));
