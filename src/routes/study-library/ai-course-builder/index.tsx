import { createFileRoute } from '@tanstack/react-router';
import CoursePage from '@/components/ai-course-builder/pages/CoursePage';
import { LayoutContainer } from '@/components/common/layout-container/layout-container';
import { Helmet } from 'react-helmet';
import { useEffect } from 'react';
import { useNavHeadingStore } from '@/stores/layout-container/useNavHeadingStore';

export const Route = createFileRoute('/study-library/ai-course-builder/')({
    component: () => {
        const { setNavHeading } = useNavHeadingStore();
        useEffect(() => {
            setNavHeading('AI Course Builder');
        }, [setNavHeading]);

        return (
            <LayoutContainer>
                <Helmet>
                    <title>AI Course Builder</title>
                    <meta name="description" content="Generate courses with AI." />
                </Helmet>
                <CoursePage />
            </LayoutContainer>
        );
    },
});
