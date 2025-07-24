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
    PaymentPlanTag,
    PaymentPlanType,
    PaymentPlanApi,
    PaymentOptionApi,
} from '@/types/payment';

export interface SavePaymentOptionRequest {
    id: string;
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
export const transformLocalPlanToApiFormat = (localPlan: PaymentPlan): PaymentPlanApi => {
    let actualPrice = 0;
    let elevatedPrice = 0;
    let validityDays = localPlan.validityDays || 365;

    if (
        localPlan.type === 'subscription' &&
        localPlan.config?.subscription?.customIntervals &&
        localPlan.config.subscription.customIntervals.length > 0
    ) {
        const firstInterval = localPlan.config.subscription.customIntervals[0];
        if (firstInterval) {
            actualPrice = parseFloat(String(firstInterval.price || '0'));
            elevatedPrice = actualPrice;
            if (firstInterval.unit === 'months') {
                validityDays = firstInterval.value * 30;
            } else if (firstInterval.unit === 'days') {
                validityDays = firstInterval.value;
            }
        }
    } else if (localPlan.type === 'upfront' && localPlan.config?.upfront?.fullPrice) {
        actualPrice = parseFloat(localPlan.config.upfront.fullPrice);
        elevatedPrice = actualPrice;
    } else if (localPlan.type === 'donation') {
        actualPrice = parseFloat(localPlan.config?.donation?.minimumAmount || '0');
        elevatedPrice = actualPrice;
    } else if (localPlan.type === 'free') {
        actualPrice = 0;
        elevatedPrice = 0;
    }

    return {
        id: localPlan.id || '',
        name: localPlan.name || '',
        status: 'ACTIVE',
        validity_in_days: validityDays,
        actual_price: actualPrice,
        elevated_price: elevatedPrice,
        currency: localPlan.currency || 'GBP',
        description: localPlan.name || '',
        tag: localPlan.tag || 'free',
        type: localPlan.type || 'subscription',
        feature_json: JSON.stringify(localPlan.features || []),
    };
};

// Helper function to transform API payment plan format to local format
export const transformApiPlanToLocalFormat = (apiPlan: PaymentPlanApi): PaymentPlan => {
    const features = JSON.parse(apiPlan.feature_json || '[]');
    let config = {};
    if (apiPlan.payment_option_metadata_json) {
        try {
            const parsed = JSON.parse(apiPlan.payment_option_metadata_json);
            config = parsed.config || {};
        } catch (e) {
            console.warn('Failed to parse payment_option_metadata_json:', e);
        }
    }
    return {
        id: apiPlan.id,
        name: apiPlan.name,
        type: apiPlan.type as PaymentPlanType,
        tag: apiPlan.tag as PaymentPlanTag,
        currency: apiPlan.currency,
        isDefault: false,
        features: features,
        validityDays: apiPlan.validity_in_days,
        config,
    };
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
