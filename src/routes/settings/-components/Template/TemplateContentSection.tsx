import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { CreateTemplateRequest } from '@/types/message-template-types';
import { Eye, EyeOff } from 'lucide-react';

interface TemplateContentSectionProps {
    formData: CreateTemplateRequest;
    customMessage: string;
    showPreview: boolean;
    onSubjectChange: (subject: string) => void;
    onContentChange: (content: string) => void;
    onCustomMessageChange: (message: string) => void;
    onTogglePreview: () => void;
}

export const TemplateContentSection: React.FC<TemplateContentSectionProps> = ({
    formData,
    customMessage,
    showPreview,
    onSubjectChange,
    onContentChange,
    onCustomMessageChange,
    onTogglePreview,
}) => {
    return (
        <div className="space-y-6">
            {/* Subject (for email templates) */}
            {formData.type === 'EMAIL' && (
                <div className="space-y-3">
                    <Label htmlFor="subject" className="text-sm font-medium">
                        Email Subject
                    </Label>
                    <Input
                        id="subject"
                        value={formData.subject}
                        onChange={(e) => onSubjectChange(e.target.value)}
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
                        onClick={onTogglePreview}
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
                    onChange={(e) => onContentChange(e.target.value)}
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
                    onChange={(e) => onCustomMessageChange(e.target.value)}
                    placeholder="Enter custom message text that will replace {{custom_message_text}} variable"
                    className="h-10"
                />
                <p className="text-xs text-gray-500">
                    This text will be used to replace the {'{{custom_message_text}}'}{' '}
                    variable in your template content.
                </p>
            </div>
        </div>
    );
};

