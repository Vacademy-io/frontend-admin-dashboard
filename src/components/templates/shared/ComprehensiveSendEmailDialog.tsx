import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Send, AlertTriangle, CheckCircle2, Users, Mail } from 'lucide-react';
import { MessageTemplate } from '@/types/message-template-types';
import { EmailSendingService, EmailSendButton, TemplateValidationDialog } from './';
import { ValidationResult } from '@/utils/template-validation';

interface ComprehensiveSendEmailDialogProps {
    isOpen: boolean;
    onClose: () => void;
    selectedTemplate: MessageTemplate | null;
    students: any[];
    context: 'student-management' | 'announcements' | 'attendance-report' | 'referral-settings';
    pageContext?: any;
    notificationType?: 'EMAIL' | 'WHATSAPP';
    source: string;
    sourceId: string;
}

export const ComprehensiveSendEmailDialog: React.FC<ComprehensiveSendEmailDialogProps> = ({
    isOpen,
    onClose,
    selectedTemplate,
    students,
    context,
    pageContext,
    notificationType = 'EMAIL',
    source,
    sourceId
}) => {
    const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
    const [showValidationDialog, setShowValidationDialog] = useState(false);

    // Filter students with valid email addresses
    const validStudents = students.filter(student => student.email);

    useEffect(() => {
        if (isOpen && selectedTemplate) {
            // Reset validation state when dialog opens
            setValidationResult(null);
            setShowValidationDialog(false);
        }
    }, [isOpen, selectedTemplate]);

    const handleClose = () => {
        setValidationResult(null);
        setShowValidationDialog(false);
        onClose();
    };

    if (!selectedTemplate) {
        return null;
    }

    return (
        <EmailSendingService>
            {({ sendEmail, isSending, validationResult: serviceValidationResult, showValidationDialog: serviceShowValidationDialog, onCloseValidationDialog, onRetryValidation }) => (
                <>
                    <Dialog open={isOpen} onOpenChange={handleClose}>
                        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle className="flex items-center gap-2">
                                    <Mail className="h-5 w-5" />
                                    Send Email
                                </DialogTitle>
                                <DialogDescription>
                                    Send personalized emails to selected students using the template.
                                </DialogDescription>
                            </DialogHeader>

                            <div className="space-y-6">
                                {/* Template Information */}
                                <div className="space-y-2">
                                    <h4 className="text-sm font-medium">Template Details</h4>
                                    <div className="p-3 bg-muted rounded-lg space-y-2">
                                        <div className="flex items-center justify-between">
                                            <span className="font-medium">{selectedTemplate.name}</span>
                                            <Badge variant="outline">{selectedTemplate.type}</Badge>
                                        </div>
                                        {selectedTemplate.subject && (
                                            <p className="text-sm text-muted-foreground">
                                                Subject: {selectedTemplate.subject}
                                            </p>
                                        )}
                                        <p className="text-sm text-muted-foreground line-clamp-3">
                                            {selectedTemplate.content}
                                        </p>
                                    </div>
                                </div>

                                {/* Recipients Information */}
                                <div className="space-y-2">
                                    <h4 className="text-sm font-medium">Recipients</h4>
                                    <div className="flex items-center gap-4">
                                        <div className="flex items-center gap-2">
                                            <Users className="h-4 w-4" />
                                            <span className="text-sm">
                                                {validStudents.length} student{validStudents.length > 1 ? 's' : ''}
                                            </span>
                                        </div>
                                        <Badge variant="outline">
                                            {notificationType}
                                        </Badge>
                                        <Badge variant="outline">
                                            {context.replace('-', ' ')}
                                        </Badge>
                                    </div>

                                    {validStudents.length === 0 && (
                                        <Alert variant="destructive">
                                            <AlertTriangle className="h-4 w-4" />
                                            <AlertDescription>
                                                No valid email addresses found in the selected students.
                                            </AlertDescription>
                                        </Alert>
                                    )}
                                </div>

                                {/* Validation Status */}
                                {serviceValidationResult && (
                                    <div className="space-y-2">
                                        <h4 className="text-sm font-medium">Template Validation</h4>
                                        <div className="p-3 bg-muted rounded-lg">
                                            <div className="flex items-center gap-2 mb-2">
                                                {serviceValidationResult.canSend ? (
                                                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                                                ) : (
                                                    <AlertTriangle className="h-4 w-4 text-red-500" />
                                                )}
                                                <span className="text-sm font-medium">
                                                    {serviceValidationResult.canSend ? 'Ready to Send' : 'Cannot Send'}
                                                </span>
                                            </div>

                                            <div className="text-sm space-y-1">
                                                <p>• Available Variables: {Object.keys(serviceValidationResult.availableVariables).length}</p>
                                                <p>• Missing Variables: {serviceValidationResult.missingVariables.length}</p>
                                                <p>• Warnings: {serviceValidationResult.warnings.length}</p>
                                            </div>

                                            {serviceValidationResult.missingVariables.length > 0 && (
                                                <div className="mt-2">
                                                    <p className="text-sm text-red-600 font-medium">Missing Variables:</p>
                                                    <div className="flex flex-wrap gap-1 mt-1">
                                                        {serviceValidationResult.missingVariables.slice(0, 5).map((variable) => (
                                                            <Badge key={variable} variant="destructive" className="text-xs">
                                                                {variable}
                                                            </Badge>
                                                        ))}
                                                        {serviceValidationResult.missingVariables.length > 5 && (
                                                            <Badge variant="outline" className="text-xs">
                                                                +{serviceValidationResult.missingVariables.length - 5} more
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Action Buttons */}
                                <div className="flex items-center justify-between pt-4 border-t">
                                    <Button variant="outline" onClick={handleClose} disabled={isSending}>
                                        Cancel
                                    </Button>

                                    <div className="flex items-center gap-2">
                                        <EmailSendButton
                                            onClick={() => sendEmail({
                                                template: selectedTemplate.content,
                                                subject: selectedTemplate.subject || '',
                                                students: validStudents,
                                                context,
                                                pageContext,
                                                notificationType,
                                                source,
                                                sourceId,
                                                templateName: selectedTemplate.name
                                            })}
                                            isSending={isSending}
                                            validationResult={serviceValidationResult}
                                            disabled={validStudents.length === 0}
                                        />
                                    </div>
                                </div>
                            </div>
                        </DialogContent>
                    </Dialog>

                    <TemplateValidationDialog
                        isOpen={serviceShowValidationDialog}
                        onClose={onCloseValidationDialog}
                        validationResult={serviceValidationResult}
                        onRetry={onRetryValidation}
                        templateName={selectedTemplate.name}
                    />
                </>
            )}
        </EmailSendingService>
    );
};
