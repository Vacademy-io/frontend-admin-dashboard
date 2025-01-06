import { z } from "zod";

// Define a dynamic object to handle custom fields
const customFieldsSchema = z.record(z.string()); // Allows any key with a string value

const studentDetailSchema = z.object({
    student_name: z.string(),
    batch: z.string(),
    enrollment_number: z.string(),
    gender: z.string(),
    college_or_school: z.string(),
    mobile_no: z.string(),
    email: z.string(),
    city: z.string(),
    state: z.string(),
});

const notifyBeforeAssessmentGoLiveSchema = z.object({
    checked: z.boolean(),
    value: z.string(),
});

const testAccessSchema = z.object({
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
        student_details: z.array(studentDetailSchema),
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
