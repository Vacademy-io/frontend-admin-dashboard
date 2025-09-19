import React, { useState, useEffect } from 'react';
import { useDialogStore } from '../../../../-hooks/useDialogStore';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';
import { MessageTemplate } from '@/types/message-template-types';
import { getInstituteId } from '@/constants/helper';
import { TemplateSelectionDialog } from './template-selection-dialog';
import { TemplateEditorDialog, TemplatePreviewDialog } from '@/components/templates/shared';
import { mapTemplateVariables } from '@/utils/template-variable-mapper';

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


    // Helper functions to break down the complex handleSendBulkEmail function
    const validateEmailTemplate = () => {
        if (!selectedTemplate) {
            toast.error('No template selected.');
            return false;
        }

        const trimmedEmailSubject = selectedTemplate.subject?.trim() || '';
        const trimmedEmailBody = selectedTemplate.content?.trim() || '';
        if (!trimmedEmailSubject || !trimmedEmailBody) {
            toast.error('Template subject and body are required.');
            return false;
        }

        if (studentEmailStatuses.length === 0) {
            toast.error('No valid recipients to send email to.');
            return false;
        }

        return { trimmedEmailSubject, trimmedEmailBody };
    };

    const prepareStudentPayloads = (trimmedEmailSubject: string, trimmedEmailBody: string) => {
        const students = isBulkAction
            ? bulkActionInfo?.selectedStudents || []
            : selectedStudent
              ? [selectedStudent]
              : [];

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
                }
                if (!student.email) {
                    nullValueReport.missingEmails++;
                }
                if (!student.mobile_number) {
                    nullValueReport.missingMobileNumbers++;
                }

                // Map template variables for this student
                const mappedSubject = mapTemplateVariables(trimmedEmailSubject, {
                    context: 'student-management',
                    student: student
                });
                const mappedBody = mapTemplateVariables(trimmedEmailBody, {
                    context: 'student-management',
                    student: student
                });

                return {
                    user_id: student.user_id,
                    channel_id: student.email,
                    subject: mappedSubject,
                    body: mappedBody,
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

        return { apiUsersPayload, nullValueReport };
    };

    const sendEmailToStudent = async (userPayload: any, url: string) => {
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
                return { success: true, error: null };
            } else {
                const errorData = await response
                    .json()
                    .catch(() => ({ message: 'Failed to parse error response' }));
                const errorMsg = `Student ${userPayload.user_id}: ${errorData.message || response.statusText}`;
                return { success: false, error: errorMsg };
            }
        } catch (error: any) {
            const errorMsg = `Student ${userPayload.user_id}: ${error.message || 'Network error'}`;
            return { success: false, error: errorMsg };
        }
    };

    const updateStudentStatus = (userId: string, status: 'sent' | 'failed', error?: string) => {
        setStudentEmailStatuses((prevStatuses) =>
            prevStatuses.map((s) =>
                s.userId === userId
                    ? { ...s, status, error }
                    : s
            )
        );
    };

    const showFinalResults = (successCount: number, failureCount: number) => {
        if (successCount > 0 && failureCount === 0) {
            toast.success(`Successfully sent ${successCount} personalized email(s).`, {
                id: 'bulk-email-progress',
            });
        } else if (successCount > 0 && failureCount > 0) {
            toast.warning(`Sent ${successCount} email(s), ${failureCount} failed.`, {
                id: 'bulk-email-progress',
            });
        } else {
            toast.error(`Failed to send all ${failureCount} email(s).`, {
                id: 'bulk-email-progress',
            });
        }
    };

    const handleSendBulkEmail = async () => {
        // Validate template and get trimmed content
        const validation = validateEmailTemplate();
        if (!validation) return;

        const { trimmedEmailSubject, trimmedEmailBody } = validation;

        // Prepare student payloads
        const { apiUsersPayload, nullValueReport } = prepareStudentPayloads(trimmedEmailSubject, trimmedEmailBody);

        if (apiUsersPayload.length === 0) {
            toast.error('Could not prepare payload for any student.');
            setIsBulkEmailSending(false);
            setStudentEmailStatuses((prevStatuses) =>
                prevStatuses.map((s) => ({ ...s, status: 'pending' }))
            );
            return;
        }

        // Set up sending state
        setIsBulkEmailSending(true);
        toast.info('Processing emails...', { id: 'bulk-email-progress' });

        setStudentEmailStatuses((prevStatuses) =>
            prevStatuses.map((s) => ({ ...s, status: 'sending' }))
        );

        // Prepare API URL
        const instituteId = getInstituteId();
        const baseUrl = `${import.meta.env.VITE_BACKEND_URL || 'https://backend-stage.vacademy.io'}/notification-service/v1/send-email-to-users-public`;
        const url = instituteId ? `${baseUrl}?instituteId=${instituteId}` : baseUrl;

        // Process each student
        let successCount = 0;
        let failureCount = 0;

        for (const userPayload of apiUsersPayload) {
            if (!userPayload) continue;

            const result = await sendEmailToStudent(userPayload, url);

            if (result.success) {
                successCount++;
                updateStudentStatus(userPayload.user_id, 'sent');
            } else {
                failureCount++;
                updateStudentStatus(userPayload.user_id, 'failed', result.error || 'Unknown error');
            }
        }

        // Show results and reset state
        showFinalResults(successCount, failureCount);
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
        } else {
            // Reset states when dialog closes
            setShowTemplateSelection(false);
            setShowTemplateEditor(false);
            setShowTemplatePreview(false);
            setEditingTemplate(null);
        }
    }, [isSendEmailOpen, bulkActionInfo, selectedStudent, isBulkAction]);


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
                onSendEmail={handleSendEmail}
            />

            {/* Template Editor Dialog */}
            <TemplateEditorDialog
                isOpen={showTemplateEditor}
                onClose={() => {
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
