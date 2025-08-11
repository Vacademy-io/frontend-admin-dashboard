import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { MyButton } from '@/components/design-system/button';
import type { DisplaySettingsData } from '@/types/display-settings';
import { TEACHER_DISPLAY_SETTINGS_KEY } from '@/types/display-settings';
import { getDisplaySettings, saveDisplaySettings } from '@/services/display-settings';
import { DEFAULT_TEACHER_DISPLAY_SETTINGS } from '@/constants/display-settings/teacher-defaults';
import { toast } from 'sonner';
import type { CourseListTabId, CourseDetailsTabId } from '@/types/display-settings';

export default function TeacherDisplaySettings() {
    const [settings, setSettings] = useState<DisplaySettingsData | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);

    useEffect(() => {
        const run = async () => {
            const s = await getDisplaySettings(TEACHER_DISPLAY_SETTINGS_KEY);
            // Enforce constraint: teacher should never be able to view settings tab
            s.sidebar = s.sidebar
                .filter((t) => t.id !== 'settings')
                .map((t) => ({ ...t, visible: t.id === 'settings' ? false : t.visible }));
            setSettings(s);
        };
        run();
    }, []);

    const updateSettings = (updater: (prev: DisplaySettingsData) => DisplaySettingsData) => {
        setSettings((prev) => {
            if (!prev) return prev;
            const next = updater(prev);
            setHasChanges(true);
            return next;
        });
    };

    const save = async () => {
        if (!settings) return;
        setIsSaving(true);
        try {
            // Enforce teacher constraints before save
            const fixed: DisplaySettingsData = {
                ...settings,
                sidebar: settings.sidebar.filter((t) => t.id !== 'settings'),
                permissions: {
                    ...settings.permissions,
                    canViewInstituteDetails: settings.permissions.canViewInstituteDetails ?? false,
                    canEditInstituteDetails: false,
                    canEditProfileDetails: settings.permissions.canEditProfileDetails ?? false,
                },
            };
            await saveDisplaySettings(TEACHER_DISPLAY_SETTINGS_KEY, fixed);
            setHasChanges(false);
            toast.success('Teacher display settings saved');
        } catch (e) {
            toast.error('Failed to save');
        } finally {
            setIsSaving(false);
        }
    };

    if (!settings) return <div className="p-2">Loading...</div>;

    return (
        <div className="space-y-6 p-2">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-lg font-bold">Teacher Display Settings</h1>
                    <p className="text-sm text-muted-foreground">
                        Control visibility, ordering, and widgets for Teachers.
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        onClick={() => setSettings(DEFAULT_TEACHER_DISPLAY_SETTINGS)}
                    >
                        Reset to Defaults
                    </Button>
                    <MyButton
                        onClick={save}
                        disabled={isSaving || !hasChanges}
                        className="bg-primary-500"
                    >
                        {isSaving ? 'Saving...' : 'Save Changes'}
                    </MyButton>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Course List Tabs</CardTitle>
                    <CardDescription>
                        Configure visible tabs, their order, and the default tab. Note: Course In
                        Review is always visible for Teachers; Course Approval is hidden.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                    {(
                        [
                            'AllCourses',
                            'AuthoredCourses',
                            'CourseApproval',
                            'CourseInReview',
                        ] as CourseListTabId[]
                    ).map((id) => {
                        const cfg = settings.courseList?.tabs.find((t) => t.id === id) || {
                            id,
                            order: 0,
                            visible: true,
                        };
                        const isForcedVisible = id === 'CourseInReview';
                        const isForcedHidden = id === 'CourseApproval';
                        const disabledToggle = isForcedVisible || isForcedHidden;
                        const enforcedVisible = isForcedVisible
                            ? true
                            : isForcedHidden
                              ? false
                              : cfg.visible;
                        return (
                            <div
                                key={id}
                                className="grid grid-cols-1 items-center gap-3 rounded border p-3 md:grid-cols-5"
                            >
                                <div className="col-span-2 text-sm font-medium">{id}</div>
                                <div>
                                    <Label>Order</Label>
                                    <Input
                                        type="number"
                                        value={cfg.order}
                                        onChange={(e) =>
                                            updateSettings((prev) => ({
                                                ...prev,
                                                courseList: {
                                                    tabs: (prev.courseList?.tabs || []).map((t) =>
                                                        t.id === id
                                                            ? {
                                                                  ...t,
                                                                  order: Number(e.target.value),
                                                              }
                                                            : t
                                                    ),
                                                    defaultTab:
                                                        prev.courseList?.defaultTab ||
                                                        'AuthoredCourses',
                                                },
                                            }))
                                        }
                                    />
                                </div>
                                <div className="flex items-center gap-2 pt-6">
                                    <Switch
                                        checked={enforcedVisible}
                                        disabled={disabledToggle}
                                        onCheckedChange={(checked) =>
                                            updateSettings((prev) => ({
                                                ...prev,
                                                courseList: {
                                                    tabs: (prev.courseList?.tabs || []).map((t) =>
                                                        t.id === id ? { ...t, visible: checked } : t
                                                    ),
                                                    defaultTab:
                                                        prev.courseList?.defaultTab ||
                                                        'AuthoredCourses',
                                                },
                                            }))
                                        }
                                    />
                                    <span className="text-sm">Visible</span>
                                </div>
                                <div className="pt-6">
                                    <label className="flex items-center gap-2 text-sm">
                                        <input
                                            type="radio"
                                            name="teacher-course-list-default"
                                            checked={settings.courseList?.defaultTab === id}
                                            onChange={() =>
                                                updateSettings((prev) => ({
                                                    ...prev,
                                                    courseList: {
                                                        tabs: prev.courseList?.tabs || [],
                                                        defaultTab: id,
                                                    },
                                                }))
                                            }
                                            disabled={isForcedHidden}
                                        />
                                        Default
                                    </label>
                                </div>
                            </div>
                        );
                    })}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Course Details Tabs</CardTitle>
                    <CardDescription>
                        Choose which tabs are visible and set the default tab.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                    {(
                        [
                            'OUTLINE',
                            'CONTENT_STRUCTURE',
                            'LEARNER',
                            'TEACHER',
                            'ASSESSMENT',
                        ] as CourseDetailsTabId[]
                    ).map((id) => {
                        const cfg = settings.courseDetails?.tabs.find((t) => t.id === id) || {
                            id,
                            order: 0,
                            visible: true,
                        };
                        return (
                            <div
                                key={id}
                                className="grid grid-cols-1 items-center gap-3 rounded border p-3 md:grid-cols-5"
                            >
                                <div className="col-span-2 text-sm font-medium">
                                    {id.replace('_', ' ')}
                                </div>
                                <div>
                                    <Label>Order</Label>
                                    <Input
                                        type="number"
                                        value={cfg.order}
                                        onChange={(e) =>
                                            updateSettings((prev) => ({
                                                ...prev,
                                                courseDetails: {
                                                    tabs: (prev.courseDetails?.tabs || []).map(
                                                        (t) =>
                                                            t.id === id
                                                                ? {
                                                                      ...t,
                                                                      order: Number(e.target.value),
                                                                  }
                                                                : t
                                                    ),
                                                    defaultTab:
                                                        prev.courseDetails?.defaultTab ||
                                                        'CONTENT_STRUCTURE',
                                                },
                                            }))
                                        }
                                    />
                                </div>
                                <div className="flex items-center gap-2 pt-6">
                                    <Switch
                                        checked={cfg.visible}
                                        onCheckedChange={(checked) =>
                                            updateSettings((prev) => ({
                                                ...prev,
                                                courseDetails: {
                                                    tabs: (prev.courseDetails?.tabs || []).map(
                                                        (t) =>
                                                            t.id === id
                                                                ? { ...t, visible: checked }
                                                                : t
                                                    ),
                                                    defaultTab:
                                                        prev.courseDetails?.defaultTab ||
                                                        'CONTENT_STRUCTURE',
                                                },
                                            }))
                                        }
                                    />
                                    <span className="text-sm">Visible</span>
                                </div>
                                <div className="pt-6">
                                    <label className="flex items-center gap-2 text-sm">
                                        <input
                                            type="radio"
                                            name="teacher-course-details-default"
                                            checked={settings.courseDetails?.defaultTab === id}
                                            onChange={() =>
                                                updateSettings((prev) => ({
                                                    ...prev,
                                                    courseDetails: {
                                                        tabs: prev.courseDetails?.tabs || [],
                                                        defaultTab: id,
                                                    },
                                                }))
                                            }
                                        />
                                        Default
                                    </label>
                                </div>
                            </div>
                        );
                    })}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>UI Options</CardTitle>
                    <CardDescription>Global UI preferences</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-between rounded border p-3">
                        <div className="text-sm">Show Support Button</div>
                        <Switch
                            checked={settings.ui?.showSupportButton !== false}
                            onCheckedChange={(checked) =>
                                updateSettings((prev) => ({
                                    ...prev,
                                    ui: { showSupportButton: checked },
                                }))
                            }
                        />
                    </div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Sidebar Tabs</CardTitle>
                    <CardDescription>
                        Order and toggle visibility. Settings tab is always hidden for Teachers.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                    {settings.sidebar
                        .slice()
                        .sort((a, b) => a.order - b.order)
                        .map((tab) => (
                            <div key={tab.id} className="rounded border p-3">
                                <div className="grid grid-cols-1 gap-3 md:grid-cols-5 md:items-center">
                                    <div className="col-span-2">
                                        <Label>Tab Name</Label>
                                        <Input
                                            value={tab.label || ''}
                                            onChange={(e) =>
                                                updateSettings((prev) => ({
                                                    ...prev,
                                                    sidebar: prev.sidebar.map((t) =>
                                                        t.id === tab.id
                                                            ? { ...t, label: e.target.value }
                                                            : t
                                                    ),
                                                }))
                                            }
                                        />
                                    </div>
                                    <div>
                                        <Label>Order</Label>
                                        <Input
                                            type="number"
                                            value={tab.order}
                                            onChange={(e) =>
                                                updateSettings((prev) => ({
                                                    ...prev,
                                                    sidebar: prev.sidebar.map((t) =>
                                                        t.id === tab.id
                                                            ? {
                                                                  ...t,
                                                                  order: Number(e.target.value),
                                                              }
                                                            : t
                                                    ),
                                                }))
                                            }
                                        />
                                    </div>
                                    <div>
                                        <Label>Route</Label>
                                        <Input
                                            value={tab.route || ''}
                                            onChange={(e) =>
                                                updateSettings((prev) => ({
                                                    ...prev,
                                                    sidebar: prev.sidebar.map((t) =>
                                                        t.id === tab.id
                                                            ? { ...t, route: e.target.value }
                                                            : t
                                                    ),
                                                }))
                                            }
                                        />
                                    </div>
                                    <div className="flex items-center gap-2 pt-6">
                                        <Switch
                                            checked={tab.visible}
                                            onCheckedChange={(checked) =>
                                                updateSettings((prev) => ({
                                                    ...prev,
                                                    sidebar: prev.sidebar.map((t) =>
                                                        t.id === tab.id
                                                            ? { ...t, visible: checked }
                                                            : t
                                                    ),
                                                }))
                                            }
                                        />
                                        <span className="text-sm">Visible</span>
                                    </div>
                                </div>
                                {tab.subTabs && tab.subTabs.length > 0 && (
                                    <div className="mt-3 space-y-2">
                                        <Label>Sub Tabs</Label>
                                        {tab.subTabs
                                            .slice()
                                            .sort((a, b) => a.order - b.order)
                                            .map((sub) => (
                                                <div
                                                    key={sub.id}
                                                    className="grid grid-cols-1 gap-3 rounded border p-3 md:grid-cols-5 md:items-center"
                                                >
                                                    <div className="col-span-2">
                                                        <Input
                                                            value={sub.label || ''}
                                                            onChange={(e) =>
                                                                updateSettings((prev) => ({
                                                                    ...prev,
                                                                    sidebar: prev.sidebar.map(
                                                                        (t) =>
                                                                            t.id === tab.id
                                                                                ? {
                                                                                      ...t,
                                                                                      subTabs: (
                                                                                          t.subTabs ||
                                                                                          []
                                                                                      ).map((s) =>
                                                                                          s.id ===
                                                                                          sub.id
                                                                                              ? {
                                                                                                    ...s,
                                                                                                    label: e
                                                                                                        .target
                                                                                                        .value,
                                                                                                }
                                                                                              : s
                                                                                      ),
                                                                                  }
                                                                                : t
                                                                    ),
                                                                }))
                                                            }
                                                        />
                                                    </div>
                                                    <div>
                                                        <Input
                                                            type="number"
                                                            value={sub.order}
                                                            onChange={(e) =>
                                                                updateSettings((prev) => ({
                                                                    ...prev,
                                                                    sidebar: prev.sidebar.map(
                                                                        (t) =>
                                                                            t.id === tab.id
                                                                                ? {
                                                                                      ...t,
                                                                                      subTabs: (
                                                                                          t.subTabs ||
                                                                                          []
                                                                                      ).map((s) =>
                                                                                          s.id ===
                                                                                          sub.id
                                                                                              ? {
                                                                                                    ...s,
                                                                                                    order: Number(
                                                                                                        e
                                                                                                            .target
                                                                                                            .value
                                                                                                    ),
                                                                                                }
                                                                                              : s
                                                                                      ),
                                                                                  }
                                                                                : t
                                                                    ),
                                                                }))
                                                            }
                                                        />
                                                    </div>
                                                    <div>
                                                        <Input
                                                            value={sub.route}
                                                            onChange={(e) =>
                                                                updateSettings((prev) => ({
                                                                    ...prev,
                                                                    sidebar: prev.sidebar.map(
                                                                        (t) =>
                                                                            t.id === tab.id
                                                                                ? {
                                                                                      ...t,
                                                                                      subTabs: (
                                                                                          t.subTabs ||
                                                                                          []
                                                                                      ).map((s) =>
                                                                                          s.id ===
                                                                                          sub.id
                                                                                              ? {
                                                                                                    ...s,
                                                                                                    route: e
                                                                                                        .target
                                                                                                        .value,
                                                                                                }
                                                                                              : s
                                                                                      ),
                                                                                  }
                                                                                : t
                                                                    ),
                                                                }))
                                                            }
                                                        />
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Switch
                                                            checked={sub.visible}
                                                            onCheckedChange={(checked) =>
                                                                updateSettings((prev) => ({
                                                                    ...prev,
                                                                    sidebar: prev.sidebar.map(
                                                                        (t) =>
                                                                            t.id === tab.id
                                                                                ? {
                                                                                      ...t,
                                                                                      subTabs: (
                                                                                          t.subTabs ||
                                                                                          []
                                                                                      ).map((s) =>
                                                                                          s.id ===
                                                                                          sub.id
                                                                                              ? {
                                                                                                    ...s,
                                                                                                    visible:
                                                                                                        checked,
                                                                                                }
                                                                                              : s
                                                                                      ),
                                                                                  }
                                                                                : t
                                                                    ),
                                                                }))
                                                            }
                                                        />
                                                        <span className="text-sm">Visible</span>
                                                    </div>
                                                </div>
                                            ))}
                                    </div>
                                )}
                            </div>
                        ))}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Dashboard Widgets</CardTitle>
                    <CardDescription>
                        Order and toggle which widgets teachers can see.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                    {settings.dashboard.widgets
                        .slice()
                        .sort((a, b) => a.order - b.order)
                        .map((w) => (
                            <div
                                key={w.id}
                                className="grid grid-cols-1 items-center gap-3 rounded border p-3 md:grid-cols-4"
                            >
                                <div className="text-sm font-medium">{w.id}</div>
                                <div>
                                    <Label>Order</Label>
                                    <Input
                                        type="number"
                                        value={w.order}
                                        onChange={(e) =>
                                            updateSettings((prev) => ({
                                                ...prev,
                                                dashboard: {
                                                    widgets: prev.dashboard.widgets.map((x) =>
                                                        x.id === w.id
                                                            ? {
                                                                  ...x,
                                                                  order: Number(e.target.value),
                                                              }
                                                            : x
                                                    ),
                                                },
                                            }))
                                        }
                                    />
                                </div>
                                <div className="flex items-center gap-2 pt-6">
                                    <Switch
                                        checked={w.visible}
                                        onCheckedChange={(checked) =>
                                            updateSettings((prev) => ({
                                                ...prev,
                                                dashboard: {
                                                    widgets: prev.dashboard.widgets.map((x) =>
                                                        x.id === w.id
                                                            ? { ...x, visible: checked }
                                                            : x
                                                    ),
                                                },
                                            }))
                                        }
                                    />
                                    <span className="text-sm">Visible</span>
                                </div>
                            </div>
                        ))}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Permissions</CardTitle>
                    <CardDescription>
                        Configure institute and profile visibility and edit access.
                    </CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    {(
                        [
                            ['canViewInstituteDetails', 'Can View Institute Details'],
                            ['canEditInstituteDetails', 'Can Edit Institute Details'],
                            ['canViewProfileDetails', 'Can View Profile Details'],
                            ['canEditProfileDetails', 'Can Edit Profile Details'],
                        ] as const
                    ).map(([key, label]) => (
                        <div
                            key={key}
                            className="flex items-center justify-between rounded border p-3"
                        >
                            <div className="text-sm">{label}</div>
                            <Switch
                                checked={
                                    settings.permissions[
                                        key as keyof DisplaySettingsData['permissions']
                                    ]
                                }
                                onCheckedChange={(checked) =>
                                    updateSettings((prev) => ({
                                        ...prev,
                                        permissions: {
                                            ...prev.permissions,
                                            [key as keyof DisplaySettingsData['permissions']]:
                                                checked,
                                        } as DisplaySettingsData['permissions'],
                                    }))
                                }
                                disabled={key === 'canEditInstituteDetails'}
                            />
                        </div>
                    ))}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Post-login Redirect</CardTitle>
                    <CardDescription>
                        Choose where to redirect teachers after login.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="max-w-md">
                        <Label>Route</Label>
                        <Input
                            value={settings.postLoginRedirectRoute}
                            onChange={(e) =>
                                updateSettings((prev) => ({
                                    ...prev,
                                    postLoginRedirectRoute: e.target.value,
                                }))
                            }
                        />
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
