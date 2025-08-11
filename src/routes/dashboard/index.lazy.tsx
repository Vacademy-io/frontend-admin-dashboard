import { createLazyFileRoute } from '@tanstack/react-router';

const DashboardPage = () => import('./index').then((m) => m.default);

export const Route = createLazyFileRoute('/dashboard/')({
    component: DashboardPage,
});
