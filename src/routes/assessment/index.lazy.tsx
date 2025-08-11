import { createLazyFileRoute } from '@tanstack/react-router';

const AssessmentRouteComponent = () => import('./index').then((m) => m.default);

export const Route = createLazyFileRoute('/assessment/')({
    component: AssessmentRouteComponent,
});
