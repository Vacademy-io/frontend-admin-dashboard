import authenticatedAxiosInstance from '@/lib/auth/axiosInstance';
import { GET_DEFAULT_PAYMENT_OPTION, SCHOOL_ENROLL } from '@/constants/urls';

export interface SchoolEnrollPayload {
    user: {
        id: string;
    };
    institute_id: string;
    package_session_id: string;
    cpo_id: string;
    payment_option_id?: string | null;
    enroll_invite_id?: string | null;
    school_payment: {
        payment_mode: string;
        amount: number;
        manual_payment: {
            file_id: string;
            transaction_id: string;
        };
    };
    start_date?: string;
}

export const schoolEnroll = async (payload: SchoolEnrollPayload) => {
    const response = await authenticatedAxiosInstance.post(SCHOOL_ENROLL, payload);
    return response.data;
};

export const fetchDefaultPaymentOptionId = async (instituteId: string) => {
    const response = await authenticatedAxiosInstance.get(GET_DEFAULT_PAYMENT_OPTION, {
        params: {
            source: 'INSTITUTE',
            sourceId: instituteId,
        },
    });
    const data = response.data as {
        id?: string;
        payment_option_id?: string;
        paymentOptionId?: string;
        payment_option?: { id?: string };
    };
    return (
        data?.id ??
        data?.payment_option_id ??
        data?.paymentOptionId ??
        data?.payment_option?.id ??
        null
    );
};
