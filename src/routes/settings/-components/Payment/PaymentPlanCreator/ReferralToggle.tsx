import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Users, Gift } from 'lucide-react';

interface ReferralToggleProps {
    includeRefereeReward: boolean;
    includeReferrerReward: boolean;
    onRefereeRewardToggle: (enabled: boolean) => void;
    onReferrerRewardToggle: (enabled: boolean) => void;
}

export const ReferralToggle: React.FC<ReferralToggleProps> = ({
    includeRefereeReward,
    includeReferrerReward,
    onRefereeRewardToggle,
    onReferrerRewardToggle,
}) => {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Users className="size-5" />
                    Referral Options
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <p className="text-sm text-gray-600">
                    Enable referral rewards to incentivize users to invite others to your platform.
                </p>

                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Gift className="size-4 text-green-600" />
                            <div>
                                <Label htmlFor="referee-reward" className="text-sm font-medium">
                                    Referee Benefits
                                </Label>
                                <p className="text-xs text-gray-500">
                                    Rewards for users who get referred (new users)
                                </p>
                            </div>
                        </div>
                        <Switch
                            id="referee-reward"
                            checked={includeRefereeReward}
                            onCheckedChange={onRefereeRewardToggle}
                        />
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Users className="size-4 text-blue-600" />
                            <div>
                                <Label htmlFor="referrer-reward" className="text-sm font-medium">
                                    Referrer Rewards
                                </Label>
                                <p className="text-xs text-gray-500">
                                    Tier-based rewards for users who make referrals
                                </p>
                            </div>
                        </div>
                        <Switch
                            id="referrer-reward"
                            checked={includeReferrerReward}
                            onCheckedChange={onReferrerRewardToggle}
                        />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};
