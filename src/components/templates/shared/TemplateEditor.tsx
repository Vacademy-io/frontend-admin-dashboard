import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { EmailRichTextEditor } from './EmailRichTextEditor';
import { TemplatePreview } from './TemplatePreview';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
    MessageTemplate,
    CreateTemplateRequest,
    TEMPLATE_VARIABLES,
} from '@/types/message-template-types';
import {
    Info,
    Edit,
    Plus,
    BookOpen,
    Users,
    Calendar,
    GraduationCap,
    School,
    Award,
    Database,
    Eye,
} from 'lucide-react';
import { extractVariablesFromContent } from './TemplateEditorUtils';

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
    const [isInSourceView, setIsInSourceView] = useState(false);
    const isInSourceViewRef = useRef(false);
    const [showPreview, setShowPreview] = useState(false);

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

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log('Form submit triggered', {
            isInSourceViewRef: isInSourceViewRef.current,
            isInSourceView,
            formData: { name: formData.name, content: formData.content }
        });

        // Don't submit if we're in source view (use ref for immediate check)
        if (isInSourceViewRef.current) {
            console.log('Prevented submit: in source view (ref)');
            return;
        }

        // Don't submit if we're in source view (state check as backup)
        if (isInSourceView) {
            console.log('Prevented submit: in source view (state)');
            return;
        }

        // Only prevent submission if the event came from a textarea AND we're in source view
        const target = e.target as HTMLElement;
        if (target.tagName === 'TEXTAREA' && isInSourceView) {
            console.log('Prevented submit: textarea in source view');
            return; // Don't submit if it came from textarea in source view
        }

        if (!formData.name.trim() || !formData.content.trim()) {
            console.log('Prevented submit: missing required fields');
            return;
        }

        console.log('Proceeding with save');
        handleSave(formData);
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

    const handleSourceViewChange = (isSourceView: boolean) => {
        isInSourceViewRef.current = isSourceView;
        setIsInSourceView(isSourceView);
    };

    const handleSubjectChange = (subject: string) => {
        setFormData((prev) => ({ ...prev, subject }));
        const extractedVariables = subject ? extractVariablesFromContent(subject) : [];
        const contentVariables = extractVariablesFromContent(formData.content);
        const allVariables = [...new Set([...extractedVariables, ...contentVariables])];
        setFormData((prev) => ({ ...prev, variables: allVariables }));
    };

    const handleInsertVariable = (variable: string) => {
        // For rich text editor, we'll insert the variable directly
        const currentContent = formData.content;
        const newContent = currentContent + (currentContent ? ' ' : '') + variable;
        setFormData((prev) => ({ ...prev, content: newContent }));
    };

    const getTemplateTypeOptions = (name?: string): 'marketing' | 'utility' | 'transactional' => {
        const templateName = (name || formData.name).toLowerCase();

        if (templateName.includes('welcome') || templateName.includes('enrollment'))
            return 'marketing';
        if (templateName.includes('assignment') || templateName.includes('reminder'))
            return 'utility';
        if (templateName.includes('certificate') || templateName.includes('completion'))
            return 'transactional';

        return 'utility';
    };

    const getCategoryIcon = (category: string) => {
        const iconMap: Record<string, React.ReactNode> = {
            learner: <GraduationCap className="size-4 text-blue-600" />,
            course: <BookOpen className="size-4 text-green-600" />,
            batch: <Users className="size-4 text-purple-600" />,
            institute: <School className="size-4 text-orange-600" />,
            session: <Calendar className="size-4 text-pink-600" />,
            attendance: <Award className="size-4 text-indigo-600" />,
            general: <Database className="size-4 text-gray-600" />,
        };
        return iconMap[category.toLowerCase()] || <Database className="size-4 text-gray-600" />;
    };

    const getVariableDescription = (variable: string): string => {
        const descriptions: Record<string, string> = {
            '{{name}}': "Student's name",
            '{{student_name}}': "Student's name",
            '{{email}}': "Student's email address",
            '{{student_email}}': "Student's email address",
            '{{mobile_number}}': "Student's phone number",
            '{{student_phone}}': "Student's phone number",
            '{{student_id}}': "Student's unique ID",
            '{{enrollment_number}}': 'Enrollment number',
            '{{username}}': 'Login username',
            '{{registration_date}}': 'Registration date',
            '{{student_unique_link}}': 'Student unique link',
            '{{student_referral_code}}': 'Student referral code',
            '{{course_name}}': 'Course name',
            '{{course_description}}': 'Course description',
            '{{course_duration}}': 'Course duration',
            '{{course_price}}': 'Course price',
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

    const handleClose = () => {
        if (isSaving) {
            return;
        }
        onClose();
    };

    const handleSave = (data: CreateTemplateRequest) => {
        console.log('handleSave called with data:', data);
        onSave(data);
    };

    const handlePreview = () => {
        const previewTemplate = {
            id: template?.id || 'preview',
            name: formData.name,
            type: formData.type,
            subject: formData.subject,
            content: formData.content,
            variables: formData.variables,
            isDefault: formData.isDefault,
            createdAt: template?.createdAt || new Date().toISOString(),
            updatedAt: template?.updatedAt || new Date().toISOString(),
            instituteId: template?.instituteId || '',
        };

        setShowPreview(true);
    };

    return (
        <>
            <Dialog open={true} onOpenChange={(open) => {
                if (!open) handleClose();
            }}>
                <DialogContent className="max-h-[95vh] w-[95vw] max-w-7xl overflow-hidden p-0 sm:max-w-7xl">
                    <DialogHeader className="border-b border-gray-200 px-6 py-4">
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

                    <div className="flex h-[calc(95vh-120px)] flex-col lg:flex-row">
                        {/* Main Content Area */}
                        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
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
                                    <EmailRichTextEditor
                                        value={formData.content}
                                        onChange={handleContentChange}
                                        placeholder="Enter email body content..."
                                        minHeight={200}
                                        className="w-full"
                                        subject={formData.subject}
                                        onSourceViewChange={handleSourceViewChange}
                                        showPreviewButton={true}
                                        onPreview={handlePreview}
                                    />
                                </div>

                                {/* Template Type and Status */}
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
                                                        <div className="size-3 rounded-full bg-blue-500"></div>
                                                        Marketing
                                                    </div>
                                                </SelectItem>
                                                <SelectItem value="utility">
                                                    <div className="flex items-center gap-2">
                                                        <div className="size-3 rounded-full bg-orange-500"></div>
                                                        Utility
                                                    </div>
                                                </SelectItem>
                                                <SelectItem value="transactional">
                                                    <div className="flex items-center gap-2">
                                                        <div className="size-3 rounded-full bg-purple-500"></div>
                                                        Transactional
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
                                        Use variables like {'{{name}}'} to personalize your
                                        messages. Variables will be replaced with actual data when
                                        sending messages.
                                    </AlertDescription>
                                </Alert>

                                {/* Actions */}
                                <div className="flex flex-col justify-end gap-3 border-t pt-6 sm:flex-row">
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
                                            isSaving ||
                                            !formData.name.trim() ||
                                            !formData.content.trim()
                                        }
                                        onClick={() => {
                                            console.log('Submit button clicked', {
                                                isSaving,
                                                name: formData.name.trim(),
                                                content: formData.content.trim(),
                                                disabled: isSaving || !formData.name.trim() || !formData.content.trim()
                                            });
                                        }}
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
                        <div className="w-full overflow-y-auto border-t border-gray-200 bg-gray-50/50 p-4 sm:p-6 lg:w-80 lg:border-l lg:border-t-0">
                            <div className="space-y-6">
                                <div>
                                    <h3 className="mb-2 text-lg font-semibold text-gray-900">
                                        Insert Dynamic Values
                                    </h3>
                                    <p className="text-sm text-gray-600">
                                        Click on any variable to insert it into your template
                                    </p>
                                </div>

                                {/* Variable Categories */}
                                {Object.entries(TEMPLATE_VARIABLES).map(([category, variables]) => (
                                    <div key={category} className="space-y-3">
                                        <h4 className="flex items-center gap-2 text-sm font-medium capitalize text-gray-900">
                                            {getCategoryIcon(category)}
                                            {category}
                                        </h4>
                                        <div className="space-y-2">
                                            {variables.map((variable) => (
                                                <div
                                                    key={variable}
                                                    className="group cursor-pointer rounded-lg border border-gray-200 bg-white p-3 transition-colors hover:border-primary-300 hover:bg-primary-50/50"
                                                    onClick={() => handleInsertVariable(variable)}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className="shrink-0">
                                                            <Plus className="size-4 text-gray-400 transition-all group-hover:scale-110 group-hover:text-primary-500" />
                                                        </div>
                                                        <div className="flex-1">
                                                            <div className="text-primary-600 group-hover:text-primary-700 font-mono text-sm">
                                                                {variable}
                                                            </div>
                                                            <div className="mt-1 text-xs text-gray-500">
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

            {/* Template Preview Dialog */}
            {showPreview && (
                <>
                    <TemplatePreview
                        isOpen={showPreview}
                        onClose={() => setShowPreview(false)}
                        template={{
                            id: template?.id || 'preview',
                            name: formData.name,
                            type: formData.type,
                            subject: formData.subject,
                            content: formData.content,
                            variables: formData.variables,
                            isDefault: formData.isDefault || false,
                            createdAt: template?.createdAt || new Date().toISOString(),
                            updatedAt: template?.updatedAt || new Date().toISOString(),
                            instituteId: template?.instituteId || '',
                        }}
                    />
                </>
            )}
        </>
    );
};
