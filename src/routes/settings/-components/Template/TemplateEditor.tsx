import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
    MessageTemplate,
    CreateTemplateRequest,
    TEMPLATE_VARIABLES,
} from '@/types/message-template-types';
import { X, Plus, Info, Mail, MessageCircle, Eye, EyeOff, Edit } from 'lucide-react';

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
            const start = textarea.selectionStart;
            const end = textarea.selectionEnd;
            const text = formData.content;
            const before = text.substring(0, start);
            const after = text.substring(end);
            const newContent = before + variable + after;

            setFormData((prev) => ({ ...prev, content: newContent }));

            // Set cursor position after the inserted variable
            setTimeout(() => {
                textarea.focus();
                textarea.setSelectionRange(start + variable.length, start + variable.length);
            }, 0);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name.trim() || !formData.content.trim()) {
            return;
        }
        onSave(formData);
    };

    // Function to generate preview with sample data (like email dialog)
    const generatePreview = () => {
        const currentDate = new Date().toLocaleDateString();

        const replacements = {
            '{{name}}': 'John Doe',
            '{{email}}': 'john.doe@example.com',
            '{{mobile_number}}': '+1234567890',
            '{{custom_message_text}}': customMessage,
            '{{course_name}}': 'Mathematics Course',
            '{{batch_name}}': 'Batch A',
            '{{session_name}}': 'Session 2024',
            '{{username}}': 'johndoe',
            '{{registration_date}}': '2024-01-15',
            '{{current_date}}': currentDate,
            '{{student_name}}': 'John Doe',
            '{{student_email}}': 'john.doe@example.com',
            '{{student_phone}}': '+1234567890',
            '{{student_id}}': 'STU001',
            '{{enrollment_number}}': 'ENR001',
        };

        let previewSubject = formData.subject || '';
        let previewContent = formData.content || '';

        // Replace all placeholders
        Object.entries(replacements).forEach(([placeholder, value]) => {
            previewSubject = previewSubject.replace(
                new RegExp(placeholder.replace(/[{}]/g, '\\$&'), 'g'),
                value
            );
            previewContent = previewContent.replace(
                new RegExp(placeholder.replace(/[{}]/g, '\\$&'), 'g'),
                value
            );
        });

        return { subject: previewSubject, content: previewContent };
    };

    const extractVariablesFromContent = (content: string) => {
        const variableRegex = /\{\{([^}]+)\}\}/g;
        const matches = content.match(variableRegex);
        return matches ? [...new Set(matches)] : [];
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
                        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                            {/* Template Name */}
                            <div className="space-y-2">
                                <Label htmlFor="name" className="text-sm font-medium">
                                    Template Name *
                                </Label>
                                <Input
                                    id="name"
                                    value={formData.name}
                                    onChange={(e) => handleInputChange('name', e.target.value)}
                                    placeholder="Enter template name"
                                    className="h-10"
                                    required
                                />
                            </div>

                            {/* Template Type */}
                            <div className="space-y-2">
                                <Label className="text-sm font-medium">Template Type *</Label>
                                <div className="flex gap-2">
                                    <Button
                                        type="button"
                                        variant={formData.type === 'EMAIL' ? 'default' : 'outline'}
                                        onClick={() => handleInputChange('type', 'EMAIL')}
                                        className={`flex h-10 items-center gap-2 px-4 ${
                                            formData.type === 'EMAIL'
                                                ? 'hover:bg-primary-600 bg-primary-500 text-white'
                                                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                                        }`}
                                    >
                                        <Mail className="size-4" />
                                        Email
                                    </Button>
                                    <Button
                                        type="button"
                                        variant={
                                            formData.type === 'WHATSAPP' ? 'default' : 'outline'
                                        }
                                        onClick={() => handleInputChange('type', 'WHATSAPP')}
                                        className={`flex h-10 items-center gap-2 px-4 ${
                                            formData.type === 'WHATSAPP'
                                                ? 'hover:bg-primary-600 bg-primary-500 text-white'
                                                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                                        }`}
                                    >
                                        <MessageCircle className="size-4" />
                                        WhatsApp
                                    </Button>
                                </div>
                            </div>

                            {/* Default Template Toggle */}
                            <div className="space-y-2">
                                <Label className="text-sm font-medium">Settings</Label>
                                <div className="flex h-10 items-center space-x-2">
                                    <Switch
                                        id="isDefault"
                                        checked={formData.isDefault}
                                        onCheckedChange={(checked) =>
                                            handleInputChange('isDefault', checked)
                                        }
                                    />
                                    <Label htmlFor="isDefault" className="text-sm">
                                        Set as default for {formData.type} messages
                                    </Label>
                                </div>
                            </div>
                        </div>

                        {/* Subject (for email templates) */}
                        {formData.type === 'EMAIL' && (
                            <div className="space-y-3">
                                <Label htmlFor="subject" className="text-sm font-medium">
                                    Email Subject
                                </Label>
                                <Input
                                    id="subject"
                                    value={formData.subject}
                                    onChange={(e) => handleSubjectChange(e.target.value)}
                                    placeholder="Enter email subject line..."
                                    className="h-10"
                                />
                            </div>
                        )}

                        {/* Content Section */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="content" className="text-sm font-medium">
                                    Message Content *
                                </Label>
                                <Button
                                    type="button"
                                    variant={showPreview ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => setShowPreview(!showPreview)}
                                    disabled={
                                        !formData.content.trim() &&
                                        !(formData.type === 'EMAIL' && formData.subject?.trim())
                                    }
                                    className={`flex h-8 items-center gap-2 ${
                                        showPreview
                                            ? 'hover:bg-primary-600 bg-primary-500 text-white'
                                            : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                                    }`}
                                >
                                    {showPreview ? (
                                        <EyeOff className="size-4" />
                                    ) : (
                                        <Eye className="size-4" />
                                    )}
                                    {showPreview ? 'Hide Preview' : 'Show Preview'}
                                </Button>
                            </div>
                            <Textarea
                                id="content"
                                value={formData.content}
                                onChange={(e) => handleContentChange(e.target.value)}
                                placeholder="Enter your message content... Use variables like {{name}} to personalize messages."
                                className="min-h-[250px] text-sm"
                                required
                            />
                        </div>

                        {/* Custom Message Text Field */}
                        <div className="space-y-3">
                            <Label htmlFor="customMessage" className="text-sm font-medium">
                                Custom Message Text (for {'{{custom_message_text}}'} placeholder)
                            </Label>
                            <Input
                                id="customMessage"
                                value={customMessage}
                                onChange={(e) => setCustomMessage(e.target.value)}
                                placeholder="Enter custom message text that will replace {{custom_message_text}} variable"
                                className="h-10"
                            />
                            <p className="text-xs text-gray-500">
                                This text will be used to replace the {'{{custom_message_text}}'}{' '}
                                variable in your template content.
                            </p>
                        </div>

                        {/* Variables Section */}
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <Label className="text-sm font-medium">Available Variables</Label>
                                <div className="flex items-center gap-2">
                                    <Input
                                        placeholder="Search variables..."
                                        value={selectedVariable}
                                        onChange={(e) => setSelectedVariable(e.target.value)}
                                        className="h-8 w-64"
                                    />
                                </div>
                            </div>

                            {/* Variables Grid */}
                            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                                {Object.entries(TEMPLATE_VARIABLES).map(([category, variables]) => {
                                    // Prioritize most commonly used variables
                                    const sortedVariables = [...variables].sort(
                                        (a: string, b: string) => {
                                            const priorityOrder = [
                                                '{{name}}',
                                                '{{email}}',
                                                '{{mobile_number}}',
                                                '{{custom_message_text}}',
                                                '{{course_name}}',
                                                '{{session_name}}',
                                                '{{current_date}}',
                                            ];
                                            const aIndex = priorityOrder.indexOf(a);
                                            const bIndex = priorityOrder.indexOf(b);
                                            if (aIndex === -1 && bIndex === -1) return 0;
                                            if (aIndex === -1) return 1;
                                            if (bIndex === -1) return -1;
                                            return aIndex - bIndex;
                                        }
                                    );
                                    const filteredVariables = sortedVariables.filter(
                                        (variable: string) =>
                                            variable
                                                .toLowerCase()
                                                .includes(selectedVariable.toLowerCase())
                                    );

                                    if (filteredVariables.length === 0) return null;

                                    return (
                                        <div
                                            key={category}
                                            className="space-y-3 rounded-lg border bg-gray-50 p-4"
                                        >
                                            <h4 className="text-sm font-semibold capitalize text-gray-800">
                                                {category} Variables
                                            </h4>
                                            <div className="flex flex-wrap gap-2">
                                                {filteredVariables.map((variable: string) => (
                                                    <div
                                                        key={variable}
                                                        className="flex items-center gap-1"
                                                    >
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() =>
                                                                handleInsertVariable(variable)
                                                            }
                                                            className="h-7 px-2 text-xs"
                                                        >
                                                            {variable}
                                                        </Button>
                                                        {!formData.variables.includes(variable) && (
                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() =>
                                                                    handleAddVariable(variable)
                                                                }
                                                                className="size-6 p-0 hover:bg-blue-100"
                                                            >
                                                                <Plus className="size-3" />
                                                            </Button>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Selected Variables */}
                            {formData.variables.length > 0 && (
                                <div className="space-y-3 rounded-lg border bg-blue-50 p-4">
                                    <Label className="text-sm font-medium text-blue-800">
                                        Used Variables ({formData.variables.length})
                                    </Label>
                                    <div className="flex flex-wrap gap-2">
                                        {formData.variables.map((variable: string) => (
                                            <Badge
                                                key={variable}
                                                variant="secondary"
                                                className="flex items-center gap-1 bg-blue-100 text-blue-800"
                                            >
                                                {variable}
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleRemoveVariable(variable)}
                                                    className="size-4 p-0 hover:bg-transparent"
                                                >
                                                    <X className="size-3" />
                                                </Button>
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

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
            <Dialog
                open={
                    showPreview &&
                    (!!formData.content.trim() ||
                        (formData.type === 'EMAIL' && !!formData.subject?.trim()))
                }
                onOpenChange={setShowPreview}
            >
                <DialogContent className="max-h-[90vh] w-[90vw] max-w-4xl overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="mb-4 flex items-center gap-2">
                            <Eye className="size-5" />
                            Template Preview
                        </DialogTitle>
                    </DialogHeader>

                    <div className="mb-6 space-y-4">
                        {generatePreview().subject && (
                            <div className="space-y-2">
                                <div className="text-sm font-medium text-gray-700">Subject:</div>
                                <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 text-gray-800">
                                    {generatePreview().subject}
                                </div>
                            </div>
                        )}

                        {generatePreview().content && (
                            <div className="space-y-2">
                                <div className="text-sm font-medium text-gray-700">
                                    {formData.type === 'EMAIL' ? 'Email Body:' : 'Message Content:'}
                                </div>
                                <div className="max-h-96 overflow-y-auto whitespace-pre-wrap rounded-lg border border-gray-200 bg-gray-50 p-4 text-gray-800">
                                    {generatePreview().content}
                                </div>
                            </div>
                        )}

                        {customMessage && (
                            <div className="rounded border border-blue-200 bg-blue-50 p-3">
                                <div className="mb-1 text-xs font-medium text-blue-600">
                                    Custom Message Text:
                                </div>
                                <div className="text-sm text-blue-800">{customMessage}</div>
                            </div>
                        )}

                        {!generatePreview().subject && !generatePreview().content && (
                            <div className="py-8 text-center text-gray-500">
                                <Eye className="mx-auto mb-2 size-8 opacity-50" />
                                <p>
                                    No content to preview. Add a subject or content to see the
                                    preview.
                                </p>
                            </div>
                        )}
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setShowPreview(false)}
                            className="mt-4"
                        >
                            Close
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
};
