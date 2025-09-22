import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle, XCircle } from 'lucide-react';

interface ValidationFailureDialogProps {
    isOpen: boolean;
    onClose: () => void;
    missingVariables: string[];
    nullOrEmptyVariables: string[];
    availableVariables: Record<string, any>;
    errorMessage?: string;
}

export const ValidationFailureDialog: React.FC<ValidationFailureDialogProps> = ({
    isOpen,
    onClose,
    missingVariables,
    nullOrEmptyVariables,
    availableVariables,
    errorMessage
}) => {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-7xl max-h-[95vh] overflow-hidden">
                <DialogHeader className="pb-6">
                    <DialogTitle className="flex items-center gap-3 text-xl">
                        <AlertTriangle className="h-6 w-6 text-red-500" />
                        Cannot Send Email
                    </DialogTitle>
                    <DialogDescription className="text-base mt-3">
                        The email template contains variables that cannot be resolved with the current context.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-8 overflow-y-auto max-h-[calc(95vh-200px)] pr-2 [&::-webkit-scrollbar]:hidden" style={{scrollbarWidth: 'none', msOverflowStyle: 'none'}}>
                    {errorMessage && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                            <p className="text-sm text-red-800 font-medium">
                                {errorMessage}
                            </p>
                        </div>
                    )}

                    {missingVariables.length > 0 && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                            <p className="text-sm text-red-800 font-medium mb-2">
                                The following variables are missing and cannot be resolved:
                            </p>
                            <div className="space-y-1">
                                {missingVariables.map((variable, index) => (
                                    <div key={index} className="text-sm text-red-700 bg-red-100 px-2 py-1 rounded">
                                        {variable}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {nullOrEmptyVariables.length > 0 && (
                        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                            <p className="text-sm text-orange-800 font-medium mb-2">
                                The following variables have null or empty values and cannot be used:
                            </p>
                            <div className="space-y-1">
                                {nullOrEmptyVariables.map((variable, index) => (
                                    <div key={index} className="text-sm text-orange-700 bg-orange-100 px-2 py-1 rounded">
                                        {variable}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}



                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <p className="text-sm text-blue-800">
                            <strong>Solution:</strong> Edit your template to remove the missing variables or ensure the required data is available in the current context.
                        </p>
                    </div>
                </div>

                <div className="flex justify-end pt-6 border-t border-gray-200">
                    <Button
                        variant="outline"
                        onClick={onClose}
                        className="px-6 py-2"
                    >
                        Close
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};
