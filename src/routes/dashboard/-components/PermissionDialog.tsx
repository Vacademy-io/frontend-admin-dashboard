'use client';

import type React from 'react';

import { useState } from 'react';
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
import {
    Settings,
    Users,
    GraduationCap,
    BookOpen,
    FileText,
    ClipboardCheck,
    MessageSquare,
    Brain,
    Eye,
    Edit,
    X,
} from 'lucide-react';
import {
    createPermissionUpdatePayload,
    convertFeaturePermissionsToIds,
} from '@/utils/permission/permission';
import type { PermissionLevel, PermissionUpdatePayload } from '@/types/permission';
import { UserRolesDataEntry } from '@/types/dashboard/user-roles';
import { getTokenDecodedData, getTokenFromCookie } from '@/lib/auth/sessionUtility';
import { TokenKey } from '@/constants/auth/tokens';
import { toast } from 'sonner';
import { useMutation } from '@tanstack/react-query';
import { handleUpdatePermission } from '../-services/dashboard-services';
import axios from 'axios';

type UserRole = 'ADMIN' | 'TEACHER' | 'COURSE_CREATOR' | 'ASSESSMENT_CREATOR' | 'EVALUATOR';

interface User extends UserRolesDataEntry {
    currentPermissions?: string[];
}

interface PermissionsDialogProps {
    user: User;
    onClose: () => void;
    refetchData: () => void;
}

interface FeatureConfig {
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

const defaultFeatures: FeatureConfig[] = [
    {
        id: 'dashboard',
        name: 'Dashboard',
        icon: Settings,
        visible: true,
    },
    {
        id: 'manage_institute',
        name: 'Manage Institute',
        icon: Users,
        visible: false,
        subFeatures: [
            { id: 'batches', name: 'Batches', permission: 'none' },
            { id: 'sessions', name: 'Sessions', permission: 'none' },
            { id: 'teams', name: 'Teams', permission: 'none' },
        ],
    },
    {
        id: 'manage_learners',
        name: 'Manage Learners',
        icon: GraduationCap,
        visible: false,
        subFeatures: [
            { id: 'learner_list', name: 'Learner List', permission: 'none' },
            { id: 'enroll_request', name: 'Enroll Request', permission: 'none' },
            { id: 'invite', name: 'Invite', permission: 'none' },
        ],
    },
    {
        id: 'learning_centre',
        name: 'Learning Centre',
        icon: BookOpen,
        visible: false,
        subFeatures: [
            { id: 'courses', name: 'Courses', permission: 'none' },
            { id: 'live_session', name: 'Live Session', permission: 'none' },
            { id: 'doubt_management', name: 'Doubt Management', permission: 'none' },
            { id: 'reports', name: 'Reports', permission: 'none' },
            { id: 'presentation', name: 'Presentation', permission: 'none' },
        ],
    },
    {
        id: 'homework',
        name: 'Homework',
        icon: FileText,
        visible: false,
    },
    {
        id: 'assessment_centre',
        name: 'Assessment Centre',
        icon: ClipboardCheck,
        visible: false,
        subFeatures: [
            { id: 'assessment_list', name: 'Assessment List', permission: 'none' },
            { id: 'question_paper', name: 'Question Paper', permission: 'none' },
        ],
    },
    {
        id: 'evaluation_centre',
        name: 'Evaluation Centre',
        icon: ClipboardCheck,
        visible: false,
        subFeatures: [
            { id: 'evaluation', name: 'Evaluation', permission: 'none' },
            { id: 'evaluation_tool', name: 'Evaluation Tool', permission: 'none' },
        ],
    },
    {
        id: 'community_centre',
        name: 'Community Centre',
        icon: MessageSquare,
        visible: false,
    },
    {
        id: 'vsmart_ai_tools',
        name: 'Vsmart AI Tools',
        icon: Brain,
        visible: false,
    },
];

const roleColors: Record<UserRole, string> = {
    ADMIN: 'bg-red-100 text-red-800 border-red-200',
    TEACHER: 'bg-blue-100 text-blue-800 border-blue-200',
    COURSE_CREATOR: 'bg-green-100 text-green-800 border-green-200',
    ASSESSMENT_CREATOR: 'bg-purple-100 text-purple-800 border-purple-200',
    EVALUATOR: 'bg-yellow-100 text-yellow-800 border-yellow-200',
};

const permissionIcons = {
    none: X,
    view: Eye,
    edit: Edit,
};

const permissionColors = {
    none: 'text-gray-400',
    view: 'text-blue-500',
    edit: 'text-green-500',
};

export function PermissionsDialog({ user, onClose, refetchData }: PermissionsDialogProps) {
    const [features, setFeatures] = useState<FeatureConfig[]>(defaultFeatures);

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
            onClose();
        },
        onError: (error: unknown) => {
            if (axios.isAxiosError(error)) {
                // Handle specific status codes
                if (error.response?.status === 511) {
                    toast.error(
                        'Network authentication required. Please check your connection or login again.'
                    );
                    // You may want to redirect to login page here
                } else {
                    toast.error(
                        `Failed to update permissions: ${error.response?.data?.message || error.message}`
                    );
                }
            } else {
                toast.error('Failed to update permissions');
            }
            console.error('Error updating permissions:', error);
        },
    });

    const handleSave = async () => {
        const featurePermissions: Record<string, PermissionLevel> = {};
        features.forEach((feature) => {
            // Main feature permission
            featurePermissions[feature.id] = feature.visible ? 'view' : 'none';

            // Sub-feature permissions
            feature.subFeatures?.forEach((sub) => {
                featurePermissions[sub.id] = sub.permission;
            });
        });

        // Convert to permission IDs
        const newPermissionIds = convertFeaturePermissionsToIds(featurePermissions);
        const currentPermissionIds = user.currentPermissions || [];
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
            currentPermissionIds,
            newPermissionIds
        );
        console.log('Permission Update Payload:', payload);
        handleUpdatePermissionMutation.mutate({
            data: payload,
        });
    };

    return (
        <DialogContent className="max-h-[90vh] w-[800px] overflow-y-auto">
            <DialogHeader>
                <DialogTitle className="text-xl font-semibold">
                    Manage User Permissions (Simplified)
                </DialogTitle>
            </DialogHeader>

            <div className="space-y-6">
                {/* User Info */}
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
                                        className={
                                            roleColors[role.role_name as UserRole] ||
                                            'border-gray-200 bg-gray-100 text-gray-800'
                                        }
                                    >
                                        {role.role_name.replace('_', ' ')}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    </CardHeader>
                </Card>

                {/* Feature Permissions */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Feature Permissions</CardTitle>
                        <p className="text-sm text-gray-600">
                            Toggle visibility and set permission levels for each feature
                        </p>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {features.map((feature) => {
                                const IconComponent = feature.icon;
                                return (
                                    <div key={feature.id} className="rounded-lg border p-4">
                                        <div className="mb-3 flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <IconComponent className="size-5 text-gray-600" />
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
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>

                {/* Action Buttons */}
                <div className="flex justify-end gap-3 border-t pt-4">
                    <Button variant="outline" onClick={() => onClose()}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSave}
                        className="bg-orange-500 text-white hover:bg-orange-600"
                    >
                        Save Permissions
                    </Button>
                </div>
            </div>
        </DialogContent>
    );
}
