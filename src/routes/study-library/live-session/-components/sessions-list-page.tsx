import { useNavHeadingStore } from '@/stores/layout-container/useNavHeadingStore';
import { useEffect, useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { MyButton } from '@/components/design-system/button';
import { SessionStatus, sessionStatusLabels } from '../-constants/enums';
import LiveSessionCard from './live-session-card';
import { useNavigate } from '@tanstack/react-router';

export default function SessionListPage() {
    const { setNavHeading } = useNavHeadingStore();
    const [selectedTab, setSelectedTab] = useState<SessionStatus>(SessionStatus.UPCOMING);
    const navigate = useNavigate();

    const handleTabChange = (value: string) => {
        setSelectedTab(value as SessionStatus);
    };

    useEffect(() => {
        setNavHeading('Live Session');
    }, []);

    return (
        <div>
            <Tabs value={selectedTab} onValueChange={handleTabChange}>
                <div className="flex flex-row justify-between">
                    <TabsList className="inline-flex h-auto justify-start gap-4 rounded-none border-b !bg-transparent p-0">
                        {Object.values(SessionStatus).map((status) => (
                            <TabsTrigger
                                key={status}
                                value={status}
                                className={`flex gap-1.5 rounded-none px-12 py-2 !shadow-none ${
                                    selectedTab === status
                                        ? 'border-4px rounded-t-sm border !border-b-0 border-primary-200 !bg-primary-50'
                                        : 'border-none bg-transparent'
                                }`}
                            >
                                {sessionStatusLabels[status]}
                            </TabsTrigger>
                        ))}
                    </TabsList>
                    <MyButton
                        onClick={() => navigate({ to: '/study-library/live-session/schedule' })}
                        buttonType="primary"
                    >
                        Schedule
                    </MyButton>
                </div>

                <TabsContent value={SessionStatus.UPCOMING}>
                    <LiveSessionCard />
                </TabsContent>
                <TabsContent value={SessionStatus.PAST} />
                <TabsContent value={SessionStatus.DRAFTS} />
            </Tabs>
        </div>
    );
}
