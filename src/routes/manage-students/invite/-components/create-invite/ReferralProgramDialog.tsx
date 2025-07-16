import React from 'react';
import {
    Dialog as ShadDialog,
    DialogContent as ShadDialogContent,
    DialogHeader as ShadDialogHeader,
    DialogTitle as ShadDialogTitle,
    DialogDescription as ShadDialogDescription,
} from '@/components/ui/dialog';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MyButton } from '@/components/design-system/button';
import { UseFormReturn } from 'react-hook-form';
import { InviteLinkFormValues } from './GenerateInviteLinkSchema';
import { Gift, Users, Gear, TrendUp } from 'phosphor-react';

interface ReferralProgramDialogProps {
    form: UseFormReturn<InviteLinkFormValues>;
}

export function ReferralProgramDialog({ form }: ReferralProgramDialogProps) {
    return (
        <ShadDialog
            open={form.watch('showReferralDialog')}
            onOpenChange={(open) => form.setValue('showReferralDialog', open)}
        >
            <ShadDialogContent className="flex h-[70vh] min-w-[60vw] max-w-lg flex-col">
                <ShadDialogHeader>
                    <ShadDialogTitle>Select Referral Program</ShadDialogTitle>
                    <ShadDialogDescription>
                        Choose a referral program for this course
                    </ShadDialogDescription>
                </ShadDialogHeader>
                <div className="mt-4 flex-1 space-y-4 overflow-auto">
                    {form.getValues('referralPrograms').map((program) => (
                        <Card
                            key={program.id}
                            className={`cursor-pointer flex-col gap-1 border-2 p-4 ${form.watch('selectedReferralId') === program.id ? 'border-primary' : 'border-gray-200'} transition-all`}
                            onClick={() => {
                                form.setValue('selectedReferralId', program.id);
                                form.setValue('showReferralDialog', false);
                            }}
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <TrendUp size={16} />
                                    <span className="text-base font-semibold">{program.name}</span>
                                </div>
                                {form.watch('selectedReferralId') === program.id && (
                                    <Badge variant="default" className="ml-2">
                                        Default
                                    </Badge>
                                )}
                            </div>
                            <div className="mt-2 flex flex-col gap-2">
                                <div className="flex items-center gap-2">
                                    <Gift size={16} />
                                    <span className="font-semibold">Referee Benefit:</span>
                                    <span className="text-green-700">{program.refereeBenefit}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Users size={16} />
                                    <span className="font-semibold">Referrer Tiers:</span>
                                </div>
                                {program.referrerTiers.map((tier, idx) => (
                                    <div key={idx} className="ml-6 flex items-center gap-2">
                                        <span className="text-gray-700">{tier.tier}</span>
                                        {tier.icon}
                                    </div>
                                ))}
                                <div className="flex items-center gap-2">
                                    <Gear size={16} />
                                    <span className="font-semibold">Program Settings:</span>
                                </div>
                                <div className="ml-6 flex items-center justify-between">
                                    <span className="text-gray-700">Vesting Period</span>
                                    <span>{program.vestingPeriod}</span>
                                </div>
                                <div className="ml-6 flex items-center justify-between">
                                    <span className="text-gray-700">Combine Offers</span>
                                    <span>{program.combineOffers ? 'Yes' : 'No'}</span>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
                <div className="-mb-2 flex justify-center border-t bg-white pt-4">
                    <MyButton
                        type="button"
                        scale="small"
                        buttonType="secondary"
                        onClick={() => form.setValue('showAddReferralDialog', true)}
                        className="p-4"
                    >
                        + Add New Referral Program
                    </MyButton>
                </div>
            </ShadDialogContent>
        </ShadDialog>
    );
}
