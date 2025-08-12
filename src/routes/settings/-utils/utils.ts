import { HOLISTIC_INSTITUTE_ID } from '@/constants/urls';
import { SettingsTabs } from '../-constants/terms';
import PaymentSettings from '../-components/Payment/PaymentSettings';
import ReferralSettings from '../-components/Referral/ReferralSettings';
import CourseSettings from '../-components/Course/CourseSettings';
import TabSettings from '../-components/Tab/TabSettings';
import NamingSettings from '../-components/NamingSettings';
import NotificationSettings from '../-components/Notification/NotificationSettings';
import AdminDisplaySettings from '../-components/RoleDisplay/AdminDisplaySettings';
import TeacherDisplaySettings from '../-components/RoleDisplay/TeacherDisplaySettings';
import StudentDisplaySettings from '@/routes/settings/-components/RoleDisplay/StudentDisplaySettings';

export const getAvailableSettingsTabs = (instituteId: string) => {
    if (instituteId === HOLISTIC_INSTITUTE_ID) {
        return [
            {
                tab: SettingsTabs.Payment,
                value: 'Payment Settings',
                component: PaymentSettings,
            },
            {
                tab: SettingsTabs.Notification,
                value: 'Notification Settings',
                component: NotificationSettings,
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
                tab: SettingsTabs.AdminDisplay,
                value: 'Admin Display',
                component: AdminDisplaySettings,
            },
            {
                tab: SettingsTabs.TeacherDisplay,
                value: 'Teacher Display',
                component: TeacherDisplaySettings,
            },
            {
                tab: SettingsTabs.StudentDisplay,
                value: 'Student Display',
                component: StudentDisplaySettings,
            },
            {
                tab: SettingsTabs.Naming,
                value: 'Naming Settings',
                component: NamingSettings,
            },
            {
                tab: SettingsTabs.Notification,
                value: 'Notification Settings',
                component: NotificationSettings,
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
