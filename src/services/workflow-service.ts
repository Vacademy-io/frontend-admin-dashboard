import authenticatedAxiosInstance from '@/lib/auth/axiosInstance';
import { GET_ACTIVE_WORKFLOWS_BY_INSTITUTE, GET_WORKFLOW_DIAGRAM } from '@/constants/urls';
import { Workflow, AutomationDiagram } from '@/types/workflow/workflow-types';
import { queryOptions } from '@tanstack/react-query';

export const fetchActiveWorkflows = async (instituteId: string): Promise<Workflow[]> => {
    const response = await authenticatedAxiosInstance<Workflow[]>({
        method: 'GET',
        url: `${GET_ACTIVE_WORKFLOWS_BY_INSTITUTE}/${instituteId}`,
    });
    return response.data;
};

export const getActiveWorkflowsQuery = (instituteId: string) =>
    queryOptions({
        queryKey: ['GET_ACTIVE_WORKFLOWS', instituteId],
        queryFn: () => fetchActiveWorkflows(instituteId),
        staleTime: 300000, // 5 minutes
        enabled: !!instituteId,
    });

export const fetchWorkflowDiagram = async (workflowId: string): Promise<AutomationDiagram> => {
    const response = await authenticatedAxiosInstance<AutomationDiagram>({
        method: 'GET',
        url: `${GET_WORKFLOW_DIAGRAM}/${workflowId}/diagram`,
    });
    return response.data;
};

export const getWorkflowDiagramQuery = (workflowId: string) =>
    queryOptions({
        queryKey: ['GET_WORKFLOW_DIAGRAM', workflowId],
        queryFn: () => fetchWorkflowDiagram(workflowId),
        staleTime: 300000, // 5 minutes
        enabled: !!workflowId,
    });

