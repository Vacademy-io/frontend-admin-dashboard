import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { CreditCard } from 'lucide-react';
import { SubscriptionPlanPreview } from '../SubscriptionPlanPreview';
import { DonationPlanPreview } from '../DonationPlanPreview';
import { PaymentPlanEditor } from '../PaymentPlanEditor';
import { currencyOptions } from '../../../-constants/payments';
import {
    PaymentPlan,
    PaymentPlans,
    PaymentPlanType,
    ReferralOption,
    UnifiedReferralSettings,
} from '@/types/payment';
import {
    getTotalSteps,
    getRequiredApprovalStatus,
    FreePlanInfo,
    getCurrencySymbol,
} from '../utils/utils';
import { PlanTypeSelection } from './PlanTypeSelection';
import { ApprovalToggle } from './ApprovalToggle';
import { DonationPlanConfiguration } from './DonationPlanConfiguration';
import { SubscriptionPlanConfiguration } from './SubscriptionPlanConfiguration';
import { UpfrontPlanConfiguration } from './UpfrontPlanConfiguration';
import { PlanDiscountsConfiguration } from './PlanDiscountsConfiguration';
import { PlanNavigation } from './PlanNavigation';
import { ReferralToggle } from './ReferralToggle';
import { DetailedReferralConfiguration } from './DetailedReferralConfiguration';
import { DAYS_IN_MONTH } from '@/routes/settings/-constants/terms';

// Helper functions for API transformation
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

const transformRefereeRewardToApi = (reward: UnifiedReferralSettings['refereeReward']) => {
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

const transformReferrerRewardToApi = (
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

const getTemplateId = (reward: UnifiedReferralSettings['referrerRewards'][0]['reward']): string => {
    switch (reward.type) {
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

interface CustomInterval {
    value: number | string;
    unit: 'days' | 'months';
    price: number | string;
    features?: string[];
    newFeature?: string;
    title?: string;
}

interface PaymentPlanCreatorProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (plan: PaymentPlan) => void;
    editingPlan?: PaymentPlan | null;
    featuresGlobal: string[];
    setFeaturesGlobal: (features: string[]) => void;
    defaultCurrency?: string;
    isSaving?: boolean;
    existingFreePlans?: FreePlanInfo[];
    requireApproval?: boolean;
    setRequireApproval?: (value: boolean) => void;
}

export const PaymentPlanCreator: React.FC<PaymentPlanCreatorProps> = ({
    isOpen,
    onClose,
    onSave,
    editingPlan,
    featuresGlobal,
    setFeaturesGlobal,
    defaultCurrency = 'INR',
    isSaving = false,
    existingFreePlans = [],
    requireApproval = false,
    setRequireApproval,
}) => {
    const [currentStep, setCurrentStep] = useState(1);
    const [planData, setPlanData] = useState<Partial<PaymentPlan>>({});
    const [showPreview, setShowPreview] = useState(false);
    const [selectedUnit, setSelectedUnit] = useState<'days' | 'months'>('months');

    // Detailed referral settings state (inline)
    const [includeRefereeReward, setIncludeRefereeReward] = useState(false);
    const [includeReferrerReward, setIncludeReferrerReward] = useState(false);
    const [refereeReward, setRefereeReward] = useState<UnifiedReferralSettings['refereeReward']>({
        type: 'discount_percentage',
        value: 10,
        currency: 'INR',
        description: '',
    });
    const [referrerRewards, setReferrerRewards] = useState<
        UnifiedReferralSettings['referrerRewards']
    >([]);
    const [vestingDays, setVestingDays] = useState(7);
    const [allowCombineOffers, setAllowCombineOffers] = useState(true);

    const previewRef = useRef<HTMLDivElement>(null);

    // Initialize form data when creating new plan
    useEffect(() => {
        if (isOpen && !editingPlan) {
            setPlanData({
                name: '',
                type: PaymentPlans.SUBSCRIPTION,
                currency: defaultCurrency,
                isDefault: false,
                features: featuresGlobal,
                requireApproval: false,
                config: {
                    subscription: {
                        customIntervals: [] as CustomInterval[],
                    },
                    upfront: {
                        fullPrice: '',
                    },
                    donation: {
                        suggestedAmounts: '',
                        allowCustomAmount: true,
                        minimumAmount: '',
                        newAmount: '',
                    },
                    free: {
                        validityDays: DAYS_IN_MONTH,
                    },
                    planDiscounts: {},
                },
            });
            setCurrentStep(1);
            setShowPreview(false);
            // Reset referral state
            setIncludeRefereeReward(false);
            setIncludeReferrerReward(false);
            setRefereeReward({
                type: 'discount_percentage',
                value: 10,
                currency: 'INR',
                description: '',
            });
            setReferrerRewards([]);
            setVestingDays(7);
            setAllowCombineOffers(true);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen, editingPlan, defaultCurrency]);

    // Auto-set approval status based on free plan restrictions
    useEffect(() => {
        if (planData.type === PaymentPlans.FREE && setRequireApproval) {
            const requiredStatus = getRequiredApprovalStatus(existingFreePlans);
            setRequireApproval(requiredStatus);
        }
    }, [planData.type, existingFreePlans, setRequireApproval]);

    // Helper function to convert unit and value to days
    const convertToDays = (value: number, unit: 'days' | 'months'): number => {
        if (unit === 'days') {
            return value;
        } else if (unit === 'months') {
            return value * DAYS_IN_MONTH;
        }
        return value;
    };

    const handleSave = () => {
        if (!planData.name || !planData.type) {
            return;
        }

        // Calculate validity_in_days for subscription plans
        let validityDays: number | undefined;
        let updatedConfig = planData.config || {};

        if (planData.type === PaymentPlans.SUBSCRIPTION) {
            const intervals = planData.config?.subscription?.customIntervals || [];
            if (intervals.length > 0) {
                // Use the first interval's validity as the base
                const firstInterval = intervals[0];
                const numericValue =
                    typeof firstInterval.value === 'string'
                        ? parseFloat(firstInterval.value) || 0
                        : firstInterval.value;
                validityDays = convertToDays(numericValue, selectedUnit);

                // Add unit to the top level of config
                updatedConfig = {
                    ...updatedConfig,
                    unit: selectedUnit,
                    subscription: {
                        ...updatedConfig.subscription,
                        unit: selectedUnit,
                    },
                };
            }
        } else if (planData.type === PaymentPlans.FREE) {
            validityDays = planData.config?.free?.validityDays;
        }

        // Transform referral data to API format using detailed inline settings
        let apiReferralOption: ReferralOption | undefined;
        if (includeRefereeReward || includeReferrerReward) {
            // Create unified referral settings from inline state
            const unifiedSettings: UnifiedReferralSettings = {
                id: `referral_${Date.now()}`,
                label: `${planData.name} Referral Program`,
                isDefault: false,
                refereeReward,
                referrerRewards,
                allowCombineOffers,
                payoutVestingDays: vestingDays,
            };

            // Transform to API format
            const refereeDiscountData = {
                benefitType: getRefereeApiBenefitType(refereeReward.type),
                benefitValue: transformRefereeRewardToApi(refereeReward),
            };

            const referrerDiscountData = {
                benefitType: 'CONTENT',
                benefitValue: {
                    referralBenefits: referrerRewards.map((tier) => ({
                        referralRange: {
                            min: tier.referralCount,
                            max: tier.referralCount,
                        },
                        tierName: tier.tierName,
                        benefitType: getReferrerApiBenefitType(tier.reward.type),
                        benefitValue: transformReferrerRewardToApi(tier.reward),
                        benefits: [
                            {
                                deliveryMediums: getDeliveryMediums(tier.reward.delivery),
                                templateId: getTemplateId(tier.reward),
                                subject: tier.tierName,
                                body: tier.reward.description,
                                fileIds: [],
                            },
                        ],
                    })),
                },
            };

            apiReferralOption = {
                name: unifiedSettings.label,
                status: 'ACTIVE',
                source: 'payment_plan',
                source_id: `plan_${Date.now()}`,
                referrer_discount_json: JSON.stringify(referrerDiscountData),
                referee_discount_json: JSON.stringify(refereeDiscountData),
                referrer_vesting_days: vestingDays,
                tag: '',
                description: `Referral program: ${planData.name}`,
            };
        }

        const newPlan: PaymentPlan = {
            id: `plan_${Date.now()}`,
            name: planData.name,
            type: planData.type.toUpperCase() as PaymentPlanType,
            tag: planData.tag || 'free',
            currency: planData.currency || 'INR',
            isDefault: planData.isDefault || false,
            config: updatedConfig,
            features: planData.features,
            validityDays,
            requireApproval: planData.requireApproval || false,
            // Enhanced referral settings from inline configuration
            unifiedReferralSettings:
                includeRefereeReward || includeReferrerReward
                    ? {
                          id: `referral_${Date.now()}`,
                          label: `${planData.name} Referral Program`,
                          isDefault: false,
                          refereeReward,
                          referrerRewards,
                          allowCombineOffers,
                          payoutVestingDays: vestingDays,
                      }
                    : undefined,
            // Add API-compatible referral option
            apiReferralOption,
        };

        // For free plans, we need to determine the approval status based on existing plans
        if (planData.type === PaymentPlans.FREE) {
            const requiredStatus = getRequiredApprovalStatus(existingFreePlans);
            newPlan.requireApproval = requiredStatus;
        }

        onSave(newPlan);
        onClose();
    };

    const updateConfig = (newConfig: Record<string, unknown>) => {
        setPlanData({
            ...planData,
            type: planData.type?.toUpperCase() as PaymentPlanType,
            config: {
                ...planData.config,
                ...newConfig,
            },
        });
    };

    const handleNext = () => {
        if (currentStep === 1 && planData.type && planData.name) {
            setCurrentStep(2);
        } else if (currentStep === 2) {
            if (planData.type === PaymentPlans.FREE || planData.type === PaymentPlans.DONATION) {
                // For FREE and DONATION plans, go directly to referral step
                setCurrentStep(3);
            } else {
                // For paid plans, go to discounts step
                setCurrentStep(3);
            }
        } else if (currentStep === 3) {
            if (planData.type === PaymentPlans.FREE || planData.type === PaymentPlans.DONATION) {
                // This is the final referral step for FREE/DONATION
                handleSave();
            } else {
                // This is discounts step for paid plans, go to referral step
                setCurrentStep(4);
            }
        } else if (currentStep === 4) {
            // This is the final referral step for paid plans
            handleSave();
        }
    };

    const handlePreviewToggle = () => {
        setShowPreview((prev) => !prev);
        setTimeout(() => {
            if (previewRef.current) {
                previewRef.current.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start',
                });
            }
        }, 100);
    };

    const handleBack = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    const renderPreview = () => {
        const hasCustomIntervals =
            planData.type === PaymentPlans.SUBSCRIPTION &&
            planData.config?.subscription?.customIntervals?.length > 0;

        if (!showPreview || !(hasCustomIntervals || planData.type === PaymentPlans.DONATION)) {
            return null;
        }

        // Convert plan discounts to coupon format for preview
        const planDiscounts = planData.config?.planDiscounts || {};
        const discountCoupons: Array<{
            id: string;
            code: string;
            name: string;
            type: 'percentage' | 'fixed';
            value: number;
            currency: string;
            isActive: boolean;
            usageLimit?: number;
            usedCount: number;
            expiryDate?: string;
            applicablePlans: string[];
        }> = [];

        // Handle plan discounts based on type
        switch (planData.type) {
            case PaymentPlans.SUBSCRIPTION:
                if (planData.config?.subscription?.customIntervals) {
                    planData.config.subscription.customIntervals.forEach(
                        (interval: CustomInterval, idx: number) => {
                            const discount = planDiscounts[`interval_${idx}`];
                            if (discount && discount.type !== 'none' && discount.amount) {
                                discountCoupons.push({
                                    id: `plan-discount-${idx}`,
                                    code: `${discount.type === 'percentage' ? 'PERCENT' : 'FLAT'}_${discount.amount}_${idx}`,
                                    name: `${discount.type === 'percentage' ? `${discount.amount}% Off` : `${getCurrencySymbol(planData.currency!)}${discount.amount} Off`} - ${interval.title || `${interval.value} ${interval.unit} Plan`}`,
                                    type: discount.type,
                                    value: parseFloat(discount.amount),
                                    currency: planData.currency || 'INR',
                                    isActive: true,
                                    usageLimit: undefined,
                                    usedCount: 0,
                                    expiryDate: undefined,
                                    applicablePlans: [`custom${idx}`],
                                });
                            }
                        }
                    );
                }
                break;
            case PaymentPlans.UPFRONT:
                if (planDiscounts.upfront && typeof planDiscounts.upfront === 'object') {
                    const discount = planDiscounts.upfront;
                    if (discount.type !== 'none' && discount.amount) {
                        discountCoupons.push({
                            id: 'plan-discount-upfront',
                            code: `${discount.type === 'percentage' ? 'PERCENT' : 'FLAT'}_${discount.amount}`,
                            name: `${discount.type === 'percentage' ? `${discount.amount}% Off` : `${getCurrencySymbol(planData.currency!)}${discount.amount} Off`}`,
                            type: discount.type,
                            value: parseFloat(discount.amount),
                            currency: planData.currency || 'INR',
                            isActive: true,
                            usageLimit: undefined,
                            usedCount: 0,
                            expiryDate: undefined,
                            applicablePlans: ['upfront'],
                        });
                    }
                }
                break;
        }

        return (
            <div ref={previewRef} className="mt-8 space-y-6">
                {planData.type === PaymentPlans.SUBSCRIPTION && hasCustomIntervals ? (
                    <SubscriptionPlanPreview
                        currency={planData.currency || 'INR'}
                        subscriptionPlans={{
                            ...(planData.type === PaymentPlans.SUBSCRIPTION &&
                                planData.config?.subscription?.customIntervals
                                    ?.map((interval: CustomInterval, idx: number) => ({
                                        [`custom${idx}`]: {
                                            enabled: true,
                                            price: interval.price || '0',
                                            interval: 'custom',
                                            title:
                                                interval.title ||
                                                `${interval.value} ${interval.unit} Plan`,
                                            features: interval.features || [],
                                            customInterval: {
                                                value: interval.value,
                                                unit: interval.unit,
                                            },
                                        },
                                    }))
                                    .reduce(
                                        (
                                            acc: Record<string, unknown>,
                                            curr: Record<string, unknown>
                                        ) => ({ ...acc, ...curr }),
                                        {}
                                    )),
                        }}
                        features={featuresGlobal}
                        discountCoupons={discountCoupons}
                        onSelectPlan={(planType) => {
                            console.log('Selected plan:', planType);
                        }}
                    />
                ) : planData.type === PaymentPlans.DONATION ? (
                    <DonationPlanPreview
                        currency={planData.currency || 'INR'}
                        suggestedAmounts={planData.config?.donation?.suggestedAmounts || ''}
                        minimumAmount={planData.config?.donation?.minimumAmount || '0'}
                        allowCustomAmount={planData.config?.donation?.allowCustomAmount !== false}
                        onSelectAmount={(amount) => {
                            console.log('Selected donation amount:', amount);
                        }}
                    />
                ) : null}
            </div>
        );
    };

    if (!isOpen) return null;

    if (editingPlan) {
        return (
            <Dialog open={isOpen} onOpenChange={onClose}>
                <DialogContent className="max-h-[90vh] min-w-[800px] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <CreditCard className="size-5" />
                            Edit Payment Plan
                        </DialogTitle>
                    </DialogHeader>
                    <PaymentPlanEditor
                        editingPlan={editingPlan}
                        featuresGlobal={featuresGlobal}
                        setFeaturesGlobal={setFeaturesGlobal}
                        onSave={onSave}
                        onCancel={onClose}
                        isSaving={isSaving}
                    />
                </DialogContent>
            </Dialog>
        );
    }

    const hasCustomIntervals =
        planData.type === PaymentPlans.SUBSCRIPTION &&
        planData.config?.subscription?.customIntervals?.length > 0;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-h-[90vh] min-w-[800px] overflow-y-auto">
                <div>
                    <div className="flex items-center justify-between">
                        <DialogTitle className="flex items-center gap-2">
                            <CreditCard className="size-5" />
                            Create Payment Plan
                        </DialogTitle>
                    </div>
                </div>

                <div className="mt-4 space-y-6">
                    {/* Step 1: Payment Type Selection */}
                    {currentStep === 1 && (
                        <PlanTypeSelection
                            planName={planData.name || ''}
                            planType={planData.type as PaymentPlanType}
                            existingFreePlans={existingFreePlans}
                            onPlanNameChange={(name) => setPlanData({ ...planData, name })}
                            onPlanTypeChange={(type) =>
                                setPlanData({ ...planData, type, config: {} })
                            }
                        />
                    )}

                    {/* Step 2: Plan Configuration */}
                    {currentStep === 2 && (
                        <div className="space-y-6">
                            {!editingPlan && (
                                <ApprovalToggle
                                    planType={planData.type as PaymentPlanType}
                                    requireApproval={requireApproval}
                                    existingFreePlans={existingFreePlans}
                                    onApprovalChange={setRequireApproval || (() => {})}
                                />
                            )}

                            {planData.type !== PaymentPlans.FREE && (
                                <div className="mb-4">
                                    <Label htmlFor="planCurrency" className="text-sm font-medium">
                                        Plan Currency
                                    </Label>
                                    <Select
                                        value={planData.currency}
                                        onValueChange={(value) =>
                                            setPlanData({ ...planData, currency: value })
                                        }
                                    >
                                        <SelectTrigger className="mt-1">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {currencyOptions.map((currency) => (
                                                <SelectItem
                                                    key={currency.code}
                                                    value={currency.code}
                                                >
                                                    {currency.symbol} {currency.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <p className="mt-1 text-xs text-gray-500">
                                        Default: {defaultCurrency} (
                                        {getCurrencySymbol(defaultCurrency)})
                                    </p>
                                </div>
                            )}

                            {planData.type === PaymentPlans.DONATION && (
                                <DonationPlanConfiguration
                                    currency={planData.currency || 'INR'}
                                    suggestedAmounts={
                                        planData.config?.donation?.suggestedAmounts || ''
                                    }
                                    minimumAmount={planData.config?.donation?.minimumAmount || ''}
                                    allowCustomAmount={
                                        planData.config?.donation?.allowCustomAmount !== false
                                    }
                                    newAmount={planData.config?.donation?.newAmount || ''}
                                    onMinimumAmountChange={(amount) =>
                                        updateConfig({
                                            donation: {
                                                ...planData.config?.donation,
                                                minimumAmount: amount,
                                            },
                                        })
                                    }
                                    onAllowCustomAmountChange={(allow) =>
                                        updateConfig({
                                            donation: {
                                                ...planData.config?.donation,
                                                allowCustomAmount: allow,
                                            },
                                        })
                                    }
                                    onNewAmountChange={(amount) =>
                                        updateConfig({
                                            donation: {
                                                ...planData.config?.donation,
                                                newAmount: amount,
                                            },
                                        })
                                    }
                                    onAddAmount={() => {
                                        const newAmount =
                                            planData.config?.donation?.newAmount?.trim();
                                        if (newAmount && !isNaN(Number(newAmount))) {
                                            const currentAmounts =
                                                planData.config?.donation?.suggestedAmounts || '';
                                            const amountsList = currentAmounts
                                                ? currentAmounts
                                                      .split(',')
                                                      .map((a: string) => a.trim())
                                                : [];

                                            if (!amountsList.includes(newAmount)) {
                                                const updatedAmounts =
                                                    amountsList.length > 0
                                                        ? `${currentAmounts}, ${newAmount}`
                                                        : newAmount;

                                                updateConfig({
                                                    donation: {
                                                        ...planData.config?.donation,
                                                        suggestedAmounts: updatedAmounts,
                                                        newAmount: '',
                                                    },
                                                });
                                            }
                                        }
                                    }}
                                    onRemoveAmount={(index) => {
                                        const amountsList =
                                            planData.config?.donation?.suggestedAmounts
                                                ?.split(',')
                                                .map((a: string) => a.trim()) || [];
                                        const updatedAmounts = amountsList
                                            .filter((_: string, i: number) => i !== index)
                                            .join(', ');

                                        updateConfig({
                                            donation: {
                                                ...planData.config?.donation,
                                                suggestedAmounts: updatedAmounts,
                                            },
                                        });
                                    }}
                                />
                            )}

                            {planData.type === PaymentPlans.SUBSCRIPTION && (
                                <SubscriptionPlanConfiguration
                                    currency={planData.currency || 'INR'}
                                    customIntervals={
                                        planData.config?.subscription?.customIntervals || []
                                    }
                                    featuresGlobal={featuresGlobal}
                                    setFeaturesGlobal={setFeaturesGlobal}
                                    selectedUnit={selectedUnit}
                                    onUnitChange={setSelectedUnit}
                                    onCustomIntervalsChange={(intervals) =>
                                        updateConfig({
                                            subscription: {
                                                ...planData.config?.subscription,
                                                customIntervals: intervals,
                                            },
                                        })
                                    }
                                />
                            )}

                            {planData.type === PaymentPlans.UPFRONT && (
                                <UpfrontPlanConfiguration
                                    currency={planData.currency || 'INR'}
                                    fullPrice={planData.config?.upfront?.fullPrice || ''}
                                    onFullPriceChange={(price) =>
                                        updateConfig({
                                            upfront: {
                                                ...planData.config?.upfront,
                                                fullPrice: price,
                                            },
                                        })
                                    }
                                />
                            )}
                        </div>
                    )}

                    {/* Step 3: Plan Discounts (for paid plans) or Referral Options (for FREE/DONATION) */}
                    {currentStep === 3 && (
                        <>
                            {planData.type !== PaymentPlans.FREE &&
                            planData.type !== PaymentPlans.DONATION ? (
                                <div className="space-y-6">
                                    <PlanDiscountsConfiguration
                                        planType={planData.type || ''}
                                        currency={planData.currency || 'INR'}
                                        customIntervals={
                                            planData.config?.subscription?.customIntervals || []
                                        }
                                        upfrontPrice={planData.config?.upfront?.fullPrice || ''}
                                        planDiscounts={planData.config?.planDiscounts || {}}
                                        onPlanDiscountsChange={(discounts) =>
                                            updateConfig({
                                                planDiscounts: discounts,
                                            })
                                        }
                                        getCurrencySymbol={getCurrencySymbol}
                                    />
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    <ReferralToggle
                                        includeRefereeReward={includeRefereeReward}
                                        includeReferrerReward={includeReferrerReward}
                                        onRefereeRewardToggle={setIncludeRefereeReward}
                                        onReferrerRewardToggle={setIncludeReferrerReward}
                                    />
                                    {(includeRefereeReward || includeReferrerReward) && (
                                        <DetailedReferralConfiguration
                                            includeRefereeReward={includeRefereeReward}
                                            includeReferrerReward={includeReferrerReward}
                                            refereeReward={refereeReward}
                                            referrerRewards={referrerRewards}
                                            vestingDays={vestingDays}
                                            allowCombineOffers={allowCombineOffers}
                                            currency={planData.currency || 'INR'}
                                            onRefereeRewardChange={setRefereeReward}
                                            onReferrerRewardsChange={setReferrerRewards}
                                            onVestingDaysChange={setVestingDays}
                                            onAllowCombineOffersChange={setAllowCombineOffers}
                                        />
                                    )}
                                </div>
                            )}
                        </>
                    )}

                    {/* Step 4: Referral Options (for paid plans only) */}
                    {currentStep === 4 && (
                        <div className="space-y-6">
                            <ReferralToggle
                                includeRefereeReward={includeRefereeReward}
                                includeReferrerReward={includeReferrerReward}
                                onRefereeRewardToggle={setIncludeRefereeReward}
                                onReferrerRewardToggle={setIncludeReferrerReward}
                            />
                            {(includeRefereeReward || includeReferrerReward) && (
                                <DetailedReferralConfiguration
                                    includeRefereeReward={includeRefereeReward}
                                    includeReferrerReward={includeReferrerReward}
                                    refereeReward={refereeReward}
                                    referrerRewards={referrerRewards}
                                    vestingDays={vestingDays}
                                    allowCombineOffers={allowCombineOffers}
                                    currency={planData.currency || 'INR'}
                                    onRefereeRewardChange={setRefereeReward}
                                    onReferrerRewardsChange={setReferrerRewards}
                                    onVestingDaysChange={setVestingDays}
                                    onAllowCombineOffersChange={setAllowCombineOffers}
                                />
                            )}
                        </div>
                    )}

                    {/* Navigation Buttons */}
                    <PlanNavigation
                        currentStep={currentStep}
                        totalSteps={getTotalSteps(planData.type || '')}
                        planType={planData.type || ''}
                        planName={planData.name || ''}
                        isSaving={isSaving}
                        showPreview={showPreview}
                        hasCustomIntervals={hasCustomIntervals}
                        onBack={handleBack}
                        onNext={handleNext}
                        onSave={handleSave}
                        onClose={onClose}
                        onPreviewToggle={handlePreviewToggle}
                    />

                    {currentStep !== 1 && renderPreview()}
                </div>
            </DialogContent>
        </Dialog>
    );
};
