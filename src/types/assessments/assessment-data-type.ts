export interface Instructions {
    id: string;
    type: string;
    content: string;
}

interface AccessControl {
    batch_ids: string[] | null;
    roles: string[] | null;
    user_ids: string[];
}

interface RegistrationFormField {
    id: string;
    fieldName: string;
    fieldKey: string;
    commaSeparatedOptions: string;
    status: string;
    isMandatory: boolean;
    fieldType: string;
    createdAt: string;
    updatedAt: string;
}

interface PreBatchRegistration {
    id: string;
    batchId: string;
    instituteId: string;
    registrationTime: string;
    status: string;
    createdAt: string;
    updatedAt: string;
}

export interface SavedData {
    instructions: Instructions;
    reattempt_consent: boolean;
    evaluation_type: string;
    assessment_id: string;
    assessment_visibility: string;
    expected_participants: string | null;
    duration_distribution: "ASSESSMENT" | "QUESTION" | "SECTION";
    omr_mode: string | null;
    boundation_end_date: string;
    assessment_url: string;
    duration: number;
    boundation_start_date: string;
    can_switch_section: boolean;
    add_time_consent: boolean;
    submission_type: string;
    subject_selection: string;
    assessment_mode: string;
    name: string;
    reattempt_count: number | null;
    assessment_preview: number;
    sections?: Section[];
    creation_access: AccessControl;
    report_and_submission_access: AccessControl;
    live_assessment_access: AccessControl;
    evaluation_access: AccessControl;
    pre_user_registrations: number;
    registration_form_fields: RegistrationFormField[];
    registration_open_date: string | null;
    pre_batch_registrations: PreBatchRegistration[];
    registration_close_date: string | null;
}

export interface Section {
    id: string;
    name: string;
    description: {
        id: string;
        type: string;
        content: string;
    } | null;
    section_type: string | null;
    duration: number;
    total_marks: number;
    cutoff_marks: number;
    section_order: number;
    problem_randomization: boolean | null | string;
    partial_marking: boolean | null;
    created_at: string; // ISO date string
    updated_at: string; // ISO date string
}

export interface SectionsResponse {
    sections: Section[];
}

interface StepKey {
    [key: string]: "REQUIRED" | "OPTIONAL" | "";
}

interface DefaultValue {
    key: string;
    value: string;
    value_id: string | null;
    send_value_id: boolean;
}

interface FieldOption {
    key: string;
    value: string;
    value_id: string | null;
    send_value_id: boolean;
}

interface StepData {
    step_name: string;
    status: string;
    institute_id: string | null;
    type: string;
    saved_data: SavedData;
    step_keys: StepKey[];
    default_values?: Record<string, DefaultValue>;
    field_options?: Record<string, FieldOption[]>;
}

export interface ConvertedCustomField {
    name: string;
    type: string;
    default_value: string;
    description: string;
    is_mandatory: boolean;
    key: string;
    comma_separated_options: string;
}

// Assuming customFields is an object where keys are strings and values are the custom field details
export type CustomFields = {
    type: string;
    name: string;
    oldKey: boolean;
    isRequired: boolean;
    options?: { id: number; value: string }[];
    default_value?: string;
    description?: string;
    key?: string;
    is_mandatory?: boolean;
}[];

export type Steps = StepData[];
