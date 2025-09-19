/**
 * Template Variable Mapper Utility
 *
 * This utility provides context-aware variable mapping for email templates
 * across different parts of the application (student management, course pages, etc.)
 */

export type MappingContext = 'student-management' | 'course' | 'general' | 'assessment' | 'announcement';

export interface MappingOptions {
    context: MappingContext;
    student?: any;
    course?: any;
    institute?: any;
    customVariables?: Record<string, string>;
}

/**
 * Maps template variables with actual data based on context
 * @param template - The template string containing variables like {{name}}
 * @param options - Mapping options including context and data sources
 * @returns Mapped template with variables replaced
 */
// Helper functions to break down the complex mapTemplateVariables function
const getNestedValue = (obj: any, path: string, fallback: string = ''): string => {
    if (!obj) return fallback;
    const keys = path.split('.');
    let value = obj;
    for (const key of keys) {
        if (value && typeof value === 'object' && key in value) {
            value = value[key];
        } else {
            return fallback;
        }
    }
    return value || fallback;
};

const formatDate = (dateString: string | undefined, fallback: string = ''): string => {
    if (!dateString) return fallback;
    try {
        return new Date(dateString).toLocaleDateString();
    } catch {
        return fallback;
    }
};

const createBaseVariableMap = (customVariables: Record<string, string> = {}): Record<string, string> => {
    const currentDate = new Date();
    const currentTime = currentDate.toLocaleTimeString();
    const currentYear = currentDate.getFullYear().toString();
    const currentMonth = (currentDate.getMonth() + 1).toString();
    const currentDay = currentDate.getDate().toString();

    const variableMap: Record<string, string> = {
        // Always available variables
        '{{current_date}}': currentDate.toLocaleDateString(),
        '{{current_time}}': currentTime,
        '{{year}}': currentYear,
        '{{month}}': currentMonth,
        '{{day}}': currentDay,
        '{{custom_message_text}}': 'Thank you for being part of our learning community.',
        '{{support_email}}': '', // Will be set dynamically from institute data
        '{{support_link}}': '', // Will be set dynamically from institute data
        '{{institute_logo}}': 'https://via.placeholder.com/200x100?text=Institute+Logo',
    };

    // Add custom variables
    Object.entries(customVariables).forEach(([key, value]) => {
        variableMap[`{{${key}}}`] = value;
    });

    return variableMap;
};

const addStudentVariables = (variableMap: Record<string, string>, student: any, context: string): void => {
    if (!student) return;

    // Basic student info (always try to map)
    variableMap['{{name}}'] = getNestedValue(student, 'full_name', 'Student');
    variableMap['{{student_name}}'] = getNestedValue(student, 'full_name', 'Student');
    variableMap['{{email}}'] = getNestedValue(student, 'email', '');
    variableMap['{{student_email}}'] = getNestedValue(student, 'email', '');
    variableMap['{{mobile_number}}'] = getNestedValue(student, 'mobile_number', '');
    variableMap['{{student_phone}}'] = getNestedValue(student, 'mobile_number', '');
    variableMap['{{student_id}}'] = getNestedValue(student, 'user_id', '');
    variableMap['{{enrollment_number}}'] = getNestedValue(student, 'enrollment_number', getNestedValue(student, 'user_id', ''));
    variableMap['{{username}}'] = getNestedValue(student, 'username', getNestedValue(student, 'email', ''));
    variableMap['{{registration_date}}'] = formatDate(getNestedValue(student, 'created_at'), '');
    variableMap['{{student_unique_link}}'] = getNestedValue(student, 'student_unique_link', '');
    variableMap['{{student_referral_code}}'] = getNestedValue(student, 'referral_code', '');

    // Course variables (always try to map, use fallback if not available)
        variableMap['{{course_name}}'] = getNestedValue(student, 'course_name', 'Your Course');
        variableMap['{{course_description}}'] = getNestedValue(student, 'course_description', 'Course Description');
    variableMap['{{course_price}}'] = getNestedValue(student, 'course_price', 'Course Price');
        variableMap['{{course_duration}}'] = getNestedValue(student, 'course_duration', 'Course Duration');
    variableMap['{{course_start_date}}'] = formatDate(getNestedValue(student, 'course_start_date'), '');
    variableMap['{{course_end_date}}'] = formatDate(getNestedValue(student, 'course_end_date'), '');
    variableMap['{{course_instructor}}'] = getNestedValue(student, 'course_instructor', 'Course Instructor');

    // Batch variables (always try to map, use fallback if not available)
        variableMap['{{batch_name}}'] = getNestedValue(student, 'batch_name', 'Your Batch');
        variableMap['{{batch_id}}'] = getNestedValue(student, 'batch_id', '');
        variableMap['{{batch_start_date}}'] = formatDate(getNestedValue(student, 'batch_start_date'), '');
        variableMap['{{batch_end_date}}'] = formatDate(getNestedValue(student, 'batch_end_date'), '');

    // Institute variables (always try to map, use fallback if not available)
        variableMap['{{institute_name}}'] = getNestedValue(student, 'institute_name', 'Your Institute');
        variableMap['{{institute_address}}'] = getNestedValue(student, 'institute_address', 'Contact us for address details');
        variableMap['{{institute_phone}}'] = getNestedValue(student, 'institute_phone', 'Institute Phone');
        variableMap['{{institute_email}}'] = getNestedValue(student, 'institute_email', 'Institute Email');
        variableMap['{{institute_website}}'] = getNestedValue(student, 'institute_website', 'Institute Website');

    // Support variables (use institute data, fallback to default)
        variableMap['{{support_email}}'] = getNestedValue(student, 'institute_email', 'support@vacademy.com');
        variableMap['{{support_link}}'] = getNestedValue(student, 'institute_website', 'https://support.vacademy.com');

    // Live class variables (always try to map, use fallback if not available)
        variableMap['{{live_class_title}}'] = getNestedValue(student, 'live_class_title', 'Live Class Session');
    variableMap['{{live_class_name}}'] = getNestedValue(student, 'live_class_title', 'Live Class Session');
        variableMap['{{live_class_date}}'] = formatDate(getNestedValue(student, 'live_class_date'), '');
        variableMap['{{live_class_time}}'] = getNestedValue(student, 'live_class_time', '');
    variableMap['{{live_class_start_time}}'] = getNestedValue(student, 'live_class_time', '');
    variableMap['{{live_class_end_time}}'] = getNestedValue(student, 'live_class_time', '');
        variableMap['{{live_class_duration}}'] = getNestedValue(student, 'live_class_duration', '');
        variableMap['{{live_class_instructor}}'] = getNestedValue(student, 'live_class_instructor', 'Instructor');
    variableMap['{{live_class_link}}'] = getNestedValue(student, 'live_class_meeting_link', '');
        variableMap['{{live_class_meeting_link}}'] = getNestedValue(student, 'live_class_meeting_link', '');
        variableMap['{{live_class_meeting_id}}'] = getNestedValue(student, 'live_class_meeting_id', '');
        variableMap['{{live_class_password}}'] = getNestedValue(student, 'live_class_password', '');
        variableMap['{{live_class_platform}}'] = getNestedValue(student, 'live_class_platform', 'Online Platform');
        variableMap['{{live_class_room}}'] = getNestedValue(student, 'live_class_room', '');
        variableMap['{{live_class_notes}}'] = getNestedValue(student, 'live_class_notes', '');
    variableMap['{{live_class_description}}'] = getNestedValue(student, 'live_class_notes', '');
    variableMap['{{live_class_batch}}'] = getNestedValue(student, 'batch_name', 'Your Batch');
        variableMap['{{live_class_recording_link}}'] = getNestedValue(student, 'live_class_recording_link', '');
        variableMap['{{live_class_status}}'] = getNestedValue(student, 'live_class_status', 'upcoming');
        variableMap['{{next_live_class_date}}'] = formatDate(getNestedValue(student, 'next_live_class_date'), '');
        variableMap['{{next_live_class_time}}'] = getNestedValue(student, 'next_live_class_time', '');
    variableMap['{{next_live_class_title}}'] = getNestedValue(student, 'live_class_title', 'Next Live Class');

    // Referral variables (always try to map, use fallback if not available)
        variableMap['{{referral_code}}'] = getNestedValue(student, 'referral_code', '');
        variableMap['{{referral_link}}'] = getNestedValue(student, 'referral_link', '');
        variableMap['{{referral_count}}'] = getNestedValue(student, 'referral_count', '0');
        variableMap['{{referral_rewards}}'] = getNestedValue(student, 'referral_rewards', '0');
        variableMap['{{referral_bonus}}'] = getNestedValue(student, 'referral_bonus', '0');
        variableMap['{{referral_status}}'] = getNestedValue(student, 'referral_status', 'active');
        variableMap['{{referred_by}}'] = getNestedValue(student, 'referred_by', '');
        variableMap['{{referred_by_name}}'] = getNestedValue(student, 'referred_by_name', '');
    variableMap['{{referral_date}}'] = formatDate(getNestedValue(student, 'referral_program_start'), '');
        variableMap['{{referral_program_start}}'] = formatDate(getNestedValue(student, 'referral_program_start'), '');
        variableMap['{{referral_program_end}}'] = formatDate(getNestedValue(student, 'referral_program_end'), '');
        variableMap['{{referral_terms}}'] = getNestedValue(student, 'referral_terms', '');
        variableMap['{{referral_benefits}}'] = getNestedValue(student, 'referral_benefits', '');

    // Attendance variables (always try to map, use fallback if not available)
    variableMap['{{attendance_status}}'] = getNestedValue(student, 'attendance_status', 'Present');
        variableMap['{{attendance_date}}'] = formatDate(getNestedValue(student, 'attendance_date'), '');
        variableMap['{{attendance_percentage}}'] = getNestedValue(student, 'attendance_percentage', '0');
    variableMap['{{attendance_total_classes}}'] = getNestedValue(student, 'attendance_total_classes', '0');
    variableMap['{{attendance_attended_classes}}'] = getNestedValue(student, 'attendance_attended_classes', '0');
    variableMap['{{attendance_last_class_date}}'] = formatDate(getNestedValue(student, 'attendance_last_class_date'), '');

    // Custom fields (always try to map, use fallback if not available)
    variableMap['{{custom_field_1}}'] = getNestedValue(student, 'custom_field_1', '');
    variableMap['{{custom_field_2}}'] = getNestedValue(student, 'custom_field_2', '');

    // Additional variables that might be missing
    variableMap['{{referral_custom_content}}'] = getNestedValue(student, 'referral_custom_content', '');
    variableMap['{{institute_logo}}'] = getNestedValue(student, 'institute_logo', 'https://via.placeholder.com/200x100?text=Institute+Logo');
};

const addCourseVariables = (variableMap: Record<string, string>, course: any): void => {
    if (!course) return;

    variableMap['{{course_name}}'] = getNestedValue(course, 'name', 'Your Course');
    variableMap['{{course_description}}'] = getNestedValue(course, 'description', 'Course Description');
    variableMap['{{course_duration}}'] = getNestedValue(course, 'duration', 'Course Duration');
    variableMap['{{course_price}}'] = getNestedValue(course, 'price', 'Course Price');
    variableMap['{{course_start_date}}'] = formatDate(getNestedValue(course, 'start_date'), '');
    variableMap['{{course_end_date}}'] = formatDate(getNestedValue(course, 'end_date'), '');
    variableMap['{{course_instructor}}'] = getNestedValue(course, 'instructor_name', 'Course Instructor');
};

const addInstituteVariables = (variableMap: Record<string, string>, institute: any): void => {
    if (!institute) return;

    variableMap['{{institute_name}}'] = getNestedValue(institute, 'name', 'Your Institute');
    variableMap['{{institute_address}}'] = getNestedValue(institute, 'address', 'Institute Address');
    variableMap['{{institute_phone}}'] = getNestedValue(institute, 'phone', 'Institute Phone');
    variableMap['{{institute_email}}'] = getNestedValue(institute, 'email', 'Institute Email');
    variableMap['{{institute_website}}'] = getNestedValue(institute, 'website', 'Institute Website');
};

const replaceVariablesInTemplate = (template: string, variableMap: Record<string, string>): {
    mappedTemplate: string;
    replacementCount: number;
    unmappedVariables: string[];
} => {
    let mappedTemplate = template;
    let replacementCount = 0;
    let unmappedVariables: string[] = [];

    // First pass: replace available variables
    Object.entries(variableMap).forEach(([variable, value]) => {
        const regex = new RegExp(variable.replace(/[{}]/g, '\\$&'), 'g');
        const beforeReplace = mappedTemplate;
        mappedTemplate = mappedTemplate.replace(regex, value);

        if (beforeReplace !== mappedTemplate) {
            replacementCount++;
        }
    });

    // Second pass: find unmapped variables and replace with placeholders
    const unmappedRegex = /\{\{[^}]+\}\}/g;
    const unmappedMatches = mappedTemplate.match(unmappedRegex);
    if (unmappedMatches) {
        unmappedVariables = [...new Set(unmappedMatches)];
        unmappedMatches.forEach(variable => {
            const placeholder = `[${variable.replace(/[{}]/g, '')}]`;
            mappedTemplate = mappedTemplate.replace(new RegExp(variable.replace(/[{}]/g, '\\$&'), 'g'), placeholder);
        });
    }

    return { mappedTemplate, replacementCount, unmappedVariables };
};

export const mapTemplateVariables = (
    template: string,
    options: MappingOptions
): string => {
    if (!template) {
        console.warn('mapTemplateVariables: Missing template');
        return template;
    }

    try {
        const { context, student, course, institute, customVariables = {} } = options;

        // Create base variable map
        const variableMap = createBaseVariableMap(customVariables);

        // Add context-specific variables
        addStudentVariables(variableMap, student, context);
        addCourseVariables(variableMap, course);
        addInstituteVariables(variableMap, institute);

        // Replace variables in template
        const { mappedTemplate, replacementCount, unmappedVariables } = replaceVariablesInTemplate(template, variableMap);

        // Log detailed mapping information
        console.log('=== VARIABLE MAPPING DETAILS ===');
        console.log('Context:', context);
        console.log('Student ID:', student?.user_id || 'N/A');
        console.log('Student Name:', student?.full_name || 'N/A');
        console.log('Total Variables Mapped:', Object.keys(variableMap).length);
        console.log('Replacements Made:', replacementCount);
        console.log('Unmapped Variables:', unmappedVariables.length > 0 ? unmappedVariables : 'None');

        // Log real values available in student object
        console.log('=== REAL VALUES AVAILABLE ===');
        console.log('Course Data:', {
            course_name: student?.course_name,
            course_description: student?.course_description,
            course_price: student?.course_price,
            course_duration: student?.course_duration,
            course_instructor: student?.course_instructor
        });

        console.log('Batch Data:', {
            batch_name: student?.batch_name,
            batch_id: student?.batch_id,
            batch_start_date: student?.batch_start_date,
            batch_end_date: student?.batch_end_date
        });

        console.log('Attendance Data:', {
            attendance_status: student?.attendance_status,
            attendance_percentage: student?.attendance_percentage,
            attendance_total_classes: student?.attendance_total_classes,
            attendance_attended_classes: student?.attendance_attended_classes
        });

        console.log('Institute Data:', {
            institute_name: student?.institute_name,
            institute_address: student?.institute_address,
            institute_phone: student?.institute_phone,
            institute_email: student?.institute_email,
            institute_website: student?.institute_website
        });

        console.log('Referral Data:', {
            referral_code: student?.referral_code,
            referral_count: student?.referral_count,
            referral_rewards: student?.referral_rewards,
            referral_status: student?.referral_status
        });

        // Log mapped values for key variables
        console.log('=== MAPPED VALUES ===');
        console.log('Key Mapped Variables:', {
            '{{name}}': variableMap['{{name}}'],
            '{{student_name}}': variableMap['{{student_name}}'],
            '{{course_name}}': variableMap['{{course_name}}'],
            '{{batch_name}}': variableMap['{{batch_name}}'],
            '{{attendance_status}}': variableMap['{{attendance_status}}'],
            '{{attendance_percentage}}': variableMap['{{attendance_percentage}}'],
            '{{institute_name}}': variableMap['{{institute_name}}'],
            '{{institute_email}}': variableMap['{{institute_email}}'],
            '{{support_email}}': variableMap['{{support_email}}'],
            '{{support_link}}': variableMap['{{support_link}}'],
            '{{current_time}}': variableMap['{{current_time}}'],
            '{{year}}': variableMap['{{year}}'],
            '{{month}}': variableMap['{{month}}'],
            '{{day}}': variableMap['{{day}}']
        });

        console.log('=== END VARIABLE MAPPING ===');

        return mappedTemplate;
    } catch (error) {
        console.error('Error mapping template variables:', error, { template, options });
        return template; // Return original template if mapping fails
    }
};

/**
 * Get available variables for a given context
 * @param context - The mapping context
 * @returns Array of available variable names
 */
export const getAvailableVariables = (context: MappingContext): string[] => {
    const baseVariables = [
        '{{current_date}}',
        '{{current_time}}',
        '{{year}}',
        '{{month}}',
        '{{day}}',
        '{{custom_message_text}}'
    ];

    const contextVariables: Record<MappingContext, string[]> = {
        'student-management': [
            ...baseVariables,
            '{{name}}',
            '{{student_name}}',
            '{{email}}',
            '{{student_email}}',
            '{{mobile_number}}',
            '{{student_phone}}',
            '{{student_id}}',
            '{{enrollment_number}}',
            '{{username}}',
            '{{registration_date}}',
            '{{student_unique_link}}',
            '{{student_referral_code}}',
            '{{course_name}}',
            '{{course_description}}',
            '{{course_duration}}',
            '{{course_price}}',
            '{{batch_name}}',
            '{{batch_id}}',
            '{{batch_start_date}}',
            '{{batch_end_date}}',
            '{{institute_name}}',
            '{{institute_address}}',
            '{{institute_phone}}',
            '{{institute_email}}',
            '{{institute_website}}',
            '{{attendance_status}}',
            '{{attendance_date}}',
            '{{attendance_percentage}}',
            '{{live_class_title}}',
            '{{live_class_date}}',
            '{{live_class_time}}',
            '{{live_class_duration}}',
            '{{live_class_instructor}}',
            '{{live_class_meeting_link}}',
            '{{live_class_meeting_id}}',
            '{{live_class_password}}',
            '{{live_class_platform}}',
            '{{live_class_room}}',
            '{{live_class_notes}}',
            '{{live_class_recording_link}}',
            '{{live_class_status}}',
            '{{next_live_class_date}}',
            '{{next_live_class_time}}',
            '{{referral_code}}',
            '{{referral_link}}',
            '{{referral_count}}',
            '{{referral_rewards}}',
            '{{referral_bonus}}',
            '{{referral_status}}',
            '{{referred_by}}',
            '{{referred_by_name}}',
            '{{referral_program_start}}',
            '{{referral_program_end}}',
            '{{referral_terms}}',
            '{{referral_benefits}}',
            '{{custom_field_1}}',
            '{{custom_field_2}}'
        ],
        'course': [
            ...baseVariables,
            '{{name}}',
            '{{student_name}}',
            '{{email}}',
            '{{student_email}}',
            '{{course_name}}',
            '{{course_description}}',
            '{{course_duration}}',
            '{{course_price}}',
            '{{course_start_date}}',
            '{{course_end_date}}',
            '{{course_instructor}}',
            '{{institute_name}}',
            '{{institute_address}}',
            '{{institute_phone}}',
            '{{institute_email}}',
            '{{institute_website}}',
            '{{live_class_title}}',
            '{{live_class_date}}',
            '{{live_class_time}}',
            '{{live_class_duration}}',
            '{{live_class_instructor}}',
            '{{live_class_meeting_link}}',
            '{{live_class_meeting_id}}',
            '{{live_class_password}}',
            '{{live_class_platform}}',
            '{{live_class_room}}',
            '{{live_class_notes}}',
            '{{live_class_recording_link}}',
            '{{live_class_status}}',
            '{{next_live_class_date}}',
            '{{next_live_class_time}}',
            '{{referral_code}}',
            '{{referral_link}}',
            '{{referral_count}}',
            '{{referral_rewards}}',
            '{{referral_bonus}}',
            '{{referral_status}}',
            '{{referred_by}}',
            '{{referred_by_name}}',
            '{{referral_program_start}}',
            '{{referral_program_end}}',
            '{{referral_terms}}',
            '{{referral_benefits}}'
        ],
        'assessment': [
            ...baseVariables,
            '{{name}}',
            '{{student_name}}',
            '{{email}}',
            '{{student_email}}',
            '{{course_name}}',
            '{{assessment_name}}',
            '{{assessment_score}}',
            '{{assessment_date}}',
            '{{institute_name}}',
            '{{live_class_title}}',
            '{{live_class_date}}',
            '{{live_class_time}}',
            '{{live_class_instructor}}',
            '{{referral_code}}',
            '{{referral_link}}',
            '{{referral_rewards}}'
        ],
        'announcement': [
            ...baseVariables,
            '{{name}}',
            '{{student_name}}',
            '{{email}}',
            '{{student_email}}',
            '{{course_name}}',
            '{{announcement_title}}',
            '{{announcement_date}}',
            '{{institute_name}}',
            '{{live_class_title}}',
            '{{live_class_date}}',
            '{{live_class_time}}',
            '{{live_class_instructor}}',
            '{{referral_code}}',
            '{{referral_link}}'
        ],
        'general': baseVariables
    };

    return contextVariables[context] || baseVariables;
};

/**
 * Validate template for unmapped variables
 * @param template - The template string
 * @param context - The mapping context
 * @returns Object with validation results
 */
export const validateTemplate = (template: string, context: MappingContext): {
    isValid: boolean;
    unmappedVariables: string[];
    availableVariables: string[];
} => {
    const availableVariables = getAvailableVariables(context);
    const variableRegex = /\{\{([^}]+)\}\}/g;
    const matches = template.match(variableRegex);

    if (!matches) {
        return {
            isValid: true,
            unmappedVariables: [],
            availableVariables
        };
    }

    const templateVariables = matches.map(match => match.replace(/[{}]/g, ''));
    const unmappedVariables = templateVariables.filter(
        variable => !availableVariables.includes(`{{${variable}}}`)
    );

    return {
        isValid: unmappedVariables.length === 0,
        unmappedVariables,
        availableVariables
    };
};
