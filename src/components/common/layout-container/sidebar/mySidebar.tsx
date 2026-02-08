import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuItem,
    useSidebar,
} from '@/components/ui/sidebar';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    SidebarStateType,
    SidebarItemsType,
} from '../../../../types/layout-container/layout-container-types';
import { SidebarItem } from './sidebar-item';
import { SidebarItemsData } from './utils';
import './scrollbarStyle.css';
import React, { useEffect, useState } from 'react';
import { useSuspenseQuery } from '@tanstack/react-query';
import { useInstituteQuery } from '@/services/student-list-section/getInstituteDetails';
import { DashboardLoader } from '@/components/core/dashboard-loader';
import { filterMenuItems } from './helper';
import { getTokenFromCookie, getUserRoles } from '@/lib/auth/sessionUtility';
import { TokenKey } from '@/constants/auth/tokens';
import {
    ADMIN_DISPLAY_SETTINGS_KEY,
    TEACHER_DISPLAY_SETTINGS_KEY,
    type DisplaySettingsData,
} from '@/types/display-settings';
import { getDisplaySettings, getDisplaySettingsFromCache } from '@/services/display-settings';
import { useFileUpload } from '@/hooks/use-file-upload';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn, goToMailSupport, goToWhatsappSupport } from '@/lib/utils';
import { Question } from '@phosphor-icons/react';
import { Command, CommandGroup, CommandItem, CommandList } from '@/components/ui/command';
import {
    WhatsappLogo,
    EnvelopeSimple,
    Lightning,
    Briefcase,
    GraduationCap,
    Sparkle,
    LockKey,
} from '@phosphor-icons/react';
import { motion } from 'framer-motion';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

import { useNavigate, useRouter } from '@tanstack/react-router';
import useInstituteLogoStore from './institutelogo-global-zustand';
import { useTabSettings } from '@/hooks/use-tab-settings';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { useIsMobile } from '@/hooks/use-mobile';
import { useCompactMode } from '@/hooks/use-compact-mode';

const voltSidebarData: SidebarItemsType[] = [
    {
        icon: Lightning,
        title: 'Volt',
        id: 'volt',
        to: '/study-library/volt',
    },
];

export const MySidebar = ({ sidebarComponent }: { sidebarComponent?: React.ReactNode }) => {
    const navigate = useNavigate();
    const {
        state,
        openMobile,
        setOpenMobile,
    }: SidebarStateType & { openMobile: boolean; setOpenMobile: (open: boolean) => void } =
        useSidebar();
    const { data, isLoading } = useSuspenseQuery(useInstituteQuery());
    const router = useRouter();
    const currentRoute = router.state.location.pathname;
    const { isTabVisible, isSubItemVisible } = useTabSettings();
    const isMobile = useIsMobile();
    const { isCompact } = useCompactMode();

    const [isVoltSubdomain, setIsVoltSubdomain] = useState(false);
    const [activeCategory, setActiveCategory] = useState<'CRM' | 'LMS' | 'AI'>('CRM');

    const [roleDisplay, setRoleDisplay] = useState<DisplaySettingsData | null>(null);

    useEffect(() => {
        setIsVoltSubdomain(
            typeof window !== 'undefined' && window.location.hostname.startsWith('volt.')
        );
    }, []);

    // Sync active category with current route
    useEffect(() => {
        const checkCategoryVisibility = (cat: 'CRM' | 'LMS' | 'AI') => {
            if (!roleDisplay?.sidebarCategories) return true;
            const cfg = roleDisplay.sidebarCategories.find((c) => c.id === cat);
            return cfg ? cfg.visible !== false : true;
        };

        const findCategory = (): 'CRM' | 'LMS' | 'AI' | null => {
            if (isVoltSubdomain) {
                return 'LMS';
            }

            for (const item of SidebarItemsData) {
                const isActive = item.to ? currentRoute.startsWith(item.to) : false;
                if (isActive) {
                    return item.category || 'CRM';
                }
                if (item.subItems) {
                    for (const sub of item.subItems) {
                        const link = sub.subItemLink || '';
                        if (link && currentRoute.startsWith(link)) {
                            return item.category || 'CRM';
                        }
                    }
                }
            }
            return null;
        };

        const matched = findCategory();
        let targetCategory = matched;

        if (targetCategory && !checkCategoryVisibility(targetCategory)) {
            targetCategory = null;
        }

        if (targetCategory) {
            setActiveCategory(targetCategory);
        } else if (roleDisplay?.sidebarCategories) {
            const def = roleDisplay.sidebarCategories.find((c) => c.default);
            if (def) setActiveCategory(def.id);
        }
    }, [currentRoute, isVoltSubdomain, roleDisplay]);

    useEffect(() => {
        const accessToken = getTokenFromCookie(TokenKey.accessToken);
        const roles = getUserRoles(accessToken);
        const isAdmin = roles.includes('ADMIN');
        const roleKey = isAdmin ? ADMIN_DISPLAY_SETTINGS_KEY : TEACHER_DISPLAY_SETTINGS_KEY;
        const cached = getDisplaySettingsFromCache(roleKey);
        if (cached) {
            setRoleDisplay(cached);
        } else {
            getDisplaySettings(roleKey)
                .then(setRoleDisplay)
                .catch(() => setRoleDisplay(null));
        }
    }, []);

    const finalSidebarItems = (() => {
        const base = isVoltSubdomain
            ? voltSidebarData
            : filterMenuItems(SidebarItemsData, data?.id || '', isTabVisible, isSubItemVisible);
        if (!roleDisplay) return base;
        // Apply role-based visibility and ordering
        const tabVis = new Map(roleDisplay.sidebar.map((t) => [t.id, t]));
        const mapped = base
            .filter((item) => {
                const cfg = tabVis.get(item.id);
                return cfg ? cfg.visible !== false : true;
            })
            .map((item) => {
                const cfg = tabVis.get(item.id);
                if (!cfg) return item;
                if (item.subItems && item.subItems.length > 0) {
                    const subVis = new Map((cfg.subTabs || []).map((s) => [s.id, s]));
                    const filteredSubs = item.subItems
                        .filter((s) => {
                            const c = subVis.get(s.subItemId);
                            return c ? c.visible !== false : true;
                        })
                        .sort((a, b) => {
                            const ao = subVis.get(a.subItemId)?.order ?? 0;
                            const bo = subVis.get(b.subItemId)?.order ?? 0;
                            return ao - bo;
                        })
                        .map((s) => {
                            const c = subVis.get(s.subItemId);
                            return {
                                ...s,
                                subItem: c?.label ?? s.subItem,
                                subItemLink: c?.route ?? s.subItemLink,
                                locked: c?.locked,
                            };
                        });
                    return {
                        ...item,
                        title: cfg.label ?? item.title,
                        to: cfg.route ?? item.to,
                        subItems: filteredSubs,
                        locked: cfg.locked,
                    };
                }
                return {
                    ...item,
                    title: cfg.label ?? item.title,
                    to: cfg.route ?? item.to,
                    locked: cfg.locked,
                };
            })
            .sort((a, b) => {
                const ao = tabVis.get(a.id)?.order ?? 0;
                const bo = tabVis.get(b.id)?.order ?? 0;
                return ao - bo;
            });

        // Add custom tabs that don't exist in base
        const baseIds = new Set(base.map((b) => b.id));
        const customTabs: SidebarItemsType[] = roleDisplay.sidebar
            .filter((t) => t.isCustom && t.visible !== false && !baseIds.has(t.id))
            .map((t) => ({
                // Using a placeholder icon-less component; SidebarItem handles absence of icon
                icon: (() => null) as unknown as SidebarItemsType['icon'],
                title: t.label || t.id,
                to: t.route,
                id: t.id,
                locked: t.locked,
            }));
        return ([...mapped, ...customTabs] as SidebarItemsType[]).sort((a, b) => {
            const ao = tabVis.get(a.id)?.order ?? 0;
            const bo = tabVis.get(b.id)?.order ?? 0;
            return ao - bo;
        });
    })();

    const { getPublicUrl } = useFileUpload();
    const { instituteLogo, setInstituteLogo } = useInstituteLogoStore();

    useEffect(() => {
        const timer = setTimeout(() => {
            const fetchPublicUrl = async () => {
                if (data?.institute_logo_file_id) {
                    const publicUrl = await getPublicUrl(data.institute_logo_file_id);
                    setInstituteLogo(publicUrl || '');
                }
            };

            fetchPublicUrl();
        }, 300); // Adjust the debounce time as needed

        return () => clearTimeout(timer); // Cleanup the timeout on component unmount
    }, [data?.institute_logo_file_id, getPublicUrl, setInstituteLogo]);

    if (isLoading) return <DashboardLoader />;
    if (roleDisplay?.ui?.showSidebar === false) return null;

    // Sidebar content - shared between mobile drawer and desktop sidebar
    const sidebarContent = (
        <TooltipProvider delayDuration={0}>
            <SidebarHeader
                className={cn('py-1', state === 'collapsed' && !isMobile ? 'px-1' : 'px-3')}
            >
                <div
                    className="flex cursor-pointer flex-col items-center justify-center gap-1 rounded p-1 transition-colors"
                    onClick={() => {
                        navigate({ to: '/dashboard' });
                        if (isMobile) setOpenMobile(false);
                    }}
                >
                    {instituteLogo !== '' && (
                        <img
                            src={instituteLogo}
                            alt="logo"
                            className={cn(
                                'w-auto object-contain transition-all duration-200',
                                state === 'expanded' || isMobile
                                    ? isCompact
                                        ? 'h-10 max-w-[80px]'
                                        : 'h-20 max-w-[180px]'
                                    : isCompact
                                      ? 'h-8 max-w-[30px]'
                                      : 'h-10 max-w-[80px]'
                            )}
                        />
                    )}
                    <SidebarGroup
                        className={cn(
                            'text-center font-semibold leading-tight text-primary-500',
                            !isMobile ? 'group-data-[collapsible=icon]:hidden' : '',
                            isCompact ? 'text-sm' : 'text-lg'
                        )}
                    >
                        {data?.institute_name}
                    </SidebarGroup>
                </div>
            </SidebarHeader>

            <div className="p-2">
                <Tabs
                    value={activeCategory}
                    onValueChange={(v) => setActiveCategory(v as 'CRM' | 'LMS' | 'AI')}
                    className="w-full"
                >
                    <TabsList
                        className={cn(
                            'flex w-full items-center justify-between gap-1 rounded-lg border bg-muted/20 p-1',
                            state === 'collapsed' &&
                                !isMobile &&
                                'h-auto flex-col items-center gap-2 border-none bg-transparent p-0'
                        )}
                    >
                        {(() => {
                            const categories = ['LMS', 'CRM', 'AI'] as const;
                            const sorted = [...categories].sort((a, b) => {
                                const cfgA = roleDisplay?.sidebarCategories?.find(
                                    (c) => c.id === a
                                );
                                const cfgB = roleDisplay?.sidebarCategories?.find(
                                    (c) => c.id === b
                                );
                                return (cfgA?.order ?? 0) - (cfgB?.order ?? 0);
                            });

                            return sorted.map((catId) => {
                                const config = roleDisplay?.sidebarCategories?.find(
                                    (c) => c.id === catId
                                );
                                if (config && !config.visible) return null;

                                let Icon = Briefcase;
                                if (catId === 'LMS') Icon = GraduationCap;
                                if (catId === 'AI') Icon = Sparkle;

                                const isLocked = config?.locked;
                                const isActive = activeCategory === catId;
                                const label = catId === 'AI' ? 'AI Tools' : catId;

                                return (
                                    <Tooltip key={catId} delayDuration={0}>
                                        <TooltipTrigger asChild>
                                            <TabsTrigger
                                                value={catId}
                                                onClick={(e) => {
                                                    if (isLocked) {
                                                        e.preventDefault();
                                                        navigate({
                                                            to: '/locked-feature',
                                                            search: {
                                                                feature: `${label} Category`,
                                                            },
                                                        });
                                                    }
                                                }}
                                                className={cn(
                                                    'relative flex min-w-0 flex-1 items-center justify-center gap-1.5 px-1 py-1 transition-all data-[state=active]:bg-transparent data-[state=active]:shadow-none',
                                                    state === 'collapsed' &&
                                                        !isMobile &&
                                                        'h-9 w-9 flex-none justify-center rounded-md p-0 ring-1 ring-border/50',
                                                    isLocked && 'opacity-70'
                                                )}
                                            >
                                                {isActive && (
                                                    <motion.div
                                                        layoutId="active-sidebar-tab"
                                                        className={cn(
                                                            'absolute inset-0 rounded-md bg-background shadow-sm',
                                                            state === 'collapsed' &&
                                                                !isMobile &&
                                                                'bg-primary/10 ring-primary shadow-none ring-1'
                                                        )}
                                                        transition={{
                                                            type: 'spring',
                                                            bounce: 0.2,
                                                            duration: 0.6,
                                                        }}
                                                    />
                                                )}

                                                <span className="relative z-10 flex items-center justify-center gap-1.5">
                                                    {isLocked ? (
                                                        <LockKey
                                                            size={
                                                                state === 'collapsed' && !isMobile
                                                                    ? 16
                                                                    : 14
                                                            }
                                                            weight="fill"
                                                            className="text-muted-foreground"
                                                        />
                                                    ) : (
                                                        <Icon
                                                            size={
                                                                state === 'collapsed' && !isMobile
                                                                    ? 20
                                                                    : 16
                                                            }
                                                            weight={isActive ? 'fill' : 'bold'}
                                                            className={cn(
                                                                'shrink-0 transition-colors',
                                                                isActive
                                                                    ? 'text-primary'
                                                                    : 'text-muted-foreground'
                                                            )}
                                                        />
                                                    )}
                                                    {(state !== 'collapsed' || isMobile) && (
                                                        <span
                                                            className={cn(
                                                                'truncate text-xs font-medium transition-colors',
                                                                isActive
                                                                    ? 'text-foreground'
                                                                    : 'text-muted-foreground'
                                                            )}
                                                        >
                                                            {label === 'AI Tools' ? 'AI' : label}
                                                        </span>
                                                    )}
                                                </span>
                                            </TabsTrigger>
                                        </TooltipTrigger>
                                        {state === 'collapsed' && !isMobile && (
                                            <TooltipContent side="right" className="font-medium">
                                                {label}
                                            </TooltipContent>
                                        )}
                                    </Tooltip>
                                );
                            });
                        })()}
                    </TabsList>
                </Tabs>
            </div>

            <SidebarMenu
                className={cn(
                    'flex shrink-0 flex-col px-1 py-4',
                    state == 'expanded' || isMobile ? 'items-stretch' : 'items-center',
                    isCompact ? 'gap-1' : 'gap-2'
                )}
            >
                {sidebarComponent
                    ? sidebarComponent
                    : finalSidebarItems
                          .filter((item) => {
                              const show = (item as SidebarItemsType).showForInstitute;
                              const category = item.category || 'CRM';
                              return (!show || show === data?.id) && category === activeCategory;
                          })
                          .map((obj, key) => (
                              <SidebarMenuItem
                                  key={key}
                                  id={obj.id}
                                  onClick={() => {
                                      // Close mobile sidebar when an item is clicked
                                      if (isMobile && !obj.subItems) {
                                          setOpenMobile(false);
                                      }
                                  }}
                              >
                                  <SidebarItem {...obj} />
                              </SidebarMenuItem>
                          ))}
            </SidebarMenu>
            {roleDisplay?.ui?.showSupportButton !== false && (
                <div
                    className={cn(
                        'mt-auto flex items-center justify-center px-1 py-2',
                        state === 'collapsed' && !isMobile ? 'mx-auto' : ''
                    )}
                >
                    {!currentRoute.includes('slides') && <SupportOptions />}
                </div>
            )}
        </TooltipProvider>
    );

    // Mobile: Render as Sheet/Drawer
    if (isMobile) {
        return (
            <Sheet open={openMobile} onOpenChange={setOpenMobile}>
                <SheetContent side="left" className="w-[280px] border-r bg-primary-50 p-0">
                    <SheetHeader className="sr-only">
                        <SheetTitle>Navigation Menu</SheetTitle>
                    </SheetHeader>
                    <div className="sidebar-content flex h-full flex-col gap-2 overflow-y-auto py-6">
                        {sidebarContent}
                    </div>
                </SheetContent>
            </Sheet>
        );
    }

    // Desktop/Tablet: Render as regular Sidebar
    return (
        <Sidebar collapsible="icon" className="z-20 !border-0">
            <SidebarContent
                className={cn(
                    'sidebar-content flex flex-col gap-2 border-r bg-primary-50 py-6',
                    state == 'expanded'
                        ? isCompact
                            ? 'w-[220px]'
                            : 'w-[307px]'
                        : isCompact
                          ? 'w-14'
                          : 'w-28'
                )}
            >
                {sidebarContent}
            </SidebarContent>
        </Sidebar>
    );
};

function SupportOptions() {
    const [open, setOpen] = useState(false);
    const [hover, setHover] = useState<boolean>(false);
    const toggleHover = () => {
        setHover(!hover);
    };
    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <div
                    className={`flex w-full cursor-pointer items-center gap-1 rounded-lg px-4 py-2 hover:bg-white`}
                    onMouseEnter={toggleHover}
                    onMouseLeave={toggleHover}
                >
                    <Question
                        className={cn('size-7', hover ? 'text-primary-500' : 'text-neutral-400')}
                        weight="fill"
                    />
                    <div
                        className={`${
                            hover ? 'text-primary-500' : 'text-neutral-600'
                        } text-body font-regular text-neutral-600 group-data-[collapsible=icon]:hidden`}
                    >
                        {'Support'}
                    </div>
                </div>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-0">
                <Command>
                    <CommandList>
                        <CommandGroup>
                            <CommandItem>
                                <div
                                    role="button"
                                    className="flex w-full cursor-pointer items-center gap-1"
                                    onClick={goToWhatsappSupport}
                                >
                                    <WhatsappLogo />
                                    WhatsApp
                                </div>
                            </CommandItem>
                            <CommandItem>
                                <div
                                    role="button"
                                    className="flex w-full cursor-pointer items-center gap-1"
                                    onClick={goToMailSupport}
                                >
                                    <EnvelopeSimple />
                                    Mail us
                                </div>
                            </CommandItem>
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}
