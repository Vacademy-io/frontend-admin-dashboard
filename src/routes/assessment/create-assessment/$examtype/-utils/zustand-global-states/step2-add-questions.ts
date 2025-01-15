import { create } from "zustand";

interface SectionDetailsState {
    status?: string;
    section: {
        sectionId: string | null;
        sectionName: string;
        questionPaperTitle: string;
        subject: string;
        yearClass: string;
        uploaded_question_paper?: string | null;
        question_duration: {
            hrs: string;
            min: string;
        };
        section_description: string;
        section_duration: {
            hrs: string;
            min: string;
        };
        marks_per_question?: string;
        total_marks: string;
        negative_marking: {
            checked: boolean;
            value: string;
        };
        partial_marking?: boolean;
        cutoff_marks?: {
            checked: boolean;
            value: string;
        };
        problem_randomization?: boolean;
        adaptive_marking_for_each_question?: {
            questionId?: string;
            questionName: string;
            questionType: string;
            questionMark: string;
            questionPenalty: string;
            questionDuration: {
                hrs: string;
                min: string;
            };
        }[];
    }[];
    setSectionDetails: (data: Partial<SectionDetailsState>) => void;
    getSectionDetails: () => SectionDetailsState;
}

export const useSectionDetailsStore = create<SectionDetailsState>((set, get) => ({
    status: "",
    section: [],
    setSectionDetails: (data) =>
        set((state) => ({
            ...state,
            ...data,
        })),
    getSectionDetails: () => get(),
}));
