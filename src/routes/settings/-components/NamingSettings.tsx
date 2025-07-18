'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Save, RotateCcw, Settings } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { MyButton } from '@/components/design-system/button';
import useLocalStorage from '@/hooks/use-local-storage';
import { IntroKey } from '@/constants/storage/introKey';
import {
    createNamingSettings,
    updateNamingSettings,
    type NamingSettingsRequest,
} from '@/services/naming-settings';
import { StorageKey } from '@/constants/storage/storage';
import { isNullOrEmptyOrUndefined } from '@/lib/utils';
import {
    CONTENT_TERMS,
    defaultNamingSettings,
    NamingSettingsType,
    ROLE_TERMS,
    systemValueDescription,
} from '../-constants/terms';

export enum ContentTerms {
    Course = 'Course',
    Level = 'Level',
    Session = 'Session',
    Subjects = 'Subjects',
    Modules = 'Modules',
    Chapters = 'Chapters',
    Slides = 'Slides',
    LiveSession = 'LiveSession',
}

export enum RoleTerms {
    Admin = 'Admin',
    Teacher = 'Teacher',
    CourseCreator = 'CourseCreator',
    AssessmentCreator = 'AssessmentCreator',
    Evaluator = 'Evaluator',
    Learner = 'Learner',
}
export enum SystemTerms {
    Course = 'Courses',
    Level = 'Level',
    Session = 'Session',
    Subjects = 'Subjects',
    Modules = 'Modules',
    Chapters = 'Chapters',
    Slides = 'Slides',
    LiveSession = 'Live Session',
    Admin = 'Admin',
    Teacher = 'Teacher',
    CourseCreator = 'Course Creator',
    AssessmentCreator = 'Assessment Creator',
    Evaluator = 'Evaluator',
    Learner = 'Learner',
}

const createNameRequest = (settings: NamingSettingsType[]): NamingSettingsRequest => {
    const request: Partial<NamingSettingsRequest> = {};
    settings.forEach((item) => {
        (request as Record<string, string>)[item.key] = item.customValue;
    });
    return request as unknown as NamingSettingsRequest;
};

export default function NamingSettings() {
    const { toast } = useToast();
    const [settings, setSettings] = useState<NamingSettingsType[] | null>(null);
    const { getValue: getFirstTimeValue, setValue: setFirstTimeValue } = useLocalStorage<boolean>(
        IntroKey.firstTimeNamingSettings,
        false
    );
    const { getValue: getNamingSettings, setValue: setNamingSettingsStorage } = useLocalStorage<
        NamingSettingsType[]
    >(StorageKey.NAMING_SETTINGS, []);

    const [isLoading, setIsLoading] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);

    // Initialize settings based on visit history
    useEffect(() => {
        const initializeSettings = async () => {
            const isFirstTime = getFirstTimeValue();

            if (!isFirstTime) {
                // First time visit - call create API with defaults and render defaults
                try {
                    const nameRequest = createNameRequest(defaultNamingSettings);
                    await createNamingSettings(nameRequest);

                    // Store defaults in localStorage after successful API call
                    setNamingSettingsStorage(defaultNamingSettings);
                    setFirstTimeValue(true);

                    // Render defaults in UI
                    setSettings(defaultNamingSettings);

                    toast({
                        title: 'Settings Initialized',
                        description:
                            'Default naming conventions have been set up for your institute.',
                    });
                } catch (error) {
                    console.error('Failed to create initial naming settings:', error);
                    // Still render defaults in UI even if API fails
                    setSettings(defaultNamingSettings);
                    toast({
                        title: 'Warning',
                        description:
                            'Failed to initialize naming settings on server. You can still modify settings locally.',
                        variant: 'destructive',
                    });
                }
            } else {
                // Second time onwards - load from storage
                const savedSettings = getNamingSettings();
                if (!isNullOrEmptyOrUndefined(savedSettings) && savedSettings.length > 0) {
                    setSettings(savedSettings);
                } else {
                    // Fallback to defaults if storage is empty
                    setSettings(defaultNamingSettings);
                    setNamingSettingsStorage(defaultNamingSettings);
                }
            }
        };

        initializeSettings();
    }, []);

    const handleCustomValueChange = (key: string, newValue: string) => {
        if (!settings) return;

        const updatedSettings = settings.map((item) =>
            item.key === key ? { ...item, customValue: newValue } : item
        );

        setSettings(updatedSettings);
        setHasChanges(true);
    };

    const resetToDefault = (key: string) => {
        if (!settings) return;

        const item = settings.find((item) => item.key === key);
        if (item) {
            handleCustomValueChange(key, item.systemValue);
        }
    };

    const resetAllToDefault = async () => {
        if (!settings) return;

        const updatedSettings = settings.map((item) => ({
            ...item,
            customValue: item.systemValue,
        }));

        setSettings(updatedSettings);
        setHasChanges(true);
    };

    const saveSettings = async () => {
        if (!settings) return;

        setIsLoading(true);
        try {
            // Call the update API
            const nameRequest = createNameRequest(settings);
            await updateNamingSettings(nameRequest);
            window.location.reload();
            // Save to localStorage
            setNamingSettingsStorage(settings);
            setHasChanges(false);
            toast({
                title: 'Settings saved',
                description: 'Your naming conventions have been saved successfully.',
            });
        } catch (error) {
            console.error('Failed to save settings:', error);
            toast({
                title: 'Error',
                description: 'Failed to save settings. Please try again.',
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
        }
    };

    if (!settings) {
        return <div className="flex items-center justify-center p-8">Loading...</div>;
    }

    const terminologyData = settings;

    // Group terminology by category
    const contentTerms = terminologyData.filter((item) =>
        (CONTENT_TERMS as readonly string[]).includes(item.key)
    );
    const roleTerms = terminologyData.filter((item) =>
        (ROLE_TERMS as readonly string[]).includes(item.key)
    );

    return (
        <div className=" space-y-6 p-2">
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <h1 className="flex items-center gap-2 text-lg font-bold">
                        <Settings className="size-6" />
                        Naming Settings
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Customize the naming conventions used throughout your institute
                        <br />
                        <span className="text-xs  text-primary-500">
                            Please enter singular form of the term
                        </span>
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" onClick={resetAllToDefault} disabled={isLoading}>
                        <RotateCcw className="mr-2 size-4" />
                        Reset All
                    </Button>
                    <MyButton
                        onClick={saveSettings}
                        disabled={isLoading || !hasChanges}
                        className="bg-primary-500"
                    >
                        <Save className="mr-2 size-4" />
                        {isLoading ? 'Saving...' : 'Save Changes'}
                    </MyButton>
                </div>
            </div>

            {hasChanges && (
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                    <p className="text-sm text-amber-800">
                        You have unsaved changes. Don&apos;t forget to save your updates.
                    </p>
                </div>
            )}

            <div className="grid gap-6">
                {/* Content & Structure Terms */}
                <Card>
                    <CardHeader>
                        <CardTitle>Content & Structure</CardTitle>
                        <CardDescription>
                            Customize terms related to course content and structure
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {contentTerms.map((item) => (
                            <div
                                key={item.key}
                                className="grid grid-cols-1 items-center gap-4 rounded-lg border p-4 md:grid-cols-3"
                            >
                                <div className="space-y-1">
                                    <Label className="text-sm font-medium">
                                        {item.systemValue}
                                    </Label>
                                    <div className="flex items-center gap-2">
                                        <Badge
                                            variant="secondary"
                                            className="text-xs text-muted-foreground"
                                        >
                                            {
                                                systemValueDescription[
                                                    item.key as keyof typeof systemValueDescription
                                                ]
                                            }
                                        </Badge>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor={`custom-${item.key}`} className="text-sm">
                                        Custom Name
                                    </Label>
                                    <Input
                                        id={`custom-${item.key}`}
                                        value={item.customValue}
                                        onChange={(e) =>
                                            handleCustomValueChange(item.key, e.target.value)
                                        }
                                        placeholder={item.systemValue}
                                    />
                                </div>
                                <div className="flex justify-end">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => resetToDefault(item.key)}
                                        disabled={item.customValue === item.systemValue}
                                    >
                                        <RotateCcw className="mr-1 size-3" />
                                        Reset
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                {/* User Roles */}
                <Card>
                    <CardHeader>
                        <CardTitle>User Roles</CardTitle>
                        <CardDescription>
                            Customize terms for different user roles in your institute
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {roleTerms.map((item) => (
                            <div
                                key={item.key}
                                className="grid grid-cols-1 items-center gap-4 rounded-lg border p-4 md:grid-cols-3"
                            >
                                <div className="space-y-1">
                                    <Label className="text-sm font-medium">
                                        {item.systemValue}
                                    </Label>
                                    <div className="flex items-center gap-2">
                                        <Badge
                                            variant="secondary"
                                            className="text-xs text-muted-foreground"
                                        >
                                            {
                                                systemValueDescription[
                                                    item.key as keyof typeof systemValueDescription
                                                ]
                                            }
                                        </Badge>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor={`custom-${item.key}`} className="text-sm">
                                        Custom Name
                                    </Label>
                                    <Input
                                        id={`custom-${item.key}`}
                                        value={item.customValue}
                                        onChange={(e) =>
                                            handleCustomValueChange(item.key, e.target.value)
                                        }
                                        placeholder={item.systemValue}
                                    />
                                </div>
                                <div className="flex justify-end">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => resetToDefault(item.key)}
                                        disabled={item.customValue === item.systemValue}
                                    >
                                        <RotateCcw className="mr-1 size-3" />
                                        Reset
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>

            <Separator />

            <div className="text-sm text-muted-foreground">
                <p>
                    <strong>Note:</strong> Changes will be applied across your entire institute once
                    saved. All users will see the updated terminology in their interface.
                </p>
            </div>
        </div>
    );
}
