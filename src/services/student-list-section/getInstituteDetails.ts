import authenticatedAxiosInstance from '@/lib/auth/axiosInstance';
import {
    InstituteDetailsType,
    SubModuleType,
} from '@/schemas/student/student-list/institute-schema';
import { useInstituteDetailsStore } from '@/stores/students/students-list/useInstituteDetailsStore';
import { HOLISTIC_INSTITUTE_ID, INIT_INSTITUTE } from '@/constants/urls';
import { getTokenDecodedData, getTokenFromCookie } from '@/lib/auth/sessionUtility';
import { TokenKey } from '@/constants/auth/tokens';
import { getCurrentInstituteId } from '@/lib/auth/instituteUtils';
import { useTheme } from '@/providers/theme/theme-provider';
import { StorageKey } from '@/constants/storage/storage';
import useLocalStorage from '@/hooks/use-local-storage';
import { isNullOrEmptyOrUndefined } from '@/lib/utils';
import { NamingSettingsType } from '@/routes/settings/-constants/terms';

export const fetchInstituteDetails = async (): Promise<InstituteDetailsType> => {
    const INSTITUTE_ID = getCurrentInstituteId();
    const response = await authenticatedAxiosInstance<InstituteDetailsType>({
        method: 'GET',
        url: `${INIT_INSTITUTE}/${INSTITUTE_ID}`,
    });
    return response.data;
};

export const useInstituteQuery = () => {
    const setInstituteDetails = useInstituteDetailsStore((state) => state.setInstituteDetails);
    const { setValue } = useLocalStorage<NamingSettingsType[] | null>(
        StorageKey.NAMING_SETTINGS,
        null
    );
    const { setValue: setModules } = useLocalStorage<SubModuleType[] | null>(
        StorageKey.MODULES,
        null
    );
    const { setPrimaryColor } = useTheme();

    return {
        queryKey: ['GET_INIT_INSTITUTE'],
        queryFn: async () => {
            const data = await fetchInstituteDetails();
            const INSTITUTE_ID = getCurrentInstituteId();
            const instituteSettings = JSON.parse(data?.setting || '{}');
            try {
                if (!isNullOrEmptyOrUndefined(instituteSettings)) {
                    const namingSettings = instituteSettings.setting.NAMING_SETTING;
                    setValue(namingSettings.data.data);
                }
                if (!isNullOrEmptyOrUndefined(data)) {
                    setModules(data.sub_modules);
                }
            } catch (error) {
                console.error('Error setting naming settings:', error);
            }
            // Set holistic theme for specific institute ID
            if (INSTITUTE_ID === HOLISTIC_INSTITUTE_ID) {
                setPrimaryColor('holistic');
            } else {
                setPrimaryColor(data?.institute_theme_code || '#ED7424');
            }

            setInstituteDetails(data);
            return data;
        },
        staleTime: 3600000,
    };
};
