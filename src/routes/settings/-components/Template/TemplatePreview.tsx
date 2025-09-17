import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MessageTemplate } from '@/types/message-template-types';
import { Mail, MessageSquare, Calendar, User } from 'lucide-react';

interface TemplatePreviewProps {
    template: MessageTemplate | null;
    isOpen: boolean;
    onClose: () => void;
}

export const TemplatePreview: React.FC<TemplatePreviewProps> = ({ template, isOpen, onClose }) => {
    if (!template) return null;

    const getTemplateTypeColor = (type: string) => {
        switch (type.toUpperCase()) {
            case 'EMAIL':
                return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'WHATSAPP':
                return 'bg-green-100 text-green-800 border-green-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getStatusColor = (isDefault: boolean) => {
        return isDefault
            ? 'bg-green-100 text-green-800 border-green-200'
            : 'bg-gray-100 text-gray-800 border-gray-200';
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-h-[90vh] w-[95vw] max-w-6xl overflow-hidden p-0 flex flex-col">
                <DialogHeader className="shrink-0 border-b border-gray-200 px-6 py-4">
                    <DialogTitle className="flex items-center gap-3 text-xl font-semibold text-gray-900">
                        <div className="flex size-10 items-center justify-center rounded-full border border-blue-200 bg-blue-50">
                            {template.type === 'EMAIL' ? (
                                <Mail className="size-5 text-blue-600" />
                            ) : (
                                <MessageSquare className="size-5 text-green-600" />
                            )}
                        </div>
                        Template Preview
                    </DialogTitle>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
                    <div className="space-y-6">
                        {/* Template Header Info */}
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                            <div className="space-y-4">
                                <div>
                                    <h3 className="mb-2 text-lg font-semibold text-gray-900">
                                        {template.name}
                                    </h3>
                                    <div className="flex flex-wrap gap-2">
                                        <Badge className={getTemplateTypeColor(template.type)}>
                                            {template.type}
                                        </Badge>
                                        <Badge className={getStatusColor(template.isDefault)}>
                                            {template.isDefault ? 'Active' : 'Draft'}
                                        </Badge>
                                    </div>
                                </div>

                                <div>
                                    <h4 className="mb-1 text-sm font-medium text-gray-700">
                                        Subject
                                    </h4>
                                    <p className="rounded-lg border bg-gray-50 p-3 text-sm text-gray-900">
                                        {template.subject || 'No subject provided'}
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <Calendar className="size-4" />
                                    <span>Created: {formatDate(template.createdAt)}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <Calendar className="size-4" />
                                    <span>Updated: {formatDate(template.updatedAt)}</span>
                                </div>
                                {template.createdBy && (
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <User className="size-4" />
                                        <span>Created by: {template.createdBy}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Template Content */}
                        <div className="space-y-4">
                            <h4 className="text-sm font-medium text-gray-700">Template Content</h4>
                            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                                <div
                                    className="prose prose-sm max-w-none text-gray-900"
                                    dangerouslySetInnerHTML={{ __html: template.content }}
                                />
                            </div>
                        </div>

                        {/* Variables Used */}
                        {template.variables && template.variables.length > 0 && (
                            <div className="space-y-4">
                                <h4 className="text-sm font-medium text-gray-700">
                                    Dynamic Variables Used
                                </h4>
                                <div className="flex flex-wrap gap-2">
                                    {template.variables.map((variable, index) => (
                                        <Badge
                                            key={index}
                                            variant="outline"
                                            className="border-blue-200 bg-blue-50 text-blue-700"
                                        >
                                            {`{{${variable}}}`}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="flex justify-end border-t border-gray-200 bg-gray-50 px-6 py-4">
                    <Button onClick={onClose} variant="outline">
                        Close
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};
