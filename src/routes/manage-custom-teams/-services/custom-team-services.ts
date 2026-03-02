import authenticatedAxiosInstance from '@/lib/auth/axiosInstance';
import {
    GRANT_USER_ACCESS,
    GET_ALL_FACULTY_V2,
    CREATE_SUB_ORG,
    GET_ALL_SETTINGS,
    SAVE_GENERIC_SETTING,
    ROLES_BASE,
    INVITE_USERS_URL,
    GET_SUB_ORGS,
} from '@/constants/urls';
import { getCurrentInstituteId } from '@/lib/auth/instituteUtils';

export interface GrantUserAccessRequest {
    user_id: string;
    package_session_id?: string;
    subject_id?: string;
    status: 'ACTIVE' | 'INACTIVE';
    name: string;
    user_type: string;
    type_id: string;
    access_type: string;
    access_id: string;
    access_permission: string;
    linkage_type: 'DIRECT' | 'INHERITED' | 'PARTNERSHIP';
    suborg_id?: string;
}

export interface FacultyFilterRequest {
    name?: string;
    subjects?: string[];
    batches?: string[];
    status?: string[];
    sortColumns?: Record<string, 'ASC' | 'DESC'>;
    pageNo?: number;
    pageSize?: number;
}

export interface CreateSubOrgRequest {
    institute_name: string;
    email: string;
    phone: string;
    description?: string;
    institute_logo_file_id?: string;
}

export interface CustomRole {
    id: string;
    name: string;
    permissions: string[]; // IDs of permissions
}

/** Request body for POST /institute/{instituteId}/roles (Create) and PUT .../roles/{roleId} (Update) */
export interface CreateRoleDTO {
    name: string;
    permissionIds: string[];
}

export interface AssignFacultyRequest {
    user: {
        fullName: string;
        email: string;
        mobileNumber: string;
        countryCode?: string;
    };
    isNewUser: boolean;
    batchSubjectMappings?: Array<{
        batchId: string;
        subjectIds: string[];
    }>;
}

export interface InviteUserRequest {
    email: string;
    full_name: string;
    roles: string[];
    root_user: boolean;
}

export const inviteUser = async (data: InviteUserRequest) => {
    const instituteId = getCurrentInstituteId();
    const response = await authenticatedAxiosInstance({
        method: 'POST',
        url: INVITE_USERS_URL,
        params: { instituteId },
        data,
    });
    return response.data;
};

export const assignFacultyToSubjectsAndBatches = async (data: AssignFacultyRequest) => {
    const instituteId = getCurrentInstituteId();
    const response = await authenticatedAxiosInstance({
        method: 'POST',
        url: INVITE_USERS_URL,
        params: { instituteId },
        data,
    });
    return response.data;
};

export const grantUserAccess = async (data: GrantUserAccessRequest) => {
    const response = await authenticatedAxiosInstance({
        method: 'POST',
        url: GRANT_USER_ACCESS,
        data,
    });
    return response.data;
};

export const getAllFacultyV2 = async (filters: FacultyFilterRequest) => {
    const instituteId = getCurrentInstituteId();
    const response = await authenticatedAxiosInstance({
        method: 'POST',
        url: GET_ALL_FACULTY_V2,
        params: {
            instituteId,
            pageNo: filters.pageNo || 0,
            pageSize: filters.pageSize || 10,
        },
        data: {
            name: filters.name,
            subjects: filters.subjects,
            batches: filters.batches,
            status: filters.status,
            sortColumns: filters.sortColumns,
        },
    });
    return response.data;
};

export const createSubOrg = async (data: CreateSubOrgRequest) => {
    const parentInstituteId = getCurrentInstituteId();
    const response = await authenticatedAxiosInstance({
        method: 'POST',
        url: CREATE_SUB_ORG,
        params: { parentInstituteId },
        data,
    });
    return response.data;
};

export const getSubOrgs = async (parentInstituteId?: string) => {
    const id = parentInstituteId || getCurrentInstituteId();
    const response = await authenticatedAxiosInstance({
        method: 'GET',
        url: GET_SUB_ORGS,
        params: { parentInstituteId: id },
    });
    return response.data;
};

export const getAllRoles = async () => {
    const instituteId = getCurrentInstituteId();
    const response = await authenticatedAxiosInstance({
        method: 'GET',
        url: `${ROLES_BASE}/${instituteId}/roles`,
    });
    return response.data;
};

export const createCustomRole = async (payload: CreateRoleDTO) => {
    const instituteId = getCurrentInstituteId();
    const response = await authenticatedAxiosInstance({
        method: 'POST',
        url: `${ROLES_BASE}/${instituteId}/roles`,
        data: payload,
    });
    return response.data;
};

export const updateCustomRole = async (roleId: string, payload: CreateRoleDTO) => {
    const instituteId = getCurrentInstituteId();
    const response = await authenticatedAxiosInstance({
        method: 'PUT',
        url: `${ROLES_BASE}/${instituteId}/roles/${roleId}`,
        data: payload,
    });
    return response.data;
};

export const deleteCustomRole = async (roleId: string) => {
    const instituteId = getCurrentInstituteId();
    const response = await authenticatedAxiosInstance({
        method: 'DELETE',
        url: `${ROLES_BASE}/${instituteId}/roles/${roleId}`,
    });
    return response.data;
};
