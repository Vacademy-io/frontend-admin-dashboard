'use client';

import type React from 'react';
import { useState, useEffect } from 'react'; // Import useEffect
import { DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Eye, Edit, X } from 'lucide-react';
import { toast } from 'sonner';
import { useMutation, useSuspenseQuery } from '@tanstack/react-query';
import axios from 'axios';

import {
    createPermissionUpdatePayload,
    convertFeaturePermissionsToIds,
    mapPermissionsToFeatures,
} from '@/utils/permission/permission';
import type { PermissionLevel, PermissionUpdatePayload } from '@/types/permission';
import type { UserRolesDataEntry } from '@/types/dashboard/user-roles';
import { getTokenDecodedData, getTokenFromCookie } from '@/lib/auth/sessionUtility';
import { TokenKey } from '@/constants/auth/tokens';
import { getUserPermissions, handleUpdatePermission } from '../-services/dashboard-services';
import { defaultFeatures, roleColors } from '@/constants/permission/default-feature';
import { MyButton } from '@/components/design-system/button';
import { AssignBatchSubjectComponent } from './AssignBatchSubjectComponent';

// Define types within the component file or import from a shared types file
export interface FeatureConfig {
    id: string;
    name: string;
    icon: React.ComponentType<{ className?: string }>;
    visible: boolean;
    subFeatures?: SubFeatureConfig[];
}

interface SubFeatureConfig {
    id: string;
    name: string;
    permission: PermissionLevel;
}

type UserRole = 'ADMIN' | 'TEACHER' | 'COURSE_CREATOR' | 'ASSESSMENT_CREATOR' | 'EVALUATOR';

interface User extends UserRolesDataEntry {
    currentPermissions?: string[];
}

interface PermissionsDialogProps {
    user: User;
    onClose: () => void;
    refetchData: () => void;
}

const permissionIcons = { none: X, view: Eye, edit: Edit };
const permissionColors = { none: 'text-gray-400', view: 'text-blue-500', edit: 'text-green-500' };

export function PermissionsDialog({ user, onClose, refetchData }: PermissionsDialogProps) {
    const { data: currentPermissions, isLoading } = useSuspenseQuery(getUserPermissions(user.id));
    const [features, setFeatures] = useState<FeatureConfig[]>(defaultFeatures);
    const [fullAccess, setFullAccess] = useState(false);
    const [saving, setSaving] = useState(false);
    const [showAssignBatchDialog, setShowAssignBatchDialog] = useState(false); // State for dialog visibility

    // Check if all features have full access when component mounts or permissions change
    useEffect(() => {
        if (features.length > 0) {
            const hasFullAccess = features.every((feature) => {
                const isFeatureEnabled = feature.visible;
                const areSubFeaturesFullAccess =
                    !feature.subFeatures ||
                    feature.subFeatures.every((subFeature) => subFeature.permission === 'edit');
                return isFeatureEnabled && areSubFeaturesFullAccess;
            });
            setFullAccess(hasFullAccess);
        }
    }, [features]);

    // Update all features when fullAccess changes
    const handleFullAccessToggle = (checked: boolean) => {
        setFullAccess(checked);
        if (checked) {
            // Enable all features and set all permissions to edit
            setFeatures(
                features.map((feature) => ({
                    ...feature,
                    visible: true,
                    subFeatures: feature.subFeatures
                        ? feature.subFeatures.map((subFeature) => ({
                              ...subFeature,
                              permission: 'edit',
                          }))
                        : undefined,
                }))
            );
        }
    };

    useEffect(() => {
        if (currentPermissions && !isLoading) {
            const initialFeatures = mapPermissionsToFeatures(defaultFeatures, currentPermissions);
            setFeatures(initialFeatures);
        }
    }, [currentPermissions, isLoading]);

    const updateFeatureVisibility = (featureId: string, visible: boolean) => {
        setFeatures((prev) =>
            prev.map((feature) => (feature.id === featureId ? { ...feature, visible } : feature))
        );
    };

    const updateSubFeaturePermission = (
        featureId: string,
        subFeatureId: string,
        permission: PermissionLevel
    ) => {
        setFeatures((prev) =>
            prev.map((feature) =>
                feature.id === featureId && feature.subFeatures
                    ? {
                          ...feature,
                          subFeatures: feature.subFeatures.map((sub) =>
                              sub.id === subFeatureId ? { ...sub, permission } : sub
                          ),
                      }
                    : feature
            )
        );
    };

    const handleUpdatePermissionMutation = useMutation({
        mutationFn: ({ data }: { data: PermissionUpdatePayload }) => handleUpdatePermission(data),
        onSuccess: () => {
            toast.success('Permissions updated successfully');
            refetchData();
            setSaving(false);
            onClose();
        },
        onError: (error: unknown) => {
            if (axios.isAxiosError(error) && error.response?.status === 511) {
                toast.error(
                    'Network authentication required. Please check your connection or login again.'
                );
            } else {
                toast.error('Failed to update permissions');
            }
            console.error('Error updating permissions:', error);
            setSaving(false);
        },
    });

    const handleSave = () => {
        setSaving(true);
        const featurePermissions: Record<string, PermissionLevel> = {};
        features.forEach((feature) => {
            featurePermissions[feature.id] = feature.visible
                ? getHighestPermissionForFeature(feature)
                : 'none';
            feature.subFeatures?.forEach((sub) => {
                featurePermissions[sub.id] = sub.permission;
            });
        });

        const newPermissionIds = convertFeaturePermissionsToIds(featurePermissions);
        const accessToken = getTokenFromCookie(TokenKey.accessToken);
        const tokenData = getTokenDecodedData(accessToken);
        const INSTITUTE_ID = tokenData && Object.keys(tokenData.authorities)[0];

        if (!INSTITUTE_ID) {
            toast.error('Organization information missing');
            return;
        }

        const payload = createPermissionUpdatePayload(
            user.id,
            INSTITUTE_ID,
            currentPermissions || [],
            newPermissionIds
        );
        handleUpdatePermissionMutation.mutate({ data: payload });
    };

    const getHighestPermissionForFeature = (feature: FeatureConfig): PermissionLevel => {
        if (!feature.subFeatures) return 'view';
        const hasEdit = feature.subFeatures.some((sf) => sf.permission === 'edit');
        if (hasEdit) return 'edit';
        const hasView = feature.subFeatures.some((sf) => sf.permission === 'view');
        if (hasView) return 'view';
        return 'none';
    };

    if (isLoading) {
        return (
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Loading Permissions...</DialogTitle>
                </DialogHeader>
                <div>Loading...</div>
            </DialogContent>
        );
    }

    // Check if the user is a teacher
    const isTeacher = user.roles.some((role) => role.role_name === 'TEACHER');

    return (
        <DialogContent className="max-h-[90vh] w-[800px]">
            <DialogHeader>
                <DialogTitle className="mb-6 text-xl font-semibold">
                    Manage User Permissions
                </DialogTitle>
            </DialogHeader>
            <div className="h-[80vh] space-y-6 overflow-y-scroll">
                <Card>
                    <CardHeader className="pb-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-semibold">{user.full_name}</h3>
                                <p className="text-sm text-gray-600">{user.email}</p>
                            </div>
                            <div className="flex gap-2">
                                {user.roles.map((role) => (
                                    <Badge
                                        key={role.role_id}
                                        variant="outline"
                                        className={roleColors[role.role_name as UserRole] || ''}
                                    >
                                        {role.role_name.replace('_', ' ')}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    </CardHeader>
                </Card>

                {/* Add Full Access Switch */}
                <Card className="">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="font-medium ">Full Access Mode</h3>
                                <p className="text-sm text-gray-600">
                                    Enable full access to grant this user complete edit permissions
                                    for all features
                                </p>
                            </div>
                            <div className="flex items-center gap-2">
                                <Label htmlFor="full-access" className="">
                                    {fullAccess ? 'Full Access Enabled' : 'Limited Access'}
                                </Label>
                                <Switch
                                    id="full-access"
                                    checked={fullAccess}
                                    onCheckedChange={handleFullAccessToggle}
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Add Manage Resources Card */}
                <Card>
                    <CardHeader>
                        <CardTitle>Manage Resources</CardTitle>
                        <p className="text-sm text-gray-600">
                            Configure additional resource assignments for this user
                        </p>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {isTeacher && (
                                <div className="flex items-center justify-between rounded-lg border  bg-white p-4">
                                    <div>
                                        <h4 className="font-medium">Batch & Subject Assignment</h4>
                                        <p className="text-sm text-gray-600">
                                            Assign specific batches and subjects to this teacher
                                        </p>
                                    </div>
                                    <MyButton onClick={() => setShowAssignBatchDialog(true)}>
                                        Manage Assignments
                                    </MyButton>

                                    {showAssignBatchDialog && (
                                        <AssignBatchSubjectComponent
                                            teacher={user}
                                            onClose={() => setShowAssignBatchDialog(false)}
                                            refetchData={refetchData}
                                        />
                                    )}
                                </div>
                            )}

                            {/* You can add more resource management options here in the future */}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Feature Permissions</CardTitle>
                        <p className="text-sm text-gray-600">
                            Toggle visibility and set permission levels for each feature.
                        </p>
                    </CardHeader>
                    <CardContent>
                        <div className="mb-12 space-y-4">
                            {features.map((feature) => (
                                <div key={feature.id} className="rounded-lg border p-4">
                                    <div className="mb-3 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <feature.icon className="size-5 text-gray-600" />
                                            <span className="font-medium">{feature.name}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Label
                                                htmlFor={`${feature.id}-visible`}
                                                className="text-sm"
                                            >
                                                Visible
                                            </Label>
                                            <Switch
                                                id={`${feature.id}-visible`}
                                                checked={feature.visible}
                                                onCheckedChange={(checked) =>
                                                    updateFeatureVisibility(feature.id, checked)
                                                }
                                            />
                                        </div>
                                    </div>
                                    {feature.subFeatures && feature.visible && (
                                        <div className="ml-8 space-y-2">
                                            <Separator />
                                            <div className="mt-3 grid gap-2">
                                                {feature.subFeatures.map((subFeature) => {
                                                    const PermissionIcon =
                                                        permissionIcons[subFeature.permission];
                                                    return (
                                                        <div
                                                            key={subFeature.id}
                                                            className="flex items-center justify-between py-2"
                                                        >
                                                            <div className="flex items-center gap-2">
                                                                <PermissionIcon
                                                                    className={`size-4 ${permissionColors[subFeature.permission]}`}
                                                                />
                                                                <span className="text-sm">
                                                                    {subFeature.name}
                                                                </span>
                                                            </div>
                                                            <Select
                                                                value={subFeature.permission}
                                                                onValueChange={(value) =>
                                                                    updateSubFeaturePermission(
                                                                        feature.id,
                                                                        subFeature.id,
                                                                        value as PermissionLevel
                                                                    )
                                                                }
                                                            >
                                                                <SelectTrigger className="w-32">
                                                                    <SelectValue />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    <SelectItem value="none">
                                                                        No Access
                                                                    </SelectItem>
                                                                    <SelectItem value="view">
                                                                        View Only
                                                                    </SelectItem>
                                                                    <SelectItem value="edit">
                                                                        View & Edit
                                                                    </SelectItem>
                                                                </SelectContent>
                                                            </Select>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
            <div
                className="fixed bottom-0 left-0 z-10 flex w-full max-w-[800px] justify-end gap-3 border-t bg-white px-6 py-4 shadow-[0_-2px_8px_rgba(0,0,0,0.04)]"
                style={{ marginLeft: 'auto', marginRight: 'auto', right: 0, left: 0 }}
            >
                <Button variant="outline" onClick={onClose}>
                    Cancel
                </Button>
                <MyButton onClick={handleSave} className="" disabled={saving}>
                    Save Permissions
                </MyButton>
            </div>
        </DialogContent>
    );
}
