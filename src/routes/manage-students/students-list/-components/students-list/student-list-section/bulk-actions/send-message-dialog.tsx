import React, { useState, useEffect } from 'react';
import { MyDialog } from '@/components/design-system/dialog';
import { MyButton } from '@/components/design-system/button';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useDialogStore } from '../../../../-hooks/useDialogStore';
import { PaperPlaneTilt, Spinner, CircleNotch, Eye } from '@phosphor-icons/react';
import { toast } from 'sonner';
import { templateCacheService } from '@/services/template-cache-service';
import { MessageTemplate } from '@/types/message-template-types';

// Message templates will be loaded dynamically from API

type MessageSendingStatus = 'pending' | 'sending' | 'sent' | 'failed';

// Define placeholder variables that users can insert (only those with available data)
const PLACEHOLDER_VARIABLES = [
    { label: 'Student Name', value: '{{name}}' },
    { label: 'Mobile Number', value: '{{mobile_number}}' },
    { label: 'Custom Message', value: '{{custom_message_text}}' },
    { label: 'Current Date', value: '{{current_date}}' },
];

interface StudentMessageStatus {
    userId: string;
    name: string;
    status: MessageSendingStatus;
    error?: string;
}

export const SendMessageDialog = () => {
    const { isSendMessageOpen, bulkActionInfo, closeAllDialogs } = useDialogStore();
    const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
    const [studentMessageStatuses, setStudentMessageStatuses] = useState<StudentMessageStatus[]>(
        []
    );
    const [isBulkSending, setIsBulkSending] = useState(false);
    const [messageTemplates, setMessageTemplates] = useState<MessageTemplate[]>([]);
    const [isLoadingTemplates, setIsLoadingTemplates] = useState(false);
    const [customMessage, setCustomMessage] = useState(
        'Please check your dashboard for updates.'
    );
    const [showPreview, setShowPreview] = useState(false);

    const loadMessageTemplates = async () => {
        setIsLoadingTemplates(true);
        try {
            const templates = await templateCacheService.getTemplates('WHATSAPP');
            setMessageTemplates(templates);
        } catch (error) {
            console.error('Error loading message templates:', error);
            toast.error('Failed to load message templates');
        } finally {
            setIsLoadingTemplates(false);
        }
    };

    // Mock API function - replace with your actual API
    const mockSendMessageAPI = (
        userId: string,
        userName: string,
        message: string
    ): Promise<void> => {
        return new Promise((resolve, reject) => {
            setTimeout(
                () => {
                    // Simulate success/failure randomly
                    if (Math.random() > 0.2) {
                        // 80% success rate
                        console.log(
                            `Mock API: Message sent to ${userName} (${userId}): ${message}`
                        );
                        resolve();
                    } else {
                        console.error(`Mock API: Failed to send to ${userName} (${userId})`);
                        reject(new Error('Simulated API Error'));
                    }
                },
                1000 + Math.random() * 1500
            ); // Simulate network delay
        });
    };

    const processSendMessageQueue = async () => {
        if (!selectedTemplateId || !bulkActionInfo) {
            toast.error('No template selected or students available.');
            setIsBulkSending(false);
            return;
        }

        const template = messageTemplates.find((t) => t.id === selectedTemplateId);
        if (!template) {
            toast.error('Selected template not found.');
            setIsBulkSending(false);
            return;
        }

        setIsBulkSending(true);
        toast.info('Starting to send messages...', { id: 'bulk-send-progress' });

        // Track null values for reporting
        const nullValueReport = {
            missingNames: 0,
            missingMobileNumbers: 0,
            totalStudents: bulkActionInfo.selectedStudents.length
        };

        // Initialize status for all students
        const initialStatuses = bulkActionInfo.selectedStudents.map((student) => ({
            userId: student.user_id,
            name: student.full_name,
            status: 'pending' as MessageSendingStatus,
        }));
        setStudentMessageStatuses(initialStatuses);

        for (const student of bulkActionInfo.selectedStudents) {
            setStudentMessageStatuses((prev) =>
                prev.map((s) => (s.userId === student.user_id ? { ...s, status: 'sending' } : s))
            );

            try {
                // Replace placeholders in the message with available data only
                const currentDate = new Date().toLocaleDateString();

                // Track and log null values for debugging
                if (!student.full_name) {
                    nullValueReport.missingNames++;
                    console.warn(`⚠️ Null name for student ${student.user_id}:`, student);
                }
                if (!student.mobile_number) {
                    nullValueReport.missingMobileNumbers++;
                    console.warn(`⚠️ Null mobile_number for student ${student.user_id}:`, student);
                }

                let messageContent = template.content.replace(/\{\{name\}\}/g, student.full_name || 'Student');
                messageContent = messageContent.replace(
                    /\{\{mobile_number\}\}/g,
                    student.mobile_number || ''
                );
                messageContent = messageContent.replace(
                    /\{\{custom_message_text\}\}/g,
                    customMessage
                );
                messageContent = messageContent.replace(
                    /\{\{current_date\}\}/g,
                    currentDate
                );

                await mockSendMessageAPI(student.user_id, student.full_name, messageContent);

                setStudentMessageStatuses((prev) =>
                    prev.map((s) => (s.userId === student.user_id ? { ...s, status: 'sent' } : s))
                );
            } catch (error: unknown) {
                setStudentMessageStatuses((prev) =>
                    prev.map((s) =>
                        s.userId === student.user_id
                            ? {
                                  ...s,
                                  status: 'failed',
                                  error: error instanceof Error ? error.message : 'Unknown error',
                              }
                            : s
                    )
                );
            }
        }

        // Log null value summary
        console.log('📊 Null Value Report (WhatsApp):', {
            totalStudents: nullValueReport.totalStudents,
            missingNames: nullValueReport.missingNames,
            missingMobileNumbers: nullValueReport.missingMobileNumbers,
            processedStudents: bulkActionInfo.selectedStudents.length
        });

        setIsBulkSending(false);
        const sentCount = studentMessageStatuses.filter((s) => s.status === 'sent').length;
        const failedCount = studentMessageStatuses.filter((s) => s.status === 'failed').length;
        toast.success(`Finished: ${sentCount} sent, ${failedCount} failed.`, {
            id: 'bulk-send-progress',
            duration: 5000,
        });
    };

    // Function to generate preview with sample data
    const generatePreview = () => {
        if (!selectedTemplateId || !bulkActionInfo?.selectedStudents.length) {
            return '';
        }

        const template = messageTemplates.find((t) => t.id === selectedTemplateId);
        if (!template) return '';

        const sampleStudent = bulkActionInfo.selectedStudents[0];
        const currentDate = new Date().toLocaleDateString();

        const replacements = {
            '{{name}}': sampleStudent?.full_name || 'John Doe',
            '{{mobile_number}}': sampleStudent?.mobile_number || '+1234567890',
            '{{custom_message_text}}': customMessage,
            '{{current_date}}': currentDate,
        };

        let previewContent = template.content;

        // Replace all placeholders
        Object.entries(replacements).forEach(([placeholder, value]) => {
            previewContent = previewContent.replace(
                new RegExp(placeholder.replace(/[{}]/g, '\\$&'), 'g'),
                value
            );
        });

        return previewContent;
    };

    const handleClose = () => {
        if (isBulkSending) return;
        setStudentMessageStatuses([]);
        setSelectedTemplateId('');
        setShowPreview(false);
        closeAllDialogs();
    };

    // Load templates when dialog opens
    useEffect(() => {
        if (isSendMessageOpen) {
            loadMessageTemplates();
        }
    }, [isSendMessageOpen]);

    const selectedStudentsCount = bulkActionInfo?.selectedStudents.length || 0;

    return (
        <MyDialog
            heading="Send WhatsApp Message"
            open={isSendMessageOpen}
            onOpenChange={handleClose}
            dialogWidth="w-[90vw] max-w-md"
            footer={
                <div className="flex items-center justify-end gap-2">
                    <MyButton
                        buttonType="secondary"
                        scale="medium"
                        onClick={handleClose}
                        disable={isBulkSending}
                    >
                        Cancel
                    </MyButton>
                    <MyButton
                        buttonType="primary"
                        scale="medium"
                        onClick={processSendMessageQueue}
                        disable={
                            !selectedTemplateId || selectedStudentsCount === 0 || isBulkSending
                        }
                        className="min-w-[120px] bg-green-600 text-white hover:bg-green-700"
                    >
                        {isBulkSending ? (
                            <>
                                <Spinner className="mr-2 size-4 animate-spin" />
                                Sending...
                            </>
                        ) : (
                            <>
                                <PaperPlaneTilt className="mr-2 size-4" />
                                Send to {selectedStudentsCount}
                            </>
                        )}
                    </MyButton>
                </div>
            }
        >
            <div className="space-y-4">
                <div className="mb-4 text-sm text-neutral-600">
                    Select a template to send to {selectedStudentsCount} student(s).
                </div>

                <div>
                    <label className="mb-2 block text-sm font-medium text-neutral-700">
                        Message Template
                    </label>
                    <Select
                        value={selectedTemplateId}
                        onValueChange={(value: string) => setSelectedTemplateId(value)}
                        disabled={isBulkSending || isLoadingTemplates}
                    >
                        <SelectTrigger className="w-full">
                            <SelectValue
                                placeholder={
                                    isLoadingTemplates
                                        ? 'Loading templates...'
                                        : 'Select a template'
                                }
                            />
                        </SelectTrigger>
                        <SelectContent>
                            {isLoadingTemplates ? (
                                <SelectItem value="loading" disabled>
                                    <div className="flex items-center gap-2">
                                        <CircleNotch className="size-4 animate-spin" />
                                        Loading templates...
                                    </div>
                                </SelectItem>
                            ) : (
                                messageTemplates.map((template) => (
                                    <SelectItem key={template.id} value={template.id}>
                                        {template.name}
                                    </SelectItem>
                                ))
                            )}
                        </SelectContent>
                    </Select>
                </div>

                {/* Custom Message Field */}
                <div>
                    <label className="mb-2 block text-sm font-medium text-neutral-700">
                        Custom Message Text (for {'{{custom_message_text}}'} placeholder)
                    </label>
                    <Textarea
                        value={customMessage}
                        onChange={(e) => setCustomMessage(e.target.value)}
                        placeholder="Enter custom message text that will replace {{custom_message_text}} variable"
                        disabled={isBulkSending}
                        className="min-h-[80px]"
                    />
                </div>

                {/* Available Variables */}
                <div>
                    <div className="mb-2 text-sm font-medium text-neutral-700">
                        Available Variables (click to insert):
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {PLACEHOLDER_VARIABLES.map((placeholder) => (
                            <MyButton
                                key={placeholder.value}
                                buttonType="secondary"
                                scale="small"
                                onClick={() => {
                                    // For WhatsApp, we can't edit the template content directly
                                    // This is just for reference
                                }}
                                disabled={isBulkSending}
                                className="px-3 py-1 text-xs hover:bg-blue-50 hover:text-blue-700"
                            >
                                {placeholder.label}
                            </MyButton>
                        ))}
                    </div>
                </div>

                {selectedTemplateId && (
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <div className="text-sm font-medium text-neutral-700">Template Preview:</div>
                            <MyButton
                                buttonType="secondary"
                                scale="small"
                                onClick={() => setShowPreview(!showPreview)}
                                disabled={!selectedTemplateId}
                                className="text-xs"
                            >
                                <Eye className="mr-1 size-3" />
                                {showPreview ? 'Hide Preview' : 'Show Preview'}
                            </MyButton>
                        </div>

                        {showPreview ? (
                            <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-3">
                                <div className="text-sm text-neutral-800 whitespace-pre-wrap">
                                    {generatePreview()}
                                </div>
                            </div>
                        ) : (
                            <div className="rounded-lg bg-neutral-50 p-3">
                                <div className="text-sm text-neutral-600">
                                    {messageTemplates.find((t) => t.id === selectedTemplateId)?.content || ''}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {isBulkSending && studentMessageStatuses.length > 0 && (
                    <div className="max-h-48 space-y-2 overflow-y-auto pr-2">
                        <p className="mb-2 text-sm font-medium">
                            Sending Progress (
                            {
                                studentMessageStatuses.filter(
                                    (s) => s.status === 'sent' || s.status === 'failed'
                                ).length
                            }
                            /{studentMessageStatuses.length}):
                        </p>
                        {studentMessageStatuses.map((s) => (
                            <div
                                key={s.userId}
                                className="flex items-center justify-between rounded bg-neutral-100 p-1.5 text-xs"
                            >
                                <span className="max-w-[150px] truncate">{s.name}</span>
                                <div className="shrink-0">
                                    {s.status === 'pending' && (
                                        <span className="text-neutral-500">Pending...</span>
                                    )}
                                    {s.status === 'sending' && (
                                        <Spinner className="size-3 animate-spin text-blue-500" />
                                    )}
                                    {s.status === 'sent' && (
                                        <span className="font-medium text-green-600">Sent</span>
                                    )}
                                    {s.status === 'failed' && (
                                        <span className="font-medium text-red-600" title={s.error}>
                                            Failed
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </MyDialog>
    );
};
