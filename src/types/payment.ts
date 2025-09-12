// Payment plan types
export type PaymentPlanType = 'SUBSCRIPTION' | 'ONE_TIME' | 'DONATION' | 'FREE';
export type PaymentPlanTag = 'DEFAULT' | 'free' | null;

// Referral option interface for payment plans
export interface ReferralOption {
    name: string;
    status: string;
    source: string;
    source_id: string;
    referrer_discount_json: string;
    referee_discount_json: string;
    referrer_vesting_days: number;
    tag: string;
    description: string;
}

export interface PaymentPlanApi {
    id?: string;
    name: string;
    status: string;
    validity_in_days: number;
    actual_price: number;
    elevated_price: number;
    currency: string;
    description: string;
    tag: PaymentPlanTag;
    type: PaymentPlanType;
    feature_json: string;
    payment_option_metadata_json?: string;
    referral_option?: ReferralOption;
}

export interface PaymentOptionApi {
    id: string;
    name: string;
    status: string;
    source: string;
    source_id: string;
    tag: PaymentPlanTag;
    type: PaymentPlanType;
    require_approval: boolean;
    payment_plans: PaymentPlanApi[];
    payment_option_metadata_json: string;
}

// Detailed referral settings interfaces (matching UnifiedReferralSettings)
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
        description: string;
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
        description: string;
    };
}

export interface PaymentPlan {
    id: string;
    name: string;
    type: PaymentPlanType;
    tag: PaymentPlanTag;
    currency: string;
    isDefault: boolean;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    config: any;
    features?: string[];
    validityDays?: number;
    requireApproval?: boolean;
    apiReferralOption?: ReferralOption;
    // Enhanced referral option with detailed settings
    unifiedReferralSettings?: UnifiedReferralSettings;
    // Legacy referral option for backward compatibility
    referralOption?: {
        includeRefereeReward: boolean;
        includeReferrerReward: boolean;
        refereeReward?: {
            type:
                | 'discount_percentage'
                | 'discount_fixed'
                | 'bonus_content'
                | 'free_days'
                | 'free_course';
            value?: number;
            currency?: string;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            content?: any;
            courseId?: string;
            sessionId?: string;
            levelId?: string;
            delivery?: { email: boolean; whatsapp: boolean };
            templateId?: string;
            description: string;
        };
        referrerRewards?: Array<{
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
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                content?: any;
                courseId?: string;
                sessionId?: string;
                levelId?: string;
                delivery?: { email: boolean; whatsapp: boolean };
                templateId?: string;
                pointsPerReferral?: number;
                pointsToReward?: number;
                pointsRewardType?: 'discount_percentage' | 'discount_fixed' | 'membership_days';
                pointsRewardValue?: number;
                description: string;
            };
        }>;
        vestingDays?: number;
        allowCombineOffers?: boolean;
    };
}

export enum PaymentPlans {
    FREE = 'FREE',
    DONATION = 'DONATION',
    SUBSCRIPTION = 'SUBSCRIPTION',
    UPFRONT = 'ONE_TIME',
}
