import { z } from "zod";

const SubModuleSchema = z.object({
    module: z.string(),
    sub_module: z.string(),
    sub_module_description: z.string(),
});

const SessionSchema = z.object({
    id: z.string(),
    session_name: z.string(),
    status: z.string(),
});

const LevelSchema = z.object({
    id: z.string(),
    level_name: z.string(),
    duration_in_days: z.number().nullable(),
});

const PackageSchema = z.object({
    id: z.string(),
    package_name: z.string(),
});

const BatchForSessionSchema = z.object({
    id: z.string(),
    level: LevelSchema,
    session: SessionSchema,
    start_time: z.string(),
    status: z.string(),
    package_dto: PackageSchema,
});

const SubjectSchema = z.object({
    id: z.string(),
    subject_name: z.string(),
    subject_code: z.string(),
    credit: z.number().nullable(),
    created_at: z.string(),
    updated_at: z.string(),
});

const InstituteSchema = z.object({
    institute_name: z.string(),
    id: z.string(),
    country: z.string(),
    state: z.string(),
    city: z.string(),
    address: z.string(),
    pin_code: z.string(),
    phone: z.string(),
    email: z.string().email(),
    website_url: z.string().url(),
    institute_logo_file_id: z.string().nullable(),
    institute_theme_code: z.string(),
    language: z.string().nullable(),
    description: z.string().nullable(),
    type: z.string().nullable(),
    held_by: z.string().nullable(),
    founded_date: z.string().nullable(),
    sub_modules: z.array(SubModuleSchema),
    sessions: z.array(SessionSchema),
    batches_for_sessions: z.array(BatchForSessionSchema),
    levels: z.array(LevelSchema),
    genders: z.array(z.enum(["MALE", "FEMALE", "OTHER"])),
    student_statuses: z.array(z.enum(["ACTIVE", "TERMINATED"])),
    subjects: z.array(SubjectSchema),
    session_expiry_days: z.array(z.number()),
});

export type InstituteDetailsType = z.infer<typeof InstituteSchema> | null;
