import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { fetchAnalyticsEngagementTrends } from '../../-services/dashboard-services';
import { useTheme } from '@/providers/theme/theme-provider';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Desktop, DeviceMobile, DeviceTablet } from 'phosphor-react';

interface DeviceUsageWidgetProps {
    instituteId: string;
}

export default function DeviceUsageWidget({ instituteId }: DeviceUsageWidgetProps) {
    const { primaryColor } = useTheme();

    const { data, isLoading, error } = useQuery({
        queryKey: ['analytics-device-usage', instituteId],
        queryFn: () => fetchAnalyticsEngagementTrends(instituteId),
        staleTime: 300000, // 5 minutes
    });

    // Debug logging
    console.log('DeviceUsageWidget - data:', data);
    console.log('DeviceUsageWidget - isLoading:', isLoading);
    console.log('DeviceUsageWidget - error:', error);

    // Process device usage data - handle API errors gracefully
    const deviceData =
        data?.device_usage_stats?.map((device: any) => ({
            name: device.device_type,
            value: device.usage_count,
            users: device.unique_users,
            percentage: 0, // Will be calculated
        })) || [];

    console.log('DeviceUsageWidget - processedData:', deviceData);

    // Calculate percentages
    const total = deviceData.reduce((sum: number, item: any) => sum + item.value, 0);
    deviceData.forEach((item: any) => {
        item.percentage = total > 0 ? Math.round((item.value / total) * 100) : 0;
    });

    // Colors for different device types
    const COLORS = {
        desktop: '#3B82F6', // Blue
        mobile: '#10B981', // Green
        tablet: '#F59E0B', // Amber
    };

    const getDeviceIcon = (deviceType: string) => {
        switch (deviceType.toLowerCase()) {
            case 'desktop':
                return Desktop;
            case 'mobile':
                return DeviceMobile;
            case 'tablet':
                return DeviceTablet;
            default:
                return Desktop;
        }
    };

    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            return (
                <div className="rounded-lg border bg-white p-3 shadow-lg">
                    <p className="font-semibold capitalize text-gray-800">{data.name}</p>
                    <p className="text-sm text-gray-600">Usage: {data.value.toLocaleString()}</p>
                    <p className="text-sm text-gray-600">Users: {data.users.toLocaleString()}</p>
                    <p className="text-primary-600 text-sm font-medium">
                        {data.percentage}% of total
                    </p>
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
            <Card className="h-full border-0 bg-gradient-to-br from-white to-gray-50 shadow-lg transition-all duration-300 hover:shadow-xl">
                <CardHeader className="pb-2">
                    <div className="flex items-center gap-2">
                        <motion.div
                            animate={{ rotate: [0, 5, -5, 0] }}
                            transition={{ duration: 3, repeat: Infinity }}
                            className="rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 p-2 text-white"
                        >
                            <DeviceTablet size={20} />
                        </motion.div>
                        <div>
                            <CardTitle className="text-lg font-bold text-gray-800">
                                Device Usage
                            </CardTitle>
                            <CardDescription className="text-sm text-gray-600">
                                Platform distribution across users
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="pt-0">
                    {isLoading ? (
                        <div className="flex h-48 items-center justify-center">
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                                className="border-3 size-8 rounded-full border-primary-500 border-t-transparent"
                            />
                        </div>
                    ) : error ? (
                        <div className="py-8 text-center text-red-500">
                            <DeviceTablet size={32} className="mx-auto mb-2 opacity-50" />
                            <p className="text-sm">Failed to load device data</p>
                        </div>
                    ) : deviceData.length === 0 ? (
                        <div className="py-8 text-center text-gray-500">
                            <DeviceTablet size={32} className="mx-auto mb-2 opacity-50" />
                            <p className="text-sm">No device data available</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {/* Donut Chart */}
                            <div className="h-40">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={deviceData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={30}
                                            outerRadius={60}
                                            paddingAngle={3}
                                            dataKey="value"
                                            animationBegin={0}
                                            animationDuration={1000}
                                        >
                                            {deviceData.map((entry: any, index: number) => (
                                                <Cell
                                                    key={`cell-${index}`}
                                                    fill={
                                                        COLORS[entry.name as keyof typeof COLORS] ||
                                                        '#8884D8'
                                                    }
                                                />
                                            ))}
                                        </Pie>
                                        <Tooltip content={<CustomTooltip />} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>

                            {/* Device Stats */}
                            <div className="space-y-2">
                                {deviceData.map((device: any, index: number) => {
                                    const DeviceIcon = getDeviceIcon(device.name);
                                    const color =
                                        COLORS[device.name as keyof typeof COLORS] || '#8884D8';

                                    return (
                                        <motion.div
                                            key={device.name}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ duration: 0.4, delay: index * 0.1 }}
                                            className="flex items-center justify-between rounded-lg p-2 transition-colors hover:bg-gray-50"
                                        >
                                            <div className="flex items-center gap-2">
                                                <div
                                                    className="size-3 rounded-full"
                                                    style={{ backgroundColor: color }}
                                                />
                                                <DeviceIcon size={16} style={{ color }} />
                                                <span className="text-sm font-medium capitalize text-gray-700">
                                                    {device.name}
                                                </span>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-sm font-bold text-gray-800">
                                                    {device.percentage}%
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    {device.users} users
                                                </div>
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
