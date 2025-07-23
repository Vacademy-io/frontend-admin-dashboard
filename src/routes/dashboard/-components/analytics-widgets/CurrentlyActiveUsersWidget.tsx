import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { fetchAnalyticsCurrentlyActiveUsers } from '../../-services/dashboard-services';
import { useTheme } from '@/providers/theme/theme-provider';
import { Badge } from '@/components/ui/badge';
import {
  Users,
  Desktop,
  DeviceMobile,
  DeviceTablet,
  Clock,
  Database,
  Gear,
  PlayCircle,
  ChartBar
} from 'phosphor-react';

interface CurrentlyActiveUsersWidgetProps {
  instituteId: string;
}

export default function CurrentlyActiveUsersWidget({ instituteId }: CurrentlyActiveUsersWidgetProps) {
  const { primaryColor } = useTheme();

  const { data, isLoading, error } = useQuery({
    queryKey: ['analytics-currently-active-users', instituteId],
    queryFn: () => fetchAnalyticsCurrentlyActiveUsers(instituteId),
    staleTime: 30000, // 30 seconds
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  console.log('CurrentlyActiveUsersWidget - data:', data);

  const activeUsers = data?.activeUsersList || data?.active_users_list || data?.currently_active_users_list || [];

  console.log('CurrentlyActiveUsersWidget - activeUsers:', activeUsers);
  console.log('CurrentlyActiveUsersWidget - activeUsers length:', activeUsers.length);

  const getDeviceIcon = (deviceType: string) => {
    switch (deviceType?.toLowerCase()) {
      case 'desktop': return Desktop;
      case 'mobile': return DeviceMobile;
      case 'tablet': return DeviceTablet;
      default: return Desktop;
    }
  };

  const getServiceIcon = (serviceName: string) => {
    const name = serviceName?.toLowerCase() || '';
    if (name.includes('assessment')) return ChartBar;
    if (name.includes('admin') || name.includes('core')) return Gear;
    if (name.includes('media')) return PlayCircle;
    if (name.includes('community')) return Users;
    return Database;
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${Math.round(minutes)}m`;
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    return `${hours}h ${mins}m`;
  };

  const getInitials = (name: string) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="h-full"
    >
      <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-white to-green-50 h-full">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="p-2 rounded-lg bg-gradient-to-r from-green-500 to-emerald-600 text-white"
              >
                <Users size={20} />
              </motion.div>
              <div>
                <CardTitle className="text-gray-800 text-lg font-bold">
                  Currently Active Users
                </CardTitle>
                <CardDescription className="text-gray-600 text-sm">
                  Real-time user sessions and activity
                </CardDescription>
              </div>
            </div>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 }}
              className="text-right"
            >
              <div className="text-2xl font-bold text-green-600">
                {data?.total_active_users || activeUsers.length}
              </div>
              <div className="text-xs text-gray-500">Online Now</div>
            </motion.div>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <motion.div
                  key={i}
                  animate={{ opacity: [0.3, 0.7, 0.3] }}
                  transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.1 }}
                  className="h-16 bg-gray-200 rounded-lg"
                />
              ))}
            </div>
          ) : error ? (
            <div className="text-red-500 text-center py-8">
              <Users size={32} className="mx-auto mb-2 opacity-50" />
              <p className="text-sm">Failed to load active users</p>
            </div>
          ) : activeUsers.length === 0 ? (
            <div className="text-gray-500 text-center py-8">
              <Users size={32} className="mx-auto mb-2 opacity-50" />
              <p className="text-sm">No active users at the moment</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {activeUsers.slice(0, 10).map((user: any, index: number) => {
                const DeviceIcon = getDeviceIcon(user.device_type);
                const ServiceIcon = getServiceIcon(user.current_service);

                return (
                  <motion.div
                    key={user.user_id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 rounded-lg bg-white border hover:shadow-md transition-all duration-200 space-y-2 sm:space-y-0"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      {/* Avatar */}
                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                        {getInitials(user.full_name)}
                      </div>

                      {/* User Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-gray-800 truncate">
                            {user.full_name}
                          </p>
                          <Badge variant="outline" className="text-xs px-2 py-0.5">
                            @{user.username}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-3 mt-1">
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <DeviceIcon size={12} />
                            <span className="capitalize">{user.device_type}</span>
                          </div>
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <ServiceIcon size={12} />
                            <span className="truncate max-w-20">
                              {user.current_service?.replace('_service', '').replace('-service', '')}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Session Duration */}
                    <div className="text-left sm:text-right">
                      <div className="flex items-center gap-1 text-sm font-medium text-gray-700">
                        <Clock size={14} />
                        <span>{formatDuration(user.session_duration_minutes)}</span>
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(user.login_time).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </div>
                  </motion.div>
                );
              })}

              {activeUsers.length > 10 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1 }}
                  className="text-center py-2 text-sm text-gray-500"
                >
                  +{activeUsers.length - 10} more users online
                </motion.div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
