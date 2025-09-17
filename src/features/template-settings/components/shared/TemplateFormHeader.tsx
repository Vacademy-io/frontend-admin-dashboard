import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { CreateTemplateRequest } from '@/types/message-template-types';
import { Mail, MessageCircle, Edit, Plus } from 'lucide-react';

interface TemplateFormHeaderProps {
    formData: CreateTemplateRequest;
    template: any;
    onInputChange: (field: keyof CreateTemplateRequest, value: string | boolean) => void;
}

export const TemplateFormHeader: React.FC<TemplateFormHeaderProps> = ({
    formData,
    template,
    onInputChange,
}) => {
    return (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Template Name */}
            <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium">
                    Template Name *
                </Label>
                <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => onInputChange('name', e.target.value)}
                    placeholder="Enter template name"
                    className="h-10"
                    required
                />
            </div>

            {/* Template Type */}
            <div className="space-y-2">
                <Label className="text-sm font-medium">Template Type *</Label>
                <div className="flex gap-2">
                    <Button
                        type="button"
                        variant={formData.type === 'EMAIL' ? 'default' : 'outline'}
                        onClick={() => onInputChange('type', 'EMAIL')}
                        className={`flex h-10 items-center gap-2 px-4 ${
                            formData.type === 'EMAIL'
                                ? 'hover:bg-primary-600 bg-primary-500 text-white'
                                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                        }`}
                    >
                        <Mail className="size-4" />
                        Email
                    </Button>
                    <Button
                        type="button"
                        variant={formData.type === 'WHATSAPP' ? 'default' : 'outline'}
                        onClick={() => onInputChange('type', 'WHATSAPP')}
                        className={`flex h-10 items-center gap-2 px-4 ${
                            formData.type === 'WHATSAPP'
                                ? 'hover:bg-primary-600 bg-primary-500 text-white'
                                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                        }`}
                    >
                        <MessageCircle className="size-4" />
                        WhatsApp
                    </Button>
                </div>
            </div>

            {/* Default Template Toggle */}
            <div className="space-y-2">
                <Label className="text-sm font-medium">Settings</Label>
                <div className="flex h-10 items-center space-x-2">
                    <Switch
                        id="isDefault"
                        checked={formData.isDefault}
                        onCheckedChange={(checked) => onInputChange('isDefault', checked)}
                    />
                    <Label htmlFor="isDefault" className="text-sm">
                        Set as default for {formData.type} messages
                    </Label>
                </div>
            </div>
        </div>
    );
};

