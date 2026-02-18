import React, { useState, useEffect } from 'react';
import { MyInput } from '@/components/design-system/input';
import { MyButton } from '@/components/design-system/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { LearnerButtonConfig } from '../../-constants/helper';

interface LearnerButtonConfigInputProps {
    value: LearnerButtonConfig | null | undefined;
    onChange: (value: LearnerButtonConfig | null) => void;
    disabled?: boolean;
}

const DEFAULT_BUTTON_CONFIG: LearnerButtonConfig = {
    text: 'View Class Material',
    url: '',
    background_color: '#1976D2',
    text_color: '#FFFFFF',
    visible: true,
};

export function LearnerButtonConfigInput({
    value,
    onChange,
    disabled,
}: LearnerButtonConfigInputProps) {
    const [config, setConfig] = useState<LearnerButtonConfig | null>(value || null);

    useEffect(() => {
        setConfig(value || null);
    }, [value]);

    const handleChange = (field: keyof LearnerButtonConfig, newValue: string | boolean) => {
        if (!config) return;

        const updated = { ...config, [field]: newValue };
        setConfig(updated);
        onChange(updated);
    };

    const handleAdd = () => {
        const newConfig = { ...DEFAULT_BUTTON_CONFIG };
        setConfig(newConfig);
        onChange(newConfig);
    };

    const handleRemove = () => {
        setConfig(null);
        onChange(null);
    };

    if (!config) {
        return (
            <MyButton
                type="button"
                buttonType="secondary"
                scale="small"
                onClick={handleAdd}
                disable={disabled}
            >
                + Add Custom Button
            </MyButton>
        );
    }

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div>
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" className="text-gray-400" viewBox="0 0 256 256">
                            <path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216Zm40-88a8,8,0,0,1-8,8H136v24a8,8,0,0,1-16,0V136H96a8,8,0,0,1,0-16h24V96a8,8,0,0,1,16,0v24h24A8,8,0,0,1,168,128Z"></path>
                        </svg>
                    </div>
                    <h4 className="text-sm font-semibold text-gray-900">
                        Custom Button Configuration
                    </h4>
                </div>
                <MyButton
                    type="button"
                    buttonType="secondary"
                    scale="small"
                    onClick={handleRemove}
                    disable={disabled}
                >
                    Remove
                </MyButton>
            </div>

            {/* Visibility Toggle */}
            <div className="flex items-center gap-2 bg-white rounded-lg p-3 border border-gray-200">
                <Switch
                    id="button-visible"
                    checked={config.visible}
                    onCheckedChange={(checked) => handleChange('visible', checked)}
                    disabled={disabled}
                />
                <Label htmlFor="button-visible" className="text-sm cursor-pointer font-medium">
                    Show this button to learners
                </Label>
            </div>

            {/* Form Fields */}
            <div className="bg-white rounded-lg p-4 border border-gray-200 space-y-4">
                {/* Button Text */}
                <div className="space-y-1">
                    <Label className="text-sm font-medium">
                        Button Text <span className="text-red-500">*</span>
                    </Label>
                    <MyInput
                        inputType="text"
                        inputPlaceholder="View Class Material"
                        input={config.text}
                        onChangeFunction={(e: React.ChangeEvent<HTMLInputElement>) => handleChange('text', e.target.value)}
                        disabled={disabled}
                    />
                    <p className="text-xs text-muted-foreground">{config.text.length}/50 characters</p>
                </div>

                {/* Button URL */}
                <div className="space-y-1">
                    <Label className="text-sm font-medium">
                        Button URL <span className="text-red-500">*</span>
                    </Label>
                    <MyInput
                        inputType="url"
                        inputPlaceholder="https://youtube.com/watch?v=..."
                        input={config.url}
                        onChangeFunction={(e: React.ChangeEvent<HTMLInputElement>) => handleChange('url', e.target.value)}
                        disabled={disabled}
                    />
                </div>

                {/* Color Pickers */}
                <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                        <Label className="text-sm font-medium">Background Color</Label>
                        <MyInput
                            inputType="text"
                            input={config.background_color}
                            onChangeFunction={(e: React.ChangeEvent<HTMLInputElement>) => {
                                const value = e.target.value;
                                if (/^#[0-9A-F]{0,6}$/i.test(value) || value === '') {
                                    handleChange('background_color', value);
                                }
                            }}
                            inputPlaceholder="#1976D2"
                            disabled={disabled}
                        />
                    </div>

                    <div className="space-y-1">
                        <Label className="text-sm font-medium">Text Color</Label>
                        <MyInput
                            inputType="text"
                            input={config.text_color}
                            onChangeFunction={(e: React.ChangeEvent<HTMLInputElement>) => {
                                const value = e.target.value;
                                if (/^#[0-9A-F]{0,6}$/i.test(value) || value === '') {
                                    handleChange('text_color', value);
                                }
                            }}
                            inputPlaceholder="#FFFFFF"
                            disabled={disabled}
                        />
                    </div>
                </div>

                {/* Preview */}
                <div className="space-y-2 pt-2 border-t border-gray-200">
                    <Label className="text-sm font-medium">Preview:</Label>
                    <button
                        type="button"
                        style={{
                            backgroundColor: config.background_color,
                            color: config.text_color,
                        }}
                        className="px-4 py-2 rounded-lg text-sm font-medium shadow-sm"
                        disabled
                    >
                        {config.text || 'Button Text'}
                    </button>
                </div>
            </div>
        </div>
    );
}
