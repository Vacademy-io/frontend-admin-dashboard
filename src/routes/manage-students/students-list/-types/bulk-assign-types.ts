// ==================== REQUEST TYPES ====================

export interface AssignmentItem {
    package_session_id: string;
    enroll_invite_id?: string | null;
    payment_option_id?: string | null;
    plan_id?: string | null;
    access_days?: number | null;
}

export interface AssignOptions {
    duplicate_handling?: 'SKIP' | 'ERROR' | 'RE_ENROLL';
    notify_learners?: boolean;
    transaction_id?: string;
    dry_run?: boolean;
}

export interface BulkAssignRequest {
    institute_id: string;
    user_ids?: string[];
    assignments: AssignmentItem[];
    options?: AssignOptions;
}

export interface DeassignOptions {
    mode?: 'SOFT' | 'HARD';
    notify_learners?: boolean;
    dry_run?: boolean;
}

export interface BulkDeassignRequest {
    institute_id: string;
    user_ids?: string[];
    package_session_ids: string[];
    options?: DeassignOptions;
}

// ==================== RESPONSE TYPES ====================

export interface AssignResultItem {
    user_id: string | null;
    user_email: string | null;
    package_session_id: string;
    status: 'SUCCESS' | 'FAILED' | 'SKIPPED';
    action_taken: 'CREATED' | 'RE_ENROLLED' | 'NONE';
    mapping_id?: string;
    user_plan_id?: string;
    enroll_invite_id_used?: string;
    message?: string;
}

export interface BulkAssignResponse {
    dry_run: boolean;
    summary: {
        total_requested: number;
        successful: number;
        failed: number;
        skipped: number;
        re_enrolled: number;
    };
    results: AssignResultItem[];
}

export interface DeassignResultItem {
    user_id: string;
    user_email: string | null;
    package_session_id: string;
    status: 'SUCCESS' | 'FAILED' | 'SKIPPED';
    action_taken: 'SOFT_CANCELED' | 'HARD_TERMINATED' | 'NONE';
    user_plan_id?: string;
    message?: string;
    warning?: string;
}

export interface BulkDeassignResponse {
    dry_run: boolean;
    summary: {
        total_requested: number;
        successful: number;
        failed: number;
        skipped: number;
    };
    results: DeassignResultItem[];
}

// ==================== INVITE TYPES ====================

export interface PaymentPlan {
    id: string;
    name: string;
    actual_price: number;
    elevated_price: number;
    validity_in_days: number | null;
    status: string;
    tag: string | null;
}

export interface PaymentOption {
    id: string;
    name: string;
    status: string;
    type: string;
    tag: string | null;
    require_approval: boolean;
    payment_plans: PaymentPlan[];
}

export interface PackageSessionToPaymentOption {
    id: string;
    package_session_id: string;
    enroll_invite_id: string;
    status: string;
    payment_option: PaymentOption;
    cpo_id: string | null;
}

export interface EnrollInviteDTO {
    id: string;
    name: string;
    start_date: string | null;
    end_date: string | null;
    invite_code: string;
    status: string;
    institute_id: string;
    tag: string | null;
    learner_access_days: number | null;
    is_bundled: boolean;
    package_session_to_payment_options: PackageSessionToPaymentOption[];
}

export interface EnrollInviteProjection {
    id: string;
    name: string;
    start_date: string | null;
    end_date: string | null;
    invite_code: string;
    status: string;
    institute_id: string;
    tag: string | null;
    created_at: string;
    updated_at: string;
    short_url: string | null;
    package_session_ids: string[];
}
