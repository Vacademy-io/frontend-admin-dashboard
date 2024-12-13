import { z } from "zod";
import { create } from "zustand";
import { uploadQuestionPaperFormSchema } from "../-utils/upload-question-paper-form-schema";

type QuestionPaperForm = z.infer<typeof uploadQuestionPaperFormSchema>;

export interface AllQuestionsState {
    allQuestionsData: QuestionPaperForm[]; // Array of plain form data
    setAllQuestionsData: (data: QuestionPaperForm[]) => void;
}

export const useAllQuestionsStore = create<AllQuestionsState>((set) => ({
    allQuestionsData: [], // Initial state

    setAllQuestionsData: (data) => set(() => ({ allQuestionsData: data })),
}));
