import { useEffect, useRef } from 'react';
import { format } from 'date-fns';
import type { PlanningFormData, IntervalType } from '../-types/types';
import { useInstituteDetailsStore } from '@/stores/students/students-list/useInstituteDetailsStore';
import { MyDropdown } from '@/components/design-system/dropdown';
import { MyLabel } from '@/components/design-system/my-label';
import IntervalSelector from './IntervalSelector';

interface TitleGeneratorSectionProps {
    data: PlanningFormData;
    onChange: (data: Partial<PlanningFormData>) => void;
    hideIntervalType?: boolean; // For activity logs
    hideCourseSelector?: boolean; // For course details dialogs where course is pre-filled
}

export default function TitleGeneratorSection({
    data,
    onChange,
    hideIntervalType,
    hideCourseSelector,
}: TitleGeneratorSectionProps) {
    const { instituteDetails } = useInstituteDetailsStore();
    const lastGeneratedTitle = useRef<string>('');

    const packageSessionOptions =
        instituteDetails?.batches_for_sessions?.map((batch) => ({
            label: `${batch.package_dto.package_name} - ${batch.level.level_name} - ${batch.session.session_name}`,
            value: batch.id,
        })) || [];

    const intervalOptions = [
        { label: 'Daily', value: 'daily' },
        { label: 'Day of Week', value: 'weekly' },
        { label: 'Weekly', value: 'monthly' },
        { label: 'Monthly', value: 'yearly_month' },
        { label: 'Quarterly', value: 'yearly_quarter' },
    ];

    const currentPackageSession = packageSessionOptions.find(
        (opt) => opt.value === data.packageSessionId
    );

    // For planning logs (hideIntervalType = false), filter out 'daily' from dropdown
    const displayIntervalOptions = hideIntervalType
        ? intervalOptions
        : intervalOptions.filter((opt) => opt.value !== 'daily');

    const currentInterval = intervalOptions.find((opt) => opt.value === data.interval_type);

    // Auto-generate title based on interval type, date, and course
    useEffect(() => {
        if (data.interval_type && data.selectedDate) {
            let titlePrefix = '';

            switch (data.interval_type) {
                case 'daily':
                    // Format: "24 Nov, 2024" or "24 Nov, 2024 - Course 1"
                    titlePrefix = format(data.selectedDate, 'dd MMM, yyyy');
                    break;
                case 'weekly':
                    // Format: "Sunday" or "Sunday - Course 1"
                    titlePrefix = format(data.selectedDate, 'EEEE');
                    break;
                case 'monthly': {
                    // Format: "Week 3" or "Week 3 - Course 1"
                    const weekOfMonth = Math.ceil(data.selectedDate.getDate() / 7);
                    titlePrefix = `Week ${weekOfMonth}`;
                    break;
                }
                case 'yearly_month':
                    // Format: "January" or "January - Course 1"
                    titlePrefix = format(data.selectedDate, 'MMMM');
                    break;
                case 'yearly_quarter': {
                    // Format: "Apr-Jun" or "Apr-Jun - Course 1"
                    const month = data.selectedDate.getMonth();
                    const quarters = [
                        'Jan-Mar',
                        'Jan-Mar',
                        'Jan-Mar',
                        'Apr-Jun',
                        'Apr-Jun',
                        'Apr-Jun',
                        'Jul-Sep',
                        'Jul-Sep',
                        'Jul-Sep',
                        'Oct-Dec',
                        'Oct-Dec',
                        'Oct-Dec',
                    ];
                    titlePrefix = quarters[month] || 'Q1';
                    break;
                }
                default:
                    titlePrefix = '';
            }

            // Always append course name if packageSessionId is set (even if selector is hidden)
            let generatedTitle = titlePrefix;
            if (data.packageSessionId && currentPackageSession) {
                const courseName = currentPackageSession.label.split(' - ')[0];
                const sessionName = currentPackageSession.label.split(' - ')[1];
                const levelName = currentPackageSession.label.split(' - ')[2];

                generatedTitle = `${titlePrefix} - ${courseName}/${levelName}/${sessionName}`;
            }

            // Only update title if it hasn't been manually edited
            // Check if current title matches the last generated title or is empty
            if (data.title === lastGeneratedTitle.current || data.title === '') {
                lastGeneratedTitle.current = generatedTitle;
                onChange({ title: generatedTitle });
            }
        }
    }, [data.interval_type, data.selectedDate, data.packageSessionId, currentPackageSession]);

    return (
        <div className="space-y-4">
            {/* Interval Type - Only show if not hidden (hidden for activity logs) */}
            {!hideIntervalType && (
                <div className="space-y-2">
                    <MyLabel required>Interval</MyLabel>
                    <MyDropdown
                        currentValue={currentInterval?.label}
                        handleChange={(value) => onChange({ interval_type: value as IntervalType })}
                        dropdownList={displayIntervalOptions}
                        placeholder="Select interval"
                        className="w-full"
                    />
                </div>
            )}

            {/* Dynamic Interval Selector */}
            {data.interval_type && (
                <div className="space-y-2">
                    <IntervalSelector
                        intervalType={data.interval_type}
                        selectedDate={data.selectedDate}
                        onChange={(date) => onChange({ selectedDate: date })}
                    />
                </div>
            )}

            {/* Batch Selection - Only show if not hidden (hidden in course details dialogs) */}
            {!hideCourseSelector && (
                <div className="space-y-2">
                    <MyLabel required>Batch</MyLabel>
                    <MyDropdown
                        currentValue={currentPackageSession?.label}
                        handleChange={(value) => onChange({ packageSessionId: value })}
                        dropdownList={packageSessionOptions}
                        placeholder="Select batch"
                        className="w-full"
                    />
                </div>
            )}
        </div>
    );
}
