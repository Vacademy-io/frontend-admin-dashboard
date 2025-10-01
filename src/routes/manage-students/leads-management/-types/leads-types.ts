import { MyFilterOption } from '@/types/assessments/my-filter';

export interface LeadsManagementInterface {
    name: string;
    statuses: string[];
    institute_ids: string[];
    package_session_ids: string[];
    destination_package_session_ids: string[];
    group_ids: string[];
    gender: MyFilterOption[];
    preferred_batch: MyFilterOption[];
    payment_statuses: string[];
    approval_statuses: string[];
    payment_option: string[];
    custom_fields: MyFilterOption[];
    sort_columns: {
        [key: string]: string;
    };
    sources: string[];
    types: string[];
    type_ids: string[];
}

export interface LeadTable {
    id: string;
    user_id: string;
    username: string;
    email: string;
    full_name: string;
    mobile_number: string | null;
    linked_institute_name: string | null;
    created_at: string;
    updated_at: string;
    face_file_id: string | null;
    password: string;
    institute_enrollment_number: string;
    institute_id: string;
    destination_package_session_id: string;
    source: string;
    type: string;
    type_id: string;
}

export interface LeadsListResponse {
    content: LeadTable[];
    total_pages: number;
    page_no: number;
    page_size: number;
    total_elements: number;
    last: boolean;
}
