import { createLazyFileRoute } from '@tanstack/react-router';
import { ComingSoon } from '@/components/common/ComingSoon';

export const Route = createLazyFileRoute('/admission/registration')({
    component: ComingSoon,
});
