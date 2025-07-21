import {
    Dialog as ShadDialog,
    DialogContent as ShadDialogContent,
    DialogHeader as ShadDialogHeader,
    DialogTitle as ShadDialogTitle,
    DialogDescription as ShadDialogDescription,
} from '@/components/ui/dialog';
import { Card } from '@/components/ui/card';
import { Gift } from 'phosphor-react';
import { Badge } from '@/components/ui/badge';
import { MyButton } from '@/components/design-system/button';
import { UseFormReturn } from 'react-hook-form';
import { InviteLinkFormValues } from './GenerateInviteLinkSchema';
import { useSuspenseQuery } from '@tanstack/react-query';
import { handleGetPaymentDetails } from './-services/get-payments';
import { useEffect } from 'react';
import { getDefaultPlanFromPaymentsData, splitPlansByType } from './-utils/helper';

interface PaymentPlansDialogProps {
    form: UseFormReturn<InviteLinkFormValues>;
}

export function PaymentPlansDialog({ form }: PaymentPlansDialogProps) {
    const { data: paymentsData } = useSuspenseQuery(handleGetPaymentDetails());

    useEffect(() => {
        form.reset({
            ...form.getValues(),
            freePlans: splitPlansByType(paymentsData).freePlans,
            paidPlans: splitPlansByType(paymentsData).paidPlans,
            selectedPlan: getDefaultPlanFromPaymentsData(paymentsData),
        });
    }, [paymentsData]);

    return (
        <ShadDialog
            open={form.watch('showPlansDialog')}
            onOpenChange={(open) => form.setValue('showPlansDialog', open)}
        >
            <ShadDialogContent className="flex h-[80vh] min-w-[60vw] max-w-lg flex-col overflow-auto">
                <ShadDialogHeader>
                    <ShadDialogTitle className="font-bold">Select a Payment Plan</ShadDialogTitle>
                    <ShadDialogDescription className="mt-1">
                        Choose a payment plan for this course
                    </ShadDialogDescription>
                </ShadDialogHeader>
                <div className="flex-1 overflow-auto">
                    <div className="mb-4">
                        <div className="mb-2 mt-4 font-semibold">Free Plans</div>
                        <div className="flex flex-col gap-4">
                            {form.getValues('freePlans')?.map((plan) => (
                                <Card
                                    key={plan.id}
                                    className={`cursor-pointer border-2 ${form.watch('selectedPlan')?.id === plan.id ? 'border-primary' : 'border-gray-200'} transition-all`}
                                    onClick={() => {
                                        form.setValue('selectedPlan', plan);
                                        form.setValue('showPlansDialog', false);
                                    }}
                                >
                                    <div className="flex items-center gap-3 p-4">
                                        <Gift size={18} />
                                        <div className="flex flex-1 flex-col">
                                            <span>{plan.name}</span>
                                            <span className="text-neutral-600">
                                                {plan.description}
                                            </span>
                                        </div>
                                        {form.watch('selectedPlan')?.id === plan.id && (
                                            <Badge variant="default" className="ml-auto">
                                                Default
                                            </Badge>
                                        )}
                                    </div>
                                </Card>
                            ))}
                        </div>
                    </div>
                    <div>
                        <div className="mb-2 font-semibold">Paid Plans</div>
                        <div className="flex flex-col gap-4">
                            {form.getValues('paidPlans')?.map((plan) => (
                                <Card
                                    key={plan.id}
                                    className={`cursor-pointer border-2 ${form.watch('selectedPlan')?.id === plan.id ? 'border-primary' : 'border-gray-200'} transition-all`}
                                    onClick={() => {
                                        form.setValue('selectedPlan', plan);
                                        form.setValue('showPlansDialog', false);
                                    }}
                                >
                                    <div className="flex items-center gap-3 p-4">
                                        <Gift size={18} />
                                        <div className="flex flex-1 flex-col">
                                            <span>{plan.name}</span>
                                            <span className="text-neutral-600">
                                                {plan.description}
                                            </span>
                                            <span className="text-neutral-600">{plan.price}</span>
                                        </div>
                                        {form.watch('selectedPlan')?.id === plan.id && (
                                            <Badge variant="default" className="ml-auto">
                                                Default
                                            </Badge>
                                        )}
                                    </div>
                                </Card>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="-mb-2 flex justify-center border-t bg-white pt-4">
                    <MyButton
                        type="button"
                        scale="small"
                        buttonType="secondary"
                        onClick={() => form.setValue('showAddPlanDialog', true)}
                        className="p-4"
                    >
                        + Add New Payment Plan
                    </MyButton>
                </div>
            </ShadDialogContent>
        </ShadDialog>
    );
}
