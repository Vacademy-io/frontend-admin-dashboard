import { LayoutContainer } from '@/components/common/layout-container/layout-container';
import { createFileRoute } from '@tanstack/react-router';
import { useNavHeadingStore } from '@/stores/layout-container/useNavHeadingStore';
import { useEffect, useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import NamingSettings from './-components/NamingSettings';
import PaymentSettings from './-components/Payment/PaymentSettings';
import ReferralSettings from './-components/Referral/ReferralSettings';
import TabSettings from './-components/Tab/TabSettings';

export const Route = createFileRoute('/settings/')({
    component: () => (
        <LayoutContainer>
            <RouteComponent />
        </LayoutContainer>
    ),
});

function RouteComponent() {
    const [selectedTab, setSelectedTab] = useState('tab-settings');
    const { setNavHeading } = useNavHeadingStore();

    useEffect(() => {
        setNavHeading('Settings');
    }, [setNavHeading]);

    return (
        <>
            <Tabs value={selectedTab} onValueChange={setSelectedTab}>
                <div className="flex items-center justify-between">
                    <TabsList className="mb-2 inline-flex h-auto justify-start gap-4 rounded-none border-b !bg-transparent p-0">
                        <TabsTrigger
                            value="tab-settings"
                            className={`flex gap-1.5 rounded-none px-12 py-2 !shadow-none ${
                                selectedTab === 'tab-settings'
                                    ? 'rounded-t-sm border !border-b-0 border-primary-200 !bg-primary-50'
                                    : 'border-none bg-transparent'
                            }`}
                        >
                            <span
                                className={`${selectedTab === 'tab-settings' ? 'text-primary-500' : ''}`}
                            >
                                Tab Settings
                            </span>
                        </TabsTrigger>
                        <TabsTrigger
                            value="naming-settings"
                            className={`flex gap-1.5 rounded-none px-12 py-2 !shadow-none ${
                                selectedTab === 'naming-settings'
                                    ? 'rounded-t-sm border !border-b-0 border-primary-200 !bg-primary-50'
                                    : 'border-none bg-transparent'
                            }`}
                        >
                            <span
                                className={`${selectedTab === 'naming-settings' ? 'text-primary-500' : ''}`}
                            >
                                Naming Settings
                            </span>
                        </TabsTrigger>
                        <TabsTrigger
                            value="payment-settings"
                            className={`inline-flex gap-1.5 rounded-none px-12 py-2 !shadow-none ${
                                selectedTab === 'payment-settings'
                                    ? 'rounded-t-sm border !border-b-0 border-primary-200 !bg-primary-50'
                                    : 'border-none bg-transparent'
                            }`}
                        >
                            <span
                                className={`${selectedTab === 'payment-settings' ? 'text-primary-500' : ''}`}
                            >
                                Payment Settings
                            </span>
                        </TabsTrigger>
                        <TabsTrigger
                            value="referral-settings"
                            className={`inline-flex gap-1.5 rounded-none px-12 py-2 !shadow-none ${
                                selectedTab === 'referral-settings'
                                    ? 'rounded-t-sm border !border-b-0 border-primary-200 !bg-primary-50'
                                    : 'border-none bg-transparent'
                            }`}
                        >
                            <span
                                className={`${selectedTab === 'referral-settings' ? 'text-primary-500' : ''}`}
                            >
                                Referral Settings
                            </span>
                        </TabsTrigger>
                    </TabsList>
                </div>
                <TabsContent value="tab-settings">
                    <TabSettings isTab />
                </TabsContent>
                <TabsContent value="naming-settings">
                    <NamingSettings />
                </TabsContent>
                <TabsContent value="payment-settings">
                    <PaymentSettings />
                </TabsContent>
                <TabsContent value="referral-settings">
                    <ReferralSettings />
                </TabsContent>
            </Tabs>
        </>
    );
}
