export type MembershipStatus = 'ENDED' | 'ABOUT_TO_END' | 'LIFETIME';

export interface MembershipFilterDTO {
    start_date_in_utc?: string;
    end_date_in_utc?: string;
    membership_statuses?: MembershipStatus[];
    package_session_ids?: string[];
    institute_id: string;
    sort_order?: Record<string, 'asc' | 'desc'>;
}

export interface UserDTO {
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
    is_root_user: boolean;
    profile_pic_file_id: string;
    roles: string[];
    last_login_time: string;
}

export interface UserPlanDTO {
    id: string;
    user_id: string;
    payment_plan_id: string;
    plan_json: string | null;
    status: string;
    start_date: string;
    end_date: string;
    // Add other fields as needed from JSON
    payment_plan_dto?: {
        name: string;
        duration_months: number;
    };
}

export interface MembershipDetail {
    user_plan: UserPlanDTO;
    user_details: UserDTO;
    membership_status: MembershipStatus;
    calculated_end_date: string;
    package_sessions?: Array<{
        session_name: string;
        package_name: string;
        level_name: string;
    }>;
}

export interface MembershipDetailsResponse {
    content: MembershipDetail[];
    pageable: any;
    totalPages: number;
    totalElements: number;
    last: boolean;
    first: boolean;
    size: number;
    number: number;
    sort: any;
    numberOfElements: number;
    empty: boolean;
}
