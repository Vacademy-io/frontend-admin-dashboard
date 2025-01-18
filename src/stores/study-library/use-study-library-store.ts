// stores/study-library/useStudyLibraryStore.ts
import { create } from "zustand";

interface StudyLibrarySession {
    id: string;
    session_name: string;
    status: string;
}

interface Subject {
    id: string;
    subject_name: string;
    subject_code: string;
    credit: number;
    thumbnail_id: string | null;
    created_at: string | null;
    updated_at: string | null;
}

interface LevelWithDetails {
    id: string;
    name: string;
    duration_in_days: number;
    subjects: Subject[];
}

interface StudyLibraryData {
    session_dto: StudyLibrarySession;
    level_with_details: LevelWithDetails[];
}

interface StudyLibraryStore {
    studyLibraryData: StudyLibraryData[] | null;
    setStudyLibraryData: (data: StudyLibraryData[]) => void;
}

export const useStudyLibraryStore = create<StudyLibraryStore>((set) => ({
    studyLibraryData: null,
    setStudyLibraryData: (data) => set({ studyLibraryData: data }),
}));
