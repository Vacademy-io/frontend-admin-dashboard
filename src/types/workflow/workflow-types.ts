export interface Workflow {
    id: string;
    name: string;
    description: string;
    status: string;
    workflow_type: string;
    created_by_user_id: string;
    institute_id: string;
    created_at: string;
    updated_at: string;
}

export interface WorkflowListResponse {
    workflows: Workflow[];
    totalCount: number;
}

export type NodeType =
    | 'TRIGGER'
    | 'ACTION'
    | 'DECISION'
    | 'EMAIL'
    | 'NOTIFICATION'
    | 'DATABASE'
    | 'WEBHOOK'
    | 'UNKNOWN';

export interface WorkflowNode {
    id: string;
    title: string;
    description?: string;
    type: NodeType;
    details?: Record<string, unknown>;
}

export interface WorkflowEdge {
    id: string;
    sourceNodeId: string;
    targetNodeId: string;
    label: string;
}

export interface AutomationDiagram {
    nodes: WorkflowNode[];
    edges: WorkflowEdge[];
}
