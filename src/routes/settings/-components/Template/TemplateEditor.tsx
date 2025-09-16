import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { MessageTemplate, CreateTemplateRequest } from '@/types/message-template-types';
import { Info, Edit, Plus } from 'lucide-react';
import { TemplateFormHeader } from './TemplateFormHeader';
import { TemplateContentSection } from './TemplateContentSection';
import { TemplateVariablesSection } from './TemplateVariablesSection';
import { TemplatePreviewModal } from './TemplatePreviewModal';
import { extractVariablesFromContent, insertVariableAtCursor } from './TemplateEditorUtils';

interface TemplateEditorProps {
    template: MessageTemplate | null;
    onSave: (template: CreateTemplateRequest) => void;
    onClose: () => void;
    isSaving: boolean;
}

export const TemplateEditor: React.FC<TemplateEditorProps> = ({
    template,
    onSave,
    onClose,
    isSaving,
}) => {
    const [formData, setFormData] = useState<CreateTemplateRequest>({
        name: '',
        type: 'EMAIL',
        subject: '',
        content: '',
        variables: [],
        isDefault: false,
    });
    const [showPreview, setShowPreview] = useState(false);
    const [selectedVariable, setSelectedVariable] = useState<string>('');
    const [customMessage, setCustomMessage] = useState(
        'Thank you for being part of our learning community.'
    );

    useEffect(() => {
        if (template) {
            setFormData({
                name: template.name,
                type: template.type,
                subject: template.subject || '',
                content: template.content,
                variables: template.variables,
                isDefault: template.isDefault,
            });
        } else {
            setFormData({
                name: '',
                type: 'EMAIL',
                subject: '',
                content: '',
                variables: [],
                isDefault: false,
            });
        }
    }, [template]);

    const handleInputChange = (field: keyof CreateTemplateRequest, value: string | boolean) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleAddVariable = (variable: string) => {
        if (!formData.variables.includes(variable)) {
            setFormData((prev) => ({
                ...prev,
                variables: [...prev.variables, variable],
            }));
        }
    };

    const handleRemoveVariable = (variable: string) => {
        setFormData((prev) => ({
            ...prev,
            variables: prev.variables.filter((v) => v !== variable),
        }));
    };

    const handleInsertVariable = (variable: string) => {
        const textarea = document.getElementById('content') as HTMLTextAreaElement;
        if (textarea) {
            insertVariableAtCursor(textarea, variable, formData.content, (newContent) => {
                setFormData((prev) => ({ ...prev, content: newContent }));
            });
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name.trim() || !formData.content.trim()) {
            return;
        }
        onSave(formData);
    };

    const handleContentChange = (content: string) => {
        setFormData((prev) => ({ ...prev, content }));
        const extractedVariables = extractVariablesFromContent(content);
        const subjectVariables = formData.subject
            ? extractVariablesFromContent(formData.subject)
            : [];
        const allVariables = [...new Set([...extractedVariables, ...subjectVariables])];
        setFormData((prev) => ({ ...prev, variables: allVariables }));
    };

    const handleSubjectChange = (subject: string) => {
        setFormData((prev) => ({ ...prev, subject }));
        const extractedVariables = subject ? extractVariablesFromContent(subject) : [];
        const contentVariables = extractVariablesFromContent(formData.content);
        const allVariables = [...new Set([...extractedVariables, ...contentVariables])];
        setFormData((prev) => ({ ...prev, variables: allVariables }));
    };

    return (
        <>
            <Dialog open={true} onOpenChange={onClose}>
                <DialogContent className="max-h-[95vh] w-[95vw] max-w-6xl overflow-y-auto">
                    <DialogHeader className="mb-6">
                        <DialogTitle className="flex items-center gap-2">
                            {template ? (
                                <>
                                    <Edit className="size-5" />
                                    Edit Template
                                </>
                            ) : (
                                <>
                                    <Plus className="size-5" />
                                    Create Template
                                </>
                            )}
                        </DialogTitle>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* Header Section */}
                        <TemplateFormHeader
                            formData={formData}
                            template={template}
                            onInputChange={handleInputChange}
                        />

                        {/* Content Section */}
                        <TemplateContentSection
                            formData={formData}
                            customMessage={customMessage}
                            showPreview={showPreview}
                            onSubjectChange={handleSubjectChange}
                            onContentChange={handleContentChange}
                            onCustomMessageChange={setCustomMessage}
                            onTogglePreview={() => setShowPreview(!showPreview)}
                        />

                        {/* Variables Section */}
                        <TemplateVariablesSection
                            formData={formData}
                            selectedVariable={selectedVariable}
                            onVariableSearch={setSelectedVariable}
                            onInsertVariable={handleInsertVariable}
                            onAddVariable={handleAddVariable}
                            onRemoveVariable={handleRemoveVariable}
                        />

                        {/* Info Alert */}
                        <Alert>
                            <Info className="size-4" />
                            <AlertDescription>
                                Use variables like {'{{name}}'} to personalize your messages.
                                Variables will be replaced with actual data when sending messages.
                            </AlertDescription>
                        </Alert>

                        {/* Actions */}
                        <div className="flex justify-end gap-3 border-t pt-6">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={onClose}
                                className="h-10 px-6"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={
                                    isSaving || !formData.name.trim() || !formData.content.trim()
                                }
                                className="hover:bg-primary-600 h-10 bg-primary-500 px-6 text-white disabled:bg-gray-300 disabled:text-gray-500"
                            >
                                {isSaving
                                    ? 'Saving...'
                                    : template
                                      ? 'Update Template'
                                      : 'Create Template'}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Template Preview Modal */}
            <TemplatePreviewModal
                isOpen={
                    showPreview &&
                    (!!formData.content.trim() ||
                        (formData.type === 'EMAIL' && !!formData.subject?.trim()))
                }
                onClose={() => setShowPreview(false)}
                formData={formData}
                customMessage={customMessage}
            />
        </>
    );
};
