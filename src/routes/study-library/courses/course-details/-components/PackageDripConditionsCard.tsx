import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import {
    Plus,
    Droplet,
    Calendar,
    CheckCircle,
    Lock,
    ArrowRight,
    Pencil,
    Trash,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DripCondition } from '@/types/course-settings';
import { formatDripRule } from '@/utils/drip-conditions';
import { PackageDripConditionDialog } from './PackageDripConditionDialog';
import { MyButton } from '@/components/design-system/button';

interface PackageDripConditionsCardProps {
    packageId: string;
    packageName: string;
    conditions: DripCondition[];
    onAdd: (condition: DripCondition) => void;
    onUpdate: (condition: DripCondition) => void;
    onDelete: (id: string) => void;
}

export const PackageDripConditionsCard: React.FC<PackageDripConditionsCardProps> = ({
    packageId,
    packageName,
    conditions,
    onAdd,
    onUpdate,
    onDelete,
}) => {
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingCondition, setEditingCondition] = useState<DripCondition | undefined>();

    const handleAddCondition = () => {
        setEditingCondition(undefined);
        setDialogOpen(true);
    };

    const handleEditCondition = (condition: DripCondition) => {
        setEditingCondition(condition);
        setDialogOpen(true);
    };

    const handleSaveCondition = (condition: DripCondition) => {
        if (editingCondition) {
            onUpdate(condition);
        } else {
            onAdd(condition);
        }
    };

    const handleDeleteCondition = (id: string) => {
        if (confirm('Are you sure you want to delete this drip condition?')) {
            onDelete(id);
        }
    };

    const getBehaviorIcon = (behavior: string) => {
        switch (behavior) {
            case 'lock':
                return <Lock className="size-4" />;
            case 'hide':
                return <ArrowRight className="size-4" />;
            default:
                return <Droplet className="size-4" />;
        }
    };

    const getBehaviorColor = (behavior: string) => {
        switch (behavior) {
            case 'lock':
                return 'bg-red-100 text-red-800';
            case 'hide':
                return 'bg-gray-100 text-gray-800';
            default:
                return 'bg-blue-100 text-blue-800';
        }
    };

    return (
        <>
            <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <h1>Drip Conditions</h1>
                </div>
                <MyButton scale="small" onClick={handleAddCondition}>
                    <Plus className="mr-2 size-4" />
                    Add
                </MyButton>
            </div>

            {conditions.length === 0 ? (
                <div className="rounded-lg border border-dashed p-8 text-center">
                    <h3 className="mt-4 text-base font-medium">No drip conditions</h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                        Add conditions to control when content becomes available to learners.
                    </p>
                </div>
            ) : (
                <div className="space-y-3">
                    {conditions.map((condition) => (
                        <div
                            key={condition.id}
                            className="rounded-lg border bg-white p-4 shadow-sm"
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex-1 space-y-2">
                                    <div className="flex items-center gap-2">
                                        {condition.drip_condition.target && (
                                            <Badge variant="outline" className="capitalize">
                                                {condition.drip_condition.target}
                                            </Badge>
                                        )}
                                        <Badge
                                            className={getBehaviorColor(
                                                condition.drip_condition.behavior
                                            )}
                                        >
                                            {getBehaviorIcon(condition.drip_condition.behavior)}
                                            <span className="ml-1 capitalize">
                                                {condition.drip_condition.behavior}
                                            </span>
                                        </Badge>
                                    </div>

                                    <div className="space-y-1">
                                        {condition.drip_condition.rules.map((rule, idx) => (
                                            <div
                                                key={idx}
                                                className="flex items-start gap-2 text-sm text-gray-700"
                                            >
                                                {rule.type === 'date_based' && (
                                                    <Calendar className="mt-0.5 size-4 text-blue-600" />
                                                )}
                                                {rule.type === 'completion_based' && (
                                                    <CheckCircle className="mt-0.5 size-4 text-green-600" />
                                                )}
                                                {rule.type === 'prerequisite' && (
                                                    <Lock className="mt-0.5 size-4 text-orange-600" />
                                                )}
                                                <span>{formatDripRule(rule)}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="ml-2 flex gap-2">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleEditCondition(condition)}
                                    >
                                        <Pencil />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleDeleteCondition(condition.id)}
                                    >
                                        <Trash />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <PackageDripConditionDialog
                open={dialogOpen}
                onClose={() => setDialogOpen(false)}
                onSave={handleSaveCondition}
                packageId={packageId}
                packageName={packageName}
                condition={editingCondition}
            />
        </>
    );
};
