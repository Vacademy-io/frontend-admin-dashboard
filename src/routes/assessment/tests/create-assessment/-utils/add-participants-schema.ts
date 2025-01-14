import { z } from "zod";

// Define TestInputField schema
const testInputFieldSchema = z.object({
    id: z.number(),
    type: z.string(),
    name: z.string(),
    oldKey: z.boolean(),
    isRequired: z.boolean(),
    options: z
        .array(
            z.object({
                id: z.number(),
                value: z.string(),
            }),
        )
        .optional(),
});

// Define the schema for each student
const studentSchema = z.object({
    username: z.string(),
    user_id: z.string(),
    email: z.string(),
    full_name: z.string(),
    mobile_number: z.string(),
    guardian_email: z.string(),
    guardian_mobile_number: z.string(),
    file_id: z.string(),
    reattempt_count: z.number(),
});

// Define a dynamic object to handle custom fields as a record of TestInputField
const customFieldsSchema = z.record(testInputFieldSchema); // Maps field names to TestInputField definitions

const notifyBeforeAssessmentGoLiveSchema = z.object({
    checked: z.boolean(),
    value: z.string(),
});

const testAccessSchema = z.object({
    status: z.string(),
    closed_test: z.boolean(),
    open_test: z.object({
        checked: z.boolean(),
        start_date: z.string(),
        end_date: z.string(),
        instructions: z.string(),
        name: z.string(),
        email: z.string(),
        phone: z.string(),
        custom_fields: customFieldsSchema, // Dynamic custom fields
    }),
    select_batch: z.object({
        checked: z.boolean(),
        batch_details: z.record(z.array(z.string())),
    }),
    select_individually: z.object({
        checked: z.boolean(),
        student_details: z.array(studentSchema),
    }),
    join_link: z.string(),
    show_leaderboard: z.boolean(),
    notify_student: z.object({
        when_assessment_created: z.boolean(),
        before_assessment_goes_live: notifyBeforeAssessmentGoLiveSchema,
        when_assessment_live: z.boolean(),
        when_assessment_report_generated: z.boolean(),
    }),
    notify_parent: z.object({
        when_assessment_created: z.boolean(),
        before_assessment_goes_live: notifyBeforeAssessmentGoLiveSchema,
        when_assessment_live: z.boolean(),
        when_student_appears: z.boolean(),
        when_student_finishes_test: z.boolean(),
        when_assessment_report_generated: z.boolean(),
    }),
});

export default testAccessSchema;
