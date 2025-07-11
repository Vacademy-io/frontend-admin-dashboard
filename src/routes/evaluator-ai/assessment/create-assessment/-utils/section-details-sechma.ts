import { z } from 'zod';

const sectionDetailsSchema = z.object({
    status: z.string(),
    section: z.array(
        z.object({
            sectionId: z.string(),
            sectionName: z.string(),
            questionPaperTitle: z.string().optional(),
            uploaded_question_paper: z.string().nullable(),
            subject: z.string().optional(),
            yearClass: z.string().optional(),
            question_duration: z.object({
                hrs: z.string(),
                min: z.string(),
            }),
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
                z.object({
                    questionId: z.string().optional(),
                    questionName: z.string(),
                    questionMark: z.string(),
                    criteria: z
                        .array(
                            z.object({
                                name: z.string(),
                                marks: z.number(),
                            })
                        )
                        .optional(),
                })
            ),
        })
    ),
});

export default sectionDetailsSchema;
