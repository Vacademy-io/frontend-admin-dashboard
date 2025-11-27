import { useState } from 'react';
import { useListPlanningLogs } from '@/routes/planning/-services/listPlanningLogs';
import SimplePlanningTable from '@/routes/planning/-components/SimplePlanningTable';
import CreatePlanningDialog from '@/routes/planning/-components/CreatePlanningDialog';
import ViewPlanningDialog from '@/routes/planning/-components/ViewPlanningDialog';
import type { PlanningLog } from '@/routes/planning/-types/types';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useDeletePlanningLog } from '@/routes/planning/-services/updatePlanningLog';
import { MyButton } from '@/components/design-system/button';
import { useNavigate } from '@tanstack/react-router';

interface PlanningProps {
    packageSessionId: string;
}

export default function Planning({ packageSessionId }: PlanningProps) {
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [viewDialogOpen, setViewDialogOpen] = useState(false);
    const [selectedLog, setSelectedLog] = useState<PlanningLog | null>(null);
    const deleteMutation = useDeletePlanningLog();
    const navigate = useNavigate();
    const pageNo = 0;
    const pageSize = 10;
    const { data, isLoading, refetch } = useListPlanningLogs({
        pageNo,
        pageSize,
        filters: {
            entity_ids: [packageSessionId],
            log_types: ['planning'],
            statuses: ['ACTIVE'],
        },
    });

    const handleView = (log: PlanningLog) => {
        setSelectedLog(log);
        setViewDialogOpen(true);
    };

    const handleDelete = (log: PlanningLog) => {
        deleteMutation.mutate(log.id, {
            onSuccess: () => {
                refetch();
            },
        });
    };

    const handleSuccess = () => {
        refetch();
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Plannings</h3>
                <div className="flex items-center space-x-2">
                    <MyButton scale="small" onClick={() => setCreateDialogOpen(true)} size="sm">
                        <Plus className="h-4 w-4" />
                        Create
                    </MyButton>
                    <MyButton
                        buttonType="secondary"
                        scale="small"
                        onClick={() =>
                            navigate({ to: '/planning/planning', search: { packageSessionId } })
                        }
                        size="sm"
                    >
                        View all
                    </MyButton>
                </div>
            </div>

            <SimplePlanningTable
                data={data?.content || []}
                onView={handleView}
                onDelete={handleDelete}
                isLoading={isLoading}
            />

            <CreatePlanningDialog
                packageSessionId={packageSessionId}
                open={createDialogOpen}
                onOpenChange={setCreateDialogOpen}
                onSuccess={handleSuccess}
            />

            <ViewPlanningDialog
                log={selectedLog}
                open={viewDialogOpen}
                onOpenChange={setViewDialogOpen}
                onSuccess={handleSuccess}
            />
        </div>
    );
}
