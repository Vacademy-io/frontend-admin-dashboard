import { CourseDetailsFormValues } from '@/routes/study-library/courses/course-details/-components/course-details-schema';
import { Step1Data, Step2Data } from '../add-course/add-course-form';
import { Session } from '@/types/course/create-course';
import { useInstituteDetailsStore } from '@/stores/students/students-list/useInstituteDetailsStore';

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
    const hasLevels = formData.hasLevels === 'yes';
    const hasSessions = formData.hasSessions === 'yes';

    // Function to format levels
    const formatLevels = (
        levels: Array<{
            id: string;
            name: string;
            userIds: { id: string; name: string; email: string; profilePicId: string }[];
        }>
    ): FormattedLevel[] =>
        levels?.map((level) => ({
            id: '',
            new_level: true,
            level_name: level.name,
            duration_in_days: 0,
            thumbnail_file_id: '',
            package_id: '',
            add_faculty_to_course: level?.userIds?.map((user) => ({
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
            })),
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
        const allUsers = formData.instructors; // Instructor[]

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
                        add_faculty_to_course: Array.isArray(allUsers)
                            ? allUsers?.map((user) => ({
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
                              }))
                            : [],
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
        sessions = formData?.sessions?.map((session) => ({
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
                          add_faculty_to_course: session.levels[0]?.userIds
                              ? session.levels[0]?.userIds?.map((user) => ({
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
                                }))
                              : [],
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
        // When only hasLevels is true, keep userIds in their respective levels but in default session
        const standaloneLevels = formData.sessions.find((s) => s.id === 'standalone')?.levels || [];
        sessions = [
            {
                id: 'DEFAULT',
                session_name: 'DEFAULT',
                status: 'ACTIVE',
                start_date: '',
                new_session: true,
                levels: standaloneLevels?.map((level) => ({
                    id: '',
                    new_level: true,
                    level_name: level.name,
                    duration_in_days: 0,
                    thumbnail_file_id: '',
                    package_id: '',
                    add_faculty_to_course: Array.isArray(level.userIds)
                        ? level?.userIds?.map((user) => ({
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
                          }))
                        : [],
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
        course_media_id: formData.courseMedia || '',
        why_learn_html: formData.learningOutcome || '',
        who_should_learn_html: formData.targetAudience || '',
        about_the_course_html: formData.aboutCourse || '',
        tags: formData.tags || [],
        course_depth: formData.levelStructure || 2,
        course_html_description: formData.description || '',
    };
};

export const convertToApiCourseFormatUpdate = (
    formData: CourseFormData,
    getPackageSessionId: any
): FormattedCourseData => {
    const hasLevels = formData.hasLevels === 'yes';
    const hasSessions = formData.hasSessions === 'yes';

    // Function to format levels
    const formatLevels = (
        sessionId: string,
        levels: Array<{
            id: string;
            name: string;
            userIds: { id: string; name: string; email: string; profilePicId: string }[];
        }>
    ): FormattedLevel[] =>
        levels?.map((level) => ({
            id: level.id,
            new_level: false,
            level_name: level.name,
            duration_in_days: 0,
            thumbnail_file_id: '',
            package_id: '',
            package_session_status: 'ACTIVE',
            package_session_id:
                getPackageSessionId({
                    courseId: formData.id,
                    levelId: level.id,
                    sessionId: sessionId || '',
                }) || '',
            add_faculty_to_course: level?.userIds?.map((user) => ({
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
            })),
            group: {
                id: '',
                group_name: '',
                group_value: '',
                new_group: false,
            },
        }));

    // Determine sessions structure
    let sessions: FormattedSession[] = [];
    if (!hasLevels && !hasSessions) {
        // When both are false, all selected instructors go to default level in default session
        const allUsers = formData.instructors; // Instructor[]

        sessions = [
            {
                id: 'DEFAULT',
                session_name: 'DEFAULT',
                status: 'ACTIVE',
                start_date: '',
                new_session: false,
                levels: [
                    {
                        id: 'DEFAULT',
                        new_level: false,
                        level_name: 'DEFAULT',
                        duration_in_days: 0,
                        thumbnail_file_id: '',
                        package_id: '',
                        package_session_status: '',
                        package_session_id:
                            getPackageSessionId({
                                courseId: formData.id,
                                levelId: 'DEFAULT',
                                sessionId: 'DEFAULT',
                            }) || '',
                        add_faculty_to_course: Array.isArray(allUsers)
                            ? allUsers?.map((user) => ({
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
                              }))
                            : [],
                        group: {
                            id: 'DEFAULT',
                            group_name: 'DEFAULT',
                            group_value: '',
                            new_group: false,
                        },
                    },
                ],
            },
        ];
    } else if (hasSessions) {
        sessions = formData?.sessions?.map((session) => ({
            id: session.id,
            session_name: session.name,
            status: 'ACTIVE',
            start_date: session.startDate,
            new_session: false,
            levels: hasLevels
                ? formatLevels(session.id, session.levels)
                : [
                      {
                          id: 'DEFAULT',
                          new_level: false,
                          level_name: 'DEFAULT',
                          duration_in_days: 0,
                          thumbnail_file_id: '',
                          package_id: '',
                          package_session_id:
                              getPackageSessionId({
                                  courseId: formData.id,
                                  levelId: 'DEFAULT',
                                  sessionId: session.id,
                              }) || '',
                          add_faculty_to_course: session.levels[0]?.userIds
                              ? session.levels[0]?.userIds?.map((user) => ({
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
                                }))
                              : [],
                          group: {
                              id: 'DEFAULT',
                              group_name: 'DEFAULT',
                              group_value: '',
                              new_group: false,
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
                session_name: 'DEFAULT',
                status: 'ACTIVE',
                start_date: '',
                new_session: false,
                levels: standaloneLevels?.map((level) => ({
                    id: level.id,
                    new_level: false,
                    level_name: level.name,
                    duration_in_days: 0,
                    thumbnail_file_id: '',
                    package_id: '',
                    package_session_status: '',
                    package_session_id:
                        getPackageSessionId({
                            courseId: formData.id,
                            levelId: level.id,
                            sessionId: 'DEFAULT',
                        }) || '',
                    add_faculty_to_course: Array.isArray(level.userIds)
                        ? level?.userIds?.map((user) => ({
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
                          }))
                        : [],
                    group: {
                        id: '',
                        group_name: '',
                        group_value: '',
                        new_group: false,
                    },
                })),
            },
        ];
    }

    return {
        id: formData.id || '',
        new_course: false,
        course_name: formData.course || '',
        thumbnail_file_id: '',
        contain_levels: hasLevels || hasSessions,
        sessions,
        is_course_published_to_catalaouge: formData.publishToCatalogue,
        course_preview_image_media_id: formData.coursePreview || '',
        course_banner_media_id: formData.courseBanner || '',
        course_media_id: formData.courseMedia || '',
        why_learn_html: formData.learningOutcome || '',
        who_should_learn_html: formData.targetAudience || '',
        about_the_course_html: formData.aboutCourse || '',
        tags: formData.tags || [],
        course_depth: formData.levelStructure || 2,
        course_html_description: formData.description || '',
    };
};

export function transformCourseData(course: CourseDetailsFormValues) {
    const sessions = course.courseData.sessions || [];

    const hasLevels = sessions.some(
        (session) => Array.isArray(session.levelDetails) && session.levelDetails.length > 0
    )
        ? 'yes'
        : 'no';
    return {
        id: course.courseData.id || '',
        course: course.courseData.packageName || course.courseData.title || '',
        description: course.courseData.description ?? '',
        learningOutcome: course.courseData.whatYoullLearn ?? '',
        aboutCourse: course.courseData.aboutTheCourse ?? '',
        targetAudience: course.courseData.whoShouldLearn ?? '',
        coursePreview: course.courseData.coursePreviewImageMediaId ?? '',
        courseBanner: course.courseData.courseBannerMediaId ?? '',
        courseMedia: course.courseData.courseMediaId ?? '',
        tags: course.courseData.tags ?? [],
        levelStructure: course.courseData.courseStructure ?? 0,
        hasLevels,
        hasSessions:
            Array.isArray(course.courseData.sessions) && course.courseData.sessions.length > 0
                ? 'yes'
                : 'no',
        sessions: (course.courseData.sessions || []).map((session) => ({
            id: session.sessionDetails?.id ?? '',
            name: session.sessionDetails?.session_name ?? '',
            startDate: session.sessionDetails?.start_date ?? '',
            levels: (session.levelDetails || []).map((level) => ({
                id: level.id,
                name: level.name,
                userIds: level.instructors.map((inst) => ({
                    id: inst.id,
                    name: inst.name,
                    email: inst.email,
                    profilePicId: inst.profilePicId,
                })),
            })),
        })),
        selectedInstructors: extractInstructors(course.courseData.sessions), // No data available in input
        instructors: [], // No data available in input
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
                    });
                }
            }
        }
    }

    return Array.from(instructorMap.values());
}
