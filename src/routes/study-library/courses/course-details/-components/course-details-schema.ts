// courseSchema.ts
import { getPublicUrl } from '@/services/upload_file';
import { z } from 'zod';
import { SubjectType } from '@/stores/study-library/use-study-library-store';

const SlideSchema = z.object({
    id: z.string().uuid(),
    title: z.string().min(1),
});

const ChapterSchema = z.object({
    id: z.string().uuid(),
    title: z.string().min(1),
});

const ModuleSchema = z.object({
    id: z.string().uuid(),
    title: z.string().min(1),
});

const SubjectSchema = z.object({
    id: z.string().uuid(),
    title: z.string().min(1),
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
    subjects: z
        .array(
            z.object({
                id: z.string(),
                subject_name: z.string(),
                subject_code: z.string(),
                credit: z.number(),
                thumbnail_id: z.string().nullable(),
                created_at: z.string().nullable(),
                updated_at: z.string().nullable(),
                modules: z.array(z.any()).optional(),
            })
        )
        .optional(), // Changed to support SubjectType structure
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
    z.object({
        level: z.literal(1),
        structure: z.object({
            courseName: z.string().min(1),
            items: z.array(z.any()).optional(),
        }),
    }),
]);

export const courseDetailsSchema = z.object({
    courseData: z.object({
        id: z.string(),
        title: z.string().min(1, { message: 'Title is required.' }),
        description: z.string().min(10, { message: 'Description must be at least 10 characters.' }),
        tags: z.array(z.string()).min(1, { message: 'At least one tag is required.' }),
        imageUrl: z.string().url({ message: 'Must be a valid URL for the image.' }),
        courseStructure: z.number(),
        whatYoullLearn: z.string(),
        whyLearn: z.string(),
        whoShouldLearn: z.string(),
        aboutTheCourse: z.string(),
        packageName: z.string(),
        status: z.string(),
        isCoursePublishedToCatalaouge: z.boolean(),
        coursePreviewImageMediaId: z.string(),
        courseBannerMediaId: z.string(),
        courseMediaId: z.string(),
        courseHtmlDescription: z.string(),
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

interface CourseWithSessionsType {
    course: {
        id: string;
        package_name: string;
        thumbnail_file_id: string;
        status: string;
        is_course_published_to_catalaouge: boolean;
        course_preview_image_media_id: string;
        course_banner_media_id: string;
        course_media_id: string;
        why_learn: string;
        who_should_learn: string;
        about_the_course: string;
        tags: string;
        course_depth: number;
        course_html_description: string;
    };
    sessions: Array<{
        level_with_details: Array<{
            id: string;
            name: string;
            duration_in_days: number;
            subjects: SubjectType[];
        }>;
        session_dto: {
            id: string;
            session_name: string;
            status: string;
            start_date: string;
        };
    }>;
}

// Helper function to create a default subject for course structure 4
const createDefaultSubject = (): SubjectType => ({
    id: 'DEFAULT',
    subject_name: 'DEFAULT',
    subject_code: 'DEFAULT',
    credit: 0,
    thumbnail_id: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
});

export const transformApiDataToCourseData = async (apiData: CourseWithSessionsType) => {
    if (!apiData) return null;

    try {
        let coursePreviewImageMediaId = '';
        let courseBannerMediaId = '';
        let courseMediaId = '';

        await new Promise((resolve) => {
            setTimeout(async () => {
                coursePreviewImageMediaId = await getPublicUrl(
                    apiData.course.course_preview_image_media_id
                );
                courseBannerMediaId = await getPublicUrl(apiData.course.course_banner_media_id);
                courseMediaId = await getPublicUrl(apiData.course.course_media_id);
                resolve(true);
            }, 0);
        });

        return {
            id: apiData.course.id,
            title: apiData.course.package_name,
            description: apiData.course.course_html_description.replace(/<[^>]*>/g, ''), // Remove HTML tags
            tags: apiData.course.tags?.split(',').map((tag) => tag.trim()) || [],
            imageUrl: coursePreviewImageMediaId || '', // Use the preview image as the main image
            courseStructure: apiData.course.course_depth,
            whatYoullLearn: apiData.course.why_learn,
            whyLearn: apiData.course.why_learn,
            whoShouldLearn: apiData.course.who_should_learn,
            aboutTheCourse: apiData.course.about_the_course,
            packageName: apiData.course.package_name,
            status: apiData.course.status,
            isCoursePublishedToCatalaouge: apiData.course.is_course_published_to_catalaouge,
            coursePreviewImageMediaId,
            courseBannerMediaId,
            courseMediaId,
            courseHtmlDescription: apiData.course.course_html_description,
            instructors: [], // This should be populated from your API if available
            sessions: apiData.sessions.map((session) => ({
                levelDetails: session.level_with_details.map((level) => {
                    // For course structure 4, add a default subject if no subjects exist
                    let subjects = level.subjects;
                    if (apiData.course.course_depth === 4) {
                        if (!subjects || subjects.length === 0) {
                            subjects = [createDefaultSubject()];
                        }
                    }

                    return {
                        id: level.id,
                        name: level.name,
                        duration_in_days: level.duration_in_days,
                        subjects: subjects.map((subject) => ({
                            id: subject.id,
                            subject_name: subject.subject_name,
                            subject_code: subject.subject_code,
                            credit: subject.credit,
                            thumbnail_id: subject.thumbnail_id,
                            created_at: subject.created_at,
                            updated_at: subject.updated_at,
                            modules: [],
                        })),
                    };
                }),
                sessionDetails: {
                    id: session.session_dto.id,
                    session_name: session.session_dto.session_name,
                    status: session.session_dto.status,
                    start_date: session.session_dto.start_date,
                },
            })),
        };
    } catch (error) {
        console.error('Error getting public URLs:', error);
        return null;
    }
};
