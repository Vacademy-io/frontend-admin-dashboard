import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { useSuspenseQuery } from '@tanstack/react-query';
import { useInstituteQuery } from '@/services/student-list-section/getInstituteDetails';
import { Suspense } from 'react';
import { DashboardLoader } from '@/components/core/dashboard-loader';
import { MyButton } from '@/components/design-system/button';
import { useRouter } from '@tanstack/react-router';
import { ArrowSquareOut, ChartBar } from 'phosphor-react';

// Import key analytics widgets
import RealTimeActiveUsersWidget from './analytics-widgets/RealTimeActiveUsersWidget';
import CurrentlyActiveUsersWidget from './analytics-widgets/CurrentlyActiveUsersWidget';
import DailyActivityTrendWidget from './analytics-widgets/DailyActivityTrendWidget';
import HourlyActivityWidget from './analytics-widgets/HourlyActivityWidget';

// Simple wrapper component
const WidgetWrapper = ({ children }: { children: React.ReactNode }) => {
    return <Suspense fallback={<DashboardLoader />}>{children}</Suspense>;
};

export default function DashboardAnalyticsWidgets() {
    const { data: instituteDetails } = useSuspenseQuery(useInstituteQuery());
    const instituteId = instituteDetails?.id || '';
    const router = useRouter();

    console.log('DashboardAnalyticsWidgets - instituteId:', instituteId);
    console.log('DashboardAnalyticsWidgets - instituteDetails:', instituteDetails);

    const handleViewFullInsights = () => {
        router.navigate({ to: '/learner-insights' });
    };

    if (!instituteId) {
        console.log('DashboardAnalyticsWidgets - No instituteId, returning early');
        return <div>Loading analytics...</div>;
    }

    console.log('DashboardAnalyticsWidgets - About to render, instituteId:', instituteId);

    return (
        <div className="space-y-4">
            {/* Header with CTA */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="flex items-center justify-between"
            >
                <div>
                    <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-800">
                        <ChartBar size={20} className="text-primary-500" />
                        Learner Activity
                    </h2>
                    <p className="text-sm text-gray-600">Real-time insights and activity trends</p>
                </div>
                <MyButton
                    type="button"
                    scale="small"
                    buttonType="secondary"
                    layoutVariant="default"
                    className="flex items-center gap-2 text-sm"
                    onClick={handleViewFullInsights}
                >
                    <span>View Full Insights</span>
                    <ArrowSquareOut size={16} />
                </MyButton>
            </motion.div>

            {/* Quick Analytics Row */}
            <div className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2 lg:grid-cols-3">
                {/* Real-Time Active Users */}
                <WidgetWrapper>
                    <RealTimeActiveUsersWidget instituteId={instituteId} />
                </WidgetWrapper>

                {/* Daily Activity Trend */}
                <WidgetWrapper>
                    <DailyActivityTrendWidget instituteId={instituteId} />
                </WidgetWrapper>

                {/* Hourly Activity */}
                <WidgetWrapper>
                    <HourlyActivityWidget instituteId={instituteId} />
                </WidgetWrapper>
            </div>

            {/* Currently Active Users - Full Width */}
            <WidgetWrapper>
                <CurrentlyActiveUsersWidget instituteId={instituteId} />
            </WidgetWrapper>
        </div>
    );
}
