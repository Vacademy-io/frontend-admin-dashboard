import React from 'react';
import { MyInput } from '@/components/design-system/input';
import { MyButton } from '@/components/design-system/button';
import { Link } from '@phosphor-icons/react';

interface DefaultClassLinkInputProps {
    value: string | null | undefined;
    onChange: (value: string | null) => void;
    disabled?: boolean;
}

export function DefaultClassLinkInput({
    value,
    onChange,
    disabled,
}: DefaultClassLinkInputProps) {
    if (value === null) {
        return (
            <MyButton
                type="button"
                buttonType="secondary"
                scale="small"
                onClick={() => onChange('')}
                disable={disabled}
            >
                + Add Default Link
            </MyButton>
        );
    }

    return (
        <div className="flex items-start gap-3">
            <div className="mt-1">
                <Link size={20} className="text-gray-400" weight="bold" />
            </div>
            <div className="flex-1 space-y-3">
                <div>
                    <h4 className="text-sm font-semibold text-gray-900">
                        Default Link for This Day
                    </h4>
                    <p className="text-xs text-gray-600 mt-1">
                        This link will be shown to learners when sessions on this day are not live
                        <br />
                        <span className="text-gray-500">(e.g., YouTube recording, class notes, or materials)</span>
                    </p>
                </div>
                <MyInput
                    inputType="url"
                    inputPlaceholder="https://www.youtube.com/watch?v=..."
                    input={value || ''}
                    onChangeFunction={(e: React.ChangeEvent<HTMLInputElement>) => {
                        const newValue = e.target.value.trim();
                        onChange(newValue);
                    }}
                    disabled={disabled}
                />
                <div className="flex justify-end">
                    <button
                        type="button"
                        onClick={() => onChange(null)}
                        className="text-xs font-medium text-red-600 hover:text-red-800 hover:underline"
                        disabled={disabled}
                    >
                        Remove Link
                    </button>
                </div>
            </div>
        </div>
    );
}
