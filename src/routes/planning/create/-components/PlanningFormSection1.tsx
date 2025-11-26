import React from 'react';
import type { PlanningFormData, LogType } from '../../-types/types';
import { useInstituteDetailsStore } from '@/stores/students/students-list/useInstituteDetailsStore';
import { useInstituteQuery } from '@/services/student-list-section/getInstituteDetails';
import { MyDropdown } from '@/components/design-system/dropdown';
import { MyInput } from '@/components/design-system/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { MyLabel } from '@/components/design-system/my-lable';

interface PlanningFormSection1Props {
    data: PlanningFormData;
    onChange: (data: Partial<PlanningFormData>) => void;
}

export default function PlanningFormSection1({ data, onChange }: PlanningFormSection1Props) {
    const { instituteDetails } = useInstituteDetailsStore();

    const packageSessionOptions =
        instituteDetails?.batches_for_sessions?.map((batch) => ({
            label: `${batch.package_dto.package_name} - ${batch.level.level_name} - ${batch.session.session_name}`,
            value: batch.id,
        })) || [];

    const subjectOptions =
        instituteDetails?.subjects?.map((subject) => ({
            label: subject.subject_name,
            value: subject.id,
        })) || [];

    // Find current display values
    const currentPackageSession = packageSessionOptions.find(
        (opt) => opt.value === data.packageSessionId
    );
    const currentSubject = subjectOptions.find((opt) => opt.value === data.subject_id);

    // Auto-select subject if only one option exists
    const hasMultipleSubjects = subjectOptions.length > 1;
    
    // Auto-select the single subject if not already selected
    React.useEffect(() => {
        if (subjectOptions.length === 1 && !data.subject_id && subjectOptions[0]) {
            onChange({ subject_id: subjectOptions[0].value });
        }
    }, [subjectOptions, data.subject_id, onChange]);

    return (
        <div className="grid grid-cols-2 gap-4">
            {/* Log Type - Full width */}
            <div className="col-span-2 space-y-2">
                <MyLabel>Type</MyLabel>
                <RadioGroup
                    value={data.log_type}
                    onValueChange={(value) => onChange({ log_type: value as LogType })}
                >
                    <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="planning" id="planning" />
                            <Label htmlFor="planning" className="font-normal cursor-pointer">
                                Planning
                            </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="diary_log" id="diary_log" />
                            <Label htmlFor="diary_log" className="font-normal cursor-pointer">
                                Diary
                            </Label>
                        </div>
                    </div>
                </RadioGroup>
            </div>

            {/* Title - Full width */}
            <div className="col-span-2 space-y-2">
                <MyInput
                    label="Title"
                    required
                    inputType="text"
                    inputPlaceholder="Enter planning title"
                    input={data.title}
                    onChangeFunction={(e) => onChange({ title: e.target.value })}
                    className="w-full"
                    size="medium"
                />
            </div>

            {/* Package Session - Conditional width based on subject visibility */}
            <div className={hasMultipleSubjects ? "space-y-2" : "col-span-2 space-y-2"}>
                <MyLabel required>Course</MyLabel>
                <MyDropdown
                    currentValue={currentPackageSession?.label}
                    handleChange={(value) => onChange({ packageSessionId: value })}
                    dropdownList={packageSessionOptions}
                    placeholder="Select course"
                    className="w-full"
                />
            </div>

            {/* Subject - Only show if multiple options */}
            {hasMultipleSubjects && (
                <div className="space-y-2">
                    <MyLabel required>Subject</MyLabel>
                    <MyDropdown
                        currentValue={currentSubject?.label}
                        handleChange={(value) => onChange({ subject_id: value })}
                        dropdownList={subjectOptions}
                        placeholder="Select subject"
                        className="w-full"
                    />
                </div>
            )}

            {/* Description - Full width */}
            <div className="col-span-2 space-y-2">
                <MyLabel>Description</MyLabel>
                <Textarea
                    id="description"
                    value={data.description}
                    onChange={(e) => onChange({ description: e.target.value })}
                    placeholder="Enter description (optional)"
                    rows={3}
                />
            </div>
        </div>
    );
}
