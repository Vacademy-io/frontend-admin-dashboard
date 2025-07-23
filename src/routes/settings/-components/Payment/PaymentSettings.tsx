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
import { CreditCard, Globe, Plus, ArrowClockwise } from 'phosphor-react';
import { useState, useEffect, useRef } from 'react';
import { PaymentPlanList } from './PaymentPlanList';
import { MyButton } from '@/components/design-system/button';
import { PaymentPlanCreator } from './PaymentPlanCreator';
import { SubscriptionPlanPreview } from './SubscriptionPlanPreview';
import { DonationPlanPreview } from './DonationPlanPreview';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Eye, Loader2 } from 'lucide-react';
import {
    savePaymentOption,
    getPaymentOptions,
    transformLocalPlanToApiFormat,
    transformApiPlanToLocalFormat,
    makeDefaultPaymentOption,
} from '@/services/payment-options';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { currencyOptions } from '../../-constants/payments';
import { getInstituteId } from '@/constants/helper';
import { PaymentPlan, PaymentPlanTag, PaymentPlanType } from '@/types/payment';

const toPaymentPlanTag = (tag: string | null): PaymentPlanTag => {
    if (tag === 'default' || tag === 'free' || tag === null) return tag as PaymentPlanTag;
    return 'free';
};

interface Interval {
    price: string;
    title?: string;
    value: number;
    unit: string;
    features?: string[];
}

interface DiscountCoupon {
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
}

const PaymentSettings = () => {
    const [editingPlan, setEditingPlan] = useState<PaymentPlan | null>(null);
    const [currency, setCurrency] = useState<string>('GBP');
    const [showPaymentPlanCreator, setShowPaymentPlanCreator] = useState(false);
    const [showPlanPreview, setShowPlanPreview] = useState(false);
    const [previewingPlan, setPreviewingPlan] = useState<PaymentPlan | null>(null);
    const [featuresGlobal, setFeaturesGlobal] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [deletingPlanId, setDeletingPlanId] = useState<string | null>(null);
    const previewDialogRef = useRef<HTMLDivElement>(null);
    const [requireApproval, setRequireApproval] = useState(false);

    const [paymentPlans, setPaymentPlans] = useState<PaymentPlan[]>([]);
    const instituteId = getInstituteId();

    const getCurrencySymbol = (currencyCode: string) => {
        const currency = currencyOptions.find((c) => c.code === currencyCode);
        return currency?.symbol || '$';
    };

    // Helper functions for plan transformations
    const transformIntervalsToSubscriptionPlans = (intervals: Interval[] = []) => {
        return intervals.reduce(
            (acc, interval, idx) => ({
                ...acc,
                [`custom${idx}`]: {
                    enabled: true,
                    price: interval.price || '0',
                    interval: 'custom',
                    title: interval.title || `${interval.value} ${interval.unit} Plan`,
                    features: interval.features || [],
                    customInterval: {
                        value: interval.value,
                        unit: interval.unit,
                    },
                    originalPrice: interval.price || '0',
                },
            }),
            {}
        );
    };

    const getAllFeatures = (plan: PaymentPlan): string[] => {
        const planFeatures = plan.features || [];
        const globalFeatures = featuresGlobal || [];
        const intervalFeatures =
            plan.config?.subscription?.customIntervals?.flatMap(
                (interval: Interval) => interval.features || []
            ) || [];

        return [...new Set([...planFeatures, ...globalFeatures, ...intervalFeatures])];
    };

    const createDiscountCoupons = (plan: PaymentPlan): DiscountCoupon[] => {
        const planDiscounts = plan.config?.planDiscounts || {};
        const intervals = plan.config?.subscription?.customIntervals || [];
        const currencySymbol = getCurrencySymbol(plan.currency);

        return intervals
            .map((interval: Interval, idx: number) => {
                const discount = planDiscounts[`interval_${idx}`];
                if (!discount || discount.type === 'none' || !discount.amount) return null;

                return {
                    id: `plan-discount-${idx}`,
                    code: `${discount.type === 'percentage' ? 'PERCENT' : 'FLAT'}_${discount.amount}_${idx}`,
                    name: `${discount.type === 'percentage' ? `${discount.amount}% Off` : `${currencySymbol}${discount.amount} Off`} - ${interval.title || `${interval.value} ${interval.unit} Plan`}`,
                    type: discount.type,
                    value: parseFloat(discount.amount),
                    currency: plan.currency,
                    isActive: true,
                    usageLimit: undefined,
                    usedCount: 0,
                    expiryDate: undefined,
                    applicablePlans: [`custom${idx}`],
                };
            })
            .filter(Boolean) as DiscountCoupon[];
    };

    // Load payment options from API
    const loadPaymentOptions = async () => {
        setIsLoading(true);
        try {
            const request = {
                types: ['subscription', 'upfront', 'donation', 'free'],
                source: 'INSTITUTE',
                source_id: instituteId ?? '',
                require_approval: true,
                not_require_approval: true,
            };

            const response = await getPaymentOptions(request);
            const transformedPlans =
                response?.flatMap((paymentOption) => {
                    if (paymentOption.payment_plans?.length > 0) {
                        return paymentOption.payment_plans.map((plan) => {
                            const planWithMetadata = {
                                ...plan,
                                payment_option_metadata_json:
                                    paymentOption.payment_option_metadata_json,
                                type: paymentOption.type,
                            };
                            const localPlan = transformApiPlanToLocalFormat(planWithMetadata);
                            return {
                                ...localPlan,
                                id: paymentOption.id,
                                tag: paymentOption.tag as PaymentPlanTag,
                                type: localPlan.type as PaymentPlanType,
                            };
                        });
                    }
                    return [];
                }) || [];

            setPaymentPlans(
                transformedPlans.map((plan) => ({
                    ...plan,
                    id: plan.id || '',
                    isDefault: !!plan.isDefault,
                    config: plan.config || {},
                    tag: plan.tag as PaymentPlanTag,
                    type: plan.type as PaymentPlanType,
                }))
            );

            if (transformedPlans.length === 0) {
                toast.info('No payment options found. Create your first payment plan!');
            }
        } catch (error) {
            console.error('Error loading payment options:', error);
            toast.error('Failed to load payment options');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadPaymentOptions();
    }, []);

    const handleError = (error: unknown, operation: string) => {
        console.error(`Error in ${operation}:`, error);
        toast.error(`Error in ${operation}`);
    };

    const handleSetDefaultPlan = async (planId: string) => {
        try {
            // Find the plan and get its paymentOptionId (assuming plan.id is paymentOptionId)
            const paymentOptionId = planId;
            await makeDefaultPaymentOption({
                source: 'INSTITUTE',
                sourceId: instituteId ?? '',
                paymentOptionId,
            });
            await loadPaymentOptions(); // Refresh the list from the API
            toast.success('Default payment plan updated successfully');
        } catch (error) {
            handleError(error, 'set default plan');
        }
    };

    const handleDeletePlan = async (planId: string) => {
        setDeletingPlanId(planId);
        try {
            setPaymentPlans((plans) => plans.filter((plan) => plan.id !== planId));
            toast.success('Payment plan deleted successfully');
        } catch (error) {
            handleError(error, 'delete plan');
        } finally {
            setDeletingPlanId(null);
        }
    };

    const handleEditPlan = (plan: PaymentPlan) => {
        try {
            // Clear any previous editing state and set the new plan to edit
            setEditingPlan(plan);
            setShowPaymentPlanCreator(true);
        } catch (error) {
            handleError(error, 'edit plan');
        }
    };

    const handleClosePaymentPlanCreator = () => {
        setShowPaymentPlanCreator(false);
        setEditingPlan(null);
        setRequireApproval(false);
    };

    const handleSavePaymentPlan = async (plan: PaymentPlan, approvalOverride?: boolean) => {
        setIsSaving(true);
        try {
            const apiPlan = transformLocalPlanToApiFormat(plan);
            const paymentOptionRequest = {
                id: plan.id, // Use the plan ID directly (either existing or new)
                name: plan.name,
                status: 'ACTIVE',
                source: 'INSTITUTE',
                source_id: instituteId ?? '',
                type: plan.type,
                require_approval: approvalOverride ?? requireApproval,
                payment_plans: [apiPlan],
                payment_option_metadata_json: JSON.stringify({
                    currency: plan.currency,
                    features: plan.features || [],
                    config: plan.config,
                    subscriptionData:
                        plan.type === 'subscription'
                            ? {
                                  customIntervals: plan.config?.subscription?.customIntervals || [],
                                  planDiscounts: plan.config?.planDiscounts || {},
                              }
                            : undefined,
                    upfrontData:
                        plan.type === 'upfront'
                            ? {
                                  fullPrice: plan.config?.upfront?.fullPrice,
                                  planDiscounts: plan.config?.planDiscounts || {},
                              }
                            : undefined,
                    donationData:
                        plan.type === 'donation'
                            ? {
                                  suggestedAmounts: plan.config?.donation?.suggestedAmounts,
                                  minimumAmount: plan.config?.donation?.minimumAmount,
                                  allowCustomAmount: plan.config?.donation?.allowCustomAmount,
                              }
                            : undefined,
                    freeData:
                        plan.type === 'free'
                            ? {
                                  validityDays: plan.config?.free?.validityDays,
                              }
                            : undefined,
                }),
            };

            const savedPaymentOption = await savePaymentOption(paymentOptionRequest);

            if (editingPlan) {
                // Update existing plan in the list
                setPaymentPlans((plans) => plans.map((p) => (p.id === editingPlan.id ? plan : p)));
                toast.success('Payment plan updated successfully');
            } else {
                // Add new plan to the list
                const savedPlan = savedPaymentOption?.payment_plans?.[0];
                if (savedPlan) {
                    const transformedPlan = transformApiPlanToLocalFormat(savedPlan);
                    setPaymentPlans((plans) => [
                        ...plans,
                        {
                            ...transformedPlan,
                            tag:
                                transformedPlan.type === 'free'
                                    ? 'free'
                                    : transformedPlan.type === 'donation'
                                      ? 'donation'
                                      : 'default',
                        } as PaymentPlan,
                    ]);
                } else {
                    setPaymentPlans((plans) => [...plans, plan]);
                }
                toast.success('Payment plan created successfully');
            }

            setEditingPlan(null);
            setShowPaymentPlanCreator(false);
            setRequireApproval(false);
        } catch (error) {
            handleError(error, 'save payment plan');
        } finally {
            setIsSaving(false);
        }
    };

    const handlePreviewPlan = (plan: PaymentPlan) => {
        try {
            setPreviewingPlan(plan);
            setShowPlanPreview(true);
            setTimeout(() => {
                if (previewDialogRef.current) {
                    previewDialogRef.current.scrollTo({
                        top: 0,
                        behavior: 'smooth',
                    });
                }
            }, 100);
        } catch (error) {
            handleError(error, 'preview plan');
        }
    };

    // Filtering: use only type, never tag
    const getFreePlans = () =>
        paymentPlans.filter((plan) => plan.type === 'free' || plan.type === 'donation');
    const getPaidPlans = () =>
        paymentPlans.filter((plan) => plan.type === 'subscription' || plan.type === 'upfront');

    const renderPlanPreview = () => {
        if (!previewingPlan) return null;

        if (previewingPlan.type === 'subscription') {
            return (
                <SubscriptionPlanPreview
                    currency={previewingPlan.currency}
                    subscriptionPlans={transformIntervalsToSubscriptionPlans(
                        previewingPlan.config?.subscription?.customIntervals
                    )}
                    features={getAllFeatures(previewingPlan)}
                    discountCoupons={createDiscountCoupons(previewingPlan)}
                />
            );
        }

        if (previewingPlan.type === 'donation') {
            return (
                <DonationPlanPreview
                    currency={previewingPlan.currency}
                    suggestedAmounts={previewingPlan.config?.donation?.suggestedAmounts || ''}
                    minimumAmount={previewingPlan.config?.donation?.minimumAmount || '0'}
                    allowCustomAmount={previewingPlan.config?.donation?.allowCustomAmount !== false}
                    onSelectAmount={(amount) => console.log('Selected donation amount:', amount)}
                />
            );
        }

        return null;
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
                        <div className="flex items-center gap-2">
                            <MyButton
                                onClick={() => setShowPaymentPlanCreator(true)}
                                className="flex items-center gap-2"
                                disabled={isLoading || isSaving}
                            >
                                <Plus className="size-4" />
                                Add Payment Plan
                            </MyButton>
                            <Button
                                onClick={loadPaymentOptions}
                                disabled={isLoading || isSaving}
                                variant="outline"
                                className="border hover:border-primary-500 hover:bg-primary-50"
                            >
                                <ArrowClockwise
                                    className={`size-4 ${isLoading ? 'animate-spin' : ''}`}
                                />
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
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
                        {isLoading ? (
                            <div className="flex items-center justify-center py-8">
                                <Loader2 className="size-8 animate-spin text-primary-400" />
                            </div>
                        ) : (
                            <PaymentPlanList
                                plans={getFreePlans()}
                                onEdit={handleEditPlan}
                                onDelete={handleDeletePlan}
                                onSetDefault={handleSetDefaultPlan}
                                onPreview={handlePreviewPlan}
                                deletingPlanId={deletingPlanId}
                            />
                        )}
                    </div>

                    <Separator />

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
                        {isLoading ? (
                            <div className="flex items-center justify-center py-8">
                                <Loader2 className="size-8 animate-spin text-primary-400" />
                            </div>
                        ) : (
                            <PaymentPlanList
                                plans={getPaidPlans().map((plan) => ({
                                    ...plan,
                                    tag: toPaymentPlanTag(plan.tag),
                                }))}
                                onEdit={handleEditPlan}
                                onDelete={handleDeletePlan}
                                onSetDefault={handleSetDefaultPlan}
                                onPreview={handlePreviewPlan}
                                deletingPlanId={deletingPlanId}
                            />
                        )}
                    </div>
                </CardContent>
            </Card>

            <PaymentPlanCreator
                key={editingPlan?.id}
                isOpen={showPaymentPlanCreator}
                onClose={handleClosePaymentPlanCreator}
                onSave={(plan) => handleSavePaymentPlan(plan, requireApproval)}
                editingPlan={editingPlan}
                featuresGlobal={featuresGlobal}
                setFeaturesGlobal={setFeaturesGlobal}
                defaultCurrency={currency}
                isSaving={isSaving}
                requireApprovalCheckbox={
                    !editingPlan && (
                        <div className="mt-4 flex items-center gap-2">
                            <Label htmlFor="requireApproval">Send for approval</Label>
                            <Switch
                                id="requireApproval"
                                checked={requireApproval}
                                onCheckedChange={setRequireApproval}
                            />
                        </div>
                    )
                }
            />

            <Dialog open={showPlanPreview} onOpenChange={setShowPlanPreview}>
                <DialogContent
                    ref={previewDialogRef}
                    className="max-h-[90vh] min-w-fit overflow-y-auto"
                >
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Eye className="size-5" />
                            Plan Preview - {previewingPlan?.name}
                        </DialogTitle>
                    </DialogHeader>
                    <div className="mt-4">{renderPlanPreview()}</div>
                </DialogContent>
            </Dialog>
        </>
    );
};

export default PaymentSettings;
