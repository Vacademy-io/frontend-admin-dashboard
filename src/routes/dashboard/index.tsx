import { createFileRoute, useLocation, useNavigate, useRouter } from '@tanstack/react-router';
import { LayoutContainer } from '@/components/common/layout-container/layout-container';
import { useNavHeadingStore } from '@/stores/layout-container/useNavHeadingStore';
import { useEffect, useState, useMemo } from 'react';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MyButton } from '@/components/design-system/button';
import {
    ArrowSquareOut,
    Sparkle,
    FilePdf,
    LightbulbFilament,
    Lightning,
    BookOpen,
    Eye,
    Plus,
    PencilSimpleLine,
} from 'phosphor-react';
import { CompletionStatusComponent } from './-components/CompletionStatusComponent';
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
import useLocalStorage from '@/hooks/use-local-storage';
import EditDashboardProfileComponent from './-components/EditDashboardProfileComponent';
import { handleGetAdminDetails } from '@/services/student-list-section/getAdminDetails';
import { motion } from 'framer-motion';
import { useInstituteDetailsStore } from '@/stores/students/students-list/useInstituteDetailsStore';
import { UnresolvedDoubtsWidget } from './-components/UnresolvedDoubtsWidget';
import LiveClassesWidget from './-components/LiveClassesWidget';
import { getTerminology } from '@/components/common/layout-container/sidebar/utils';
import { ContentTerms, RoleTerms, SystemTerms } from '../settings/-components/NamingSettings';

import { getTokenFromCookie, getUserRoles } from '@/lib/auth/sessionUtility';
import { TokenKey } from '@/constants/auth/tokens';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { CreateAssessmentDashboardLogo, DashboardCreateCourse } from '@/svgs';

// Analytics Widgets
import RealTimeActiveUsersWidget from './-components/analytics-widgets/RealTimeActiveUsersWidget';
import CurrentlyActiveUsersWidget from './-components/analytics-widgets/CurrentlyActiveUsersWidget';
import UserActivitySummaryWidget from './-components/analytics-widgets/UserActivitySummaryWidget';

// Dashboard Widgets
import EnrollLearnersWidget from './-components/EnrollLearnersWidget';
import LearningCenterWidget from './-components/LearningCenterWidget';
import AssessmentCenterWidget from './-components/AssessmentCenterWidget';
import RoleTypeComponent from './-components/RoleTypeComponent';

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

// My Courses Widget Component for Non-Admin Users
function MyCoursesWidget() {
    const navigate = useNavigate();
    const [courseCounts, setCourseCounts] = useState({
        authored: 0,
        inReview: 0,
        loading: true,
        error: false,
    });

    // Import the getMyCourses function
    const { getMyCourses } = useMemo(() => {
        return {
            getMyCourses: async () => {
                try {
                    const { getMyCourses } = await import(
                        '../study-library/courses/-services/approval-services'
                    );
                    return await getMyCourses();
                } catch (error) {
                    console.error('Failed to fetch courses:', error);
                    throw error;
                }
            },
        };
    }, []);

    // Fetch course data on component mount
    useEffect(() => {
        const fetchCourseData = async () => {
            try {
                setCourseCounts((prev) => ({ ...prev, loading: true, error: false }));
                const courses = await getMyCourses();

                if (Array.isArray(courses)) {
                    const totalAuthored = courses.length;
                    const inReview = courses.filter(
                        (course) => course.courseStatus === 'IN_REVIEW'
                    ).length;

                    setCourseCounts({
                        authored: totalAuthored,
                        inReview: inReview,
                        loading: false,
                        error: false,
                    });
                } else {
                    // Handle case where courses might be null or undefined
                    setCourseCounts({
                        authored: 0,
                        inReview: 0,
                        loading: false,
                        error: false,
                    });
                }
            } catch (error) {
                console.error('Error fetching course data:', error);
                setCourseCounts((prev) => ({
                    ...prev,
                    loading: false,
                    error: true,
                }));
            }
        };

        fetchCourseData();
    }, [getMyCourses]);

    const handleViewAllCourses = () => {
        navigate({ to: '/study-library/courses' });
    };

    const handleViewInReview = () => {
        navigate({ to: '/study-library/courses' });
    };

    return (
        <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-none">
            <CardHeader className="p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <BookOpen size={20} className="text-blue-600" weight="duotone" />
                        <CardTitle className="text-sm font-semibold text-blue-900">
                            My Courses
                        </CardTitle>
                    </div>
                    <MyButton
                        buttonType="secondary"
                        onClick={handleViewAllCourses}
                        className="text-xs"
                        disabled={courseCounts.loading}
                    >
                        <Eye size={14} className="mr-1" />
                        View All
                    </MyButton>
                </div>
                <CardDescription className="text-xs text-blue-700">
                    Quick access to your authored courses and submissions
                </CardDescription>
            </CardHeader>
            <div className="px-4 pb-4">
                <div className="grid grid-cols-2 gap-3">
                    <div
                        className="cursor-pointer rounded-lg bg-white/70 p-3 shadow-sm transition-colors hover:bg-white/90"
                        onClick={handleViewAllCourses}
                    >
                        <div className="text-lg font-semibold text-blue-600">
                            {courseCounts.loading ? (
                                <div className="h-6 w-8 animate-pulse rounded bg-blue-200"></div>
                            ) : courseCounts.error ? (
                                '?'
                            ) : (
                                courseCounts.authored
                            )}
                        </div>
                        <div className="text-xs text-blue-700">Authored Courses</div>
                    </div>
                    <div
                        className="cursor-pointer rounded-lg bg-white/70 p-3 shadow-sm transition-colors hover:bg-white/90"
                        onClick={handleViewInReview}
                    >
                        <div className="text-lg font-semibold text-orange-600">
                            {courseCounts.loading ? (
                                <div className="h-6 w-8 animate-pulse rounded bg-orange-200"></div>
                            ) : courseCounts.error ? (
                                '?'
                            ) : (
                                courseCounts.inReview
                            )}
                        </div>
                        <div className="text-xs text-orange-700">In Review</div>
                    </div>
                </div>
                {courseCounts.error && (
                    <div className="mt-2 text-center">
                        <p className="text-xs text-red-600">Failed to load course data</p>
                    </div>
                )}
            </div>
        </Card>
    );
}

export function DashboardComponent() {
    const location = useLocation();
    const { getValue, setValue } = useLocalStorage<boolean>(IntroKey.dashboardWelcomeVideo, true);
    const { data: instituteDetails, isLoading: isInstituteLoading } =
        useSuspenseQuery(useInstituteQuery());
    const { data: adminDetails } = useSuspenseQuery(handleGetAdminDetails());
    const { showForInstitutes } = useInstituteDetailsStore();
    const subModules = getModuleFlags(instituteDetails?.sub_modules);
    const router = useRouter();

    // Role detection
    const accessToken = getTokenFromCookie(TokenKey.accessToken);
    const userRoles = getUserRoles(accessToken);
    const isAdmin = userRoles.includes('ADMIN');

    const { data, isLoading: isDashboardLoading } = useSuspenseQuery(
        getInstituteDashboardData(instituteDetails?.id)
    );

    const { data: assessmentCount, isLoading: isAssessmentCountLoading } = useSuspenseQuery(
        getAssessmentsCountsData(instituteDetails?.id)
    );
    const [roleTypeCount, setRoleTypeCount] = useState({
        ADMIN: 0,
        'COURSE CREATOR': 0,
        'ASSESSMENT CREATOR': 0,
        EVALUATOR: 0,
        TEACHER: 0,
    });
    const navigate = useNavigate();
    const { setNavHeading } = useNavHeadingStore();

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

    const handleEnrollButtonClick = () => {
        navigate({ to: '/manage-students/invite' });
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
        setNavHeading(<h1 className="font-medium">Dashboard</h1>);

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
                {/* Unresolved Doubts Widget - conditionally rendered if there are unresolved doubts */}
                <UnresolvedDoubtsWidget instituteId={instituteDetails?.id || ''} />
                <Card className="grow bg-neutral-50 shadow-none">
                    <CardHeader className="p-4">
                        {/* Reduced padding */}
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-sm font-semibold">
                                Complete your institute profile
                            </CardTitle>
                            {/* Smaller title */}
                            <EditDashboardProfileComponent isEdit={false} />
                        </div>
                    </CardHeader>
                </Card>

                {/* My Courses Widget - Only for Non-Admin Users */}
                {!isAdmin && <MyCoursesWidget />}

                {/* Unresolved Doubts Widget */}
                {subModules.lms ||
                    (subModules.assess && (
                        <UnresolvedDoubtsWidget instituteId={instituteDetails?.id || ''} />
                    ))}

                {/* Admin Only Widgets */}
                {isAdmin && (
                    <>
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
                                    <span>
                                        {data?.profile_completion_percentage || 0}% complete
                                    </span>
                                </CardDescription>
                            </CardHeader>

                            <CardHeader className="p-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex flex-col">
                                        <CardTitle className="text-sm font-semibold">
                                            Naming Settings
                                        </CardTitle>
                                        <CardDescription className="text-xs">
                                            Customize the naming conventions used throughout your
                                            institute
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

                        {/* Analytics Widgets - Admin Only */}
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
                            <RealTimeActiveUsersWidget instituteId={instituteDetails?.id || ''} />
                            <CurrentlyActiveUsersWidget instituteId={instituteDetails?.id || ''} />
                            <UserActivitySummaryWidget instituteId={instituteDetails?.id || ''} />
                        </div>

                        {/* Institute Overview Widget - Admin Only */}

                        {subModules.lms && (
                            <Card className="grow bg-neutral-50 shadow-none">
                                <CardHeader className="p-4">
                                    <CardTitle className="text-sm font-semibold">
                                        Institute Overview
                                    </CardTitle>
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
                                            <div className="text-xs text-neutral-600">
                                                Profile Complete
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        )}
                    </>
                )}

                {/* Dashboard Action Widgets */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    {(subModules.lms || subModules.assess) && <EnrollLearnersWidget />}
                    {subModules.lms && <LearningCenterWidget />}
                    {subModules.assess && (
                        <AssessmentCenterWidget
                            assessmentCount={assessmentCount?.assessment_count || 0}
                            questionPaperCount={assessmentCount?.question_paper_count || 0}
                        />
                    )}
                </div>

                {/* AI Features Card - Moved to Bottom for All Users */}
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
                {/* End of AI Features Card */}
                <div
                    className={`flex flex-col ${subModules.assess ? 'lg:flex-col' : 'lg:flex-row'} gap-4`} // Reduced gap
                >
                    <div
                        className={`flex flex-1 flex-col ${
                            subModules.assess ? 'md:flex-row' : 'md:flex-col'
                        } gap-4`} // Reduced gap
                    >
                        <Card className="flex-1 bg-neutral-50 shadow-none">
                            <CardHeader className="p-4">
                                {' '}
                                {/* Reduced padding */}
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-sm font-semibold">
                                        Role Type Users
                                    </CardTitle>{' '}
                                    {/* Smaller title */}
                                    <RoleTypeComponent setRoleTypeCount={setRoleTypeCount} />
                                </div>
                                <div className="mt-2 flex flex-col items-start gap-1.5">
                                    {' '}
                                    {/* Reduced margin-top and gap */}
                                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                                        {' '}
                                        {/* Reduced gap */}
                                        {[
                                            {
                                                label: getTerminology(
                                                    RoleTerms.Admin,
                                                    SystemTerms.Admin
                                                ),
                                                count: roleTypeCount.ADMIN,
                                                bg: 'bg-[#E6EFFC]',
                                                textCol: 'text-blue-700',
                                                borderCol: 'border-blue-200',
                                            },
                                            ...(!showForInstitutes([HOLISTIC_INSTITUTE_ID])
                                                ? [
                                                      {
                                                          label: getTerminology(
                                                              RoleTerms.CourseCreator,
                                                              SystemTerms.CourseCreator
                                                          ),
                                                          count: roleTypeCount['COURSE CREATOR'],
                                                          bg: 'bg-[#E6FCEF]',
                                                          textCol: 'text-green-700',
                                                          borderCol: 'border-green-200',
                                                      },
                                                      {
                                                          label: getTerminology(
                                                              RoleTerms.AssessmentCreator,
                                                              SystemTerms.AssessmentCreator
                                                          ),
                                                          count: roleTypeCount[
                                                              'ASSESSMENT CREATOR'
                                                          ],
                                                          bg: 'bg-[#FCE6E7]',
                                                          textCol: 'text-red-700',
                                                          borderCol: 'border-red-200',
                                                      },
                                                  ]
                                                : []),
                                        ].map((role) => (
                                            <>
                                                <Badge
                                                    className={`whitespace-nowrap rounded border px-1.5 py-0.5 text-[11px] font-normal shadow-none ${role.bg} ${role.textCol} ${role.borderCol}`}
                                                >
                                                    {role.label}
                                                </Badge>
                                                <span className="text-xs font-medium text-primary-500">
                                                    {role.count}
                                                </span>
                                            </>
                                        ))}
                                    </div>
                                    {!showForInstitutes([HOLISTIC_INSTITUTE_ID]) && (
                                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                                            {' '}
                                            {/* Reduced gap */}
                                            {[
                                                {
                                                    label: getTerminology(
                                                        RoleTerms.Teacher,
                                                        SystemTerms.Teacher
                                                    ),
                                                    count: roleTypeCount['TEACHER'],
                                                    bg: 'bg-[#FCE6E7]',
                                                    textCol: 'text-red-700',
                                                    borderCol: 'border-red-200',
                                                }, // Example color, adjust as needed
                                                {
                                                    label: getTerminology(
                                                        RoleTerms.Evaluator,
                                                        SystemTerms.Evaluator
                                                    ),
                                                    count: roleTypeCount.EVALUATOR,
                                                    bg: 'bg-[#F0E6FC]',
                                                    textCol: 'text-purple-700',
                                                    borderCol: 'border-purple-200',
                                                },
                                            ].map((role) => (
                                                <>
                                                    <Badge
                                                        className={`whitespace-nowrap rounded border px-1.5 py-0.5 text-[11px] font-normal shadow-none ${role.bg} ${role.textCol} ${role.borderCol}`}
                                                    >
                                                        {role.label}
                                                    </Badge>
                                                    <span className="text-xs font-medium text-primary-500">
                                                        {role.count}
                                                    </span>
                                                </>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </CardHeader>
                        </Card>
                        <Card className="flex-1 grow bg-neutral-50 shadow-none">
                            <CardHeader className="p-4">
                                {' '}
                                {/* Reduced padding */}
                                <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:justify-between">
                                    <CardTitle className="text-sm font-semibold sm:mb-0">
                                        Enroll{' '}
                                        {getTerminology(RoleTerms.Learner, SystemTerms.Learner)}
                                    </CardTitle>{' '}
                                    {/* Smaller title */}
                                    <MyButton
                                        type="submit"
                                        scale="small" // Adjusted scale
                                        buttonType="secondary"
                                        id="quick-enrollment"
                                        layoutVariant="default"
                                        className="w-full px-3 py-1.5 text-xs sm:w-auto" // Custom class for finer control
                                        onClick={handleEnrollButtonClick}
                                    >
                                        Enroll
                                    </MyButton>
                                </div>
                                <CardDescription className="mt-1.5 flex flex-col gap-1 text-xs text-neutral-600 sm:flex-row sm:items-center sm:gap-3">
                                    {' '}
                                    {/* Reduced margin, gap, text size */}
                                    <div
                                        className="flex cursor-pointer items-center gap-1"
                                        onClick={() =>
                                            navigate({ to: '/manage-institute/batches' })
                                        }
                                    >
                                        <div className="flex items-center gap-0.5">
                                            {' '}
                                            {/* Reduced gap */}
                                            <span>Batches</span>
                                            <ArrowSquareOut size={14} /> {/* Smaller icon */}
                                        </div>
                                        <span className="font-medium text-primary-500">
                                            {data.batch_count}
                                        </span>
                                    </div>
                                    <div
                                        className="flex cursor-pointer items-center gap-1"
                                        onClick={() =>
                                            navigate({ to: '/manage-students/students-list' })
                                        }
                                    >
                                        <div className="flex items-center gap-0.5">
                                            <span>
                                                {getTerminology(
                                                    RoleTerms.Learner,
                                                    SystemTerms.Learner
                                                )}
                                            </span>
                                            <ArrowSquareOut size={14} /> {/* Smaller icon */}
                                        </div>
                                        <span className="font-medium text-primary-500">
                                            {data.student_count}
                                        </span>
                                    </div>
                                </CardDescription>
                            </CardHeader>
                        </Card>
                    </div>
                    <div className="flex flex-1 flex-col gap-4 md:flex-row">
                        {!showForInstitutes([HOLISTIC_INSTITUTE_ID]) && (
                            <Card className="flex-1 bg-neutral-50 shadow-none">
                                <CardHeader className="p-4">
                                    <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:justify-between">
                                        <CardTitle className="text-sm font-semibold sm:mb-0">
                                            Learning Center
                                        </CardTitle>
                                        {/* Smaller title */}
                                        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
                                            <MyButton
                                                type="submit"
                                                scale="small" // Adjusted scale
                                                id="first-course"
                                                buttonType="secondary"
                                                layoutVariant="default"
                                                className="w-full px-3 py-1.5 text-xs sm:w-auto" // Custom class
                                            >
                                                <Plus size={16} /> {/* Smaller icon */}
                                                Create{' '}
                                                {getTerminology(
                                                    ContentTerms.Course,
                                                    SystemTerms.Course
                                                )}
                                            </MyButton>
                                            <MyButton
                                                type="submit"
                                                scale="small" // Adjusted scale
                                                id="add-study-slides"
                                                buttonType="secondary"
                                                layoutVariant="default"
                                                className="w-full px-3 py-1.5 text-xs sm:w-auto" // Custom class
                                            >
                                                <Plus size={16} /> {/* Smaller icon */}
                                                Add Study{' '}
                                                {getTerminology(
                                                    ContentTerms.Slides,
                                                    SystemTerms.Slides
                                                )}
                                            </MyButton>
                                        </div>
                                    </div>
                                    <CardDescription className="flex flex-col gap-1 py-2 text-xs text-neutral-600 sm:flex-row sm:items-center sm:gap-3 sm:py-3">
                                        {' '}
                                        {/* Reduced padding, gap, text size */}
                                        <div
                                            className="flex cursor-pointer items-center gap-1"
                                            onClick={() =>
                                                navigate({ to: '/study-library/courses' })
                                            }
                                        >
                                            <div className="flex items-center gap-0.5">
                                                <span>
                                                    {getTerminology(
                                                        ContentTerms.Course,
                                                        SystemTerms.Course
                                                    )}
                                                </span>
                                                <ArrowSquareOut size={14} /> {/* Smaller icon */}
                                            </div>
                                            <span className="font-medium text-primary-500">
                                                {data.course_count}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <span>
                                                {getTerminology(
                                                    ContentTerms.Level,
                                                    SystemTerms.Level
                                                )}
                                            </span>
                                            <span className="font-medium text-primary-500">
                                                {instituteDetails?.levels?.length}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <span>
                                                {getTerminology(
                                                    ContentTerms.Subjects,
                                                    SystemTerms.Subjects
                                                )}
                                            </span>
                                            <span className="font-medium text-primary-500">
                                                {instituteDetails?.subjects?.length}
                                            </span>
                                        </div>
                                    </CardDescription>
                                    <CardDescription className="mt-1 flex justify-center">
                                        <DashboardCreateCourse className="h-auto w-full max-w-[180px] sm:max-w-[200px]" />
                                    </CardDescription>
                                </CardHeader>
                            </Card>
                        )}
                        {showForInstitutes([HOLISTIC_INSTITUTE_ID]) && (
                            <Card className="flex-1 border border-gray-200 bg-neutral-50 shadow-sm">
                                <CardHeader className="p-4">
                                    <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:justify-between">
                                        <CardTitle className="text-sm font-semibold sm:mb-0">
                                            Live Classes
                                        </CardTitle>
                                        <MyButton
                                            type="submit"
                                            scale="small"
                                            buttonType="secondary"
                                            layoutVariant="default"
                                            className="w-full px-3 py-1.5 text-xs sm:w-auto"
                                        >
                                            <Plus size={16} />
                                            Add Live Class
                                        </MyButton>
                                    </div>
                                    <div className="mt-4 flex flex-col gap-4 md:flex-row">
                                        <CardDescription>
                                            <img
                                                src="/yoga.png"
                                                alt="yoga"
                                                className="h-auto w-full max-w-[180px] sm:max-w-[200px]"
                                            />
                                        </CardDescription>

                                        <CardDescription className="flex-1 space-y-3">
                                            <div className="flex items-center justify-around rounded-lg border bg-gray-50 p-2">
                                                <div className="flex flex-col items-center gap-3">
                                                    <span className="text-xs">Upcoming</span>
                                                    <span className="mt-1 text-sm font-medium text-primary-500">
                                                        6:00 am
                                                    </span>
                                                </div>
                                                <div className="flex flex-col items-center gap-2">
                                                    <span className="font-medium text-gray-900">
                                                        Morning Batch 1
                                                    </span>
                                                    <div className="flex gap-x-2">
                                                        <span className="rounded border p-2 text-xs">
                                                            https://live/789xy
                                                        </span>
                                                        <button className="rounded border p-1 hover:bg-gray-200">
                                                            <PencilSimpleLine
                                                                size={16}
                                                                className="text-gray-600"
                                                            />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-around rounded-lg border bg-gray-50 p-2">
                                                <div className="flex flex-col items-center gap-3">
                                                    <span className="text-xs">Upcoming</span>
                                                    <span className="mt-1 text-sm font-medium text-primary-500">
                                                        7:00 am
                                                    </span>
                                                </div>
                                                <div className="flex flex-col items-center gap-2">
                                                    <span className="font-medium text-gray-900">
                                                        Morning Batch 1
                                                    </span>
                                                    <div className="flex gap-x-2">
                                                        <span className="rounded border p-2 text-xs">
                                                            https://live/789xy
                                                        </span>
                                                        <button className="rounded border p-1 hover:bg-gray-200">
                                                            <PencilSimpleLine
                                                                size={16}
                                                                className="text-gray-600"
                                                            />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* More classes indicator */}
                                            <div className="py-2 text-center">
                                                <span className="text-sm text-gray-500">
                                                    +4 More
                                                </span>
                                            </div>
                                        </CardDescription>
                                    </div>
                                </CardHeader>
                            </Card>
                        )}
                        {subModules.assess && (
                            <Card className="flex-1 grow bg-neutral-50 shadow-none">
                                <CardHeader className="p-4">
                                    {' '}
                                    {/* Reduced padding */}
                                    <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:justify-between">
                                        <CardTitle className="text-sm font-semibold sm:mb-0">
                                            Assessment
                                        </CardTitle>{' '}
                                        {/* Smaller title */}
                                        <Dialog>
                                            <DialogTrigger asChild>
                                                <MyButton
                                                    type="button"
                                                    scale="small" // Adjusted scale
                                                    id="first-assessment"
                                                    buttonType="secondary"
                                                    layoutVariant="default"
                                                    className="w-full px-3 py-1.5 text-xs sm:w-auto" // Custom class
                                                >
                                                    <Plus size={16} /> {/* Smaller icon */}
                                                    Create
                                                </MyButton>
                                            </DialogTrigger>
                                            <DialogContent className="max-w-xs p-0 sm:max-w-sm">
                                                {' '}
                                                {/* Compact dialog */}
                                                <h1 className="rounded-t-md bg-neutral-50 p-3 text-base font-medium text-primary-500">
                                                    {' '}
                                                    {/* Adjusted padding */}
                                                    Create Assessment
                                                </h1>
                                                <div className="flex flex-col items-center justify-center gap-3 p-4 sm:gap-4">
                                                    {' '}
                                                    {/* Adjusted padding and gap */}
                                                    {['EXAM', 'MOCK', 'PRACTICE', 'SURVEY'].map(
                                                        (type) => (
                                                            <MyButton
                                                                key={type}
                                                                type="button"
                                                                scale="medium" // Medium is okay for dialog choices
                                                                buttonType="secondary"
                                                                className="w-full text-sm font-medium sm:w-auto"
                                                                onClick={() =>
                                                                    handleAssessmentTypeRoute(type)
                                                                }
                                                            >
                                                                {type.charAt(0) +
                                                                    type.slice(1).toLowerCase()}
                                                            </MyButton>
                                                        )
                                                    )}
                                                </div>
                                            </DialogContent>
                                        </Dialog>
                                    </div>
                                    <CardDescription className="flex flex-wrap items-center gap-x-3 gap-y-1 py-2 text-xs text-neutral-600 sm:py-3">
                                        {' '}
                                        {/* Reduced padding, gap, text size */}
                                        {[
                                            {
                                                label: 'Live',
                                                count: assessmentCount?.live_count,
                                                tab: 'liveTests',
                                            },
                                            {
                                                label: 'Upcoming',
                                                count: assessmentCount?.upcoming_count,
                                                tab: 'upcomingTests',
                                            },
                                            {
                                                label: 'Previous',
                                                count: assessmentCount?.previous_count,
                                                tab: 'previousTests',
                                            },
                                            {
                                                label: 'Drafts',
                                                count: assessmentCount?.draft_count,
                                                tab: 'draftTests',
                                            },
                                        ].map((item) => (
                                            <div
                                                key={item.tab}
                                                className="flex cursor-pointer items-center gap-1"
                                                onClick={() =>
                                                    navigate({
                                                        to: '/assessment/assessment-list',
                                                        search: { selectedTab: item.tab },
                                                    })
                                                }
                                            >
                                                <div className="flex items-center gap-0.5">
                                                    {' '}
                                                    {/* Reduced gap */}
                                                    <span>{item.label}</span>
                                                    <ArrowSquareOut size={14} />{' '}
                                                    {/* Smaller icon */}
                                                </div>
                                                <span className="font-medium text-primary-500">
                                                    {item.count}
                                                </span>
                                            </div>
                                        ))}
                                    </CardDescription>
                                    <CardDescription className="mt-1 flex items-center justify-center">
                                        {' '}
                                        {/* Reduced margin */}
                                        <CreateAssessmentDashboardLogo
                                            className="mt-2 h-auto w-full max-w-[160px] text-primary-500 sm:max-w-[180px]" // Smaller SVG, applied primary color via text
                                            fill="currentColor" // Use currentColor to inherit text color
                                        />
                                    </CardDescription>
                                </CardHeader>
                            </Card>
                        )}
                    </div>
                </div>
                {/* Live Classes Widget at bottom in half-width column */}
                <div className="flex flex-col gap-4 md:flex-row">
                    <div className="flex-1">
                        <LiveClassesWidget instituteId={instituteDetails?.id || ''} />
                    </div>
                    {/* empty placeholder for right half */}
                    <div className="flex-1"></div>
                </div>
            </div>
        </>
    );
}
