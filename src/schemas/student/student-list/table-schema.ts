export interface StudentFilterRequest {
    name?: string;
    statuses?: string[];
    institute_ids?: string[];
    package_session_ids?: string[];
    group_ids?: string[];
    gender?: string[];
    session_expiry_days?: number[];
    sort_columns?: Record<string, string>;
}

// Response types
export interface StudentTable {
    id: string;
    username: string | null;
    user_id: string;
    email: string;
    full_name: string;
    address_line: string;
    region: string | null;
    city: string;
    pin_code: string;
    mobile_number: string;
    date_of_birth: string;
    gender: string;
    father_name: string;
    mother_name: string;
    parents_mobile_number: string;
    parents_email: string;
    linked_institute_name: string | null;
    created_at: string;
    updated_at: string;
    // //extra dummy
    // enrollment_no?: string;
    // school_name?: string;
    // guardian_name?: string;
    // state?: string;
    // session_expiry?: string;
    // status?: string;
    // batch_id?: string;
    // session_id?: string;
    package_session_id: string;
    institute_enrollment_id: string;
    status: "ACTIVE" | "TEMINATED";
    session_expiry_days: number;
    institute_id: string;
    expiry_date: number;
}

export interface StudentListResponse {
    content: StudentTable[];
    page_no: number;
    page_size: number;
    total_elements: number;
    total_pages: number;
    last: boolean;
}
