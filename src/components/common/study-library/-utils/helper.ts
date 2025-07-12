import { CourseDetailsFormValues } from '@/routes/study-library/courses/course-details/-components/course-details-schema';
import { Step1Data, Step2Data } from '../add-course/add-course-form';
import { Session } from '@/types/course/create-course';
import { TokenKey } from '@/constants/auth/tokens';
import { getTokenDecodedData, getTokenFromCookie } from '@/lib/auth/sessionUtility';

export type CourseFormData = Step1Data & Step2Data;

interface AddFacultyToCourse {
    user: UserDetails;
    new_user: boolean;
}

interface UserDetails {
    id: string;
    username: string;
    email: string;
    full_name: string;
    address_line: string;
    city: string;
    region: string;
    pin_code: string;
    mobile_number: string;
    date_of_birth: string;
    gender: string;
    password: string;
    profile_pic_file_id: string;
    roles: string[];
    root_user: boolean;
}

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
            add_faculty_to_course: AddFacultyToCourse[];
            package_session_status?: string;
            package_session_id?: string;
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
    const accessToken = getTokenFromCookie(TokenKey.accessToken);
    const tokenData = getTokenDecodedData(accessToken);
    const hasLevels = formData.hasLevels === 'yes';
    const hasSessions = formData.hasSessions === 'yes';

    // 👇 Additional user to be added in every level
    const additionalUser = {
        user: {
            id: tokenData?.user || '',
            username: '',
            email: tokenData?.email || '',
            full_name: tokenData?.fullname || '',
            address_line: '',
            city: '',
            region: '',
            pin_code: '',
            mobile_number: '',
            date_of_birth: '',
            gender: '',
            password: '',
            profile_pic_file_id: '',
            roles: [],
            root_user: true,
        },
        new_user: false,
    };

    const mapUser = (user: { id: string; name: string; email: string; profilePicId: string }) => ({
        user: {
            id: user.id || '',
            username: '',
            email: user.email || '',
            full_name: user.name || '',
            address_line: '',
            city: '',
            region: '',
            pin_code: '',
            mobile_number: '',
            date_of_birth: '',
            gender: '',
            password: '',
            profile_pic_file_id: user.profilePicId,
            roles: [],
            root_user: true,
        },
        new_user: false,
    });

    const formatLevels = (
        levels: Array<{
            id: string;
            name: string;
            userIds: { id: string; name: string; email: string; profilePicId: string }[];
        }>
    ): FormattedLevel[] =>
        levels.map((level) => ({
            id: '',
            new_level: true,
            level_name: level.name,
            duration_in_days: 0,
            thumbnail_file_id: '',
            package_id: '',
            add_faculty_to_course: [...(level.userIds?.map(mapUser) ?? []), additionalUser],
            group: {
                id: '',
                group_name: '',
                group_value: '',
                new_group: true,
            },
        }));

    let sessions: FormattedSession[] = [];

    if (!hasLevels && !hasSessions) {
        const allUsers = formData.instructors;

        sessions = [
            {
                id: 'DEFAULT',
                session_name: 'DEFAULT',
                status: 'ACTIVE',
                start_date: '',
                new_session: true,
                levels: [
                    {
                        id: 'DEFAULT',
                        new_level: true,
                        level_name: 'DEFAULT',
                        duration_in_days: 0,
                        thumbnail_file_id: '',
                        package_id: '',
                        add_faculty_to_course: [
                            ...(Array.isArray(allUsers) ? allUsers.map(mapUser) : []),
                            additionalUser,
                        ],
                        group: {
                            id: 'DEFAULT',
                            group_name: 'DEFAULT',
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
                ? formatLevels(session.levels)
                : [
                      {
                          id: 'DEFAULT',
                          new_level: true,
                          level_name: 'DEFAULT',
                          duration_in_days: 0,
                          thumbnail_file_id: '',
                          package_id: '',
                          add_faculty_to_course: [
                              ...(session.levels?.[0]?.userIds?.map(mapUser) ?? []),
                              additionalUser,
                          ],
                          group: {
                              id: 'DEFAULT',
                              group_name: 'DEFAULT',
                              group_value: '',
                              new_group: true,
                          },
                      },
                  ],
        }));
    } else if (hasLevels) {
        const standaloneLevels = formData.sessions.find((s) => s.id === 'standalone')?.levels || [];
        sessions = [
            {
                id: 'DEFAULT',
                session_name: 'DEFAULT',
                status: 'ACTIVE',
                start_date: '',
                new_session: true,
                levels: standaloneLevels.map((level) => ({
                    id: '',
                    new_level: true,
                    level_name: level.name,
                    duration_in_days: 0,
                    thumbnail_file_id: '',
                    package_id: '',
                    add_faculty_to_course: [...(level.userIds?.map(mapUser) ?? []), additionalUser],
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
        course_preview_image_media_id: formData.coursePreview || '',
        course_banner_media_id: formData.courseBanner || '',
        course_media_id: JSON.stringify(formData.courseMedia) || '',
        why_learn_html: formData.learningOutcome || '',
        who_should_learn_html: formData.targetAudience || '',
        about_the_course_html: formData.aboutCourse || '',
        tags: formData.tags || [],
        course_depth: formData.levelStructure || 2,
        course_html_description: formData.description || '',
    };
};

export const convertToApiCourseFormatUpdate = (
    oldFormData: CourseFormData,
    formData: CourseFormData,
    getPackageSessionId: (params: {
        courseId: string;
        sessionId: string;
        levelId: string;
    }) => string
): FormattedCourseData => {
    const hasLevels = formData.hasLevels === 'yes';
    const hasSessions = formData.hasSessions === 'yes';

    const accessToken = getTokenFromCookie(TokenKey.accessToken);
    const tokenData = getTokenDecodedData(accessToken);

    // 👇 Additional user to be added to all levels
    const additionalUser = {
        user: {
            id: tokenData?.user || '',
            username: '',
            email: tokenData?.email || '',
            full_name: tokenData?.fullname || '',
            address_line: '',
            city: '',
            region: '',
            pin_code: '',
            mobile_number: '',
            date_of_birth: '',
            gender: '',
            password: '',
            profile_pic_file_id: '',
            roles: [],
            root_user: true,
        },
        status: 'ACTIVE',
        new_user: false,
    };

    const findById = <T extends { id: string }>(list: T[], id: string) =>
        list.find((item) => item.id === id);

    type User = {
        id: string;
        name: string;
        email: string;
        profilePicId: string;
    };

    type Level = {
        id: string;
        name: string;
        userIds: User[];
    };

    const formatLevels = (sessionId: string, newLevels: Level[] = [], oldLevels: Level[] = []) => {
        const allLevelIds = new Set([...newLevels.map((l) => l.id), ...oldLevels.map((l) => l.id)]);

        return Array.from(allLevelIds).map((levelId) => {
            const current = findById(newLevels, levelId);
            const previous = findById(oldLevels, levelId);

            const isNewLevel = current && !previous;
            const isDeletedLevel = !current && previous;
            const level = current || previous;

            const currentUsers: User[] = current?.userIds || [];
            const previousUsers: User[] = previous?.userIds || [];

            const deletedUsers = previousUsers
                .filter((oldUser) => !currentUsers.some((newUser) => newUser.id === oldUser.id))
                .map((user) => ({
                    user: {
                        id: user.id || '',
                        username: '',
                        email: user.email || '',
                        full_name: user.name || '',
                        address_line: '',
                        city: '',
                        region: '',
                        pin_code: '',
                        mobile_number: '',
                        date_of_birth: '',
                        gender: '',
                        password: '',
                        profile_pic_file_id: user.profilePicId || '',
                        roles: [],
                        root_user: true,
                    },
                    status: 'DELETED',
                    new_user: false,
                }));

            const addedUsers = currentUsers
                .filter((newUser) => !previousUsers.some((oldUser) => oldUser.id === newUser.id))
                .map((user) => ({
                    user: {
                        id: user.id || '',
                        username: '',
                        email: user.email || '',
                        full_name: user.name || '',
                        address_line: '',
                        city: '',
                        region: '',
                        pin_code: '',
                        mobile_number: '',
                        date_of_birth: '',
                        gender: '',
                        password: '',
                        profile_pic_file_id: user.profilePicId || '',
                        roles: [],
                        root_user: true,
                    },
                    status: 'ACTIVE',
                    new_user: true,
                }));

            const existingUsers = currentUsers
                .filter((newUser) => previousUsers.some((oldUser) => oldUser.id === newUser.id))
                .map((user) => ({
                    user: {
                        id: user.id || '',
                        username: '',
                        email: user.email || '',
                        full_name: user.name || '',
                        address_line: '',
                        city: '',
                        region: '',
                        pin_code: '',
                        mobile_number: '',
                        date_of_birth: '',
                        gender: '',
                        password: '',
                        profile_pic_file_id: user.profilePicId || '',
                        roles: [],
                        root_user: true,
                    },
                    status: 'ACTIVE',
                    new_user: false,
                }));

            const add_faculty_to_course = [
                ...deletedUsers,
                ...addedUsers,
                ...existingUsers,
                additionalUser,
            ];

            return {
                id: isNewLevel ? '' : level?.id || '',
                new_level: isNewLevel ? true : false,
                level_name: level?.name || '',
                duration_in_days: 0,
                thumbnail_file_id: '',
                package_id: '',
                package_session_status: isDeletedLevel ? 'DELETED' : 'ACTIVE',
                package_session_id:
                    getPackageSessionId({
                        courseId: formData.id || '',
                        sessionId,
                        levelId: level?.id || '',
                    }) || '',
                new_package_session: isNewLevel ? true : false,
                add_faculty_to_course,
                group: {
                    id: '',
                    group_name: '',
                    group_value: '',
                    new_group: false,
                },
            };
        });
    };

    const currentSessions = formData.sessions || [];
    const previousSessions = oldFormData.sessions || [];

    const allSessionIds = new Set([
        ...currentSessions.map((s) => s.id),
        ...previousSessions.map((s) => s.id),
    ]);

    const sessions: FormattedSession[] = Array.from(allSessionIds).map((sessionId) => {
        const current = findById(currentSessions, sessionId);
        const previous = findById(previousSessions, sessionId);

        const isNewSession = current && !previous;
        const isDeletedSession = !current && previous;
        const session = current || previous;

        const levels = formatLevels(
            sessionId,
            (current?.levels as Level[]) || [],
            (previous?.levels as Level[]) || []
        );

        return {
            id: isNewSession ? '' : session?.id || '',
            session_name: session?.name || '',
            status: isDeletedSession ? 'DELETED' : 'ACTIVE',
            start_date: session?.startDate || '',
            new_session: isNewSession ? true : false,
            levels,
        };
    });

    return {
        id: formData.id || '',
        new_course: false,
        course_name: formData.course || '',
        thumbnail_file_id: '',
        contain_levels: hasLevels || hasSessions,
        sessions,
        is_course_published_to_catalaouge: formData.publishToCatalogue,
        course_preview_image_media_id: '',
        course_banner_media_id: '',
        course_media_id: '',
        why_learn_html: formData.learningOutcome || '',
        who_should_learn_html: formData.targetAudience || '',
        about_the_course_html: formData.aboutCourse || '',
        tags: formData.tags || [],
        course_depth: formData.levelStructure || 2,
        course_html_description: formData.description || '',
    };
};

export function transformCourseData(course: CourseDetailsFormValues) {
    const sessions = course.courseData.sessions ?? [];

    // ── session helpers ──────────────────────────────────────────────────────────
    const hasAnySessions = sessions.length > 0;
    const sessNameDefault = sessions.some(
        (s) => (s.sessionDetails?.session_name ?? '').trim().toLowerCase() === 'default'
    );

    // ── level helpers ────────────────────────────────────────────────────────────
    const hasAnyLevels = sessions.some(
        (s) => Array.isArray(s.levelDetails) && s.levelDetails.length > 0
    );
    const levelNameDefault = sessions.some((s) =>
        (s.levelDetails ?? []).some((l) => (l.name ?? '').trim().toLowerCase() === 'default')
    );

    const hasSessions = hasAnySessions && !sessNameDefault ? 'yes' : 'no';
    const hasLevels = hasAnyLevels && !levelNameDefault ? 'yes' : 'no';

    return {
        id: course.courseData.id || '',
        course: course.courseData.packageName || course.courseData.title || '',
        description: course.courseData.description ?? '',
        learningOutcome: course.courseData.whatYoullLearn ?? '',
        aboutCourse: course.courseData.aboutTheCourse ?? '',
        targetAudience: course.courseData.whoShouldLearn ?? '',
        coursePreview: course.courseData.coursePreviewImageMediaId ?? '',
        courseBanner: course.courseData.courseBannerMediaId ?? '',
        courseMedia: JSON.stringify(course.courseData.courseMediaId) ?? '',
        tags: course.courseData.tags ?? [],
        levelStructure: course.courseData.courseStructure ?? 0,
        hasLevels,
        hasSessions,
        sessions: sessions.map((session) => ({
            id: session.sessionDetails?.id ?? '',
            name: session.sessionDetails?.session_name ?? '',
            startDate: session.sessionDetails?.start_date ?? '',
            levels: (session.levelDetails ?? []).map((level) => ({
                id: level.id,
                name: level.name,
                userIds: level.instructors.map((inst) => ({
                    id: inst.id,
                    name: inst.name,
                    email: inst.email,
                    profilePicId: inst.profilePicId,
                    roles: inst.roles,
                })),
            })),
        })),
        selectedInstructors: extractInstructors(sessions),
        instructors: [],
        publishToCatalogue: course.courseData.isCoursePublishedToCatalaouge ?? false,
    };
}

function extractInstructors(data: Session[]) {
    const instructorMap = new Map<string, Session>();

    for (const session of data) {
        const levels = session.levelDetails || [];
        for (const level of levels) {
            const instructors = level.instructors || [];
            for (const instructor of instructors) {
                if (!instructorMap.has(instructor.id)) {
                    instructorMap.set(instructor.id, {
                        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                        // @ts-expect-error
                        id: instructor.id,
                        name: instructor.name,
                        email: instructor.email,
                        profilePicId: instructor.profilePicId,
                        roles: instructor.roles,
                    });
                }
            }
        }
    }

    return Array.from(instructorMap.values());
}
