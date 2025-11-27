import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2, Save } from 'lucide-react';
import type { PlanningFormData } from '../../-types/types';
import { useCreatePlanningLogs } from '../../-services/createPlanningLogs';
import TitleGeneratorSection from '../../-components/TitleGeneratorSection';
import PlanningFormSection1 from '../../-components/PlanningFormSection1';
import PlanningFormSection2 from '../../-components/PlanningFormSection2';
import { LayoutContainer } from '@/components/common/layout-container/layout-container';
import { Separator } from '@/components/ui/separator';
import { wrapContentInHTML } from '../../-utils/templateLoader';
import { useNavHeadingStore } from '@/stores/layout-container/useNavHeadingStore';

export const Route = createFileRoute('/planning/planning/create/')({
    component: CreatePlanningLog,
});

function CreatePlanningLog() {
    const navigate = useNavigate();
    const [planningEntries, setPlanningEntries] = useState<PlanningFormData[]>([
        {
            log_type: 'planning', // Fixed to planning
            title: '',
            description: '',
            packageSessionId: '',
            subject_id: '',
            interval_type: 'monthly',
            selectedDate: new Date(),
            interval_type_id: '',
            content_html: '',
            uploadedFileIds: [],
        },
    ]);

    const { setNavHeading } = useNavHeadingStore();

    const createMutation = useCreatePlanningLogs();

    useEffect(() => {
        setNavHeading(`Create Planning`);
    }, [setNavHeading]);

    const handleAddMore = () => {
        // Copy Section 1 data from the last entry
        const lastEntry = planningEntries[planningEntries.length - 1];
        if (!lastEntry) return;

        setPlanningEntries([
            ...planningEntries,
            {
                log_type: 'planning', // Always planning
                title: lastEntry.title,
                description: lastEntry.description,
                packageSessionId: lastEntry.packageSessionId,
                subject_id: lastEntry.subject_id,
                // Reset Section 2 fields
                interval_type: 'monthly' as const,
                selectedDate: new Date(),
                interval_type_id: '',
                content_html: '',
                uploadedFileIds: [],
            },
        ]);
    };

    const handleRemoveEntry = (index: number) => {
        if (planningEntries.length === 1) {
            return; // Don't remove the last entry
        }
        setPlanningEntries(planningEntries.filter((_, i) => i !== index));
    };

    const handleUpdateEntry = (index: number, data: Partial<PlanningFormData>) => {
        const updated = [...planningEntries];
        updated[index] = { ...updated[index], ...data } as PlanningFormData;
        setPlanningEntries(updated);
    };

    const handleSave = async () => {
        // Validate all entries
        const logs = planningEntries.map((entry) => ({
            log_type: 'planning' as const, // Always planning
            entity: 'packageSession' as const,
            entity_id: entry.packageSessionId,
            interval_type: entry.interval_type,
            interval_type_id: entry.interval_type_id,
            title: entry.title,
            description: entry.description || undefined,
            content_html: wrapContentInHTML(entry.content_html),
            subject_id: entry.subject_id,
            comma_separated_file_ids: entry.uploadedFileIds.join(',') || undefined,
        }));

        try {
            await createMutation.mutateAsync({ logs });
            // Navigate back to planning-logs list on success
            navigate({ to: '/planning/planning', search: { packageSessionId: '' } });
        } catch (error) {
            // Error is handled by the mutation
            console.error('Failed to create planning logs:', error);
        }
    };

    return (
        <LayoutContainer>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-semibold">Create Planning</h2>
                    <div className="flex gap-2">
                        <Button
                            onClick={handleAddMore}
                            variant="outline"
                            className="flex items-center gap-2"
                        >
                            <Plus className="h-4 w-4" />
                            Add More
                        </Button>
                        <Button
                            onClick={handleSave}
                            disabled={createMutation.isPending}
                            className="flex items-center gap-2"
                        >
                            <Save className="h-4 w-4" />
                            {createMutation.isPending ? 'Saving...' : 'Save All'}
                        </Button>
                    </div>
                </div>

                {planningEntries.map((entry, index) => (
                    <Card key={index} className="relative">
                        {planningEntries.length > 1 && (
                            <Button
                                variant="ghost"
                                size="icon"
                                className="absolute right-2 top-2"
                                onClick={() => handleRemoveEntry(index)}
                            >
                                <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                        )}

                        <CardContent className="space-y-6 py-4">
                            {/* Title Generator Section: Interval Type + Course */}
                            <TitleGeneratorSection
                                data={entry}
                                onChange={(data) => handleUpdateEntry(index, data)}
                            />

                            <Separator />

                            {/* Section 1: Title, Subject, Description */}
                            <PlanningFormSection1
                                data={entry}
                                onChange={(data) => handleUpdateEntry(index, data)}
                                fixedLogType="planning"
                            />

                            <Separator />

                            {/* Section 2: Content & Files */}
                            <PlanningFormSection2
                                data={entry}
                                onChange={(data) => handleUpdateEntry(index, data)}
                            />
                        </CardContent>
                    </Card>
                ))}
            </div>
        </LayoutContainer>
    );
}
