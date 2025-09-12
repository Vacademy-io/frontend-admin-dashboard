import React, { useState, useCallback, useMemo, memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Plus,
    Trash2,
    Gift,
    Percent,
    DollarSign,
    Calendar,
    BookOpen,
    Star,
    Upload,
    Link,
    FileText,
    Video,
    Headphones,
} from 'lucide-react';
import { UnifiedReferralSettings } from '@/types/payment';

interface DetailedReferralConfigurationProps {
    includeRefereeReward: boolean;
    includeReferrerReward: boolean;
    refereeReward: UnifiedReferralSettings['refereeReward'];
    referrerRewards: UnifiedReferralSettings['referrerRewards'];
    vestingDays: number;
    allowCombineOffers: boolean;
    currency: string;
    onRefereeRewardChange: (reward: UnifiedReferralSettings['refereeReward']) => void;
    onReferrerRewardsChange: (rewards: UnifiedReferralSettings['referrerRewards']) => void;
    onVestingDaysChange: (days: number) => void;
    onAllowCombineOffersChange: (allow: boolean) => void;
}

// Mock data for courses
const mockCourses = [
    {
        id: '1',
        name: 'Advanced JavaScript Course',
        sessions: [
            {
                id: '1',
                name: 'Session 1: Fundamentals',
                levels: [
                    { id: '1', name: 'Beginner' },
                    { id: '2', name: 'Intermediate' },
                ],
            },
            {
                id: '2',
                name: 'Session 2: Advanced Topics',
                levels: [{ id: '1', name: 'Advanced' }],
            },
        ],
    },
    {
        id: '2',
        name: 'React Development Bootcamp',
        sessions: [{ id: '1', name: 'Session 1: Basics', levels: [{ id: '1', name: 'Beginner' }] }],
    },
    {
        id: '3',
        name: 'Python for Data Science',
        sessions: [
            {
                id: '1',
                name: 'Session 1: Python Basics',
                levels: [
                    { id: '1', name: 'Beginner' },
                    { id: '2', name: 'Intermediate' },
                ],
            },
        ],
    },
];

const DetailedReferralConfigurationComponent: React.FC<DetailedReferralConfigurationProps> = ({
    includeRefereeReward,
    includeReferrerReward,
    refereeReward,
    referrerRewards,
    vestingDays,
    allowCombineOffers,
    currency,
    onRefereeRewardChange,
    onReferrerRewardsChange,
    onVestingDaysChange,
    onAllowCombineOffersChange,
}) => {
    const [editingTierId, setEditingTierId] = useState<string | null>(null);

    const getRewardIcon = useMemo(() => {
        const RewardIcon = (type: string) => {
            switch (type) {
                case 'discount_percentage':
                    return <Percent className="size-4" />;
                case 'discount_fixed':
                    return <DollarSign className="size-4" />;
                case 'bonus_content':
                    return <Gift className="size-4" />;
                case 'free_days':
                    return <Calendar className="size-4" />;
                case 'free_course':
                    return <BookOpen className="size-4" />;
                case 'points_system':
                    return <Star className="size-4" />;
                default:
                    return <Gift className="size-4" />;
            }
        };
        RewardIcon.displayName = 'RewardIcon';
        return RewardIcon;
    }, []);

    const addNewTier = useCallback(() => {
        const newTier: UnifiedReferralSettings['referrerRewards'][0] = {
            id: `tier_${Date.now()}`,
            tierName: `Tier ${referrerRewards.length + 1}`,
            referralCount: referrerRewards.length + 1,
            reward: {
                type: 'bonus_content',
                description: '',
            },
        };
        onReferrerRewardsChange([...referrerRewards, newTier]);
        setEditingTierId(newTier.id);
    }, [referrerRewards, onReferrerRewardsChange]);

    const updateTier = useCallback(
        (tierId: string, updates: Partial<UnifiedReferralSettings['referrerRewards'][0]>) => {
            onReferrerRewardsChange(
                referrerRewards.map((tier) => (tier.id === tierId ? { ...tier, ...updates } : tier))
            );
        },
        [referrerRewards, onReferrerRewardsChange]
    );

    const deleteTier = useCallback(
        (tierId: string) => {
            onReferrerRewardsChange(referrerRewards.filter((tier) => tier.id !== tierId));
            if (editingTierId === tierId) {
                setEditingTierId(null);
            }
        },
        [referrerRewards, onReferrerRewardsChange, editingTierId]
    );

    // Memoized callbacks for frequent operations to reduce re-renders
    const handleRefereeRewardTypeChange = useCallback(
        (value: string) => {
            onRefereeRewardChange({
                ...refereeReward,
                type: value as UnifiedReferralSettings['refereeReward']['type'],
            });
        },
        [refereeReward, onRefereeRewardChange]
    );

    const handleRefereeRewardValueChange = useCallback(
        (value: string) => {
            onRefereeRewardChange({
                ...refereeReward,
                value: Number(value),
            });
        },
        [refereeReward, onRefereeRewardChange]
    );

    const handleRefereeContentTypeChange = useCallback(
        (value: string) => {
            onRefereeRewardChange({
                ...refereeReward,
                content: {
                    ...refereeReward.content!,
                    contentType: value as 'pdf' | 'video' | 'audio' | 'course',
                    content: {
                        type: 'upload',
                        title: '',
                        description: refereeReward.content?.content?.description || '',
                        delivery: { email: true, whatsapp: false },
                    },
                },
            });
        },
        [refereeReward, onRefereeRewardChange]
    );

    return (
        <div className="space-y-6">
            {/* Referee Reward Configuration */}
            {includeRefereeReward && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Gift className="size-5" />
                            Referee Reward (New User Benefit)
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Reward Type</Label>
                                <Select
                                    value={refereeReward.type}
                                    onValueChange={handleRefereeRewardTypeChange}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="discount_percentage">
                                            <div className="flex items-center gap-2">
                                                <Percent className="size-4" />
                                                Percentage Discount
                                            </div>
                                        </SelectItem>
                                        <SelectItem value="discount_fixed">
                                            <div className="flex items-center gap-2">
                                                <DollarSign className="size-4" />
                                                Fixed Discount
                                            </div>
                                        </SelectItem>
                                        <SelectItem value="bonus_content">
                                            <div className="flex items-center gap-2">
                                                <Gift className="size-4" />
                                                Bonus Content
                                            </div>
                                        </SelectItem>
                                        <SelectItem value="free_days">
                                            <div className="flex items-center gap-2">
                                                <Calendar className="size-4" />
                                                Free Days
                                            </div>
                                        </SelectItem>
                                        <SelectItem value="free_course">
                                            <div className="flex items-center gap-2">
                                                <BookOpen className="size-4" />
                                                Free Course
                                            </div>
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Value input for percentage, fixed, and free days */}
                            {(refereeReward.type === 'discount_percentage' ||
                                refereeReward.type === 'discount_fixed' ||
                                refereeReward.type === 'free_days') && (
                                <div className="space-y-2">
                                    <Label>
                                        {refereeReward.type === 'discount_percentage'
                                            ? 'Percentage'
                                            : refereeReward.type === 'discount_fixed'
                                              ? `Amount (${currency})`
                                              : 'Number of Days'}
                                    </Label>
                                    <Input
                                        type="number"
                                        value={refereeReward.value || ''}
                                        onChange={(e) =>
                                            handleRefereeRewardValueChange(e.target.value)
                                        }
                                        placeholder="Enter value"
                                    />
                                </div>
                            )}
                        </div>

                        {/* Detailed content configuration for bonus content */}
                        {refereeReward.type === 'bonus_content' && (
                            <div className="space-y-4 rounded-lg border bg-gray-50 p-4">
                                <div className="space-y-2">
                                    <Label>Content Type</Label>
                                    <Select
                                        value={refereeReward.content?.contentType || 'pdf'}
                                        onValueChange={handleRefereeContentTypeChange}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="pdf">
                                                <div className="flex items-center gap-2">
                                                    <FileText className="size-4" />
                                                    PDF Document
                                                </div>
                                            </SelectItem>
                                            <SelectItem value="video">
                                                <div className="flex items-center gap-2">
                                                    <Video className="size-4" />
                                                    Video
                                                </div>
                                            </SelectItem>
                                            <SelectItem value="audio">
                                                <div className="flex items-center gap-2">
                                                    <Headphones className="size-4" />
                                                    Audio
                                                </div>
                                            </SelectItem>
                                            <SelectItem value="course">
                                                <div className="flex items-center gap-2">
                                                    <BookOpen className="size-4" />
                                                    Course Content
                                                </div>
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label>Content Source</Label>
                                    <Select
                                        value={refereeReward.content?.content?.type || 'upload'}
                                        onValueChange={(
                                            value: 'upload' | 'link' | 'existing_course'
                                        ) => {
                                            onRefereeRewardChange({
                                                ...refereeReward,
                                                content: {
                                                    ...refereeReward.content!,
                                                    content: {
                                                        ...refereeReward.content!.content,
                                                        type: value,
                                                    },
                                                },
                                            });
                                        }}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="upload">
                                                <div className="flex items-center gap-2">
                                                    <Upload className="size-4" />
                                                    Upload File
                                                </div>
                                            </SelectItem>
                                            <SelectItem value="link">
                                                <div className="flex items-center gap-2">
                                                    <Link className="size-4" />
                                                    External Link
                                                </div>
                                            </SelectItem>
                                            <SelectItem value="existing_course">
                                                <div className="flex items-center gap-2">
                                                    <BookOpen className="size-4" />
                                                    Existing Course
                                                </div>
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* File upload field */}
                                {refereeReward.content?.content?.type === 'upload' && (
                                    <div className="space-y-2">
                                        <Label>Upload File</Label>
                                        <Input
                                            type="file"
                                            accept={
                                                refereeReward.content?.contentType === 'pdf'
                                                    ? '.pdf'
                                                    : refereeReward.content?.contentType === 'video'
                                                      ? '.mp4,.avi,.mov,.wmv'
                                                      : refereeReward.content?.contentType ===
                                                          'audio'
                                                        ? '.mp3,.wav,.aac'
                                                        : '*'
                                            }
                                            onChange={(e) => {
                                                const file = e.target.files?.[0];
                                                if (file) {
                                                    onRefereeRewardChange({
                                                        ...refereeReward,
                                                        content: {
                                                            ...refereeReward.content!,
                                                            content: {
                                                                ...refereeReward.content!.content,
                                                                file,
                                                            },
                                                        },
                                                    });
                                                }
                                            }}
                                        />
                                    </div>
                                )}

                                {/* External link field */}
                                {refereeReward.content?.content?.type === 'link' && (
                                    <div className="space-y-2">
                                        <Label>Content URL</Label>
                                        <Input
                                            type="url"
                                            value={refereeReward.content?.content?.url || ''}
                                            onChange={(e) => {
                                                onRefereeRewardChange({
                                                    ...refereeReward,
                                                    content: {
                                                        ...refereeReward.content!,
                                                        content: {
                                                            ...refereeReward.content!.content,
                                                            url: e.target.value,
                                                        },
                                                    },
                                                });
                                            }}
                                            placeholder="https://example.com/content"
                                        />
                                    </div>
                                )}

                                {/* Course selection */}
                                {refereeReward.content?.content?.type === 'existing_course' && (
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <Label className="flex items-center gap-2">
                                                <BookOpen className="size-4" />
                                                Select Course
                                            </Label>
                                            <Select
                                                value={
                                                    refereeReward.content?.content?.courseId || ''
                                                }
                                                onValueChange={(value) => {
                                                    onRefereeRewardChange({
                                                        ...refereeReward,
                                                        content: {
                                                            ...refereeReward.content!,
                                                            content: {
                                                                ...refereeReward.content!.content,
                                                                courseId: value,
                                                                sessionId: '',
                                                                levelId: '',
                                                            },
                                                        },
                                                    });
                                                }}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Choose a course" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {mockCourses.map((course) => (
                                                        <SelectItem
                                                            key={course.id}
                                                            value={course.id}
                                                        >
                                                            <div className="flex items-center gap-2">
                                                                <BookOpen className="size-4" />
                                                                {course.name}
                                                            </div>
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        {refereeReward.content?.content?.courseId && (
                                            <div className="space-y-2">
                                                <Label>Select Session</Label>
                                                <Select
                                                    value={
                                                        refereeReward.content?.content?.sessionId ||
                                                        ''
                                                    }
                                                    onValueChange={(value) => {
                                                        onRefereeRewardChange({
                                                            ...refereeReward,
                                                            content: {
                                                                ...refereeReward.content!,
                                                                content: {
                                                                    ...refereeReward.content!
                                                                        .content,
                                                                    sessionId: value,
                                                                    levelId: '',
                                                                },
                                                            },
                                                        });
                                                    }}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Choose a session" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {mockCourses
                                                            .find(
                                                                (c) =>
                                                                    c.id ===
                                                                    refereeReward.content?.content
                                                                        ?.courseId
                                                            )
                                                            ?.sessions.map((session) => (
                                                                <SelectItem
                                                                    key={session.id}
                                                                    value={session.id}
                                                                >
                                                                    {session.name}
                                                                </SelectItem>
                                                            ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        )}

                                        {refereeReward.content?.content?.sessionId && (
                                            <div className="space-y-2">
                                                <Label>Select Level</Label>
                                                <Select
                                                    value={
                                                        refereeReward.content?.content?.levelId ||
                                                        ''
                                                    }
                                                    onValueChange={(value) => {
                                                        onRefereeRewardChange({
                                                            ...refereeReward,
                                                            content: {
                                                                ...refereeReward.content!,
                                                                content: {
                                                                    ...refereeReward.content!
                                                                        .content,
                                                                    levelId: value,
                                                                },
                                                            },
                                                        });
                                                    }}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Choose a level" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {mockCourses
                                                            .find(
                                                                (c) =>
                                                                    c.id ===
                                                                    refereeReward.content?.content
                                                                        ?.courseId
                                                            )
                                                            ?.sessions.find(
                                                                (s) =>
                                                                    s.id ===
                                                                    refereeReward.content?.content
                                                                        ?.sessionId
                                                            )
                                                            ?.levels.map((level) => (
                                                                <SelectItem
                                                                    key={level.id}
                                                                    value={level.id}
                                                                >
                                                                    {level.name}
                                                                </SelectItem>
                                                            ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        )}
                                    </div>
                                )}

                                <div className="space-y-2">
                                    <Label>Content Title</Label>
                                    <Input
                                        value={refereeReward.content?.content?.title || ''}
                                        onChange={(e) => {
                                            onRefereeRewardChange({
                                                ...refereeReward,
                                                content: {
                                                    ...refereeReward.content!,
                                                    content: {
                                                        ...refereeReward.content!.content,
                                                        title: e.target.value,
                                                    },
                                                },
                                            });
                                        }}
                                        placeholder="e.g., Welcome Bonus Study Guide"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>Delivery Methods</Label>
                                    <div className="flex items-center space-x-4">
                                        <div className="flex items-center space-x-2">
                                            <Checkbox
                                                id="referee-email"
                                                checked={
                                                    refereeReward.content?.content?.delivery
                                                        ?.email || false
                                                }
                                                onCheckedChange={(checked) => {
                                                    onRefereeRewardChange({
                                                        ...refereeReward,
                                                        content: {
                                                            ...refereeReward.content!,
                                                            content: {
                                                                ...refereeReward.content!.content,
                                                                delivery: {
                                                                    email: checked as boolean,
                                                                    whatsapp:
                                                                        refereeReward.content
                                                                            ?.content?.delivery
                                                                            ?.whatsapp || false,
                                                                },
                                                            },
                                                        },
                                                    });
                                                }}
                                            />
                                            <Label htmlFor="referee-email">Email</Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Checkbox
                                                id="referee-whatsapp"
                                                checked={
                                                    refereeReward.content?.content?.delivery
                                                        ?.whatsapp || false
                                                }
                                                onCheckedChange={(checked) => {
                                                    onRefereeRewardChange({
                                                        ...refereeReward,
                                                        content: {
                                                            ...refereeReward.content!,
                                                            content: {
                                                                ...refereeReward.content!.content,
                                                                delivery: {
                                                                    email:
                                                                        refereeReward.content
                                                                            ?.content?.delivery
                                                                            ?.email || false,
                                                                    whatsapp: checked as boolean,
                                                                },
                                                            },
                                                        },
                                                    });
                                                }}
                                            />
                                            <Label htmlFor="referee-whatsapp">WhatsApp</Label>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* Referrer Rewards Configuration */}
            {includeReferrerReward && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                                <Star className="size-5" />
                                Referrer Rewards (Tiered Benefits)
                            </div>
                            <Button onClick={addNewTier} size="sm" variant="outline">
                                <Plus className="mr-2 size-4" />
                                Add Tier
                            </Button>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {referrerRewards.length === 0 ? (
                            <div className="py-8 text-center text-gray-500">
                                <Star className="mx-auto mb-2 size-8 opacity-50" />
                                <p>No referrer tiers configured</p>
                                <p className="text-sm">
                                    Click &quot;Add Tier&quot; to create your first referrer reward
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {referrerRewards.map((tier) => (
                                    <div key={tier.id} className="space-y-4 rounded-lg border p-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                {getRewardIcon(tier.reward.type)}
                                                <h4 className="font-medium">{tier.tierName}</h4>
                                                <span className="text-sm text-gray-500">
                                                    ({tier.referralCount} referrals)
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Button
                                                    onClick={() =>
                                                        setEditingTierId(
                                                            editingTierId === tier.id
                                                                ? null
                                                                : tier.id
                                                        )
                                                    }
                                                    size="sm"
                                                    variant="outline"
                                                >
                                                    {editingTierId === tier.id ? 'Cancel' : 'Edit'}
                                                </Button>
                                                <Button
                                                    onClick={() => deleteTier(tier.id)}
                                                    size="sm"
                                                    variant="outline"
                                                    className="text-red-600 hover:text-red-800"
                                                >
                                                    <Trash2 className="size-4" />
                                                </Button>
                                            </div>
                                        </div>

                                        {editingTierId === tier.id && (
                                            <div className="space-y-4 rounded-lg bg-gray-50 p-4">
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="space-y-2">
                                                        <Label>Tier Name</Label>
                                                        <Input
                                                            value={tier.tierName}
                                                            onChange={(e) =>
                                                                updateTier(tier.id, {
                                                                    tierName: e.target.value,
                                                                })
                                                            }
                                                            placeholder="e.g., First Referral"
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label>Referral Count</Label>
                                                        <Input
                                                            type="number"
                                                            value={tier.referralCount}
                                                            onChange={(e) =>
                                                                updateTier(tier.id, {
                                                                    referralCount:
                                                                        parseInt(e.target.value) ||
                                                                        1,
                                                                })
                                                            }
                                                            min="1"
                                                        />
                                                    </div>
                                                </div>

                                                <div className="space-y-2">
                                                    <Label>Reward Type</Label>
                                                    <Select
                                                        value={tier.reward.type}
                                                        onValueChange={(value) =>
                                                            updateTier(tier.id, {
                                                                reward: {
                                                                    ...tier.reward,
                                                                    type: value as UnifiedReferralSettings['referrerRewards'][0]['reward']['type'],
                                                                },
                                                            })
                                                        }
                                                    >
                                                        <SelectTrigger>
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="discount_percentage">
                                                                Percentage Discount
                                                            </SelectItem>
                                                            <SelectItem value="discount_fixed">
                                                                Fixed Discount
                                                            </SelectItem>
                                                            <SelectItem value="bonus_content">
                                                                Bonus Content
                                                            </SelectItem>
                                                            <SelectItem value="free_days">
                                                                Free Days
                                                            </SelectItem>
                                                            <SelectItem value="points_system">
                                                                Points System
                                                            </SelectItem>
                                                            <SelectItem value="free_course">
                                                                Free Course
                                                            </SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>

                                                {/* Value input for various reward types */}
                                                {(tier.reward.type === 'discount_percentage' ||
                                                    tier.reward.type === 'discount_fixed' ||
                                                    tier.reward.type === 'free_days') && (
                                                    <div className="space-y-2">
                                                        <Label>
                                                            {tier.reward.type ===
                                                            'discount_percentage'
                                                                ? 'Percentage'
                                                                : tier.reward.type ===
                                                                    'discount_fixed'
                                                                  ? `Amount (${currency})`
                                                                  : 'Number of Days'}
                                                        </Label>
                                                        <Input
                                                            type="number"
                                                            value={tier.reward.value || ''}
                                                            onChange={(e) =>
                                                                updateTier(tier.id, {
                                                                    reward: {
                                                                        ...tier.reward,
                                                                        value:
                                                                            parseInt(
                                                                                e.target.value
                                                                            ) || 0,
                                                                    },
                                                                })
                                                            }
                                                            placeholder="Enter value"
                                                        />
                                                    </div>
                                                )}

                                                {/* Points system configuration */}
                                                {tier.reward.type === 'points_system' && (
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div className="space-y-2">
                                                            <Label>Points per Referral</Label>
                                                            <Input
                                                                type="number"
                                                                value={
                                                                    tier.reward.pointsPerReferral ||
                                                                    ''
                                                                }
                                                                onChange={(e) =>
                                                                    updateTier(tier.id, {
                                                                        reward: {
                                                                            ...tier.reward,
                                                                            pointsPerReferral:
                                                                                parseInt(
                                                                                    e.target.value
                                                                                ) || 0,
                                                                        },
                                                                    })
                                                                }
                                                                placeholder="10"
                                                            />
                                                        </div>
                                                        <div className="space-y-2">
                                                            <Label>Points to Redeem</Label>
                                                            <Input
                                                                type="number"
                                                                value={
                                                                    tier.reward.pointsToReward || ''
                                                                }
                                                                onChange={(e) =>
                                                                    updateTier(tier.id, {
                                                                        reward: {
                                                                            ...tier.reward,
                                                                            pointsToReward:
                                                                                parseInt(
                                                                                    e.target.value
                                                                                ) || 0,
                                                                        },
                                                                    })
                                                                }
                                                                placeholder="100"
                                                            />
                                                        </div>
                                                        <div className="space-y-2">
                                                            <Label>Reward Type</Label>
                                                            <Select
                                                                value={
                                                                    tier.reward.pointsRewardType ||
                                                                    'discount_percentage'
                                                                }
                                                                onValueChange={(value) =>
                                                                    updateTier(tier.id, {
                                                                        reward: {
                                                                            ...tier.reward,
                                                                            pointsRewardType:
                                                                                value as
                                                                                    | 'discount_percentage'
                                                                                    | 'discount_fixed'
                                                                                    | 'membership_days',
                                                                        },
                                                                    })
                                                                }
                                                            >
                                                                <SelectTrigger>
                                                                    <SelectValue />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    <SelectItem value="discount_percentage">
                                                                        Percentage Discount
                                                                    </SelectItem>
                                                                    <SelectItem value="discount_fixed">
                                                                        Fixed Discount
                                                                    </SelectItem>
                                                                    <SelectItem value="membership_days">
                                                                        Membership Days
                                                                    </SelectItem>
                                                                </SelectContent>
                                                            </Select>
                                                        </div>
                                                        <div className="space-y-2">
                                                            <Label>Reward Value</Label>
                                                            <Input
                                                                type="number"
                                                                value={
                                                                    tier.reward.pointsRewardValue ||
                                                                    ''
                                                                }
                                                                onChange={(e) =>
                                                                    updateTier(tier.id, {
                                                                        reward: {
                                                                            ...tier.reward,
                                                                            pointsRewardValue:
                                                                                parseInt(
                                                                                    e.target.value
                                                                                ) || 0,
                                                                        },
                                                                    })
                                                                }
                                                                placeholder="10"
                                                            />
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Detailed content configuration for bonus content */}
                                                {tier.reward.type === 'bonus_content' && (
                                                    <div className="space-y-4">
                                                        <div className="space-y-2">
                                                            <Label>Content Type</Label>
                                                            <Select
                                                                value={
                                                                    tier.reward.content
                                                                        ?.contentType || 'pdf'
                                                                }
                                                                onValueChange={(
                                                                    value:
                                                                        | 'pdf'
                                                                        | 'video'
                                                                        | 'audio'
                                                                        | 'course'
                                                                ) => {
                                                                    updateTier(tier.id, {
                                                                        reward: {
                                                                            ...tier.reward,
                                                                            content: {
                                                                                contentType: value,
                                                                                content: {
                                                                                    type: 'upload',
                                                                                    title:
                                                                                        tier.reward
                                                                                            .content
                                                                                            ?.content
                                                                                            ?.title ||
                                                                                        '',
                                                                                    description:
                                                                                        tier.reward
                                                                                            .content
                                                                                            ?.content
                                                                                            ?.description ||
                                                                                        '',
                                                                                    delivery: {
                                                                                        email: true,
                                                                                        whatsapp:
                                                                                            false,
                                                                                    },
                                                                                },
                                                                            },
                                                                        },
                                                                    });
                                                                }}
                                                            >
                                                                <SelectTrigger>
                                                                    <SelectValue />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    <SelectItem value="pdf">
                                                                        <div className="flex items-center gap-2">
                                                                            <FileText className="size-4" />
                                                                            PDF Document
                                                                        </div>
                                                                    </SelectItem>
                                                                    <SelectItem value="video">
                                                                        <div className="flex items-center gap-2">
                                                                            <Video className="size-4" />
                                                                            Video
                                                                        </div>
                                                                    </SelectItem>
                                                                    <SelectItem value="audio">
                                                                        <div className="flex items-center gap-2">
                                                                            <Headphones className="size-4" />
                                                                            Audio
                                                                        </div>
                                                                    </SelectItem>
                                                                    <SelectItem value="course">
                                                                        <div className="flex items-center gap-2">
                                                                            <BookOpen className="size-4" />
                                                                            Course Content
                                                                        </div>
                                                                    </SelectItem>
                                                                </SelectContent>
                                                            </Select>
                                                        </div>

                                                        <div className="space-y-2">
                                                            <Label>Content Source</Label>
                                                            <Select
                                                                value={
                                                                    tier.reward.content?.content
                                                                        ?.type || 'upload'
                                                                }
                                                                onValueChange={(
                                                                    value:
                                                                        | 'upload'
                                                                        | 'link'
                                                                        | 'existing_course'
                                                                ) => {
                                                                    updateTier(tier.id, {
                                                                        reward: {
                                                                            ...tier.reward,
                                                                            content: {
                                                                                ...tier.reward
                                                                                    .content!,
                                                                                content: {
                                                                                    ...tier.reward
                                                                                        .content!
                                                                                        .content,
                                                                                    type: value,
                                                                                },
                                                                            },
                                                                        },
                                                                    });
                                                                }}
                                                            >
                                                                <SelectTrigger>
                                                                    <SelectValue />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    <SelectItem value="upload">
                                                                        <div className="flex items-center gap-2">
                                                                            <Upload className="size-4" />
                                                                            Upload File
                                                                        </div>
                                                                    </SelectItem>
                                                                    <SelectItem value="link">
                                                                        <div className="flex items-center gap-2">
                                                                            <Link className="size-4" />
                                                                            External Link
                                                                        </div>
                                                                    </SelectItem>
                                                                    <SelectItem value="existing_course">
                                                                        <div className="flex items-center gap-2">
                                                                            <BookOpen className="size-4" />
                                                                            Existing Course
                                                                        </div>
                                                                    </SelectItem>
                                                                </SelectContent>
                                                            </Select>
                                                        </div>

                                                        {/* File upload field */}
                                                        {tier.reward.content?.content?.type ===
                                                            'upload' && (
                                                            <div className="space-y-2">
                                                                <Label>Upload File</Label>
                                                                <Input
                                                                    type="file"
                                                                    accept={
                                                                        tier.reward.content
                                                                            ?.contentType === 'pdf'
                                                                            ? '.pdf'
                                                                            : tier.reward.content
                                                                                    ?.contentType ===
                                                                                'video'
                                                                              ? '.mp4,.avi,.mov,.wmv'
                                                                              : tier.reward.content
                                                                                      ?.contentType ===
                                                                                  'audio'
                                                                                ? '.mp3,.wav,.aac'
                                                                                : '*'
                                                                    }
                                                                    onChange={(e) => {
                                                                        const file =
                                                                            e.target.files?.[0];
                                                                        if (file) {
                                                                            updateTier(tier.id, {
                                                                                reward: {
                                                                                    ...tier.reward,
                                                                                    content: {
                                                                                        ...tier
                                                                                            .reward
                                                                                            .content!,
                                                                                        content: {
                                                                                            ...tier
                                                                                                .reward
                                                                                                .content!
                                                                                                .content,
                                                                                            file,
                                                                                        },
                                                                                    },
                                                                                },
                                                                            });
                                                                        }
                                                                    }}
                                                                />
                                                            </div>
                                                        )}

                                                        {/* External link field */}
                                                        {tier.reward.content?.content?.type ===
                                                            'link' && (
                                                            <div className="space-y-2">
                                                                <Label>Content URL</Label>
                                                                <Input
                                                                    type="url"
                                                                    value={
                                                                        tier.reward.content?.content
                                                                            ?.url || ''
                                                                    }
                                                                    onChange={(e) => {
                                                                        updateTier(tier.id, {
                                                                            reward: {
                                                                                ...tier.reward,
                                                                                content: {
                                                                                    ...tier.reward
                                                                                        .content!,
                                                                                    content: {
                                                                                        ...tier
                                                                                            .reward
                                                                                            .content!
                                                                                            .content,
                                                                                        url: e
                                                                                            .target
                                                                                            .value,
                                                                                    },
                                                                                },
                                                                            },
                                                                        });
                                                                    }}
                                                                    placeholder="https://example.com/content"
                                                                />
                                                            </div>
                                                        )}

                                                        {/* Course selection */}
                                                        {tier.reward.content?.content?.type ===
                                                            'existing_course' && (
                                                            <div className="space-y-4">
                                                                <div className="space-y-2">
                                                                    <Label className="flex items-center gap-2">
                                                                        <BookOpen className="size-4" />
                                                                        Select Course
                                                                    </Label>
                                                                    <Select
                                                                        value={
                                                                            tier.reward.content
                                                                                ?.content
                                                                                ?.courseId || ''
                                                                        }
                                                                        onValueChange={(value) => {
                                                                            updateTier(tier.id, {
                                                                                reward: {
                                                                                    ...tier.reward,
                                                                                    content: {
                                                                                        ...tier
                                                                                            .reward
                                                                                            .content!,
                                                                                        content: {
                                                                                            ...tier
                                                                                                .reward
                                                                                                .content!
                                                                                                .content,
                                                                                            courseId:
                                                                                                value,
                                                                                            sessionId:
                                                                                                '',
                                                                                            levelId:
                                                                                                '',
                                                                                        },
                                                                                    },
                                                                                },
                                                                            });
                                                                        }}
                                                                    >
                                                                        <SelectTrigger>
                                                                            <SelectValue placeholder="Choose a course" />
                                                                        </SelectTrigger>
                                                                        <SelectContent>
                                                                            {mockCourses.map(
                                                                                (course) => (
                                                                                    <SelectItem
                                                                                        key={
                                                                                            course.id
                                                                                        }
                                                                                        value={
                                                                                            course.id
                                                                                        }
                                                                                    >
                                                                                        <div className="flex items-center gap-2">
                                                                                            <BookOpen className="size-4" />
                                                                                            {
                                                                                                course.name
                                                                                            }
                                                                                        </div>
                                                                                    </SelectItem>
                                                                                )
                                                                            )}
                                                                        </SelectContent>
                                                                    </Select>
                                                                </div>

                                                                {tier.reward.content?.content
                                                                    ?.courseId && (
                                                                    <div className="space-y-2">
                                                                        <Label>
                                                                            Select Session
                                                                        </Label>
                                                                        <Select
                                                                            value={
                                                                                tier.reward.content
                                                                                    ?.content
                                                                                    ?.sessionId ||
                                                                                ''
                                                                            }
                                                                            onValueChange={(
                                                                                value
                                                                            ) => {
                                                                                updateTier(
                                                                                    tier.id,
                                                                                    {
                                                                                        reward: {
                                                                                            ...tier.reward,
                                                                                            content:
                                                                                                {
                                                                                                    ...tier
                                                                                                        .reward
                                                                                                        .content!,
                                                                                                    content:
                                                                                                        {
                                                                                                            ...tier
                                                                                                                .reward
                                                                                                                .content!
                                                                                                                .content,
                                                                                                            sessionId:
                                                                                                                value,
                                                                                                            levelId:
                                                                                                                '',
                                                                                                        },
                                                                                                },
                                                                                        },
                                                                                    }
                                                                                );
                                                                            }}
                                                                        >
                                                                            <SelectTrigger>
                                                                                <SelectValue placeholder="Choose a session" />
                                                                            </SelectTrigger>
                                                                            <SelectContent>
                                                                                {mockCourses
                                                                                    .find(
                                                                                        (c) =>
                                                                                            c.id ===
                                                                                            tier
                                                                                                .reward
                                                                                                .content
                                                                                                ?.content
                                                                                                ?.courseId
                                                                                    )
                                                                                    ?.sessions.map(
                                                                                        (
                                                                                            session
                                                                                        ) => (
                                                                                            <SelectItem
                                                                                                key={
                                                                                                    session.id
                                                                                                }
                                                                                                value={
                                                                                                    session.id
                                                                                                }
                                                                                            >
                                                                                                {
                                                                                                    session.name
                                                                                                }
                                                                                            </SelectItem>
                                                                                        )
                                                                                    )}
                                                                            </SelectContent>
                                                                        </Select>
                                                                    </div>
                                                                )}

                                                                {tier.reward.content?.content
                                                                    ?.sessionId && (
                                                                    <div className="space-y-2">
                                                                        <Label>Select Level</Label>
                                                                        <Select
                                                                            value={
                                                                                tier.reward.content
                                                                                    ?.content
                                                                                    ?.levelId || ''
                                                                            }
                                                                            onValueChange={(
                                                                                value
                                                                            ) => {
                                                                                updateTier(
                                                                                    tier.id,
                                                                                    {
                                                                                        reward: {
                                                                                            ...tier.reward,
                                                                                            content:
                                                                                                {
                                                                                                    ...tier
                                                                                                        .reward
                                                                                                        .content!,
                                                                                                    content:
                                                                                                        {
                                                                                                            ...tier
                                                                                                                .reward
                                                                                                                .content!
                                                                                                                .content,
                                                                                                            levelId:
                                                                                                                value,
                                                                                                        },
                                                                                                },
                                                                                        },
                                                                                    }
                                                                                );
                                                                            }}
                                                                        >
                                                                            <SelectTrigger>
                                                                                <SelectValue placeholder="Choose a level" />
                                                                            </SelectTrigger>
                                                                            <SelectContent>
                                                                                {mockCourses
                                                                                    .find(
                                                                                        (c) =>
                                                                                            c.id ===
                                                                                            tier
                                                                                                .reward
                                                                                                .content
                                                                                                ?.content
                                                                                                ?.courseId
                                                                                    )
                                                                                    ?.sessions.find(
                                                                                        (s) =>
                                                                                            s.id ===
                                                                                            tier
                                                                                                .reward
                                                                                                .content
                                                                                                ?.content
                                                                                                ?.sessionId
                                                                                    )
                                                                                    ?.levels.map(
                                                                                        (level) => (
                                                                                            <SelectItem
                                                                                                key={
                                                                                                    level.id
                                                                                                }
                                                                                                value={
                                                                                                    level.id
                                                                                                }
                                                                                            >
                                                                                                {
                                                                                                    level.name
                                                                                                }
                                                                                            </SelectItem>
                                                                                        )
                                                                                    )}
                                                                            </SelectContent>
                                                                        </Select>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}

                                                        <div className="space-y-2">
                                                            <Label>Content Title</Label>
                                                            <Input
                                                                value={
                                                                    tier.reward.content?.content
                                                                        ?.title || ''
                                                                }
                                                                onChange={(e) => {
                                                                    updateTier(tier.id, {
                                                                        reward: {
                                                                            ...tier.reward,
                                                                            content: {
                                                                                ...tier.reward
                                                                                    .content!,
                                                                                content: {
                                                                                    ...tier.reward
                                                                                        .content!
                                                                                        .content,
                                                                                    title: e.target
                                                                                        .value,
                                                                                },
                                                                            },
                                                                        },
                                                                    });
                                                                }}
                                                                placeholder="e.g., Referrer Bonus Content"
                                                            />
                                                        </div>

                                                        <div className="space-y-2">
                                                            <Label>Delivery Methods</Label>
                                                            <div className="flex items-center space-x-4">
                                                                <div className="flex items-center space-x-2">
                                                                    <Checkbox
                                                                        id={`referrer-email-${tier.id}`}
                                                                        checked={
                                                                            tier.reward.content
                                                                                ?.content?.delivery
                                                                                ?.email || false
                                                                        }
                                                                        onCheckedChange={(
                                                                            checked
                                                                        ) => {
                                                                            updateTier(tier.id, {
                                                                                reward: {
                                                                                    ...tier.reward,
                                                                                    content: {
                                                                                        ...tier
                                                                                            .reward
                                                                                            .content!,
                                                                                        content: {
                                                                                            ...tier
                                                                                                .reward
                                                                                                .content!
                                                                                                .content,
                                                                                            delivery:
                                                                                                {
                                                                                                    email: checked as boolean,
                                                                                                    whatsapp:
                                                                                                        tier
                                                                                                            .reward
                                                                                                            .content
                                                                                                            ?.content
                                                                                                            ?.delivery
                                                                                                            ?.whatsapp ||
                                                                                                        false,
                                                                                                },
                                                                                        },
                                                                                    },
                                                                                },
                                                                            });
                                                                        }}
                                                                    />
                                                                    <Label
                                                                        htmlFor={`referrer-email-${tier.id}`}
                                                                    >
                                                                        Email
                                                                    </Label>
                                                                </div>
                                                                <div className="flex items-center space-x-2">
                                                                    <Checkbox
                                                                        id={`referrer-whatsapp-${tier.id}`}
                                                                        checked={
                                                                            tier.reward.content
                                                                                ?.content?.delivery
                                                                                ?.whatsapp || false
                                                                        }
                                                                        onCheckedChange={(
                                                                            checked
                                                                        ) => {
                                                                            updateTier(tier.id, {
                                                                                reward: {
                                                                                    ...tier.reward,
                                                                                    content: {
                                                                                        ...tier
                                                                                            .reward
                                                                                            .content!,
                                                                                        content: {
                                                                                            ...tier
                                                                                                .reward
                                                                                                .content!
                                                                                                .content,
                                                                                            delivery:
                                                                                                {
                                                                                                    email:
                                                                                                        tier
                                                                                                            .reward
                                                                                                            .content
                                                                                                            ?.content
                                                                                                            ?.delivery
                                                                                                            ?.email ||
                                                                                                        false,
                                                                                                    whatsapp:
                                                                                                        checked as boolean,
                                                                                                },
                                                                                        },
                                                                                    },
                                                                                },
                                                                            });
                                                                        }}
                                                                    />
                                                                    <Label
                                                                        htmlFor={`referrer-whatsapp-${tier.id}`}
                                                                    >
                                                                        WhatsApp
                                                                    </Label>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* Program Settings */}
            {(includeRefereeReward || includeReferrerReward) && (
                <Card>
                    <CardHeader>
                        <CardTitle>Program Settings</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Vesting Period (Days)</Label>
                                <Input
                                    type="number"
                                    value={vestingDays}
                                    onChange={(e) =>
                                        onVestingDaysChange(parseInt(e.target.value) || 0)
                                    }
                                    min="0"
                                    max="365"
                                    placeholder="7"
                                />
                                <p className="text-sm text-gray-600">
                                    Days to wait before referrer rewards are available
                                </p>
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="combine-offers"
                                        checked={allowCombineOffers}
                                        onCheckedChange={(checked) =>
                                            onAllowCombineOffersChange(checked as boolean)
                                        }
                                    />
                                    <Label htmlFor="combine-offers">
                                        Allow combining with other offers
                                    </Label>
                                </div>
                                <p className="text-sm text-gray-600">
                                    Allow referral benefits to stack with promotions
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
};

export const DetailedReferralConfiguration = memo(
    DetailedReferralConfigurationComponent,
    (prevProps, nextProps) => {
        // Custom comparison to prevent unnecessary re-renders
        return (
            prevProps.includeRefereeReward === nextProps.includeRefereeReward &&
            prevProps.includeReferrerReward === nextProps.includeReferrerReward &&
            prevProps.vestingDays === nextProps.vestingDays &&
            prevProps.allowCombineOffers === nextProps.allowCombineOffers &&
            prevProps.currency === nextProps.currency &&
            JSON.stringify(prevProps.refereeReward) === JSON.stringify(nextProps.refereeReward) &&
            JSON.stringify(prevProps.referrerRewards) === JSON.stringify(nextProps.referrerRewards)
        );
    }
);
