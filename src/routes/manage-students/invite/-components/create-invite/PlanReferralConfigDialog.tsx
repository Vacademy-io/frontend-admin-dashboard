import React, { useEffect, useState, useMemo } from 'react';
import {
    Dialog as ShadDialog,
    DialogContent as ShadDialogContent,
    DialogHeader as ShadDialogHeader,
    DialogTitle as ShadDialogTitle,
    DialogDescription as ShadDialogDescription,
} from '@/components/ui/dialog';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MyButton } from '@/components/design-system/button';
import { UseFormReturn } from 'react-hook-form';
import { InviteLinkFormValues } from './GenerateInviteLinkSchema';
import { Gift, Gear, TrendUp, ArrowRight, ArrowLeft, Clock, Users } from 'phosphor-react';
import { handleGetReferralProgramDetails } from './-services/referral-services';
import { useSuspenseQuery } from '@tanstack/react-query';
import {
    convertReferralData,
    getAllPlanIdsFromSelectedPlan,
    getPlanDisplayName,
} from './-utils/helper';
import { getReferralTypeIcon } from './-components/ReferralProgramCard';

interface PlanReferralConfigDialogProps {
    form: UseFormReturn<InviteLinkFormValues>;
}

export function PlanReferralConfigDialog({ form }: PlanReferralConfigDialogProps) {
    const { data: referralProgramDetails } = useSuspenseQuery(handleGetReferralProgramDetails());
    const [currentStep, setCurrentStep] = useState<'selectPlan' | 'selectReferral'>('selectPlan');
    const [selectedPlanId, setSelectedPlanId] = useState<string>('');

    const selectedPlan = form.watch('selectedPlan');
    const planReferralMappings = form.watch('planReferralMappings');
    const selectedPlanForReferral = form.watch('selectedPlanForReferral');
    const showPlanReferralDialog = form.watch('showPlanReferralDialog');

    // Get all plan IDs from the selected plan
    const planIds = getAllPlanIdsFromSelectedPlan(selectedPlan || null);

    // Memoize referral programs to avoid unnecessary re-renders
    const referralPrograms = useMemo(() => {
        return convertReferralData(referralProgramDetails);
    }, [referralProgramDetails]);

    // Initialize the form with referral programs data
    useEffect(() => {
        form.setValue('referralPrograms', referralPrograms);
    }, [referralPrograms, form]);

    // If selectedPlanForReferral is set, go directly to referral selection
    useEffect(() => {
        if (selectedPlanForReferral && showPlanReferralDialog) {
            setSelectedPlanId(selectedPlanForReferral);
            setCurrentStep('selectReferral');
        } else if (showPlanReferralDialog) {
            setCurrentStep('selectPlan');
            setSelectedPlanId('');
        }
    }, [selectedPlanForReferral, showPlanReferralDialog]);

    const handlePlanSelect = (planId: string) => {
        setSelectedPlanId(planId);
        setCurrentStep('selectReferral');
    };

    const handleReferralSelect = (referralId: string) => {
        // Update the plan-referral mapping
        const newMappings = { ...planReferralMappings };
        newMappings[selectedPlanId] = referralId;
        form.setValue('planReferralMappings', newMappings);

        // Close the dialog
        handleClose();
    };

    const handleRemoveReferral = () => {
        // Remove the referral for the selected plan
        const newMappings = { ...planReferralMappings };
        delete newMappings[selectedPlanId];
        form.setValue('planReferralMappings', newMappings);

        // Close the dialog
        handleClose();
    };

    const handleClose = () => {
        form.setValue('showPlanReferralDialog', false);
        form.setValue('selectedPlanForReferral', '');
        setSelectedPlanId('');
        setCurrentStep('selectPlan');
    };

    const handleBack = () => {
        if (currentStep === 'selectReferral') {
            setCurrentStep('selectPlan');
            setSelectedPlanId('');
        }
    };

    const getCurrentReferralForPlan = (planId: string) => {
        const referralId = planReferralMappings[planId];
        return referralPrograms.find((r) => r.id === referralId);
    };

    const selectedPlanName = selectedPlanId
        ? getPlanDisplayName(selectedPlan || null, selectedPlanId)
        : '';
    const currentReferral = getCurrentReferralForPlan(selectedPlanId);

    return (
        <ShadDialog
            open={showPlanReferralDialog}
            onOpenChange={(open) => {
                if (!open) handleClose();
            }}
        >
            <ShadDialogContent className="flex h-[70vh] min-w-[60vw] max-w-4xl flex-col">
                <ShadDialogHeader>
                    <div className="flex items-center gap-2">
                        {currentStep === 'selectReferral' && (
                            <MyButton
                                type="button"
                                scale="small"
                                buttonType="secondary"
                                onClick={handleBack}
                                className="p-2"
                            >
                                <ArrowLeft size={16} />
                            </MyButton>
                        )}
                        <div>
                            <ShadDialogTitle>
                                {currentStep === 'selectPlan'
                                    ? 'Select Payment Plan'
                                    : `Configure Referral for ${selectedPlanName}`}
                            </ShadDialogTitle>
                            <ShadDialogDescription>
                                {currentStep === 'selectPlan'
                                    ? 'Choose which payment plan to configure referral settings for'
                                    : 'Choose a referral program for this payment plan'}
                            </ShadDialogDescription>
                        </div>
                    </div>
                </ShadDialogHeader>

                <div className="mt-4 flex-1 space-y-4 overflow-auto">
                    {currentStep === 'selectPlan' ? (
                        <>
                            {planIds.length === 0 ? (
                                <div className="flex items-center justify-center py-8 text-gray-500">
                                    <div className="text-center">
                                        <Gear size={32} className="mx-auto mb-2 opacity-50" />
                                        <p>No payment plans available</p>
                                    </div>
                                </div>
                            ) : (
                                planIds.map((planId) => {
                                    const planName = getPlanDisplayName(
                                        selectedPlan || null,
                                        planId
                                    );
                                    const currentReferralForPlan =
                                        getCurrentReferralForPlan(planId);
                                    const isConfigured = !!currentReferralForPlan;

                                    return (
                                        <Card
                                            key={planId}
                                            className="cursor-pointer border-2 border-gray-200 p-4 transition-all hover:border-gray-300"
                                            onClick={() => handlePlanSelect(planId)}
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="font-semibold">{planName}</div>
                                                    {isConfigured && (
                                                        <Badge variant="default">
                                                            {currentReferralForPlan.name}
                                                        </Badge>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    {!isConfigured && (
                                                        <span className="text-sm text-gray-500">
                                                            No referral configured
                                                        </span>
                                                    )}
                                                    <ArrowRight
                                                        size={16}
                                                        className="text-gray-400"
                                                    />
                                                </div>
                                            </div>
                                        </Card>
                                    );
                                })
                            )}
                        </>
                    ) : (
                        <>
                            {/* Current referral info */}
                            {currentReferral && (
                                <Card className="border-amber-200 bg-amber-50 p-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <div className="font-semibold text-amber-800">
                                                Currently Configured: {currentReferral.name}
                                            </div>
                                            <div className="text-sm text-amber-600">
                                                Click on a different referral below to change, or
                                                remove current one
                                            </div>
                                        </div>
                                        <MyButton
                                            type="button"
                                            scale="small"
                                            buttonType="secondary"
                                            onClick={handleRemoveReferral}
                                            className="border-amber-300 text-amber-700 hover:bg-amber-100"
                                        >
                                            Remove
                                        </MyButton>
                                    </div>
                                </Card>
                            )}

                            {/* Available referral programs */}
                            {referralPrograms.length === 0 ? (
                                <div className="flex items-center justify-center py-8 text-gray-500">
                                    <div className="text-center">
                                        <TrendUp size={32} className="mx-auto mb-2 opacity-50" />
                                        <p>No referral programs available</p>
                                    </div>
                                </div>
                            ) : (
                                referralPrograms.map((program) => {
                                    const isCurrentlySelected = currentReferral?.id === program.id;

                                    return (
                                        <Card
                                            key={program.id}
                                            className={`cursor-pointer border-2 p-4 transition-all ${
                                                isCurrentlySelected
                                                    ? 'border-blue-500 bg-blue-50'
                                                    : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                                            }`}
                                            onClick={() => handleReferralSelect(program.id)}
                                        >
                                            {/* Header */}
                                            <div className="mb-3 flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <TrendUp size={18} className="text-blue-600" />
                                                    <span className="text-lg font-semibold text-gray-900">
                                                        {program.name}
                                                    </span>
                                                </div>
                                                {isCurrentlySelected && (
                                                    <Badge
                                                        variant="default"
                                                        className="bg-blue-100 text-blue-800"
                                                    >
                                                        Current
                                                    </Badge>
                                                )}
                                            </div>

                                            {/* Benefits Grid */}
                                            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                                                {/* Referee Benefits */}
                                                <div className="space-y-2">
                                                    <div className="flex items-center gap-2">
                                                        <Gift
                                                            size={16}
                                                            className="text-green-600"
                                                        />
                                                        <span className="text-sm font-medium text-gray-700">
                                                            Referee Gets:
                                                        </span>
                                                    </div>
                                                    <div className="ml-6">
                                                        {program?.refereeBenefit?.type ===
                                                            'free_course' && (
                                                            <div className="flex items-center gap-2 text-green-700">
                                                                {getReferralTypeIcon(
                                                                    program?.refereeBenefit?.type ||
                                                                        ''
                                                                )}
                                                                <span className="text-sm font-medium">
                                                                    Free course access
                                                                </span>
                                                            </div>
                                                        )}
                                                        {program?.refereeBenefit?.type ===
                                                            'free_days' && (
                                                            <div className="flex items-center gap-2 text-blue-700">
                                                                {getReferralTypeIcon(
                                                                    program?.refereeBenefit?.type ||
                                                                        ''
                                                                )}
                                                                <span className="text-sm font-medium">
                                                                    {program?.refereeBenefit?.value}{' '}
                                                                    free days
                                                                </span>
                                                            </div>
                                                        )}
                                                        {program?.refereeBenefit?.type ===
                                                            'bonus_content' && (
                                                            <div className="flex items-center gap-2 text-purple-700">
                                                                {getReferralTypeIcon(
                                                                    program?.refereeBenefit?.type ||
                                                                        ''
                                                                )}
                                                                <span className="text-sm font-medium">
                                                                    Bonus Content
                                                                </span>
                                                            </div>
                                                        )}
                                                        {program?.refereeBenefit?.type ===
                                                            'discount_percentage' && (
                                                            <div className="flex items-center gap-2 text-green-700">
                                                                {getReferralTypeIcon(
                                                                    program?.refereeBenefit?.type ||
                                                                        ''
                                                                )}
                                                                <span className="text-sm font-medium">
                                                                    {program?.refereeBenefit?.value}
                                                                    % discount
                                                                </span>
                                                            </div>
                                                        )}
                                                        {program?.refereeBenefit?.type ===
                                                            'discount_fixed' && (
                                                            <div className="flex items-center gap-2 text-green-700">
                                                                {getReferralTypeIcon(
                                                                    program?.refereeBenefit?.type ||
                                                                        ''
                                                                )}
                                                                <span className="text-sm font-medium">
                                                                    ₹
                                                                    {program?.refereeBenefit?.value}{' '}
                                                                    discount
                                                                </span>
                                                            </div>
                                                        )}
                                                        {![
                                                            'free_course',
                                                            'free_days',
                                                            'bonus_content',
                                                            'discount_percentage',
                                                            'discount_fixed',
                                                        ].includes(
                                                            program?.refereeBenefit?.type || ''
                                                        ) && (
                                                            <div className="flex items-center gap-2 text-green-700">
                                                                {getReferralTypeIcon(
                                                                    program?.refereeBenefit?.type ||
                                                                        ''
                                                                )}
                                                                <span className="text-sm font-medium">
                                                                    {program?.refereeBenefit?.value}{' '}
                                                                    off
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Referrer Benefits */}
                                                <div className="space-y-2">
                                                    <div className="flex items-center gap-2">
                                                        <Users
                                                            size={16}
                                                            className="text-orange-600"
                                                        />
                                                        <span className="text-sm font-medium text-gray-700">
                                                            Referrer Gets:
                                                        </span>
                                                    </div>
                                                    <div className="ml-6 space-y-1">
                                                        {program.referrerBenefit &&
                                                        program.referrerBenefit.length > 0 ? (
                                                            program.referrerBenefit
                                                                .slice(0, 2)
                                                                .map((benefit, index) => (
                                                                    <div
                                                                        key={index}
                                                                        className="flex items-center gap-2 text-orange-700"
                                                                    >
                                                                        {getReferralTypeIcon(
                                                                            benefit?.type || ''
                                                                        )}
                                                                        <span className="text-sm font-medium">
                                                                            {benefit.referralCount >
                                                                            1
                                                                                ? `${benefit.referralCount} refs`
                                                                                : 'Per ref'}
                                                                            :{' '}
                                                                            {benefit.type ===
                                                                            'points_system'
                                                                                ? 'Points'
                                                                                : 'Reward'}
                                                                        </span>
                                                                    </div>
                                                                ))
                                                        ) : (
                                                            <span className="text-sm text-gray-500">
                                                                No rewards
                                                            </span>
                                                        )}
                                                        {program.referrerBenefit &&
                                                            program.referrerBenefit.length > 2 && (
                                                                <span className="text-xs text-gray-500">
                                                                    +
                                                                    {program.referrerBenefit
                                                                        .length - 2}{' '}
                                                                    more
                                                                </span>
                                                            )}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Additional Info */}
                                            <div className="mt-3 flex items-center justify-between border-t border-gray-100 pt-2">
                                                {program.vestingPeriod > 0 && (
                                                    <div className="flex items-center gap-1 text-xs text-gray-600">
                                                        <Clock size={12} />
                                                        <span>
                                                            {program.vestingPeriod}d vesting
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </Card>
                                    );
                                })
                            )}
                        </>
                    )}
                </div>

                {currentStep === 'selectReferral' && (
                    <div className="-mb-2 flex justify-center border-t bg-white pt-4">
                        <MyButton
                            type="button"
                            scale="small"
                            buttonType="secondary"
                            onClick={() => form.setValue('showAddReferralDialog', true)}
                            className="p-4"
                        >
                            + Add New Referral Program
                        </MyButton>
                    </div>
                )}
            </ShadDialogContent>
        </ShadDialog>
    );
}
