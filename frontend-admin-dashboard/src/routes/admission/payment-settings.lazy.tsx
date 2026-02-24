import { createLazyFileRoute } from '@tanstack/react-router';
import { PaymentSettings } from '@/features/admission/PaymentSettings';

export const Route = createLazyFileRoute('/admission/payment-settings')({
    component: PaymentSettings,
});
