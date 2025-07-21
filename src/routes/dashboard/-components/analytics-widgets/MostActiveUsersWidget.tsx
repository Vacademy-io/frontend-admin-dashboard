import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { fetchAnalyticsMostActiveUsers } from '../../-services/dashboard-services';
import { useTheme } from '@/providers/theme/theme-provider';
import { Badge } from '@/components/ui/badge';
import {
  Trophy,
  Desktop,
  DeviceMobile,
  DeviceTablet,
  Activity,
  Database,
  Clock,
  Star,
  Crown
} from 'phosphor-react';

interface MostActiveUsersWidgetProps {
  instituteId: string;
}

export default function MostActiveUsersWidget({ instituteId }: MostActiveUsersWidgetProps) {
  const { primaryColor } = useTheme();

  const { data, isLoading, error } = useQuery({
    queryKey: ['analytics-most-active-users', instituteId],
    queryFn: () => fetchAnalyticsMostActiveUsers(instituteId, undefined, 10, 0),
    staleTime: 300000, // 5 minutes
  });

  console.log('MostActiveUsersWidget - data:', data);

  const mostActiveUsers = data?.most_active_users || [];

  const getDeviceIcon = (deviceType: string) => {
    switch (deviceType?.toLowerCase()) {
      case 'desktop': return Desktop;
      case 'mobile': return DeviceMobile;
      case 'tablet': return DeviceTablet;
      default: return Desktop;
    }
  };

  const getStatusBadge = (status: string, index: number) => {
    switch (status?.toUpperCase()) {
      case 'ONLINE':
        return <Badge className="bg-green-500 text-white text-xs">Online</Badge>;
      case 'RECENTLY_ACTIVE':
        return <Badge variant="outline" className="border-yellow-500 text-yellow-700 text-xs">Recent</Badge>;
      case 'OFFLINE':
        return <Badge variant="outline" className="border-gray-400 text-gray-600 text-xs">Offline</Badge>;
      default:
        return <Badge variant="outline" className="text-xs">Unknown</Badge>;
    }
  };

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0: return <Crown size={18} className="text-yellow-500" />;
      case 1: return <Trophy size={16} className="text-gray-400" />;
      case 2: return <Trophy size={16} className="text-amber-600" />;
      default: return <Star size={14} className="text-gray-400" />;
    }
  };

  const getInitials = (name: string) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U';
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${Math.round(minutes)}m`;
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    return `${hours}h ${mins}m`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="h-full"
    >
      <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-white to-yellow-50 h-full">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="p-2 rounded-lg bg-gradient-to-r from-yellow-500 to-orange-600 text-white"
            >
              <Trophy size={20} />
            </motion.div>
            <div>
              <CardTitle className="text-gray-800 text-lg font-bold">
                Most Active Users
              </CardTitle>
              <CardDescription className="text-gray-600 text-sm">
                Top performers by activity and engagement
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
                  className="h-20 bg-gray-200 rounded-lg"
                />
              ))}
            </div>
          ) : error ? (
            <div className="text-red-500 text-center py-8">
              <Trophy size={32} className="mx-auto mb-2 opacity-50" />
              <p className="text-sm">Failed to load active users</p>
            </div>
          ) : mostActiveUsers.length === 0 ? (
            <div className="text-gray-500 text-center py-8">
              <Trophy size={32} className="mx-auto mb-2 opacity-50" />
              <p className="text-sm">No user activity data available</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {mostActiveUsers.map((user: any, index: number) => {
                const DeviceIcon = getDeviceIcon(user.preferred_device_type);

                return (
                  <motion.div
                    key={user.user_id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    className={`relative p-4 rounded-lg border transition-all duration-200 hover:shadow-md ${
                      index === 0
                        ? 'bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-200'
                        : 'bg-white border-gray-200'
                    }`}
                  >
                    {/* Rank Badge */}
                    <div className="absolute -top-2 -left-2 w-8 h-8 bg-white rounded-full border-2 border-gray-200 flex items-center justify-center">
                      {getRankIcon(index)}
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        {/* Avatar */}
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold ${
                          index === 0 ? 'bg-gradient-to-r from-yellow-500 to-orange-600' :
                          index === 1 ? 'bg-gradient-to-r from-gray-400 to-gray-600' :
                          index === 2 ? 'bg-gradient-to-r from-amber-500 to-yellow-600' :
                          'bg-gradient-to-r from-blue-500 to-purple-600'
                        }`}>
                          {getInitials(user.full_name)}
                        </div>

                        {/* User Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-semibold text-gray-800 truncate">
                              {user.full_name}
                            </p>
                            {getStatusBadge(user.current_status, index)}
                          </div>
                          <div className="flex items-center gap-3 text-xs text-gray-500">
                            <span>@{user.username}</span>
                            <div className="flex items-center gap-1">
                              <DeviceIcon size={12} />
                              <span className="capitalize">{user.preferred_device_type}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 mt-1 text-xs text-gray-600">
                            <div className="flex items-center gap-1">
                              <Activity size={12} />
                              <span>{user.total_sessions} sessions</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Database size={12} />
                              <span>{user.total_api_calls} calls</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Activity Stats */}
                      <div className="text-right">
                        <div className="text-lg font-bold text-gray-800">
                          {formatDuration(user.total_activity_time_minutes)}
                        </div>
                        <div className="text-xs text-gray-500 flex items-center gap-1">
                          <Clock size={12} />
                          <span>Total time</span>
                        </div>
                        <div className="text-xs text-gray-600 mt-1">
                          Last: {new Date(user.last_activity).toLocaleDateString()}
                        </div>
                      </div>
                    </div>

                    {/* Frequent Services */}
                    {user.frequent_services && user.frequent_services.length > 0 && (
                      <div className="mt-3 pt-2 border-t border-gray-100">
                        <div className="flex flex-wrap gap-1">
                          {user.frequent_services.slice(0, 3).map((service: string, idx: number) => (
                            <Badge
                              key={idx}
                              variant="outline"
                              className="text-xs px-2 py-0.5"
                            >
                              {service.replace('-service', '').replace('_', ' ')}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
