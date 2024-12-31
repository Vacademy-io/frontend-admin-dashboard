import { z } from "zod";

const adaptiveMarkingSchema = z.object({
    questionId: z.string(),
    marks: z.string(),
    penalty: z.string(),
});

const sectionDetailsSchema = z.object({
    section: z.array(
        z.object({
            uploaded_question_paper: z.string().nullable(),
            section_description: z.string(),
            section_duration: z.object({
                hrs: z.string(),
                min: z.string(),
            }),
            marks_per_question: z.string(),
            total_marks: z.string(),
            negative_marking: z.object({
                checked: z.boolean(),
                value: z.string(),
            }),
            partial_marking: z.boolean(),
            cutoff_marks: z.object({
                checked: z.boolean(),
                value: z.string(),
            }),
            problem_randomization: z.boolean(),
            adaptive_marking_for_each_question: z.array(
                z.record(z.string(), adaptiveMarkingSchema),
            ),
        }),
    ),
});

export default sectionDetailsSchema;
