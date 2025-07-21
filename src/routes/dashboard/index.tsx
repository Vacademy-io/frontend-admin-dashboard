import { createFileRoute, useLocation, useNavigate, useRouter } from '@tanstack/react-router';
import { LayoutContainer } from '@/components/common/layout-container/layout-container';
import { useNavHeadingStore } from '@/stores/layout-container/useNavHeadingStore';
import { useEffect, useState } from 'react';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MyButton } from '@/components/design-system/button';
import {
    ArrowSquareOut,
    Plus,
    Sparkle,
    FilePdf,
    LightbulbFilament,
    Lightning,
    PencilSimpleLine,
} from 'phosphor-react';
import { CreateAssessmentDashboardLogo, DashboardCreateCourse } from '@/svgs';
import { Badge } from '@/components/ui/badge';
import { CompletionStatusComponent } from './-components/CompletionStatusComponent';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { IntroKey } from '@/constants/storage/introKey';
import useIntroJsTour from '@/hooks/use-intro';
import { dashboardSteps } from '@/constants/intro/steps';
import { useSuspenseQuery } from '@tanstack/react-query';
import { useInstituteQuery } from '@/services/student-list-section/getInstituteDetails';
import {
    getAssessmentsCountsData,
    getInstituteDashboardData,
} from './-services/dashboard-services';
import { DashboardLoader } from '@/components/core/dashboard-loader';
import { HOLISTIC_INSTITUTE_ID, SSDC_INSTITUTE_ID } from '@/constants/urls';
import { amplitudeEvents, trackPageView, trackEvent } from '@/lib/amplitude';
import { Helmet } from 'react-helmet';
import { getModuleFlags } from '@/components/common/layout-container/sidebar/helper';
import RoleTypeComponent from './-components/RoleTypeComponent';
import useLocalStorage from '@/hooks/use-local-storage';
import EditDashboardProfileComponent from './-components/EditDashboardProfileComponent';
import { handleGetAdminDetails } from '@/services/student-list-section/getAdminDetails';
import { motion } from 'framer-motion';
import { useInstituteDetailsStore } from '@/stores/students/students-list/useInstituteDetailsStore';
import { UnresolvedDoubtsWidget } from './-components/UnresolvedDoubtsWidget';
import { getTerminology } from '@/components/common/layout-container/sidebar/utils';
import { ContentTerms, RoleTerms, SystemTerms } from '../settings/-components/NamingSettings';

// Analytics Widgets
import RealTimeActiveUsersWidget from './-components/analytics-widgets/RealTimeActiveUsersWidget';
import CurrentlyActiveUsersWidget from './-components/analytics-widgets/CurrentlyActiveUsersWidget';
import UserActivitySummaryWidget from './-components/analytics-widgets/UserActivitySummaryWidget';

// Dashboard Widgets
import EnrollLearnersWidget from './-components/EnrollLearnersWidget';
import LearningCenterWidget from './-components/LearningCenterWidget';
import AssessmentCenterWidget from './-components/AssessmentCenterWidget';

export const Route = createFileRoute('/dashboard/')({
    component: DashboardPage,
});

function DashboardPage() {
    const navigate = useNavigate();
    const [isVoltSubdomain, setIsVoltSubdomain] = useState(false);

    useEffect(() => {
        const subdomain =
            typeof window !== 'undefined' ? window.location.hostname.split('.')[0] : '';
        const isVolt = subdomain === 'volt';
        setIsVoltSubdomain(isVolt);

        if (!isVolt) return;

        const timer = setTimeout(() => {
            navigate({ to: '/study-library/volt' });
        }, 2500);

        return () => clearTimeout(timer);
    }, [navigate]);

    if (isVoltSubdomain) {
        return (
            <div className="flex h-screen w-screen flex-col items-center justify-center bg-slate-900 text-white">
                <motion.div
                    initial={{ opacity: 0, y: -40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    className="text-center"
                >
                    <Lightning size={80} className="mx-auto text-orange-400" weight="fill" />
                    <h1 className="mt-6 text-5xl font-bold tracking-tight text-white">
                        Welcome to Volt
                    </h1>
                    <p className="mt-2 text-lg text-slate-300">
                        The future of interactive presentations.
                    </p>
                </motion.div>
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1, duration: 0.5 }}
                    className="absolute bottom-10 text-sm text-slate-400"
                >
                    Redirecting you to your workspace...
                </motion.p>
            </div>
        );
    }

    return (
        <LayoutContainer>
            <DashboardComponent />
        </LayoutContainer>
    );
}

export function DashboardComponent() {
    const location = useLocation();
    const { getValue, setValue } = useLocalStorage<boolean>(IntroKey.dashboardWelcomeVideo, true);
    const { data: instituteDetails, isLoading: isInstituteLoading } =
        useSuspenseQuery(useInstituteQuery());
    const { data: adminDetails } = useSuspenseQuery(handleGetAdminDetails());
    const subModules = getModuleFlags(instituteDetails?.sub_modules);
    const { showForInstitutes } = useInstituteDetailsStore();

    const { data, isLoading: isDashboardLoading } = useSuspenseQuery(
        getInstituteDashboardData(instituteDetails?.id)
    );

    const { data: assessmentCount, isLoading: isAssessmentCountLoading } = useSuspenseQuery(
        getAssessmentsCountsData(instituteDetails?.id)
    );
    const navigate = useNavigate();
    const { setNavHeading } = useNavHeadingStore();
    const [roleTypeCount, setRoleTypeCount] = useState({
        ADMIN: 0,
        'COURSE CREATOR': 0,
        'ASSESSMENT CREATOR': 0,
        EVALUATOR: 0,
        TEACHER: 0,
    });

    useIntroJsTour({
        key: IntroKey.dashboardFirstTimeVisit,
        steps: dashboardSteps,
        onTourExit: () => {
            console.log('Tour Completed');
        },
    });

    const handleAssessmentTypeRoute = (type: string) => {
        // Track assessment creation initiation
        amplitudeEvents.createAssessment();
        trackEvent('Assessment Creation Started', {
            assessment_type: type,
            source: 'dashboard',
            timestamp: new Date().toISOString(),
        });

        navigate({
            to: '/assessment/create-assessment/$assessmentId/$examtype',
            params: {
                assessmentId: 'defaultId',
                examtype: type,
            },
            search: {
                currentStep: 0,
            },
        });
    };

    const router = useRouter();

    const handleEnrollButtonClick = () => {
        router.navigate({
            to: `/manage-students/students-list`,
        });
    };

    const handleAICenterNavigation = () => {
        // Track AI Center access
        amplitudeEvents.useFeature('ai_center', { source: 'dashboard' });
        trackEvent('AI Center Accessed', {
            source: 'dashboard_navigation',
            timestamp: new Date().toISOString(),
        });

        router.navigate({
            to: '/ai-center',
        });
    };

    useEffect(() => {
        // Slightly more compact nav heading
        setNavHeading(<h1 className="text-md font-medium">Dashboard</h1>);

        // Track dashboard page view
        trackPageView('Dashboard', {
            user_role: adminDetails?.roles?.join(',') || 'unknown',
            institute_id: instituteDetails?.id,
            timestamp: new Date().toISOString(),
        });

        amplitudeEvents.navigateToPage('dashboard');
    }, [setNavHeading, adminDetails?.roles, instituteDetails?.id]);

    useEffect(() => {
        if (location.pathname !== '/dashboard') {
            setValue(false);
        }
    }, [location.pathname, setValue]);

    if (isInstituteLoading || isDashboardLoading || isAssessmentCountLoading)
        return <DashboardLoader />;

    console.log('DashboardComponent - About to render dashboard');
    console.log('DashboardComponent - instituteDetails:', instituteDetails);

    return (
        <>
            <Helmet>
                <title>Dashboard</title>
                <meta
                    name="description"
                    content="This page shows the dashboard of the institute."
                />
            </Helmet>
            <h1 className="text-base">
                Hello <span className="text-primary-500">{adminDetails?.full_name}!</span>
            </h1>
            {getValue() && (
                <>
                    <p className="mt-0.5 text-xs text-neutral-600">
                        Welcome aboard! We&apos;re excited to have you here. Let&apos;s set up your
                        admin dashboard and make learning seamless and engaging.
                    </p>
                    {!showForInstitutes([HOLISTIC_INSTITUTE_ID, SSDC_INSTITUTE_ID]) && (
                        <iframe
                            className="m-auto mt-4 h-[35vh] w-full rounded-lg md:h-[60vh] md:w-[65%]"
                            src="https://www.youtube.com/embed/s2z1xbCWwRE?si=cgJvdMCJ8xg32lZ7"
                            title="YouTube video player"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                            allowFullScreen
                        />
                    )}
                </>
            )}
            {/* Main content */}
            <div className="mt-5 flex w-full flex-col gap-4">
                {/* Unresolved Doubts Widget */}
                <UnresolvedDoubtsWidget instituteId={instituteDetails?.id || ''} />

                <Card className="grow bg-neutral-50 shadow-none">
                    <CardHeader className="p-4">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-sm font-semibold">
                                Complete your institute profile
                            </CardTitle>

                            <EditDashboardProfileComponent isEdit={false} />
                        </div>

                        <CardDescription className="mt-1 flex items-center gap-1.5 text-xs">
                            <CompletionStatusComponent
                                profileCompletionPercentage={
                                    data?.profile_completion_percentage || 0
                                }
                            />
                            <span>{data?.profile_completion_percentage || 0}% complete</span>
                        </CardDescription>
                    </CardHeader>

                    <CardHeader className="p-4">
                        <div className="flex items-center justify-between">
                            <div className="flex flex-col">
                                <CardTitle className="text-sm font-semibold">
                                    Naming Settings
                                </CardTitle>
                                <CardDescription className="text-xs">
                                    Customize the naming conventions used throughout your institute
                                </CardDescription>
                            </div>
                            <MyButton
                                type="button"
                                scale="medium"
                                buttonType="secondary"
                                layoutVariant="default"
                                className="text-sm"
                                onClick={() => navigate({ to: '/settings' })}
                            >
                                Naming Settings
                            </MyButton>
                        </div>
                    </CardHeader>
                </Card>

                {/* AI Features Card */}
                {!showForInstitutes([HOLISTIC_INSTITUTE_ID]) && (
                    <Card
                        className="grow cursor-pointer bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-lg transition-all hover:scale-[1.01] hover:shadow-md"
                        onClick={handleAICenterNavigation}
                    >
                        <CardHeader className="p-4 sm:p-5">
                            <div className="flex items-center justify-between">
                                <CardTitle className="mb-0.5 flex items-center gap-1.5 text-base font-semibold">
                                    <Sparkle size={22} weight="fill" />
                                    Try New AI Features!
                                </CardTitle>
                                <ArrowSquareOut size={18} className="text-purple-200" />
                            </div>
                            <CardDescription className="text-xs text-purple-100">
                                Explore cutting-edge AI tools to enhance your teaching
                            </CardDescription>
                            <div className="mt-3 flex flex-wrap justify-start gap-2 sm:gap-2.5">
                                {[
                                    { icon: FilePdf, text: 'Questions from PDF' },
                                    {
                                        icon: LightbulbFilament,
                                        text: 'Questions From Lecture Audio',
                                    },
                                    { icon: LightbulbFilament, text: 'Sort Questions Topic wise' },
                                    { icon: LightbulbFilament, text: 'Questions From Image' },
                                    { icon: LightbulbFilament, text: 'Get Feedback of Lecture' },
                                    { icon: LightbulbFilament, text: 'Plan Your Lecture' },
                                ].map((item, index) => (
                                    <div
                                        key={index}
                                        className="flex h-auto min-h-10 w-32 flex-col items-center justify-center rounded-md border border-purple-300/70 bg-white/10 p-1.5 text-center shadow-sm backdrop-blur-sm transition-colors hover:bg-white/20 sm:w-32"
                                    >
                                        <item.icon size={18} className="mb-0.5 text-purple-200" />
                                        <span className="text-[11px] font-normal leading-tight text-white">
                                            {item.text}
                                        </span>
                                    </div>
                                ))}
                                <div className="flex h-auto min-h-10 w-32 flex-col items-center justify-center rounded-md border border-purple-300/70 bg-white/10 p-1.5 text-center shadow-sm backdrop-blur-sm transition-colors hover:bg-white/20 sm:w-32">
                                    <span className="text-[11px] font-normal leading-tight text-white">
                                        Many More
                                    </span>
                                </div>
                            </div>
                        </CardHeader>
                    </Card>
                )}

                {/* Analytics Widgets */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
                    <RealTimeActiveUsersWidget instituteId={instituteDetails?.id || ''} />
                    <CurrentlyActiveUsersWidget instituteId={instituteDetails?.id || ''} />
                    <UserActivitySummaryWidget instituteId={instituteDetails?.id || ''} />
                </div>

                {/* Institute Overview Widget */}
                <Card className="grow bg-neutral-50 shadow-none">
                    <CardHeader className="p-4">
                        <CardTitle className="text-sm font-semibold">Institute Overview</CardTitle>
                        <CardDescription className="mt-1 text-xs text-neutral-600">
                            Key metrics and statistics for your institute
                        </CardDescription>
                    </CardHeader>
                    <div className="px-4 pb-4">
                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                            <div className="rounded-lg bg-white p-3 shadow-sm">
                                <div className="text-lg font-semibold text-primary-500">
                                    {data?.student_count || 0}
                                </div>
                                <div className="text-xs text-neutral-600">Students</div>
                            </div>
                            <div className="rounded-lg bg-white p-3 shadow-sm">
                                <div className="text-lg font-semibold text-primary-500">
                                    {data?.batch_count || 0}
                                </div>
                                <div className="text-xs text-neutral-600">Batches</div>
                            </div>
                            <div className="rounded-lg bg-white p-3 shadow-sm">
                                <div className="text-lg font-semibold text-primary-500">
                                    {data?.course_count || 0}
                                </div>
                                <div className="text-xs text-neutral-600">Courses</div>
                            </div>
                            <div className="rounded-lg bg-white p-3 shadow-sm">
                                <div className="text-lg font-semibold text-primary-500">
                                    {data?.subject_count || 0}
                                </div>
                                <div className="text-xs text-neutral-600">Subjects</div>
                            </div>
                            <div className="rounded-lg bg-white p-3 shadow-sm">
                                <div className="text-lg font-semibold text-primary-500">
                                    {data?.level_count || 0}
                                </div>
                                <div className="text-xs text-neutral-600">Levels</div>
                            </div>
                            <div className="rounded-lg bg-white p-3 shadow-sm">
                                <div className="text-lg font-semibold text-primary-500">
                                    {data?.profile_completion_percentage || 0}%
                                </div>
                                <div className="text-xs text-neutral-600">Profile Complete</div>
                            </div>
                        </div>
                    </div>
                </Card>

                {/* Dashboard Action Widgets */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    <EnrollLearnersWidget />
                    <LearningCenterWidget />
                    <AssessmentCenterWidget
                        assessmentCount={assessmentCount?.assessment_count || 0}
                        questionPaperCount={assessmentCount?.question_paper_count || 0}
                    />
                </div>
            </div>
        </>
    );
}
