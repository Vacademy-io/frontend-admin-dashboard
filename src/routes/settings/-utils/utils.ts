import { HOLISTIC_INSTITUTE_ID } from '@/constants/urls';
import { SettingsTabs } from '../-constants/terms';
import PaymentSettings from '../-components/Payment/PaymentSettings';
import ReferralSettings from '../-components/Referral/ReferralSettings';
import CourseSettings from '../-components/Course/CourseSettings';
import TabSettings from '../-components/Tab/TabSettings';
import NamingSettings from '../-components/NamingSettings';

export const getAvailableSettingsTabs = (instituteId: string) => {
    if (instituteId === HOLISTIC_INSTITUTE_ID) {
        return [
            {
                tab: SettingsTabs.Payment,
                value: 'Payment Settings',
                component: PaymentSettings,
            },
            {
                tab: SettingsTabs.Referral,
                value: 'Referral Settings',
                component: ReferralSettings,
            },
        ];
    } else {
        return [
            {
                tab: SettingsTabs.Tab,
                value: 'Tab Settings',
                component: TabSettings,
            },
            {
                tab: SettingsTabs.Naming,
                value: 'Naming Settings',
                component: NamingSettings,
            },
            {
                tab: SettingsTabs.Payment,
                value: 'Payment Settings',
                component: PaymentSettings,
            },
            {
                tab: SettingsTabs.Referral,
                value: 'Referral Settings',
                component: ReferralSettings,
            },
            {
                tab: SettingsTabs.Course,
                value: 'Course Settings',
                component: CourseSettings,
            },
        ];
    }
};
