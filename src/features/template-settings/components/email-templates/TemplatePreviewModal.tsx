import React from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CreateTemplateRequest } from '@/types/message-template-types';
import { Eye } from 'lucide-react';
import { generatePreview } from './TemplateEditorUtils';

interface TemplatePreviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    formData: CreateTemplateRequest;
    customMessage: string;
}

export const TemplatePreviewModal: React.FC<TemplatePreviewModalProps> = ({
    isOpen,
    onClose,
    formData,
    customMessage,
}) => {
    const preview = generatePreview(formData, customMessage);

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-h-[90vh] w-[90vw] max-w-4xl overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="mb-4 flex items-center gap-2">
                        <Eye className="size-5" />
                        Template Preview
                    </DialogTitle>
                </DialogHeader>

                <div className="mb-6 space-y-4">
                    {preview.subject && (
                        <div className="space-y-2">
                            <div className="text-sm font-medium text-gray-700">Subject:</div>
                            <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 text-gray-800">
                                {preview.subject}
                            </div>
                        </div>
                    )}

                    {preview.content && (
                        <div className="space-y-2">
                            <div className="text-sm font-medium text-gray-700">
                                {formData.type === 'EMAIL' ? 'Email Body:' : 'Message Content:'}
                            </div>
                            <div className="max-h-96 overflow-y-auto whitespace-pre-wrap rounded-lg border border-gray-200 bg-gray-50 p-4 text-gray-800">
                                {preview.content}
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

                    {!preview.subject && !preview.content && (
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
                        onClick={onClose}
                        className="mt-4"
                    >
                        Close
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

