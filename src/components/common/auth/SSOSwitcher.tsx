import React from 'react';
import { MyButton } from '@/components/design-system/button';
import { useSSO } from '@/hooks/auth/useSSO';
import { ExternalLink, GraduationCap, Settings } from 'lucide-react';

interface SSOSwitcherProps {
    className?: string;
    variant?: 'button' | 'link' | 'dropdown';
    showIcon?: boolean;
}

export const SSOSwitcher: React.FC<SSOSwitcherProps> = ({
    className = '',
    variant = 'button',
    showIcon = true,
}) => {
    const { userRoles, canAccessLearner, redirectToLearnerPlatform } = useSSO();

    // Only show if user has STUDENT role
    if (!canAccessLearner || !userRoles.includes('STUDENT')) {
        return null;
    }

    const handleSwitchToLearner = () => {
        redirectToLearnerPlatform('/dashboard');
    };

    if (variant === 'link') {
        return (
            <button
                onClick={handleSwitchToLearner}
                className={`text-primary-600 hover:text-primary-700 flex items-center gap-2 text-sm transition-colors ${className}`}
            >
                {showIcon && <GraduationCap className="size-4" />}
                Switch to Learner Platform
                <ExternalLink className="size-3" />
            </button>
        );
    }

    if (variant === 'dropdown') {
        return (
            <div
                className={`flex cursor-pointer items-center gap-2 px-3 py-2 text-sm transition-colors hover:bg-neutral-50 ${className}`}
            >
                <button
                    onClick={handleSwitchToLearner}
                    className="flex w-full items-center gap-2 text-left"
                >
                    {showIcon && <GraduationCap className="size-4" />}
                    Switch to Learner Platform
                    <ExternalLink className="ml-auto size-3" />
                </button>
            </div>
        );
    }

    return (
        <MyButton
            buttonType="secondary"
            scale="small"
            layoutVariant="default"
            onClick={handleSwitchToLearner}
            className={className}
        >
            {showIcon && <GraduationCap className="mr-2 size-4" />}
            Switch to Learner Platform
            <ExternalLink className="ml-2 size-3" />
        </MyButton>
    );
};

// Component to show current platform and available switches
export const PlatformIndicator: React.FC<{ className?: string }> = ({ className = '' }) => {
    const { userRoles, canAccessLearner } = useSSO();

    if (!userRoles.length) return null;

    return (
        <div className={`flex items-center gap-2 text-xs text-neutral-600 ${className}`}>
            <Settings className="size-3" />
            <span>Admin Dashboard</span>
            {canAccessLearner && (
                <>
                    <span>•</span>
                    <SSOSwitcher variant="link" showIcon={false} />
                </>
            )}
        </div>
    );
};

export default SSOSwitcher;
