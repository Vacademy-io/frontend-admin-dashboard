import authenticatedAxiosInstance from '@/lib/auth/axiosInstance';
import {
    UnifiedReferralSettings,
    ReferrerTier,
    ReferrerReward,
    RefereeReward,
} from '@/types/referral';
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

// Helper function to convert reward type to benefit format
const convertRewardToBenefitFormat = (reward: ReferrerReward | RefereeReward) => {
    switch (reward.type) {
        case 'discount_percentage':
            return {
                benefitType: 'PERCENTAGE_DISCOUNT',
                benefitValue: {
                    percentage: reward.value || 0,
                    maxDiscountAmount: reward.value || 100.0,
                    applyMaximumDiscountAmount: true,
                },
            };
        case 'discount_fixed':
            return {
                benefitType: 'FLAT',
                benefitValue: {
                    amount: reward.value || 0,
                },
            };
        case 'free_days':
            return {
                benefitType: 'FREE_MEMBERSHIP_DAYS',
                benefitValue: {
                    free_days: reward.value || 0,
                },
            };
        case 'bonus_content':
        case 'free_course': {
            // Use actual delivery mediums from the reward object
            const deliveryMediums: string[] = [];
            if (reward.delivery?.email) deliveryMediums.push('EMAIL');
            if (reward.delivery?.whatsapp) deliveryMediums.push('WHATSAPP');

            // Get file IDs from content if available
            let fileIds: string[] = [];
            if (reward.content?.content?.file) {
                // If it's a File object, we'd need to handle upload separately
                fileIds = ['placeholder-file-id'];
            } else if (reward.courseId) {
                fileIds = [reward.courseId];
            }

            return {
                benefitType: 'CONTENT',
                benefitValue: {
                    deliveryMediums: deliveryMediums.length > 0 ? deliveryMediums : ['EMAIL'],
                    templateId: 'referee_email_v1', // Keep hardcoded as requested
                    subject: null, // Keep hardcoded as requested
                    body: null, // Keep hardcoded as requested
                    fileIds: fileIds.length > 0 ? fileIds : [],
                },
            };
        }
        case 'points_system':
            // For points system, use the reward type of the final reward
            if (reward.pointsRewardType === 'discount_percentage') {
                return {
                    benefitType: 'PERCENTAGE_DISCOUNT',
                    benefitValue: {
                        percentage: reward.pointsRewardValue || 0,
                        maxDiscountAmount: reward.pointsRewardValue || 100.0,
                        applyMaximumDiscountAmount: true,
                    },
                };
            } else if (reward.pointsRewardType === 'discount_fixed') {
                return {
                    benefitType: 'FLAT',
                    benefitValue: {
                        amount: reward.pointsRewardValue || 0,
                    },
                };
            } else if (reward.pointsRewardType === 'membership_days') {
                return {
                    benefitType: 'FREE_MEMBERSHIP_DAYS',
                    benefitValue: {
                        free_days: reward.pointsRewardValue || 0,
                    },
                };
            } else {
                // Fallback for other points system types to CONTENT
                return {
                    benefitType: 'CONTENT',
                    benefitValue: {
                        deliveryMediums: ['EMAIL'],
                        templateId: 'referee_email_v1', // Keep hardcoded as requested
                        subject: null, // Keep hardcoded as requested
                        body: null, // Keep hardcoded as requested
                        fileIds: [],
                    },
                };
            }
        default: {
            // Fallback for unknown reward types to CONTENT
            return {
                benefitType: 'CONTENT',
                benefitValue: {
                    deliveryMediums: ['EMAIL'],
                    templateId: 'referee_email_v1', // Keep hardcoded as requested
                    subject: null, // Keep hardcoded as requested
                    body: null, // Keep hardcoded as requested
                    fileIds: [],
                },
            };
        }
    }
};

// Helper function to convert UnifiedReferralSettings to API format
export const convertToApiFormat = (settings: UnifiedReferralSettings): ReferralOptionRequest => {
    const instituteId = getInstituteId();

    // Validate required fields
    if (!settings.label || !settings.refereeReward || !settings.referrerRewards) {
        throw new Error('Missing required fields: label, refereeReward, or referrerRewards');
    }

    // Convert referrer rewards to new JSON format with tier names and referral ranges
    const referrerDiscountJson = JSON.stringify({
        benefitType: settings.referrerRewards[0]
            ? convertRewardToBenefitFormat(settings.referrerRewards[0].reward).benefitType
            : 'CONTENT',
        benefitValue: {
            referralBenefits: settings.referrerRewards.map((tier: ReferrerTier) => {
                const benefitFormat = convertRewardToBenefitFormat(tier.reward);
                return {
                    tierName: tier.tierName,
                    referralRange: {
                        min: tier.referralCount,
                        max: tier.referralCount + 2,
                    },
                    ...benefitFormat.benefitValue,
                };
            }),
        },
    });

    // Convert referee reward to new JSON format
    const refereeDiscountJson = JSON.stringify(
        convertRewardToBenefitFormat(settings.refereeReward)
    );

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

// Helper function to convert benefit format back to referee reward type
const convertBenefitFormatToRefereeReward = (
    benefitData: Record<string, unknown>
): RefereeReward => {
    const benefitValue = benefitData.benefitValue as Record<string, unknown>;

    switch (benefitData.benefitType) {
        case 'PERCENTAGE_DISCOUNT':
            return {
                type: 'discount_percentage',
                value: (benefitValue?.percentage as number) || 0,
                currency: 'INR',
            };
        case 'FLAT':
            return {
                type: 'discount_fixed',
                value: (benefitValue?.amount as number) || 0,
                currency: 'INR',
            };
        case 'FREE_MEMBERSHIP_DAYS':
            return {
                type: 'free_days',
                value: (benefitValue?.free_days as number) || 0,
            };
        case 'CONTENT': {
            // Extract delivery mediums from the benefit value
            const deliveryMediums = benefitValue?.deliveryMediums as string[];

            // Convert delivery mediums back to boolean format
            const delivery = {
                email: deliveryMediums?.includes('EMAIL') || false,
                whatsapp: deliveryMediums?.includes('WHATSAPP') || false,
            };

            return {
                type: 'bonus_content',
                content: {
                    contentType: 'pdf',
                    content: {
                        type: 'upload',
                        title: 'Bonus Content',
                        delivery,
                    },
                },
                delivery,
            };
        }
        default:
            return {
                type: 'bonus_content',
                delivery: { email: true, whatsapp: false },
            };
    }
};

// Helper function to convert benefit format back to referrer reward type
const convertBenefitFormatToReferrerReward = (
    benefitData: Record<string, unknown>
): ReferrerReward => {
    const benefitValue = benefitData.benefitValue as Record<string, unknown>;

    switch (benefitData.benefitType) {
        case 'PERCENTAGE_DISCOUNT':
            return {
                type: 'discount_percentage',
                value: (benefitValue?.percentage as number) || 0,
                currency: 'INR',
            };
        case 'FLAT':
            return {
                type: 'discount_fixed',
                value: (benefitValue?.amount as number) || 0,
                currency: 'INR',
            };
        case 'FREE_MEMBERSHIP_DAYS':
            return {
                type: 'free_days',
                value: (benefitValue?.free_days as number) || 0,
            };
        case 'CONTENT': {
            // Extract delivery mediums from the benefit value
            const deliveryMediums = benefitValue?.deliveryMediums as string[];

            // Convert delivery mediums back to boolean format
            const delivery = {
                email: deliveryMediums?.includes('EMAIL') || false,
                whatsapp: deliveryMediums?.includes('WHATSAPP') || false,
            };

            return {
                type: 'bonus_content',
                content: {
                    contentType: 'pdf',
                    content: {
                        type: 'upload',
                        title: 'Bonus Content',
                        delivery,
                    },
                },
                delivery,
            };
        }
        default:
            return {
                type: 'bonus_content',
                delivery: { email: true, whatsapp: false },
            };
    }
};

// Helper function to convert API response to UnifiedReferralSettings format
export const convertFromApiFormat = (
    apiResponse: ReferralOptionResponse
): UnifiedReferralSettings => {
    try {
        const referrerDiscountData = JSON.parse(apiResponse.referrer_discount_json);
        const refereeDiscountData = JSON.parse(apiResponse.referee_discount_json);

        // Handle referee reward
        const refereeReward = convertBenefitFormatToRefereeReward(refereeDiscountData);

        // Handle referrer rewards - check if it's new format or old format
        let referrerRewards: ReferrerTier[] = [];

        // Check if referrerDiscountData exists and has the expected structure
        if (referrerDiscountData && typeof referrerDiscountData === 'object') {
            if (referrerDiscountData.benefitValue?.referralBenefits) {
                // New format
                referrerRewards = referrerDiscountData.benefitValue.referralBenefits.map(
                    (benefit: Record<string, unknown>, index: number) => {
                        const reward = convertBenefitFormatToReferrerReward({
                            benefitType: referrerDiscountData.benefitType || 'CONTENT',
                            benefitValue: benefit,
                        });

                        return {
                            id: `${apiResponse.id}_${(benefit.tierName as string) || index}`,
                            tierName: (benefit.tierName as string) || `Tier ${index + 1}`,
                            referralCount:
                                ((benefit.referralRange as Record<string, unknown>)
                                    ?.min as number) || 1,
                            reward,
                        };
                    }
                );
            } else if (referrerDiscountData.rewards) {
                // Old format - fallback
                referrerRewards = referrerDiscountData.rewards.map((reward: ApiRewardFormat) => ({
                    id: `${apiResponse.id}_${reward.tier_name}`,
                    tierName: reward.tier_name,
                    referralCount: reward.referral_count,
                    reward: {
                        type: reward.reward.type,
                        value: reward.reward.value,
                        currency: reward.reward.currency,
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
                }));
            }
        }

        return {
            id: apiResponse.id,
            label: apiResponse.name,
            isDefault: apiResponse.tag === 'DEFAULT',
            payoutVestingDays: apiResponse.referrer_vesting_days,
            allowCombineOffers: true, // Default value, adjust as needed
            refereeReward,
            referrerRewards,
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
