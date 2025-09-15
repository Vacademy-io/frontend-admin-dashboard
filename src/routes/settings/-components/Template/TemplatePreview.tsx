import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MessageTemplate } from '@/types/message-template-types';
import {
    X,
    Mail,
    MessageCircle,
    Calendar,
    User,
    Star,
    Copy,
    Edit
} from 'lucide-react';

interface TemplatePreviewProps {
    template: MessageTemplate;
    onClose: () => void;
}

export const TemplatePreview: React.FC<TemplatePreviewProps> = ({
    template,
    onClose,
}) => {
    const [showVariables, setShowVariables] = useState(false);

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const getPreviewContent = () => {
        let content = template.content;
        template.variables.forEach(variable => {
            const placeholder = variable.replace('{{', '').replace('}}', '');
            content = content.replace(new RegExp(variable, 'g'), `[${placeholder}]`);
        });
        return content;
    };

    const getPreviewSubject = () => {
        if (!template.subject) return '';
        let subject = template.subject;
        template.variables.forEach(variable => {
            const placeholder = variable.replace('{{', '').replace('}}', '');
            subject = subject.replace(new RegExp(variable, 'g'), `[${placeholder}]`);
        });
        return subject;
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
    };

    return (
        <Dialog open={true} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto w-[90vw]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        {template.type === 'email' ? (
                            <Mail className="size-5 text-blue-600" />
                        ) : (
                            <MessageCircle className="size-5 text-green-600" />
                        )}
                        {template.name}
                        {template.isDefault && (
                            <Badge variant="secondary" className="ml-2">
                                <Star className="size-3 mr-1" />
                                Default
                            </Badge>
                        )}
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Template Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Calendar className="size-4" />
                                <span>Created: {formatDate(template.createdAt)}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Calendar className="size-4" />
                                <span>Updated: {formatDate(template.updatedAt)}</span>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                <User className="size-4" />
                                <span>Created by: {template.createdBy}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                <span>Type: {template.type.toUpperCase()}</span>
                            </div>
                        </div>
                    </div>

                    {/* Subject (for email templates) */}
                    {template.subject && (
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <h3 className="text-sm font-medium text-gray-700">Subject</h3>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => copyToClipboard(template.subject!)}
                                    className="h-8 w-8 p-0"
                                >
                                    <Copy className="size-4" />
                                </Button>
                            </div>
                            <div className="p-3 bg-white border rounded-lg">
                                <p className="text-sm">{getPreviewSubject()}</p>
                            </div>
                        </div>
                    )}

                    {/* Content */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-medium text-gray-700">Content</h3>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => copyToClipboard(template.content)}
                                className="h-8 w-8 p-0"
                            >
                                <Copy className="size-4" />
                            </Button>
                        </div>
                        <div className="p-3 bg-white border rounded-lg">
                            <pre className="text-sm whitespace-pre-wrap font-sans">
                                {getPreviewContent()}
                            </pre>
                        </div>
                    </div>

                    {/* Variables */}
                    {template.variables.length > 0 && (
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <h3 className="text-sm font-medium text-gray-700">
                                    Variables ({template.variables.length})
                                </h3>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setShowVariables(!showVariables)}
                                >
                                    {showVariables ? 'Hide' : 'Show'} Variables
                                </Button>
                            </div>
                            {showVariables && (
                                <div className="p-3 bg-white border rounded-lg">
                                    <div className="flex flex-wrap gap-2">
                                        {template.variables.map((variable, index) => (
                                            <Badge key={index} variant="outline" className="text-xs">
                                                {variable}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex justify-end gap-2 pt-4 border-t">
                        <Button variant="outline" onClick={onClose}>
                            Close
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};
