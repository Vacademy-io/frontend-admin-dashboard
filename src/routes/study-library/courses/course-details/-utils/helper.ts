import { SubjectType } from '@/stores/study-library/use-study-library-store';
import { getPublicUrl } from '@/services/upload_file';

export interface Instructor {
    id: string;
    username: string;
    email: string;
    full_name: string;
    address_line: string | null;
    city: string | null;
    region: string | null;
    pin_code: string | null;
    mobile_number: string | null;
    date_of_birth: string | null;
    gender: string | null;
    password: string | null;
    profile_pic_file_id: string | null;
    roles: string[];
    root_user: boolean;
}

export interface Session {
    session_dto: {
        id: string;
        session_name: string;
        status: string;
        start_date: string;
    };
    level_with_details: Array<{
        id: string;
        name: string;
        duration_in_days: number;
        instructors: Instructor[];
        subjects: SubjectType[];
    }>;
}

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
    sessions: Session[];
}

const createDefaultSubject = (): SubjectType => ({
    id: 'DEFAULT',
    subject_name: 'DEFAULT',
    subject_code: 'DEFAULT',
    credit: 0,
    thumbnail_id: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
});

const tryGetPublicUrl = async (mediaId: string | null | undefined): Promise<string> => {
    if (!mediaId) return '';
    try {
        const url = await getPublicUrl(mediaId);
        return url || '';
    } catch {
        return '';
    }
};

export const transformApiDataToCourseData = async (apiData: CourseWithSessionsType) => {
    if (!apiData) return null;

    try {
        const [coursePreviewImageMediaId, courseBannerMediaId, courseMediaId] = await Promise.all([
            tryGetPublicUrl(apiData.course.course_preview_image_media_id),
            tryGetPublicUrl(apiData.course.course_banner_media_id),
            tryGetPublicUrl(apiData.course.course_media_id),
        ]);

        return {
            id: apiData.course.id,
            title: apiData.course.package_name,
            description: apiData.course.course_html_description, // Remove HTML tags
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
                        instructors: level.instructors.map((inst) => ({
                            id: inst.id,
                            name: inst.full_name,
                            email: inst.email,
                            profilePicId: inst.profile_pic_file_id,
                        })),
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

// Function to get instructors by sessionId and levelId
export function getInstructorsBySessionAndLevel(
    sessionsData: Session[],
    sessionId: string,
    levelId: string
) {
    for (const session of sessionsData) {
        if (session.session_dto.id === sessionId) {
            for (const level of session.level_with_details) {
                if (level.id === levelId) {
                    return level.instructors.map((inst: Instructor) => ({
                        id: inst.id,
                        name: inst.full_name,
                        email: inst.email,
                        profilePicId: inst.profile_pic_file_id || '',
                    }));
                }
            }
        }
    }
    return [];
}
