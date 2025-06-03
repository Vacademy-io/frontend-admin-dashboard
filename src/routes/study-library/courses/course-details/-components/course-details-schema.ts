// courseSchema.ts
import { z } from 'zod';

// Base schemas for nested items (assuming common properties like id and title)
// You would expand these with actual properties based on your data needs
const SlideSchema = z.object({
    id: z.string().uuid(),
    title: z.string().min(1),
    // Add other properties specific to a Slide, e.g., content: z.string()
});

const ChapterSchema = z.object({
    id: z.string().uuid(),
    title: z.string().min(1),
    // Add other properties specific to a Chapter, e.g., pages: z.number()
});

const ModuleSchema = z.object({
    id: z.string().uuid(),
    title: z.string().min(1),
    // Add other properties specific to a Module, e.g., topics: z.array(z.string())
});

const SubjectSchema = z.object({
    id: z.string().uuid(),
    title: z.string().min(1),
    // Add other properties specific to a Subject, e.g., instructor: z.string()
});

// Define the schema for a single instructor
const instructorSchema = z.object({
    id: z.string().uuid(), // Assuming IDs are UUIDs
    email: z.string().email({ message: 'Invalid email address.' }),
    name: z.string().min(1, { message: 'Instructor name is required.' }),
});

// Define the schema for level details within a session
const levelDetailsSchema = z.object({
    id: z.string().uuid(), // Assuming IDs are UUIDs
    name: z.string().min(1, { message: 'Level name is required.' }),
    duration_in_days: z
        .number()
        .int()
        .min(0, { message: 'Duration must be a non-negative integer.' }),
    subjects: z.array(z.string()).optional(), // Subjects can be an empty array
});

// Define the schema for session details
const sessionDetailsSchema = z.object({
    id: z.string().uuid(), // Assuming IDs are UUIDs
    session_name: z.string().min(1, { message: 'Session name is required.' }),
    status: z.string().min(1, { message: 'Status name is required.' }),
    start_date: z
        .string()
        .regex(/^\d{4}-\d{2}-\d{2}$/, { message: 'Start date must be in YYYY-MM-DD format.' }), // Simple date string validation
});

// Define the schema for a single session
const sessionSchema = z.object({
    levelDetails: z
        .array(levelDetailsSchema)
        .min(1, { message: 'At least one level detail is required per session.' }),
    sessionDetails: sessionDetailsSchema,
});

// New: Course Structure Schema using Discriminated Union
const CourseStructureSchema = z.discriminatedUnion('level', [
    z.object({
        level: z.literal(2),
        structure: z.object({
            courseName: z.string().min(1),
            items: z.array(SlideSchema),
        }),
    }),
    z.object({
        level: z.literal(3),
        structure: z.object({
            courseName: z.string().min(1),
            items: z.array(ChapterSchema),
        }),
    }),
    z.object({
        level: z.literal(4),
        structure: z.object({
            courseName: z.string().min(1),
            items: z.array(ModuleSchema),
        }),
    }),
    z.object({
        level: z.literal(5),
        structure: z.object({
            courseName: z.string().min(1),
            items: z.array(SubjectSchema),
        }),
    }),
    // Add a default case if level 1 is possible, or if other levels have a simpler structure
    // For example, if level 1 just has a courseName and no items:
    z.object({
        level: z.literal(1),
        structure: z.object({
            courseName: z.string().min(1),
            items: z.array(z.any()).optional(), // Or z.array(z.never()) if no items
        }),
    }),
]);

export const courseDetailsSchema = z.object({
    courseData: z.object({
        // This would be the wrapper if 'courseData' is a nested object
        title: z.string().min(1, { message: 'Title is required.' }),
        description: z.string().min(10, { message: 'Description must be at least 10 characters.' }),
        tags: z.array(z.string()).min(1, { message: 'At least one tag is required.' }),
        imageUrl: z.string().url({ message: 'Must be a valid URL for the image.' }),
        stats: z.object({
            students: z
                .number()
                .int()
                .min(0, { message: 'Number of students must be a non-negative integer.' }),
            rating: z.number().min(0).max(5, { message: 'Rating must be between 0 and 5.' }),
            reviews: z
                .number()
                .int()
                .min(0, { message: 'Number of reviews must be a non-negative integer.' }),
            lastUpdated: z.string().min(1, { message: 'Last updated date is required.' }),
        }),
        courseStructure: z.number().min(1, { message: 'Course structure level must be 1, 2, 3, 4, or 5.' }),
        whatYoullLearn: z
            .array(z.string())
            .min(1, { message: 'At least one learning objective is required.' }),
        instructors: z
            .array(instructorSchema)
            .min(1, { message: 'At least one instructor is required.' }),
        sessions: z.array(sessionSchema).min(1, { message: 'At least one session is required.' }),
    }),
    mockCourses: z
        .array(
            z
                .object({
                    id: z.string().uuid(),
                    title: z.string().min(1, { message: 'Mock course title is required.' }),
                })
                .and(CourseStructureSchema)
        )
        .min(0),
});

export type CourseDetailsFormValues = z.infer<typeof courseDetailsSchema>;
// Define types for the nested items for clarity in the form
export type Slide = z.infer<typeof SlideSchema>;
export type Chapter = z.infer<typeof ChapterSchema>;
export type Module = z.infer<typeof ModuleSchema>;
export type Subject = z.infer<typeof SubjectSchema>;
