import React, { useState } from 'react';
import { MyDialog } from '@/components/design-system/dialog';
import { MyButton } from '@/components/design-system/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useDialogStore } from '../../../../-hooks/useDialogStore';
import { PaperPlaneTilt, Spinner } from '@phosphor-icons/react';
import { toast } from 'sonner';

// Define message templates
const MESSAGE_TEMPLATES = [
    {
        id: 'template1',
        name: 'Welcome Message',
        content: 'Hello {{name}}! Welcome to our learning platform.',
    },
    {
        id: 'template2',
        name: 'Session Reminder',
        content: 'Hi {{name}}, this is a reminder about your upcoming session.',
    },
    {
        id: 'template3',
        name: 'Assignment Due',
        content: 'Hey {{name}}, your assignment is due soon. Please complete it on time.',
    },
    { id: 'template4', name: 'Custom Message', content: 'Hi {{name}}, {{custom_message_text}}' },
];

type MessageSendingStatus = 'pending' | 'sending' | 'sent' | 'failed';

interface StudentMessageStatus {
    userId: string;
    name: string;
    status: MessageSendingStatus;
    error?: string;
}

export const SendMessageDialog = () => {
    const { isSendMessageOpen, bulkActionInfo, closeAllDialogs } = useDialogStore();
    const [selectedTemplateId, setSelectedTemplateId] = useState<string>(
        MESSAGE_TEMPLATES[0]?.id || ''
    );
    const [studentMessageStatuses, setStudentMessageStatuses] = useState<StudentMessageStatus[]>(
        []
    );
    const [isBulkSending, setIsBulkSending] = useState(false);

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

        const template = MESSAGE_TEMPLATES.find((t) => t.id === selectedTemplateId);
        if (!template) {
            toast.error('Selected template not found.');
            setIsBulkSending(false);
            return;
        }

        setIsBulkSending(true);
        toast.info('Starting to send messages...', { id: 'bulk-send-progress' });

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
                // Replace placeholders in the message
                let messageContent = template.content.replace(/\{\{name\}\}/g, student.full_name);
                // Add other placeholder replacements as needed
                messageContent = messageContent.replace(
                    /\{\{mobile_number\}\}/g,
                    student.mobile_number || ''
                );
                messageContent = messageContent.replace(
                    /\{\{custom_message_text\}\}/g,
                    'Please check your dashboard for updates.'
                );

                await mockSendMessageAPI(student.user_id, student.full_name, messageContent);

                setStudentMessageStatuses((prev) =>
                    prev.map((s) => (s.userId === student.user_id ? { ...s, status: 'sent' } : s))
                );
            } catch (error: any) {
                setStudentMessageStatuses((prev) =>
                    prev.map((s) =>
                        s.userId === student.user_id
                            ? { ...s, status: 'failed', error: error.message }
                            : s
                    )
                );
            }
        }

        setIsBulkSending(false);
        const sentCount = studentMessageStatuses.filter((s) => s.status === 'sent').length;
        const failedCount = studentMessageStatuses.filter((s) => s.status === 'failed').length;
        toast.success(`Finished: ${sentCount} sent, ${failedCount} failed.`, {
            id: 'bulk-send-progress',
            duration: 5000,
        });
    };

    const handleClose = () => {
        if (isBulkSending) return;
        setStudentMessageStatuses([]);
        setSelectedTemplateId(MESSAGE_TEMPLATES[0]?.id || '');
        closeAllDialogs();
    };

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
                        disabled={isBulkSending}
                    >
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select a template" />
                        </SelectTrigger>
                        <SelectContent>
                            {MESSAGE_TEMPLATES.map((template) => (
                                <SelectItem key={template.id} value={template.id}>
                                    {template.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {selectedTemplateId && (
                    <div className="rounded-lg bg-neutral-50 p-3">
                        <div className="mb-1 text-sm font-medium text-neutral-700">Preview:</div>
                        <div className="text-sm text-neutral-600">
                            {MESSAGE_TEMPLATES.find((t) => t.id === selectedTemplateId)?.content ||
                                ''}
                        </div>
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
