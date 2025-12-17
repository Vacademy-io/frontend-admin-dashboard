import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuItem,
    useSidebar,
} from '@/components/ui/sidebar';
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
import { filterMenuItems, filterMenuListByModules } from './helper';
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
import { WhatsappLogo, EnvelopeSimple, Lightning, X } from '@phosphor-icons/react';
import { useNavigate, useRouter } from '@tanstack/react-router';
import useInstituteLogoStore from './institutelogo-global-zustand';
import { useTabSettings } from '@/hooks/use-tab-settings';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { useIsMobile } from '@/hooks/use-mobile';

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
    const { state, openMobile, setOpenMobile }: SidebarStateType & { openMobile: boolean; setOpenMobile: (open: boolean) => void } = useSidebar();
    const { data, isLoading } = useSuspenseQuery(useInstituteQuery());
    const router = useRouter();
    const currentRoute = router.state.location.pathname;
    const { isTabVisible, isSubItemVisible } = useTabSettings();
    const isMobile = useIsMobile();

    const [isVoltSubdomain, setIsVoltSubdomain] = useState(false);

    useEffect(() => {
        setIsVoltSubdomain(
            typeof window !== 'undefined' && window.location.hostname.startsWith('volt.')
        );
    }, []);

    const [roleDisplay, setRoleDisplay] = useState<DisplaySettingsData | null>(null);
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
            : filterMenuItems(
                filterMenuListByModules(data?.sub_modules, SidebarItemsData),
                data?.id,
                isTabVisible,
                isSubItemVisible
            );
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
                            };
                        });
                    return {
                        ...item,
                        title: cfg.label ?? item.title,
                        to: cfg.route ?? item.to,
                        subItems: filteredSubs,
                    };
                }
                return { ...item, title: cfg.label ?? item.title, to: cfg.route ?? item.to };
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
    }, [data?.institute_logo_file_id]);

    if (isLoading) return <DashboardLoader />;
    if (roleDisplay?.ui?.showSidebar === false) return null;

    // Sidebar content - shared between mobile drawer and desktop sidebar
    const sidebarContent = (
        <>
            <SidebarHeader className="px-3 py-1">
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
                            className="h-12 w-auto max-w-[100px] object-cover rounded-full"
                        />
                    )}
                    <SidebarGroup
                        className={`text-center text-lg font-semibold leading-tight text-primary-500 ${!isMobile ? 'group-data-[collapsible=icon]:hidden' : ''}`}
                    >
                        {data?.institute_name}
                    </SidebarGroup>
                </div>
            </SidebarHeader>
            <SidebarMenu
                className={`flex shrink-0 flex-col gap-2 px-1 py-4 ${state == 'expanded' || isMobile ? 'items-stretch' : 'items-center'
                    }`}
            >
                {sidebarComponent
                    ? sidebarComponent
                    : finalSidebarItems
                        .filter((item) => {
                            const show = (item as SidebarItemsType).showForInstitute;
                            return !show || show === data?.id;
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
        </>
    );

    // Mobile: Render as Sheet/Drawer
    if (isMobile) {
        return (
            <Sheet open={openMobile} onOpenChange={setOpenMobile}>
                <SheetContent
                    side="left"
                    className="w-[280px] p-0 bg-primary-50 border-r border-r-neutral-300"
                >
                    <SheetHeader className="sr-only">
                        <SheetTitle>Navigation Menu</SheetTitle>
                    </SheetHeader>
                    <div className="sidebar-content flex h-full flex-col gap-2 py-6 overflow-y-auto">
                        {sidebarContent}
                    </div>
                </SheetContent>
            </Sheet>
        );
    }

    // Desktop/Tablet: Render as regular Sidebar
    return (
        <Sidebar collapsible="icon" className="z-20">
            <SidebarContent
                className={`sidebar-content flex flex-col gap-2 border-r border-r-neutral-300 bg-primary-50 py-6 ${state == 'expanded' ? 'w-[307px]' : 'w-28'
                    }`}
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
                        className={`${hover ? 'text-primary-500' : 'text-neutral-600'
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
