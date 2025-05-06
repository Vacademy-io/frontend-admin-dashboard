import { LayoutContainer } from '@/components/common/layout-container/layout-container';
import { createFileRoute } from '@tanstack/react-router';
import { useNavHeadingStore } from '@/stores/layout-container/useNavHeadingStore';
import { useEffect } from 'react';
import { AICenterProvider } from './-contexts/useAICenterContext';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { AIToolCardData } from './-constants/AICardsData';
import { AIToolsCard } from './-components/AIToolsCard';
import AllToolsTasks from './ai-tools/-components/AllToolsTasks';

export const Route = createFileRoute('/ai-center/')({
    component: () => (
        <LayoutContainer>
            <AICenterProvider>
                <RouteComponent />
            </AICenterProvider>
        </LayoutContainer>
    ),
});

function RouteComponent() {
    const { setNavHeading } = useNavHeadingStore();

    useEffect(() => {
        setNavHeading('VSmart AI Tools');
    }, []);

    return (
        <Tabs defaultValue="tools" className="flex flex-col items-start gap-6">
            <TabsList className="bg-white">
                <TabsTrigger
                    value="tools"
                    className="h-10 w-[200px] hover:cursor-pointer data-[state=active]:bg-primary-50 data-[state=active]:text-primary-500"
                >
                    AI Tools
                </TabsTrigger>
                <TabsTrigger
                    value="tasks"
                    className="h-10 w-[200px] hover:cursor-pointer data-[state=active]:bg-primary-50 data-[state=active]:text-primary-500"
                >
                    My AI Tasks
                </TabsTrigger>
            </TabsList>
            <TabsContent value="tools" className="flex w-full flex-col gap-6">
                {AIToolCardData.map((obj, key) => (
                    <div key={key} className="flex flex-col gap-6">
                        <p className="text-title font-semibold">{obj.title}</p>
                        {obj.features.map((feature, key1) => (
                            <AIToolsCard key={key1} feature={feature} />
                        ))}
                    </div>
                ))}
            </TabsContent>
            <TabsContent value="tasks" className="flex w-full flex-col gap-6">
                <AllToolsTasks />
            </TabsContent>
        </Tabs>
    );
}
