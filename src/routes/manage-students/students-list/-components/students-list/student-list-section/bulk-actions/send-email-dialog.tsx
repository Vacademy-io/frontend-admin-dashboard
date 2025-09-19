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
            if (!userPayload) {
                continue;
            }

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
        } else {
            toast.error(`Failed to send all ${failureCount} email(s).`, {
                id: 'bulk-email-progress',
            });
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
