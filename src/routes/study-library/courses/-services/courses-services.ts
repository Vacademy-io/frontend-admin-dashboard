import { getInstituteId } from '@/constants/helper';
import { AllCourseFilters } from '../-components/course-material';
import authenticatedAxiosInstance from '@/lib/auth/axiosInstance';
import { COURSE_CATALOG_TEACHER_URL, COURSE_CATALOG_URL, TEACHER_MY_COURSES } from '@/constants/urls';
import { getTokenDecodedData, getTokenFromCookie } from '@/lib/auth/sessionUtility';
import { TokenKey } from '@/constants/auth/tokens';

// Helper function to get user header for API calls
const getUserHeader = () => {
    const accessToken = getTokenFromCookie(TokenKey.accessToken);
    const tokenData = getTokenDecodedData(accessToken);
    const instituteId = getInstituteId();

    if (!tokenData || !instituteId) {
        return {};
    }

    // Get user role for the current institute
    const authority = tokenData.authorities?.[instituteId];
    const role = authority?.roles?.[0] || 'TEACHER'; // Default to TEACHER

    return {
        user: JSON.stringify({
            id: tokenData.user,
            role: role,
        }),
    };
};

export const fetchCourseDetails = async (courseId: string) => {
    const instituteId = getInstituteId();
    // Replace with your actual API endpoint
    const response = await fetch(`/api/institutes/${instituteId}/courses/${courseId}`);
    if (!response.ok) {
        throw new Error('Failed to fetch course details');
    }
    return response.json();
};

// Get user's authored courses using my-courses API
export const getMyAuthoredCourses = async (
    page: number,
    pageSize: number,
    statusFilters?: string[]
) => {
    try {
        const params = new URLSearchParams();
        if (statusFilters?.length) {
            statusFilters.forEach((status) => params.append('status', status));
        }

        const queryString = params.toString();
        const url = queryString ? `${TEACHER_MY_COURSES}?${queryString}` : TEACHER_MY_COURSES;

        const response = await authenticatedAxiosInstance.get(url, {
            headers: getUserHeader(),
        });

        // Transform the response to match the expected format
        const courses = response.data || [];

        // Debug logging to see what courses are returned
        console.log('API URL:', url);
        console.log('Status filters:', statusFilters);
        console.log('Returned courses:', courses.length);
        console.log('Course statuses:', courses.map((c: any) => ({ id: c.id, name: c.packageName, status: c.status })));

        return {
            content: courses.map((course: any) => ({
                id: course.id,
                package_name: course.packageName,
                status: course.status,
                description: course.description || '',
                instructors: course.instructors || [],
                course_preview_image_media_id: course.coursePreviewImageMediaId || '',
                course_banner_media_id: course.courseBannerMediaId || '',
                thumbnail_file_id: course.thumbnailFileId || '',
                level_name: course.level_name || '',
                rating: course.rating || 0,
                percentage_completed: course.percentage_completed || 0,
                originalCourseId: course.originalCourseId || null,
                createdAt: course.createdAt || new Date().toISOString(),
                updatedAt: course.updatedAt || new Date().toISOString(),
                courseDepth: course.courseDepth || 0,
                courseHtmlDescription: course.courseHtmlDescription || course.aboutTheCourse || '',
                comma_separeted_tags: course.tags || '',
                // Add other required fields with defaults
                is_course_published_to_catalaouge: course.isCoursePublishedToCatalaouge || false,
                course_media_id: course.courseMediaId || '',
                why_learn_html: course.whyLearn || '',
                who_should_learn_html: course.whoShouldLearn || '',
                about_the_course_html: course.aboutTheCourse || '',
                course_depth: course.courseDepth || 0,
                course_html_description_html: course.courseHtmlDescription || '',
                package_session_id: '',
                level_id: '',
                course_name: course.packageName,
            })),
            totalElements: courses.length,
            totalPages: 1,
            pageable: {},
            numberOfElements: courses.length,
            size: pageSize,
            number: page,
            sort: {},
            first: page === 0,
            last: true,
            empty: courses.length === 0,
        };
    } catch (error: unknown) {
        throw new Error(`${error}`);
    }
};

export const getAllCoursesWithFilters = async (
    page: number,
    pageSize: number,
    instituteId: string | undefined,
    data: AllCourseFilters
) => {
    try {
        const response = await authenticatedAxiosInstance({
            method: 'POST',
            url: `${COURSE_CATALOG_URL}`,
            params: {
                instituteId,
                page,
                size: pageSize,
            },
            data,
        });
        return response?.data;
    } catch (error: unknown) {
        throw new Error(`${error}`);
    }
};

export const getAllTeacherCoursesWithFilters = async (
    page: number,
    pageSize: number,
    instituteId: string | undefined,
    data: AllCourseFilters
) => {
    try {
        const response = await authenticatedAxiosInstance({
            method: 'POST',
            url: `${COURSE_CATALOG_TEACHER_URL}`,
            params: {
                instituteId,
                page,
                size: pageSize,
            },
            data,
        });
        return response?.data;
    } catch (error: unknown) {
        throw new Error(`${error}`);
    }
};
