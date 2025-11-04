import { Workflow } from '@/types/workflow/workflow-types';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { useNavigate } from '@tanstack/react-router';
import { Calendar, Clock, Tag } from 'phosphor-react';

interface WorkflowCardProps {
    workflow: Workflow;
}

export function WorkflowCard({ workflow }: WorkflowCardProps) {
    const navigate = useNavigate();

    const formatDate = (dateString: string) => {
        try {
            const date = new Date(dateString);
            return formatDistanceToNow(date, { addSuffix: true });
        } catch (error) {
            return 'Unknown';
        }
    };

    const formatWorkflowType = (type: string) => {
        // Convert EVENT_DRIVEN to "Event Driven", SCHEDULED to "Scheduled", etc.
        return type
            .split('_')
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(' ');
    };

    const handleCardClick = () => {
        navigate({ to: '/workflow/$workflowId', params: { workflowId: workflow.id } });
    };

    return (
        <Card
            className="group cursor-pointer transition-all duration-200 hover:shadow-lg hover:border-primary-300 border-neutral-200"
            onClick={handleCardClick}
        >
            <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                    <h3 className="text-lg font-semibold text-neutral-900 group-hover:text-primary-600 transition-colors line-clamp-2">
                        {workflow.name}
                    </h3>
                    <Badge
                        variant={workflow.status === 'ACTIVE' ? 'default' : 'secondary'}
                        className="shrink-0 bg-green-100 text-green-800 hover:bg-green-100"
                    >
                        {workflow.status}
                    </Badge>
                </div>
            </CardHeader>

            <CardContent className="space-y-4">
                {/* Description */}
                <p className="text-sm text-neutral-600 line-clamp-3 min-h-[3rem]">
                    {workflow.description || 'No description available'}
                </p>

                {/* Workflow Type */}
                <div className="flex items-center gap-2 text-sm">
                    <Tag className="text-primary-500" size={16} weight="fill" />
                    <span className="text-neutral-500">Type:</span>
                    <Badge variant="outline" className="font-medium text-primary-700">
                        {formatWorkflowType(workflow.workflow_type)}
                    </Badge>
                </div>

                {/* Metadata */}
                <div className="space-y-2 border-t border-neutral-200 pt-3">
                    <div className="flex items-center gap-2 text-xs text-neutral-500">
                        <Calendar size={14} weight="duotone" className="text-neutral-400" />
                        <span>Created {formatDate(workflow.created_at)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-neutral-500">
                        <Clock size={14} weight="duotone" className="text-neutral-400" />
                        <span>Updated {formatDate(workflow.updated_at)}</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

