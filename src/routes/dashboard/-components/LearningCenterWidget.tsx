import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { MyButton } from '@/components/design-system/button';
import { BookOpen, VideoCamera, Folder } from 'phosphor-react';
import { useNavigate } from '@tanstack/react-router';
import { ContentTerms, SystemTerms } from '@/routes/settings/-components/NamingSettings';
import { getTerminology } from '@/components/common/layout-container/sidebar/utils';

export default function LearningCenterWidget() {
    const navigate = useNavigate();

    const handleStudyLibrary = () => {
        navigate({ to: '/study-library' });
    };

    const handleManageBatches = () => {
        navigate({ to: '/manage-institute/batches' });
    };

    const handleManageSessions = () => {
        navigate({ to: '/manage-institute/sessions' });
    };

    const learningFeatures = [
        {
            icon: BookOpen,
            title: 'Study Library',
            description: 'Access course materials and resources',
            action: handleStudyLibrary,
        },
        {
            icon: VideoCamera,
            title: getTerminology(ContentTerms.LiveSession, SystemTerms.LiveSession),
            description: 'Manage live teaching sessions',
            action: handleManageSessions,
        },
        {
            icon: Folder,
            title: 'Batch Management',
            description: 'Organize students into batches',
            action: handleManageBatches,
        },
    ];

    return (
        <Card className="grow bg-neutral-50 shadow-none">
            <CardHeader className="p-4">
                <div className="flex items-center gap-2">
                    <BookOpen size={18} className="text-primary-500" weight="duotone" />
                    <div>
                        <CardTitle className="text-sm font-semibold">Learning Center</CardTitle>
                        <CardDescription className="mt-1 text-xs text-neutral-600">
                            Manage{' '}
                            {getTerminology(
                                ContentTerms.Course,
                                SystemTerms.Course
                            ).toLocaleLowerCase()}
                            s,{' '}
                            {getTerminology(
                                ContentTerms.Session,
                                SystemTerms.Session
                            ).toLocaleLowerCase()}
                            s, and study materials
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>
            <div className="space-y-3 px-4 pb-4">
                <div className="grid grid-cols-1 gap-3">
                    {learningFeatures.map((feature) => (
                        <MyButton
                            key={feature.title}
                            type="button"
                            scale="medium"
                            buttonType="secondary"
                            layoutVariant="default"
                            className="w-full justify-start gap-2 text-sm"
                            onClick={feature.action}
                        >
                            <feature.icon size={16} />
                            {feature.title}
                        </MyButton>
                    ))}
                </div>
            </div>
        </Card>
    );
}
