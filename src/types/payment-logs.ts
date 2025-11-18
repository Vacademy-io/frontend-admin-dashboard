export interface PaymentLog {
    id: string;
    status: string;
    payment_status: 'PAID' | 'FAILED' | 'PAYMENT_PENDING' | null;
    user_id: string;
    vendor: string;
    vendor_id: string;
    date: string;
    currency: string;
    payment_amount: number;
    payment_specific_data: string;
}

export interface UserPlan {
    id: string;
    user_id: string;
    payment_plan_id: string;
    applied_coupon_discount_id: string | null;
    enroll_invite_id: string;
    payment_option_id: string;
    status: string;
    created_at: string;
    updated_at: string;
}

export interface PaymentLogEntry {
    payment_log: PaymentLog;
    user_plan: UserPlan;
    current_payment_status: 'PAID' | 'FAILED' | 'NOT_INITIATED' | string;
}

export interface PaymentLogsResponse {
    content: PaymentLogEntry[];
    pageable: {
        pageNumber: number;
        pageSize: number;
        sort: {
            empty: boolean;
            sorted: boolean;
            unsorted: boolean;
        };
        offset: number;
        paged: boolean;
        unpaged: boolean;
    };
    total_pages: number;
    total_elements: number;
    last: boolean;
    size: number;
    number: number;
    sort: {
        empty: boolean;
        sorted: boolean;
        unsorted: boolean;
    };
    number_of_elements: number;
    first: boolean;
    empty: boolean;
}

export interface PaymentLogsRequest {
    institute_id: string;
    start_date_in_utc?: string;
    end_date_in_utc?: string;
    payment_statuses?: string[];
    user_plan_statuses?: string[];
    enroll_invite_ids?: string[];
    package_session_ids?: string[];
    sort_columns?: Record<string, string>;
}

export interface PackageSession {
    id: string;
    package_session_name: string;
    start_date: string;
    end_date?: string;
}

export interface DateRangeFilter {
    label: string;
    startDate: Date;
    endDate: Date;
}

// Institute batch for session structure
export interface BatchForSession {
    id: string; // This is the package_session_id
    level: {
        id: string;
        level_name: string;
        duration_in_days: number;
        thumbnail_id: string | null;
    };
    session: {
        id: string;
        session_name: string;
        status: string;
        start_date: string;
    };
    start_time: string | null;
    status: string;
    package_dto: {
        id: string;
        package_name: string;
        thumbnail_file_id: string;
        is_course_published_to_catalaouge: boolean;
        course_preview_image_media_id: string;
        course_banner_media_id: string;
        course_media_id: string;
        why_learn_html: string;
        who_should_learn_html: string;
        about_the_course_html: string;
        tags: string[];
        course_depth: number;
        course_html_description_html: string;
    };
    group: {
        id: string;
        group_name: string;
        parent_group: string | null;
        is_root: boolean | null;
        group_value: string;
    } | null;
    read_time_in_minutes: number;
}

export interface PackageSessionFilter {
    packageId?: string;
    sessionId?: string;
    levelId?: string;
    packageSessionId?: string;
}
