import { UseFormReturn } from 'react-hook-form';
import { InviteLinkFormValues } from '../GenerateInviteLinkSchema';
import { MyButton } from '@/components/design-system/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getCurrencySymbol, getPaymentPlanIcon } from '../PaymentPlansDialog';

interface DiscountSettingsDialogProps {
    form: UseFormReturn<InviteLinkFormValues>;
}

const PaymentPlanCard = ({ form }: DiscountSettingsDialogProps) => {
    return (
        <>
            {/* Payment Plan Section */}
            <div className="flex items-center justify-between py-2">
                <span className="text-base font-semibold">Payment Plan</span>
                <MyButton
                    type="button"
                    scale="small"
                    buttonType="secondary"
                    className="p-4"
                    onClick={() => form.setValue('showPlansDialog', true)}
                >
                    Change Payment Plans
                </MyButton>
            </div>
            {/* Show selected plan in a card */}
            {form.watch('selectedPlan') && (
                <Card className="mb-4 flex flex-col gap-0">
                    <div className="flex flex-col items-start gap-3 p-4">
                        <div className="flex items-center gap-3">
                            {getPaymentPlanIcon(form.watch('selectedPlan')?.type || '')}
                            <div className="flex flex-1 flex-col font-semibold">
                                <span>{form.watch('selectedPlan')?.name}</span>
                            </div>
                            <Badge variant="default" className="ml-auto">
                                Default
                            </Badge>
                        </div>
                        {form.watch('selectedPlan')?.type === 'donation' && (
                            <div className="flex flex-col gap-2 pl-8 text-xs text-neutral-600">
                                <span>
                                    Suggested Amounts:{' '}
                                    {getCurrencySymbol(form.watch('selectedPlan')?.currency || '')}
                                    {form.watch('selectedPlan')?.suggestedAmount?.join(',')}
                                </span>
                                <span>
                                    Minimum Amount:{' '}
                                    {getCurrencySymbol(form.watch('selectedPlan')?.currency || '')}
                                    {form.watch('selectedPlan')?.minAmount}
                                </span>
                                <span>Currency: {form.watch('selectedPlan')?.currency}</span>
                            </div>
                        )}
                        {(form.watch('selectedPlan')?.type === 'free' ||
                            form.watch('selectedPlan')?.type === 'Free') && (
                            <div className="flex flex-col gap-2 pl-8 text-xs text-neutral-600">
                                <span>Free for {form.watch('selectedPlan')?.days} days</span>
                            </div>
                        )}
                        {form.watch('selectedPlan')?.type === 'upfront' && (
                            <div className="flex flex-col gap-2 pl-8 text-xs text-neutral-600">
                                <span>
                                    Full Price:{' '}
                                    {getCurrencySymbol(form.watch('selectedPlan')?.currency || '')}
                                    {form.watch('selectedPlan')?.price}
                                </span>
                                <span>Currency: {form.watch('selectedPlan')?.currency}</span>
                            </div>
                        )}
                        {form.watch('selectedPlan')?.type === 'subscription' && (
                            <div className="flex flex-col gap-2 pl-8 text-xs text-neutral-600">
                                {form.watch('selectedPlan')?.paymentOption?.map((payment, idx) => {
                                    return (
                                        <div key={idx} className="flex">
                                            <span>
                                                {payment.title}:{' '}
                                                {getCurrencySymbol(
                                                    form.watch('selectedPlan')?.currency || ''
                                                )}
                                                {payment.price}
                                            </span>
                                        </div>
                                    );
                                })}
                                <span>Currency: {form.watch('selectedPlan')?.currency}</span>
                            </div>
                        )}
                    </div>
                </Card>
            )}
        </>
    );
};

export default PaymentPlanCard;
