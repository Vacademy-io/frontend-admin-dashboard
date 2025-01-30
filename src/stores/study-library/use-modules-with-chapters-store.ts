// stores/study-library/useModulesWithChaptersStore.ts
import { create } from "zustand";
import { ModulesWithChapters } from "@/types/study-library/modules-with-chapters";

export interface ModulesWithChaptersStore {
    modulesWithChaptersData: ModulesWithChapters[] | null;
    setModulesWithChaptersData: (data: ModulesWithChapters[]) => void;
}

export const useModulesWithChaptersStore = create<ModulesWithChaptersStore>((set) => ({
    modulesWithChaptersData: null,
    setModulesWithChaptersData: (data) => set({ modulesWithChaptersData: data }),
}));
