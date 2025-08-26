import authenticatedAxiosInstance from '@/lib/auth/axiosInstance';
import { getInstituteId } from '@/constants/helper';
import {
    ADMIN_DISPLAY_SETTINGS_KEY,
    TEACHER_DISPLAY_SETTINGS_KEY,
    type DisplaySettingsData,
} from '@/types/display-settings';
import { StorageKey } from '@/constants/storage/storage';
import { DEFAULT_ADMIN_DISPLAY_SETTINGS } from '@/constants/display-settings/admin-defaults';
import { DEFAULT_TEACHER_DISPLAY_SETTINGS } from '@/constants/display-settings/teacher-defaults';

const CACHE_EXPIRY_HOURS = 24;

type RoleKey = typeof ADMIN_DISPLAY_SETTINGS_KEY | typeof TEACHER_DISPLAY_SETTINGS_KEY;

interface CachedDisplaySettings {
    data: DisplaySettingsData;
    timestamp: number;
    instituteId: string;
}

function getLocalStorageKey(role: RoleKey): StorageKey {
    return role === ADMIN_DISPLAY_SETTINGS_KEY
        ? StorageKey.ADMIN_DISPLAY_SETTINGS
        : StorageKey.TEACHER_DISPLAY_SETTINGS;
}

function getDefaults(role: RoleKey): DisplaySettingsData {
    return role === ADMIN_DISPLAY_SETTINGS_KEY
        ? DEFAULT_ADMIN_DISPLAY_SETTINGS
        : DEFAULT_TEACHER_DISPLAY_SETTINGS;
}

function mergeArrayById<T extends { id: string }>(
    partial: Array<Partial<T>> | undefined,
    defaults: Array<T>
): Array<T> {
    const byId = new Map<string, Partial<T>>();
    (partial || []).forEach((item) => {
        if (item && item.id) byId.set(item.id, item);
    });
    const merged: Array<T> = [];
    // Start from defaults to guarantee presence of new fields/tabs
    defaults.forEach((def) => {
        const incoming = byId.get(def.id) || {};
        merged.push({ ...def, ...(incoming as T) });
    });
    // Include custom/unknown items that are not in defaults
    (partial || []).forEach((p) => {
        if (!p.id) return;
        if (!merged.some((m) => m.id === p.id)) {
            merged.push(p as T);
        }
    });
    return merged;
}

function mergeDisplayWithDefaults(
    incoming: Partial<DisplaySettingsData> | null | undefined,
    role: RoleKey
): DisplaySettingsData {
    const defaults = getDefaults(role);
    const merged: DisplaySettingsData = {
        sidebar: [],
        dashboard: { widgets: [] },
        permissions: {
            canViewInstituteDetails: false,
            canEditInstituteDetails: false,
            canViewProfileDetails: false,
            canEditProfileDetails: false,
        },
        postLoginRedirectRoute: '/dashboard',
    };

    // Sidebar merge
    const mergedSidebar = mergeArrayById(
        incoming?.sidebar as Array<Partial<DisplaySettingsData['sidebar'][number]>> | undefined,
        defaults.sidebar
    );
    // Deep-merge subTabs by id
    merged.sidebar = mergedSidebar.map((tab) => {
        const defTab =
            defaults.sidebar.find((d) => d.id === tab.id) ||
            ({
                id: tab.id,
                order: 0,
                visible: true,
                subTabs: [],
            } as DisplaySettingsData['sidebar'][number]);
        const subTabsMerged = mergeArrayById(
            tab.subTabs as
                | Array<
                      Partial<
                          NonNullable<DisplaySettingsData['sidebar'][number]['subTabs']>[number]
                      >
                  >
                | undefined,
            defTab.subTabs || []
        );
        return {
            id: tab.id,
            label: tab.label ?? defTab.label,
            route: tab.route ?? defTab.route,
            order: tab.order ?? defTab.order ?? 0,
            visible: tab.visible ?? defTab.visible ?? true,
            isCustom: tab.isCustom ?? (defTab as Partial<typeof defTab>).isCustom ?? false,
            subTabs: subTabsMerged.map((s) => {
                const defSub =
                    (defTab.subTabs || []).find((d) => d.id === s.id) ||
                    ({ id: s.id!, order: 0, route: '#', visible: true } as NonNullable<
                        DisplaySettingsData['sidebar'][number]['subTabs']
                    >[number]);
                return {
                    id: s.id!,
                    label: s.label ?? defSub.label,
                    route: s.route ?? defSub.route ?? '#',
                    order: s.order ?? defSub.order ?? 0,
                    visible: s.visible ?? defSub.visible ?? true,
                };
            }),
        };
    });

    // Dashboard widgets merge
    const mergedWidgets = mergeArrayById(
        incoming?.dashboard?.widgets as
            | Array<Partial<DisplaySettingsData['dashboard']['widgets'][number]>>
            | undefined,
        defaults.dashboard.widgets
    );
    merged.dashboard.widgets = mergedWidgets.map((w) => {
        const def =
            defaults.dashboard.widgets.find((d) => d.id === w.id) ||
            ({
                id: w.id as DisplaySettingsData['dashboard']['widgets'][number]['id'],
                order: 0,
                visible: true,
            } as DisplaySettingsData['dashboard']['widgets'][number]);
        return {
            id: w.id as DisplaySettingsData['dashboard']['widgets'][number]['id'],
            order: w.order ?? def.order ?? 0,
            visible: w.visible ?? def.visible ?? true,
        };
    });

    // Permissions
    merged.permissions = {
        canViewInstituteDetails:
            incoming?.permissions?.canViewInstituteDetails ??
            defaults.permissions.canViewInstituteDetails,
        canEditInstituteDetails:
            incoming?.permissions?.canEditInstituteDetails ??
            defaults.permissions.canEditInstituteDetails,
        canViewProfileDetails:
            incoming?.permissions?.canViewProfileDetails ??
            defaults.permissions.canViewProfileDetails,
        canEditProfileDetails:
            incoming?.permissions?.canEditProfileDetails ??
            defaults.permissions.canEditProfileDetails,
    };

    // Course List merge with defaults
    const defaultCourseList: NonNullable<DisplaySettingsData['courseList']> =
        defaults.courseList || {
            tabs: [
                { id: 'AllCourses', order: 1, visible: true },
                { id: 'AuthoredCourses', order: 2, visible: true },
                { id: 'CourseApproval', order: 3, visible: true },
                { id: 'CourseInReview', order: 4, visible: true },
            ],
            defaultTab: 'AllCourses' as const,
        };
    const mergedCourseListTabs = mergeArrayById(
        incoming?.courseList?.tabs as
            | Array<{
                  id: string;
                  label?: string;
                  order?: number;
                  visible?: boolean;
              }>
            | undefined,
        defaultCourseList.tabs as Array<{
            id: string;
            label?: string;
            order: number;
            visible: boolean;
        }>
    );
    merged.courseList = {
        tabs: mergedCourseListTabs.map((t) => ({
            id: t.id as unknown as DisplaySettingsData['courseList'] extends infer C
                ? C extends { tabs: Array<infer U> }
                    ? U extends { id: infer I }
                        ? I
                        : never
                    : never
                : never,
            label: t.label,
            order: t.order ?? 0,
            visible: t.visible ?? true,
        })) as NonNullable<DisplaySettingsData['courseList']>['tabs'],
        defaultTab: (incoming?.courseList?.defaultTab ||
            defaultCourseList.defaultTab) as NonNullable<
            DisplaySettingsData['courseList']
        >['defaultTab'],
    };

    // Course Details merge with defaults
    const defaultDetails: NonNullable<DisplaySettingsData['courseDetails']> =
        defaults.courseDetails || {
            tabs: [
                { id: 'OUTLINE', order: 1, visible: true },
                { id: 'CONTENT_STRUCTURE', order: 2, visible: true },
                { id: 'LEARNER', order: 3, visible: true },
                { id: 'TEACHER', order: 4, visible: true },
                { id: 'ASSESSMENT', order: 5, visible: true },
            ],
            defaultTab: 'OUTLINE' as const,
        };
    const mergedDetailsTabs = mergeArrayById(
        incoming?.courseDetails?.tabs as
            | Array<{
                  id: string;
                  label?: string;
                  order?: number;
                  visible?: boolean;
              }>
            | undefined,
        defaultDetails.tabs as Array<{
            id: string;
            label?: string;
            order: number;
            visible: boolean;
        }>
    );
    merged.courseDetails = {
        tabs: mergedDetailsTabs.map((t) => ({
            id: t.id as unknown as DisplaySettingsData['courseDetails'] extends infer C
                ? C extends { tabs: Array<infer U> }
                    ? U extends { id: infer I }
                        ? I
                        : never
                    : never
                : never,
            label: t.label,
            order: t.order ?? 0,
            visible: t.visible ?? true,
        })) as NonNullable<DisplaySettingsData['courseDetails']>['tabs'],
        defaultTab: (incoming?.courseDetails?.defaultTab ||
            defaultDetails.defaultTab) as NonNullable<
            DisplaySettingsData['courseDetails']
        >['defaultTab'],
    };

    // UI
    merged.ui = {
        showSupportButton:
            incoming?.ui?.showSupportButton ?? defaults.ui?.showSupportButton ?? true,
        showSidebar: incoming?.ui?.showSidebar ?? defaults.ui?.showSidebar ?? true,
    };

    // Content Types
    const defCT = defaults.contentTypes || {
        pdf: true,
        video: { enabled: true, showInVideoQuestion: true },
        codeEditor: true,
        document: true,
        question: true,
        quiz: true,
        assignment: true,
        jupyterNotebook: true,
        scratch: true,
    };
    merged.contentTypes = {
        pdf: incoming?.contentTypes?.pdf ?? defCT.pdf,
        video: {
            enabled: incoming?.contentTypes?.video?.enabled ?? defCT.video.enabled,
            showInVideoQuestion:
                incoming?.contentTypes?.video?.showInVideoQuestion ??
                defCT.video.showInVideoQuestion,
        },
        codeEditor: incoming?.contentTypes?.codeEditor ?? defCT.codeEditor,
        document: incoming?.contentTypes?.document ?? defCT.document,
        question: incoming?.contentTypes?.question ?? defCT.question,
        quiz: incoming?.contentTypes?.quiz ?? defCT.quiz,
        assignment: incoming?.contentTypes?.assignment ?? defCT.assignment,
        jupyterNotebook: incoming?.contentTypes?.jupyterNotebook ?? defCT.jupyterNotebook,
        scratch: incoming?.contentTypes?.scratch ?? defCT.scratch,
    };

    // Course Page Settings
    const defCoursePage = defaults.coursePage || {
        viewInviteLinks: true,
        viewCourseConfiguration: true,
        viewCourseOverviewItem: true,
        viewContentNumbering: true,
    };
    merged.coursePage = {
        viewInviteLinks: incoming?.coursePage?.viewInviteLinks ?? defCoursePage.viewInviteLinks,
        viewCourseConfiguration:
            incoming?.coursePage?.viewCourseConfiguration ?? defCoursePage.viewCourseConfiguration,
        viewCourseOverviewItem:
            incoming?.coursePage?.viewCourseOverviewItem ?? defCoursePage.viewCourseOverviewItem,
        viewContentNumbering:
            incoming?.coursePage?.viewContentNumbering ?? defCoursePage.viewContentNumbering,
    };

    // Redirect
    merged.postLoginRedirectRoute =
        incoming?.postLoginRedirectRoute ?? defaults.postLoginRedirectRoute;

    // Slide View Settings
    const defSlideView = defaults.slideView || {
        showCopyTo: true,
        showMoveTo: true,
    };
    merged.slideView = {
        showCopyTo: incoming?.slideView?.showCopyTo ?? defSlideView.showCopyTo,
        showMoveTo: incoming?.slideView?.showMoveTo ?? defSlideView.showMoveTo,
    };

    // Final sort by order
    merged.sidebar.sort((a, b) => (a.order || 0) - (b.order || 0));
    merged.sidebar.forEach((t) => t.subTabs?.sort((a, b) => (a.order || 0) - (b.order || 0)));
    merged.dashboard.widgets.sort((a, b) => (a.order || 0) - (b.order || 0));

    return merged;
}

function readCache(role: RoleKey): DisplaySettingsData | null {
    try {
        const instituteId = getInstituteId();
        if (!instituteId) return null;
        const raw = localStorage.getItem(getLocalStorageKey(role));
        if (!raw) return null;
        const parsed: CachedDisplaySettings = JSON.parse(raw);
        if (parsed.instituteId !== instituteId) {
            localStorage.removeItem(getLocalStorageKey(role));
            return null;
        }
        const age = Date.now() - parsed.timestamp;
        const expiry = CACHE_EXPIRY_HOURS * 60 * 60 * 1000;
        if (age > expiry) {
            localStorage.removeItem(getLocalStorageKey(role));
            return null;
        }
        return mergeDisplayWithDefaults(parsed.data, role);
    } catch (e) {
        console.error('Error reading display settings cache', e);
        localStorage.removeItem(getLocalStorageKey(role));
        return null;
    }
}

function writeCache(role: RoleKey, data: DisplaySettingsData): void {
    try {
        const instituteId = getInstituteId();
        if (!instituteId) return;
        const payload: CachedDisplaySettings = {
            data,
            timestamp: Date.now(),
            instituteId,
        };
        localStorage.setItem(getLocalStorageKey(role), JSON.stringify(payload));
    } catch (e) {
        console.error('Error writing display settings cache', e);
    }
}

export function clearDisplaySettingsCache(role?: RoleKey): void {
    if (role) {
        localStorage.removeItem(getLocalStorageKey(role));
        return;
    }
    localStorage.removeItem(StorageKey.ADMIN_DISPLAY_SETTINGS);
    localStorage.removeItem(StorageKey.TEACHER_DISPLAY_SETTINGS);
}

export async function getDisplaySettings(
    role: RoleKey,
    forceRefresh = false
): Promise<DisplaySettingsData> {
    if (!forceRefresh) {
        const cached = readCache(role);
        if (cached) return cached;
    }

    const instituteId = getInstituteId();
    if (!instituteId) return getDefaults(role);

    try {
        const res = await authenticatedAxiosInstance.get<{ data: DisplaySettingsData | null }>(
            `${import.meta.env.VITE_BACKEND_URL || 'https://backend-stage.vacademy.io'}/admin-core-service/institute/setting/v1/get`,
            {
                params: {
                    instituteId,
                    settingKey: role,
                },
            }
        );

        const serverData = res.data?.data;
        const merged = mergeDisplayWithDefaults(
            serverData && Object.keys(serverData).length > 0 ? serverData : getDefaults(role),
            role
        );
        writeCache(role, merged);
        return merged;
    } catch (error: unknown) {
        // if 510 or not found, use defaults and cache them
        const anyErr = error as { response?: { status?: number; data?: { ex?: string } } };
        if (
            anyErr.response?.status === 510 ||
            anyErr.response?.data?.ex?.includes('Setting not found')
        ) {
            const defaults = mergeDisplayWithDefaults(getDefaults(role), role);
            writeCache(role, defaults);
            return defaults;
        }
        console.warn('Failed to fetch display settings; using defaults');
        return mergeDisplayWithDefaults(getDefaults(role), role);
    }
}

export async function saveDisplaySettings(
    role: RoleKey,
    settings: DisplaySettingsData
): Promise<void> {
    const instituteId = getInstituteId();
    if (!instituteId) return;
    const requestData = {
        setting_name:
            role === ADMIN_DISPLAY_SETTINGS_KEY
                ? 'Admin Display Settings'
                : 'Teacher Display Settings',
        setting_data: settings,
    };
    await authenticatedAxiosInstance.post(
        `${import.meta.env.VITE_BACKEND_URL || 'https://backend-stage.vacademy.io'}/admin-core-service/institute/setting/v1/save-setting`,
        requestData,
        {
            params: { instituteId, settingKey: role },
            headers: { 'Content-Type': 'application/json' },
        }
    );
    const merged = mergeDisplayWithDefaults(settings, role);
    writeCache(role, merged);
}

// Synchronous accessor for router usage
export function getDisplaySettingsFromCache(role: RoleKey): DisplaySettingsData | null {
    return readCache(role);
}
