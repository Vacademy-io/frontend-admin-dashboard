import React, { useState, useEffect } from 'react';
import { useDialogStore } from '../../../../-hooks/useDialogStore';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';
import { MessageTemplate } from '@/types/message-template-types';
import { getInstituteId } from '@/constants/helper';
import { TemplateSelectionDialog } from './template-selection-dialog';
import { TemplateEditorDialog } from './template-editor-dialog';
import { TemplatePreviewDialog } from './template-preview-dialog';

// Email templates will be loaded dynamically from API

type EmailSendingStatus = 'pending' | 'sending' | 'sent' | 'failed';

interface StudentEmailStatus {
    userId: string;
    name: string;
    email: string;
    status: EmailSendingStatus;
    error?: string;
}

export const SendEmailDialog = () => {
    const { isSendEmailOpen, bulkActionInfo, selectedStudent, isBulkAction, closeAllDialogs } =
        useDialogStore();
    const [selectedTemplate, setSelectedTemplate] = useState<MessageTemplate | null>(null);
    const [studentEmailStatuses, setStudentEmailStatuses] = useState<StudentEmailStatus[]>([]);
    const [isBulkEmailSending, setIsBulkEmailSending] = useState(false);

    // New dialog states
    const [showTemplateSelection, setShowTemplateSelection] = useState(false);
    const [showTemplateEditor, setShowTemplateEditor] = useState(false);
    const [showTemplatePreview, setShowTemplatePreview] = useState(false);
    const [editingTemplate, setEditingTemplate] = useState<MessageTemplate | null>(null);

    const handleSelectEmailTemplate = (template: MessageTemplate) => {
        setSelectedTemplate(template);
        setShowTemplateSelection(false);
        setShowTemplatePreview(true);
    };

    const handleCreateNewTemplate = () => {
        console.log('Creating new template - setting showTemplateEditor to true');
        setEditingTemplate(null);
        setShowTemplateSelection(false);
        setShowTemplateEditor(true);
    };

    const handleTemplateSavedAndSent = async (template: MessageTemplate) => {
        // Use the template for sending
        setSelectedTemplate(template);
        setShowTemplateEditor(false);
        setShowTemplatePreview(true);
        // Send the email immediately
        await handleSendBulkEmail();
    };

    const handleSendEmail = async (template: MessageTemplate) => {
        setSelectedTemplate(template);
        setShowTemplatePreview(false);
        await handleSendBulkEmail();
    };

    // Function to map template variables with actual student data
    const mapTemplateVariables = (template: string, student: any): string => {
        if (!template || !student) return template;

        const currentDate = new Date();
        const currentTime = currentDate.toLocaleTimeString();
        const currentYear = currentDate.getFullYear().toString();
        const currentMonth = (currentDate.getMonth() + 1).toString();
        const currentDay = currentDate.getDate().toString();

        // Create comprehensive variable mapping
        const variableMap: Record<string, string> = {
            // Student variables
            '{{name}}': student.full_name || 'Student',
            '{{student_name}}': student.full_name || 'Student',
            '{{email}}': student.email || '',
            '{{student_email}}': student.email || '',
            '{{mobile_number}}': student.mobile_number || '',
            '{{student_phone}}': student.mobile_number || '',
            '{{student_id}}': student.user_id || '',
            '{{enrollment_number}}': student.enrollment_number || student.user_id || '',
            '{{username}}': student.username || student.email || '',
            '{{registration_date}}': student.created_at ? new Date(student.created_at).toLocaleDateString() : '',
            '{{student_unique_link}}': student.unique_link || '',
            '{{student_referral_code}}': student.referral_code || '',

            // Course variables (if available in student data)
            '{{course_name}}': student.course_name || 'Your Course',
            '{{course_description}}': student.course_description || 'Course Description',
            '{{course_duration}}': student.course_duration || 'Course Duration',
            '{{course_price}}': student.course_price || 'Course Price',

            // Batch variables (if available in student data)
            '{{batch_name}}': student.batch_name || 'Your Batch',
            '{{batch_id}}': student.batch_id || '',
            '{{batch_start_date}}': student.batch_start_date ? new Date(student.batch_start_date).toLocaleDateString() : '',
            '{{batch_end_date}}': student.batch_end_date ? new Date(student.batch_end_date).toLocaleDateString() : '',

            // Institute variables (if available in student data)
            '{{institute_name}}': student.institute_name || 'Your Institute',
            '{{institute_address}}': student.institute_address || 'Institute Address',
            '{{institute_phone}}': student.institute_phone || 'Institute Phone',
            '{{institute_email}}': student.institute_email || 'Institute Email',
            '{{institute_website}}': student.institute_website || 'Institute Website',

            // Attendance variables (if available in student data)
            '{{attendance_status}}': student.attendance_status || 'Attendance Status',
            '{{attendance_date}}': student.attendance_date ? new Date(student.attendance_date).toLocaleDateString() : '',
            '{{attendance_percentage}}': student.attendance_percentage || '0',

            // Custom variables
            '{{custom_message_text}}': 'Thank you for being part of our learning community.',
            '{{custom_field_1}}': student.custom_field_1 || '',
            '{{custom_field_2}}': student.custom_field_2 || '',

            // General variables
            '{{current_date}}': currentDate.toLocaleDateString(),
            '{{current_time}}': currentTime,
            '{{year}}': currentYear,
            '{{month}}': currentMonth,
            '{{day}}': currentDay,
        };

        // Replace all variables in the template
        let mappedTemplate = template;
        Object.entries(variableMap).forEach(([variable, value]) => {
            const regex = new RegExp(variable.replace(/[{}]/g, '\\$&'), 'g');
            mappedTemplate = mappedTemplate.replace(regex, value);
        });

        return mappedTemplate;
    };

    const handleSendBulkEmail = async () => {
        if (!selectedTemplate) {
            toast.error('No template selected.');
            return;
        }

        const trimmedEmailSubject = selectedTemplate.subject?.trim() || '';
        const trimmedEmailBody = selectedTemplate.content?.trim() || '';
        if (!trimmedEmailSubject || !trimmedEmailBody) {
            toast.error('Template subject and body are required.');
            return;
        }

        if (studentEmailStatuses.length === 0) {
            toast.error('No valid recipients to send email to.');
            return;
        }

        setIsBulkEmailSending(true);
        toast.info('Processing emails...', { id: 'bulk-email-progress' });

        setStudentEmailStatuses((prevStatuses) =>
            prevStatuses.map((s) => ({ ...s, status: 'sending' }))
        );

        const students = isBulkAction
            ? bulkActionInfo?.selectedStudents || []
            : selectedStudent
              ? [selectedStudent]
              : [];

        // Track null values for reporting
        const nullValueReport = {
            missingNames: 0,
            missingEmails: 0,
            missingMobileNumbers: 0,
            totalStudents: students.length,
        };

        const apiUsersPayload = studentEmailStatuses
            .map((statusEntry) => {
                const student = students.find((s) => s.user_id === statusEntry.userId);
                if (!student || !student.email) return null;

                // Track and log null values for debugging
                if (!student.full_name) {
                    nullValueReport.missingNames++;
                    console.warn(`⚠️ Null name for student ${student.user_id}:`, student);
                }
                if (!student.email) {
                    nullValueReport.missingEmails++;
                    console.warn(`⚠️ Null email for student ${student.user_id}:`, student);
                }
                if (!student.mobile_number) {
                    nullValueReport.missingMobileNumbers++;
                    console.warn(`⚠️ Null mobile_number for student ${student.user_id}:`, student);
                }

                // Map template variables for this student
                const mappedSubject = mapTemplateVariables(trimmedEmailSubject, student);
                const mappedBody = mapTemplateVariables(trimmedEmailBody, student);

                return {
                    user_id: student.user_id,
                    channel_id: student.email,
                    subject: mappedSubject, // Send mapped subject
                    body: mappedBody, // Send mapped body
                    placeholders: {
                        name: student.full_name || 'Student',
                        email: student.email || '',
                        mobile_number: student.mobile_number || '',
                        custom_message_text: 'Thank you for being part of our learning community.',
                        current_date: new Date().toLocaleDateString(),
                    },
                };
            })
            .filter((p) => p !== null);

        // Log null value summary
        console.log('📊 Null Value Report:', {
            totalStudents: nullValueReport.totalStudents,
            missingNames: nullValueReport.missingNames,
            missingEmails: nullValueReport.missingEmails,
            missingMobileNumbers: nullValueReport.missingMobileNumbers,
            processedStudents: apiUsersPayload.length,
        });

        if (apiUsersPayload.length === 0) {
            toast.error('Could not prepare payload for any student.');
            setIsBulkEmailSending(false);
            setStudentEmailStatuses((prevStatuses) =>
                prevStatuses.map((s) => ({ ...s, status: 'pending' }))
            );
            return;
        }

        // Send individual requests for each student with personalized content
        const instituteId = getInstituteId();
        const baseUrl = `${import.meta.env.VITE_BACKEND_URL || 'https://backend-stage.vacademy.io'}/notification-service/v1/send-email-to-users-public`;
        const url = instituteId ? `${baseUrl}?instituteId=${instituteId}` : baseUrl;

        let successCount = 0;
        let failureCount = 0;
        const errors: string[] = [];

        // Process each student individually
        for (const userPayload of apiUsersPayload) {
            try {
                // Convert newlines to HTML for the personalized body
                const personalizedBody = userPayload.body.replace(/\n/g, '<br />');

                const requestBody = {
                    body: personalizedBody,
                    notification_type: 'EMAIL',
                    subject: userPayload.subject,
                    source: 'STUDENT_MANAGEMENT_BULK_EMAIL',
                    source_id: uuidv4(),
                    users: [{
                        user_id: userPayload.user_id,
                        channel_id: userPayload.channel_id,
                        placeholders: userPayload.placeholders,
                    }],
                };

                const response = await fetch(url, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(requestBody),
                });

                if (response.ok) {
                    successCount++;
                    // Update status for this specific student
                    setStudentEmailStatuses((prevStatuses) =>
                        prevStatuses.map((s) =>
                            s.userId === userPayload.user_id
                                ? { ...s, status: 'sent' }
                                : s
                        )
                    );
                } else {
                    failureCount++;
                    const errorData = await response
                        .json()
                        .catch(() => ({ message: 'Failed to parse error response' }));
                    const errorMsg = `Student ${userPayload.user_id}: ${errorData.message || response.statusText}`;
                    errors.push(errorMsg);

                    // Update status for this specific student
                    setStudentEmailStatuses((prevStatuses) =>
                        prevStatuses.map((s) =>
                            s.userId === userPayload.user_id
                                ? { ...s, status: 'failed', error: errorMsg }
                                : s
                        )
                    );
                }
            } catch (error: any) {
                failureCount++;
                const errorMsg = `Student ${userPayload.user_id}: ${error.message || 'Network error'}`;
                errors.push(errorMsg);

                // Update status for this specific student
                setStudentEmailStatuses((prevStatuses) =>
                    prevStatuses.map((s) =>
                        s.userId === userPayload.user_id
                            ? { ...s, status: 'failed', error: errorMsg }
                            : s
                    )
                );
            }
        }

        // Show final results
        if (successCount > 0 && failureCount === 0) {
            toast.success(`Successfully sent ${successCount} personalized email(s).`, {
                id: 'bulk-email-progress',
            });
        } else if (successCount > 0 && failureCount > 0) {
            toast.warning(`Sent ${successCount} email(s), ${failureCount} failed.`, {
                id: 'bulk-email-progress',
            });
            console.error('Email sending errors:', errors);
        } else {
            toast.error(`Failed to send all ${failureCount} email(s).`, {
                id: 'bulk-email-progress',
            });
            console.error('Email sending errors:', errors);
        }

        setIsBulkEmailSending(false);
    };

    const handleClose = () => {
        if (isBulkEmailSending) return;
        setSelectedTemplate(null);
        setStudentEmailStatuses([]);
        setShowTemplateSelection(false);
        setShowTemplateEditor(false);
        setShowTemplatePreview(false);
        setEditingTemplate(null);
        closeAllDialogs();
    };

    // Initialize email statuses and show template selection when dialog opens
    useEffect(() => {
        if (isSendEmailOpen) {
            const students = isBulkAction
                ? bulkActionInfo?.selectedStudents || []
                : selectedStudent
                  ? [selectedStudent]
                  : [];

            const studentsWithEmail = students.filter((student) => student.email);
            setStudentEmailStatuses(
                studentsWithEmail.map((student) => ({
                    userId: student.user_id,
                    name: student.full_name,
                    email: student.email,
                    status: 'pending' as EmailSendingStatus,
                }))
            );

            // Automatically show template selection dialog
            setShowTemplateSelection(true);
        }
    }, [isSendEmailOpen, bulkActionInfo, selectedStudent, isBulkAction]);

    // Debug state changes
    useEffect(() => {
        console.log('Dialog states:', {
            isSendEmailOpen,
            showTemplateSelection,
            showTemplateEditor,
            showTemplatePreview,
            editingTemplate: editingTemplate?.name || 'null',
        });
    }, [
        isSendEmailOpen,
        showTemplateSelection,
        showTemplateEditor,
        showTemplatePreview,
        editingTemplate,
    ]);

    return (
        <>
            {/* Template Selection Dialog - Shows directly when isSendEmailOpen is true */}
            <TemplateSelectionDialog
                isOpen={isSendEmailOpen && showTemplateSelection}
                onClose={handleClose}
                onSelectTemplate={handleSelectEmailTemplate}
                onCreateNew={handleCreateNewTemplate}
                studentEmailStatuses={studentEmailStatuses}
                isBulkEmailSending={isBulkEmailSending}
                onSendEmail={async (template: MessageTemplate) => {
                    setSelectedTemplate(template);
                    setShowTemplateSelection(false);
                    await handleSendBulkEmail();
                }}
            />

            {/* Template Editor Dialog */}
            <TemplateEditorDialog
                isOpen={showTemplateEditor}
                onClose={() => {
                    console.log('Closing template editor');
                    setShowTemplateEditor(false);
                }}
                onSaveAndSend={handleTemplateSavedAndSent}
                template={editingTemplate}
                isSending={isBulkEmailSending}
                primaryButtonText="Save & Send"
                showPreviewButton={true}
            />

            {/* Template Preview Dialog */}
            <TemplatePreviewDialog
                isOpen={showTemplatePreview}
                onClose={() => {
                    setShowTemplatePreview(false);
                    setShowTemplateSelection(true);
                }}
                template={selectedTemplate}
                onUseTemplate={handleSendEmail}
                isSending={isBulkEmailSending}
            />
        </>
    );
};
