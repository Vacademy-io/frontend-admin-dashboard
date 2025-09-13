import React, { useState, useEffect } from 'react';
import { MyButton } from '@/components/design-system/button';
import { MyDropdown } from '@/components/design-system/dropdown';
import { CaretUpDown, XCircle, ChatCircle, Envelope } from '@phosphor-icons/react';
import { StudentTable } from '@/types/student-table-types';

interface AttendanceBulkActionsProps {
    selectedCount: number;
    selectedStudentIds: string[];
    selectedStudents: StudentTable[];
    onReset: () => void;
    onSendWhatsApp: () => void;
    onSendEmail: () => void;
}

const ATTENDANCE_BULK_ACTION_OPTIONS = [
    'Send WhatsApp Message',
    'Send Email',
];

export const AttendanceBulkActions = ({
    selectedCount,
    selectedStudentIds,
    selectedStudents,
    onReset,
    onSendWhatsApp,
    onSendEmail,
}: AttendanceBulkActionsProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);

    // Add pulse animation when selection count changes
    useEffect(() => {
        if (selectedCount > 0) {
            setIsAnimating(true);
            const timer = setTimeout(() => setIsAnimating(false), 300);
            return () => clearTimeout(timer);
        }
    }, [selectedCount]);

    if (selectedCount === 0) {
        return null;
    }

    const handleMenuOptionsChange = (value: string) => {
        setIsOpen(false);

        switch (value) {
            case 'Send WhatsApp Message':
                onSendWhatsApp();
                break;
            case 'Send Email':
                onSendEmail();
                break;
        }
    };

    const getIcon = (option: string) => {
        switch (option) {
            case 'Send WhatsApp Message':
                return <ChatCircle className="mr-2 size-4" />;
            case 'Send Email':
                return <Envelope className="mr-2 size-4" />;
            default:
                return null;
        }
    };

    const dropdownList = ATTENDANCE_BULK_ACTION_OPTIONS.map((option) => ({
        label: option,
        value: option,
        icon: getIcon(option),
    }));

    return (
        <div className="flex items-center gap-5 text-neutral-600">
            <div className="flex items-center gap-2 rounded-lg bg-primary-50 px-3 py-1.5 transition-all duration-200 hover:bg-primary-100">
                <div className={`flex h-6 w-6 items-center justify-center rounded-full bg-primary-500 text-xs font-semibold text-white transition-all duration-200 hover:scale-110 ${isAnimating ? 'animate-pulse' : ''}`}>
                    {selectedCount}
                </div>
                <span className="text-sm font-medium text-primary-700">
                    {selectedCount === 1 ? 'Student Selected' : 'Students Selected'}
                </span>
            </div>

            <div className="flex items-center gap-3">
                <MyButton
                    buttonType="secondary"
                    scale="medium"
                    layoutVariant="default"
                    className="flex items-center gap-2 border-red-200 bg-red-50 text-red-600 transition-all duration-200 hover:bg-red-100 hover:border-red-300 hover:text-red-700 hover:shadow-sm focus:ring-red-500 active:scale-95"
                    onClick={onReset}
                >
                    <XCircle className="size-4 transition-transform duration-200 group-hover:rotate-90" />
                    Clear Selection
                </MyButton>

                <MyDropdown
                    dropdownList={dropdownList}
                    onSelect={handleMenuOptionsChange}
                    isOpen={isOpen}
                    onOpenChange={setIsOpen}
                >
                    <MyButton
                        buttonType="primary"
                        scale="medium"
                        layoutVariant="default"
                        className="flex w-full cursor-pointer items-center justify-between gap-2"
                    >
                        <span>Bulk Actions</span>
                        <CaretUpDown className="size-4" />
                    </MyButton>
                </MyDropdown>
            </div>
        </div>
    );
};
