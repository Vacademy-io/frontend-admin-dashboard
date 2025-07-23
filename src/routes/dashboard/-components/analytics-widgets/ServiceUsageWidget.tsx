import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { fetchAnalyticsServiceUsage } from '../../-services/dashboard-services';
import { useTheme } from '@/providers/theme/theme-provider';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell } from 'recharts';
import {
  Database,
  Gear,
  PlayCircle,
  Users,
  Bell,
  FileText,
  ChartBar
} from 'phosphor-react';
import { AnalyticsErrorDisplay } from './AnalyticsErrorDisplay';

interface ServiceUsageWidgetProps {
  instituteId: string;
}

export default function ServiceUsageWidget({ instituteId }: ServiceUsageWidgetProps) {
  const { primaryColor } = useTheme();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['analytics-service-usage', instituteId],
    queryFn: () => fetchAnalyticsServiceUsage(instituteId),
    staleTime: 300000, // 5 minutes
  });

  // Debug logging
  console.log('ServiceUsageWidget - data:', data);
  console.log('ServiceUsageWidget - isLoading:', isLoading);
  console.log('ServiceUsageWidget - error:', error);

  // Process service usage data - handle both possible data structures
  const serviceData = (data?.serviceUsageStats || data?.service_usage_stats || [])?.map((service: any, index: number) => ({
    name: service.service_name,
    usage: service.usage_count,
    users: service.unique_users,
    avgResponseTime: service.average_response_time,
    shortName: service.service_name
      .replace(/_service$/, '')
      .replace(/-service$/, '')
      .replace('admin_core', 'admin')
      .replace('_', ' ')
      .replace('-', ' ')
      .split(' ')
      .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' '),
    color: getServiceColor(index),
  }))?.slice(0, 6) || []; // Show top 6 services

  console.log('ServiceUsageWidget - processedData:', serviceData);

  function getServiceColor(index: number) {
    const colors = [
      '#3B82F6', // Blue
      '#10B981', // Green
      '#F59E0B', // Amber
      '#EF4444', // Red
      '#8B5CF6', // Purple
      '#06B6D4', // Cyan
    ];
    return colors[index % colors.length];
  }

  const getServiceIcon = (serviceName: string) => {
    const name = serviceName.toLowerCase();
    if (name.includes('assessment')) return ChartBar;
    if (name.includes('admin') || name.includes('core')) return Gear;
    if (name.includes('media')) return PlayCircle;
    if (name.includes('community')) return Users;
    if (name.includes('notification')) return Bell;
    return Database;
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border">
          <p className="font-semibold text-gray-800 capitalize">{data.name}</p>
          <p className="text-sm text-gray-600">
            Usage: {data.usage.toLocaleString()}
          </p>
          <p className="text-sm text-gray-600">
            Users: {data.users.toLocaleString()}
          </p>
          <p className="text-sm text-gray-600">
            Avg Response: {data.avgResponseTime}ms
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      whileHover={{ y: -3 }}
      className="h-full"
    >
      <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-white to-indigo-50 h-full">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="p-2 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 text-white"
            >
              <Database size={20} />
            </motion.div>
            <div>
              <CardTitle className="text-gray-800 text-lg font-bold">
                Service Usage
              </CardTitle>
              <CardDescription className="text-gray-600 text-sm">
                Most active services and APIs
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <motion.div
                  key={i}
                  animate={{ opacity: [0.3, 0.7, 0.3] }}
                  transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.1 }}
                  className="h-8 bg-gray-200 rounded-lg"
                />
              ))}
            </div>
          ) : error ? (
            <AnalyticsErrorDisplay
              error={error}
              widgetName="service usage"
              onRetry={() => refetch()}
              fallbackIcon={Database}
            />
          ) : serviceData.length === 0 ? (
            <div className="text-gray-500 text-center py-8">
              <Database size={32} className="mx-auto mb-2 opacity-50" />
              <p className="text-sm">No service data available</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Horizontal Bar Chart */}
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={serviceData}
                    layout="horizontal"
                    margin={{ top: 5, right: 30, left: 60, bottom: 5 }}
                  >
                    <XAxis type="number" tick={{ fontSize: 12 }} />
                    <YAxis
                      type="category"
                      dataKey="shortName"
                      tick={{ fontSize: 10 }}
                      width={50}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar
                      dataKey="usage"
                      radius={[0, 4, 4, 0]}
                      animationDuration={1000}
                      animationBegin={0}
                    >
                      {serviceData.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Service List */}
              <div className="space-y-2">
                {serviceData.slice(0, 4).map((service: any, index: number) => {
                  const ServiceIcon = getServiceIcon(service.name);

                  return (
                    <motion.div
                      key={service.name}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                      className="flex items-center justify-between p-2 rounded-lg hover:bg-white/50 transition-colors"
                    >
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <ServiceIcon
                          size={16}
                          style={{ color: service.color }}
                        />
                        <span className="text-sm font-medium text-gray-700 truncate">
                          {service.shortName}
                        </span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold text-gray-800">
                          {service.usage.toLocaleString()}
                        </div>
                        <div className="text-xs text-gray-500">
                          {service.users} users
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Performance indicator */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="text-center pt-2 border-t border-gray-200"
              >
                <p className="text-xs text-gray-500">
                  Avg response time: {' '}
                  <span className="font-medium text-gray-700">
                    {Math.round(serviceData.reduce((sum: number, s: any) => sum + s.avgResponseTime, 0) / serviceData.length)}ms
                  </span>
                </p>
              </motion.div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
