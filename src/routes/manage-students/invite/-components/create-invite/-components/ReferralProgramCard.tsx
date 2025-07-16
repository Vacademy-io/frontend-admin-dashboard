import { UseFormReturn } from 'react-hook-form';
import { InviteLinkFormValues } from '../GenerateInviteLinkSchema';
import { MyButton } from '@/components/design-system/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Gear, Gift, TrendUp, Users } from 'phosphor-react';

interface DiscountSettingsDialogProps {
    form: UseFormReturn<InviteLinkFormValues>;
}

const ReferralProgramCard = ({ form }: DiscountSettingsDialogProps) => {
    const referralPrograms = form.getValues('referralPrograms');
    return (
        <>
            <div className="flex flex-col">
                <div className="flex flex-col">
                    <span className="font-medium">Referral Settings</span>
                    <span className="text-sm">
                        Configure rewards for referrers and referees when referral codes are used
                    </span>
                </div>
            </div>
            <Card className="mb-4">
                <CardHeader className="-mb-5 flex flex-row items-center justify-between ">
                    <div className="flex items-center gap-2">
                        <span className="flex items-center gap-2 text-lg font-semibold">
                            <TrendUp size={20} />
                            <span>Referral Program</span>
                        </span>
                        <Badge variant="default" className="ml-2">
                            Default
                        </Badge>
                    </div>
                    <MyButton
                        type="button"
                        scale="small"
                        buttonType="secondary"
                        className="p-4"
                        onClick={() => form.setValue('showReferralDialog', true)}
                    >
                        Change Referral Settings
                    </MyButton>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Referee Benefit */}
                    <div className="mt-2 flex flex-col items-start gap-2">
                        <div className="flex items-center gap-2">
                            <Gift size={18} />
                            <span className="font-semibold">Referee Benefit</span>
                        </div>
                        <span className="ml-6 font-semibold text-green-700">
                            {
                                referralPrograms.find(
                                    (p) => p.id === form.watch('selectedReferralId')
                                )?.refereeBenefit
                            }
                        </span>
                    </div>
                    {/* Referrer Tiers */}
                    <div className="mt-2 flex flex-col items-start gap-2">
                        <div className="flex items-center gap-2">
                            <Users size={18} />
                            <span className="font-semibold">Referrer Tiers</span>
                        </div>
                        {referralPrograms
                            .find((p) => p.id === form.watch('selectedReferralId'))
                            ?.referrerTiers.map((tier, idx) => (
                                <div
                                    key={idx}
                                    className="ml-4 flex w-full items-center justify-between pr-4"
                                >
                                    <span className="ml-2 text-gray-700">{tier.tier}</span>
                                    {tier.icon}
                                </div>
                            ))}
                    </div>
                    {/* Program Settings */}
                    <div className="mt-4">
                        <div className="flex items-center gap-2">
                            <Gear size={18} />
                            <span className="font-semibold">Program Settings</span>
                        </div>
                        <div className="ml-6 mt-2 flex items-center justify-between">
                            <span className="text-gray-700">Vesting Period</span>
                            <span>
                                {
                                    referralPrograms.find(
                                        (p) => p.id === form.watch('selectedReferralId')
                                    )?.vestingPeriod
                                }
                            </span>
                        </div>
                        <div className="ml-6 mt-2 flex items-center justify-between">
                            <span className="text-gray-700">Combine Offers</span>
                            <span>
                                {referralPrograms.find(
                                    (p) => p.id === form.watch('selectedReferralId')
                                )?.combineOffers
                                    ? 'Yes'
                                    : 'No'}
                            </span>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </>
    );
};

export default ReferralProgramCard;
