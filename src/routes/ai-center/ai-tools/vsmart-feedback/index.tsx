import { LayoutContainer } from '@/components/common/layout-container/layout-container';
import { createFileRoute } from '@tanstack/react-router';
import { AICenterProvider } from '../../-contexts/useAICenterContext';
import EvaluateLectureAI from './-components/EvaluateLectureAI';
import { useEffect } from 'react';
import { useNavHeadingStore } from '@/stores/layout-container/useNavHeadingStore';
import { CaretLeft } from 'phosphor-react';

export const Route = createFileRoute('/ai-center/ai-tools/vsmart-feedback/')({
    component: RouteComponent,
});

function RouteComponent() {
    const { setNavHeading } = useNavHeadingStore();

    useEffect(() => {
        const heading = (
            <div className="flex items-center gap-4">
                <CaretLeft onClick={() => window.history.back()} className="cursor-pointer" />
                <div>VSmart AI Tools</div>
            </div>
        );

        setNavHeading(heading);
    }, []);
    return (
        <LayoutContainer>
            <AICenterProvider>
                <EvaluateLectureAI />
            </AICenterProvider>
        </LayoutContainer>
    );
}
