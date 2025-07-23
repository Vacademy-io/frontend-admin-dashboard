import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Info, Plus, Trash2, Globe, CreditCard, Heart, DollarSign, Calendar } from 'lucide-react';
import { SubscriptionPlanPreview } from './SubscriptionPlanPreview';
import { DonationPlanPreview } from './DonationPlanPreview';

interface PaymentPlan {
    id: string;
    name: string;
    type: 'subscription' | 'upfront' | 'donation' | 'free';
    currency: string;
    isDefault: boolean;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    config: any;
    features?: string[];
    validityDays?: number;
}

interface PaymentPlanCreatorProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (plan: PaymentPlan) => void;
    editingPlan?: PaymentPlan | null;
    featuresGlobal: string[];
    setFeaturesGlobal: (features: string[]) => void;
    defaultCurrency?: string;
}

interface CustomInterval {
    value: number;
    unit: 'days' | 'months';
    price: number;
    features?: string[];
    newFeature?: string;
    title?: string;
}

const currencyOptions = [
    { code: 'USD', name: 'US Dollar', symbol: '$' },
    { code: 'EUR', name: 'Euro', symbol: '€' },
    { code: 'GBP', name: 'British Pound', symbol: '£' },
    { code: 'INR', name: 'Indian Rupee', symbol: '₹' },
    { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
    { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
];

export const PaymentPlanCreator: React.FC<PaymentPlanCreatorProps> = ({
    isOpen,
    onClose,
    onSave,
    editingPlan,
    featuresGlobal,
    setFeaturesGlobal,
    defaultCurrency = 'INR',
}) => {
    const [currentStep, setCurrentStep] = useState(1);
    const [planData, setPlanData] = useState<Partial<PaymentPlan>>({
        name: editingPlan?.name || '',
        type: editingPlan?.type || 'subscription',
        currency: editingPlan?.currency || defaultCurrency,
        isDefault: editingPlan?.isDefault || false,
        config: editingPlan?.config || {
            subscription: {
                customIntervals: [] as CustomInterval[],
            },
            upfront: {
                fullPrice: '',
            },
            donation: {
                suggestedAmounts: '',
                allowCustomAmount: true,
                minimumAmount: '0',
            },
        },
    });

    const [showPreview, setShowPreview] = useState(false);

    const getCurrencySymbol = (currencyCode: string) => {
        const currency = currencyOptions.find((c) => c.code === currencyCode);
        return currency?.symbol || '$';
    };

    const handleSave = () => {
        if (!planData.name || !planData.type) {
            return;
        }

        // Validate free plan
        if (
            planData.type === 'free' &&
            (!planData.config?.free?.validityDays || planData.config.free.validityDays <= 0)
        ) {
            return;
        }

        const newPlan: PaymentPlan = {
            id: editingPlan?.id || Date.now().toString(),
            name: planData.name,
            type: planData.type,
            currency: planData.currency || 'INR',
            isDefault: planData.isDefault || false,
            config: planData.config || {},
            validityDays:
                planData.type === 'free' ? planData.config?.free?.validityDays : undefined,
        };

        onSave(newPlan);
        onClose();
        setCurrentStep(1);
        setPlanData({
            name: '',
            type: 'subscription',
            currency: 'INR',
            isDefault: false,
            config: {},
        });
    };

    const updateConfig = (newConfig: Record<string, unknown>) => {
        setPlanData({
            ...planData,
            config: {
                ...planData.config,
                ...newConfig,
            },
        });
    };

    const handleNext = () => {
        if (currentStep === 1 && planData.type && planData.name) {
            // All plans go to step 2 for configuration
            setCurrentStep(2);
        } else if (currentStep === 2) {
            // For free and donation plans, save directly after configuration
            if (planData.type === 'free' || planData.type === 'donation') {
                handleSave();
            } else {
                setCurrentStep(3);
            }
        }
    };

    const handleBack = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    const getStepTitle = () => {
        switch (currentStep) {
            case 1:
                return 'Choose Payment Plan Type';
            case 2:
                if (planData.type === 'donation') {
                    return 'Configure Donation Settings';
                }
                if (planData.type === 'free') {
                    return 'Configure Free Plan Settings';
                }
                return 'Configure Plan Details';
            case 3:
                return 'Manage Discounts & Coupons';
            default:
                return 'Create Payment Plan';
        }
    };

    const getTotalSteps = () => {
        if (planData.type === 'free') return 2;
        if (planData.type === 'donation') return 2;
        return 3;
    };

    useEffect(() => {
        if (isOpen) {
            if (!editingPlan) {
                // Creating new plan - use default currency
                setPlanData((prev) => ({
                    ...prev,
                    currency: defaultCurrency,
                    features: featuresGlobal,
                }));
            } else {
                // Editing existing plan - use plan's currency and features
                setPlanData((prev) => ({
                    ...prev,
                    currency: editingPlan.currency,
                    features: editingPlan.features || featuresGlobal,
                }));
            }
        }
        // eslint-disable-next-line
    }, [isOpen, editingPlan, featuresGlobal, defaultCurrency]);

    if (!isOpen) return null;

    const hasCustomIntervals =
        planData.type === 'subscription' &&
        planData.config?.subscription?.customIntervals?.length > 0;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-h-[90vh] min-w-[800px] overflow-y-auto">
                <DialogHeader>
                    <div className="flex items-center justify-between">
                        <DialogTitle className="flex items-center gap-2">
                            <CreditCard className="size-5" />
                            {editingPlan ? 'Edit Payment Plan' : 'Create Payment Plan'}
                        </DialogTitle>
                        <div className="text-sm text-gray-500">
                            Step {currentStep} of {getTotalSteps()}
                        </div>
                    </div>
                    <div className="mt-2 text-lg font-medium text-gray-700">{getStepTitle()}</div>
                </DialogHeader>

                <div className="mt-4 space-y-6">
                    {/* Step 1: Payment Type Selection */}
                    {currentStep === 1 && (
                        <div className="space-y-8">
                            {/* Plan Name Input */}
                            <div>
                                <Label htmlFor="planName" className="text-sm font-medium">
                                    Plan Name *
                                </Label>
                                <Input
                                    id="planName"
                                    value={planData.name}
                                    onChange={(e) =>
                                        setPlanData({ ...planData, name: e.target.value })
                                    }
                                    placeholder="Enter plan name"
                                    className="mt-1"
                                    required
                                />
                                <p className="mt-1 text-xs text-gray-500">
                                    A unique name to identify this payment plan
                                </p>
                            </div>

                            <RadioGroup
                                value={
                                    planData.type as
                                        | 'subscription'
                                        | 'upfront'
                                        | 'donation'
                                        | 'free'
                                }
                                onValueChange={(
                                    value: 'subscription' | 'upfront' | 'donation' | 'free'
                                ) => setPlanData({ ...planData, type: value, config: {} })}
                                className="space-y-8"
                            >
                                <div>
                                    <div className="mb-2 text-lg font-semibold text-primary-500">
                                        Free Plans
                                    </div>
                                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                        {/* Free Plan */}
                                        <div
                                            className={`cursor-pointer rounded-lg border-2 p-4 transition-all ${planData.type === 'free' ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-gray-300'}`}
                                        >
                                            <div className="flex items-start space-x-3">
                                                <RadioGroupItem
                                                    value="free"
                                                    id="free"
                                                    className="mt-1"
                                                />
                                                <div className="flex-1">
                                                    <div className="mb-2 flex items-center space-x-2">
                                                        <Globe className="size-5 text-gray-600" />
                                                        <Label
                                                            htmlFor="free"
                                                            className="cursor-pointer font-medium text-gray-900"
                                                        >
                                                            Free Plan
                                                        </Label>
                                                    </div>
                                                    <p className="text-sm text-gray-600">
                                                        Free plan with no payment required
                                                    </p>
                                                    <div className="mt-2 text-xs text-gray-500">
                                                        ✓ Free access
                                                        <br />
                                                        ✓ No payment required
                                                        <br />✓ Ideal for promotional purposes
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        {/* Optional Donation */}
                                        <div
                                            className={`cursor-pointer rounded-lg border-2 p-4 transition-all ${planData.type === 'donation' ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-gray-300'}`}
                                        >
                                            <div className="flex items-start space-x-3">
                                                <RadioGroupItem
                                                    value="donation"
                                                    id="donation"
                                                    className="mt-1"
                                                />
                                                <div className="flex-1">
                                                    <div className="mb-2 flex items-center space-x-2">
                                                        <Heart className="size-5 text-red-600" />
                                                        <Label
                                                            htmlFor="donation"
                                                            className="cursor-pointer font-medium text-gray-900"
                                                        >
                                                            Optional Donation
                                                        </Label>
                                                    </div>
                                                    <p className="text-sm text-gray-600">
                                                        Allow students to make voluntary donations
                                                        with suggested amounts
                                                    </p>
                                                    <div className="mt-2 text-xs text-gray-500">
                                                        ✓ Free course access
                                                        <br />
                                                        ✓ Suggested donation amounts
                                                        <br />✓ Support your institute
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <div className="mb-2 text-lg font-semibold text-primary-500">
                                        Paid Plans
                                    </div>
                                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                        {/* Subscription */}
                                        <div
                                            className={`cursor-pointer rounded-lg border-2 p-4 transition-all ${planData.type === 'subscription' ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-gray-300'}`}
                                        >
                                            <div className="flex items-start space-x-3">
                                                <RadioGroupItem
                                                    value="subscription"
                                                    id="subscription"
                                                    className="mt-1"
                                                />
                                                <div className="flex-1">
                                                    <div className="mb-2 flex items-center space-x-2">
                                                        <CreditCard className="size-5 text-blue-600" />
                                                        <Label
                                                            htmlFor="subscription"
                                                            className="cursor-pointer font-medium text-gray-900"
                                                        >
                                                            Subscription
                                                        </Label>
                                                    </div>
                                                    <p className="text-sm text-gray-600">
                                                        Recurring payments with flexible intervals
                                                    </p>
                                                    <div className="mt-2 text-xs text-gray-500">
                                                        ✓ Auto-renewal options
                                                        <br />
                                                        ✓ Multiple billing periods
                                                        <br />✓ Recurring revenue
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        {/* One-Time Payment */}
                                        <div
                                            className={`cursor-pointer rounded-lg border-2 p-4 transition-all ${planData.type === 'upfront' ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-gray-300'}`}
                                        >
                                            <div className="flex items-start space-x-3">
                                                <RadioGroupItem
                                                    value="upfront"
                                                    id="upfront"
                                                    className="mt-1"
                                                />
                                                <div className="flex-1">
                                                    <div className="mb-2 flex items-center space-x-2">
                                                        <DollarSign className="size-5 text-green-600" />
                                                        <Label
                                                            htmlFor="upfront"
                                                            className="cursor-pointer font-medium text-gray-900"
                                                        >
                                                            One-Time Payment
                                                        </Label>
                                                    </div>
                                                    <p className="text-sm text-gray-600">
                                                        Single upfront payment with optional
                                                        installment plans
                                                    </p>
                                                    <div className="mt-2 text-xs text-gray-500">
                                                        ✓ Lifetime access
                                                        <br />
                                                        ✓ Installment options
                                                        <br />✓ No recurring charges
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </RadioGroup>
                        </div>
                    )}

                    {/* Step 2: Plan Configuration */}
                    {currentStep === 2 && (
                        <div className="space-y-6">
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
                                            <SelectItem key={currency.code} value={currency.code}>
                                                {currency.symbol} {currency.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <p className="mt-1 text-xs text-gray-500">
                                    Default: {defaultCurrency} ({getCurrencySymbol(defaultCurrency)}
                                    )
                                </p>
                            </div>

                            {planData.type === 'free' && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-lg">
                                            Free Plan Configuration
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        <div>
                                            <Label>Validity Period (Days) *</Label>
                                            <Input
                                                type="number"
                                                placeholder="Enter number of days"
                                                value={planData.config?.free?.validityDays || ''}
                                                onChange={(e) =>
                                                    updateConfig({
                                                        free: {
                                                            ...planData.config?.free,
                                                            validityDays:
                                                                parseInt(e.target.value) || 0,
                                                        },
                                                    })
                                                }
                                                className="mt-1"
                                                min="1"
                                                max="365"
                                            />
                                            <p className="mt-1 text-xs text-gray-500">
                                                How long the free access will be valid (1-365 days)
                                            </p>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {planData.type === 'subscription' && (
                                <>
                                    {/* Custom Intervals Section */}
                                    <div className="space-y-6">
                                        <div className="mb-4 flex items-center justify-between">
                                            <h3 className="text-sm font-medium">
                                                Pricing Intervals
                                            </h3>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={() => {
                                                    const customIntervals =
                                                        planData.config?.subscription
                                                            ?.customIntervals || [];
                                                    // Each new interval starts with all features checked
                                                    const features = [...featuresGlobal];
                                                    const newInterval = {
                                                        value: 1,
                                                        unit: 'months',
                                                        price: '',
                                                        features,
                                                    };
                                                    const updatedConfig = {
                                                        ...planData.config,
                                                        subscription: {
                                                            ...planData.config?.subscription,
                                                            customIntervals: [
                                                                ...customIntervals,
                                                                newInterval,
                                                            ],
                                                        },
                                                    };
                                                    setPlanData({
                                                        ...planData,
                                                        config: updatedConfig,
                                                    });
                                                }}
                                            >
                                                <Plus className="mr-2 size-4" />
                                                Add Pricing Interval
                                            </Button>
                                        </div>
                                        <div className="space-y-3">
                                            {(
                                                planData.config?.subscription?.customIntervals || []
                                            ).map((interval: CustomInterval, idx: number) => (
                                                <div
                                                    key={idx}
                                                    className="space-y-4 rounded-lg border p-4"
                                                >
                                                    <div className="grid flex-1 grid-cols-4 gap-3">
                                                        <div>
                                                            <Label className="text-xs">
                                                                Interval Title
                                                            </Label>
                                                            <Input
                                                                type="text"
                                                                placeholder="e.g. Starter, Pro, 9 Months Access"
                                                                value={interval.title || ''}
                                                                onChange={(e) => {
                                                                    const customIntervals = [
                                                                        ...(planData.config
                                                                            ?.subscription
                                                                            ?.customIntervals ||
                                                                            []),
                                                                    ];
                                                                    customIntervals[idx] = {
                                                                        ...customIntervals[idx],
                                                                        title: e.target.value,
                                                                    };
                                                                    setPlanData({
                                                                        ...planData,
                                                                        config: {
                                                                            ...planData.config,
                                                                            subscription: {
                                                                                ...planData.config
                                                                                    ?.subscription,
                                                                                customIntervals,
                                                                            },
                                                                        },
                                                                    });
                                                                }}
                                                                className="mt-1"
                                                            />
                                                        </div>
                                                        <div>
                                                            <Label className="text-xs">
                                                                Interval
                                                            </Label>
                                                            <Input
                                                                type="number"
                                                                min="1"
                                                                value={interval.value}
                                                                onChange={(e) => {
                                                                    const customIntervals = [
                                                                        ...(planData.config
                                                                            ?.subscription
                                                                            ?.customIntervals ||
                                                                            []),
                                                                    ];
                                                                    customIntervals[idx] = {
                                                                        ...customIntervals[idx],
                                                                        value:
                                                                            parseInt(
                                                                                e.target.value
                                                                            ) || 1,
                                                                    };
                                                                    setPlanData({
                                                                        ...planData,
                                                                        config: {
                                                                            ...planData.config,
                                                                            subscription: {
                                                                                ...planData.config
                                                                                    ?.subscription,
                                                                                customIntervals,
                                                                            },
                                                                        },
                                                                    });
                                                                }}
                                                                className="mt-1"
                                                            />
                                                        </div>
                                                        <div>
                                                            <Label className="text-xs">Unit</Label>
                                                            <Select
                                                                value={interval.unit}
                                                                onValueChange={(value) => {
                                                                    const customIntervals = [
                                                                        ...(planData.config
                                                                            ?.subscription
                                                                            ?.customIntervals ||
                                                                            []),
                                                                    ];
                                                                    customIntervals[idx] = {
                                                                        ...customIntervals[idx],
                                                                        unit: value,
                                                                    };
                                                                    setPlanData({
                                                                        ...planData,
                                                                        config: {
                                                                            ...planData.config,
                                                                            subscription: {
                                                                                ...planData.config
                                                                                    ?.subscription,
                                                                                customIntervals,
                                                                            },
                                                                        },
                                                                    });
                                                                }}
                                                            >
                                                                <SelectTrigger className="mt-1">
                                                                    <SelectValue />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    <SelectItem value="days">
                                                                        Days
                                                                    </SelectItem>
                                                                    <SelectItem value="months">
                                                                        Months
                                                                    </SelectItem>
                                                                </SelectContent>
                                                            </Select>
                                                        </div>
                                                        <div>
                                                            <Label className="text-xs">Price</Label>
                                                            <div className="mt-1 flex items-center space-x-2">
                                                                <span className="text-sm">
                                                                    {getCurrencySymbol(
                                                                        planData.currency!
                                                                    )}
                                                                </span>
                                                                <Input
                                                                    type="number"
                                                                    placeholder="0"
                                                                    value={interval.price}
                                                                    onChange={(e) => {
                                                                        const customIntervals = [
                                                                            ...(planData.config
                                                                                ?.subscription
                                                                                ?.customIntervals ||
                                                                                []),
                                                                        ];
                                                                        customIntervals[idx] = {
                                                                            ...customIntervals[idx],
                                                                            price: e.target.value,
                                                                        };
                                                                        setPlanData({
                                                                            ...planData,
                                                                            config: {
                                                                                ...planData.config,
                                                                                subscription: {
                                                                                    ...planData
                                                                                        .config
                                                                                        ?.subscription,
                                                                                    customIntervals,
                                                                                },
                                                                            },
                                                                        });
                                                                    }}
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                    {/* Features for this interval */}
                                                    <div className="mt-4">
                                                        <h4 className="mb-2 text-xs font-semibold">
                                                            Features
                                                        </h4>
                                                        <div className="space-y-2">
                                                            {featuresGlobal.map((feature, fidx) => (
                                                                <div
                                                                    key={fidx}
                                                                    className="flex items-center gap-2"
                                                                >
                                                                    <Checkbox
                                                                        checked={
                                                                            interval.features?.includes(
                                                                                feature
                                                                            ) || false
                                                                        }
                                                                        onCheckedChange={(
                                                                            checked
                                                                        ) => {
                                                                            const customIntervals =
                                                                                [
                                                                                    ...(planData
                                                                                        .config
                                                                                        ?.subscription
                                                                                        ?.customIntervals ||
                                                                                        []),
                                                                                ];
                                                                            let newFeatures =
                                                                                interval.features
                                                                                    ? [
                                                                                          ...interval.features,
                                                                                      ]
                                                                                    : [];

                                                                            if (checked) {
                                                                                newFeatures.push(
                                                                                    feature
                                                                                );
                                                                            } else {
                                                                                newFeatures =
                                                                                    newFeatures.filter(
                                                                                        (f) =>
                                                                                            f !==
                                                                                            feature
                                                                                    );
                                                                            }
                                                                            customIntervals[idx] = {
                                                                                ...customIntervals[
                                                                                    idx
                                                                                ],
                                                                                features:
                                                                                    newFeatures,
                                                                            };
                                                                            setPlanData({
                                                                                ...planData,
                                                                                config: {
                                                                                    ...planData.config,
                                                                                    subscription: {
                                                                                        ...planData
                                                                                            .config
                                                                                            ?.subscription,
                                                                                        customIntervals,
                                                                                    },
                                                                                },
                                                                            });
                                                                        }}
                                                                    />
                                                                    <span>{feature}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                        <div className="mt-2 flex gap-2">
                                                            <Input
                                                                type="text"
                                                                className="flex-1 rounded border px-2 py-1"
                                                                placeholder="Add new feature"
                                                                value={interval.newFeature || ''}
                                                                onChange={(e) => {
                                                                    const customIntervals = [
                                                                        ...(planData.config
                                                                            ?.subscription
                                                                            ?.customIntervals ||
                                                                            []),
                                                                    ];
                                                                    customIntervals[idx] = {
                                                                        ...customIntervals[idx],
                                                                        newFeature: e.target.value,
                                                                    };
                                                                    setPlanData({
                                                                        ...planData,
                                                                        config: {
                                                                            ...planData.config,
                                                                            subscription: {
                                                                                ...planData.config
                                                                                    ?.subscription,
                                                                                customIntervals,
                                                                            },
                                                                        },
                                                                    });
                                                                }}
                                                            />
                                                            <Button
                                                                className="rounded border hover:bg-gray-200"
                                                                onClick={() => {
                                                                    const customIntervals = [
                                                                        ...(planData.config
                                                                            ?.subscription
                                                                            ?.customIntervals ||
                                                                            []),
                                                                    ];
                                                                    const newFeature =
                                                                        interval.newFeature?.trim();
                                                                    if (
                                                                        newFeature &&
                                                                        !featuresGlobal.includes(
                                                                            newFeature
                                                                        )
                                                                    ) {
                                                                        setFeaturesGlobal([
                                                                            ...featuresGlobal,
                                                                            newFeature,
                                                                        ]);
                                                                        // Add to all intervals
                                                                        customIntervals.forEach(
                                                                            (intv, i) => {
                                                                                if (!intv.features)
                                                                                    customIntervals[
                                                                                        i
                                                                                    ].features = [];
                                                                                customIntervals[
                                                                                    i
                                                                                ].features = [
                                                                                    ...(customIntervals[
                                                                                        i
                                                                                    ].features ||
                                                                                        []),
                                                                                    newFeature,
                                                                                ];
                                                                            }
                                                                        );
                                                                        // Clear input
                                                                        customIntervals[
                                                                            idx
                                                                        ].newFeature = '';
                                                                        setPlanData({
                                                                            ...planData,
                                                                            config: {
                                                                                ...planData.config,
                                                                                subscription: {
                                                                                    ...planData
                                                                                        .config
                                                                                        ?.subscription,
                                                                                    customIntervals,
                                                                                },
                                                                            },
                                                                        });
                                                                    }
                                                                }}
                                                            >
                                                                Add
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </>
                            )}

                            {planData.type === 'upfront' && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-lg">
                                            One-Time Payment Configuration
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        <div>
                                            <Label>
                                                Full Price ({getCurrencySymbol(planData.currency!)})
                                                *
                                            </Label>
                                            <Input
                                                type="number"
                                                placeholder="Enter price"
                                                value={planData.config?.upfront?.fullPrice || ''}
                                                onChange={(e) =>
                                                    updateConfig({
                                                        upfront: {
                                                            ...planData.config?.upfront,
                                                            fullPrice: e.target.value,
                                                        },
                                                    })
                                                }
                                                className="mt-1"
                                            />
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {planData.type === 'donation' && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-lg">
                                            Donation Configuration
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div>
                                            <Label>
                                                Suggested Donation Amounts (
                                                {getCurrencySymbol(planData.currency!)})
                                            </Label>
                                            <div className="mt-1 flex items-center space-x-2">
                                                <Input
                                                    type="number"
                                                    min="0"
                                                    placeholder="Enter amount"
                                                    value={
                                                        planData.config?.donation?.newAmount || ''
                                                    }
                                                    onChange={(e) =>
                                                        updateConfig({
                                                            donation: {
                                                                ...planData.config?.donation,
                                                                newAmount: e.target.value,
                                                            },
                                                        })
                                                    }
                                                    className="flex-1"
                                                />
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => {
                                                        const newAmount =
                                                            planData.config?.donation?.newAmount?.trim();
                                                        if (
                                                            newAmount &&
                                                            !isNaN(Number(newAmount))
                                                        ) {
                                                            const currentAmounts =
                                                                planData.config?.donation
                                                                    ?.suggestedAmounts || '';
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
                                                                        ...planData.config
                                                                            ?.donation,
                                                                        suggestedAmounts:
                                                                            updatedAmounts,
                                                                        newAmount: '',
                                                                    },
                                                                });
                                                            }
                                                        }
                                                    }}
                                                    disabled={
                                                        !planData.config?.donation?.newAmount ||
                                                        isNaN(
                                                            Number(
                                                                planData.config?.donation?.newAmount
                                                            )
                                                        )
                                                    }
                                                >
                                                    <Plus className="mr-2 size-4" />
                                                    Add
                                                </Button>
                                            </div>
                                            <p className="mt-1 text-xs text-gray-500">
                                                Add suggested amounts that students can choose from
                                            </p>

                                            {/* Display current suggested amounts */}
                                            {planData.config?.donation?.suggestedAmounts && (
                                                <div className="mt-3">
                                                    <Label className="text-sm font-medium">
                                                        Current Suggested Amounts:
                                                    </Label>
                                                    <div className="mt-2 flex flex-wrap gap-2">
                                                        {planData.config.donation.suggestedAmounts
                                                            .split(',')
                                                            .map(
                                                                (amount: string, index: number) => (
                                                                    <div
                                                                        key={index}
                                                                        className="flex items-center gap-2 rounded-md bg-gray-100 px-3 py-1"
                                                                    >
                                                                        <span className="text-sm font-medium">
                                                                            {getCurrencySymbol(
                                                                                planData.currency!
                                                                            )}
                                                                            {amount.trim()}
                                                                        </span>
                                                                        <Button
                                                                            type="button"
                                                                            variant="ghost"
                                                                            size="sm"
                                                                            className="h-auto p-0 text-red-600 hover:text-red-700"
                                                                            onClick={() => {
                                                                                const amountsList =
                                                                                    planData.config?.donation?.suggestedAmounts
                                                                                        ?.split(',')
                                                                                        .map(
                                                                                            (
                                                                                                a: string
                                                                                            ) =>
                                                                                                a.trim()
                                                                                        ) || [];
                                                                                const updatedAmounts =
                                                                                    amountsList
                                                                                        .filter(
                                                                                            (
                                                                                                _: string,
                                                                                                i: number
                                                                                            ) =>
                                                                                                i !==
                                                                                                index
                                                                                        )
                                                                                        .join(', ');

                                                                                updateConfig({
                                                                                    donation: {
                                                                                        ...planData
                                                                                            .config
                                                                                            ?.donation,
                                                                                        suggestedAmounts:
                                                                                            updatedAmounts,
                                                                                    },
                                                                                });
                                                                            }}
                                                                        >
                                                                            <Trash2 className="size-3" />
                                                                        </Button>
                                                                    </div>
                                                                )
                                                            )}
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        <div>
                                            <Label>
                                                Minimum Donation Amount (
                                                {getCurrencySymbol(planData.currency!)})
                                            </Label>
                                            <Input
                                                type="number"
                                                min="0"
                                                placeholder="0 for no minimum"
                                                value={
                                                    planData.config?.donation?.minimumAmount || '0'
                                                }
                                                onChange={(e) =>
                                                    updateConfig({
                                                        donation: {
                                                            ...planData.config?.donation,
                                                            minimumAmount: e.target.value,
                                                        },
                                                    })
                                                }
                                                className="mt-1"
                                            />
                                        </div>

                                        <div className="flex items-center space-x-2">
                                            <Checkbox
                                                id="allowCustomAmount"
                                                checked={
                                                    planData.config?.donation?.allowCustomAmount !==
                                                    false
                                                }
                                                onCheckedChange={(checked) =>
                                                    updateConfig({
                                                        donation: {
                                                            ...planData.config?.donation,
                                                            allowCustomAmount: checked,
                                                        },
                                                    })
                                                }
                                            />
                                            <Label htmlFor="allowCustomAmount">
                                                Allow custom donation amounts
                                            </Label>
                                        </div>

                                        <Alert>
                                            <Info className="size-4" />
                                            <AlertDescription>
                                                Donation-based courses are free to access. Coupon
                                                codes are not applicable as students can choose
                                                their contribution amount.
                                            </AlertDescription>
                                        </Alert>
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    )}

                    {/* Step 3: Plan Discounts */}
                    {currentStep === 3 && (
                        <div className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">
                                        Apply Discounts to Plan
                                    </CardTitle>
                                    <p className="text-sm text-gray-600">
                                        Set discounts for each plan interval or price tier
                                    </p>
                                </CardHeader>
                                <CardContent>
                                    {planData.type === 'subscription' &&
                                    planData.config?.subscription?.customIntervals ? (
                                        <div className="overflow-x-auto">
                                            <table className="w-full border-collapse border border-gray-200">
                                                <thead>
                                                    <tr className="bg-gray-50">
                                                        <th className="border border-gray-200 px-4 py-2 text-left font-medium">
                                                            Subscription Interval
                                                        </th>
                                                        <th className="border border-gray-200 px-4 py-2 text-left font-medium">
                                                            Original Price
                                                        </th>
                                                        <th className="border border-gray-200 px-4 py-2 text-left font-medium">
                                                            Discount Type
                                                        </th>
                                                        <th className="border border-gray-200 px-4 py-2 text-left font-medium">
                                                            Discount Amount
                                                        </th>
                                                        <th className="border border-gray-200 px-4 py-2 text-left font-medium">
                                                            Final Price
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {planData.config.subscription.customIntervals.map(
                                                        (interval: CustomInterval, idx: number) => {
                                                            const originalPrice = parseFloat(
                                                                String(interval.price || '0')
                                                            );
                                                            const discountType =
                                                                planData.config?.planDiscounts?.[
                                                                    `interval_${idx}`
                                                                ]?.type || 'none';
                                                            const discountAmount =
                                                                planData.config?.planDiscounts?.[
                                                                    `interval_${idx}`
                                                                ]?.amount || '';

                                                            let finalPrice = originalPrice;
                                                            if (
                                                                discountType === 'percentage' &&
                                                                discountAmount
                                                            ) {
                                                                finalPrice =
                                                                    originalPrice *
                                                                    (1 -
                                                                        parseFloat(discountAmount) /
                                                                            100);
                                                            } else if (
                                                                discountType === 'fixed' &&
                                                                discountAmount
                                                            ) {
                                                                finalPrice = Math.max(
                                                                    0,
                                                                    originalPrice -
                                                                        parseFloat(discountAmount)
                                                                );
                                                            }

                                                            return (
                                                                <tr
                                                                    key={idx}
                                                                    className="hover:bg-gray-50"
                                                                >
                                                                    <td className="border border-gray-200 px-4 py-2">
                                                                        <span className="font-medium">
                                                                            {interval.title ||
                                                                                `${interval.value} ${interval.unit} Plan`}
                                                                        </span>
                                                                    </td>
                                                                    <td className="border border-gray-200 px-4 py-2">
                                                                        <span className="font-medium">
                                                                            {getCurrencySymbol(
                                                                                planData.currency!
                                                                            )}
                                                                            {originalPrice.toLocaleString()}
                                                                        </span>
                                                                    </td>
                                                                    <td className="border border-gray-200 px-4 py-2">
                                                                        <Select
                                                                            value={discountType}
                                                                            onValueChange={(
                                                                                value
                                                                            ) => {
                                                                                const planDiscounts =
                                                                                    {
                                                                                        ...planData
                                                                                            .config
                                                                                            ?.planDiscounts,
                                                                                        [`interval_${idx}`]:
                                                                                            {
                                                                                                type: value,
                                                                                                amount:
                                                                                                    value ===
                                                                                                    'none'
                                                                                                        ? ''
                                                                                                        : discountAmount,
                                                                                            },
                                                                                    };
                                                                                updateConfig({
                                                                                    planDiscounts,
                                                                                });
                                                                            }}
                                                                        >
                                                                            <SelectTrigger className="w-32">
                                                                                <SelectValue />
                                                                            </SelectTrigger>
                                                                            <SelectContent>
                                                                                <SelectItem value="none">
                                                                                    No Discount
                                                                                </SelectItem>
                                                                                <SelectItem value="percentage">
                                                                                    % Off
                                                                                </SelectItem>
                                                                                <SelectItem value="fixed">
                                                                                    Flat Off
                                                                                </SelectItem>
                                                                            </SelectContent>
                                                                        </Select>
                                                                    </td>
                                                                    <td className="border border-gray-200 px-4 py-2">
                                                                        {discountType !== 'none' ? (
                                                                            <div className="flex items-center space-x-2">
                                                                                {discountType ===
                                                                                    'fixed' && (
                                                                                    <span className="text-sm">
                                                                                        {getCurrencySymbol(
                                                                                            planData.currency!
                                                                                        )}
                                                                                    </span>
                                                                                )}
                                                                                <Input
                                                                                    type="number"
                                                                                    min="0"
                                                                                    max={
                                                                                        discountType ===
                                                                                        'percentage'
                                                                                            ? 100
                                                                                            : originalPrice
                                                                                    }
                                                                                    placeholder={
                                                                                        discountType ===
                                                                                        'percentage'
                                                                                            ? '10'
                                                                                            : '50'
                                                                                    }
                                                                                    value={
                                                                                        discountAmount
                                                                                    }
                                                                                    onChange={(
                                                                                        e
                                                                                    ) => {
                                                                                        const planDiscounts =
                                                                                            {
                                                                                                ...planData
                                                                                                    .config
                                                                                                    ?.planDiscounts,
                                                                                                [`interval_${idx}`]:
                                                                                                    {
                                                                                                        type: discountType,
                                                                                                        amount: e
                                                                                                            .target
                                                                                                            .value,
                                                                                                    },
                                                                                            };
                                                                                        updateConfig(
                                                                                            {
                                                                                                planDiscounts,
                                                                                            }
                                                                                        );
                                                                                    }}
                                                                                    className="w-20"
                                                                                />
                                                                                {discountType ===
                                                                                    'percentage' && (
                                                                                    <span className="text-sm">
                                                                                        %
                                                                                    </span>
                                                                                )}
                                                                            </div>
                                                                        ) : (
                                                                            <span className="text-gray-400">
                                                                                -
                                                                            </span>
                                                                        )}
                                                                    </td>
                                                                    <td className="border border-gray-200 px-4 py-2">
                                                                        <span
                                                                            className={`font-medium ${finalPrice < originalPrice ? 'text-green-600' : 'text-gray-900'}`}
                                                                        >
                                                                            {getCurrencySymbol(
                                                                                planData.currency!
                                                                            )}
                                                                            {finalPrice.toLocaleString()}
                                                                        </span>
                                                                        {finalPrice <
                                                                            originalPrice && (
                                                                            <div className="text-xs text-gray-500">
                                                                                Save{' '}
                                                                                {getCurrencySymbol(
                                                                                    planData.currency!
                                                                                )}
                                                                                {(
                                                                                    originalPrice -
                                                                                    finalPrice
                                                                                ).toLocaleString()}
                                                                            </div>
                                                                        )}
                                                                    </td>
                                                                </tr>
                                                            );
                                                        }
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    ) : planData.type === 'upfront' ? (
                                        <div className="overflow-x-auto">
                                            <table className="w-full border-collapse border border-gray-200">
                                                <thead>
                                                    <tr className="bg-gray-50">
                                                        <th className="border border-gray-200 px-4 py-2 text-left font-medium">
                                                            Plan Type
                                                        </th>
                                                        <th className="border border-gray-200 px-4 py-2 text-left font-medium">
                                                            Original Price
                                                        </th>
                                                        <th className="border border-gray-200 px-4 py-2 text-left font-medium">
                                                            Discount Type
                                                        </th>
                                                        <th className="border border-gray-200 px-4 py-2 text-left font-medium">
                                                            Discount Amount
                                                        </th>
                                                        <th className="border border-gray-200 px-4 py-2 text-left font-medium">
                                                            Final Price
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    <tr className="hover:bg-gray-50">
                                                        <td className="border border-gray-200 px-4 py-2">
                                                            <span className="font-medium">
                                                                One-Time Payment
                                                            </span>
                                                        </td>
                                                        <td className="border border-gray-200 px-4 py-2">
                                                            <span className="font-medium">
                                                                {getCurrencySymbol(
                                                                    planData.currency!
                                                                )}
                                                                {parseFloat(
                                                                    planData.config?.upfront
                                                                        ?.fullPrice || '0'
                                                                ).toLocaleString()}
                                                            </span>
                                                        </td>
                                                        <td className="border border-gray-200 px-4 py-2">
                                                            <Select
                                                                value={
                                                                    planData.config?.planDiscounts
                                                                        ?.upfront?.type || 'none'
                                                                }
                                                                onValueChange={(value) => {
                                                                    const planDiscounts = {
                                                                        ...planData.config
                                                                            ?.planDiscounts,
                                                                        upfront: {
                                                                            type: value,
                                                                            amount:
                                                                                value === 'none'
                                                                                    ? ''
                                                                                    : planData
                                                                                          .config
                                                                                          ?.planDiscounts
                                                                                          ?.upfront
                                                                                          ?.amount ||
                                                                                      '',
                                                                        },
                                                                    };
                                                                    updateConfig({ planDiscounts });
                                                                }}
                                                            >
                                                                <SelectTrigger className="w-32">
                                                                    <SelectValue />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    <SelectItem value="none">
                                                                        No Discount
                                                                    </SelectItem>
                                                                    <SelectItem value="percentage">
                                                                        % Off
                                                                    </SelectItem>
                                                                    <SelectItem value="fixed">
                                                                        Flat Off
                                                                    </SelectItem>
                                                                </SelectContent>
                                                            </Select>
                                                        </td>
                                                        <td className="border border-gray-200 px-4 py-2">
                                                            {planData.config?.planDiscounts?.upfront
                                                                ?.type !== 'none' ? (
                                                                <div className="flex items-center space-x-2">
                                                                    {planData.config?.planDiscounts
                                                                        ?.upfront?.type ===
                                                                        'fixed' && (
                                                                        <span className="text-sm">
                                                                            {getCurrencySymbol(
                                                                                planData.currency!
                                                                            )}
                                                                        </span>
                                                                    )}
                                                                    <Input
                                                                        type="number"
                                                                        min="0"
                                                                        max={
                                                                            planData.config
                                                                                ?.planDiscounts
                                                                                ?.upfront?.type ===
                                                                            'percentage'
                                                                                ? 100
                                                                                : parseFloat(
                                                                                      planData
                                                                                          .config
                                                                                          ?.upfront
                                                                                          ?.fullPrice ||
                                                                                          '0'
                                                                                  )
                                                                        }
                                                                        placeholder={
                                                                            planData.config
                                                                                ?.planDiscounts
                                                                                ?.upfront?.type ===
                                                                            'percentage'
                                                                                ? '10'
                                                                                : '50'
                                                                        }
                                                                        value={
                                                                            planData.config
                                                                                ?.planDiscounts
                                                                                ?.upfront?.amount ||
                                                                            ''
                                                                        }
                                                                        onChange={(e) => {
                                                                            const planDiscounts = {
                                                                                ...planData.config
                                                                                    ?.planDiscounts,
                                                                                upfront: {
                                                                                    type:
                                                                                        planData
                                                                                            .config
                                                                                            ?.planDiscounts
                                                                                            ?.upfront
                                                                                            ?.type ||
                                                                                        'percentage',
                                                                                    amount: e.target
                                                                                        .value,
                                                                                },
                                                                            };
                                                                            updateConfig({
                                                                                planDiscounts,
                                                                            });
                                                                        }}
                                                                        className="w-20"
                                                                    />
                                                                    {planData.config?.planDiscounts
                                                                        ?.upfront?.type ===
                                                                        'percentage' && (
                                                                        <span className="text-sm">
                                                                            %
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            ) : (
                                                                <span className="text-gray-400">
                                                                    -
                                                                </span>
                                                            )}
                                                        </td>
                                                        <td className="border border-gray-200 px-4 py-2">
                                                            {(() => {
                                                                const originalPrice = parseFloat(
                                                                    planData.config?.upfront
                                                                        ?.fullPrice || '0'
                                                                );
                                                                const discountType =
                                                                    planData.config?.planDiscounts
                                                                        ?.upfront?.type || 'none';
                                                                const discountAmount =
                                                                    planData.config?.planDiscounts
                                                                        ?.upfront?.amount || '';

                                                                let finalPrice = originalPrice;
                                                                if (
                                                                    discountType === 'percentage' &&
                                                                    discountAmount
                                                                ) {
                                                                    finalPrice =
                                                                        originalPrice *
                                                                        (1 -
                                                                            parseFloat(
                                                                                discountAmount
                                                                            ) /
                                                                                100);
                                                                } else if (
                                                                    discountType === 'fixed' &&
                                                                    discountAmount
                                                                ) {
                                                                    finalPrice = Math.max(
                                                                        0,
                                                                        originalPrice -
                                                                            parseFloat(
                                                                                discountAmount
                                                                            )
                                                                    );
                                                                }

                                                                return (
                                                                    <>
                                                                        <span
                                                                            className={`font-medium ${finalPrice < originalPrice ? 'text-green-600' : 'text-gray-900'}`}
                                                                        >
                                                                            {getCurrencySymbol(
                                                                                planData.currency!
                                                                            )}
                                                                            {finalPrice.toLocaleString()}
                                                                        </span>
                                                                        {finalPrice <
                                                                            originalPrice && (
                                                                            <div className="text-xs text-gray-500">
                                                                                Save{' '}
                                                                                {getCurrencySymbol(
                                                                                    planData.currency!
                                                                                )}
                                                                                {(
                                                                                    originalPrice -
                                                                                    finalPrice
                                                                                ).toLocaleString()}
                                                                            </div>
                                                                        )}
                                                                    </>
                                                                );
                                                            })()}
                                                        </td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>
                                    ) : (
                                        <Alert>
                                            <Info className="size-4" />
                                            <AlertDescription>
                                                No pricing information available for this plan type.
                                            </AlertDescription>
                                        </Alert>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    )}

                    {/* Navigation Buttons */}
                    <div className="flex justify-between border-t pt-4">
                        <div>
                            {currentStep > 1 && (
                                <Button variant="outline" onClick={handleBack}>
                                    Back
                                </Button>
                            )}
                        </div>
                        <div className="flex space-x-2">
                            <Button variant="outline" onClick={onClose}>
                                Cancel
                            </Button>
                            {currentStep < getTotalSteps() ||
                            (currentStep === 2 &&
                                (planData.type === 'free' || planData.type === 'donation')) ? (
                                <Button
                                    onClick={handleNext}
                                    disabled={
                                        (currentStep === 1 && (!planData.name || !planData.type)) ||
                                        (currentStep === 2 &&
                                            planData.type === 'free' &&
                                            (!planData.config?.free?.validityDays ||
                                                planData.config.free.validityDays <= 0))
                                    }
                                    className="bg-primary-400 text-white hover:bg-primary-500"
                                >
                                    {(planData.type === 'free' && currentStep === 2) ||
                                    (planData.type === 'donation' && currentStep === 2)
                                        ? 'Create Plan'
                                        : 'Next'}
                                </Button>
                            ) : (
                                <Button
                                    onClick={handleSave}
                                    className="bg-primary-400 text-white hover:bg-primary-500"
                                    disabled={!planData.name || !planData.type}
                                >
                                    {editingPlan ? 'Update' : 'Create'} Payment Plan
                                </Button>
                            )}
                        </div>
                    </div>

                    {/* Show preview button for subscription plans with custom intervals or donation plans */}
                    {(currentStep === 2 || currentStep === 3) &&
                        (hasCustomIntervals || planData.type === 'donation') && (
                            <div className="mt-6 flex justify-end">
                                <Button
                                    onClick={() => setShowPreview((prev) => !prev)}
                                    variant="outline"
                                    className="flex items-center gap-2"
                                >
                                    {showPreview ? 'Hide Preview' : 'Preview Plans'}
                                    <Calendar className="size-4" />
                                </Button>
                            </div>
                        )}
                    {showPreview && (hasCustomIntervals || planData.type === 'donation') && (
                        <div className="mt-8 space-y-6">
                            {/* Plan Preview - Subscription or Donation */}
                            {planData.type === 'subscription' && hasCustomIntervals ? (
                                <SubscriptionPlanPreview
                                    currency={planData.currency || 'INR'}
                                    subscriptionPlans={{
                                        ...(planData.type === 'subscription' &&
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
                                    discountCoupons={(() => {
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
                                            case 'subscription':
                                                if (
                                                    planData.config?.subscription?.customIntervals
                                                ) {
                                                    planData.config.subscription.customIntervals.forEach(
                                                        (interval: CustomInterval, idx: number) => {
                                                            const discount =
                                                                planDiscounts[`interval_${idx}`];
                                                            if (
                                                                discount &&
                                                                discount.type !== 'none' &&
                                                                discount.amount
                                                            ) {
                                                                discountCoupons.push({
                                                                    id: `plan-discount-${idx}`,
                                                                    code: `${discount.type === 'percentage' ? 'PERCENT' : 'FLAT'}_${discount.amount}_${idx}`,
                                                                    name: `${discount.type === 'percentage' ? `${discount.amount}% Off` : `${getCurrencySymbol(planData.currency!)}${discount.amount} Off`} - ${interval.title || `${interval.value} ${interval.unit} Plan`}`,
                                                                    type: discount.type,
                                                                    value: parseFloat(
                                                                        discount.amount
                                                                    ),
                                                                    currency:
                                                                        planData.currency || 'INR',
                                                                    isActive: true,
                                                                    usageLimit: undefined,
                                                                    usedCount: 0,
                                                                    expiryDate: undefined,
                                                                    applicablePlans: [
                                                                        `custom${idx}`,
                                                                    ], // Only apply to this specific interval
                                                                });
                                                            }
                                                        }
                                                    );
                                                }
                                                break;
                                            // @ts-expect-error: 'upfront' is a valid plan type in our context
                                            case 'upfront':
                                                if (
                                                    planDiscounts.upfront &&
                                                    typeof planDiscounts.upfront === 'object'
                                                ) {
                                                    const discount = planDiscounts.upfront;
                                                    if (
                                                        discount.type !== 'none' &&
                                                        discount.amount
                                                    ) {
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
                                                            applicablePlans: ['upfront'], // Only apply to upfront plans
                                                        });
                                                    }
                                                }
                                                break;
                                        }

                                        return discountCoupons;
                                    })()}
                                    onSelectPlan={(planType) => {
                                        console.log('Selected plan:', planType);
                                        // You can add logic here to handle plan selection
                                    }}
                                />
                            ) : planData.type === 'donation' ? (
                                <DonationPlanPreview
                                    currency={planData.currency || 'INR'}
                                    suggestedAmounts={
                                        planData.config?.donation?.suggestedAmounts || ''
                                    }
                                    minimumAmount={planData.config?.donation?.minimumAmount || '0'}
                                    allowCustomAmount={
                                        planData.config?.donation?.allowCustomAmount !== false
                                    }
                                    onSelectAmount={(amount) => {
                                        console.log('Selected donation amount:', amount);
                                        // You can add logic here to handle amount selection
                                    }}
                                />
                            ) : null}
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
};
