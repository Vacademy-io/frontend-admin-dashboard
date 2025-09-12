import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Users, Gift, X } from 'lucide-react';
import { PaymentPlan } from '@/types/payment';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';

interface ReferralViewDialogProps {
    isOpen: boolean;
    onClose: () => void;
    plan: PaymentPlan | null;
}

export const ReferralViewDialog: React.FC<ReferralViewDialogProps> = ({
    isOpen,
    onClose,
    plan,
}) => {
    if (!plan || !plan.referralOption) {
        return null;
    }

    const { referralOption } = plan;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-h-[90vh] min-w-[800px] overflow-y-auto">
                <DialogHeader>
                    <div className="flex items-center justify-between">
                        <DialogTitle className="flex items-center gap-2">
                            <Users className="size-5" />
                            Referral Settings - {plan.name}
                        </DialogTitle>
                        <Button variant="ghost" size="sm" onClick={onClose}>
                            <X className="size-4" />
                        </Button>
                    </div>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Overview */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Overview</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">Plan Currency:</span>
                                <Badge variant="outline">{plan.currency}</Badge>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">Referee Benefits:</span>
                                <Badge
                                    variant={
                                        referralOption.includeRefereeReward
                                            ? 'default'
                                            : 'secondary'
                                    }
                                >
                                    {referralOption.includeRefereeReward ? 'Enabled' : 'Disabled'}
                                </Badge>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">Referrer Rewards:</span>
                                <Badge
                                    variant={
                                        referralOption.includeReferrerReward
                                            ? 'default'
                                            : 'secondary'
                                    }
                                >
                                    {referralOption.includeReferrerReward ? 'Enabled' : 'Disabled'}
                                </Badge>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">Vesting Period:</span>
                                <span className="text-sm">
                                    {referralOption.vestingDays || 7} days
                                </span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Referee Benefits */}
                    {referralOption.includeRefereeReward && referralOption.refereeReward && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Gift className="size-5 text-green-600" />
                                    Referee Benefits
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <span className="text-sm font-medium">Reward Type:</span>
                                        <p className="text-sm capitalize text-gray-600">
                                            {referralOption.refereeReward.type.replace('_', ' ')}
                                        </p>
                                    </div>
                                    {referralOption.refereeReward.value && (
                                        <div>
                                            <span className="text-sm font-medium">Value:</span>
                                            <p className="text-sm text-gray-600">
                                                {referralOption.refereeReward.type ===
                                                'discount_percentage'
                                                    ? `${referralOption.refereeReward.value}%`
                                                    : referralOption.refereeReward.type ===
                                                        'discount_fixed'
                                                      ? `${plan.currency} ${referralOption.refereeReward.value}`
                                                      : `${referralOption.refereeReward.value} days`}
                                            </p>
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <span className="text-sm font-medium">Description:</span>
                                    <p className="text-sm text-gray-600">
                                        {referralOption.refereeReward.description ||
                                            'No description provided'}
                                    </p>
                                </div>
                                {referralOption.refereeReward.delivery && (
                                    <div>
                                        <span className="text-sm font-medium">
                                            Delivery Methods:
                                        </span>
                                        <div className="mt-1 flex gap-2">
                                            {referralOption.refereeReward.delivery.email && (
                                                <Badge variant="outline">📧 Email</Badge>
                                            )}
                                            {referralOption.refereeReward.delivery.whatsapp && (
                                                <Badge variant="outline">💬 WhatsApp</Badge>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}

                    {/* Referrer Rewards */}
                    {referralOption.includeReferrerReward &&
                        referralOption.referrerRewards &&
                        referralOption.referrerRewards.length > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Users className="size-5 text-blue-600" />
                                        Referrer Reward Tiers
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Tier Name</TableHead>
                                                <TableHead>Referrals Required</TableHead>
                                                <TableHead>Reward Type</TableHead>
                                                <TableHead>Value</TableHead>
                                                <TableHead>Description</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {referralOption.referrerRewards
                                                .sort((a, b) => a.referralCount - b.referralCount)
                                                .map((tier) => (
                                                    <TableRow key={tier.id}>
                                                        <TableCell className="font-medium">
                                                            {tier.tierName}
                                                        </TableCell>
                                                        <TableCell>
                                                            <Badge variant="secondary">
                                                                {tier.referralCount}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell className="capitalize">
                                                            {tier.reward.type.replace('_', ' ')}
                                                        </TableCell>
                                                        <TableCell>
                                                            {tier.reward.type ===
                                                                'discount_percentage' &&
                                                                `${tier.reward.value}%`}
                                                            {tier.reward.type ===
                                                                'discount_fixed' &&
                                                                `${plan.currency} ${tier.reward.value}`}
                                                            {tier.reward.type === 'free_days' &&
                                                                `${tier.reward.value} days`}
                                                            {tier.reward.type === 'bonus_content' &&
                                                                'Content'}
                                                            {tier.reward.type === 'points_system' &&
                                                                'Points'}
                                                            {tier.reward.type === 'free_course' &&
                                                                'Course Access'}
                                                        </TableCell>
                                                        <TableCell className="max-w-xs truncate">
                                                            {tier.reward.description}
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                        </TableBody>
                                    </Table>
                                </CardContent>
                            </Card>
                        )}

                    {/* No Referral Settings Message */}
                    {!referralOption.includeRefereeReward &&
                        !referralOption.includeReferrerReward && (
                            <Card>
                                <CardContent className="py-8 text-center">
                                    <Users className="mx-auto mb-4 size-12 text-gray-300" />
                                    <p className="text-gray-500">
                                        No referral rewards configured for this plan.
                                    </p>
                                </CardContent>
                            </Card>
                        )}
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default ReferralViewDialog;
