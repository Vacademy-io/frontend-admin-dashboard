import { Step1Data, Step2Data } from '../add-course/add-course-form';
import { z } from 'zod';

export type CourseFormData = Step1Data & Step2Data;

interface FormattedCourseData {
    id: string;
    new_course: boolean;
    course_name: string;
    thumbnail_file_id: string;
    course_html_description: string;
    contain_levels: boolean;
    sessions: Array<{
        id: string;
        session_name: string;
        status: string;
        start_date: string;
        new_session: boolean;
        levels: Array<{
            id: string;
            new_level: boolean;
            level_name: string;
            duration_in_days: number;
            thumbnail_file_id: string;
            package_id: string;
            userIds: string[];
            group: {
                id: string;
                group_name: string;
                group_value: string;
                new_group: boolean;
            };
        }>;
    }>;
    is_course_published_to_catalaouge: boolean;
    course_preview_image_media_id: string;
    course_banner_media_id: string;
    course_media_id: string;
    why_learn_html: string;
    who_should_learn_html: string;
    about_the_course_html: string;
    tags: string[];
    course_depth: number;
}

type FormattedSession = FormattedCourseData['sessions'][0];
type FormattedLevel = FormattedSession['levels'][0];

export const convertToApiCourseFormat = (formData: CourseFormData): FormattedCourseData => {
    const hasLevels = formData.hasLevels === 'yes';
    const hasSessions = formData.hasSessions === 'yes';

    // Function to format levels
    const formatLevels = (levels: Array<{ id: string; name: string; userIds: string[] }>, defaultUserIds: string[] = []): FormattedLevel[] =>
        levels.map((level) => ({
            id: '',
            new_level: true,
            level_name: level.name,
            duration_in_days: 0,
            thumbnail_file_id: '',
            package_id: '',
            userIds: level.userIds || defaultUserIds,
            group: {
                id: '',
                group_name: '',
                group_value: '',
                new_group: true,
            },
        }));

    // Determine sessions structure
    let sessions: FormattedSession[] = [];
    if (!hasLevels && !hasSessions) {
        // When both are false, all selected instructors go to default level in default session
        const allUserIds = formData.selectedInstructors.map(instructor => instructor.id);

        sessions = [
            {
                id: 'DEFAULT',
                session_name: '',
                status: 'ACTIVE',
                start_date: '',
                new_session: true,
                levels: [
                    {
                        id: 'DEFAULT',
                        new_level: true,
                        level_name: '',
                        duration_in_days: 0,
                        thumbnail_file_id: '',
                        package_id: '',
                        userIds: allUserIds,
                        group: {
                            id: 'DEFAULT',
                            group_name: '',
                            group_value: '',
                            new_group: true,
                        },
                    },
                ],
            },
        ];
    } else if (hasSessions) {
        sessions = formData.sessions.map((session) => ({
            id: '',
            session_name: session.name,
            status: 'ACTIVE',
            start_date: session.startDate,
            new_session: true,
            levels: hasLevels
                ? formatLevels(session.levels) // Keep userIds in their respective levels
                : [
                      {
                          id: 'DEFAULT',
                          new_level: true,
                          level_name: '',
                          duration_in_days: 0,
                          thumbnail_file_id: '',
                          package_id: '',
                          userIds: session.levels[0]?.userIds ?? [], // When hasLevels is false, userIds go to default level
                          group: {
                              id: 'DEFAULT',
                              group_name: '',
                              group_value: '',
                              new_group: true,
                          },
                      },
                  ],
        }));
    } else if (hasLevels) {
        // When only hasLevels is true, keep userIds in their respective levels but in default session
        const standaloneLevels = formData.sessions.find((s) => s.id === 'standalone')?.levels || [];
        sessions = [
            {
                id: 'DEFAULT',
                session_name: '',
                status: 'ACTIVE',
                start_date: '',
                new_session: true,
                levels: standaloneLevels.map(level => ({
                    id: '',
                    new_level: true,
                    level_name: level.name,
                    duration_in_days: 0,
                    thumbnail_file_id: '',
                    package_id: '',
                    userIds: level.userIds || [],
                    group: {
                        id: '',
                        group_name: '',
                        group_value: '',
                        new_group: true,
                    },
                })),
            },
        ];
    }

    return {
        id: '',
        new_course: true,
        course_name: formData.course || '',
        thumbnail_file_id: '',
        contain_levels: hasLevels || hasSessions,
        sessions,
        is_course_published_to_catalaouge: formData.publishToCatalogue,
        course_preview_image_media_id: formData.coursePreview?.id || '',
        course_banner_media_id: formData.courseBanner?.id || '',
        course_media_id: formData.courseMedia?.id || '',
        why_learn_html: formData.learningOutcome || '',
        who_should_learn_html: formData.targetAudience || '',
        about_the_course_html: formData.aboutCourse || '',
        tags: formData.tags || [],
        course_depth: formData.levelStructure || 2,
        course_html_description: formData.description || '',
    };
};
