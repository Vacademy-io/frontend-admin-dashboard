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
    saved_data: Record<string, unknown>;
    step_keys: StepKey[];
    default_values?: Record<string, DefaultValue>;
    field_options?: Record<string, FieldOption[]>;
}

export type Steps = StepData[];
