interface Instructions {
    id: string;
    type: string;
    content: string;
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
}

export interface Section {
    id: string;
    name: string;
    description: string | null;
    section_type: string | null;
    duration: number;
    total_marks: number;
    cutoff_marks: number;
    section_order: number;
    problem_randomization: boolean | null;
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
    status: "INCOMPLETE" | "COMPLETE";
    institute_id: string | null;
    type: string;
    saved_data: SavedData;
    step_keys: StepKey[];
    default_values?: Record<string, DefaultValue>;
    field_options?: Record<string, FieldOption[]>;
}

export type Steps = StepData[];
