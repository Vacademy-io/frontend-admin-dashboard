import authenticatedAxiosInstance from '@/lib/auth/axiosInstance';
import {
    SAVE_PAYMENT_OPTION,
    GET_PAYMENT_OPTIONS,
    MAKE_DEFAULT_PAYMENT_OPTION,
} from '@/constants/urls';
import { getTokenDecodedData, getTokenFromCookie } from '@/lib/auth/sessionUtility';
import { TokenKey } from '@/constants/auth/tokens';
import {
    PaymentPlan,
    PaymentPlanType,
    PaymentPlanApi,
    PaymentOptionApi,
    PaymentPlans,
    UnifiedReferralSettings,
} from '@/types/payment';
import { DAYS_IN_MONTH } from '@/routes/settings/-constants/terms';

export interface SavePaymentOptionRequest {
    name: string;
    status: string;
    source: string;
    source_id: string;
    type: string;
    require_approval: boolean;
    payment_plans: PaymentPlanApi[];
    payment_option_metadata_json: string;
}

export interface GetPaymentOptionsRequest {
    types: string[];
    source: string;
    source_id: string;
    require_approval?: boolean;
    not_require_approval?: boolean;
}

// Get institute ID from token
const getInstituteId = (): string => {
    const accessToken = getTokenFromCookie(TokenKey.accessToken);
    const tokenData = getTokenDecodedData(accessToken);
    const instituteIds = Object.keys(tokenData?.authorities || {});

    if (instituteIds.length === 0) {
        throw new Error('No institute ID found in token');
    }

    const firstInstituteId = instituteIds[0];
    if (!firstInstituteId) {
        throw new Error('No institute ID found in token');
    }

    return firstInstituteId;
};

// Transform UnifiedReferralSettings to API format
export const transformUnifiedReferralToApiFormat = (
    settings: UnifiedReferralSettings,
    planName: string,
    planId: string
) => {
    // Transform referee reward
    const refereeDiscountData = {
        benefitType: getRefereeApiBenefitType(settings.refereeReward.type),
        benefitValue: transformRefereeRewardValueToApi(settings.refereeReward),
    };

    // Transform referrer rewards
    const referrerDiscountData = {
        benefitType: 'CONTENT',
        benefitValue: {
            referralBenefits: settings.referrerRewards.map((tier) => ({
                referralRange: {
                    min: tier.referralCount,
                    max: tier.referralCount,
                },
                tierName: tier.tierName,
                benefitType: getReferrerApiBenefitType(tier.reward.type),
                benefitValue: transformReferrerRewardValueToApi(tier.reward),
                benefits: [
                    {
                        deliveryMediums: getDeliveryMediums(tier.reward.delivery),
                        templateId: getTemplateId(tier.reward.type),
                        subject: tier.tierName,
                        body: tier.reward.description,
                        fileIds: [],
                    },
                ],
            })),
        },
    };

    return {
        name: settings.label || `${planName} Referral Program`,
        status: 'ACTIVE',
        source: 'payment_plan',
        source_id: planId,
        referrer_discount_json: JSON.stringify(referrerDiscountData),
        referee_discount_json: JSON.stringify(refereeDiscountData),
        referrer_vesting_days: settings.payoutVestingDays || 7,
        tag: '',
        description: `Referral program: ${planName}`,
    };
};

// Helper functions for unified referral settings transformation
const getRefereeApiBenefitType = (type: string): string => {
    switch (type) {
        case 'discount_percentage':
            return 'PERCENTAGE_DISCOUNT';
        case 'discount_fixed':
            return 'FLAT';
        case 'bonus_content':
            return 'CONTENT';
        case 'free_days':
            return 'FREE_DAYS';
        case 'free_course':
            return 'CONTENT';
        default:
            return 'PERCENTAGE_DISCOUNT';
    }
};

const getReferrerApiBenefitType = (type: string): string => {
    switch (type) {
        case 'discount_percentage':
            return 'PERCENTAGE_DISCOUNT';
        case 'discount_fixed':
            return 'FLAT';
        case 'bonus_content':
            return 'CONTENT';
        case 'free_days':
            return 'FREE_DAYS';
        case 'points_system':
            return 'CONTENT';
        case 'free_course':
            return 'CONTENT';
        default:
            return 'CONTENT';
    }
};

const transformRefereeRewardValueToApi = (reward: UnifiedReferralSettings['refereeReward']) => {
    switch (reward.type) {
        case 'discount_percentage':
            return {
                percentage: reward.value || 10,
                maxDiscountAmount: 100,
                applyMaximumDiscountAmount: true,
            };
        case 'discount_fixed':
            return {
                discountAmount: reward.value || 0,
                currency: reward.currency || 'INR',
            };
        case 'free_days':
            return {
                days: reward.value || 7,
            };
        case 'bonus_content':
        case 'free_course':
            return {
                contentType: reward.content?.contentType || 'pdf',
                title: reward.content?.content.title || '',
                deliveryMethods: getDeliveryMediums(reward.delivery),
            };
        default:
            return {};
    }
};

const transformReferrerRewardValueToApi = (
    reward: UnifiedReferralSettings['referrerRewards'][0]['reward']
) => {
    switch (reward.type) {
        case 'discount_percentage':
            return {
                percentage: reward.value || 10,
                maxDiscountAmount: 100,
                applyMaximumDiscountAmount: true,
            };
        case 'discount_fixed':
            return {
                discountAmount: reward.value || 0,
                currency: reward.currency || 'INR',
            };
        case 'free_days':
            return {
                days: reward.value || 7,
            };
        case 'points_system':
            return {
                pointsPerReferral: reward.pointsPerReferral || 10,
                pointsToReward: reward.pointsToReward || 100,
                rewardType: reward.pointsRewardType || 'discount_percentage',
                rewardValue: reward.pointsRewardValue || 10,
            };
        case 'bonus_content':
        case 'free_course':
            return {
                contentType: reward.content?.contentType || 'pdf',
                title: reward.content?.content.title || '',
                deliveryMethods: getDeliveryMediums(reward.delivery),
            };
        default:
            return {};
    }
};

const getDeliveryMediums = (delivery?: { email: boolean; whatsapp: boolean }): string[] => {
    if (!delivery) return ['EMAIL'];
    const mediums: string[] = [];
    if (delivery.email) mediums.push('EMAIL');
    if (delivery.whatsapp) mediums.push('WHATSAPP');
    return mediums.length > 0 ? mediums : ['EMAIL'];
};

const getTemplateId = (rewardType: string): string => {
    switch (rewardType) {
        case 'bonus_content':
            return 'referrer_content_v1';
        case 'free_course':
            return 'free_course_v1';
        case 'points_system':
            return 'points_reward_v1';
        default:
            return 'default_v1';
    }
};

// Save payment option
export const savePaymentOption = async (
    paymentOption: SavePaymentOptionRequest
): Promise<PaymentOptionApi> => {
    try {
        const instituteId = getInstituteId();

        const response = await authenticatedAxiosInstance.post(SAVE_PAYMENT_OPTION, paymentOption, {
            params: { instituteId },
        });

        return response.data;
    } catch (error) {
        console.error('Error saving payment option:', error);
        throw error;
    }
};

// Get payment options
export const getPaymentOptions = async (
    request: GetPaymentOptionsRequest
): Promise<PaymentOptionApi[]> => {
    try {
        const instituteId = getInstituteId();

        const response = await authenticatedAxiosInstance.post(GET_PAYMENT_OPTIONS, request, {
            params: { instituteId },
        });

        return response.data;
    } catch (error) {
        console.error('Error getting payment options:', error);
        throw error;
    }
};

// Helper function to transform local payment plan format to API format
// Helper function to convert local referral reward to API benefit format
const convertRewardToBenefit = (reward: {
    type: string;
    value?: number;
    currency?: string;
    content?: {
        contentType?: string;
        content?: {
            type?: string;
            title?: string;
            description?: string;
            file?: File;
        };
    };
    delivery?: { email?: boolean; whatsapp?: boolean };
    description?: string;
    maxDiscountAmount?: number;
    applyMaximumDiscountAmount?: boolean;
}) => {
    if (!reward) return null;

    switch (reward.type) {
        case 'discount_percentage':
            return {
                benefitType: 'PERCENTAGE_DISCOUNT',
                benefitValue: {
                    percentage: reward.value || 10,
                    maxDiscountAmount: reward.maxDiscountAmount || 100,
                    applyMaximumDiscountAmount: reward.applyMaximumDiscountAmount !== false,
                },
            };

        case 'discount_fixed':
            return {
                benefitType: 'FLAT',
                benefitValue: {
                    amount: reward.value || 50,
                },
            };

        case 'bonus_content':
        case 'free_course':
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
                                    templateId:
                                        reward.type === 'bonus_content'
                                            ? 'referee_content_v1'
                                            : 'referee_course_v1',
                                    subject:
                                        reward.content?.content?.title ||
                                        reward.description ||
                                        'Referral Benefit',
                                    body: reward.content?.content?.description || null,
                                    fileIds: reward.content?.content?.file ? ['temp_file_id'] : [],
                                },
                            ],
                        },
                    ],
                },
            };

        case 'free_days':
            return {
                benefitType: 'FREE_DAYS',
                benefitValue: {
                    days: reward.value || 7,
                },
            };

        default:
            return {
                benefitType: 'PERCENTAGE_DISCOUNT',
                benefitValue: {
                    percentage: 10,
                    maxDiscountAmount: 100,
                    applyMaximumDiscountAmount: true,
                },
            };
    }
};

export const transformLocalPlanToApiFormat = (plan: PaymentPlan): PaymentPlanApi => {
    const config = plan.config || {};

    return {
        id: plan.id,
        name: plan.name,
        description: config.description || '',
        type: plan.type,
        actual_price: config.actualPrice || 0,
        elevated_price: config.elevatedPrice || 0,
        currency: plan.currency,
        status: 'ACTIVE',
        validity_in_days: plan.validityDays || 30,
        tag: plan.tag,
        feature_json: JSON.stringify(plan.features || []),
        payment_option_metadata_json: JSON.stringify(config),
        // Handle both legacy and new referral formats
        ...(plan.unifiedReferralSettings && {
            referral_option: transformUnifiedReferralToApiFormat(
                plan.unifiedReferralSettings,
                plan.name,
                plan.id
            ),
        }),
        ...(plan.referralOption &&
            !plan.unifiedReferralSettings && {
                referral_option: {
                    name: `${plan.name} Referral`,
                    status: 'ACTIVE',
                    source: 'payment_plan',
                    source_id: plan.id,
                    tag: '',
                    description: `Referral program: ${plan.name}`,
                    referrer_vesting_days: plan.referralOption.vestingDays || 7,

                    // Referee discount - what new users get when they use a referral code
                    referee_discount_json: JSON.stringify(
                        plan.referralOption.includeRefereeReward &&
                            plan.referralOption.refereeReward
                            ? convertRewardToBenefit(plan.referralOption.refereeReward)
                            : {
                                  benefitType: 'PERCENTAGE_DISCOUNT',
                                  benefitValue: {
                                      percentage: 10,
                                      maxDiscountAmount: 100,
                                      applyMaximumDiscountAmount: true,
                                  },
                              }
                    ),

                    // Referrer discount - tiered benefits for referrers based on referral count
                    referrer_discount_json: JSON.stringify({
                        benefitType: 'CONTENT',
                        benefitValue: {
                            referralBenefits: (plan.referralOption.referrerRewards || []).map(
                                (tier) => ({
                                    referralRange: {
                                        min: tier.referralCount,
                                        max: tier.referralCount,
                                    },
                                    tierName: tier.tierName,
                                    ...convertRewardToBenefit(tier.reward),
                                    benefits: [
                                        {
                                            deliveryMediums: [
                                                ...(tier.reward.delivery?.email ? ['EMAIL'] : []),
                                                ...(tier.reward.delivery?.whatsapp
                                                    ? ['WHATSAPP']
                                                    : []),
                                            ],
                                            templateId: 'referrer_content_v1',
                                            subject:
                                                tier.reward.content?.title ||
                                                tier.reward.description ||
                                                tier.tierName,
                                            body: tier.reward.content?.description || null,
                                            fileIds: tier.reward.content?.file
                                                ? ['temp_file_id']
                                                : [],
                                        },
                                    ],
                                })
                            ),
                        },
                    }),
                },
            }),
    };
};

// Helper function to transform API payment plan format to local format
// Helper function to convert API benefit format to local referral reward
const convertBenefitToReward = (benefit: {
    benefitType: string;
    benefitValue?: {
        percentage?: number;
        maxDiscountAmount?: number;
        applyMaximumDiscountAmount?: boolean;
        amount?: number;
        days?: number;
        referralBenefits?: Array<{
            benefits?: Array<{
                subject?: string;
                body?: string;
                deliveryMediums?: string[];
            }>;
        }>;
    };
}) => {
    if (!benefit) return null;

    switch (benefit.benefitType) {
        case 'PERCENTAGE_DISCOUNT':
            return {
                type: 'discount_percentage' as const,
                value: benefit.benefitValue?.percentage || 10,
                maxDiscountAmount: benefit.benefitValue?.maxDiscountAmount || 100,
                applyMaximumDiscountAmount:
                    benefit.benefitValue?.applyMaximumDiscountAmount !== false,
                description: `${benefit.benefitValue?.percentage || 10}% discount`,
            };

        case 'FLAT':
            return {
                type: 'discount_fixed' as const,
                value: benefit.benefitValue?.amount || 50,
                currency: 'INR',
                description: `₹${benefit.benefitValue?.amount || 50} discount`,
            };

        case 'CONTENT': {
            const firstBenefit = benefit.benefitValue?.referralBenefits?.[0]?.benefits?.[0];
            return {
                type: 'bonus_content' as const,
                content: {
                    contentType: 'pdf',
                    content: {
                        type: 'upload',
                        title: firstBenefit?.subject || 'Bonus Content',
                        description: firstBenefit?.body || '',
                        delivery: {
                            email: firstBenefit?.deliveryMediums?.includes('EMAIL') || false,
                            whatsapp: firstBenefit?.deliveryMediums?.includes('WHATSAPP') || false,
                        },
                    },
                },
                delivery: {
                    email: firstBenefit?.deliveryMediums?.includes('EMAIL') || false,
                    whatsapp: firstBenefit?.deliveryMediums?.includes('WHATSAPP') || false,
                },
                description: firstBenefit?.subject || 'Bonus content reward',
            };
        }

        case 'FREE_DAYS':
            return {
                type: 'free_days' as const,
                value: benefit.benefitValue?.days || 7,
                description: `${benefit.benefitValue?.days || 7} free days`,
            };

        default:
            return {
                type: 'discount_percentage' as const,
                value: 10,
                description: '10% discount',
            };
    }
};

export const transformApiPlanToLocalFormat = (plan: PaymentPlanApi): PaymentPlan => {
    let referralOption;

    if (plan.referral_option) {
        try {
            const refereeData = JSON.parse(plan.referral_option.referee_discount_json || '{}');
            const referrerData = JSON.parse(plan.referral_option.referrer_discount_json || '{}');

            // Convert referee reward
            const refereeReward = convertBenefitToReward(refereeData);

            // Convert referrer rewards from referralBenefits
            const referrerRewards = (referrerData.benefitValue?.referralBenefits || []).map(
                (
                    tier: {
                        tierName?: string;
                        referralRange?: { min?: number; max?: number };
                        benefits?: Array<{
                            subject?: string;
                            deliveryMediums?: string[];
                        }>;
                    },
                    index: number
                ) => ({
                    id: `tier_${index}`,
                    tierName: tier.tierName || `Tier ${tier.referralRange?.min || index + 1}`,
                    referralCount: tier.referralRange?.min || index + 1,
                    reward: {
                        type: 'bonus_content' as const,
                        description: tier.tierName || 'Referrer reward',
                        content: {
                            contentType: 'pdf' as const,
                            content: {
                                type: 'upload' as const,
                                title: tier.benefits?.[0]?.subject || 'Referrer Bonus',
                                delivery: {
                                    email:
                                        tier.benefits?.[0]?.deliveryMediums?.includes('EMAIL') ||
                                        false,
                                    whatsapp:
                                        tier.benefits?.[0]?.deliveryMediums?.includes('WHATSAPP') ||
                                        false,
                                },
                            },
                        },
                        delivery: {
                            email: tier.benefits?.[0]?.deliveryMediums?.includes('EMAIL') || false,
                            whatsapp:
                                tier.benefits?.[0]?.deliveryMediums?.includes('WHATSAPP') || false,
                        },
                    },
                })
            );

            referralOption = {
                includeRefereeReward: !!refereeReward,
                includeReferrerReward: referrerRewards.length > 0,
                refereeReward: refereeReward || undefined,
                referrerRewards,
                vestingDays: plan.referral_option.referrer_vesting_days || 7,
                allowCombineOffers: true,
            };
        } catch (error) {
            console.error('Error parsing referral option JSON:', error);
        }
    }

    return {
        id: plan.id || '',
        name: plan.name,
        type: plan.type,
        tag: plan.tag,
        currency: plan.currency,
        isDefault: plan.tag === 'DEFAULT',
        config: {
            actualPrice: plan.actual_price,
            elevatedPrice: plan.elevated_price,
            description: plan.description,
        },
        features: JSON.parse(plan.feature_json || '[]'),
        validityDays: plan.validity_in_days,
        requireApproval: false,
        apiReferralOption: plan.referral_option,
        referralOption,
    };
};

export const transformLocalPlanToApiFormatArray = (localPlan: PaymentPlan): PaymentPlanApi[] => {
    if (
        localPlan.type === PaymentPlans.SUBSCRIPTION &&
        localPlan.config?.subscription?.customIntervals
    ) {
        const planDiscounts = localPlan.config?.planDiscounts || {};
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return localPlan.config.subscription.customIntervals.map((interval: any, idx: number) => {
            const originalPrice = parseFloat(String(interval.price || '0'));
            let discountedPrice = originalPrice;
            const discount = planDiscounts[`interval_${idx}`];
            if (discount && discount.type !== 'none' && discount.amount) {
                if (discount.type === 'percentage') {
                    discountedPrice = originalPrice * (1 - parseFloat(discount.amount) / 100);
                } else if (discount.type === 'fixed') {
                    discountedPrice = originalPrice - parseFloat(discount.amount);
                }
                if (discountedPrice < 0) discountedPrice = 0;
            }
            // Calculate validity_in_days based on unit and value
            const unit =
                localPlan.config?.unit ||
                localPlan.config?.subscription?.unit ||
                interval.unit ||
                'months';
            const value = interval.value || 1;
            let validity_in_days: number;

            if (unit === 'days') {
                validity_in_days = value; // Direct conversion
            } else if (unit === 'months') {
                validity_in_days = value * DAYS_IN_MONTH; // Convert months to days (30 days per month)
            } else {
                validity_in_days = value; // Fallback
            }

            return {
                name: interval.title || '',
                status: 'ACTIVE',
                validity_in_days,
                actual_price: discountedPrice,
                elevated_price: originalPrice,
                currency: localPlan.currency || 'GBP',
                description: localPlan.name || '',
                tag: localPlan.tag || 'free',
                type: (localPlan.type?.toUpperCase() as PaymentPlanType) || 'SUBSCRIPTION',
                feature_json: JSON.stringify(interval.features || localPlan.features || []),
                // Handle both legacy and new referral formats
                referral_option: localPlan.unifiedReferralSettings
                    ? transformUnifiedReferralToApiFormat(
                          localPlan.unifiedReferralSettings,
                          localPlan.name,
                          localPlan.id
                      )
                    : localPlan.apiReferralOption,
            };
        });
    }
    if (localPlan.type === PaymentPlans.UPFRONT && localPlan.config?.upfront?.fullPrice) {
        const originalPrice = parseFloat(localPlan.config.upfront.fullPrice);
        let discountedPrice = originalPrice;
        const discount = localPlan.config?.planDiscounts?.upfront;
        if (discount && discount.type !== 'none' && discount.amount) {
            if (discount.type === 'percentage') {
                discountedPrice = originalPrice * (1 - parseFloat(discount.amount) / 100);
            } else if (discount.type === 'fixed') {
                discountedPrice = originalPrice - parseFloat(discount.amount);
            }
            if (discountedPrice < 0) discountedPrice = 0;
        }
        return [
            {
                name: localPlan.name,
                status: 'ACTIVE',
                validity_in_days: 365,
                actual_price: discountedPrice,
                elevated_price: originalPrice,
                currency: localPlan.currency || 'GBP',
                description: localPlan.name || '',
                tag: localPlan.tag || 'free',
                type: (localPlan.type?.toUpperCase() as PaymentPlanType) || 'UPFRONT',
                feature_json: JSON.stringify(localPlan.features || []),
                // Handle both legacy and new referral formats
                referral_option: localPlan.unifiedReferralSettings
                    ? transformUnifiedReferralToApiFormat(
                          localPlan.unifiedReferralSettings,
                          localPlan.name,
                          localPlan.id
                      )
                    : localPlan.apiReferralOption,
            },
        ];
    }
    // For other types, just use the existing function
    return [transformLocalPlanToApiFormat(localPlan)];
};

export const makeDefaultPaymentOption = async ({
    source,
    sourceId,
    paymentOptionId,
}: {
    source: string;
    sourceId: string;
    paymentOptionId: string;
}) => {
    try {
        const response = await authenticatedAxiosInstance.post(
            MAKE_DEFAULT_PAYMENT_OPTION,
            {},
            {
                params: {
                    source,
                    sourceId,
                    paymentOptionId,
                },
            }
        );
        return response.data;
    } catch (error) {
        console.error('Error making default payment option:', error);
        throw error;
    }
};
