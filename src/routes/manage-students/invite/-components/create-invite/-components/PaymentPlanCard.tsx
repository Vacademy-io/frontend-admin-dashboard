import { UseFormReturn } from 'react-hook-form';
import { InviteLinkFormValues } from '../GenerateInviteLinkSchema';
import { MyButton } from '@/components/design-system/button';
import { Card, CardContent } from '@/components/ui/card';
import { CalendarBlank, Gift } from 'phosphor-react';
import { Badge } from '@/components/ui/badge';

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
                    <div className="flex items-center gap-2 px-6 pt-6 text-lg font-semibold">
                        {form.watch('selectedPlan')?.price ? (
                            <CalendarBlank size={20} />
                        ) : (
                            <Gift size={20} />
                        )}
                        <span>{form.watch('selectedPlan')?.name}</span>
                        <Badge variant="default" className="ml-2">
                            Default
                        </Badge>
                    </div>
                    <CardContent className="">
                        <div className="text-sm text-gray-600">
                            {form.watch('selectedPlan')?.description}
                        </div>
                        {form.watch('selectedPlan')?.price && (
                            <div className="mt-2 text-base font-bold text-green-700">
                                {form.watch('selectedPlan')?.price}
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}
        </>
    );
};

export default PaymentPlanCard;
