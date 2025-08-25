import { getInstituteId } from '@/constants/helper';
import { CONFIGURE_CERTIFICATE_SETTINGS } from '@/constants/urls';
import authenticatedAxiosInstance from '@/lib/auth/axiosInstance';

export const handleConfigureCertificateSettings = async () => {
    const instituteId = getInstituteId();
    const response = await authenticatedAxiosInstance({
        method: 'POST',
        url: CONFIGURE_CERTIFICATE_SETTINGS,
        params: {
            instituteId,
        },
        data: {},
    });
    return response?.data;
};
