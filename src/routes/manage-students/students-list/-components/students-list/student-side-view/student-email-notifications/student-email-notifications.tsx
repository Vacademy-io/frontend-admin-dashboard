import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getUserEmailTracking, type EmailTrackingItem } from '@/services/email-tracking-service';
import { useStudentSidebar } from '../../../../-context/selected-student-sidebar-context';
import { formatDistanceToNow } from 'date-fns';
import { 
    CheckCircle, 
    Clock, 
    XCircle, 
    Mail, 
    Eye, 
    MousePointer,
    AlertCircle,
    RefreshCw
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

const getStatusIcon = (eventType: string) => {
    switch (eventType.toLowerCase()) {
        case 'delivery':
            return <CheckCircle className="size-4 text-green-500" />;
        case 'open':
            return <Eye className="size-4 text-blue-500" />;
        case 'click':
            return <MousePointer className="size-4 text-purple-500" />;
        case 'send':
            return <Mail className="size-4 text-blue-600" />;
        case 'pending':
            return <Clock className="size-4 text-yellow-500" />;
        case 'bounce':
        case 'reject':
            return <XCircle className="size-4 text-red-500" />;
        case 'complaint':
            return <AlertCircle className="size-4 text-orange-500" />;
        default:
            return <RefreshCw className="size-4 text-gray-500" />;
    }
};

const getStatusColor = (eventType: string) => {
    switch (eventType.toLowerCase()) {
        case 'delivery':
            return 'bg-green-100 text-green-800 border-green-200';
        case 'open':
            return 'bg-blue-100 text-blue-800 border-blue-200';
        case 'click':
            return 'bg-purple-100 text-purple-800 border-purple-200';
        case 'send':
            return 'bg-blue-100 text-blue-800 border-blue-200';
        case 'pending':
            return 'bg-yellow-100 text-yellow-800 border-yellow-200';
        case 'bounce':
        case 'reject':
            return 'bg-red-100 text-red-800 border-red-200';
        case 'complaint':
            return 'bg-orange-100 text-orange-800 border-orange-200';
        default:
            return 'bg-gray-100 text-gray-800 border-gray-200';
    }
};

const formatEventType = (eventType: string) => {
    return eventType.charAt(0).toUpperCase() + eventType.slice(1).toLowerCase();
};

export const StudentEmailNotifications = () => {
    const { selectedStudent } = useStudentSidebar();
    const [page, setPage] = useState(0);
    const pageSize = 10;

    const {
        data: emailData,
        isLoading,
        error,
        refetch
    } = useQuery({
        queryKey: ['user-email-tracking', selectedStudent?.user_id, page],
        queryFn: () => getUserEmailTracking(selectedStudent?.user_id || '', page, pageSize),
        enabled: !!selectedStudent?.user_id,
        staleTime: 30000, // 30 seconds
    });

    if (!selectedStudent?.user_id) {
        return (
            <div className="flex flex-col items-center justify-center py-12">
                <div className="rounded-full bg-neutral-100 p-4 mb-3">
                    <Mail className="size-8 text-neutral-400" />
                </div>
                <p className="text-sm font-medium text-neutral-600">No student selected</p>
                <p className="text-xs text-neutral-500 mt-1">Select a student to view their notifications</p>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="space-y-4">
                <div className="flex items-center justify-between mb-6">
                    <Skeleton className="h-6 w-40" />
                    <Skeleton className="h-6 w-16" />
                </div>
                {[...Array(3)].map((_, i) => (
                    <div key={i} className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
                        <div className="space-y-3">
                            <div className="flex items-center gap-3">
                                <Skeleton className="h-4 w-4 rounded-full" />
                                <Skeleton className="h-4 w-3/4" />
                            </div>
                            <div className="flex items-center gap-2">
                                <Skeleton className="h-5 w-16 rounded-full" />
                                <Skeleton className="h-3 w-20" />
                            </div>
                            <div className="space-y-1">
                                <Skeleton className="h-3 w-1/2" />
                                <Skeleton className="h-3 w-2/3" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center py-12">
                <div className="rounded-full bg-red-100 p-4 mb-4">
                    <AlertCircle className="size-8 text-red-500" />
                </div>
                <p className="text-sm font-medium text-red-600 mb-2">Failed to load notifications</p>
                <p className="text-xs text-red-500 mb-4 text-center">There was an error loading the email notifications</p>
                <button
                    onClick={() => refetch()}
                    className="px-4 py-2 text-xs font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors duration-200"
                >
                    Try Again
                </button>
            </div>
        );
    }

    const notifications = emailData?.content || [];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="h-1 w-8 rounded-full bg-gradient-to-r from-blue-500 to-blue-400"></div>
                    <h3 className="text-lg font-semibold text-neutral-800">Recent Notifications</h3>
                </div>
                <Badge variant="outline" className="text-xs font-medium bg-blue-50 text-blue-700 border-blue-200">
                    {emailData?.totalElements || 0} total
                </Badge>
            </div>

            {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12">
                    <div className="rounded-full bg-neutral-100 p-6 mb-4">
                        <Mail className="size-12 text-neutral-400" />
                    </div>
                    <p className="text-sm font-medium text-neutral-600 mb-1">No notifications found</p>
                    <p className="text-xs text-neutral-500 text-center">This student hasn't received any email notifications yet</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {notifications.map((notification: EmailTrackingItem) => (
                        <div key={notification.emailId} className="group rounded-xl border border-neutral-200 bg-white p-4 shadow-sm transition-all duration-200 hover:shadow-md hover:border-neutral-300">
                            <div className="space-y-3">
                                <div className="flex items-start gap-3">
                                    <div className="flex-shrink-0 mt-0.5">
                                        {getStatusIcon(notification.latestStatus.eventType)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-semibold text-sm text-neutral-900 truncate mb-1">
                                            {notification.emailSubject}
                                        </h4>
                                        <div className="flex items-center gap-2 mb-2">
                                            <Badge 
                                                variant="outline" 
                                                className={`text-xs font-medium ${getStatusColor(notification.latestStatus.eventType)}`}
                                            >
                                                {formatEventType(notification.latestStatus.eventType)}
                                            </Badge>
                                            <span className="text-xs text-neutral-500 font-medium">
                                                {formatDistanceToNow(new Date(notification.sentAt), { addSuffix: true })}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="pl-7 space-y-1">
                                    <div className="flex items-center gap-2 text-xs text-neutral-600">
                                        <span className="font-medium">To:</span>
                                        <span className="truncate">{notification.recipientEmail}</span>
                                    </div>
                                    <div className="text-xs text-neutral-500 leading-relaxed">
                                        <span className="font-medium">Details:</span> {notification.latestStatus.eventDetails}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {emailData && emailData.totalPages > 1 && (
                <div className="flex items-center justify-center gap-3 pt-6 border-t border-neutral-200">
                    <button
                        onClick={() => setPage(Math.max(0, page - 1))}
                        disabled={page === 0}
                        className="px-4 py-2 text-xs font-medium bg-white text-neutral-700 border border-neutral-300 rounded-lg hover:bg-neutral-50 hover:border-neutral-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                    >
                        Previous
                    </button>
                    <div className="flex items-center gap-2 px-3 py-2 bg-neutral-50 rounded-lg">
                        <span className="text-xs font-medium text-neutral-600">
                            Page {page + 1} of {emailData.totalPages}
                        </span>
                    </div>
                    <button
                        onClick={() => setPage(Math.min(emailData.totalPages - 1, page + 1))}
                        disabled={page >= emailData.totalPages - 1}
                        className="px-4 py-2 text-xs font-medium bg-white text-neutral-700 border border-neutral-300 rounded-lg hover:bg-neutral-50 hover:border-neutral-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    );
};




