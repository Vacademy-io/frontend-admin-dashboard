import React from 'react';
import { useState } from 'react';
import { Link, useNavigate } from '@tanstack/react-router';
import { SidebarGroup } from '@/components/ui/sidebar';
import { SidebarItemProps } from '../../../../types/layout-container/layout-container-types';
import { useSidebar } from '@/components/ui/sidebar';
import { useRouter } from '@tanstack/react-router';
import { useCompactMode } from '@/hooks/use-compact-mode';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { LockKey } from '@phosphor-icons/react';

import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

export const NonCollapsibleItem = ({ icon, title, to, locked, category }: SidebarItemProps) => {
    const [hover, setHover] = useState<boolean>(false);
    const toggleHover = () => {
        setHover(!hover);
    };

    const router = useRouter();
    const navigate = useNavigate();
    const currentRoute = router.state.location.pathname;

    const { state } = useSidebar();
    const { isCompact } = useCompactMode();
    const isMobile = useIsMobile();

    const colorMap = {
        CRM: {
            text: 'text-blue-600',
            bg: 'bg-blue-50',
            hover: 'hover:bg-blue-50 hover:text-blue-600',
        },
        LMS: {
            text: 'text-purple-600',
            bg: 'bg-purple-50',
            hover: 'hover:bg-purple-50 hover:text-purple-600',
        },
        AI: {
            text: 'text-rose-600',
            bg: 'bg-rose-50',
            hover: 'hover:bg-rose-50 hover:text-rose-600',
        },
    };
    const colors = colorMap[category as keyof typeof colorMap] || colorMap.CRM;

    const handleLockedClick = (e: React.MouseEvent) => {
        if (locked) {
            e.preventDefault();
            e.stopPropagation();
            navigate({ to: '/locked-feature', search: { feature: title } });
        }
    };

    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <div // Changed from Link to div to handle click manually if locked, or wrap Link if not. Actually better to use Link but intercept click? Or just div for locked.
                    // The requirement is that locked items should still be visible but show a lock sign.
                    // If I use a div, I can handle onClick.
                    onClick={(e) => {
                        if (locked) handleLockedClick(e);
                    }}
                >
                    {locked ? (
                        <div
                            className={cn(
                                'flex w-full cursor-pointer items-center gap-1 rounded-lg px-4 py-2 transition-colors',
                                colors.hover,
                                state === 'collapsed' && !isMobile && 'justify-center px-2'
                            )}
                            onMouseEnter={toggleHover}
                            onMouseLeave={toggleHover}
                        >
                            <LockKey
                                className={cn(
                                    state === 'expanded' || isMobile
                                        ? isCompact
                                            ? 'size-6'
                                            : 'size-7'
                                        : isCompact
                                          ? 'size-5'
                                          : 'size-6',
                                    'text-neutral-400'
                                )}
                                weight="duotone"
                            />
                            <SidebarGroup
                                className={cn(
                                    'font-regular text-neutral-600 group-data-[collapsible=icon]:hidden',
                                    isCompact ? 'text-xs' : 'text-sm'
                                )}
                            >
                                {title}
                            </SidebarGroup>
                        </div>
                    ) : (
                        <Link
                            to={to}
                            className={cn(
                                'flex w-full cursor-pointer items-center gap-1 rounded-lg px-4 py-2 transition-colors',
                                colors.hover,
                                to && currentRoute.includes(to) ? colors.bg : 'bg-transparent'
                            )}
                            onMouseEnter={toggleHover}
                            onMouseLeave={toggleHover}
                        >
                            {icon &&
                                React.createElement(icon, {
                                    className: cn(
                                        state === 'expanded' || isMobile
                                            ? isCompact
                                                ? 'size-6'
                                                : 'size-7'
                                            : isCompact
                                              ? 'size-5'
                                              : 'size-6',
                                        hover || (to && currentRoute.includes(to))
                                            ? colors.text
                                            : 'text-neutral-400'
                                    ),
                                    weight: 'duotone',
                                })}

                            <SidebarGroup
                                className={cn(
                                    hover || (to && currentRoute.includes(to))
                                        ? colors.text
                                        : 'text-neutral-600',
                                    'font-regular group-data-[collapsible=icon]:hidden',
                                    isCompact ? 'text-xs' : 'text-sm'
                                )}
                            >
                                {title}
                            </SidebarGroup>
                        </Link>
                    )}
                </div>
            </TooltipTrigger>
            {state === 'collapsed' && !isMobile && (
                <TooltipContent side="right">
                    {title} {locked && '(Locked)'}
                </TooltipContent>
            )}
        </Tooltip>
    );
};
