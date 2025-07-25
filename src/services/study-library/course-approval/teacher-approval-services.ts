import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import authenticatedAxiosInstance from '@/lib/auth/axiosInstance';
import { getInstituteId } from '@/constants/helper';
import { getTokenDecodedData, getTokenFromCookie } from '@/lib/auth/sessionUtility';
import { TokenKey } from '@/constants/auth/tokens';
import {
    TEACHER_MY_COURSES,
    TEACHER_CREATE_EDITABLE_COPY,
    TEACHER_SUBMIT_FOR_REVIEW,
    TEACHER_WITHDRAW_FROM_REVIEW,
    TEACHER_CAN_EDIT,
    TEACHER_COURSE_HISTORY,
} from '@/constants/urls';
import {
    TeacherCourse,
    TeacherCourseFilters,
    CreateEditableCopyRequest,
    CreateEditableCopyResponse,
    SubmitForReviewRequest,
    SubmitForReviewResponse,
    WithdrawFromReviewRequest,
    WithdrawFromReviewResponse,
    CanEditResponse,
    CourseHistoryEntry,
} from '@/types/course/course-approval';

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

// Query: Get teacher's courses
export const useTeacherCourses = (filters?: TeacherCourseFilters) => {
    const instituteId = getInstituteId();

    return useQuery({
        queryKey: ['teacher-courses', instituteId, filters],
        queryFn: async (): Promise<TeacherCourse[]> => {
            const params = new URLSearchParams();
            if (filters?.status?.length) {
                filters.status.forEach((status) => params.append('status', status));
            }
            if (filters?.search) params.append('search', filters.search);
            if (filters?.originalCourseId)
                params.append('originalCourseId', filters.originalCourseId);

            const queryString = params.toString();
            const url = queryString ? `${TEACHER_MY_COURSES}?${queryString}` : TEACHER_MY_COURSES;

            const response = await authenticatedAxiosInstance.get(url, {
                headers: getUserHeader(),
            });
            return response.data;
        },
        enabled: !!instituteId,
    });
};

// Query: Check if course can be edited
export const useCanEditCourse = (courseId: string) => {
    return useQuery({
        queryKey: ['can-edit-course', courseId],
        queryFn: async (): Promise<CanEditResponse> => {
            const response = await authenticatedAxiosInstance.get(
                `${TEACHER_CAN_EDIT}/${courseId}`,
                {
                    headers: getUserHeader(),
                }
            );
            return response.data;
        },
        enabled: !!courseId,
    });
};

// Query: Get course history
export const useTeacherCourseHistory = (courseId: string) => {
    return useQuery({
        queryKey: ['teacher-course-history', courseId],
        queryFn: async (): Promise<CourseHistoryEntry[]> => {
            const response = await authenticatedAxiosInstance.get(
                `${TEACHER_COURSE_HISTORY}/${courseId}`,
                {
                    headers: getUserHeader(),
                }
            );
            return response.data;
        },
        enabled: !!courseId,
    });
};

// Mutation: Create editable copy of published course
export const useCreateEditableCopy = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (
            request: CreateEditableCopyRequest
        ): Promise<CreateEditableCopyResponse> => {
            // Build query parameters
            const params = new URLSearchParams();
            params.append('originalCourseId', request.originalCourseId);

            const response = await authenticatedAxiosInstance.post(
                `${TEACHER_CREATE_EDITABLE_COPY}?${params.toString()}`,
                request,
                {
                    headers: getUserHeader(),
                }
            );
            return response.data;
        },
        onSuccess: () => {
            // Invalidate teacher courses to refresh the list
            queryClient.invalidateQueries({ queryKey: ['teacher-courses'] });
            queryClient.invalidateQueries({ queryKey: ['GET_INIT_STUDY_LIBRARY'] });
        },
    });
};

// Mutation: Submit course for review
export const useSubmitForReview = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (request: SubmitForReviewRequest): Promise<SubmitForReviewResponse> => {
            // Include courseId as query parameter as well as in the request body
            const url = `${TEACHER_SUBMIT_FOR_REVIEW}?courseId=${request.courseId}`;

            const response = await authenticatedAxiosInstance.post(url, request, {
                headers: {
                    ...getUserHeader(),
                    'content-type': 'application/json',
                },
            });
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['teacher-courses'] });
            queryClient.invalidateQueries({ queryKey: ['can-edit-course'] });
        },
    });
};

// Mutation: Withdraw course from review
export const useWithdrawFromReview = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (
            request: WithdrawFromReviewRequest
        ): Promise<WithdrawFromReviewResponse> => {
            const response = await authenticatedAxiosInstance.post(
                TEACHER_WITHDRAW_FROM_REVIEW,
                request,
                {
                    headers: getUserHeader(),
                }
            );
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['teacher-courses'] });
            queryClient.invalidateQueries({ queryKey: ['can-edit-course'] });
        },
    });
};

// Utility function to get course status badge color
export const getCourseStatusBadgeColor = (status: string) => {
    switch (status) {
        case 'DRAFT':
            return 'bg-neutral-100 text-neutral-700';
        case 'IN_REVIEW':
            return 'bg-warning-100 text-warning-700';
        case 'APPROVED':
            return 'bg-success-100 text-success-700';
        case 'REJECTED':
            return 'bg-danger-100 text-danger-700';
        case 'ACTIVE':
            return 'bg-primary-100 text-primary-700';
        default:
            return 'bg-neutral-100 text-neutral-700';
    }
};

// Utility function to get course status label
export const getCourseStatusLabel = (status: string) => {
    switch (status) {
        case 'DRAFT':
            return 'Draft';
        case 'IN_REVIEW':
            return 'In Review';
        case 'APPROVED':
            return 'Approved';
        case 'REJECTED':
            return 'Rejected';
        case 'ACTIVE':
            return 'Published';
        default:
            return status;
    }
};
