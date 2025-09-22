import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

interface EmailResultDialogProps {
    isOpen: boolean;
    onClose: () => void;
    result: {
        success: boolean;
        totalStudents: number;
        processedStudents: number;
        failedStudents: number;
        errors?: Array<{ studentId: string; error: string }>;
    };
}

export const EmailResultDialog: React.FC<EmailResultDialogProps> = ({
    isOpen,
    onClose,
    result
}) => {
    const { success, totalStudents, processedStudents, failedStudents, errors } = result;
    const successCount = processedStudents - failedStudents;

    const getDialogContent = () => {
        if (success && failedStudents === 0) {
            return {
                icon: <CheckCircle className="h-12 w-12 text-green-500" />,
                title: "Email Sent Successfully!",
                message: `Successfully sent ${successCount} personalized email(s) to ${totalStudents} student(s).`,
                buttonText: "Close",
                buttonVariant: "default" as const
            };
        } else if (success && failedStudents > 0) {
            return {
                icon: <AlertTriangle className="h-12 w-12 text-yellow-500" />,
                title: "Partially Successful",
                message: `Sent ${successCount} email(s) successfully, but ${failedStudents} failed.`,
                buttonText: "View Details",
                buttonVariant: "secondary" as const
            };
        } else {
            return {
                icon: <XCircle className="h-12 w-12 text-red-500" />,
                title: "Failed to Send Emails",
                message: `Failed to send all ${failedStudents} email(s). Please check the details and try again.`,
                buttonText: "Try Again",
                buttonVariant: "destructive" as const
            };
        }
    };

    const content = getDialogContent();

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-center">
                        {content.title}
                    </DialogTitle>
                </DialogHeader>

                <div className="flex flex-col items-center space-y-4 py-4">
                    {content.icon}
                    <p className="text-center text-sm text-gray-600">
                        {content.message}
                    </p>

                    {errors && errors.length > 0 && (
                        <div className="w-full">
                            <h4 className="text-sm font-medium text-gray-700 mb-2">Error Details:</h4>
                            <div className="max-h-32 overflow-y-auto space-y-1">
                                {errors.map((error, index) => (
                                    <div key={index} className="text-xs text-red-600 bg-red-50 p-2 rounded">
                                        Student {error.studentId}: {error.error}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex justify-center">
                    <Button
                        onClick={onClose}
                        variant={content.buttonVariant}
                        className="w-full"
                    >
                        {content.buttonText}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};
