import authenticatedAxiosInstance from '@/lib/auth/axiosInstance';
import { getTokenDecodedData, getTokenFromCookie } from '@/lib/auth/sessionUtility';
import { TokenKey } from '@/constants/auth/tokens';
import {
    TEACHER_MY_COURSES,
    TEACHER_CREATE_EDITABLE_COPY,
    TEACHER_SUBMIT_FOR_REVIEW,
    TEACHER_WITHDRAW_FROM_REVIEW,
    TEACHER_CAN_EDIT_COURSE,
    TEACHER_COURSE_HISTORY,
    ADMIN_PENDING_APPROVAL_COURSES,
    ADMIN_APPROVE_COURSE,
    ADMIN_REJECT_COURSE,
    ADMIN_COURSE_HISTORY,
    ADMIN_APPROVAL_SUMMARY,
} from '@/constants/urls';

// Helper to get user data from token
const getUserData = () => {
    const accessToken = getTokenFromCookie(TokenKey.accessToken);
    const tokenData = getTokenDecodedData(accessToken);
    return tokenData;
};

// Helper to get institute ID
const getInstituteId = () => {
    const tokenData = getUserData();
    return tokenData && Object.keys(tokenData.authorities)[0];
};

// Teacher APIs
export const getMyCourses = async () => {
    const instituteId = getInstituteId();
    const response = await authenticatedAxiosInstance.get(TEACHER_MY_COURSES, {
        params: {
            instituteId,
        },
        headers: {
            user: JSON.stringify({
                id: getUserData()?.user,
                role: 'TEACHER',
            }),
        },
    });
    return response.data;
};

export const createEditableCopy = async (originalCourseId: string) => {
    const response = await authenticatedAxiosInstance.post(TEACHER_CREATE_EDITABLE_COPY, null, {
        params: { originalCourseId },
        headers: {
            user: JSON.stringify({
                id: getUserData()?.user,
                role: 'TEACHER',
            }),
        },
    });
    return response.data;
};

export const submitForReview = async (courseId: string) => {
    const response = await authenticatedAxiosInstance.post(TEACHER_SUBMIT_FOR_REVIEW, null, {
        params: { courseId },
        headers: {
            user: JSON.stringify({
                id: getUserData()?.user,
                role: 'TEACHER',
            }),
        },
    });
    return response.data;
};

export const withdrawFromReview = async (courseId: string) => {
    const response = await authenticatedAxiosInstance.post(TEACHER_WITHDRAW_FROM_REVIEW, null, {
        params: { courseId },
        headers: {
            user: JSON.stringify({
                id: getUserData()?.user,
                role: 'TEACHER',
            }),
        },
    });
    return response.data;
};

export const canEditCourse = async (courseId: string) => {
    const response = await authenticatedAxiosInstance.get(
        `${TEACHER_CAN_EDIT_COURSE}/${courseId}`,
        {
            headers: {
                user: JSON.stringify({
                    id: getUserData()?.user,
                    role: 'TEACHER',
                }),
            },
        }
    );
    return response.data;
};

export const getMyCourseHistory = async (courseId: string) => {
    const response = await authenticatedAxiosInstance.get(`${TEACHER_COURSE_HISTORY}/${courseId}`, {
        headers: {
            user: JSON.stringify({
                id: getUserData()?.user,
                role: 'TEACHER',
            }),
        },
    });
    return response.data;
};

// Admin APIs
export const getAllPendingApprovalCourses = async () => {
    const instituteId = getInstituteId();
    const response = await authenticatedAxiosInstance.get(ADMIN_PENDING_APPROVAL_COURSES, {
        params: {
            instituteId,
        },
    });
    return response.data;
};

export const approveCourse = async (courseId: string, originalCourseId?: string) => {
    const params: Record<string, string> = { courseId };
    if (originalCourseId) {
        params.originalCourseId = originalCourseId;
    }

    const response = await authenticatedAxiosInstance.post(ADMIN_APPROVE_COURSE, null, { params });
    return response.data;
};

export const rejectCourse = async (courseId: string, reason: string) => {
    const response = await authenticatedAxiosInstance.post(ADMIN_REJECT_COURSE, null, {
        params: { courseId, reason },
    });
    return response.data;
};

export const getCourseHistory = async (courseId: string) => {
    const response = await authenticatedAxiosInstance.get(`${ADMIN_COURSE_HISTORY}/${courseId}`);
    return response.data;
};

export const getApprovalSummary = async () => {
    const response = await authenticatedAxiosInstance.get(ADMIN_APPROVAL_SUMMARY);
    return response.data;
};
