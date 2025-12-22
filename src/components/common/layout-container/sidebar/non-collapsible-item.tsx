import React from 'react';
import { useState } from 'react';
import { Link } from '@tanstack/react-router';
import { SidebarGroup } from '@/components/ui/sidebar';
import { SidebarItemProps } from '../../../../types/layout-container/layout-container-types';
import { useSidebar } from '@/components/ui/sidebar';
import { useRouter } from '@tanstack/react-router';
import { useCompactMode } from '@/hooks/use-compact-mode';
import { cn } from '@/lib/utils';

export const NonCollapsibleItem = ({ icon, title, to }: SidebarItemProps) => {
    const [hover, setHover] = useState<boolean>(false);
    const toggleHover = () => {
        setHover(!hover);
    };

    const router = useRouter();
    const currentRoute = router.state.location.pathname;

    const { state } = useSidebar();
    const { isCompact } = useCompactMode();

    return (
        <Link
            to={to}
            className={`flex w-full cursor-pointer items-center gap-1 rounded-lg px-4 py-2 hover:bg-white ${to && currentRoute.includes(to) ? 'bg-white' : 'bg-none'
                }`}
            onMouseEnter={toggleHover}
            onMouseLeave={toggleHover}
        >
            {icon &&
                React.createElement(icon, {
                    className: cn(
                        state === 'expanded'
                            ? (isCompact ? 'size-6' : 'size-7')
                            : (isCompact ? 'size-5' : 'size-6'),
                        hover || (to && currentRoute.includes(to))
                            ? 'text-primary-500'
                            : 'text-neutral-400'
                    ),
                    weight: 'fill',
                })}

            <SidebarGroup
                className={cn(
                    hover || (to && currentRoute.includes(to))
                        ? 'text-primary-500'
                        : 'text-neutral-600',
                    'font-regular group-data-[collapsible=icon]:hidden',
                    isCompact ? 'text-xs' : 'text-sm'
                )}
            >
                {title}
            </SidebarGroup>
        </Link>
    );
};
