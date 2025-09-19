/**
 * Bulk Email Service
 *
 * This service handles bulk email sending with enriched student data
 * and template variable mapping for all pages
 */

import { studentDataEnrichmentService, EnrichedStudentData, DataEnrichmentOptions } from './studentDataEnrichmentService';
import { mapTemplateVariables } from '@/utils/template-variable-mapper';
import { getCurrentInstituteId } from '@/lib/auth/instituteUtils';

export interface BulkEmailPayload {
    body: string;
    notification_type: 'EMAIL' | 'WHATSAPP';
    source: string;
    source_id: string;
    subject: string;
    users: Array<{
        user_id: string;
        channel_id: string;
        placeholders: Record<string, string>;
    }>;
    institute_id?: string; // Optional institute ID
}

export interface BulkEmailOptions {
    template: string;
    subject: string;
    students: any[];
    context: 'student-management' | 'announcements' | 'attendance-report' | 'referral-settings';
    notificationType: 'EMAIL' | 'WHATSAPP';
    source: string;
    sourceId: string;
    enrichmentOptions?: DataEnrichmentOptions;
}

export interface BulkEmailResult {
    success: boolean;
    totalStudents: number;
    processedStudents: number;
    failedStudents: number;
    errors: Array<{
        studentId: string;
        studentName: string;
        error: string;
    }>;
    payload?: BulkEmailPayload;
}

export class BulkEmailService {
    private baseURL: string;
    private authToken: string;

    constructor(baseURL: string = '/api') {
        this.baseURL = baseURL;
        this.authToken = this.getAuthToken();
    }

    private getAuthToken(): string {
        return localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token') || '';
    }

    private getInstituteId(): string {
        // Use the existing utility function
        try {
            return getCurrentInstituteId() || '';
        } catch {
            return '';
        }
    }

    /**
     * Create placeholders object for a student
     */
    private createStudentPlaceholders(student: any): Record<string, string> {
        const placeholders: Record<string, string> = {};

        // Add all student properties as placeholders
        Object.keys(student).forEach(key => {
            const value = student[key];
            if (value !== undefined && value !== null) {
                const apiKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
                placeholders[apiKey] = String(value);
            }
        });

        // Add specific mappings for common variables
        this.addCommonPlaceholders(placeholders, student);
        this.addInstitutePlaceholders(placeholders, student);
        this.addCoursePlaceholders(placeholders, student);
        this.addAttendancePlaceholders(placeholders, student);
        this.addLiveClassPlaceholders(placeholders, student);
        this.addReferralPlaceholders(placeholders, student);
        this.addTimePlaceholders(placeholders);
        this.addSupportPlaceholders(placeholders, student);

        return placeholders;
    }

    /**
     * Add common placeholders
     */
    private addCommonPlaceholders(placeholders: Record<string, string>, student: any): void {
        placeholders.name = student.full_name || 'Student';
        placeholders.student_name = student.full_name || 'Student';
        placeholders.email = student.email || '';
        placeholders.student_email = student.email || '';
        placeholders.mobile_number = student.mobile_number || '';
        placeholders.student_phone = student.mobile_number || '';
        placeholders.student_id = student.user_id || '';
        placeholders.enrollment_number = student.enrollment_number || student.user_id || '';
        placeholders.username = student.username || student.email || '';
        placeholders.registration_date = student.created_at ? new Date(student.created_at).toLocaleDateString() : '';
        placeholders.student_unique_link = student.student_unique_link || '';
    }

    /**
     * Add institute placeholders
     */
    private addInstitutePlaceholders(placeholders: Record<string, string>, student: any): void {
        placeholders.institute_name = student.institute_name || 'Your Institute';
        placeholders.institute_address = student.institute_address || 'Address not available';
        placeholders.institute_phone = student.institute_phone || 'Phone not available';
        placeholders.institute_email = student.institute_email || 'Email not available';
        placeholders.institute_website = student.institute_website || 'Website not available';
        placeholders.institute_logo = student.institute_logo || 'Logo not available';
    }

    /**
     * Add course placeholders
     */
    private addCoursePlaceholders(placeholders: Record<string, string>, student: any): void {
        placeholders.course_name = student.course_name || 'Your Course';
        placeholders.course_description = student.course_description || 'Course Description';
        placeholders.course_price = student.course_price || 'Course Price';
        placeholders.batch_name = student.batch_name || 'Your Batch';
        placeholders.batch_id = student.batch_id || '';
        placeholders.batch_start_date = student.batch_start_date ? new Date(student.batch_start_date).toLocaleDateString() : '';
        placeholders.batch_end_date = student.batch_end_date ? new Date(student.batch_end_date).toLocaleDateString() : '';
    }

    /**
     * Add attendance placeholders
     */
    private addAttendancePlaceholders(placeholders: Record<string, string>, student: any): void {
        // Use the dynamically calculated attendance data from enrichment service
        placeholders.attendance_status = student.attendance_status || 'Present';
        placeholders.attendance_date = student.attendance_date || new Date().toLocaleDateString();
        placeholders.attendance_percentage = student.attendance_percentage || '0';
        placeholders.attendance_total_classes = student.attendance_total_classes || '0';
        placeholders.attendance_attended_classes = student.attendance_attended_classes || '0';
        placeholders.attendance_last_class_date = student.attendance_last_class_date || '';
    }

    /**
     * Add live class placeholders
     */
    private addLiveClassPlaceholders(placeholders: Record<string, string>, student: any): void {
        placeholders.live_class_title = student.live_class_title || 'Live Class Session';
        placeholders.live_class_name = student.live_class_title || 'Live Class Session';
        placeholders.live_class_date = student.live_class_date ? new Date(student.live_class_date).toLocaleDateString() : '';
        placeholders.live_class_time = student.live_class_time || '';
        placeholders.live_class_start_time = student.live_class_time || '';
        placeholders.live_class_end_time = student.live_class_time || '';
        placeholders.live_class_duration = student.live_class_duration || '';
        placeholders.live_class_link = student.live_class_meeting_link || '';
        placeholders.live_class_meeting_link = student.live_class_meeting_link || '';
        placeholders.live_class_description = student.live_class_notes || '';
        placeholders.live_class_batch = student.batch_name || 'Your Batch';
        placeholders.live_class_platform = student.live_class_platform || 'Online Platform';
        placeholders.live_class_status = student.live_class_status || 'upcoming';
        placeholders.next_live_class_date = student.next_live_class_date ? new Date(student.next_live_class_date).toLocaleDateString() : '';
        placeholders.next_live_class_time = student.next_live_class_time || '';
    }

    /**
     * Add referral placeholders
     */
    private addReferralPlaceholders(placeholders: Record<string, string>, student: any): void {
        placeholders.student_referral_code = student.referral_code || '';
        placeholders.referral_count = student.referral_count || '0';
        placeholders.referral_rewards = student.referral_rewards || '0';
        placeholders.referral_bonus = student.referral_bonus || '0';
        placeholders.referral_status = student.referral_status || 'active';
        placeholders.referral_date = student.referral_program_start ? new Date(student.referral_program_start).toLocaleDateString() : '';
        placeholders.referral_benefits = student.referral_benefits || '';
        placeholders.referral_custom_content = student.referral_custom_content || '';
    }

    /**
     * Add time placeholders
     */
    private addTimePlaceholders(placeholders: Record<string, string>): void {
        const now = new Date();
        placeholders.current_date = now.toLocaleDateString();
        placeholders.current_time = now.toLocaleTimeString();
        placeholders.year = now.getFullYear().toString();
        placeholders.month = (now.getMonth() + 1).toString();
        placeholders.day = now.getDate().toString();
    }

    /**
     * Add support placeholders
     */
    private addSupportPlaceholders(placeholders: Record<string, string>, student: any): void {
        placeholders.custom_message_text = 'Thank you for being part of our learning community.';
        placeholders.custom_field_1 = student.custom_field_1 || '';
        placeholders.custom_field_2 = student.custom_field_2 || '';
        // Use institute email and website for support
        placeholders.support_email = student.institute_email || 'support@vacademy.com';
        placeholders.support_link = student.institute_website || 'https://support.vacademy.com';
    }

    private async makeRequest(endpoint: string, options: RequestInit = {}): Promise<any> {
        const url = `${this.baseURL}${endpoint}`;
        const config: RequestInit = {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.authToken}`,
                ...options.headers,
            },
        };

        try {
            const response = await fetch(url, config);
            if (!response.ok) {
                throw new Error(`API request failed: ${response.status} ${response.statusText}`);
            }
            return await response.json();
        } catch (error) {
            console.error(`API request failed for ${endpoint}:`, error);
            throw error;
        }
    }

    /**
     * Send bulk email with enriched data and template variable mapping
     */
    async sendBulkEmail(options: BulkEmailOptions): Promise<BulkEmailResult> {
        const {
            template,
            subject,
            students,
            context,
            notificationType,
            source,
            sourceId,
            enrichmentOptions = {}
        } = options;

        console.log('Starting bulk email process for', students.length, 'students');

        try {
            // Step 1: Enrich student data
            console.log('Enriching student data...');
            const enrichedStudents = await studentDataEnrichmentService.enrichStudentData(
                students,
                enrichmentOptions
            );

            // Step 2: Parse template variables
            const usedVariables = this.parseTemplateVariables(template + ' ' + subject);
            console.log('Template uses variables:', usedVariables);

            // Step 3: Create payload for each student
            const users: Array<{
                user_id: string;
                channel_id: string;
                placeholders: Record<string, string>;
            }> = [];

            const errors: Array<{
                studentId: string;
                studentName: string;
                error: string;
            }> = [];

            for (const student of enrichedStudents) {
                try {
                    // Map template variables for this student
                    const mappedSubject = mapTemplateVariables(subject, { context, student });
                    const mappedBody = mapTemplateVariables(template, { context, student });

                    // Create placeholders object for API
                    const placeholders = this.createStudentPlaceholders(student);

                    users.push({
                        user_id: student.user_id,
                        channel_id: notificationType === 'EMAIL' ? student.email : student.mobile_number,
                        placeholders
                    });

                } catch (error) {
                    console.error(`Error processing student ${student.user_id}:`, error);
                    errors.push({
                        studentId: student.user_id,
                        studentName: student.full_name || 'Unknown',
                        error: error instanceof Error ? error.message : 'Unknown error'
                    });
                }
            }

            // Step 4: Create bulk payload
            const instituteId = this.getInstituteId();
            const payload: BulkEmailPayload = {
                body: template, // Original template (variables will be replaced by API)
                notification_type: notificationType,
                source,
                source_id: sourceId,
                subject,
                users,
                institute_id: instituteId // Add institute ID to payload
            };

            // Step 5: Send bulk email using existing API
            console.log('Sending bulk email to', users.length, 'students');

            // Use the existing API endpoint pattern
            const baseUrl = `${import.meta.env.VITE_BACKEND_URL || 'https://backend-stage.vacademy.io'}/notification-service/v1/send-email-to-users-public`;
            const url = instituteId ? `${baseUrl}?instituteId=${instituteId}` : baseUrl;

            console.log('API URL:', url);
            console.log('Institute ID:', instituteId);
            console.log('Payload preview:', {
                body: payload.body.substring(0, 100) + '...',
                subject: payload.subject,
                users: payload.users.length,
                notification_type: payload.notification_type
            });

            // Log detailed payload information
            console.log('=== BULK EMAIL PAYLOAD DETAILS ===');
            console.log('Total Users:', users.length);
            console.log('Institute ID:', instituteId);
            console.log('Subject:', payload.subject);
            console.log('Notification Type:', payload.notification_type);

            // Log sample user data for first user
            if (users.length > 0) {
                console.log('=== SAMPLE USER DATA (First User) ===');
                console.log('User ID:', users[0].user_id);
                console.log('Channel ID:', users[0].channel_id);
                console.log('Sample Placeholders:', {
                    name: users[0].placeholders.name,
                    student_name: users[0].placeholders.student_name,
                    course_name: users[0].placeholders.course_name,
                    batch_name: users[0].placeholders.batch_name,
                    attendance_status: users[0].placeholders.attendance_status,
                    attendance_percentage: users[0].placeholders.attendance_percentage,
                    institute_name: users[0].placeholders.institute_name,
                    institute_email: users[0].placeholders.institute_email,
                    support_email: users[0].placeholders.support_email,
                    support_link: users[0].placeholders.support_link,
                    current_time: users[0].placeholders.current_time,
                    year: users[0].placeholders.year,
                    month: users[0].placeholders.month,
                    day: users[0].placeholders.day
                });
            }

            console.log('=== END BULK EMAIL PAYLOAD ===');

            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.authToken}`,
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                // Try to get error details
                let errorMessage = `API request failed: ${response.status} ${response.statusText}`;
                try {
                    const errorText = await response.text();
                    console.error('API Error Response:', errorText);
                    errorMessage += ` - ${errorText.substring(0, 200)}`;
                } catch (e) {
                    console.error('Could not parse error response:', e);
                }
                throw new Error(errorMessage);
            }

            // Check if response is JSON or plain text success
            const contentType = response.headers.get('content-type');
            let responseData: any = { success: true };

            if (!contentType || !contentType.includes('application/json')) {
                const responseText = await response.text();
                console.log('Non-JSON response received:', responseText);

                // Check if it's a success message
                if (responseText.toLowerCase().includes('success') ||
                    responseText.toLowerCase().includes('sent') ||
                    responseText.toLowerCase().includes('notification')) {
                    console.log('✅ Email sent successfully!');
                    responseData = { success: true, message: responseText };
                } else {
                    console.error('Non-JSON response received:', responseText.substring(0, 200));
                    throw new Error(`API returned non-JSON response: ${responseText.substring(0, 100)}`);
                }
            } else {
                responseData = await response.json();
            }

            const result: BulkEmailResult = {
                success: responseData.success !== false,
                totalStudents: students.length,
                processedStudents: users.length,
                failedStudents: errors.length,
                errors,
                payload
            };

            console.log('Bulk email completed:', result);
            return result;

        } catch (error) {
            console.error('Error in bulk email process:', error);

            // If API fails, try individual email sending as fallback
            console.log('API failed, trying individual email sending as fallback...');

            try {
                // Re-create users array for fallback
                const fallbackUsers: Array<{ user_id: string; channel_id: string; placeholders: Record<string, string> }> = [];

                for (const student of enrichedStudents) {
                    try {
                        // Map template variables for this student
                        const mappedSubject = mapTemplateVariables(subject, {
                            context,
                            student: student
                        });

                        const mappedBody = mapTemplateVariables(template, {
                            context,
                            student: student
                        });

                        // Create placeholders object for API
                        const placeholders: Record<string, string> = {};

                        // Add all mapped variables as placeholders
                        Object.keys(student).forEach(key => {
                            const value = student[key];
                            if (value !== undefined && value !== null) {
                                // Convert camelCase to snake_case for API
                                const apiKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
                                placeholders[apiKey] = String(value);
                            }
                        });

                        // Add specific mappings for common variables
                        placeholders.name = student.full_name || 'Student';
                        placeholders.email = student.email || '';
                        placeholders.mobile_number = student.mobile_number || '';
                        placeholders.current_date = new Date().toLocaleDateString();
                        placeholders.custom_message_text = 'Thank you for being part of our learning community.';

                        fallbackUsers.push({
                            user_id: student.user_id,
                            channel_id: notificationType === 'EMAIL' ? student.email : student.mobile_number,
                            placeholders
                        });

                    } catch (studentError) {
                        console.error(`Error processing student ${student.user_id}:`, studentError);
                    }
                }

                const fallbackResult = await this.sendIndividualEmails(fallbackUsers, template, subject, context);
                return fallbackResult;
            } catch (fallbackError) {
                console.error('Fallback also failed:', fallbackError);
                return {
                    success: false,
                    totalStudents: students.length,
                    processedStudents: 0,
                    failedStudents: students.length,
                    errors: [{
                        studentId: 'all',
                        studentName: 'All Students',
                        error: error instanceof Error ? error.message : 'Unknown error'
                    }]
                };
            }
        }
    }

    /**
     * Fallback: Send individual emails when bulk API fails
     */
    private async sendIndividualEmails(
        users: Array<{ user_id: string; channel_id: string; placeholders: Record<string, string> }>,
        template: string,
        subject: string,
        context: string
    ): Promise<BulkEmailResult> {
        console.log('Sending individual emails as fallback...');

        const instituteId = this.getInstituteId();
        const baseUrl = `${import.meta.env.VITE_BACKEND_URL || 'https://backend-stage.vacademy.io'}/notification-service/v1/send-email-to-users-public`;
        const url = instituteId ? `${baseUrl}?instituteId=${instituteId}` : baseUrl;

        let successCount = 0;
        let failureCount = 0;
        const errors: Array<{ studentId: string; studentName: string; error: string }> = [];

        for (const user of users) {
            try {
                const requestBody = {
                    body: template,
                    notification_type: 'EMAIL' as const,
                    source: 'STUDENT_MANAGEMENT_BULK_EMAIL',
                    source_id: `fallback-${Date.now()}`,
                    subject,
                    users: [{
                        user_id: user.user_id,
                        channel_id: user.channel_id,
                        placeholders: user.placeholders,
                    }],
                    institute_id: instituteId, // Add institute ID to individual emails too
                };

                const response = await fetch(url, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${this.authToken}`,
                    },
                    body: JSON.stringify(requestBody)
                });

                if (response.ok) {
                    successCount++;
                } else {
                    failureCount++;
                    const errorText = await response.text().catch(() => 'Unknown error');
                    errors.push({
                        studentId: user.user_id,
                        studentName: user.placeholders.name || 'Unknown',
                        error: `HTTP ${response.status}: ${errorText.substring(0, 100)}`
                    });
                }
            } catch (error) {
                failureCount++;
                errors.push({
                    studentId: user.user_id,
                    studentName: user.placeholders.name || 'Unknown',
                    error: error instanceof Error ? error.message : 'Unknown error'
                });
            }
        }

        return {
            success: successCount > 0,
            totalStudents: users.length,
            processedStudents: successCount,
            failedStudents: failureCount,
            errors
        };
    }

    /**
     * Parse template to extract used variables
     */
    private parseTemplateVariables(template: string): string[] {
        const variableRegex = /\{\{([^}]+)\}\}/g;
        const variables: string[] = [];
        let match;

        while ((match = variableRegex.exec(template)) !== null) {
            variables.push(match[1].trim());
        }

        return [...new Set(variables)]; // Remove duplicates
    }

    /**
     * Get available variables for a specific context
     */
    getAvailableVariables(context: string): string[] {
        return studentDataEnrichmentService.getAvailableVariablesForContext(context);
    }

    /**
     * Validate template for a specific context
     */
    validateTemplate(template: string, context: string): {
        isValid: boolean;
        usedVariables: string[];
        availableVariables: string[];
        missingVariables: string[];
    } {
        const usedVariables = this.parseTemplateVariables(template);
        const availableVariables = this.getAvailableVariables(context);
        const missingVariables = usedVariables.filter(
            variable => !availableVariables.includes(`{{${variable}}}`)
        );

        return {
            isValid: missingVariables.length === 0,
            usedVariables,
            availableVariables,
            missingVariables
        };
    }

    /**
     * Preview template with sample data
     */
    async previewTemplate(
        template: string,
        subject: string,
        context: string,
        sampleStudent?: any
    ): Promise<{
        mappedSubject: string;
        mappedBody: string;
        usedVariables: string[];
        availableVariables: string[];
    }> {
        const usedVariables = this.parseTemplateVariables(template + ' ' + subject);
        const availableVariables = this.getAvailableVariables(context);

        let mappedSubject = subject;
        let mappedBody = template;

        if (sampleStudent) {
            // Use sample student data for preview
            const enrichedStudent = await studentDataEnrichmentService.enrichStudentData(
                [sampleStudent],
                { includeCourse: true, includeBatch: true, includeInstitute: true }
            );

            if (enrichedStudent.length > 0) {
                mappedSubject = mapTemplateVariables(subject, {
                    context: context as any,
                    student: enrichedStudent[0]
                });

                mappedBody = mapTemplateVariables(template, {
                    context: context as any,
                    student: enrichedStudent[0]
                });
            }
        }

        return {
            mappedSubject,
            mappedBody,
            usedVariables,
            availableVariables
        };
    }
}

// Export singleton instance
export const bulkEmailService = new BulkEmailService();
