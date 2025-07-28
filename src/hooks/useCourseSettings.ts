import { useState, useEffect } from 'react';
import { getCourseSettings, mergeWithDefaults } from '@/services/course-settings';
import { CourseSettingsData, DEFAULT_COURSE_SETTINGS } from '@/types/course-settings';

export const useCourseSettings = () => {
    const [settings, setSettings] = useState<CourseSettingsData>(DEFAULT_COURSE_SETTINGS);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadSettings = async () => {
            try {
                setLoading(true);
                setError(null);
                const courseSettings = await getCourseSettings();
                const mergedSettings = mergeWithDefaults(courseSettings);
                setSettings(mergedSettings);
            } catch (err) {
                console.error('Error loading course settings:', err);
                setError('Failed to load course settings');
                // Use default settings as fallback
                setSettings(DEFAULT_COURSE_SETTINGS);
            } finally {
                setLoading(false);
            }
        };

        loadSettings();
    }, []);

    return {
        settings,
        loading,
        error,
        // Helper methods for easier access
        courseInformation: settings.courseInformation,
        courseStructure: settings.courseStructure,
        catalogueSettings: settings.catalogueSettings,
        courseViewSettings: settings.courseViewSettings,
        outlineSettings: settings.outlineSettings,
        permissions: settings.permissions,
    };
};
