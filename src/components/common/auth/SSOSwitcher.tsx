import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, GraduationCap } from 'lucide-react';
import {
    getUserRoles,
    getTokenFromCookie,
    generateSSOUrl,
    canAccessLearnerPlatform,
} from '@/lib/auth/sessionUtility';
import { TokenKey } from '@/constants/auth/tokens';
import { Student } from 'phosphor-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useInstituteDetailsStore } from '@/stores/students/students-list/useInstituteDetailsStore';

interface SSOSwitcherProps {
    variant?: 'button' | 'dropdown' | 'inline';
    className?: string;
}

export function SSOSwitcher({ variant = 'button', className = '' }: SSOSwitcherProps) {
    const { instituteDetails } = useInstituteDetailsStore();
    const [userRoles, setUserRoles] = React.useState<string[]>([]);
    const [canSwitchToLearner, setCanSwitchToLearner] = React.useState(false);

    React.useEffect(() => {
        const accessToken = getTokenFromCookie(TokenKey.accessToken);
        if (accessToken) {
            const roles = getUserRoles(accessToken);
            setUserRoles(roles);
            setCanSwitchToLearner(canAccessLearnerPlatform(accessToken));
        }
    }, []);

    const switchToLearnerPlatform = () => {
        const ssoUrl = generateSSOUrl(
            instituteDetails?.learner_portal_base_url ?? '',
            '/dashboard'
        );
        if (ssoUrl) {
            window.location.href = ssoUrl;
        } else {
            window.location.href = `https://${instituteDetails?.learner_portal_base_url ?? ''}/login`;
        }
    };

    // Don't show switcher if user can't access other platform
    const showLearnerSwitch = canSwitchToLearner;

    if (!showLearnerSwitch) {
        return null;
    }

    if (variant === 'inline') {
        return (
            <div className={`flex items-center gap-2 ${className}`}>
                <Badge variant="outline" className="text-xs">
                    {userRoles.join(', ')}
                </Badge>
                {showLearnerSwitch && (
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={switchToLearnerPlatform}
                        className="text-xs"
                    >
                        <GraduationCap className="mr-1 size-3" />
                        Switch to Learner
                        <ExternalLink className="ml-1 size-3" />
                    </Button>
                )}
            </div>
        );
    }

    if (variant === 'button') {
        return (
            <div className={className}>
                {showLearnerSwitch && (
                    <Tooltip delayDuration={0}>
                        <TooltipTrigger>
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={switchToLearnerPlatform}
                                className="size-10 rounded-full p-2"
                            >
                                <Student />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent className="bg-primary-400 text-white" side="left">
                            <p>Switch to Learner</p>
                        </TooltipContent>
                    </Tooltip>
                )}
            </div>
        );
    }

    if (variant === 'dropdown') {
        return (
            <div className={className}>
                <span onClick={switchToLearnerPlatform}>Switch to Learner</span>
            </div>
        );
    }

    return null;
}

export default SSOSwitcher;
