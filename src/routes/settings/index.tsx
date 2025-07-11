import { LayoutContainer } from '@/components/common/layout-container/layout-container';
import { createFileRoute } from '@tanstack/react-router';
import { useNavHeadingStore } from '@/stores/layout-container/useNavHeadingStore';
import { useEffect, useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Clock, CreditCard } from 'lucide-react';
import NamingSettings from './-components/NamingSettings';

export const Route = createFileRoute('/settings/')({
    component: () => (
        <LayoutContainer>
            <RouteComponent />
        </LayoutContainer>
    ),
});

function RouteComponent() {
    const [selectedTab, setSelectedTab] = useState('naming-settings');
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
                    </TabsList>
                </div>
                <TabsContent value="naming-settings">
                    <NamingSettings />
                </TabsContent>
                <TabsContent value="payment-settings">
                    <div className="flex min-h-[400px] items-center justify-center">
                        <Card className="w-full max-w-md border-2 border-dashed border-gray-300">
                            <CardContent className="flex flex-col items-center justify-center p-8 text-center">
                                <div className="mb-4 flex size-16 items-center justify-center rounded-full bg-primary-100">
                                    <CreditCard className="size-8 text-primary-500" />
                                </div>
                                <h3 className="mb-2 text-lg font-semibold text-gray-900">
                                    Payment Settings
                                </h3>
                                <p className="mb-4 text-sm text-gray-600">
                                    Configure payment methods, billing preferences, and subscription
                                    settings.
                                </p>
                                <div className="flex items-center gap-2 text-sm text-primary-500">
                                    <Clock className="size-4" />
                                    <span className="font-medium">Coming Soon</span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>
        </>
    );
}
