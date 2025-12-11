import { useState } from 'react';
import { MyDialog } from '@/components/design-system/dialog';
import { MyButton } from '@/components/design-system/button';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { MultiSelect } from '@/components/design-system/multi-select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Plus, Trash, Info } from 'phosphor-react';
import type { DripCondition, DripConditionRule } from '@/types/course-settings';
import { formatDripRule } from '@/utils/drip-conditions';

interface ChapterDripConditionDialogProps {
    open: boolean;
    onClose: () => void;
    chapterId: string | null;
    chapterName: string | null;
    packageId: string | null;
    dripConditions: DripCondition[];
    onSave: (updatedConditions: DripCondition[]) => Promise<void>;
    allChapters?: Array<{ id: string; name: string }>;
}

export function ChapterDripConditionDialog({
    open,
    onClose,
    chapterId,
    chapterName,
    packageId,
    dripConditions,
    onSave,
    allChapters = [],
}: ChapterDripConditionDialogProps) {
    const [editingConditionId, setEditingConditionId] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);

    // Ensure dripConditions is an array
    const conditions = Array.isArray(dripConditions) ? dripConditions : [];

    // Check if package has chapter-targeting conditions
    const packageChapterConditions = conditions.filter((c) => {
        const isMatch =
            c.level === 'package' &&
            c.level_id === packageId &&
            c.drip_condition?.target === 'chapter' &&
            c.enabled !== false;

        return isMatch;
    });

    // Get chapter-specific conditions
    const chapterConditions = conditions.filter(
        (c) => c.level === 'chapter' && c.level_id === chapterId && c.enabled !== false
    );

    const hasPackageConflict = packageChapterConditions.length > 0;

    const handleAddCondition = () => {
        setEditingConditionId('new');
    };

    const handleSaveCondition = async (condition: Omit<DripCondition, 'id'>) => {
        try {
            setSaving(true);
            let updatedConditions: DripCondition[];

            if (editingConditionId === 'new') {
                // Add new condition
                const newCondition: DripCondition = {
                    ...condition,
                    id: `drip_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                };
                updatedConditions = [...conditions, newCondition];
            } else {
                // Update existing condition
                updatedConditions = conditions.map((c) =>
                    c.id === editingConditionId ? { ...condition, id: c.id } : c
                );
            }

            await onSave(updatedConditions);
            setEditingConditionId(null);
        } catch (error) {
            console.error('Failed to save condition:', error);
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteCondition = async (conditionId: string) => {
        if (!confirm('Are you sure you want to delete this drip condition?')) return;

        try {
            setSaving(true);
            const updatedConditions = conditions.filter((c) => c.id !== conditionId);
            await onSave(updatedConditions);
        } catch (error) {
            console.error('Failed to delete condition:', error);
        } finally {
            setSaving(false);
        }
    };

    const handleEditCondition = (conditionId: string) => {
        setEditingConditionId(conditionId);
    };

    return (
        <MyDialog
            open={open}
            onOpenChange={onClose}
            heading={`Drip Conditions - ${chapterName || 'Chapter'}`}
        >
            <div className="space-y-4">
                {hasPackageConflict && (
                    <Alert className="border-blue-200 bg-blue-50">
                        <Info className="size-4 text-blue-600" />
                        <AlertDescription className="text-sm text-blue-900">
                            <div className="mb-2 font-semibold">Course-Level Conditions Active</div>
                            <div className="space-y-2">
                                {packageChapterConditions.map((condition) => (
                                    <div
                                        key={condition.id}
                                        className="rounded-md border border-blue-200 bg-white p-3"
                                    >
                                        <div className="mb-2 flex items-start gap-2">
                                            <Badge
                                                variant="outline"
                                                className="bg-purple-100 text-purple-700"
                                            >
                                                Course Level
                                            </Badge>
                                            <Badge
                                                variant="outline"
                                                className="bg-blue-100 text-blue-700"
                                            >
                                                {condition.drip_condition.behavior}
                                            </Badge>
                                        </div>
                                        <div className="space-y-1 text-sm text-gray-700">
                                            {condition.drip_condition.rules.map((rule, idx) => (
                                                <div key={idx}>• {formatDripRule(rule)}</div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-3 text-xs text-blue-700">
                                These course-level conditions apply to all chapters.
                                Chapter-specific conditions are disabled when course conditions
                                target chapters.
                            </div>
                        </AlertDescription>
                    </Alert>
                )}

                {!hasPackageConflict && (
                    <>
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-semibold text-gray-900">
                                Chapter Drip Conditions
                            </h3>
                            {!editingConditionId && (
                                <MyButton
                                    buttonType="primary"
                                    scale="small"
                                    onClick={handleAddCondition}
                                    disabled={saving}
                                >
                                    <Plus size={16} weight="bold" />
                                    <span>Add Condition</span>
                                </MyButton>
                            )}
                        </div>

                        {chapterConditions.length === 0 && !editingConditionId && (
                            <div className="rounded-lg border-2 border-dashed border-gray-200 p-8 text-center">
                                <p className="text-sm text-gray-500">
                                    No drip conditions for this chapter yet.
                                </p>
                            </div>
                        )}

                        {chapterConditions.map((condition) => (
                            <div key={condition.id}>
                                {editingConditionId === condition.id ? (
                                    <ConditionForm
                                        condition={condition}
                                        chapterId={chapterId!}
                                        onSave={handleSaveCondition}
                                        saving={saving}
                                        allChapters={allChapters}
                                    />
                                ) : (
                                    <div className="rounded-lg border border-gray-200 p-4 transition-colors hover:border-primary-300">
                                        <div className="mb-3 flex items-start justify-between">
                                            <div className="flex items-center gap-2">
                                                <Badge
                                                    variant="outline"
                                                    className="bg-blue-100 text-blue-700"
                                                >
                                                    {condition.drip_condition.behavior}
                                                </Badge>
                                            </div>
                                            <div className="flex gap-1">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() =>
                                                        handleEditCondition(condition.id)
                                                    }
                                                    disabled={saving}
                                                    className="h-8 px-2"
                                                >
                                                    Edit
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() =>
                                                        handleDeleteCondition(condition.id)
                                                    }
                                                    disabled={saving}
                                                    className="h-8 px-2 text-red-600 hover:bg-red-50 hover:text-red-700"
                                                >
                                                    <Trash size={16} />
                                                </Button>
                                            </div>
                                        </div>
                                        <div className="space-y-1 text-sm text-gray-700">
                                            {condition.drip_condition.rules.map((rule, idx) => (
                                                <div key={idx}>• {formatDripRule(rule)}</div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}

                        {editingConditionId === 'new' && (
                            <ConditionForm
                                chapterId={chapterId!}
                                onSave={handleSaveCondition}
                                saving={saving}
                                allChapters={allChapters}
                            />
                        )}
                    </>
                )}

                <div className="flex justify-end border-t pt-4">
                    <MyButton buttonType="secondary" onClick={onClose}>
                        Close
                    </MyButton>
                </div>
            </div>
        </MyDialog>
    );
}

interface ConditionFormProps {
    condition?: DripCondition;
    chapterId: string;
    onSave: (condition: Omit<DripCondition, 'id'>) => void;
    saving: boolean;
    allChapters?: Array<{ id: string; name: string }>;
}

function ConditionForm({
    condition,
    chapterId,
    onSave,
    saving,
    allChapters = [],
}: ConditionFormProps) {
    const target = 'chapter';
    const [behavior, setBehavior] = useState<'lock' | 'hide' | 'both'>(
        condition?.drip_condition?.behavior || 'lock'
    );
    const [rules, setRules] = useState<DripConditionRule[]>(
        condition?.drip_condition?.rules || [
            { type: 'date_based', params: { unlock_date: new Date().toISOString() } },
        ]
    );

    const handleRuleTypeChange = (index: number, type: string) => {
        const newRules = [...rules];
        switch (type) {
            case 'date_based':
                newRules[index] = {
                    type: 'date_based',
                    params: { unlock_date: new Date().toISOString() },
                };
                break;
            case 'completion_based':
                newRules[index] = {
                    type: 'completion_based',
                    params: { metric: 'average_of_all', threshold: 100 },
                };
                break;
            case 'prerequisite':
                newRules[index] = {
                    type: 'prerequisite',
                    params: { required_chapters: [], threshold: 100 },
                };
                break;
            case 'sequential':
                newRules[index] = {
                    type: 'sequential',
                    params: { requires_previous: true, threshold: 100 },
                };
                break;
        }
        setRules(newRules);
    };

    const handleRuleChange = (index: number, field: string, value: any) => {
        const newRules = [...rules];
        const existingRule = newRules[index];
        if (!existingRule) return;
        newRules[index] = {
            type: existingRule.type,
            params: { ...(existingRule?.params || {}), [field]: value } as any,
        };
        setRules(newRules);
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
                                handleRuleChange(
                                    index,
                                    'unlock_date',
                                    new Date(e.target.value).toISOString()
                                )
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
                                onValueChange={(value) => handleRuleChange(index, 'metric', value)}
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
                                    min="0"
                                    value={params.count || 0}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                        handleRuleChange(index, 'count', parseInt(e.target.value))
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
                                    handleRuleChange(index, 'threshold', parseInt(e.target.value))
                                }
                            />
                        </div>
                    </div>
                );
            }

            case 'prerequisite': {
                const params = rule.params as {
                    required_chapters?: string[];
                    required_slides?: string[];
                    threshold: number;
                };
                return (
                    <div className="space-y-2">
                        <div>
                            <Label>Required Chapters</Label>
                            <MultiSelect
                                options={allChapters.map((ch) => ({
                                    label: ch.name,
                                    value: ch.id,
                                }))}
                                selected={params.required_chapters || []}
                                onChange={(ids) =>
                                    handleRuleChange(index, 'required_chapters', ids)
                                }
                                placeholder="Select chapters"
                            />
                            <p className="text-xs text-muted-foreground">
                                Select the chapters that must be completed before unlocking
                            </p>
                        </div>
                        <div>
                            <Label>Completion Threshold %</Label>
                            <Input
                                type="number"
                                min="0"
                                max="100"
                                value={params.threshold || 0}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                    handleRuleChange(index, 'threshold', parseInt(e.target.value))
                                }
                            />
                            <p className="text-xs text-muted-foreground">
                                Percentage completion required for prerequisite chapters
                            </p>
                        </div>
                    </div>
                );
            }

            case 'sequential': {
                const params = rule.params as { requires_previous: boolean; threshold: number };
                return (
                    <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                id={`sequential-chapter-${index}`}
                                checked={params.requires_previous !== false}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                    handleRuleChange(index, 'requires_previous', e.target.checked)
                                }
                                className="size-4 rounded border-gray-300"
                            />
                            <Label
                                htmlFor={`sequential-chapter-${index}`}
                                className="cursor-pointer"
                            >
                                Requires previous chapter completion
                            </Label>
                        </div>
                        <div>
                            <Label>Completion Threshold %</Label>
                            <Input
                                type="number"
                                min="0"
                                max="100"
                                value={params.threshold || 0}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                    handleRuleChange(index, 'threshold', parseInt(e.target.value))
                                }
                            />
                            <p className="text-xs text-muted-foreground">
                                Percentage completion required for previous chapter
                            </p>
                        </div>
                    </div>
                );
            }

            default:
                return null;
        }
    };

    const handleSubmit = () => {
        // Validate
        const hasEmptyFields = rules.some((rule) => {
            if (rule.type === 'date_based') {
                const params = rule.params as { unlock_date: string };
                return !params.unlock_date;
            }
            if (rule.type === 'completion_based') {
                const params = rule.params as { threshold: number };
                return params.threshold === undefined;
            }
            if (rule.type === 'prerequisite') {
                const params = rule.params as { threshold: number };
                return params.threshold === undefined;
            }
            return false;
        });

        if (hasEmptyFields) {
            alert('Please fill in all required fields');
            return;
        }

        const newCondition: Omit<DripCondition, 'id'> = {
            level: 'chapter',
            level_id: chapterId,
            drip_condition: {
                target,
                behavior,
                rules,
            },
            enabled: true,
        };

        onSave(newCondition);
    };

    return (
        <div className="space-y-4 rounded-lg border-2 p-4">
            <div className="space-y-2">
                <Label>Behavior</Label>
                <Select value={behavior} onValueChange={(v) => setBehavior(v as any)}>
                    <SelectTrigger>
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="lock">Lock (show but prevent access)</SelectItem>
                        <SelectItem value="hide">Hide (completely hidden)</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <Label>Unlock Rule</Label>
                </div>

                {rules.length === 0 ? (
                    <div className="rounded-lg border border-dashed p-4 text-center text-sm text-muted-foreground">
                        No rule configured. Please configure an unlock rule below.
                    </div>
                ) : (
                    rules.map((rule, index) => (
                        <div key={index} className="space-y-3 rounded-md border bg-white p-3">
                            <div className="flex items-center justify-between">
                                <Select
                                    value={rule.type}
                                    onValueChange={(v) => handleRuleTypeChange(index, v)}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="date_based">Date-based</SelectItem>
                                        <SelectItem value="completion_based">
                                            Completion-based
                                        </SelectItem>
                                        <SelectItem value="prerequisite">Prerequisite</SelectItem>
                                        <SelectItem value="sequential">Sequential</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {renderRuleEditor(rule, index)}
                        </div>
                    ))
                )}
            </div>

            <div className="flex justify-end gap-2 pt-2">
                <MyButton onClick={handleSubmit} disabled={saving || rules.length === 0}>
                    {saving ? 'Saving...' : 'Save Condition'}
                </MyButton>
            </div>
        </div>
    );
}
