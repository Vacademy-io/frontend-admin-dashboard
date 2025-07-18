import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { CreditCard, Globe, Plus } from 'phosphor-react';
import { useState } from 'react';
import { PaymentPlanList } from './PaymentPlanList';
import { MyButton } from '@/components/design-system/button';
import { PaymentPlanCreator } from './PaymentPlanCreator';
import { SubscriptionPlanPreview } from './SubscriptionPlanPreview';
import { DonationPlanPreview } from './DonationPlanPreview';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Eye } from 'lucide-react';

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

const PaymentSettings = () => {
    const [editingPlan, setEditingPlan] = useState<PaymentPlan | null>(null);
    const [currency, setCurrency] = useState<string>('GBP');
    const [showPaymentPlanCreator, setShowPaymentPlanCreator] = useState(false);
    const [showPlanPreview, setShowPlanPreview] = useState(false);
    const [previewingPlan, setPreviewingPlan] = useState<PaymentPlan | null>(null);
    const [featuresGlobal, setFeaturesGlobal] = useState<string[]>([]);

    const [paymentPlans, setPaymentPlans] = useState<PaymentPlan[]>([
        {
            id: '1',
            name: 'Standard Subscription Plan',
            type: 'subscription',
            currency: 'GBP',
            isDefault: true,
            config: {
                subscription: {
                    customIntervals: [
                        {
                            price: '81',
                            title: '3 Months Plan',
                            value: 3,
                            unit: 'month',
                            features: ['Feature 1', 'Feature 2'],
                            discount: {
                                type: 'percentage',
                                amount: '10',
                            },
                        },
                        {
                            price: '162',
                            title: '6 Months Plan',
                            value: 6,
                            unit: 'month',
                            features: ['Feature 1', 'Feature 2'],
                        },
                        {
                            price: '324',
                            title: '12 Months Plan',
                            value: 12,
                            unit: 'month',
                            features: ['Feature 1', 'Feature 2'],
                        },
                    ],
                },
                planDiscounts: {
                    interval_0: {
                        type: 'percentage',
                        amount: '22.22',
                    },
                    interval_1: {
                        type: 'percentage',
                        amount: '38.89',
                    },
                    interval_2: {
                        type: 'percentage',
                        amount: '58.33',
                    },
                },
            },
        },
        {
            id: '2',
            name: 'Free Plan',
            type: 'free',
            currency: 'GBP',
            isDefault: false,
            config: {
                free: {
                    validityDays: 365,
                },
            },
        },
    ]);

    const currencyOptions = [
        { code: 'USD', name: 'US Dollar', symbol: '$' },
        { code: 'EUR', name: 'Euro', symbol: '€' },
        { code: 'GBP', name: 'British Pound', symbol: '£' },
        { code: 'INR', name: 'Indian Rupee', symbol: '₹' },
        { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
        { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
    ];

    const getCurrencySymbol = (currencyCode: string) => {
        const currency = currencyOptions.find((c) => c.code === currencyCode);
        return currency?.symbol || '$';
    };

    // Error handling for component operations
    const handleError = (error: unknown, operation: string) => {
        console.error(`Error in ${operation}:`, error);
        // Note: Removed setError since error state is not used
        setTimeout(() => {
            // Error handling timeout
        }, 5000);
    };

    const handleSetDefaultPlan = (planId: string) => {
        try {
            setPaymentPlans((plans) =>
                plans.map((plan) => ({
                    ...plan,
                    isDefault: plan.id === planId,
                }))
            );
        } catch (error) {
            handleError(error, 'set default plan');
        }
    };

    const handleDeletePlan = (planId: string) => {
        try {
            setPaymentPlans((plans) => plans.filter((plan) => plan.id !== planId));
        } catch (error) {
            handleError(error, 'delete plan');
        }
    };

    const handleEditPlan = (plan: PaymentPlan) => {
        try {
            setEditingPlan(plan);
            setShowPaymentPlanCreator(true);
        } catch (error) {
            handleError(error, 'edit plan');
        }
    };

    const handleSavePaymentPlan = (plan: PaymentPlan) => {
        try {
            if (editingPlan) {
                setPaymentPlans((plans) => plans.map((p) => (p.id === editingPlan.id ? plan : p)));
            } else {
                setPaymentPlans((plans) => [...plans, plan]);
            }
            setEditingPlan(null);
        } catch (error) {
            handleError(error, 'save payment plan');
        }
    };

    const handlePreviewPlan = (plan: PaymentPlan) => {
        try {
            setPreviewingPlan(plan);
            setShowPlanPreview(true);
        } catch (error) {
            handleError(error, 'preview plan');
        }
    };

    // Helper functions to separate free and paid plans
    const getFreePlans = () => {
        return paymentPlans.filter((plan) => plan.type === 'free' || plan.type === 'donation');
    };

    const getPaidPlans = () => {
        return paymentPlans.filter((plan) => plan.type !== 'free' && plan.type !== 'donation');
    };

    return (
        <>
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <CreditCard className="size-5" />
                            Payment Configuration
                        </CardTitle>
                        <MyButton
                            onClick={() => setShowPaymentPlanCreator(true)}
                            className="flex items-center gap-2"
                        >
                            <Plus className="size-4" />
                            Add Payment Plan
                        </MyButton>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Currency and General Payment Settings */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Default Currency</Label>
                            <Select value={currency} onValueChange={(value) => setCurrency(value)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select currency" />
                                </SelectTrigger>
                                <SelectContent>
                                    {currencyOptions.map((currency) => (
                                        <SelectItem key={currency.code} value={currency.code}>
                                            {currency.symbol} {currency.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <Separator />

                    {/* Free Plans Section */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="flex items-center gap-2 text-lg font-medium text-gray-900">
                                <Globe className="size-5 text-green-600" />
                                Free Plans
                            </h3>
                            <Badge variant="outline" className="border-green-200 text-green-600">
                                {getFreePlans().length} plans
                            </Badge>
                        </div>
                        <PaymentPlanList
                            plans={getFreePlans()}
                            onEdit={handleEditPlan}
                            onDelete={handleDeletePlan}
                            onSetDefault={handleSetDefaultPlan}
                            onPreview={handlePreviewPlan}
                        />
                    </div>

                    <Separator />

                    {/* Paid Plans Section */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="flex items-center gap-2 text-lg font-medium text-gray-900">
                                <CreditCard className="size-5 text-blue-600" />
                                Paid Plans
                            </h3>
                            <Badge variant="outline" className="border-blue-200 text-blue-600">
                                {getPaidPlans().length} plans
                            </Badge>
                        </div>
                        <PaymentPlanList
                            plans={getPaidPlans()}
                            onEdit={handleEditPlan}
                            onDelete={handleDeletePlan}
                            onSetDefault={handleSetDefaultPlan}
                            onPreview={handlePreviewPlan}
                        />
                    </div>
                </CardContent>
            </Card>
            <PaymentPlanCreator
                isOpen={showPaymentPlanCreator}
                onClose={() => setShowPaymentPlanCreator(false)}
                onSave={handleSavePaymentPlan}
                editingPlan={editingPlan}
                featuresGlobal={featuresGlobal}
                setFeaturesGlobal={setFeaturesGlobal}
                defaultCurrency={currency}
            />

            {/* Plan Preview Dialog */}
            <Dialog open={showPlanPreview} onOpenChange={setShowPlanPreview}>
                <DialogContent className="max-h-[90vh] min-w-fit overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Eye className="size-5" />
                            Plan Preview - {previewingPlan?.name}
                        </DialogTitle>
                    </DialogHeader>

                    {previewingPlan && (
                        <div className="mt-4">
                            {previewingPlan.type === 'subscription' && (
                                <SubscriptionPlanPreview
                                    currency={previewingPlan.currency}
                                    subscriptionPlans={{
                                        ...previewingPlan.config?.subscription?.customIntervals
                                            ?.map(
                                                (
                                                    interval: {
                                                        price: string;
                                                        title?: string;
                                                        value: number;
                                                        unit: string;
                                                        features?: string[];
                                                    },
                                                    idx: number
                                                ) => ({
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
                                                })
                                            )
                                            .reduce(
                                                (
                                                    acc: Record<string, unknown>,
                                                    curr: Record<string, unknown>
                                                ) => ({ ...acc, ...curr }),
                                                {}
                                            ),
                                    }}
                                    features={(() => {
                                        // Get features from the plan or use global features
                                        const planFeatures = previewingPlan.features || [];
                                        const globalFeatures = featuresGlobal || [];

                                        // Combine plan-specific features with global features
                                        const allFeatures = [
                                            ...new Set([...planFeatures, ...globalFeatures]),
                                        ];

                                        return allFeatures;
                                    })()}
                                    discountCoupons={(() => {
                                        // Convert plan discounts to coupon format for preview
                                        const planDiscounts =
                                            previewingPlan.config?.planDiscounts || {};
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

                                        if (previewingPlan.config?.subscription?.customIntervals) {
                                            previewingPlan.config.subscription.customIntervals.forEach(
                                                (
                                                    interval: {
                                                        price: string;
                                                        title?: string;
                                                        value: number;
                                                        unit: string;
                                                        features?: string[];
                                                    },
                                                    idx: number
                                                ) => {
                                                    const discount =
                                                        planDiscounts[`interval_${idx}`];
                                                    if (
                                                        discount &&
                                                        discount.type !== 'none' &&
                                                        discount.amount
                                                    ) {
                                                        const currencySymbol = getCurrencySymbol(
                                                            previewingPlan.currency
                                                        );
                                                        discountCoupons.push({
                                                            id: `plan-discount-${idx}`,
                                                            code: `${discount.type === 'percentage' ? 'PERCENT' : 'FLAT'}_${discount.amount}_${idx}`,
                                                            name: `${discount.type === 'percentage' ? `${discount.amount}% Off` : `${currencySymbol}${discount.amount} Off`} - ${interval.title || `${interval.value} ${interval.unit} Plan`}`,
                                                            type: discount.type,
                                                            value: parseFloat(discount.amount),
                                                            currency: previewingPlan.currency,
                                                            isActive: true,
                                                            usageLimit: undefined,
                                                            usedCount: 0,
                                                            expiryDate: undefined,
                                                            applicablePlans: [`custom${idx}`], // Only apply to this specific interval
                                                        });
                                                    }
                                                }
                                            );
                                        }

                                        return discountCoupons;
                                    })()}
                                    onSelectPlan={(planType) => {
                                        console.log('Selected plan:', planType);
                                    }}
                                />
                            )}

                            {previewingPlan.type === 'donation' && (
                                <DonationPlanPreview
                                    currency={previewingPlan.currency}
                                    suggestedAmounts={
                                        previewingPlan.config?.donation?.suggestedAmounts || ''
                                    }
                                    minimumAmount={
                                        previewingPlan.config?.donation?.minimumAmount || '0'
                                    }
                                    allowCustomAmount={
                                        previewingPlan.config?.donation?.allowCustomAmount !== false
                                    }
                                    onSelectAmount={(amount) => {
                                        console.log('Selected donation amount:', amount);
                                    }}
                                />
                            )}
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
};

export default PaymentSettings;
