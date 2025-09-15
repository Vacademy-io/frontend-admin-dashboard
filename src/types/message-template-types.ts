export interface MessageTemplate {
    id: string;
    name: string;
    type: 'EMAIL' | 'WHATSAPP';
    subject?: string; // For email templates
    content: string;
    variables: string[]; // Available variables like {{student_name}}, {{course_name}}, etc.
    isDefault: boolean;
    createdAt: string;
    updatedAt: string;
    createdBy?: string;
    instituteId?: string;
}

export interface CreateTemplateRequest {
    name: string;
    type: 'EMAIL' | 'WHATSAPP';
    subject?: string;
    content: string;
    variables: string[];
    isDefault?: boolean;
}

export interface UpdateTemplateRequest {
    id: string;
    name?: string;
    type?: 'EMAIL' | 'WHATSAPP';
    subject?: string;
    content?: string;
    variables?: string[];
    isDefault?: boolean;
}

export interface TemplateListResponse {
    templates: MessageTemplate[];
    total: number;
    page: number;
    limit: number;
}

// Available template variables
export const TEMPLATE_VARIABLES = {
    student: [
        '{{name}}',                    // Most commonly used - student name
        '{{student_name}}',            // Alternative student name
        '{{email}}',                   // Student email
        '{{student_email}}',           // Alternative student email
        '{{mobile_number}}',           // Student mobile number
        '{{student_phone}}',           // Alternative student phone
        '{{student_id}}',              // Student ID
        '{{enrollment_number}}',       // Enrollment number
        '{{username}}',                // Login username
        '{{registration_date}}',       // Registration date
    ],
    course: [
        '{{course_name}}',
        '{{course_description}}',
        '{{course_duration}}',
        '{{course_price}}',
    ],
    session: [
        '{{session_name}}',
        '{{session_date}}',
        '{{session_time}}',
        '{{session_duration}}',
        '{{session_link}}',
    ],
    batch: [
        '{{batch_name}}',
        '{{batch_id}}',
        '{{batch_start_date}}',
        '{{batch_end_date}}',
    ],
    institute: [
        '{{institute_name}}',
        '{{institute_address}}',
        '{{institute_phone}}',
        '{{institute_email}}',
        '{{institute_website}}',
    ],
    attendance: [
        '{{attendance_status}}',
        '{{attendance_date}}',
        '{{attendance_percentage}}',
    ],
    custom: [
        '{{custom_message_text}}',     // Custom message placeholder
        '{{custom_field_1}}',
        '{{custom_field_2}}',
    ],
    general: [
        '{{current_date}}',
        '{{current_time}}',
        '{{year}}',
        '{{month}}',
        '{{day}}',
    ],
} as const;

export type TemplateVariable = typeof TEMPLATE_VARIABLES[keyof typeof TEMPLATE_VARIABLES][number];

export const ALL_TEMPLATE_VARIABLES: TemplateVariable[] = Object.values(TEMPLATE_VARIABLES).flat();
