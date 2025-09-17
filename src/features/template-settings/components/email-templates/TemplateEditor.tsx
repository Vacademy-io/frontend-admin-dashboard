import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { MessageTemplate, CreateTemplateRequest, TEMPLATE_VARIABLES } from '@/types/message-template-types';
import { Info, Edit, Plus, Eye, X, User, BookOpen, Users, Building, Calendar, Clock, Globe, GraduationCap, School, MapPin, Award, FileText, Database } from 'lucide-react';
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
    const [templateType, setTemplateType] = useState<string>('utility');
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
            setTemplateType(getTemplateTypeOptions());
        } else {
            setFormData({
                name: '',
                type: 'EMAIL',
                subject: '',
                content: '',
                variables: [],
                isDefault: false,
            });
            setTemplateType('utility');
        }
    }, [template]);

    // Auto-update template type when name changes
    useEffect(() => {
        if (formData.name) {
            const autoType = getTemplateTypeOptions(formData.name);
            setTemplateType(autoType);
        }
    }, [formData.name]);

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

    const getTemplateTypeOptions = (name?: string) => {
        const templateName = (name || formData.name).toLowerCase();
        if (templateName.includes('welcome') || templateName.includes('enrollment')) return 'marketing';
        if (templateName.includes('assignment') || templateName.includes('reminder')) return 'utility';
        if (templateName.includes('certificate') || templateName.includes('completion')) return 'transactional';
        return 'utility';
    };

    const getStatusOptions = () => {
        return formData.isDefault ? 'active' : 'draft';
    };

    const handleInsertVariable = (variable: string) => {
        const textarea = document.getElementById('content') as HTMLTextAreaElement;
        if (textarea) {
            insertVariableAtCursor(textarea, variable, formData.content, (newContent) => {
                setFormData((prev) => ({ ...prev, content: newContent }));
            });
        }
    };

    const getCategoryIcon = (category: string) => {
        const iconMap: Record<string, React.ReactNode> = {
            'learner': <GraduationCap className="size-4 text-blue-600" />,
            'course': <BookOpen className="size-4 text-green-600" />,
            'batch': <Users className="size-4 text-purple-600" />,
            'institute': <School className="size-4 text-orange-600" />,
            'session': <Calendar className="size-4 text-pink-600" />,
            'attendance': <Award className="size-4 text-indigo-600" />,
            'general': <Database className="size-4 text-gray-600" />,
        };
        return iconMap[category.toLowerCase()] || <Database className="size-4 text-gray-600" />;
    };

    const getVariableDescription = (variable: string): string => {
        const descriptions: Record<string, string> = {
            '{{name}}': 'Student\'s name',
            '{{student_name}}': 'Student\'s name',
            '{{email}}': 'Student\'s email address',
            '{{student_email}}': 'Student\'s email address',
            '{{mobile_number}}': 'Student\'s phone number',
            '{{student_phone}}': 'Student\'s phone number',
            '{{student_id}}': 'Student\'s unique ID',
            '{{enrollment_number}}': 'Enrollment number',
            '{{username}}': 'Login username',
            '{{registration_date}}': 'Registration date',
            '{{course_name}}': 'Course name',
            '{{course_description}}': 'Course description',
            '{{course_duration}}': 'Course duration',
            '{{course_price}}': 'Course price',
            '{{session_name}}': 'Session name',
            '{{session_date}}': 'Session date',
            '{{session_time}}': 'Session time',
            '{{session_duration}}': 'Session duration',
            '{{session_link}}': 'Session link',
            '{{batch_name}}': 'Batch name',
            '{{batch_id}}': 'Batch identifier',
            '{{batch_start_date}}': 'Batch start date',
            '{{batch_end_date}}': 'Batch end date',
            '{{institute_name}}': 'Institute name',
            '{{institute_address}}': 'Institute address',
            '{{institute_phone}}': 'Institute phone number',
            '{{institute_email}}': 'Institute email',
            '{{institute_website}}': 'Institute website',
            '{{attendance_status}}': 'Attendance status',
            '{{attendance_date}}': 'Attendance date',
            '{{attendance_percentage}}': 'Attendance percentage',
            '{{custom_message_text}}': 'Custom message placeholder',
            '{{custom_field_1}}': 'Custom field 1',
            '{{custom_field_2}}': 'Custom field 2',
            '{{current_date}}': 'Current date',
            '{{current_time}}': 'Current time',
            '{{year}}': 'Current year',
            '{{month}}': 'Current month',
            '{{day}}': 'Current day',
        };
        return descriptions[variable] || 'Dynamic value';
    };

    return (
        <>
            <Dialog open={true} onOpenChange={onClose}>
                <DialogContent className="max-h-[95vh] w-[95vw] max-w-7xl overflow-hidden p-0">
                    <DialogHeader className="px-6 py-4 border-b border-gray-200">
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

                    <div className="flex h-[calc(95vh-120px)]">
                        {/* Main Content Area */}
                        <div className="flex-1 p-6 overflow-y-auto">
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Template Name */}
                                <div className="space-y-2">
                                    <Label htmlFor="name" className="text-sm font-medium">
                                        Template Name
                                    </Label>
                                    <Input
                                        id="name"
                                        value={formData.name}
                                        onChange={(e) => handleInputChange('name', e.target.value)}
                                        placeholder="Enter template name..."
                                        className="w-full"
                                    />
                                </div>

                                {/* Email Subject */}
                                {formData.type === 'EMAIL' && (
                                    <div className="space-y-2">
                                        <Label htmlFor="subject" className="text-sm font-medium">
                                            Email Subject
                                        </Label>
                                        <Input
                                            id="subject"
                                            value={formData.subject}
                                            onChange={(e) => handleSubjectChange(e.target.value)}
                                            placeholder="Enter email subject..."
                                            className="w-full"
                                        />
                                    </div>
                                )}

                                {/* Email Body */}
                                <div className="space-y-2">
                                    <Label htmlFor="content" className="text-sm font-medium">
                                        Email Body
                                    </Label>
                                    <Textarea
                                        id="content"
                                        value={formData.content}
                                        onChange={(e) => handleContentChange(e.target.value)}
                                        placeholder="Enter email body content..."
                                        className="w-full min-h-[200px] resize-none"
                                    />
                                </div>

                                {/* Template Type and Status */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium">Email Type</Label>
                                        <Select
                                            value={templateType}
                                            onValueChange={(value) => {
                                                setTemplateType(value);
                                            }}
                                        >
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Select email type" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="marketing">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                                                        Marketing
                                                    </div>
                                                </SelectItem>
                                                <SelectItem value="utility">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                                                        Utility
                                                    </div>
                                                </SelectItem>
                                                <SelectItem value="transactional">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                                                        Transactional
                                                    </div>
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium">Status</Label>
                                        <Select
                                            value={formData.isDefault ? 'active' : 'draft'}
                                            onValueChange={(value) => {
                                                handleInputChange('isDefault', value === 'active');
                                            }}
                                        >
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Select status" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="draft">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-3 h-3 rounded-full bg-gray-500"></div>
                                                        Draft
                                                    </div>
                                                </SelectItem>
                                                <SelectItem value="active">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                                                        Active
                                                    </div>
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
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
                                <div className="flex justify-end gap-3 pt-6 border-t">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={onClose}
                                className="h-10 px-6"
                            >
                                Cancel
                            </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setShowPreview(true)}
                                        className="h-10 px-6 flex items-center gap-2"
                                    >
                                        <Eye className="size-4" />
                                        Preview
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
                        </div>

                        {/* Sidebar - Dynamic Values */}
                        <div className="w-80 border-l border-gray-200 bg-gray-50/50 p-6 overflow-y-auto">
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                        Insert Dynamic Values
                                    </h3>
                                    <p className="text-sm text-gray-600">
                                        Click on any variable to insert it into your template
                                    </p>
                                </div>

                                    {/* Variable Categories */}
                                    {Object.entries(TEMPLATE_VARIABLES).map(([category, variables]) => (
                                        <div key={category} className="space-y-3">
                                            <h4 className="text-sm font-medium text-gray-900 capitalize flex items-center gap-2">
                                                {getCategoryIcon(category)}
                                                {category}
                                            </h4>
                                            <div className="space-y-2">
                                                {variables.map((variable) => (
                                                    <div
                                                        key={variable}
                                                        className="p-3 bg-white border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50/50 cursor-pointer transition-colors group"
                                                        onClick={() => handleInsertVariable(variable)}
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <div className="flex-shrink-0">
                                                                <Plus className="size-4 text-gray-400 group-hover:text-primary-500 group-hover:scale-110 transition-all" />
                                                            </div>
                                                            <div className="flex-1">
                                                                <div className="text-sm font-mono text-primary-600 group-hover:text-primary-700">
                                                                    {variable}
                                                                </div>
                                                                <div className="text-xs text-gray-500 mt-1">
                                                                    {getVariableDescription(variable)}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                            </div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Template Preview Modal */}
            {showPreview && (
                <Dialog open={showPreview} onOpenChange={setShowPreview}>
                    <DialogContent className="max-w-2xl">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                <Eye className="size-5" />
                                Template Preview
                            </DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                            {formData.type === 'EMAIL' && formData.subject && (
                                <div>
                                    <Label className="text-sm font-medium text-gray-600">Subject:</Label>
                                    <div className="p-3 bg-gray-50 border rounded-md text-sm">
                                        {formData.subject}
                                    </div>
                                </div>
                            )}
                            <div>
                                <Label className="text-sm font-medium text-gray-600">Content:</Label>
                                <div className="p-3 bg-gray-50 border rounded-md text-sm whitespace-pre-wrap">
                                    {formData.content || 'No content'}
                                </div>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            )}
        </>
    );
};
