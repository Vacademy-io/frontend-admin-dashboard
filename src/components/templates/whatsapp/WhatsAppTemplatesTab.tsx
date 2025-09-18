import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';

export const WhatsAppTemplatesTab: React.FC = () => {
    return (
        <div className="space-y-6">
            <Alert>
                <AlertTriangle className="size-4" />
                <AlertDescription>
                    WhatsApp templates feature is coming soon. This will allow you to create and manage WhatsApp message templates for bulk communications.
                </AlertDescription>
            </Alert>
        </div>
    );
};
