import authenticatedAxiosInstance from '@/lib/auth/axiosInstance';
import {
    InstituteDetailsType,
    SubModuleType,
} from '@/schemas/student/student-list/institute-schema';
import { useInstituteDetailsStore } from '@/stores/students/students-list/useInstituteDetailsStore';
import { HOLISTIC_INSTITUTE_ID, INIT_INSTITUTE, INIT_INSTITUTE_SETUP } from '@/constants/urls';
import { getCurrentInstituteId } from '@/lib/auth/instituteUtils';
import { useTheme } from '@/providers/theme/theme-provider';
import { StorageKey } from '@/constants/storage/storage';
import useLocalStorage from '@/hooks/use-local-storage';
import { isNullOrEmptyOrUndefined } from '@/lib/utils';
import { NamingSettingsType } from '@/routes/settings/-constants/terms';

export const fetchInstituteSetup = async (): Promise<any> => {
    const INSTITUTE_ID = getCurrentInstituteId();
    const response = await authenticatedAxiosInstance({
        method: 'GET',
        url: `${INIT_INSTITUTE_SETUP}/${INSTITUTE_ID}`,
    });
    
    // Transform the nested response to flat structure
    const setupData = response.data;
    const transformedData = {
        ...setupData.institute_info_dto,
        sub_org_roles: setupData.sub_org_roles || [],
        dropdown_custom_fields: setupData.dropdown_custom_fields || [],
    };
    
    return transformedData;
};

export const fetchInstituteDetails = async (): Promise<InstituteDetailsType> => {
    const INSTITUTE_ID = getCurrentInstituteId();
    const response = await authenticatedAxiosInstance<InstituteDetailsType>({
        method: 'GET',
        url: `${INIT_INSTITUTE}/${INSTITUTE_ID}`,
    });
    return response.data;
};

// Fetch both APIs in parallel and merge the results
export const fetchBothInstituteAPIs = async (): Promise<InstituteDetailsType> => {
    const [instituteData, setupData] = await Promise.all([
        fetchInstituteDetails(),
        fetchInstituteSetup()
    ]);
    
    // Merge: base institute data + setup data overlay (filters from setup take precedence)
    const mergedData: InstituteDetailsType = {
        ...instituteData,
        // Override/add filter-related fields from INIT_INSTITUTE_SETUP
        sub_org_roles: setupData?.sub_org_roles || [],
        dropdown_custom_fields: setupData?.dropdown_custom_fields || [],
        // Keep batches_for_sessions from setup if it has is_org_associated data
        batches_for_sessions: setupData?.batches_for_sessions || instituteData?.batches_for_sessions || [],
        // Ensure required arrays are never undefined
        levels: instituteData?.levels || [],
        sessions: instituteData?.sessions || [],
        subjects: instituteData?.subjects || [],
        session_expiry_days: instituteData?.session_expiry_days || [],
        student_statuses: instituteData?.student_statuses || [],
        genders: instituteData?.genders || [],
        tags: instituteData?.tags || [],
    };
    
    return mergedData;
}

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
        queryKey: ['GET_BOTH_INSTITUTE_APIS', 'v4'],
        queryFn: async () => {
            const data = await fetchBothInstituteAPIs();
            const INSTITUTE_ID = getCurrentInstituteId();
            
            // Try to parse settings if they exist
            try {
                if (data?.setting) {
                    const instituteSettings = JSON.parse(data.setting);
                    if (!isNullOrEmptyOrUndefined(instituteSettings)) {
                        const namingSettings = instituteSettings.setting?.NAMING_SETTING;
                        if (namingSettings) {
                            setValue(namingSettings.data.data);
                        }
                    }
                }
                if (data && !isNullOrEmptyOrUndefined(data.sub_modules)) {
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
