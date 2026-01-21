import { createLazyFileRoute } from '@tanstack/react-router';
import { LayoutContainer } from '@/components/common/layout-container/layout-container';
import { useNavHeadingStore } from '@/stores/layout-container/useNavHeadingStore';
import { useEffect, useRef, useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { SettingsTabs } from './-constants/terms';
import { getAvailableSettingsTabs } from './-utils/utils';
import { Route as SettingsRoute } from '.';

export const Route = createLazyFileRoute('/settings/')({
    component: () => (
        <LayoutContainer>
            <RouteComponent />
        </LayoutContainer>
    ),
});

const SafeRouteSearch = () => {
    try {
        return SettingsRoute.useSearch();
    } catch (error) {
        // Return a default object if the hook fails
        return { selectedTab: SettingsTabs.Tab };
    }
};

function RouteComponent() {
    const searchParams = SafeRouteSearch();
    const [selectedTab, setSelectedTab] = useState('adminDisplay');
    const { setNavHeading } = useNavHeadingStore();
    const scrollRef = useRef<HTMLDivElement | null>(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(false);

    useEffect(() => {
        setNavHeading('Settings');
    }, [setNavHeading]);

    const updateScrollShadows = () => {
        const el = scrollRef.current;
        if (!el) return;
        const { scrollLeft, scrollWidth, clientWidth } = el;
        setCanScrollLeft(scrollLeft > 0);
        setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 1);
    };

    useEffect(() => {
        updateScrollShadows();
        const el = scrollRef.current;
        if (!el) return;
        const onScroll = () => updateScrollShadows();
        el.addEventListener('scroll', onScroll);
        window.addEventListener('resize', updateScrollShadows);
        return () => {
            el.removeEventListener('scroll', onScroll);
            window.removeEventListener('resize', updateScrollShadows);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        // Keep the active tab in view when selection changes
        const container = scrollRef.current;
        if (!container) return;
        const active = container.querySelector(
            '[role="tab"][data-state="active"]'
        ) as HTMLElement | null;
        if (active) {
            active.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
        }
        updateScrollShadows();
    }, [selectedTab]);

    const scrollBy = (delta: number) => {
        const el = scrollRef.current;
        if (!el) return;
        el.scrollBy({ left: delta, behavior: 'smooth' });
    };

    return (
        <>
            <Tabs value={selectedTab} onValueChange={setSelectedTab}>
                <div className="relative mb-2">
                    {canScrollLeft && (
                        <button
                            type="button"
                            aria-label="Scroll left"
                            title="Scroll left"
                            onClick={() => scrollBy(-240)}
                            className="absolute left-0 top-1/2 z-20 flex -translate-y-1/2 items-center justify-center rounded-full border bg-background p-1 shadow sm:left-1 sm:p-1.5"
                        >
                            <ChevronLeft className="size-3 sm:size-4" />
                        </button>
                    )}
                    {canScrollRight && (
                        <button
                            type="button"
                            aria-label="Scroll right"
                            title="Scroll right"
                            onClick={() => scrollBy(240)}
                            className="absolute right-0 top-1/2 z-20 flex -translate-y-1/2 items-center justify-center rounded-full border bg-background p-1 shadow sm:right-1 sm:p-1.5"
                        >
                            <ChevronRight className="size-3 sm:size-4" />
                        </button>
                    )}
                    {/* Gradient edges to hint scrollability */}
                    {canScrollLeft && (
                        <div className="pointer-events-none absolute left-0 top-0 z-10 h-full w-6 bg-gradient-to-r from-background to-transparent sm:w-10" />
                    )}
                    {canScrollRight && (
                        <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-6 bg-gradient-to-l from-background to-transparent sm:w-10" />
                    )}
                    <div
                        ref={scrollRef}
                        className="no-scrollbar overflow-x-auto"
                        role="region"
                        aria-label="Settings tabs"
                    >
                        <TabsList className="inline-flex h-auto w-max justify-start gap-2 whitespace-nowrap rounded-none border-b !bg-transparent p-0 sm:gap-4">
                            {getAvailableSettingsTabs().map((tab, index) => (
                                <TabsTrigger
                                    key={index}
                                    value={tab.tab}
                                    className={`flex gap-1.5 rounded-none px-4 py-2 text-sm !shadow-none sm:px-12 ${
                                        selectedTab === tab.tab
                                            ? 'rounded-t-sm border !border-b-0 border-primary-200 !bg-primary-50'
                                            : 'border-none bg-transparent'
                                    }`}
                                >
                                    <span
                                        className={`${selectedTab === tab.tab ? 'text-primary-500' : ''}`}
                                    >
                                        {tab.value}
                                    </span>
                                </TabsTrigger>
                            ))}
                        </TabsList>
                    </div>
                </div>
                {getAvailableSettingsTabs().map((tab, index) => (
                    <TabsContent key={index} value={tab.tab}>
                        <tab.component isTab={true} />
                    </TabsContent>
                ))}
            </Tabs>
        </>
    );
}
