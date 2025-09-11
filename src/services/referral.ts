import authenticatedAxiosInstance from '@/lib/auth/axiosInstance';
import {
    UnifiedReferralSettings,
    ApiBenefit,
    ContentBenefitValue,
    PercentageDiscountBenefitValue,
    FlatDiscountBenefitValue,
    RefereeReward,
    ReferrerReward,
} from '@/types/referral';
import { REFERRAL_API_BASE, REFERRAL_DELETE } from '@/constants/urls';
import { getInstituteId } from '@/constants/helper';

// API endpoints

/**
 * JSON Structure Examples:
 *
 * referee_discount_json:
 * {
 *   "benefitType": "PERCENTAGE_DISCOUNT",
 *   "benefitValue": {
 *     "percentage": 20.0,
 *     "maxDiscountAmount": 100.0,
 *     "applyMaximumDiscountAmount": true
 *   }
 * }
 *
 * referrer_discount_json:
 * {
 *   "benefitType": "CONTENT",
 *   "benefitValue": {
 *     "referralBenefits": [
 *       {
 *         "referralRange": { "min": 1, "max": 1 },
 *         "tierName": "First Referral",
 *         "benefitType": "CONTENT",
 *         "benefitValue": {
 *           "referralBenefits": [
 *             {
 *               "referralRange": { "min": 1, "max": 1 },
 *               "benefits": [
 *                 {
 *                   "deliveryMediums": ["EMAIL", "WHATSAPP"],
 *                   "templateId": "referrer_content_v1",
 *                   "subject": "Welcome Bonus",
 *                   "body": "Thank you for your referral!",
 *                   "fileIds": ["file-id-123"]
 *                 }
 *               ]
 *             }
 *           ]
 *         },
 *         "benefits": [
 *           {
 *             "deliveryMediums": ["EMAIL", "WHATSAPP"],
 *             "templateId": "referrer_content_v1",
 *             "subject": "Welcome Bonus",
 *             "body": "Thank you for your referral!",
 *             "fileIds": ["file-id-123"]
 *           }
 *         ]
 *       },
 *       {
 *         "referralRange": { "min": 5, "max": 5 },
 *         "tierName": "Gold Tier",
 *         "benefitType": "FLAT",
 *         "benefitValue": {
 *           "amount": 500.0
 *         },
 *         "benefits": [
 *           {
 *             "deliveryMediums": ["EMAIL", "WHATSAPP"],
 *             "templateId": "referrer_reward_v1",
 *             "subject": "Gold Tier Reward",
 *             "body": "Reward for Gold Tier",
 *             "fileIds": []
 *           }
 *         ]
 *       }
 *     ]
 *   }
 * }
 */

// Types for API requests and responses
export interface ReferralOptionRequest {
    name: string;
    status: string;
    source: string; // "INSTITUTE"
    source_id: string; // institute_id
    referrer_discount_json: string; // JSON string containing ApiBenefit
    referee_discount_json: string; // JSON string containing ApiBenefit
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
    referrer_discount_json: string; // JSON string containing ApiBenefit
    referee_discount_json: string; // JSON string containing ApiBenefit
    referrer_vesting_days: number;
    tag: string | null;
    description: string;
    created_at?: string;
    updated_at?: string;
}

// Helper functions to convert UI rewards to API benefits
const convertRefereeRewardToBenefit = (reward: RefereeReward): ApiBenefit => {
    switch (reward.type) {
        case 'discount_percentage':
            return {
                benefitType: 'PERCENTAGE_DISCOUNT',
                benefitValue: {
                    percentage: reward.value || 0,
                    maxDiscountAmount: 100, // Default max discount
                    applyMaximumDiscountAmount: true,
                } as PercentageDiscountBenefitValue,
            };
        case 'discount_fixed':
            return {
                benefitType: 'FLAT',
                benefitValue: {
                    amount: reward.value || 0,
                } as FlatDiscountBenefitValue,
            };
        case 'bonus_content':
            return {
                benefitType: 'CONTENT',
                benefitValue: {
                    referralBenefits: [
                        {
                            referralRange: { min: 1, max: 1 },
                            benefits: [
                                {
                                    deliveryMediums: [
                                        ...(reward.delivery?.email ? ['EMAIL'] : []),
                                        ...(reward.delivery?.whatsapp ? ['WHATSAPP'] : []),
                                    ],
                                    templateId: 'referee_content_v1',
                                    subject: reward.content?.content?.title || null,
                                    body: reward.content?.content?.description || null,
                                    fileIds: reward.content?.content?.file?.name
                                        ? [reward.content.content.file.name] // Use file name or ID
                                        : reward.content?.content?.url
                                          ? [reward.content.content.url] // Use URL as fallback
                                          : [],
                                },
                            ],
                        },
                    ],
                } as ContentBenefitValue,
            };
        default:
            return {
                benefitType: 'FLAT',
                benefitValue: { amount: 0 } as FlatDiscountBenefitValue,
            };
    }
};

const convertReferrerRewardToBenefit = (reward: ReferrerReward): ApiBenefit => {
    switch (reward.type) {
        case 'discount_percentage':
            return {
                benefitType: 'PERCENTAGE_DISCOUNT',
                benefitValue: {
                    percentage: reward.value || 0,
                    maxDiscountAmount: 100, // Default max discount
                    applyMaximumDiscountAmount: true,
                } as PercentageDiscountBenefitValue,
            };
        case 'discount_fixed':
            return {
                benefitType: 'FLAT',
                benefitValue: {
                    amount: reward.value || 0,
                } as FlatDiscountBenefitValue,
            };
        case 'bonus_content':
            return {
                benefitType: 'CONTENT',
                benefitValue: {
                    referralBenefits: [
                        {
                            referralRange: { min: 1, max: 10 }, // Adjust based on tier
                            benefits: [
                                {
                                    deliveryMediums: [
                                        ...(reward.delivery?.email ? ['EMAIL'] : []),
                                        ...(reward.delivery?.whatsapp ? ['WHATSAPP'] : []),
                                    ],
                                    templateId: 'referrer_content_v1',
                                    subject: reward.content?.content?.title || null,
                                    body: reward.content?.content?.description || null,
                                    fileIds: reward.content?.content?.file?.name
                                        ? [reward.content.content.file.name] // Use file name or ID
                                        : reward.content?.content?.url
                                          ? [reward.content.content.url] // Use URL as fallback
                                          : [],
                                },
                            ],
                        },
                    ],
                } as ContentBenefitValue,
            };
        default:
            return {
                benefitType: 'FLAT',
                benefitValue: { amount: 0 } as FlatDiscountBenefitValue,
            };
    }
};

// Helper functions to convert API benefits back to UI rewards
const convertBenefitToRefereeReward = (benefit: ApiBenefit): RefereeReward => {
    switch (benefit.benefitType) {
        case 'PERCENTAGE_DISCOUNT': {
            const percentageValue = benefit.benefitValue as PercentageDiscountBenefitValue;
            return {
                type: 'discount_percentage',
                value: percentageValue.percentage,
                description: `${percentageValue.percentage}% discount`,
            };
        }
        case 'FLAT': {
            const flatValue = benefit.benefitValue as FlatDiscountBenefitValue;
            return {
                type: 'discount_fixed',
                value: flatValue.amount,
                description: `₹${flatValue.amount} flat discount`,
            };
        }
        case 'CONTENT': {
            const contentValue = benefit.benefitValue as ContentBenefitValue;
            const firstBenefit = contentValue.referralBenefits[0]?.benefits[0];
            return {
                type: 'bonus_content',
                description: firstBenefit?.body || 'Bonus content reward',
                delivery: {
                    email: firstBenefit?.deliveryMediums.includes('EMAIL') || false,
                    whatsapp: firstBenefit?.deliveryMediums.includes('WHATSAPP') || false,
                },
                content: firstBenefit?.fileIds?.length
                    ? {
                          contentType: 'pdf' as const,
                          content: {
                              type: 'upload' as const,
                              title: firstBenefit.subject || 'Bonus Content',
                              description: firstBenefit.body || undefined,
                              url: firstBenefit.fileIds[0], // Use first fileId as URL reference
                              delivery: {
                                  email: firstBenefit.deliveryMediums.includes('EMAIL'),
                                  whatsapp: firstBenefit.deliveryMediums.includes('WHATSAPP'),
                              },
                          },
                      }
                    : undefined,
            };
        }
        default:
            return {
                type: 'discount_fixed',
                value: 0,
                description: 'No reward',
            };
    }
};

const convertBenefitToReferrerReward = (benefit: ApiBenefit): ReferrerReward => {
    switch (benefit.benefitType) {
        case 'PERCENTAGE_DISCOUNT': {
            const percentageValue = benefit.benefitValue as PercentageDiscountBenefitValue;
            return {
                type: 'discount_percentage',
                value: percentageValue.percentage,
                description: `${percentageValue.percentage}% discount`,
            };
        }
        case 'FLAT': {
            const flatValue = benefit.benefitValue as FlatDiscountBenefitValue;
            return {
                type: 'discount_fixed',
                value: flatValue.amount,
                description: `₹${flatValue.amount} flat discount`,
            };
        }
        case 'CONTENT': {
            const contentValue = benefit.benefitValue as ContentBenefitValue;
            const firstBenefit = contentValue.referralBenefits[0]?.benefits[0];
            return {
                type: 'bonus_content',
                description: firstBenefit?.body || 'Bonus content reward',
                delivery: {
                    email: firstBenefit?.deliveryMediums.includes('EMAIL') || false,
                    whatsapp: firstBenefit?.deliveryMediums.includes('WHATSAPP') || false,
                },
                content: firstBenefit?.fileIds?.length
                    ? {
                          contentType: 'pdf' as const,
                          content: {
                              type: 'upload' as const,
                              title: firstBenefit.subject || 'Bonus Content',
                              description: firstBenefit.body || undefined,
                              url: firstBenefit.fileIds[0], // Use first fileId as URL reference
                              delivery: {
                                  email: firstBenefit.deliveryMediums.includes('EMAIL'),
                                  whatsapp: firstBenefit.deliveryMediums.includes('WHATSAPP'),
                              },
                          },
                      }
                    : undefined,
            };
        }
        default:
            return {
                type: 'discount_fixed',
                value: 0,
                description: 'No reward',
            };
    }
};

// Helper function to convert UnifiedReferralSettings to API format
export const convertToApiFormat = (settings: UnifiedReferralSettings): ReferralOptionRequest => {
    const instituteId = getInstituteId();

    // Validate required fields
    if (!settings.label || !settings.refereeReward || !settings.referrerRewards) {
        throw new Error('Missing required fields: label, refereeReward, or referrerRewards');
    }

    // Convert referrer rewards to new benefit format with tier data embedded
    const referrerDiscountJson = JSON.stringify({
        benefitType: 'CONTENT', // Default to CONTENT as it can hold multiple tiers
        benefitValue: {
            referralBenefits: settings.referrerRewards.map((tier) => {
                const tierBenefit = convertReferrerRewardToBenefit(tier.reward);
                return {
                    referralRange: {
                        min: tier.referralCount,
                        max: tier.referralCount,
                    },
                    tierName: tier.tierName,
                    benefitType: tierBenefit.benefitType,
                    benefitValue: tierBenefit.benefitValue,
                    benefits:
                        tierBenefit.benefitType === 'CONTENT'
                            ? (
                                  tierBenefit.benefitValue as ContentBenefitValue
                              ).referralBenefits[0]?.benefits?.map((benefit) => ({
                                  ...benefit,
                                  deliveryMediums: [
                                      ...(tier.reward.delivery?.email ? ['EMAIL'] : []),
                                      ...(tier.reward.delivery?.whatsapp ? ['WHATSAPP'] : []),
                                  ],
                              })) || []
                            : [
                                  {
                                      deliveryMediums: [
                                          ...(tier.reward.delivery?.email ? ['EMAIL'] : []),
                                          ...(tier.reward.delivery?.whatsapp ? ['WHATSAPP'] : []),
                                      ],
                                      templateId: 'referrer_reward_v1',
                                      subject: `${tier.tierName} Reward`,
                                      body: `Reward for ${tier.tierName}`,
                                      fileIds: [],
                                  },
                              ],
                };
            }),
        },
    });

    // Convert referee reward to new benefit format
    const refereeDiscountJson = JSON.stringify(
        convertRefereeRewardToBenefit(settings.refereeReward)
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

// Helper function to convert API response to UnifiedReferralSettings format
export const convertFromApiFormat = (
    apiResponse: ReferralOptionResponse
): UnifiedReferralSettings => {
    try {
        const referrerDiscountData = JSON.parse(apiResponse.referrer_discount_json);
        const refereeDiscountData = JSON.parse(apiResponse.referee_discount_json) as ApiBenefit;

        // Handle new referrer discount JSON format (same structure as referee but with tier data)
        let referrerRewards;
        if (
            referrerDiscountData.benefitType &&
            referrerDiscountData.benefitValue?.referralBenefits
        ) {
            // New format matching referee structure with embedded tier data
            referrerRewards = referrerDiscountData.benefitValue.referralBenefits.map(
                (
                    referralBenefit: {
                        tierName?: string;
                        referralRange?: { min: number; max: number };
                        benefitType: string;
                        benefitValue:
                            | ContentBenefitValue
                            | PercentageDiscountBenefitValue
                            | FlatDiscountBenefitValue;
                    },
                    index: number
                ) => ({
                    id: `${apiResponse.id}_tier${index + 1}`,
                    tierName: referralBenefit.tierName || `Tier ${index + 1}`,
                    referralCount: referralBenefit.referralRange?.min || index + 1,
                    reward: convertBenefitToReferrerReward({
                        benefitType: referralBenefit.benefitType,
                        benefitValue: referralBenefit.benefitValue,
                    } as ApiBenefit),
                })
            );
        } else if (referrerDiscountData.tiers && Array.isArray(referrerDiscountData.tiers)) {
            // Legacy format with tiers array (for backward compatibility)
            referrerRewards = referrerDiscountData.tiers.map(
                (
                    tier: ApiBenefit & { tierName?: string; referralCount?: number },
                    index: number
                ) => ({
                    id: `${apiResponse.id}_tier${index + 1}`,
                    tierName: tier.tierName || `Tier ${index + 1}`,
                    referralCount: tier.referralCount || index + 1,
                    reward: convertBenefitToReferrerReward({
                        benefitType: tier.benefitType,
                        benefitValue: tier.benefitValue,
                    } as ApiBenefit),
                })
            );
        } else {
            // Fallback for old format (single benefit)
            referrerRewards = [
                {
                    id: `${apiResponse.id}_tier1`,
                    tierName: 'Default Tier',
                    referralCount: 1,
                    reward: convertBenefitToReferrerReward(referrerDiscountData as ApiBenefit),
                },
            ];
        }

        return {
            id: apiResponse.id,
            label: apiResponse.name,
            isDefault: apiResponse.tag === 'DEFAULT',
            payoutVestingDays: apiResponse.referrer_vesting_days,
            allowCombineOffers: true, // Default value, adjust as needed
            refereeReward: convertBenefitToRefereeReward(refereeDiscountData),
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
