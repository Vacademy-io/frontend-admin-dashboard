import authenticatedAxiosInstance from '@/lib/auth/axiosInstance';
import {
    CREATE_INSTRUCTOR_COPILOT_LOG,
    DELETE_INSTRUCTOR_COPILOT_LOG,
    LIST_INSTRUCTOR_COPILOT_LOGS,
    UPDATE_INSTRUCTOR_COPILOT_LOG,
} from '@/constants/urls';

export interface InstructorCopilotLog {
    id: string;
    institute_id: string;
    created_by_user_id: string;
    title: string;
    thumbnail_file_id: string | null;
    transcript_json: string;
    flashnotes_json: string | null;
    summary: string | null;
    question_json: string | null;
    flashcard_json: string | null;
    slides_json: string | null;
    video_json: string | null;
    status: 'ACTIVE' | 'DELETED';
    created_at: string;
}

export interface CreateInstructorCopilotLogRequest {
    transcript_json: string;
    instituteId: string;
}

export interface UpdateInstructorCopilotLogRequest {
    title?: string;
    status?: 'ACTIVE' | 'DELETED';
}

export interface ListInstructorCopilotLogsParams {
    instituteId: string;
    status?: 'ACTIVE' | 'DELETED';
    startDate?: string;
    endDate?: string;
}

export const createInstructorCopilotLog = async (
    data: CreateInstructorCopilotLogRequest
): Promise<InstructorCopilotLog> => {
    const { instituteId, ...body } = data;
    const response = await authenticatedAxiosInstance.post(
        `${CREATE_INSTRUCTOR_COPILOT_LOG}?instituteId=${instituteId}`,
        body
    );
    return response.data;
};

export const listInstructorCopilotLogs = async (
    params: ListInstructorCopilotLogsParams
): Promise<InstructorCopilotLog[]> => {
    const response = await authenticatedAxiosInstance.get(LIST_INSTRUCTOR_COPILOT_LOGS, {
        params,
    });
    return response.data;
};

export const updateInstructorCopilotLog = async (
    id: string,
    data: UpdateInstructorCopilotLogRequest
): Promise<InstructorCopilotLog> => {
    const response = await authenticatedAxiosInstance.patch(
        UPDATE_INSTRUCTOR_COPILOT_LOG(id),
        data
    );
    return response.data;
};

export const deleteInstructorCopilotLog = async (id: string): Promise<void> => {
    await authenticatedAxiosInstance.delete(DELETE_INSTRUCTOR_COPILOT_LOG(id));
};
