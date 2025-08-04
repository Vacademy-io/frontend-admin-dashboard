import { LayoutContainer } from '@/components/common/layout-container/layout-container';
import { createFileRoute } from '@tanstack/react-router';
import { useNavHeadingStore } from '@/stores/layout-container/useNavHeadingStore';
import { useEffect, useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import z from 'zod';
import { SettingsTabs } from './-constants/terms';
import { getInstituteId } from '@/constants/helper';
import { getAvailableSettingsTabs } from './-utils/utils';

export const settingsParamsSchema = z.object({
    selectedTab: z.string().optional(),
});

const SafeRouteSearch = () => {
    try {
        return Route.useSearch();
    } catch (error) {
        // Return a default object if the hook fails
        return { selectedTab: SettingsTabs.Tab };
    }
};

export const Route = createFileRoute('/settings/')({
    validateSearch: settingsParamsSchema,
    component: () => (
        <LayoutContainer>
            <RouteComponent />
        </LayoutContainer>
    ),
});

function RouteComponent() {
    const searchParams = SafeRouteSearch();
    const instituteId = getInstituteId();
    const [selectedTab, setSelectedTab] = useState(
        searchParams.selectedTab ??
            getAvailableSettingsTabs(instituteId ?? '')[0]?.tab ??
            SettingsTabs.Tab
    );
    const { setNavHeading } = useNavHeadingStore();

    useEffect(() => {
        setNavHeading('Settings');
    }, [setNavHeading]);

    return (
        <>
            <Tabs value={selectedTab} onValueChange={setSelectedTab}>
                <div className="flex items-center justify-between">
                    <TabsList className="mb-2 inline-flex h-auto justify-start gap-4 rounded-none border-b !bg-transparent p-0">
                        {getAvailableSettingsTabs(instituteId ?? '').map((tab, index) => (
                            <TabsTrigger
                                key={index}
                                value={tab.tab}
                                className={`flex gap-1.5 rounded-none px-12 py-2 !shadow-none ${
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
                {getAvailableSettingsTabs(instituteId ?? '').map((tab, index) => (
                    <TabsContent key={index} value={tab.tab}>
                        <tab.component isTab={true} />
                    </TabsContent>
                ))}
            </Tabs>
        </>
    );
}
