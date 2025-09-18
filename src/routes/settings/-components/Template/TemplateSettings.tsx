import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, Mail } from 'lucide-react';
import { WhatsAppIcon } from '@/components/ui/whatsapp-icon';
import { EmailTemplatesTab } from '@/components/templates/email/EmailTemplatesTab';
import { WhatsAppTemplatesTab } from './WhatsAppTemplatesTab';

export default function TemplateSettings() {
    const [activeTab, setActiveTab] = useState<'email' | 'whatsapp'>('email');

    return (
        <div className="space-y-6">
            {/* Header */}
                <div className="space-y-1">
                    <h1 className="flex items-center gap-2 text-lg font-bold">
                        <FileText className="size-6" />
                        Template Settings
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Create and manage email and WhatsApp message templates for bulk actions
                    </p>
            </div>

            {/* Tabbed Interface */}
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'email' | 'whatsapp')}>
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="email" className="flex items-center gap-2">
                        <Mail className="size-4" />
                        Email Templates
                    </TabsTrigger>
                    <TabsTrigger value="whatsapp" className="flex items-center gap-2">
                        <WhatsAppIcon className="size-4 text-green-600" />
                        WhatsApp Templates
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="email" className="mt-6">
                    <EmailTemplatesTab />
                </TabsContent>

                <TabsContent value="whatsapp" className="mt-6">
                    <WhatsAppTemplatesTab />
                </TabsContent>
            </Tabs>
        </div>
    );
}
