import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Percent,
    DollarSign,
    Gift,
    Calendar,
    FileText,
    Video,
    Upload,
    Plus,
    Trash2,
    Edit,
    TrendingUp,
    Users,
    Star,
    Link2,
    Music,
    BookOpen,
    Settings,
    Mail,
    MessageCircle,
} from 'lucide-react';
import { MyButton } from '@/components/design-system/button';

// Enhanced interfaces with multiple programs support
export interface ContentDelivery {
    email: boolean;
    whatsapp: boolean;
}

export interface ContentOption {
    type: 'upload' | 'link' | 'existing_course';
    // For upload
    file?: File;
    // For link
    url?: string;
    // For existing course
    courseId?: string;
    sessionId?: string;
    levelId?: string;
    // Common
    title: string;
    description?: string;
    delivery: ContentDelivery;
}

export interface RewardContent {
    contentType: 'pdf' | 'video' | 'audio' | 'course';
    content: ContentOption;
}

export interface UnifiedReferralSettings {
    id: string;
    label: string;
    isDefault: boolean;
    requireReferrerActiveInBatch?: boolean;
    // Referee Settings - Simple one-time reward
    refereeReward: {
        type:
            | 'discount_percentage'
            | 'discount_fixed'
            | 'bonus_content'
            | 'free_days'
            | 'free_course';
        value?: number;
        currency?: string;
        content?: RewardContent;
        courseId?: string;
        sessionId?: string;
        levelId?: string;
        delivery?: ContentDelivery;
        description?: string;
    };

    // Referrer Settings - Tiered rewards
    referrerRewards: ReferrerTier[];

    // Program Settings
    allowCombineOffers: boolean;
    payoutVestingDays: number;
}

export interface ReferrerTier {
    id: string;
    tierName: string;
    referralCount: number;
    reward: {
        type:
            | 'discount_percentage'
            | 'discount_fixed'
            | 'bonus_content'
            | 'free_days'
            | 'points_system'
            | 'free_course';
        value?: number;
        currency?: string;
        content?: RewardContent;
        courseId?: string;
        sessionId?: string;
        levelId?: string;
        delivery?: ContentDelivery;
        pointsPerReferral?: number;
        pointsToReward?: number;
        pointsRewardType?: 'discount_percentage' | 'discount_fixed' | 'membership_days';
        pointsRewardValue?: number;
        description?: string;
    };
}

// Mock data for courses and batches (replace with actual data from your system)
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

interface UnifiedReferralSettingsProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (settings: UnifiedReferralSettings) => void;
    editingSettings?: UnifiedReferralSettings | null;
}

export const UnifiedReferralSettings: React.FC<UnifiedReferralSettingsProps> = ({
    isOpen,
    onClose,
    onSave,
    editingSettings,
}) => {
    const [formData, setFormData] = useState<Partial<UnifiedReferralSettings>>({
        label: '',
        isDefault: false,
        allowCombineOffers: true,
        payoutVestingDays: 7,
        refereeReward: {
            type: 'bonus_content',
            delivery: { email: true, whatsapp: false },
        },
        referrerRewards: [],
    });

    const [editingTier, setEditingTier] = useState<ReferrerTier | null>(null);
    const [showTierCreator, setShowTierCreator] = useState(false);

    useEffect(() => {
        if (editingSettings) {
            setFormData(editingSettings);
        } else if (isOpen) {
            // Only reset form data when dialog opens for a new referral program
            setFormData({
                label: '',
                isDefault: false,
                allowCombineOffers: true,
                payoutVestingDays: 7,
                refereeReward: {
                    type: 'bonus_content',
                    delivery: { email: true, whatsapp: false },
                },
                referrerRewards: [],
            });
        }
    }, [editingSettings, isOpen]);

    const handleSave = () => {
        if (!formData.label || !formData.refereeReward || !formData.referrerRewards) {
            return;
        }

        const settings: UnifiedReferralSettings = {
            id: editingSettings?.id || Date.now().toString(),
            label: formData.label,
            isDefault: formData.isDefault || false,
            requireReferrerActiveInBatch: formData.requireReferrerActiveInBatch || false,
            refereeReward: formData.refereeReward,
            referrerRewards: formData.referrerRewards,
            allowCombineOffers: formData.allowCombineOffers || true,
            payoutVestingDays: formData.payoutVestingDays || 7,
        };

        onSave(settings);
    };

    const handleAddTier = () => {
        setEditingTier(null);
        setShowTierCreator(true);
    };

    const handleEditTier = (tier: ReferrerTier) => {
        setEditingTier(tier);
        setShowTierCreator(true);
    };

    const handleDeleteTier = (tierId: string) => {
        setFormData((prev) => ({
            ...prev,
            referrerRewards: prev.referrerRewards?.filter((tier) => tier.id !== tierId) || [],
        }));
    };

    const handleSaveTier = (tier: ReferrerTier) => {
        if (editingTier) {
            setFormData((prev) => ({
                ...prev,
                referrerRewards:
                    prev.referrerRewards?.map((t) => (t.id === editingTier.id ? tier : t)) || [],
            }));
        } else {
            setFormData((prev) => ({
                ...prev,
                referrerRewards: [...(prev.referrerRewards || []), tier],
            }));
        }
        setEditingTier(null);
        setShowTierCreator(false);
    };

    const getRewardTypeLabel = (type: string) => {
        switch (type) {
            case 'discount_percentage':
                return 'Percentage Discount';
            case 'discount_fixed':
                return 'Fixed Discount';
            case 'bonus_content':
                return 'Bonus Content';
            case 'free_days':
                return 'Free Days';
            case 'free_course':
                return 'Free Course';
            case 'points_system':
                return 'Points System';
            default:
                return type;
        }
    };

    const getRewardIcon = (type: string) => {
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

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-h-[90vh] min-w-fit overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <TrendingUp className="size-5" />
                        {editingSettings ? 'Edit Referral Program' : 'Create Referral Program'}
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Program Label */}
                    <div className="space-y-2">
                        <Label>Program Label *</Label>
                        <Input
                            value={formData.label || ''}
                            onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                            placeholder="Enter a name for your referral program"
                        />
                    </div>

                    {/* Referee Settings */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Gift className="size-5" />
                                Referee Benefits (One-time Reward)
                            </CardTitle>
                            <p className="text-sm text-gray-600">
                                What new users get when they use a referral code
                            </p>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <RefereeRewardEditor
                                reward={formData.refereeReward}
                                onChange={(reward) =>
                                    setFormData({ ...formData, refereeReward: reward })
                                }
                            />
                        </CardContent>
                    </Card>

                    {/* Referrer Tiered Rewards */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="flex items-center gap-2">
                                        <Users className="size-5" />
                                        Referrer Rewards (Tiered)
                                    </CardTitle>
                                    <p className="text-sm text-gray-600">
                                        Rewards for referrers based on number of successful
                                        referrals
                                    </p>
                                </div>
                                <MyButton
                                    buttonType="secondary"
                                    onClick={handleAddTier}
                                    className="flex items-center gap-2"
                                >
                                    <Plus className="size-4" />
                                    Add Tier
                                </MyButton>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {formData.referrerRewards && formData.referrerRewards.length > 0 ? (
                                <div className="space-y-4">
                                    {formData.referrerRewards
                                        .sort((a, b) => a.referralCount - b.referralCount)
                                        .map((tier) => (
                                            <div key={tier.id} className="rounded-lg border p-4">
                                                <div className="mb-3 flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <Badge
                                                            variant="secondary"
                                                            className="text-sm"
                                                        >
                                                            {tier.referralCount} referral
                                                            {tier.referralCount !== 1 ? 's' : ''}
                                                        </Badge>
                                                        <span className="font-medium">
                                                            {tier.tierName}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => handleEditTier(tier)}
                                                        >
                                                            <Edit className="size-4" />
                                                        </Button>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            className="text-red-600"
                                                            onClick={() =>
                                                                handleDeleteTier(tier.id)
                                                            }
                                                        >
                                                            <Trash2 className="size-4" />
                                                        </Button>
                                                    </div>
                                                </div>

                                                <div className="mb-2 flex items-center gap-2">
                                                    {getRewardIcon(tier.reward.type)}
                                                    <span className="text-sm font-medium">
                                                        {getRewardTypeLabel(tier.reward.type)}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                </div>
                            ) : (
                                <div className="py-8 text-center text-gray-500">
                                    <Users className="mx-auto mb-4 size-16 text-gray-300" />
                                    <p className="mb-2 text-lg font-medium">
                                        No reward tiers configured
                                    </p>
                                    <p className="mb-4 text-sm">
                                        Create tiers to reward referrers based on their referral
                                        count
                                    </p>
                                    <Button variant="outline" onClick={handleAddTier}>
                                        <Plus className="mr-2 size-4" />
                                        Add Your First Tier
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Program Settings */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Settings className="size-5" />
                                Program Settings
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>Reward Vesting Period (Days)</Label>
                                <Input
                                    type="number"
                                    value={formData.payoutVestingDays || ''}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            payoutVestingDays: parseInt(e.target.value) || 0,
                                        })
                                    }
                                    placeholder="7"
                                    min="0"
                                    max="365"
                                />
                            </div>

                            <div className="flex items-center space-x-2">
                                <Switch
                                    checked={formData.allowCombineOffers || false}
                                    onCheckedChange={(checked) =>
                                        setFormData({ ...formData, allowCombineOffers: checked })
                                    }
                                />
                                <Label>Allow combining with other offers</Label>
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center space-x-2">
                                    <Switch
                                        checked={formData.isDefault || false}
                                        onCheckedChange={(checked) =>
                                            setFormData({ ...formData, isDefault: checked })
                                        }
                                    />
                                    <Label>Set as default referral program</Label>
                                </div>
                                <p className="ml-6 text-xs text-gray-600">
                                    Default programs will be automatically selected for new
                                    referrals
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="flex justify-end gap-2 pt-4">
                    <MyButton buttonType="secondary" onClick={onClose}>
                        Cancel
                    </MyButton>
                    <MyButton buttonType="primary" onClick={handleSave}>
                        {editingSettings ? 'Update Program' : 'Create Program'}
                    </MyButton>
                </div>

                {/* Tier Creator Dialog */}
                {showTierCreator && (
                    <ReferrerTierCreator
                        isOpen={showTierCreator}
                        onClose={() => {
                            setShowTierCreator(false);
                            setEditingTier(null);
                        }}
                        onSave={handleSaveTier}
                        editingTier={editingTier}
                        existingTiers={formData.referrerRewards || []}
                    />
                )}
            </DialogContent>
        </Dialog>
    );
};

// Enhanced Referee Reward Editor Component
interface RefereeRewardEditorProps {
    reward?: UnifiedReferralSettings['refereeReward'];
    onChange: (reward: UnifiedReferralSettings['refereeReward']) => void;
}

const RefereeRewardEditor: React.FC<RefereeRewardEditorProps> = ({ reward, onChange }) => {
    // If no reward is provided, initialize with a default reward
    const currentReward = reward || {
        type: 'bonus_content' as const,
        delivery: { email: true, whatsapp: false },
    };

    // If the reward was undefined and we're using default, call onChange to update parent
    React.useEffect(() => {
        if (!reward) {
            const defaultReward = {
                type: 'bonus_content' as const,
                delivery: { email: true, whatsapp: false },
            };
            onChange(defaultReward);
        }
    }, [reward, onChange]);

    return (
        <div className="space-y-4">
            <div className="space-y-2">
                <Label>Reward Type</Label>
                <Select
                    value={currentReward.type || 'bonus_content'}
                    onValueChange={(value) =>
                        onChange({
                            ...currentReward,
                            type: value as UnifiedReferralSettings['refereeReward']['type'],
                        })
                    }
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
                                Fixed Amount Discount
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
                                Free Membership Days
                            </div>
                        </SelectItem>
                        <SelectItem value="free_course">
                            <div className="flex items-center gap-2">
                                <BookOpen className="size-4" />
                                Free Course Access
                            </div>
                        </SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Conditional Fields based on reward type */}
            {(currentReward.type === 'discount_percentage' ||
                currentReward.type === 'free_days') && (
                <div className="space-y-2">
                    <Label>
                        {currentReward.type === 'discount_percentage'
                            ? 'Discount Percentage'
                            : 'Number of Days'}
                    </Label>
                    <div className="flex items-center gap-2">
                        <Input
                            type="number"
                            value={currentReward.value || ''}
                            onChange={(e) =>
                                onChange({ ...currentReward, value: parseInt(e.target.value) || 0 })
                            }
                            placeholder="Enter value"
                            min="1"
                            max={currentReward.type === 'discount_percentage' ? '100' : '365'}
                        />
                        <span className="text-sm text-gray-500">
                            {currentReward.type === 'discount_percentage' ? '%' : 'days'}
                        </span>
                    </div>
                </div>
            )}

            {currentReward.type === 'discount_fixed' && (
                <div className="space-y-2">
                    <Label>Discount Amount</Label>
                    <div className="flex items-center gap-2">
                        <Input
                            type="number"
                            value={currentReward.value || ''}
                            onChange={(e) =>
                                onChange({ ...currentReward, value: parseInt(e.target.value) || 0 })
                            }
                            placeholder="Enter amount"
                            min="1"
                        />
                        <Select
                            value={currentReward.currency || 'INR'}
                            onValueChange={(value) =>
                                onChange({ ...currentReward, currency: value })
                            }
                        >
                            <SelectTrigger className="w-24">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="INR">₹</SelectItem>
                                <SelectItem value="USD">$</SelectItem>
                                <SelectItem value="EUR">€</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            )}

            {currentReward.type === 'bonus_content' && (
                <ContentEditor
                    content={currentReward.content}
                    onChange={(content) => onChange({ ...currentReward, content })}
                />
            )}

            {currentReward.type === 'free_course' && (
                <CourseSelector
                    courseId={currentReward.courseId}
                    sessionId={currentReward.sessionId}
                    levelId={currentReward.levelId}
                    onChange={(selection) => onChange({ ...currentReward, ...selection })}
                    delivery={currentReward.delivery || { email: true, whatsapp: false }}
                    onDeliveryChange={(delivery) => onChange({ ...currentReward, delivery })}
                />
            )}
        </div>
    );
};

// Enhanced Content Editor Component
interface ContentEditorProps {
    content?: RewardContent;
    onChange: (content: RewardContent) => void;
}

const ContentEditor: React.FC<ContentEditorProps> = ({ content, onChange }) => {
    const [contentType, setContentType] = useState<'pdf' | 'video' | 'audio' | 'course'>(
        content?.contentType || 'pdf'
    );
    const [contentOption, setContentOption] = useState<ContentOption>(
        content?.content || {
            type: 'upload',
            title: '',
            delivery: { email: true, whatsapp: false },
        }
    );

    useEffect(() => {
        onChange({
            contentType,
            content: contentOption,
        });
    }, [contentType, contentOption, onChange]);

    return (
        <div className="space-y-4 rounded-lg border bg-gray-50 p-4">
            <div className="space-y-2">
                <Label>Content Type</Label>
                <Select
                    value={contentType}
                    onValueChange={(value: 'pdf' | 'video' | 'audio' | 'course') =>
                        setContentType(value)
                    }
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
                                <Music className="size-4" />
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
                    value={contentOption.type}
                    onValueChange={(value: 'upload' | 'link' | 'existing_course') =>
                        setContentOption({ ...contentOption, type: value })
                    }
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
                                <Link2 className="size-4" />
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

            {contentOption.type === 'upload' && (
                <div className="space-y-2">
                    <Label>Upload File</Label>
                    <Input
                        type="file"
                        accept={
                            contentType === 'pdf'
                                ? '.pdf'
                                : contentType === 'video'
                                  ? '.mp4,.avi,.mov,.wmv'
                                  : contentType === 'audio'
                                    ? '.mp3,.wav,.aac'
                                    : '*'
                        }
                        onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                                setContentOption({ ...contentOption, file });
                            }
                        }}
                    />
                </div>
            )}

            {contentOption.type === 'link' && (
                <div className="space-y-2">
                    <Label>Content URL</Label>
                    <Input
                        type="url"
                        value={contentOption.url || ''}
                        onChange={(e) =>
                            setContentOption({ ...contentOption, url: e.target.value })
                        }
                        placeholder="https://example.com/content"
                    />
                </div>
            )}

            {contentOption.type === 'existing_course' && (
                <CourseSelector
                    courseId={contentOption.courseId}
                    sessionId={contentOption.sessionId}
                    levelId={contentOption.levelId}
                    onChange={(selection) => setContentOption({ ...contentOption, ...selection })}
                    delivery={contentOption.delivery}
                    onDeliveryChange={(delivery) =>
                        setContentOption({ ...contentOption, delivery })
                    }
                />
            )}

            <div className="space-y-2">
                <Label>Content Title</Label>
                <Input
                    value={contentOption.title}
                    onChange={(e) => setContentOption({ ...contentOption, title: e.target.value })}
                    placeholder="e.g., Welcome Bonus Study Guide"
                />
            </div>

            <DeliveryOptionsEditor
                delivery={contentOption.delivery}
                onChange={(delivery) => setContentOption({ ...contentOption, delivery })}
            />
        </div>
    );
};

// Course Selector Component
interface CourseSelectorProps {
    courseId?: string;
    sessionId?: string;
    levelId?: string;
    onChange: (selection: { courseId?: string; sessionId?: string; levelId?: string }) => void;
    delivery: ContentDelivery;
    onDeliveryChange: (delivery: ContentDelivery) => void;
}

const CourseSelector: React.FC<CourseSelectorProps> = ({
    courseId,
    sessionId,
    levelId,
    onChange,
    delivery,
    onDeliveryChange,
}) => {
    const selectedCourse = mockCourses.find((c) => c.id === courseId);
    const selectedSession = selectedCourse?.sessions.find((s) => s.id === sessionId);

    return (
        <div className="space-y-4 rounded-lg border bg-gray-50 p-4">
            <div className="space-y-3">
                <div className="space-y-2">
                    <Label className="flex items-center gap-2 text-sm font-medium">
                        <BookOpen className="size-4" />
                        Select Course
                    </Label>
                    <Select
                        value={courseId || ''}
                        onValueChange={(value) =>
                            onChange({ courseId: value, sessionId: '', levelId: '' })
                        }
                    >
                        <SelectTrigger className="border-gray-200 bg-white hover:border-gray-300">
                            <SelectValue placeholder="Choose a course" />
                        </SelectTrigger>
                        <SelectContent>
                            {mockCourses.map((course) => (
                                <SelectItem key={course.id} value={course.id}>
                                    <div className="flex items-center gap-2">
                                        <BookOpen className="size-4 text-blue-600" />
                                        {course.name}
                                    </div>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {selectedCourse && (
                    <div className="space-y-2">
                        <Label className="flex items-center gap-2 text-sm font-medium">
                            <Calendar className="size-4" />
                            Select Session
                        </Label>
                        <Select
                            value={sessionId || ''}
                            onValueChange={(value) =>
                                onChange({ courseId, sessionId: value, levelId: '' })
                            }
                        >
                            <SelectTrigger className="border-gray-200 bg-white hover:border-gray-300">
                                <SelectValue placeholder="Choose a session" />
                            </SelectTrigger>
                            <SelectContent>
                                {selectedCourse.sessions.map((session) => (
                                    <SelectItem key={session.id} value={session.id}>
                                        <div className="flex items-center gap-2">
                                            <Calendar className="size-4 text-green-600" />
                                            {session.name}
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                )}

                {selectedSession && (
                    <div className="space-y-2">
                        <Label className="flex items-center gap-2 text-sm font-medium">
                            <TrendingUp className="size-4" />
                            Select Level
                        </Label>
                        <Select
                            value={levelId || ''}
                            onValueChange={(value) =>
                                onChange({ courseId, sessionId, levelId: value })
                            }
                        >
                            <SelectTrigger className="border-gray-200 bg-white hover:border-gray-300">
                                <SelectValue placeholder="Choose a level" />
                            </SelectTrigger>
                            <SelectContent>
                                {selectedSession.levels.map((level) => (
                                    <SelectItem key={level.id} value={level.id}>
                                        <div className="flex items-center gap-2">
                                            <TrendingUp className="size-4 text-purple-600" />
                                            {level.name}
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                )}
            </div>

            <div className="border-t border-blue-200 pt-3">
                <DeliveryOptionsEditor delivery={delivery} onChange={onDeliveryChange} />
            </div>
        </div>
    );
};

// Delivery Options Editor Component
interface DeliveryOptionsEditorProps {
    delivery: ContentDelivery;
    onChange: (delivery: ContentDelivery) => void;
}

const DeliveryOptionsEditor: React.FC<DeliveryOptionsEditorProps> = ({ delivery, onChange }) => {
    return (
        <div className="space-y-2">
            <Label>Delivery Methods</Label>
            <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                    <Checkbox
                        id="email-delivery"
                        checked={delivery.email}
                        onCheckedChange={(checked) =>
                            onChange({ ...delivery, email: checked as boolean })
                        }
                    />
                    <Label htmlFor="email-delivery" className="flex items-center gap-2 text-sm">
                        <Mail className="size-4" />
                        Email
                    </Label>
                </div>
                <div className="flex items-center space-x-2">
                    <Checkbox
                        id="whatsapp-delivery"
                        checked={delivery.whatsapp}
                        onCheckedChange={(checked) =>
                            onChange({ ...delivery, whatsapp: checked as boolean })
                        }
                    />
                    <Label htmlFor="whatsapp-delivery" className="flex items-center gap-2 text-sm">
                        <MessageCircle className="size-4" />
                        WhatsApp
                    </Label>
                </div>
            </div>
        </div>
    );
};

// Enhanced Referrer Tier Creator Component (same structure but with enhanced content options)
interface ReferrerTierCreatorProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (tier: ReferrerTier) => void;
    editingTier?: ReferrerTier | null;
    existingTiers: ReferrerTier[];
}

const ReferrerTierCreator: React.FC<ReferrerTierCreatorProps> = ({
    isOpen,
    onClose,
    onSave,
    editingTier,
}) => {
    const [formData, setFormData] = useState<Partial<ReferrerTier>>({
        tierName: '',
        referralCount: 1,
        reward: {
            type: 'bonus_content',
        },
    });

    useEffect(() => {
        if (editingTier) {
            setFormData(editingTier);
        } else {
            setFormData({
                tierName: '',
                referralCount: 1,
                reward: {
                    type: 'bonus_content',
                    description: '',
                },
            });
        }
    }, [editingTier, isOpen]);

    // Auto-calculate referral count for points system
    useEffect(() => {
        if (
            formData.reward?.type === 'points_system' &&
            formData.reward.pointsPerReferral &&
            formData.reward.pointsToReward &&
            formData.reward.pointsPerReferral > 0
        ) {
            const calculatedReferralCount = Math.ceil(
                formData.reward.pointsToReward / formData.reward.pointsPerReferral
            );
            setFormData((prev) => ({
                ...prev,
                referralCount: calculatedReferralCount,
            }));
        }
    }, [
        formData.reward?.type,
        formData.reward?.pointsPerReferral,
        formData.reward?.pointsToReward,
    ]);

    const handleSave = () => {
        if (!formData.tierName || !formData.reward) {
            return;
        }

        const tier: ReferrerTier = {
            id: editingTier?.id || Date.now().toString(),
            tierName: formData.tierName,
            referralCount: formData.referralCount || 1,
            reward: {
                type: formData.reward.type as ReferrerTier['reward']['type'],
                value: formData.reward.value,
                currency: formData.reward.currency,
                content: formData.reward.content,
                courseId: formData.reward.courseId,
                sessionId: formData.reward.sessionId,
                levelId: formData.reward.levelId,
                delivery: formData.reward.delivery,
                pointsPerReferral: formData.reward.pointsPerReferral,
                pointsToReward: formData.reward.pointsToReward,
                pointsRewardType: formData.reward.pointsRewardType,
                pointsRewardValue: formData.reward.pointsRewardValue,
            },
        };

        onSave(tier);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-h-[85vh] w-[600px] overflow-y-auto ">
                <DialogHeader>
                    <DialogTitle>
                        {editingTier ? 'Edit Reward Tier' : 'Create Reward Tier'}
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label>Tier Name</Label>
                        <Input
                            value={formData.tierName || ''}
                            onChange={(e) => setFormData({ ...formData, tierName: e.target.value })}
                            placeholder="e.g., First Referral, 10 Referrals"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Referral Count Required</Label>
                        <Input
                            type="number"
                            value={
                                formData.reward?.type === 'points_system' &&
                                formData.reward.pointsPerReferral &&
                                formData.reward.pointsToReward
                                    ? Math.ceil(
                                          formData.reward.pointsToReward /
                                              formData.reward.pointsPerReferral
                                      )
                                    : formData.referralCount || ''
                            }
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    referralCount: parseInt(e.target.value) || 0,
                                })
                            }
                            disabled={
                                !!(
                                    formData.reward?.type === 'points_system' &&
                                    formData.reward.pointsPerReferral &&
                                    formData.reward.pointsToReward
                                )
                            }
                            className={
                                formData.reward?.type === 'points_system' &&
                                formData.reward.pointsPerReferral &&
                                formData.reward.pointsToReward
                                    ? 'cursor-not-allowed bg-gray-100'
                                    : ''
                            }
                        />
                        {formData.reward?.type === 'points_system' &&
                            formData.reward.pointsPerReferral &&
                            formData.reward.pointsToReward && (
                                <p className="text-xs text-gray-600">
                                    Automatically calculated: {formData.reward.pointsToReward}{' '}
                                    points ÷ {formData.reward.pointsPerReferral} points per referral
                                    ={' '}
                                    {Math.ceil(
                                        formData.reward.pointsToReward /
                                            formData.reward.pointsPerReferral
                                    )}{' '}
                                    referrals
                                </p>
                            )}
                    </div>

                    <div className="space-y-2">
                        <Label>Reward Type</Label>
                        <Select
                            value={formData.reward?.type || 'bonus_content'}
                            onValueChange={(value) =>
                                setFormData({
                                    ...formData,
                                    reward: {
                                        ...formData.reward!,
                                        type: value as
                                            | 'discount_percentage'
                                            | 'discount_fixed'
                                            | 'bonus_content'
                                            | 'free_days'
                                            | 'free_course'
                                            | 'points_system',
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
                                    Fixed Amount Discount
                                </SelectItem>
                                <SelectItem value="bonus_content">Bonus Content</SelectItem>
                                <SelectItem value="free_days">Free Membership Days</SelectItem>
                                <SelectItem value="free_course">Free Course Access</SelectItem>
                                <SelectItem value="points_system">Points System</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Conditional Fields based on reward type */}
                    {(formData.reward?.type === 'discount_percentage' ||
                        formData.reward?.type === 'free_days') && (
                        <div className="space-y-2">
                            <Label>
                                {formData.reward.type === 'discount_percentage'
                                    ? 'Discount Percentage'
                                    : 'Number of Days'}
                            </Label>
                            <div className="flex items-center gap-2">
                                <Input
                                    type="number"
                                    value={formData.reward.value || ''}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            reward: {
                                                ...formData.reward!,
                                                value: parseInt(e.target.value) || 0,
                                            },
                                        })
                                    }
                                    placeholder="Enter value"
                                    min="1"
                                    max={
                                        formData.reward.type === 'discount_percentage'
                                            ? '100'
                                            : '365'
                                    }
                                />
                                <span className="text-sm text-gray-500">
                                    {formData.reward.type === 'discount_percentage' ? '%' : 'days'}
                                </span>
                            </div>
                        </div>
                    )}

                    {formData.reward?.type === 'discount_fixed' && (
                        <div className="space-y-2">
                            <Label>Discount Amount</Label>
                            <div className="flex items-center gap-2">
                                <Input
                                    type="number"
                                    value={formData.reward.value || ''}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            reward: {
                                                ...formData.reward!,
                                                value: parseInt(e.target.value) || 0,
                                            },
                                        })
                                    }
                                    placeholder="Enter amount"
                                    min="1"
                                />
                                <Select
                                    value={formData.reward.currency || 'INR'}
                                    onValueChange={(value) =>
                                        setFormData({
                                            ...formData,
                                            reward: {
                                                ...formData.reward!,
                                                currency: value,
                                            },
                                        })
                                    }
                                >
                                    <SelectTrigger className="w-24">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="INR">₹</SelectItem>
                                        <SelectItem value="USD">$</SelectItem>
                                        <SelectItem value="EUR">€</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    )}

                    {formData.reward?.type === 'bonus_content' && (
                        <ContentEditor
                            content={formData.reward.content}
                            onChange={(content) =>
                                setFormData({
                                    ...formData,
                                    reward: {
                                        ...formData.reward!,
                                        content,
                                    },
                                })
                            }
                        />
                    )}

                    {formData.reward?.type === 'free_course' && (
                        <CourseSelector
                            courseId={formData.reward.courseId}
                            sessionId={formData.reward.sessionId}
                            levelId={formData.reward.levelId}
                            onChange={(selection) =>
                                setFormData({
                                    ...formData,
                                    reward: {
                                        ...formData.reward!,
                                        ...selection,
                                    },
                                })
                            }
                            delivery={formData.reward.delivery || { email: true, whatsapp: false }}
                            onDeliveryChange={(delivery) =>
                                setFormData({
                                    ...formData,
                                    reward: {
                                        ...formData.reward!,
                                        delivery,
                                    },
                                })
                            }
                        />
                    )}

                    {formData.reward?.type === 'points_system' && (
                        <div className="space-y-4 rounded-lg border bg-gray-50 p-4">
                            <div className="space-y-2">
                                <Label>Points Per Referral</Label>
                                <div className="flex items-center gap-2">
                                    <Input
                                        type="number"
                                        value={formData.reward.pointsPerReferral || ''}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                reward: {
                                                    ...formData.reward!,
                                                    pointsPerReferral:
                                                        parseInt(e.target.value) || 0,
                                                },
                                            })
                                        }
                                        placeholder="e.g., 100"
                                        min="1"
                                    />
                                    <span className="text-sm text-gray-500">
                                        points per referral
                                    </span>
                                </div>
                                <p className="text-xs text-gray-600">
                                    How many points the referrer earns for each successful referral
                                </p>
                            </div>

                            <div className="space-y-2">
                                <Label>Points Required for Reward</Label>
                                <Input
                                    type="number"
                                    value={formData.reward.pointsToReward || ''}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            reward: {
                                                ...formData.reward!,
                                                pointsToReward: parseInt(e.target.value) || 0,
                                            },
                                        })
                                    }
                                    placeholder="e.g., 1000"
                                    min="1"
                                />
                                <p className="text-xs text-gray-600">
                                    Total points needed to claim the reward
                                </p>
                            </div>

                            <div className="space-y-2">
                                <Label>Reward Type</Label>
                                <Select
                                    value={
                                        formData.reward.pointsRewardType || 'discount_percentage'
                                    }
                                    onValueChange={(value) =>
                                        setFormData({
                                            ...formData,
                                            reward: {
                                                ...formData.reward!,
                                                pointsRewardType: value as
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
                                            Fixed Amount Discount
                                        </SelectItem>
                                        <SelectItem value="membership_days">
                                            Free Membership Days
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label>Reward Value</Label>
                                <div className="flex items-center gap-2">
                                    <Input
                                        type="number"
                                        value={formData.reward.pointsRewardValue || ''}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                reward: {
                                                    ...formData.reward!,
                                                    pointsRewardValue:
                                                        parseInt(e.target.value) || 0,
                                                },
                                            })
                                        }
                                        placeholder="Enter value"
                                        min="1"
                                    />
                                    <span className="text-sm text-gray-500">
                                        {formData.reward.pointsRewardType === 'discount_percentage'
                                            ? '%'
                                            : formData.reward.pointsRewardType === 'membership_days'
                                              ? 'days'
                                              : '₹'}
                                    </span>
                                </div>
                            </div>

                            {/* Points System Summary */}
                            <div className="rounded border bg-white p-3">
                                <h5 className="mb-2 text-sm font-medium">Points System Summary</h5>
                                <div className="space-y-1 text-xs text-gray-600">
                                    <div>
                                        • Referrer earns{' '}
                                        <strong>
                                            {formData.reward.pointsPerReferral || 0} points
                                        </strong>{' '}
                                        per successful referral
                                    </div>
                                    <div>
                                        • Needs{' '}
                                        <strong>
                                            {formData.reward.pointsToReward || 0} total points
                                        </strong>{' '}
                                        to claim reward
                                    </div>
                                    <div>
                                        • Requires approximately{' '}
                                        <strong>
                                            {Math.ceil(
                                                (formData.reward.pointsToReward || 0) /
                                                    (formData.reward.pointsPerReferral || 1)
                                            )}{' '}
                                            referrals
                                        </strong>{' '}
                                        to earn reward
                                    </div>
                                    <div>
                                        • Reward:{' '}
                                        <strong>
                                            {formData.reward.pointsRewardValue || 0}
                                            {formData.reward.pointsRewardType ===
                                            'discount_percentage'
                                                ? '% discount'
                                                : formData.reward.pointsRewardType ===
                                                    'membership_days'
                                                  ? ' free days'
                                                  : '₹ discount'}
                                        </strong>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex justify-end gap-2 pt-4">
                    <MyButton buttonType="secondary" onClick={onClose}>
                        Cancel
                    </MyButton>
                    <MyButton buttonType="primary" onClick={handleSave}>
                        {editingTier ? 'Update Tier' : 'Create Tier'}
                    </MyButton>
                </div>
            </DialogContent>
        </Dialog>
    );
};
