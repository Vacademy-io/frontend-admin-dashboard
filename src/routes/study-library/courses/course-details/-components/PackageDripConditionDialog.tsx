import { useState, useEffect } from 'react';
import { MyDialog } from '@/components/design-system/dialog';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Calendar, CheckCircle } from 'lucide-react';
import {
    DripCondition,
    DripConditionRule,
    DripConditionRuleType,
    DripConditionBehavior,
} from '@/types/course-settings';
import { createEmptyDripCondition } from '@/utils/drip-conditions';
import { MyButton } from '@/components/design-system/button';

interface PackageDripConditionDialogProps {
    open: boolean;
    onClose: () => void;
    onSave: (condition: DripCondition) => void;
    packageId: string;
    packageName: string;
    condition?: DripCondition;
}

export const PackageDripConditionDialog: React.FC<PackageDripConditionDialogProps> = ({
    open,
    onClose,
    onSave,
    packageId,
    packageName,
    condition,
}) => {
    const [formData, setFormData] = useState<DripCondition>(() => {
        if (condition) return condition;
        const empty = createEmptyDripCondition();
        return {
            id: empty.id!,
            level: 'package',
            level_id: packageId,
            drip_condition: {
                ...empty.drip_condition!,
                rules: [
                    {
                        type: 'date_based',
                        params: { unlock_date: new Date().toISOString() },
                    },
                ],
            },
            enabled: empty.enabled!,
            created_at: empty.created_at,
        };
    });

    useEffect(() => {
        if (condition) {
            setFormData(condition);
        } else {
            const empty = createEmptyDripCondition();
            setFormData({
                id: empty.id!,
                level: 'package',
                level_id: packageId,
                drip_condition: {
                    ...empty.drip_condition!,
                    rules: [
                        {
                            type: 'date_based',
                            params: { unlock_date: new Date().toISOString() },
                        },
                    ],
                },
                enabled: empty.enabled!,
                created_at: empty.created_at,
            });
        }
    }, [condition, packageId]);

    const handleSave = () => {
        onSave(formData);
        onClose();
    };

    const handleAddRule = () => {
        setFormData({
            ...formData,
            drip_condition: {
                ...formData.drip_condition,
                rules: [
                    ...formData.drip_condition.rules,
                    {
                        type: 'date_based',
                        params: {
                            unlock_date: new Date().toISOString(),
                        },
                    },
                ],
            },
        });
    };

    const handleRemoveRule = (index: number) => {
        setFormData({
            ...formData,
            drip_condition: {
                ...formData.drip_condition,
                rules: formData.drip_condition.rules.filter((_, i) => i !== index),
            },
        });
    };

    const handleRuleChange = (index: number, rule: DripConditionRule) => {
        setFormData({
            ...formData,
            drip_condition: {
                ...formData.drip_condition,
                rules: formData.drip_condition.rules.map((r, i) => (i === index ? rule : r)),
            },
        });
    };

    const handleRuleTypeChange = (index: number, type: DripConditionRuleType) => {
        const newRule: DripConditionRule = (() => {
            switch (type) {
                case 'date_based':
                    return {
                        type,
                        params: { unlock_date: new Date().toISOString() },
                    };
                case 'completion_based':
                    return {
                        type,
                        params: { metric: 'average_of_all', threshold: 100 },
                    };
                case 'prerequisite':
                    return {
                        type,
                        params: { required_chapters: [], threshold: 100 },
                    };
                case 'sequential':
                    return {
                        type,
                        params: { requires_previous: true, threshold: 100 },
                    };
                default:
                    return {
                        type: 'date_based',
                        params: { unlock_date: new Date().toISOString() },
                    };
            }
        })();
        handleRuleChange(index, newRule);
    };

    const renderRuleEditor = (rule: DripConditionRule, index: number) => {
        switch (rule.type) {
            case 'date_based': {
                const params = rule.params as { unlock_date: string };
                return (
                    <div className="space-y-2">
                        <Label>Release Date</Label>
                        <Input
                            type="datetime-local"
                            value={
                                params.unlock_date
                                    ? new Date(params.unlock_date).toISOString().slice(0, 16)
                                    : ''
                            }
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                handleRuleChange(index, {
                                    ...rule,
                                    params: { unlock_date: new Date(e.target.value).toISOString() },
                                })
                            }
                        />
                    </div>
                );
            }

            case 'completion_based': {
                const params = rule.params as {
                    metric: 'average_of_last_n' | 'average_of_all';
                    count?: number;
                    threshold: number;
                };
                return (
                    <div className="space-y-2">
                        <div>
                            <Label>Metric</Label>
                            <Select
                                value={params.metric}
                                onValueChange={(value) =>
                                    handleRuleChange(index, {
                                        ...rule,
                                        params: {
                                            ...params,
                                            metric: value as 'average_of_last_n' | 'average_of_all',
                                        },
                                    })
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="average_of_all">Average of All</SelectItem>
                                    <SelectItem value="average_of_last_n">
                                        Average of Last N
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        {params.metric === 'average_of_last_n' && (
                            <div>
                                <Label>Count</Label>
                                <Input
                                    type="number"
                                    min="1"
                                    value={params.count || 1}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                        handleRuleChange(index, {
                                            ...rule,
                                            params: {
                                                ...params,
                                                count: parseInt(e.target.value),
                                            },
                                        })
                                    }
                                />
                            </div>
                        )}
                        <div>
                            <Label>Threshold %</Label>
                            <Input
                                type="number"
                                min="0"
                                max="100"
                                value={params.threshold || 0}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                    handleRuleChange(index, {
                                        ...rule,
                                        params: {
                                            ...params,
                                            threshold: parseInt(e.target.value),
                                        },
                                    })
                                }
                            />
                        </div>
                    </div>
                );
            }

            default:
                return null;
        }
    };

    return (
        <MyDialog
            open={open}
            onOpenChange={onClose}
            heading={condition ? 'Edit Drip Condition' : 'Add Drip Condition'}
            content={
                <div className="space-y-6">
                    {/* Package Info */}
                    <div className="rounded-lg bg-blue-50 p-3">
                        <p className="text-sm font-medium text-blue-900">Course: {packageName}</p>
                    </div>

                    {/* Target Selection */}
                    <div className="space-y-2">
                        <Label>Target Content</Label>
                        <Select
                            value={formData.drip_condition.target || 'chapter'}
                            onValueChange={(value: 'chapter' | 'slide') =>
                                setFormData({
                                    ...formData,
                                    drip_condition: {
                                        ...formData.drip_condition,
                                        target: value,
                                    },
                                })
                            }
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select target" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="chapter">Chapters</SelectItem>
                                <SelectItem value="slide">Slides</SelectItem>
                            </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground">
                            This condition will apply to all{' '}
                            {formData.drip_condition.target === 'chapter' ? 'chapters' : 'slides'}{' '}
                            in this package
                        </p>
                    </div>

                    {/* Behavior Selection */}
                    <div className="space-y-2">
                        <Label>Behavior</Label>
                        <Select
                            value={formData.drip_condition.behavior}
                            onValueChange={(value: DripConditionBehavior) =>
                                setFormData({
                                    ...formData,
                                    drip_condition: {
                                        ...formData.drip_condition,
                                        behavior: value,
                                    },
                                })
                            }
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select behavior" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="lock">Lock (show but prevent access)</SelectItem>
                                <SelectItem value="hide">Hide (completely hidden)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Rules Section */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <Label>Unlock Rule</Label>
                        </div>

                        {formData.drip_condition.rules.length === 0 ? (
                            <div className="rounded-lg border border-dashed p-4 text-center text-sm text-muted-foreground">
                                No rule configured. Please configure an unlock rule below.
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {formData.drip_condition.rules.map((rule, index) => (
                                    <div
                                        key={index}
                                        className="space-y-3 rounded-lg border bg-gray-50 p-4"
                                    >
                                        <div className="flex items-center justify-between">
                                            <Select
                                                value={rule.type}
                                                onValueChange={(value) =>
                                                    handleRuleTypeChange(
                                                        index,
                                                        value as DripConditionRuleType
                                                    )
                                                }
                                            >
                                                <SelectTrigger className="w-[200px]">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="date_based">
                                                        <div className="flex items-center gap-2">
                                                            <Calendar className="size-4" />
                                                            Date-based
                                                        </div>
                                                    </SelectItem>
                                                    <SelectItem value="completion_based">
                                                        <div className="flex items-center gap-2">
                                                            <CheckCircle className="size-4" />
                                                            Completion-based
                                                        </div>
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        {renderRuleEditor(rule, index)}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Enable Toggle */}
                    <div className="flex items-center justify-between rounded-lg border p-3">
                        <Label htmlFor="condition-enabled" className="font-medium">
                            Enable this condition
                        </Label>
                        <Switch
                            id="condition-enabled"
                            checked={formData.enabled}
                            onCheckedChange={(checked) =>
                                setFormData({ ...formData, enabled: checked })
                            }
                        />
                    </div>
                </div>
            }
            footer={
                <div className="flex justify-end gap-2">
                    <MyButton buttonType="secondary" onClick={onClose}>
                        Cancel
                    </MyButton>
                    <MyButton
                        onClick={handleSave}
                        disabled={formData.drip_condition.rules.length === 0}
                    >
                        {condition ? 'Update' : 'Add'} Condition
                    </MyButton>
                </div>
            }
        />
    );
};
