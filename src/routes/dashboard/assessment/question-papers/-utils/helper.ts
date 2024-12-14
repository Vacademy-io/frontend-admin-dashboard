import { z } from "zod";
import { uploadQuestionPaperFormSchema } from "./upload-question-paper-form-schema";

type QuestionPaperForm = z.infer<typeof uploadQuestionPaperFormSchema>;

export function formatStructure(structure: string, value: string | number): string {
    // If structure does not contain parentheses, just replace the number/letter with the value
    return structure.replace(/[a-zA-Z0-9]/, `${value}`);
}

export function countFavourites(questionPapers: QuestionPaperForm[]): number {
    if (questionPapers.length === 0) return 0;
    return questionPapers.filter((paper) => paper.isFavourite).length;
}
