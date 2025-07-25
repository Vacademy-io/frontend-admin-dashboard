import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { fetchAnalyticsEngagementTrends } from '../../-services/dashboard-services';
import { useTheme } from '@/providers/theme/theme-provider';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell } from 'recharts';
import { Clock, Sun, Moon } from 'phosphor-react';

interface HourlyActivityWidgetProps {
  instituteId: string;
}

export default function HourlyActivityWidget({ instituteId }: HourlyActivityWidgetProps) {
  const { primaryColor } = useTheme();

  const { data, isLoading, error } = useQuery({
    queryKey: ['analytics-hourly-activity', instituteId],
    queryFn: () => fetchAnalyticsEngagementTrends(instituteId),
    staleTime: 300000, // 5 minutes
  });

  console.log('HourlyActivityWidget - data:', data);

  // Process hourly activity data
  const hourlyData = data?.hourly_activity?.map((hour: any) => ({
    hour: hour.hour,
    activity: hour.activity_count,
    users: hour.unique_users,
    timeLabel: formatHour(hour.hour),
    period: hour.hour < 6 ? 'night' : hour.hour < 12 ? 'morning' : hour.hour < 18 ? 'afternoon' : 'evening',
  })) || [];

  function formatHour(hour: number) {
    if (hour === 0) return '12 AM';
    if (hour < 12) return `${hour} AM`;
    if (hour === 12) return '12 PM';
    return `${hour - 12} PM`;
  }

  function getBarColor(period: string) {
    switch (period) {
      case 'night': return '#6366F1'; // Indigo
      case 'morning': return '#F59E0B'; // Amber
      case 'afternoon': return '#EF4444'; // Red
      case 'evening': return '#8B5CF6'; // Purple
      default: return '#6B7280'; // Gray
    }
  }

  const peakHour = hourlyData.reduce((peak: any, current: any) =>
    current.activity > (peak?.activity || 0) ? current : peak, null);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border">
          <p className="font-semibold text-gray-800">{data.timeLabel}</p>
          <p className="text-sm text-gray-600">
            Activity: {data.activity.toLocaleString()}
          </p>
          <p className="text-sm text-gray-600">
            Users: {data.users.toLocaleString()}
          </p>
          <p className="text-sm font-medium text-primary-600 capitalize">
            {data.period}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      whileHover={{ y: -3 }}
      className="h-full"
    >
      <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-white to-amber-50 h-full">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
              className="p-2 rounded-lg bg-gradient-to-r from-amber-500 to-orange-600 text-white"
            >
              <Clock size={20} />
            </motion.div>
            <div className="flex-1">
              <CardTitle className="text-gray-800 text-lg font-bold">
                Hourly Activity
              </CardTitle>
              <CardDescription className="text-gray-600 text-sm">
                Activity distribution throughout the day
              </CardDescription>
            </div>
            {peakHour && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1 }}
                className="text-right"
              >
                <div className="text-xs text-gray-500">Peak Hour</div>
                <div className="text-lg font-bold text-amber-700">
                  {peakHour.timeLabel}
                </div>
              </motion.div>
            )}
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          {isLoading ? (
            <div className="flex items-center justify-center h-48">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                className="w-8 h-8 border-3 border-amber-500 border-t-transparent rounded-full"
              />
            </div>
          ) : error ? (
            <div className="text-red-500 text-center py-8">
              <Clock size={32} className="mx-auto mb-2 opacity-50" />
              <p className="text-sm">Failed to load hourly data</p>
            </div>
          ) : hourlyData.length === 0 ? (
            <div className="text-gray-500 text-center py-8">
              <Clock size={32} className="mx-auto mb-2 opacity-50" />
              <p className="text-sm">No hourly data available</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Bar Chart */}
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={hourlyData}>
                    <XAxis
                      dataKey="hour"
                      tick={{ fontSize: 10 }}
                      axisLine={false}
                      tickFormatter={(hour) => hour % 4 === 0 ? formatHour(hour) : ''}
                    />
                    <YAxis
                      tick={{ fontSize: 12 }}
                      axisLine={false}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar
                      dataKey="activity"
                      radius={[2, 2, 0, 0]}
                      animationDuration={1000}
                    >
                      {hourlyData.map((entry: any, index: number) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={getBarColor(entry.period)}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Period Breakdown */}
              <div className="grid grid-cols-4 gap-2 text-center">
                {[
                  { period: 'morning', icon: Sun, color: 'text-amber-600', bg: 'bg-amber-100', border: 'border-amber-200' },
                  { period: 'afternoon', icon: Sun, color: 'text-red-600', bg: 'bg-red-100', border: 'border-red-200' },
                  { period: 'evening', icon: Moon, color: 'text-purple-600', bg: 'bg-purple-100', border: 'border-purple-200' },
                  { period: 'night', icon: Moon, color: 'text-indigo-600', bg: 'bg-indigo-100', border: 'border-indigo-200' },
                ].map((p, index) => {
                  const periodData = hourlyData.filter((h: any) => h.period === p.period);
                  const totalActivity = periodData.reduce((sum: number, h: any) => sum + h.activity, 0);

                  return (
                    <motion.div
                      key={p.period}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 + index * 0.1 }}
                      className={`p-2 rounded-lg ${p.bg} border ${p.border}`}
                    >
                      <p.icon size={16} className={`mx-auto ${p.color}`} />
                      <div className={`text-sm font-bold ${p.color}`}>
                        {totalActivity}
                      </div>
                      <div className="text-xs text-gray-600 capitalize">
                        {p.period}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
