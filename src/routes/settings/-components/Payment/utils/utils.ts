import { PaymentPlans } from '@/types/payment';

export interface FreePlanInfo {
    id: string;
    requireApproval: boolean;
}

export interface FreePlanRestrictions {
    canCreate: boolean;
    canCreateWithApproval: boolean;
    canCreateWithoutApproval: boolean;
    existingApprovalPlans: number;
    existingNonApprovalPlans: number;
    totalFreePlans: number;
}

export const getFreePlanRestrictions = (
    existingFreePlans: FreePlanInfo[]
): FreePlanRestrictions => {
    const freePlansCount = existingFreePlans.length;
    const approvalPlans = existingFreePlans.filter((plan) => plan.requireApproval);
    const nonApprovalPlans = existingFreePlans.filter((plan) => !plan.requireApproval);

    return {
        canCreate: freePlansCount < 2,
        canCreateWithApproval: freePlansCount < 2 && approvalPlans.length === 0,
        canCreateWithoutApproval: freePlansCount < 2 && nonApprovalPlans.length === 0,
        existingApprovalPlans: approvalPlans.length,
        existingNonApprovalPlans: nonApprovalPlans.length,
        totalFreePlans: freePlansCount,
    };
};

export const isFreePlanDisabled = (existingFreePlans: FreePlanInfo[]): boolean => {
    const restrictions = getFreePlanRestrictions(existingFreePlans);
    return !restrictions.canCreate;
};

export const getFreePlanRestrictionMessage = (existingFreePlans: FreePlanInfo[]): string | null => {
    const restrictions = getFreePlanRestrictions(existingFreePlans);

    if (restrictions.totalFreePlans >= 2) {
        return 'Maximum 2 free plans allowed. Please delete an existing free plan to create a new one.';
    }

    if (restrictions.existingApprovalPlans > 0 && restrictions.existingNonApprovalPlans > 0) {
        return 'You already have both approval and non-approval free plans. Cannot create additional free plans.';
    }

    if (restrictions.existingApprovalPlans > 0) {
        return 'You already have a free plan with approval. You can only create a free plan without approval.';
    }

    if (restrictions.existingNonApprovalPlans > 0) {
        return 'You already have a free plan without approval. You can only create a free plan with approval.';
    }

    return null;
};

export const isApprovalToggleDisabled = (
    planType: string,
    existingFreePlans: FreePlanInfo[]
): boolean => {
    return planType === PaymentPlans.FREE && existingFreePlans.length > 0;
};

export const getApprovalToggleMessage = (
    planType: string,
    existingFreePlans: FreePlanInfo[]
): string | null => {
    if (planType !== PaymentPlans.FREE) return null;

    const restrictions = getFreePlanRestrictions(existingFreePlans);
    if (restrictions.existingApprovalPlans > 0) {
        return 'Approval is disabled because you already have a free plan with approval. This plan will be created without approval.';
    }
    if (restrictions.existingNonApprovalPlans > 0) {
        return 'Approval is required because you already have a free plan without approval. This plan will be created with approval.';
    }
    return null;
};

export const getRequiredApprovalStatus = (existingFreePlans: FreePlanInfo[]): boolean => {
    const restrictions = getFreePlanRestrictions(existingFreePlans);
    if (restrictions.existingApprovalPlans > 0) {
        return false; // Must be non-approval
    } else if (restrictions.existingNonApprovalPlans > 0) {
        return true; // Must be approval
    }
    return false; // Default to non-approval
};

export const getTotalSteps = (planType: string): number => {
    let baseSteps = 3; // Basic plan creation steps

    if (planType === PaymentPlans.FREE) {
        baseSteps = 2;
    } else if (planType === PaymentPlans.DONATION) {
        baseSteps = 2;
    }

    // Add one final step for referral configuration
    baseSteps += 1;

    return baseSteps;
};

export const currencySymbols: { [key: string]: string } = {
    USD: '$',
    EUR: '€',
    GBP: '£',
    INR: '₹',
    AUD: 'A$',
    CAD: 'C$',
};

export const getCurrencySymbol = (currencyCode: string) => {
    return currencySymbols[currencyCode] || currencyCode;
};
