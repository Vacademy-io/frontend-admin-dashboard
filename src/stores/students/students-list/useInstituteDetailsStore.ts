// stores/institute/useInstituteStore.ts
import { create } from "zustand";
import { InstituteDetailsType } from "@/schemas/student/student-list/institute-schema";

interface InstituteDetailsStore {
    instituteDetails: InstituteDetailsType | null;
    setInstituteDetails: (details: InstituteDetailsType) => void;
}

export const useInstituteDetailsStore = create<InstituteDetailsStore>((set) => ({
    instituteDetails: null,
    setInstituteDetails: (details) => set({ instituteDetails: details }),
}));
