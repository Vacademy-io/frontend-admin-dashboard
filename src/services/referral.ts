import authenticatedAxiosInstance from '@/lib/auth/axiosInstance';
import { UnifiedReferralSettings, ReferrerTier } from '@/types/referral';
import { REFERRAL_API_BASE, REFERRAL_DELETE } from '@/constants/urls';
import { getInstituteId } from '@/constants/helper';

// API endpoints

// Interface for API reward format
interface ApiRewardFormat {
    tier_name: string;
    referral_count: number;
    reward: {
        type: string;
        value?: number;
        currency?: string;
        description: string;
        content?: unknown;
        course_id?: string;
        session_id?: string;
        level_id?: string;
        delivery?: unknown;
        points_per_referral?: number;
        points_to_reward?: number;
        points_reward_type?: string;
        points_reward_value?: number;
    };
}

// Types for API requests and responses
export interface ReferralOptionRequest {
    name: string;
    status: string;
    source: string; // "INSTITUTE"
    source_id: string; // institute_id
    referrer_discount_json: string;
    referee_discount_json: string;
    referrer_vesting_days: number;
    tag: string | null;
    description: string;
}

export interface ReferralOptionResponse {
    id: string;
    name: string;
    status: string;
    source: string;
    source_id: string;
    referrer_discount_json: string;
    referee_discount_json: string;
    referrer_vesting_days: number;
    tag: string | null;
    description: string;
    created_at?: string;
    updated_at?: string;
}

// Helper function to convert UnifiedReferralSettings to API format
export const convertToApiFormat = (settings: UnifiedReferralSettings): ReferralOptionRequest => {
    const instituteId = getInstituteId();

    // Validate required fields
    if (!settings.label || !settings.refereeReward || !settings.referrerRewards) {
        throw new Error('Missing required fields: label, refereeReward, or referrerRewards');
    }

    // Convert referrer rewards to JSON string
    const referrerDiscountJson = JSON.stringify({
        rewards: settings.referrerRewards.map((tier: ReferrerTier) => ({
            tier_name: tier.tierName,
            referral_count: tier.referralCount,
            reward: {
                type: tier.reward.type,
                value: tier.reward.value,
                currency: tier.reward.currency,
                description: tier.reward.description,
                content: tier.reward.content,
                course_id: tier.reward.courseId,
                session_id: tier.reward.sessionId,
                level_id: tier.reward.levelId,
                delivery: tier.reward.delivery,
                points_per_referral: tier.reward.pointsPerReferral,
                points_to_reward: tier.reward.pointsToReward,
                points_reward_type: tier.reward.pointsRewardType,
                points_reward_value: tier.reward.pointsRewardValue,
            },
        })),
    });

    // Convert referee reward to JSON string
    const refereeDiscountJson = JSON.stringify({
        reward: {
            type: settings.refereeReward.type,
            value: settings.refereeReward.value,
            currency: settings.refereeReward.currency,
            description: settings.refereeReward.description,
            content: settings.refereeReward.content,
            course_id: settings.refereeReward.courseId,
            session_id: settings.refereeReward.sessionId,
            level_id: settings.refereeReward.levelId,
            delivery: settings.refereeReward.delivery,
        },
    });

    return {
        name: settings.label,
        status: 'ACTIVE',
        source: 'INSTITUTE',
        source_id: instituteId || '',
        referrer_discount_json: referrerDiscountJson,
        referee_discount_json: refereeDiscountJson,
        referrer_vesting_days: settings.payoutVestingDays || 7,
        tag: settings.isDefault ? 'DEFAULT' : null,
        description: settings.description || `Referral program: ${settings.label}`,
    };
};

// Helper function to convert API response to UnifiedReferralSettings format
export const convertFromApiFormat = (
    apiResponse: ReferralOptionResponse
): UnifiedReferralSettings => {
    try {
        const referrerDiscountData = JSON.parse(apiResponse.referrer_discount_json);
        const refereeDiscountData = JSON.parse(apiResponse.referee_discount_json);

        return {
            id: apiResponse.id,
            label: apiResponse.name,
            isDefault: apiResponse.tag === 'DEFAULT',
            payoutVestingDays: apiResponse.referrer_vesting_days,
            allowCombineOffers: true, // Default value, adjust as needed
            refereeReward: {
                type: refereeDiscountData.reward.type,
                value: refereeDiscountData.reward.value,
                currency: refereeDiscountData.reward.currency,
                description: refereeDiscountData.reward.description,
                content: refereeDiscountData.reward.content,
                courseId: refereeDiscountData.reward.course_id,
                sessionId: refereeDiscountData.reward.session_id,
                levelId: refereeDiscountData.reward.level_id,
                delivery: refereeDiscountData.reward.delivery,
            },
            referrerRewards: referrerDiscountData.rewards.map((reward: ApiRewardFormat) => ({
                id: `${apiResponse.id}_${reward.tier_name}`,
                tierName: reward.tier_name,
                referralCount: reward.referral_count,
                reward: {
                    type: reward.reward.type,
                    value: reward.reward.value,
                    currency: reward.reward.currency,
                    description: reward.reward.description,
                    content: reward.reward.content,
                    courseId: reward.reward.course_id,
                    sessionId: reward.reward.session_id,
                    levelId: reward.reward.level_id,
                    delivery: reward.reward.delivery,
                    pointsPerReferral: reward.reward.points_per_referral,
                    pointsToReward: reward.reward.points_to_reward,
                    pointsRewardType: reward.reward.points_reward_type,
                    pointsRewardValue: reward.reward.points_reward_value,
                },
            })),
        };
    } catch (error) {
        console.error('Error parsing referral option data:', error);
        throw new Error('Invalid referral option data format');
    }
};

// API functions
export const addReferralOption = async (
    settings: UnifiedReferralSettings
): Promise<ReferralOptionResponse> => {
    try {
        const apiData = convertToApiFormat(settings);

        const response = await authenticatedAxiosInstance.post<ReferralOptionResponse>(
            REFERRAL_API_BASE,
            apiData,
            {
                headers: {
                    'Content-Type': 'application/json',
                },
            }
        );

        return response.data;
    } catch (error) {
        console.error('Error adding referral option:', error);
        throw error;
    }
};

export const getReferralOptions = async (): Promise<ReferralOptionResponse[]> => {
    try {
        const instituteId = getInstituteId();

        const response = await authenticatedAxiosInstance.get<ReferralOptionResponse[]>(
            REFERRAL_API_BASE,
            {
                params: {
                    source: 'INSTITUTE',
                    sourceId: instituteId,
                },
            }
        );

        return response.data;
    } catch (error) {
        console.error('Error fetching referral options:', error);
        throw error;
    }
};

export const deleteReferralOption = async (referralOptionId: string): Promise<void> => {
    try {
        await authenticatedAxiosInstance.delete(REFERRAL_DELETE, {
            data: [referralOptionId],
        });
    } catch (error) {
        console.error('Error deleting referral option:', error);
        throw error;
    }
};

export const updateReferralOption = async (
    referralOptionId: string,
    settings: UnifiedReferralSettings
): Promise<ReferralOptionResponse> => {
    try {
        const apiData = convertToApiFormat(settings);

        const response = await authenticatedAxiosInstance.post<ReferralOptionResponse>(
            `${REFERRAL_API_BASE}`,
            {
                ...apiData,
                id: referralOptionId,
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                },
            }
        );

        return response.data;
    } catch (error) {
        console.error('Error updating referral option:', error);
        throw error;
    }
};
