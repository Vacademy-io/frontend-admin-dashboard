import { MyQuestionPaperFormInterface } from "@/types/question-paper-form";
import { create } from "zustand";

// Define the interface for the Zustand store
interface SidebarState {
    sidebarOpen: boolean;
    setSidebarOpen: (isOpen: boolean) => void;
}

// Create the Zustand store using the interface
export const useSidebarStore = create<SidebarState>((set) => ({
    sidebarOpen: true,
    setSidebarOpen: (isOpen: boolean) => set({ sidebarOpen: isOpen }),
}));

interface UploadedQuestionPapersStore {
    sectionUploadedQuestionPapers: MyQuestionPaperFormInterface[];
    setSectionUploadedQuestionPapers: (
        updater: (prev: MyQuestionPaperFormInterface[]) => MyQuestionPaperFormInterface[],
    ) => void;
}

export const useUploadedQuestionPapersStore = create<UploadedQuestionPapersStore>((set) => ({
    sectionUploadedQuestionPapers: [],
    setSectionUploadedQuestionPapers: (updater) =>
        set((state) => ({
            sectionUploadedQuestionPapers: updater(state.sectionUploadedQuestionPapers),
        })),
}));