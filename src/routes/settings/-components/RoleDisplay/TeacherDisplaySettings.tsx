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
import type {
    CourseListTabId,
    CourseDetailsTabId,
    CourseContentTypeSettings,
} from '@/types/display-settings';

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

    const addCustomTab = () => {
        if (!settings) return;
        const maxOrder = Math.max(0, ...settings.sidebar.map((t) => t.order));
        const newTab = {
            id: `custom-${Date.now()}`,
            label: 'Custom Tab',
            route: '/',
            order: maxOrder + 1,
            visible: true,
            subTabs: [],
            isCustom: true,
        } as DisplaySettingsData['sidebar'][number];
        updateSettings((prev) => ({ ...prev, sidebar: [...prev.sidebar, newTab] }));
    };

    const addSubTab = (parentId: string) => {
        if (!settings) return;
        updateSettings((prev) => ({
            ...prev,
            sidebar: prev.sidebar.map((t) => {
                if (t.id !== parentId) return t;
                const nextOrder = ((t.subTabs?.length || 0) + 1) as number;
                const sub = {
                    id: `custom-sub-${Date.now()}`,
                    label: 'Custom Sub Tab',
                    route: '/',
                    order: nextOrder,
                    visible: true,
                };
                return { ...t, subTabs: [...(t.subTabs || []), sub] };
            }),
        }));
    };

    const removeCustomTab = (tabId: string) => {
        if (!settings) return;
        const t = settings.sidebar.find((x) => x.id === tabId);
        if (!t?.isCustom) return;
        updateSettings((prev) => ({
            ...prev,
            sidebar: prev.sidebar.filter((x) => x.id !== tabId),
        }));
    };

    const removeCustomSubTab = (parentId: string, subId: string) => {
        if (!settings) return;
        updateSettings((prev) => ({
            ...prev,
            sidebar: prev.sidebar.map((t) => {
                if (t.id !== parentId) return t;
                const filtered = (t.subTabs || []).filter(
                    (s) => s.id !== subId || !s.id.startsWith('custom-sub-')
                );
                return { ...t, subTabs: filtered };
            }),
        }));
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
                    <CardTitle>Course Page Settings</CardTitle>
                    <CardDescription>Control visibility of course page elements.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                    {(
                        [
                            ['viewInviteLinks', 'View invite links'],
                            ['viewCourseConfiguration', 'View course configuration'],
                            ['viewCourseOverviewItem', 'View course overview item'],
                            ['viewContentNumbering', 'View content numbering'],
                        ] as const
                    ).map(([key, label]) => (
                        <div
                            key={key}
                            className="flex items-center justify-between rounded border p-3"
                        >
                            <div className="text-sm">{label}</div>
                            <Switch
                                checked={settings.coursePage?.[key] !== false}
                                onCheckedChange={(checked) =>
                                    updateSettings((prev) => ({
                                        ...prev,
                                        coursePage: {
                                            viewInviteLinks:
                                                prev.coursePage?.viewInviteLinks ?? true,
                                            viewCourseConfiguration:
                                                prev.coursePage?.viewCourseConfiguration ?? true,
                                            viewCourseOverviewItem:
                                                prev.coursePage?.viewCourseOverviewItem ?? true,
                                            viewContentNumbering:
                                                prev.coursePage?.viewContentNumbering ?? true,
                                            [key]: checked,
                                        },
                                    }))
                                }
                            />
                        </div>
                    ))}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Slide View Settings</CardTitle>
                    <CardDescription>Control action visibility in Slide view.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                    {(
                        [
                            ['showCopyTo', 'Show "Copy to" option'],
                            ['showMoveTo', 'Show "Move to" option'],
                        ] as const
                    ).map(([key, label]) => (
                        <div
                            key={key}
                            className="flex items-center justify-between rounded border p-3"
                        >
                            <div className="text-sm">{label}</div>
                            <Switch
                                checked={settings.slideView?.[key] !== false}
                                onCheckedChange={(checked) =>
                                    updateSettings((prev) => ({
                                        ...prev,
                                        slideView: {
                                            showCopyTo: prev.slideView?.showCopyTo ?? true,
                                            showMoveTo: prev.slideView?.showMoveTo ?? true,
                                            [key]: checked,
                                        },
                                    }))
                                }
                            />
                        </div>
                    ))}
                </CardContent>
            </Card>

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
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center justify-between rounded border p-3">
                            <div className="text-sm">Show Support Button</div>
                            <Switch
                                checked={settings.ui?.showSupportButton !== false}
                                onCheckedChange={(checked) =>
                                    updateSettings((prev) => ({
                                        ...prev,
                                        ui: { ...prev.ui, showSupportButton: checked },
                                    }))
                                }
                            />
                        </div>
                        <div className="flex items-center justify-between rounded border p-3">
                            <div className="text-sm">Show Sidebar</div>
                            <Switch
                                checked={settings.ui?.showSidebar !== false}
                                onCheckedChange={(checked) =>
                                    updateSettings((prev) => ({
                                        ...prev,
                                        ui: {
                                            showSupportButton: prev.ui?.showSupportButton ?? true,
                                            showSidebar: checked,
                                        },
                                    }))
                                }
                            />
                        </div>
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
                                    {tab.isCustom && (
                                        <div className="pt-6">
                                            <Button
                                                variant="destructive"
                                                onClick={() => removeCustomTab(tab.id)}
                                            >
                                                Remove Tab
                                            </Button>
                                        </div>
                                    )}
                                </div>
                                <div className="mt-3 space-y-2">
                                    <div className="flex items-center justify-between">
                                        <Label>Sub Tabs</Label>
                                        <Button variant="outline" onClick={() => addSubTab(tab.id)}>
                                            Add Sub Tab
                                        </Button>
                                    </div>
                                    {(tab.subTabs || [])
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
                                                                sidebar: prev.sidebar.map((t) =>
                                                                    t.id === tab.id
                                                                        ? {
                                                                              ...t,
                                                                              subTabs: (
                                                                                  t.subTabs || []
                                                                              ).map((s) =>
                                                                                  s.id === sub.id
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
                                                                sidebar: prev.sidebar.map((t) =>
                                                                    t.id === tab.id
                                                                        ? {
                                                                              ...t,
                                                                              subTabs: (
                                                                                  t.subTabs || []
                                                                              ).map((s) =>
                                                                                  s.id === sub.id
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
                                                                sidebar: prev.sidebar.map((t) =>
                                                                    t.id === tab.id
                                                                        ? {
                                                                              ...t,
                                                                              subTabs: (
                                                                                  t.subTabs || []
                                                                              ).map((s) =>
                                                                                  s.id === sub.id
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
                                                                sidebar: prev.sidebar.map((t) =>
                                                                    t.id === tab.id
                                                                        ? {
                                                                              ...t,
                                                                              subTabs: (
                                                                                  t.subTabs || []
                                                                              ).map((s) =>
                                                                                  s.id === sub.id
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
                                                {sub.id.startsWith('custom-sub-') && (
                                                    <div className="pt-2">
                                                        <Button
                                                            variant="destructive"
                                                            onClick={() =>
                                                                removeCustomSubTab(tab.id, sub.id)
                                                            }
                                                        >
                                                            Remove
                                                        </Button>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                </div>
                            </div>
                        ))}
                    <div className="pt-2">
                        <Button variant="outline" onClick={addCustomTab}>
                            Add Custom Tab
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Course Content Types</CardTitle>
                    <CardDescription>
                        Enable or disable slide content types. Video has an extra in-video question
                        option.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                    {(
                        [
                            ['pdf', 'PDF'],
                            ['codeEditor', 'Code Editor'],
                            ['document', 'Document'],
                            ['question', 'Question'],
                            ['quiz', 'Quiz'],
                            ['assignment', 'Assignment'],
                            ['jupyterNotebook', 'Jupyter Notebook'],
                            ['scratch', 'Scratch'],
                        ] as const satisfies ReadonlyArray<
                            readonly [keyof Omit<CourseContentTypeSettings, 'video'>, string]
                        >
                    ).map(([key, label]) => (
                        <div
                            key={key}
                            className="flex items-center justify-between rounded border p-3"
                        >
                            <div className="text-sm">{label}</div>
                            <Switch
                                checked={settings.contentTypes?.[key] !== false}
                                onCheckedChange={(checked) =>
                                    updateSettings((prev) => {
                                        const base: CourseContentTypeSettings = {
                                            pdf: prev.contentTypes?.pdf ?? true,
                                            codeEditor: prev.contentTypes?.codeEditor ?? true,
                                            document: prev.contentTypes?.document ?? true,
                                            question: prev.contentTypes?.question ?? true,
                                            quiz: prev.contentTypes?.quiz ?? true,
                                            assignment: prev.contentTypes?.assignment ?? true,
                                            jupyterNotebook:
                                                prev.contentTypes?.jupyterNotebook ?? true,
                                            scratch: prev.contentTypes?.scratch ?? true,
                                            video: {
                                                enabled: prev.contentTypes?.video?.enabled ?? true,
                                                showInVideoQuestion:
                                                    prev.contentTypes?.video?.showInVideoQuestion ??
                                                    true,
                                            },
                                        };
                                        return {
                                            ...prev,
                                            contentTypes: {
                                                ...base,
                                                [key]: checked,
                                            },
                                        };
                                    })
                                }
                            />
                        </div>
                    ))}
                    <div className="space-y-2 rounded border p-3">
                        <div className="flex items-center justify-between">
                            <div className="text-sm">Video</div>
                            <Switch
                                checked={settings.contentTypes?.video?.enabled !== false}
                                onCheckedChange={(checked) =>
                                    updateSettings((prev) => {
                                        const base: CourseContentTypeSettings = {
                                            pdf: prev.contentTypes?.pdf ?? true,
                                            codeEditor: prev.contentTypes?.codeEditor ?? true,
                                            document: prev.contentTypes?.document ?? true,
                                            question: prev.contentTypes?.question ?? true,
                                            quiz: prev.contentTypes?.quiz ?? true,
                                            assignment: prev.contentTypes?.assignment ?? true,
                                            jupyterNotebook:
                                                prev.contentTypes?.jupyterNotebook ?? true,
                                            scratch: prev.contentTypes?.scratch ?? true,
                                            video: {
                                                enabled: prev.contentTypes?.video?.enabled ?? true,
                                                showInVideoQuestion:
                                                    prev.contentTypes?.video?.showInVideoQuestion ??
                                                    true,
                                            },
                                        };
                                        return {
                                            ...prev,
                                            contentTypes: {
                                                ...base,
                                                video: {
                                                    enabled: checked,
                                                    showInVideoQuestion:
                                                        base.video.showInVideoQuestion,
                                                },
                                            },
                                        };
                                    })
                                }
                            />
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="text-sm">In-video Question Visible</div>
                            <Switch
                                checked={
                                    settings.contentTypes?.video?.showInVideoQuestion !== false
                                }
                                onCheckedChange={(checked) =>
                                    updateSettings((prev) => {
                                        const base: CourseContentTypeSettings = {
                                            pdf: prev.contentTypes?.pdf ?? true,
                                            codeEditor: prev.contentTypes?.codeEditor ?? true,
                                            document: prev.contentTypes?.document ?? true,
                                            question: prev.contentTypes?.question ?? true,
                                            quiz: prev.contentTypes?.quiz ?? true,
                                            assignment: prev.contentTypes?.assignment ?? true,
                                            jupyterNotebook:
                                                prev.contentTypes?.jupyterNotebook ?? true,
                                            scratch: prev.contentTypes?.scratch ?? true,
                                            video: {
                                                enabled: prev.contentTypes?.video?.enabled ?? true,
                                                showInVideoQuestion:
                                                    prev.contentTypes?.video?.showInVideoQuestion ??
                                                    true,
                                            },
                                        };
                                        return {
                                            ...prev,
                                            contentTypes: {
                                                ...base,
                                                video: {
                                                    enabled: base.video.enabled,
                                                    showInVideoQuestion: checked,
                                                },
                                            },
                                        };
                                    })
                                }
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Manage Doubts</CardTitle>
                    <CardDescription>Show or hide the Doubt Management section.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-between rounded border p-3">
                        <div className="text-sm">Show Manage Doubts</div>
                        <Switch
                            checked={(() => {
                                const parent = settings.sidebar.find(
                                    (t) => t.id === 'study-library'
                                );
                                const sub = parent?.subTabs?.find(
                                    (s) => s.id === 'doubt-management'
                                );
                                return sub?.visible !== false;
                            })()}
                            onCheckedChange={(checked) =>
                                updateSettings((prev) => ({
                                    ...prev,
                                    sidebar: prev.sidebar.map((t) => {
                                        if (t.id !== 'study-library') return t;
                                        const subTabs = (t.subTabs || []).map((s) =>
                                            s.id === 'doubt-management'
                                                ? { ...s, visible: checked }
                                                : s
                                        );
                                        return { ...t, subTabs };
                                    }),
                                }))
                            }
                        />
                    </div>
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
