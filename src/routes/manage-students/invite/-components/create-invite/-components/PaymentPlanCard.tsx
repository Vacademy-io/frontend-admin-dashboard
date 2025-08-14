import { UseFormReturn } from 'react-hook-form';
import { InviteLinkFormValues } from '../GenerateInviteLinkSchema';
import { MyButton } from '@/components/design-system/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getCurrencySymbol, getPaymentPlanIcon } from '../PaymentPlansDialog';
import { X, Check } from 'lucide-react';
import { FormControl, FormField, FormItem } from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';

interface DiscountSettingsDialogProps {
    form: UseFormReturn<InviteLinkFormValues>;
}

interface PaymentOption {
    features?: string[];
    title?: string;
    price?: string;
    value?: number;
    unit?: string;
}

// Helper function to get all unique features across all payment options
export const getAllUniqueFeatures = (paymentOptions: PaymentOption[]): string[] => {
    const allFeatures = new Set<string>();
    paymentOptions?.forEach((option) => {
        option.features?.forEach((feature: string) => {
            allFeatures.add(feature);
        });
    });
    return Array.from(allFeatures);
};

const PaymentPlanCard = ({ form }: DiscountSettingsDialogProps) => {
    // Get all unique features across all payment options
    const selectedPlan = form.watch('selectedPlan');
    const allFeatures = selectedPlan?.paymentOption
        ? getAllUniqueFeatures(selectedPlan.paymentOption)
        : [];
    return (
        <>
            {/* Payment Plan Section */}
            <div className="flex items-center justify-between py-2">
                <div className="flex items-center gap-2">
                    <span className="text-base font-semibold">Payment Plan</span>
                    {(form.watch('selectedPlan')?.type?.toLowerCase() === 'subscription' ||
                        form.watch('selectedPlan')?.type?.toLowerCase() === 'upfront' ||
                        form.watch('selectedPlan')?.type?.toLowerCase() === 'one_time') && (
                        <FormField
                            control={form.control}
                            name="includePaymentPlans"
                            render={({ field }) => (
                                <FormItem>
                                    <FormControl>
                                        <div className="flex items-center gap-2">
                                            <Switch
                                                id="institute-logo-switch"
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                            />
                                            <span>Show Payment Plans In Invite</span>
                                        </div>
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                    )}
                </div>
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
                            {getPaymentPlanIcon(
                                form.watch('selectedPlan')?.type?.toLowerCase() || ''
                            )}
                            <div className="flex flex-1 flex-col font-semibold">
                                <span>{form.watch('selectedPlan')?.name}</span>
                            </div>
                            <Badge variant="default" className="ml-auto">
                                Default
                            </Badge>
                        </div>
                        {form.watch('selectedPlan')?.type?.toLowerCase() === 'donation' && (
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
                        {form.watch('selectedPlan')?.type?.toLowerCase() === 'free' && (
                            <div className="flex flex-col gap-2 pl-8 text-xs text-neutral-600">
                                <span>Free for {form.watch('selectedPlan')?.days} days</span>
                            </div>
                        )}
                        {(form.watch('selectedPlan')?.type?.toLowerCase() === 'upfront' ||
                            form.watch('selectedPlan')?.type?.toLowerCase() === 'one_time') && (
                            <div className="flex flex-col gap-4 pl-8">
                                {form.watch('selectedPlan')?.paymentOption ? (
                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                                        {form
                                            .watch('selectedPlan')
                                            ?.paymentOption?.map((payment, idx) => {
                                                return (
                                                    <Card
                                                        key={idx}
                                                        className="border border-gray-200 p-4 transition-colors hover:border-gray-300"
                                                    >
                                                        <div className="flex flex-col gap-3">
                                                            {/* Title */}
                                                            <h4 className="text-base font-bold text-gray-900">
                                                                {payment.title}
                                                            </h4>

                                                            {/* Price with time period inline */}
                                                            <div className="text-xl font-bold text-primary-500">
                                                                {getCurrencySymbol(
                                                                    form.watch('selectedPlan')
                                                                        ?.currency || ''
                                                                )}
                                                                {payment.price}&nbsp;
                                                                {payment.value && payment.unit && (
                                                                    <span className="text-sm font-normal text-gray-500">
                                                                        /{payment.value}{' '}
                                                                        {payment.unit}
                                                                    </span>
                                                                )}
                                                            </div>

                                                            {/* Features */}
                                                            {allFeatures.length > 0 && (
                                                                <div className="space-y-2">
                                                                    {allFeatures.map(
                                                                        (feature, featureIdx) => {
                                                                            const isIncluded =
                                                                                payment.features?.includes(
                                                                                    feature
                                                                                );
                                                                            return (
                                                                                <div
                                                                                    key={featureIdx}
                                                                                    className="flex items-center gap-1.5 text-sm"
                                                                                >
                                                                                    {isIncluded ? (
                                                                                        <Check className="size-3 shrink-0 text-emerald-500" />
                                                                                    ) : (
                                                                                        <X className="size-3 shrink-0 text-gray-400" />
                                                                                    )}
                                                                                    <span
                                                                                        className={`${
                                                                                            isIncluded
                                                                                                ? 'text-gray-700'
                                                                                                : 'text-gray-400 line-through'
                                                                                        } leading-tight`}
                                                                                    >
                                                                                        {feature}
                                                                                    </span>
                                                                                </div>
                                                                            );
                                                                        }
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </Card>
                                                );
                                            })}
                                    </div>
                                ) : (
                                    /* Fallback for upfront plans without paymentOption array */
                                    <Card className="border border-gray-200 p-4">
                                        <div className="flex flex-col gap-3">
                                            <h4 className="text-base font-bold text-gray-900">
                                                Full Payment
                                            </h4>
                                            <div className="text-base font-bold text-gray-900">
                                                {getCurrencySymbol(
                                                    form.watch('selectedPlan')?.currency || ''
                                                )}
                                                {form.watch('selectedPlan')?.price}
                                                <span>/one-time</span>
                                            </div>
                                        </div>
                                    </Card>
                                )}
                            </div>
                        )}
                        {form.watch('selectedPlan')?.type?.toLowerCase() === 'subscription' && (
                            <div className="flex w-fit flex-wrap gap-4 pl-8">
                                {form.watch('selectedPlan')?.paymentOption?.map((payment, idx) => {
                                    return (
                                        <Card
                                            key={idx}
                                            className="border border-gray-200 p-8 py-6 transition-colors hover:border-gray-300"
                                        >
                                            <div className="flex flex-col gap-3">
                                                {/* Title */}
                                                <h4 className="text-xl font-bold text-gray-900">
                                                    {payment.title}
                                                </h4>

                                                {/* Price with time period inline */}
                                                <div className="text-xl font-bold text-primary-500">
                                                    {getCurrencySymbol(
                                                        form.watch('selectedPlan')?.currency || ''
                                                    )}
                                                    {payment.price}&nbsp;
                                                    {payment.value && payment.unit && (
                                                        <span className="text-sm font-normal text-gray-500">
                                                            /{payment.value} {payment.unit}
                                                        </span>
                                                    )}
                                                </div>

                                                {/* Features */}
                                                {allFeatures.length > 0 && (
                                                    <div className="space-y-2">
                                                        {allFeatures.map((feature, featureIdx) => {
                                                            const isIncluded =
                                                                payment.features?.includes(feature);
                                                            return (
                                                                <div
                                                                    key={featureIdx}
                                                                    className="flex items-center gap-1.5 text-sm"
                                                                >
                                                                    {isIncluded ? (
                                                                        <Check className="size-3 shrink-0 text-emerald-500" />
                                                                    ) : (
                                                                        <X className="size-3 shrink-0 text-gray-400" />
                                                                    )}
                                                                    <span
                                                                        className={`${
                                                                            isIncluded
                                                                                ? 'text-gray-700'
                                                                                : 'text-gray-400 line-through'
                                                                        } leading-tight`}
                                                                    >
                                                                        {feature}
                                                                    </span>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                )}
                                            </div>
                                        </Card>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </Card>
            )}
        </>
    );
};

export default PaymentPlanCard;
