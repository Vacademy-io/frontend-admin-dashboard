// Types for referral system
export interface ContentDelivery {
    email: boolean;
    whatsapp: boolean;
}

export interface ContentOption {
    type: 'upload' | 'link' | 'existing_course';
    file?: File;
    url?: string;
    courseId?: string;
    sessionId?: string;
    levelId?: string;
    title: string;
    description?: string;
    delivery: ContentDelivery;
}

// New API benefit value types
export interface ContentBenefitValue {
    referralBenefits: Array<{
        referralRange: { min: number; max: number };
        benefits: Array<{
            deliveryMediums: string[]; // ["EMAIL", "WHATSAPP"]
            templateId: string;
            subject?: string | null;
            body?: string | null;
            fileIds: string[];
        }>;
    }>;
}

export interface PercentageDiscountBenefitValue {
    percentage: number;
    maxDiscountAmount: number;
    applyMaximumDiscountAmount: boolean;
}

export interface FlatDiscountBenefitValue {
    amount: number;
}

export type BenefitValue =
    | ContentBenefitValue
    | PercentageDiscountBenefitValue
    | FlatDiscountBenefitValue;

// New API benefit structure
export interface ApiBenefit {
    benefitType: 'CONTENT' | 'PERCENTAGE_DISCOUNT' | 'FLAT';
    benefitValue: BenefitValue;
}

// API tier structure for referrer benefits
export interface ApiTier extends ApiBenefit {
    tierName: string;
    referralCount: number;
}

// API referrer discount structure
export interface ApiReferrerDiscount {
    tiers: ApiTier[];
}

// Legacy UI types (keeping for backward compatibility)
export interface RewardContent {
    contentType: 'pdf' | 'video' | 'audio' | 'course';
    content: ContentOption;
}

export interface RefereeReward {
    type: 'discount_percentage' | 'discount_fixed' | 'bonus_content' | 'free_days' | 'free_course';
    value?: number;
    currency?: string;
    content?: RewardContent;
    courseId?: string;
    sessionId?: string;
    levelId?: string;
    delivery?: ContentDelivery;
    description: string;
}

export interface ReferrerReward {
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
    description: string;
}

export interface ReferrerTier {
    id: string;
    tierName: string;
    referralCount: number;
    reward: ReferrerReward;
}

export interface UnifiedReferralSettings {
    id: string;
    label: string;
    isDefault: boolean;
    requireReferrerActiveInBatch?: boolean;
    refereeReward: RefereeReward;
    referrerRewards: ReferrerTier[];
    allowCombineOffers: boolean;
    payoutVestingDays: number;
    description?: string;
}

// Export type alias for backward compatibility
export type UnifiedReferralSettingsType = UnifiedReferralSettings;
