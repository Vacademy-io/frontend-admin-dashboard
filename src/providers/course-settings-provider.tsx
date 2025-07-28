import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getCourseSettings, mergeWithDefaults } from '@/services/course-settings';
import { CourseSettingsData, DEFAULT_COURSE_SETTINGS } from '@/types/course-settings';

interface CourseSettingsContextType {
    settings: CourseSettingsData;
    loading: boolean;
    error: string | null;
    // Helper methods for easier access
    courseInformation: CourseSettingsData['courseInformation'];
    courseStructure: CourseSettingsData['courseStructure'];
    catalogueSettings: CourseSettingsData['catalogueSettings'];
    courseViewSettings: CourseSettingsData['courseViewSettings'];
    outlineSettings: CourseSettingsData['outlineSettings'];
    permissions: CourseSettingsData['permissions'];
}

const CourseSettingsContext = createContext<CourseSettingsContextType | undefined>(undefined);

interface CourseSettingsProviderProps {
    children: ReactNode;
}

export const CourseSettingsProvider: React.FC<CourseSettingsProviderProps> = ({ children }) => {
    const [settings, setSettings] = useState<CourseSettingsData>(DEFAULT_COURSE_SETTINGS);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadSettings = async () => {
            try {
                setLoading(true);
                setError(null);
                const courseSettings = await getCourseSettings();

                // Always ensure we have valid settings, even if API returns null
                if (courseSettings) {
                    const mergedSettings = mergeWithDefaults(courseSettings);
                    setSettings(mergedSettings);
                } else {
                    console.log('Course settings API returned null, using default settings');
                    setSettings(DEFAULT_COURSE_SETTINGS);
                }
            } catch (err) {
                console.error('Error loading course settings:', err);
                // Don't set error for null responses - just use defaults
                setError(null);
                setSettings(DEFAULT_COURSE_SETTINGS);
            } finally {
                setLoading(false);
            }
        };

        loadSettings();
    }, []);

    const contextValue: CourseSettingsContextType = {
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

    return (
        <CourseSettingsContext.Provider value={contextValue}>
            {children}
        </CourseSettingsContext.Provider>
    );
};

export const useCourseSettingsContext = (): CourseSettingsContextType => {
    const context = useContext(CourseSettingsContext);
    if (context === undefined) {
        throw new Error('useCourseSettingsContext must be used within a CourseSettingsProvider');
    }
    return context;
};
