import { useCourseSettingsContext } from '@/providers/course-settings-provider';

export const useCourseSettings = () => {
    // Simply return the context data - no more duplicate API calls!
    return useCourseSettingsContext();
};
