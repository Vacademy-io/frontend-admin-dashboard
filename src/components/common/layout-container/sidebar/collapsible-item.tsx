import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible';
import { ChevronDown } from 'lucide-react';
import { useEffect, useState } from 'react';
import React from 'react';
import { SidebarGroup } from '@/components/ui/sidebar';
import { SidebarItemProps } from '../../../../types/layout-container/layout-container-types';
import { useSidebar } from '@/components/ui/sidebar';
import { Link } from '@tanstack/react-router';
import { useRouter } from '@tanstack/react-router';
import { useCompactMode } from '@/hooks/use-compact-mode';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { LockKey } from '@phosphor-icons/react';
import { useNavigate } from '@tanstack/react-router';

export const CollapsibleItem = ({ icon, title, to, subItems, locked }: SidebarItemProps) => {
    const [hover, setHover] = useState<boolean>(false);
    const { state } = useSidebar();
    const [isOpen, setIsOpen] = useState(false);
    const navigate = useNavigate();

    const toggleHover = () => setHover(!hover);
    const router = useRouter();
    const { isCompact } = useCompactMode();
    const isMobile = useIsMobile();

    const currentRoute = router.state.location.pathname;
    const routeMatches =
        subItems?.some((item) => item.subItemLink && currentRoute.includes(item.subItemLink)) ||
        currentRoute === to;

    const handleLockedClick = (e: React.MouseEvent, featureName: string) => {
        if (locked) {
            e.preventDefault();
            e.stopPropagation();
            navigate({ to: '/locked-feature', search: { feature: featureName } });
        }
    };

    const handleLockedSubItemClick = (
        e: React.MouseEvent,
        featureName: string,
        isSubLocked?: boolean
    ) => {
        if (isSubLocked) {
            e.preventDefault();
            e.stopPropagation();
            navigate({ to: '/locked-feature', search: { feature: featureName } });
        }
    };

    useEffect(() => {
        if (routeMatches) {
            setIsOpen(true);
        }
    }, [routeMatches]);

    if (locked) {
        return (
            <div
                className={cn(
                    'flex w-full cursor-pointer items-center justify-between rounded-lg px-4 py-2 hover:bg-white',
                    state === 'collapsed' && !isMobile ? 'justify-center px-2' : ''
                )}
                onClick={(e) => handleLockedClick(e, title)}
            >
                <div className="flex items-center gap-2">
                    <LockKey
                        className={cn(
                            state === 'collapsed' && !isMobile
                                ? isCompact
                                    ? 'size-5'
                                    : 'size-6'
                                : isCompact
                                  ? 'size-5'
                                  : 'size-6',
                            'text-neutral-400'
                        )}
                        weight="fill"
                    />
                    {(state !== 'collapsed' || isMobile) && (
                        <span className={cn('text-neutral-400', isCompact ? 'text-xs' : 'text-sm')}>
                            {title}
                        </span>
                    )}
                </div>
            </div>
        );
    }

    if (state === 'collapsed' && !isMobile) {
        return (
            <DropdownMenu>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <DropdownMenuTrigger asChild>
                            <div
                                className={cn(
                                    'flex w-full cursor-pointer items-center justify-center gap-1 rounded-lg px-2 py-2 outline-none transition-colors hover:bg-white focus:bg-white',
                                    hover || routeMatches ? 'bg-white' : 'bg-none'
                                )}
                                onMouseEnter={toggleHover}
                                onMouseLeave={toggleHover}
                            >
                                {icon &&
                                    React.createElement(icon, {
                                        className: cn(
                                            isCompact ? 'size-5' : 'size-6',
                                            hover || routeMatches
                                                ? 'text-primary-500'
                                                : 'text-neutral-400'
                                        ),
                                        weight: 'fill',
                                    })}
                            </div>
                        </DropdownMenuTrigger>
                    </TooltipTrigger>
                    <TooltipContent side="right">{title}</TooltipContent>
                </Tooltip>

                <DropdownMenuContent side="right" align="start" className="ml-2 min-w-[200px]">
                    <DropdownMenuLabel>{title}</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {subItems?.map((obj, key) => (
                        <DropdownMenuItem key={key} asChild>
                            <Link
                                to={obj.subItemLink}
                                className={cn(
                                    'flex w-full cursor-pointer items-center',
                                    obj.subItemLink &&
                                        currentRoute.includes(obj.subItemLink) &&
                                        'text-primary font-medium'
                                )}
                                onClick={(e) =>
                                    handleLockedSubItemClick(e, obj.subItem || '', obj.locked)
                                }
                            >
                                {obj.subItem}
                                {obj.locked && (
                                    <LockKey size={12} className="ml-2 text-neutral-400" />
                                )}
                            </Link>
                        </DropdownMenuItem>
                    ))}
                </DropdownMenuContent>
            </DropdownMenu>
        );
    }

    return (
        <Collapsible
            className="group/collapsible"
            onMouseEnter={toggleHover}
            onMouseLeave={toggleHover}
            open={isOpen}
            onOpenChange={setIsOpen}
        >
            <Link to={to}>
                <CollapsibleTrigger
                    className="flex w-full items-center justify-between"
                    onClick={() => {
                        // Removed toggleSidebar logic since we handle collapsed state separately
                        setIsOpen((prev) => !prev);
                    }}
                >
                    <div
                        className={`flex w-full cursor-pointer items-center gap-1 rounded-lg px-4 py-2 ${
                            hover || routeMatches ? 'bg-white' : 'bg-none'
                        }`}
                    >
                        <div className="flex items-center">
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
                                        hover || routeMatches
                                            ? 'text-primary-500'
                                            : 'text-neutral-400'
                                    ),
                                    weight: 'fill',
                                })}
                            <SidebarGroup
                                className={cn(
                                    hover || routeMatches ? 'text-primary-500' : 'text-neutral-600',
                                    'font-regular group-data-[collapsible=icon]:hidden',
                                    isCompact ? 'text-xs' : 'text-sm'
                                )}
                            >
                                {title}
                            </SidebarGroup>
                        </div>
                        <SidebarGroup className="ml-auto w-fit group-data-[collapsible=icon]:hidden">
                            <ChevronDown
                                className={cn(
                                    'ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180',
                                    hover || routeMatches ? 'text-primary-500' : 'text-neutral-600',
                                    isCompact ? 'size-4' : 'size-6'
                                )}
                            />
                        </SidebarGroup>
                    </div>
                </CollapsibleTrigger>
            </Link>
            <CollapsibleContent>
                <SidebarGroup className="flex flex-col gap-1 pl-12 group-data-[collapsible=icon]:hidden">
                    {subItems?.map((obj, key) => (
                        <Link
                            to={obj.subItemLink}
                            key={key}
                            onClick={(e) =>
                                handleLockedSubItemClick(e, obj.subItem || '', obj.locked)
                            }
                        >
                            <div
                                className={cn(
                                    'cursor-pointer font-regular hover:text-primary-500',
                                    obj.subItemLink && currentRoute.includes(obj.subItemLink)
                                        ? 'text-primary-500'
                                        : 'text-neutral-600',
                                    isCompact ? 'text-xs' : 'text-sm'
                                )}
                            >
                                {obj.subItem}
                                {obj.locked && (
                                    <LockKey size={12} className="ml-auto text-neutral-400" />
                                )}
                            </div>
                        </Link>
                    ))}
                </SidebarGroup>
            </CollapsibleContent>
        </Collapsible>
    );
};
