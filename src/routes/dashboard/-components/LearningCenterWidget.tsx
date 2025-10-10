import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { MyButton } from '@/components/design-system/button';
import { Badge } from '@/components/ui/badge';
import { BookOpen, VideoCamera, Folder } from 'phosphor-react';
import { useNavigate } from '@tanstack/react-router';
import { ContentTerms, SystemTerms } from '@/routes/settings/-components/NamingSettings';
import { getTerminology } from '@/components/common/layout-container/sidebar/utils';

interface LearningCenterWidgetProps {
    courseCount?: number;
    levelCount?: number;
    subjectCount?: number;
}

export default function LearningCenterWidget({
    courseCount = 0,
    levelCount = 0,
    subjectCount = 0,
}: LearningCenterWidgetProps) {
    const navigate = useNavigate();

    const handleStudyLibrary = () => {
        navigate({ to: '/study-library' });
    };

    const handleManageBatches = () => {
        navigate({ to: '/manage-institute/batches' });
    };

    const handleManageSessions = () => {
        navigate({ to: '/study-library/live-session' });
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
        <Card className="flex h-full grow flex-col bg-neutral-50 shadow-none">
            <CardHeader className="p-4">
                <div className="flex flex-col items-start justify-between gap-y-2">
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
                    <div className="flex flex-wrap gap-2">
                        <Badge variant="secondary" className="text-xs">
                            {courseCount} {getTerminology(ContentTerms.Course, SystemTerms.Course)}s
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                            {levelCount} {getTerminology(ContentTerms.Level, SystemTerms.Level)}s
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                            {subjectCount} Subjects
                        </Badge>
                    </div>
                </div>
            </CardHeader>
            <div className="flex-1 space-y-3 px-4 pb-4">
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
