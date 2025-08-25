import { getInstituteId } from '@/constants/helper';
import { CONFIGURE_CERTIFICATE_SETTINGS } from '@/constants/urls';
import authenticatedAxiosInstance from '@/lib/auth/axiosInstance';
import { certificateHtml } from '../-utils/certificate-html';

export const handleConfigureCertificateSettings = async (
    isEnabled: boolean,
    isCertificateExists: boolean,
    placeHoldersMapping: Record<string, string>
) => {
    const instituteId = getInstituteId();
    const response = await authenticatedAxiosInstance({
        method: 'POST',
        url: CONFIGURE_CERTIFICATE_SETTINGS,
        params: {
            instituteId,
        },
        data: !isCertificateExists
            ? { request: null }
            : {
                  request: {
                      COURSE_COMPLETION: {
                          key: 'COURSE_COMPLETION',
                          is_default_certificate_setting_on: isEnabled,
                          default_html_certificate_template: certificateHtml,
                          current_html_certificate_template: certificateHtml,
                          custom_html_certificate_template: null,
                          place_holders_mapping: placeHoldersMapping,
                      },
                  },
              },
    });
    return response?.data;
};
