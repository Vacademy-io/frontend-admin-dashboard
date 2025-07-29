export interface CourseInformation {
    descriptionRequired: boolean;
    popularTopicsEnabled: boolean;
    learnerOutcomesRequired: boolean;
    aboutCourseRequired: boolean;
    targetAudienceRequired: boolean;
    previewImageRequired: boolean;
    bannerImageEnabled: boolean;
    bannerImageRequired: boolean;
    courseMediaEnabled: boolean;
}

export interface CourseStructure {
    defaultDepth: number;
    fixCourseDepth: boolean;
    enableSessions: boolean;
    enableLevels: boolean;
}

export interface CatalogueSettings {
    catalogueMode: 'ask' | 'auto' | 'manual';
    autoPublishToCatalogue: boolean;
}

export interface CourseViewSettings {
    defaultViewMode: 'outline' | 'structure';
}

export interface OutlineSettings {
    defaultState: 'expanded' | 'collapsed';
}

export interface Permissions {
    allowLearnersToCreateCourses: boolean;
    allowPaymentOptionChange: boolean;
    allowDiscountOptionChange: boolean;
    allowReferralOptionChange: boolean;
}

export interface CourseSettingsData {
    courseInformation: CourseInformation;
    courseStructure: CourseStructure;
    catalogueSettings: CatalogueSettings;
    courseViewSettings: CourseViewSettings;
    outlineSettings: OutlineSettings;
    permissions: Permissions;
}

export interface CourseSettings {
    key: string;
    name: string;
    data: CourseSettingsData;
}

// API Request/Response types
export interface CourseSettingsRequest {
    setting_name: string;
    setting_data: CourseSettingsData;
}

export interface CourseSettingsResponse {
    key: string;
    name: string;
    data: CourseSettingsData;
}

// Default settings
export const DEFAULT_COURSE_SETTINGS: CourseSettingsData = {
    courseInformation: {
        descriptionRequired: true,
        popularTopicsEnabled: true,
        learnerOutcomesRequired: true,
        aboutCourseRequired: true,
        targetAudienceRequired: true,
        previewImageRequired: true,
        bannerImageEnabled: true,
        bannerImageRequired: true,
        courseMediaEnabled: true,
    },
    courseStructure: {
        defaultDepth: 3,
        fixCourseDepth: false,
        enableSessions: true,
        enableLevels: true,
    },
    catalogueSettings: {
        catalogueMode: 'ask',
        autoPublishToCatalogue: false,
    },
    courseViewSettings: {
        defaultViewMode: 'outline',
    },
    outlineSettings: {
        defaultState: 'expanded',
    },
    permissions: {
        allowLearnersToCreateCourses: false,
        allowPaymentOptionChange: true,
        allowDiscountOptionChange: true,
        allowReferralOptionChange: true,
    },
};
