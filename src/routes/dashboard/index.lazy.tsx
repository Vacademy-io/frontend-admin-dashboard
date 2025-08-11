import { createLazyFileRoute } from '@tanstack/react-router';
import DashboardPage from './index';

export const Route = createLazyFileRoute('/dashboard/')({
    component: DashboardPage,
});
