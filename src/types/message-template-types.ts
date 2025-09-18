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
        '{{student_unique_link}}',     // Student unique link
        '{{student_referral_code}}',   // Student referral code
    ],
    course: [
        '{{course_name}}',
        '{{course_description}}',
        '{{course_duration}}',
        '{{course_price}}',
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

// WhatsApp Template Types
export interface MetaWhatsAppTemplate {
    id: string;
    name: string;
    language: string;
    status: 'APPROVED' | 'PENDING' | 'REJECTED' | 'DISABLED';
    category: 'TRANSACTIONAL' | 'MARKETING' | 'UTILITY';
    components: MetaTemplateComponent[];
    createdAt: string;
    updatedAt: string;
}

export interface MetaTemplateComponent {
    type: 'HEADER' | 'BODY' | 'FOOTER' | 'BUTTONS';
    text?: string;
    format?: 'TEXT' | 'IMAGE' | 'VIDEO' | 'DOCUMENT';
    buttons?: Array<{
        type: 'URL' | 'PHONE_NUMBER' | 'QUICK_REPLY';
        text: string;
        url?: string;
        phone_number?: string;
    }>;
}

export interface PlaceholderMapping {
    metaPlaceholder: string; // e.g., "{{1}}", "{{2}}"
    vacademyField: string; // e.g., "learner.firstName"
    fieldLabel: string; // e.g., "First Name"
    dataType: 'text' | 'number' | 'date' | 'boolean';
}

export interface WhatsAppTemplateMapping {
    id: string;
    templateName: string;
    templateId: string;
    language: string;
    mappings: PlaceholderMapping[];
    createdAt: string;
    updatedAt: string;
    instituteId: string;
}

export interface CreateMappingRequest {
    templateName: string;
    templateId: string;
    language: string;
    mappings: Omit<PlaceholderMapping, 'fieldLabel' | 'dataType'>[];
}

export interface VacademyDataField {
    value: string;
    label: string;
    category: string;
    dataType: 'text' | 'number' | 'date' | 'boolean';
    description: string;
}

export const VACADEMY_DATA_FIELDS: VacademyDataField[] = [
    // Learner fields
    { value: 'learner.firstName', label: 'First Name', category: 'learner', dataType: 'text', description: 'Student\'s first name' },
    { value: 'learner.lastName', label: 'Last Name', category: 'learner', dataType: 'text', description: 'Student\'s last name' },
    { value: 'learner.fullName', label: 'Full Name', category: 'learner', dataType: 'text', description: 'Student\'s full name' },
    { value: 'learner.email', label: 'Email', category: 'learner', dataType: 'text', description: 'Student\'s email address' },
    { value: 'learner.phone', label: 'Phone', category: 'learner', dataType: 'text', description: 'Student\'s phone number' },
    { value: 'learner.studentId', label: 'Student ID', category: 'learner', dataType: 'text', description: 'Student\'s unique ID' },
    { value: 'learner.enrollmentNumber', label: 'Enrollment Number', category: 'learner', dataType: 'text', description: 'Student\'s enrollment number' },
    { value: 'learner.registrationDate', label: 'Registration Date', category: 'learner', dataType: 'date', description: 'Student\'s registration date' },
    { value: 'learner.uniqueLink', label: 'Student Unique Link', category: 'learner', dataType: 'text', description: 'Student\'s unique personal link' },
    { value: 'learner.referralCode', label: 'Student Referral Code', category: 'learner', dataType: 'text', description: 'Student\'s referral code' },

    // Course fields
    { value: 'course.name', label: 'Course Name', category: 'course', dataType: 'text', description: 'Name of the course' },
    { value: 'course.description', label: 'Course Description', category: 'course', dataType: 'text', description: 'Description of the course' },
    { value: 'course.duration', label: 'Course Duration', category: 'course', dataType: 'text', description: 'Duration of the course' },
    { value: 'course.price', label: 'Course Price', category: 'course', dataType: 'number', description: 'Price of the course' },
    { value: 'course.startDate', label: 'Course Start Date', category: 'course', dataType: 'date', description: 'Course start date' },
    { value: 'course.endDate', label: 'Course End Date', category: 'course', dataType: 'date', description: 'Course end date' },

    // Batch fields
    { value: 'batch.name', label: 'Batch Name', category: 'batch', dataType: 'text', description: 'Name of the batch' },
    { value: 'batch.id', label: 'Batch ID', category: 'batch', dataType: 'text', description: 'Batch identifier' },
    { value: 'batch.startDate', label: 'Batch Start Date', category: 'batch', dataType: 'date', description: 'Batch start date' },
    { value: 'batch.endDate', label: 'Batch End Date', category: 'batch', dataType: 'date', description: 'Batch end date' },
    { value: 'batch.capacity', label: 'Batch Capacity', category: 'batch', dataType: 'number', description: 'Maximum number of students in batch' },


    // Institute fields
    { value: 'institute.name', label: 'Institute Name', category: 'institute', dataType: 'text', description: 'Name of the institute' },
    { value: 'institute.address', label: 'Institute Address', category: 'institute', dataType: 'text', description: 'Address of the institute' },
    { value: 'institute.phone', label: 'Institute Phone', category: 'institute', dataType: 'text', description: 'Institute phone number' },
    { value: 'institute.email', label: 'Institute Email', category: 'institute', dataType: 'text', description: 'Institute email address' },
    { value: 'institute.website', label: 'Institute Website', category: 'institute', dataType: 'text', description: 'Institute website URL' },

    // Attendance fields
    { value: 'attendance.status', label: 'Attendance Status', category: 'attendance', dataType: 'text', description: 'Student\'s attendance status' },
    { value: 'attendance.date', label: 'Attendance Date', category: 'attendance', dataType: 'date', description: 'Date of attendance' },
    { value: 'attendance.percentage', label: 'Attendance Percentage', category: 'attendance', dataType: 'number', description: 'Attendance percentage' },

    // General fields
    { value: 'general.currentDate', label: 'Current Date', category: 'general', dataType: 'date', description: 'Current date' },
    { value: 'general.currentTime', label: 'Current Time', category: 'general', dataType: 'text', description: 'Current time' },
    { value: 'general.year', label: 'Current Year', category: 'general', dataType: 'number', description: 'Current year' },
    { value: 'general.month', label: 'Current Month', category: 'general', dataType: 'text', description: 'Current month' },
    { value: 'general.day', label: 'Current Day', category: 'general', dataType: 'number', description: 'Current day' },
];
