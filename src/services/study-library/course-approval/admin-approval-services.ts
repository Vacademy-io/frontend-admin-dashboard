import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import authenticatedAxiosInstance from '@/lib/auth/axiosInstance';
import { getInstituteId } from '@/constants/helper';
import { getTokenDecodedData, getTokenFromCookie } from '@/lib/auth/sessionUtility';
import { TokenKey } from '@/constants/auth/tokens';
import {
    ADMIN_PENDING_REVIEW,
    ADMIN_APPROVE_COURSE,
    ADMIN_REJECT_COURSE,
    ADMIN_COURSE_HISTORY,
    ADMIN_APPROVAL_SUMMARY,
    GET_COURSE_DETAILS_FOR_REVIEW,
} from '@/constants/urls';
import {
    AdminApprovalCourse,
    AdminApprovalFilters,
    ApproveRejectRequest,
    ApproveRejectResponse,
    CourseHistoryEntry,
    ApprovalSummary,
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
    const role = authority?.roles?.[0] || 'ADMIN'; // Default to ADMIN

    return {
        user: JSON.stringify({
            id: tokenData.user,
            role: role,
        }),
    };
};

// Query: Get courses pending admin review
export const useCoursesForReview = (filters?: AdminApprovalFilters) => {
    const instituteId = getInstituteId();

    return useQuery({
        queryKey: ['admin-pending-review', instituteId, filters],
        queryFn: async (): Promise<AdminApprovalCourse[]> => {
            const params = new URLSearchParams();

            if (filters?.createdByUserId) params.append('createdByUserId', filters.createdByUserId);
            if (filters?.status?.length) {
                filters.status.forEach((status) => params.append('status', status));
            }
            if (filters?.search) params.append('search', filters.search);
            if (filters?.dateRange?.start) params.append('startDate', filters.dateRange.start);
            if (filters?.dateRange?.end) params.append('endDate', filters.dateRange.end);

            if (instituteId) params.append('instituteId', instituteId);

            const queryString = params.toString();
            const url = queryString
                ? `${ADMIN_PENDING_REVIEW}?${queryString}`
                : ADMIN_PENDING_REVIEW;

            const userHeader = getUserHeader();
            const response = await authenticatedAxiosInstance.get(url, {
                headers: userHeader,
            });
            return response.data;
        },
        enabled: !!instituteId,
    });
};

// Query: Get course history for admin
export const useAdminCourseHistory = (courseId: string) => {
    return useQuery({
        queryKey: ['admin-course-history', courseId],
        queryFn: async (): Promise<CourseHistoryEntry[]> => {
            const userHeader = getUserHeader();
            const response = await authenticatedAxiosInstance.get(
                `${ADMIN_COURSE_HISTORY}/${courseId}`,
                {
                    headers: userHeader,
                }
            );
            return response.data;
        },
        enabled: !!courseId,
    });
};

// Query: Get approval summary dashboard
export const useApprovalSummary = () => {
    const instituteId = getInstituteId();

    return useQuery({
        queryKey: ['admin-approval-summary', instituteId],
        queryFn: async (): Promise<ApprovalSummary> => {
            const userHeader = getUserHeader();
            const response = await authenticatedAxiosInstance.get(
                `${ADMIN_APPROVAL_SUMMARY}` + `?instituteId=${instituteId}`,
                {
                    headers: userHeader,
                }
            );
            return response.data;
        },
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
};

// Mutation: Approve course
export const useApproveCourse = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (request: ApproveRejectRequest): Promise<ApproveRejectResponse> => {
            const userHeader = getUserHeader();

            // Build query parameters
            const params = new URLSearchParams();
            params.append('courseId', request.courseId);
            if (request.originalCourseId) {
                params.append('originalCourseId', request.originalCourseId);
            }

            const response = await authenticatedAxiosInstance.post(
                `${ADMIN_APPROVE_COURSE}?${params.toString()}`,
                request,
                {
                    headers: userHeader,
                }
            );
            return response.data;
        },
        onSuccess: () => {
            // Invalidate all related queries
            queryClient.invalidateQueries({ queryKey: ['admin-pending-review'] });
            queryClient.invalidateQueries({ queryKey: ['admin-approval-summary'] });
            queryClient.invalidateQueries({ queryKey: ['teacher-courses'] });
            queryClient.invalidateQueries({ queryKey: ['GET_INIT_STUDY_LIBRARY'] });
            queryClient.invalidateQueries({ queryKey: ['GET_INIT_INSTITUTE'] });
        },
    });
};

// Mutation: Reject course
export const useRejectCourse = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (request: ApproveRejectRequest): Promise<ApproveRejectResponse> => {
            if (!request.reason) {
                throw new Error('Rejection reason is required');
            }

            const userHeader = getUserHeader();

            // Build query parameters
            const params = new URLSearchParams();
            params.append('courseId', request.courseId);
            if (request.originalCourseId) {
                params.append('originalCourseId', request.originalCourseId);
            }

            const response = await authenticatedAxiosInstance.post(
                `${ADMIN_REJECT_COURSE}?${params.toString()}`,
                request,
                {
                    headers: userHeader,
                }
            );
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-pending-review'] });
            queryClient.invalidateQueries({ queryKey: ['admin-approval-summary'] });
            queryClient.invalidateQueries({ queryKey: ['teacher-courses'] });
        },
    });
};

// Utility function to get approval action badge color
export const getApprovalActionBadgeColor = (action: string) => {
    switch (action) {
        case 'CREATED':
            return 'bg-neutral-100 text-neutral-700';
        case 'SUBMITTED':
            return 'bg-blue-100 text-blue-700';
        case 'APPROVED':
            return 'bg-success-100 text-success-700';
        case 'REJECTED':
            return 'bg-danger-100 text-danger-700';
        case 'WITHDRAWN':
            return 'bg-warning-100 text-warning-700';
        default:
            return 'bg-neutral-100 text-neutral-700';
    }
};

// Utility function to format approval action label
export const getApprovalActionLabel = (action: string) => {
    switch (action) {
        case 'CREATED':
            return 'Created';
        case 'SUBMITTED':
            return 'Submitted for Review';
        case 'APPROVED':
            return 'Approved';
        case 'REJECTED':
            return 'Rejected';
        case 'WITHDRAWN':
            return 'Withdrawn from Review';
        default:
            return action;
    }
};

// Utility function to check if course is urgently pending
export const isUrgentlyPending = (submittedAt: string, daysThreshold: number = 3): boolean => {
    const submitted = new Date(submittedAt);
    const now = new Date();
    const daysSinceSubmission = (now.getTime() - submitted.getTime()) / (1000 * 60 * 60 * 24);
    return daysSinceSubmission >= daysThreshold;
};

// Query: Get course details for review (including courses in any status)
export const useCourseDetailsForReview = (courseId: string, enabled: boolean = true) => {
    const instituteId = getInstituteId();

    return useQuery({
        queryKey: ['course-details-for-review', courseId, instituteId],
        queryFn: async () => {
            const userHeader = getUserHeader();
            const response = await authenticatedAxiosInstance.get(
                `${GET_COURSE_DETAILS_FOR_REVIEW}/${courseId}`,
                {
                    params: { instituteId },
                    headers: userHeader,
                }
            );
            return response.data;
        },
        enabled: enabled && !!courseId,
        staleTime: 2 * 60 * 1000, // 2 minutes
    });
};
