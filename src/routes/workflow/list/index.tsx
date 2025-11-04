import { createFileRoute } from '@tanstack/react-router';
import { LayoutContainer } from '@/components/common/layout-container/layout-container';
import { Helmet } from 'react-helmet';
import { WorkflowListPage } from './-components/workflow-list-page';

export const Route = createFileRoute('/workflow/list/')({
    component: WorkflowList,
});

export function WorkflowList() {
    return (
        <LayoutContainer>
            <Helmet>
                <title>Workflows</title>
                <meta name="description" content="View and manage all active workflows" />
            </Helmet>
            <WorkflowListPage />
        </LayoutContainer>
    );
}
