import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { motion, useSpring, useTransform } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { fetchAnalyticsActiveUsersRealtime } from '../../-services/dashboard-services';
import { useEffect, useState } from 'react';
import { useTheme } from '@/providers/theme/theme-provider';
import { getInstituteId } from '@/constants/helper';
import { Eye, ArrowUp } from 'phosphor-react';
import { AnalyticsErrorDisplay } from './AnalyticsErrorDisplay';

// Animated number counter component
const AnimatedNumber = ({ value }: { value: number }) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const duration = 1000; // 1 second animation
    const startTime = Date.now();
    const startValue = displayValue;

    const animate = () => {
      const now = Date.now();
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const currentValue = Math.round(startValue + (value - startValue) * easeOutQuart);

      setDisplayValue(currentValue);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [value, displayValue]);

  return <span>{displayValue}</span>;
};

interface RealTimeActiveUsersWidgetProps {
  instituteId: string;
}

export default function RealTimeActiveUsersWidget({ instituteId }: RealTimeActiveUsersWidgetProps) {
  const { primaryColor } = useTheme();

  const { data: activeUsersCount, isLoading, error, refetch } = useQuery({
    queryKey: ['analytics-realtime-users', instituteId],
    queryFn: () => fetchAnalyticsActiveUsersRealtime(instituteId),
    refetchInterval: 10000, // Refetch every 10 seconds for real-time feel
    staleTime: 5000,
  });

  console.log('RealTimeActiveUsersWidget - data:', activeUsersCount);
  console.log('RealTimeActiveUsersWidget - extracted count:', activeUsersCount?.totalActiveUsers || activeUsersCount || 0);
  console.log('RealTimeActiveUsersWidget - isLoading:', isLoading);
  console.log('RealTimeActiveUsersWidget - error:', error);

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="h-full"
      >
        <Card className="h-full">
          <AnalyticsErrorDisplay
            error={error}
            widgetName="real-time active users"
            onRetry={() => refetch()}
            fallbackIcon={Eye}
          />
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      whileHover={{ scale: 1.02 }}
      className="h-full"
    >
      <Card className="relative overflow-hidden border-2 border-primary-200 bg-gradient-to-br from-primary-50 to-primary-100 shadow-lg hover:shadow-xl transition-all duration-300 h-full">
        {/* Animated background pulse */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-primary-500/10 to-primary-600/10"
          animate={{
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />

        <CardHeader className="relative z-10 pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                className="p-2 rounded-full bg-primary-500/20"
              >
                <Eye size={20} className="text-primary-600" />
              </motion.div>
              <CardTitle className="text-primary-700 text-lg font-bold">
                Real-Time Active
              </CardTitle>
            </div>
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-3 h-3 bg-green-500 rounded-full shadow-lg"
            />
          </div>
          <CardDescription className="text-primary-600/80 text-sm">
            Users currently online
          </CardDescription>
        </CardHeader>

        <CardContent className="relative z-10 pt-0">
          <div className="flex items-center justify-between">
            <div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-4xl font-bold text-primary-700 mb-1"
              >
                {isLoading ? (
                  <motion.div
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="text-primary-500"
                  >
                    --
                  </motion.div>
                ) : (
                  <AnimatedNumber value={activeUsersCount?.totalActiveUsers || activeUsersCount || 0} />
                )}
              </motion.div>
              <div className="text-xs text-primary-600/70 flex items-center gap-1">
                <ArrowUp size={12} />
                <span>Live updates</span>
              </div>
            </div>

            {/* Animated pulse indicator */}
            <motion.div
              className="relative"
              animate={{
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            >
              <div className="w-16 h-16 rounded-full bg-primary-500/20 flex items-center justify-center">
                <div className="w-8 h-8 rounded-full bg-primary-500/40 flex items-center justify-center">
                  <div className="w-4 h-4 rounded-full bg-primary-500" />
                </div>
              </div>
            </motion.div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
