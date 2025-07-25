import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { fetchAnalyticsEngagementTrends } from '../../-services/dashboard-services';
import { useTheme } from '@/providers/theme/theme-provider';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from 'recharts';
import { ChartLine, Calendar } from 'phosphor-react';

interface DailyActivityTrendWidgetProps {
  instituteId: string;
}

export default function DailyActivityTrendWidget({ instituteId }: DailyActivityTrendWidgetProps) {
  const { primaryColor } = useTheme();

  const { data, isLoading, error } = useQuery({
    queryKey: ['analytics-daily-trends', instituteId],
    queryFn: () => fetchAnalyticsEngagementTrends(instituteId),
    staleTime: 300000, // 5 minutes
  });

  console.log('DailyActivityTrendWidget - data:', data);

  // Process daily activity trend data
  const trendData = data?.daily_activity_trend?.map((day: any) => ({
    date: new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    users: day.unique_users,
    sessions: day.total_sessions,
    apiCalls: day.total_api_calls,
    avgDuration: Math.round(day.average_session_duration || 0),
  }))?.slice(-7) || []; // Show last 7 days

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border">
          <p className="font-semibold text-gray-800">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.value.toLocaleString()}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      whileHover={{ y: -3 }}
      className="h-full"
    >
      <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-white to-blue-50 h-full">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <motion.div
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
              className="p-2 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-600 text-white"
            >
              <ChartLine size={20} />
            </motion.div>
            <div>
              <CardTitle className="text-gray-800 text-lg font-bold">
                Daily Activity Trend
              </CardTitle>
              <CardDescription className="text-gray-600 text-sm">
                User activity over the past week
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          {isLoading ? (
            <div className="flex items-center justify-center h-48">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full"
              />
            </div>
          ) : error ? (
            <div className="text-red-500 text-center py-8">
              <ChartLine size={32} className="mx-auto mb-2 opacity-50" />
              <p className="text-sm">Failed to load trend data</p>
            </div>
          ) : trendData.length === 0 ? (
            <div className="text-gray-500 text-center py-8">
              <ChartLine size={32} className="mx-auto mb-2 opacity-50" />
              <p className="text-sm">No trend data available</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Line Chart */}
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 12 }}
                      axisLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 12 }}
                      axisLine={false}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Line
                      type="monotone"
                      dataKey="users"
                      stroke="#3B82F6"
                      strokeWidth={3}
                      dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                      name="Users"
                      animationDuration={1000}
                    />
                    <Line
                      type="monotone"
                      dataKey="sessions"
                      stroke="#10B981"
                      strokeWidth={2}
                      dot={{ fill: '#10B981', strokeWidth: 2, r: 3 }}
                      name="Sessions"
                      animationDuration={1200}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Summary Stats */}
              <div className="grid grid-cols-3 gap-3 text-center">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="p-2 rounded-lg bg-blue-100 border border-blue-200"
                >
                  <div className="text-lg font-bold text-blue-700">
                    {trendData.reduce((sum: number, day: any) => sum + day.users, 0)}
                  </div>
                  <div className="text-xs text-blue-600">Total Users</div>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="p-2 rounded-lg bg-green-100 border border-green-200"
                >
                  <div className="text-lg font-bold text-green-700">
                    {trendData.reduce((sum: number, day: any) => sum + day.sessions, 0)}
                  </div>
                  <div className="text-xs text-green-600">Total Sessions</div>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                  className="p-2 rounded-lg bg-cyan-100 border border-cyan-200"
                >
                  <div className="text-lg font-bold text-cyan-700">
                    {Math.round(trendData.reduce((sum: number, day: any) => sum + day.avgDuration, 0) / trendData.length)}m
                  </div>
                  <div className="text-xs text-cyan-600">Avg Duration</div>
                </motion.div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
