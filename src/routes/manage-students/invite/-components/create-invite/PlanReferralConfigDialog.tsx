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
import { Gift, Gear, TrendUp, ArrowRight, ArrowLeft } from 'phosphor-react';
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
                                            className={`cursor-pointer flex-col gap-1 border-2 p-4 transition-all ${
                                                isCurrentlySelected
                                                    ? 'border-blue-500 bg-blue-50'
                                                    : 'border-gray-200 hover:border-gray-300'
                                            }`}
                                            onClick={() => handleReferralSelect(program.id)}
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <TrendUp size={16} />
                                                    <span className="text-base font-semibold">
                                                        {program.name}
                                                    </span>
                                                </div>
                                                {isCurrentlySelected && (
                                                    <Badge variant="default" className="ml-2">
                                                        Current
                                                    </Badge>
                                                )}
                                            </div>
                                            <div className="mt-2 flex flex-col gap-2">
                                                <div className="flex flex-col items-start gap-2">
                                                    <div className="flex items-center gap-2">
                                                        <Gift size={16} />
                                                        <span className="font-semibold">
                                                            Referee Benefit:
                                                        </span>
                                                    </div>
                                                    {program?.refereeBenefit?.type ===
                                                    'free_course' ? (
                                                        <span className="ml-6 flex items-center gap-1 font-semibold text-green-700">
                                                            {getReferralTypeIcon(
                                                                program?.refereeBenefit?.type || ''
                                                            )}
                                                            <span>Free course access</span>
                                                        </span>
                                                    ) : program?.refereeBenefit?.type ===
                                                      'free_days' ? (
                                                        <span className="ml-6 flex items-center gap-1 font-semibold text-green-700">
                                                            {getReferralTypeIcon(
                                                                program?.refereeBenefit?.type || ''
                                                            )}
                                                            <span>
                                                                {program?.refereeBenefit?.value}{' '}
                                                                free days
                                                            </span>
                                                        </span>
                                                    ) : program?.refereeBenefit?.type ===
                                                      'bonus_content' ? (
                                                        <span className="ml-6 flex items-center gap-1 font-semibold text-green-700">
                                                            {getReferralTypeIcon(
                                                                program?.refereeBenefit?.type || ''
                                                            )}
                                                            <span>Bonus Content</span>
                                                        </span>
                                                    ) : (
                                                        <span className="ml-6 flex items-center font-semibold text-green-700">
                                                            {getReferralTypeIcon(
                                                                program?.refereeBenefit?.type || ''
                                                            )}
                                                            {program?.refereeBenefit?.value}
                                                            &nbsp;off
                                                        </span>
                                                    )}
                                                </div>
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
