import React from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, CheckCircle2, XCircle, Info } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { ValidationResult } from '@/utils/template-validation';

interface TemplateValidationDialogProps {
    isOpen: boolean;
    onClose: () => void;
    validationResult: ValidationResult | null;
    onRetry?: () => void;
    onProceedAnyway?: () => void;
    templateName?: string;
}

export const TemplateValidationDialog: React.FC<TemplateValidationDialogProps> = ({
    isOpen,
    onClose,
    validationResult,
    onRetry,
    onProceedAnyway,
    templateName = 'Template'
}) => {
    if (!validationResult) return null;

    const { isValid, canSend, missingVariables, warnings, availableVariables, errorMessage } = validationResult;

    const getStatusIcon = () => {
        if (isValid && canSend) {
            return <CheckCircle2 className="h-5 w-5 text-green-500" />;
        } else if (missingVariables.length > 0) {
            return <XCircle className="h-5 w-5 text-red-500" />;
        } else if (warnings.length > 0) {
            return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
        }
        return <Info className="h-5 w-5 text-blue-500" />;
    };

    const getStatusMessage = () => {
        if (isValid && canSend) {
            return {
                title: 'Template Ready to Send',
                description: 'All required variables are available. You can proceed with sending the email.',
                variant: 'default' as const
            };
        } else if (missingVariables.length > 0) {
            return {
                title: 'Cannot Send Email',
                description: `The template "${templateName}" cannot be sent because ${missingVariables.length} required variable${missingVariables.length > 1 ? 's' : ''} ${missingVariables.length > 1 ? 'are' : 'is'} missing from the available data.`,
                variant: 'destructive' as const
            };
        } else if (warnings.length > 0) {
            return {
                title: 'Template Warnings',
                description: 'The template has some warnings but can still be sent.',
                variant: 'default' as const
            };
        }
        return {
            title: 'Template Validation',
            description: 'Please review the template validation results.',
            variant: 'default' as const
        };
    };

    const status = getStatusMessage();

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-7xl max-h-[95vh] overflow-hidden">
                <DialogHeader className="pb-6">
                    <DialogTitle className="flex items-center gap-3 text-xl">
                        {getStatusIcon()}
                        {status.title}
                    </DialogTitle>
                    <DialogDescription className="text-base mt-3">
                        {status.description}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-8 overflow-y-auto max-h-[calc(95vh-200px)] pr-2 [&::-webkit-scrollbar]:hidden" style={{scrollbarWidth: 'none', msOverflowStyle: 'none'}}>
                    {/* Error Message */}
                    {errorMessage && (
                        <Alert variant="destructive">
                            <AlertTriangle className="h-4 w-4" />
                            <AlertDescription>{errorMessage}</AlertDescription>
                        </Alert>
                    )}

                    {/* Missing Variables */}
                    {missingVariables.length > 0 && (
                        <div className="space-y-2">
                            <h4 className="text-sm font-medium text-red-600 flex items-center gap-2">
                                <XCircle className="h-4 w-4" />
                                Missing Variables ({missingVariables.length})
                            </h4>
                            <div className="flex flex-wrap gap-2">
                                {missingVariables.map((variable) => (
                                    <Badge key={variable} variant="destructive" className="text-xs">
                                        {variable}
                                    </Badge>
                                ))}
                            </div>
                            <p className="text-sm text-muted-foreground">
                                These variables are not available in the current context. Please either:
                                <br />
                                • Remove them from the template, or
                                <br />
                                • Ensure the required data is available
                            </p>
                        </div>
                    )}

                    {/* Warnings */}
                    {warnings.length > 0 && (
                        <div className="space-y-2">
                            <h4 className="text-sm font-medium text-yellow-600 flex items-center gap-2">
                                <AlertTriangle className="h-4 w-4" />
                                Warnings ({warnings.length})
                            </h4>
                            <div className="space-y-1">
                                {warnings.map((warning, index) => (
                                    <p key={index} className="text-sm text-muted-foreground">
                                        • {warning}
                                    </p>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Not Available Variables */}
                    {(() => {
                        const notAvailableVariables = Object.entries(availableVariables).filter(([variable, value]) =>
                            value === null || value === undefined || value === '' || value === 'Not Available'
                        );

                        if (notAvailableVariables.length > 0) {
                            return (
                                <div className="space-y-6">
                                    <div className="flex items-center gap-3">
                                        <XCircle className="h-5 w-5 text-red-500" />
                                        <h4 className="text-lg font-semibold text-red-700">
                                            Not Available Variables
                            </h4>
                                        <span className="px-3 py-1 bg-red-100 text-red-700 text-sm font-medium rounded-full">
                                            {notAvailableVariables.length}
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
                                        {notAvailableVariables.map(([variable, value]) => (
                                            <div key={variable} className="group p-4 rounded-xl border-2 border-red-200 bg-gradient-to-br from-red-50 to-red-100 hover:from-red-100 hover:to-red-150 transition-all duration-200 hover:border-red-300 hover:shadow-md">
                                                <div className="font-mono font-semibold text-sm text-red-800 mb-2 break-all">
                                                    {variable}
                                                </div>
                                                <div className="flex items-center gap-2 text-red-600 text-sm">
                                                    <span className="text-lg">❌</span>
                                                    <span className="font-medium">Not Available</span>
                                                </div>
                                            </div>
                                ))}
                            </div>
                        </div>
                            );
                        }
                        return null;
                    })()}


                    {/* Success Message */}
                    {isValid && canSend && (
                        <Alert>
                            <CheckCircle2 className="h-4 w-4" />
                            <AlertDescription>
                                All template variables are resolved successfully. The email can be sent to all recipients.
                            </AlertDescription>
                        </Alert>
                    )}
                </div>

                <DialogFooter className="flex gap-3 pt-6 border-t border-gray-200">
                    <Button variant="outline" onClick={onClose}>
                        {isValid && canSend ? 'Close' : 'Cancel'}
                    </Button>

                    {onRetry && !isValid && (
                        <Button variant="outline" onClick={onRetry}>
                            Retry Validation
                        </Button>
                    )}

                    {onProceedAnyway && !canSend && (
                        <Button
                            variant="destructive"
                            onClick={onProceedAnyway}
                            disabled={missingVariables.length > 0}
                        >
                            Send Anyway
                        </Button>
                    )}

                    {isValid && canSend && (
                        <Button onClick={onClose}>
                            Continue Sending
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
