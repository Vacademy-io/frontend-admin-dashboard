import React, { useState, useEffect } from 'react';
import { MyDialog } from '@/components/design-system/dialog';
import { MyButton } from '@/components/design-system/button';
import { MyInput } from '@/components/design-system/input';
import { MessageTemplate } from '@/types/message-template-types';
import { templateCacheService } from '@/services/template-cache-service';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';
import { getInstituteId } from '@/constants/helper';
import { Plus, FileText, Eye, CircleNotch, Spinner, Search } from '@phosphor-icons/react';

interface StudentEmailStatus {
    userId: string;
    name: string;
    email: string;
    status: 'pending' | 'sending' | 'sent' | 'failed';
    error?: string;
}

interface TemplateSelectionDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onSelectTemplate: (template: MessageTemplate) => void;
    onCreateNew: () => void;
    studentEmailStatuses: StudentEmailStatus[];
    isBulkEmailSending: boolean;
    onSendEmail: (template: MessageTemplate) => Promise<void>;
}

export const TemplateSelectionDialog: React.FC<TemplateSelectionDialogProps> = ({
    isOpen,
    onClose,
    onSelectTemplate,
    onCreateNew,
    studentEmailStatuses,
    isBulkEmailSending,
    onSendEmail,
}) => {
    const [templates, setTemplates] = useState<MessageTemplate[]>([]);
    const [isLoadingTemplates, setIsLoadingTemplates] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredTemplates, setFilteredTemplates] = useState<MessageTemplate[]>([]);

    const loadTemplates = async () => {
        setIsLoadingTemplates(true);
        try {
            const emailTemplates = await templateCacheService.getTemplates('EMAIL');
            setTemplates(emailTemplates);
            setFilteredTemplates(emailTemplates);
        } catch (error) {
            // Error is already handled by toast.error
            toast.error('Failed to load email templates');
        } finally {
            setIsLoadingTemplates(false);
        }
    };

    // Filter templates based on search query
    useEffect(() => {
        if (!searchQuery.trim()) {
            setFilteredTemplates(templates);
        } else {
            const filtered = templates.filter((template) =>
                template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                template.subject?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                template.content.toLowerCase().includes(searchQuery.toLowerCase())
            );
            setFilteredTemplates(filtered);
        }
    }, [searchQuery, templates]);

    useEffect(() => {
        if (isOpen) {
            loadTemplates();
        }
    }, [isOpen]);

        const handleSelectTemplate = (template: MessageTemplate) => {
            onSelectTemplate(template);
            // Don't close immediately - let parent handle preview dialog
        };

    const handleSendEmail = async (template: MessageTemplate) => {
        try {
            await onSendEmail(template);
            onClose();
        } catch (error) {
            // Error is already handled by toast.error
        }
    };

    const handleCreateNew = () => {
        onCreateNew();
        // Don't close here - let parent handle the dialog flow
    };

    return (
        <MyDialog
            heading="Choose an existing template or create a new one for your email"
            open={isOpen}
            onOpenChange={onClose}
            dialogWidth="w-[90vw] max-w-4xl"
            footer={
                <div className="flex items-center justify-end">
                    <MyButton
                        buttonType="secondary"
                        scale="medium"
                        onClick={onClose}
                        disabled={isBulkEmailSending}
                    >
                        Cancel
                    </MyButton>
                </div>
            }
        >
            <div className="space-y-4">
                {/* Header with Search and Create New Button */}
                <div className="flex items-center justify-between gap-4">
                    <div className="flex-1 max-w-md">
                        <MyInput
                            inputType="text"
                            input={searchQuery}
                            onChangeFunction={(e) => setSearchQuery(e.target.value)}
                            inputPlaceholder="Search templates..."
                            className="w-full"
                        />
                    </div>
                    <MyButton
                        buttonType="primary"
                        scale="medium"
                        onClick={handleCreateNew}
                        disabled={isBulkEmailSending}
                    >
                        <Plus className="mr-2 size-4" />
                        Create New Template
                    </MyButton>
                </div>

                {isLoadingTemplates ? (
                    <div className="flex items-center justify-center py-8">
                        <CircleNotch className="size-6 animate-spin text-blue-600" />
                        <span className="ml-2 text-sm text-neutral-600">Loading templates...</span>
                    </div>
                ) : filteredTemplates.length === 0 ? (
                    <div className="text-center py-8">
                        <FileText className="mx-auto size-12 text-neutral-400 mb-4" />
                        <p className="text-neutral-600 mb-4">
                            {searchQuery ? 'No templates found matching your search.' : 'No email templates found.'}
                        </p>
                        <p className="text-sm text-neutral-500">Create your first template to get started.</p>
                    </div>
                ) : (
                    <div className="border border-neutral-200 rounded-lg overflow-hidden">
                        <table className="w-full">
                            <thead className="bg-neutral-50 border-b border-neutral-200">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-sm font-medium text-neutral-700">Template Name</th>
                                        <th className="px-4 py-3 text-left text-sm font-medium text-neutral-700">Subject</th>
                                        <th className="px-4 py-3 text-left text-sm font-medium text-neutral-700">Content Preview</th>
                                    </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-200">
                                {filteredTemplates.map((template) => (
                                    <tr
                                        key={template.id}
                                        className="hover:bg-neutral-50 cursor-pointer transition-colors"
                                        onClick={() => handleSelectTemplate(template)}
                                    >
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                <FileText className="size-4 text-blue-600" />
                                                <span className="text-sm font-medium text-neutral-800">
                                                    {template.name}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="text-sm text-neutral-700 max-w-xs truncate">
                                                {template.subject || 'No subject'}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div
                                                className="text-sm text-neutral-600 max-w-xs truncate"
                                                dangerouslySetInnerHTML={{
                                                    __html: template.content?.substring(0, 80) + (template.content?.length > 80 ? '...' : '') || 'No content'
                                                }}
                                            />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </MyDialog>
    );
};
