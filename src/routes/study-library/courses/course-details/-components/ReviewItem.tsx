import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ThumbsUp, ThumbsDown, Trash, Check, X } from 'phosphor-react';
import { StarRatingComponent } from '@/components/common/star-rating-component';
import { useState } from 'react';
import { AxiosError } from 'axios';
import { toast } from 'sonner';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { handleUpdateRating } from '../-services/rating-services';
import { useInstituteDetailsStore } from '@/stores/students/students-list/useInstituteDetailsStore';
import { getTokenDecodedData, getTokenFromCookie } from '@/lib/auth/sessionUtility';
import { TokenKey } from '@/constants/auth/tokens';
import { getInstituteId } from '@/constants/helper';

interface ReviewItemProps {
    review: {
        id: string;
        user: {
            name: string;
            avatarUrl: string;
        };
        createdAt: string;
        rating: number;
        description: string;
        likes: number;
        dislikes: number;
        status: string;
    };
    courseId: string;
    currentLevel: string;
    currentSession: string;
    onReviewUpdate: (reviewId: string, updates: { likes: number; dislikes: number; status: string }) => void;
}

function timeAgo(dateString: string) {
    const now = new Date();
    const date = new Date(dateString);
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
    return date.toLocaleDateString();
}

export function ReviewItem({ review, courseId, currentLevel, currentSession, onReviewUpdate }: ReviewItemProps) {
    const [localLikes, setLocalLikes] = useState(review.likes);
    const [localDislikes, setLocalDislikes] = useState(review.dislikes);
    const [localStatus, setLocalStatus] = useState(review.status);
    const [isUpdating, setIsUpdating] = useState(false);

    const instituteId = getInstituteId();
    const accessToken = getTokenFromCookie(TokenKey.accessToken);
    const tokenData = getTokenDecodedData(accessToken);
    const hasRoleAdmin = instituteId
        ? tokenData?.authorities[instituteId]?.roles.includes('ADMIN')
        : false;

    const queryClient = useQueryClient();
    const { getPackageSessionId } = useInstituteDetailsStore();

    const handleUpdateRatingMutation = useMutation({
        mutationFn: async ({
            id,
            rating,
            source_id,
            status,
            likes,
            dislikes,
            text,
        }: {
            id: string;
            rating: number;
            source_id: string;
            status: string;
            likes: number;
            dislikes: number;
            text: string;
        }) => {
            return handleUpdateRating(id, rating, source_id, status, likes, dislikes, text);
        },
        onSuccess: (_, variables) => {
            // Update local state immediately
            setLocalLikes(variables.likes);
            setLocalDislikes(variables.dislikes);
            setLocalStatus(variables.status);

            // Notify parent component
            onReviewUpdate(review.id, {
                likes: variables.likes,
                dislikes: variables.dislikes,
                status: variables.status,
            });

            // Optimistically update the cache
            queryClient.setQueryData(
                [
                    'GET_ALL_USER_COURSE_RATINGS',
                    0, // Assuming we're on first page, adjust as needed
                    10,
                    {
                        source_id: getPackageSessionId({
                            courseId: courseId || '',
                            levelId: currentLevel || '',
                            sessionId: currentSession || '',
                        }) || '',
                        source_type: 'PACKAGE_SESSION',
                    },
                ],
                (oldData: any) => {
                    if (!oldData) return oldData;

                    return {
                        ...oldData,
                        content: oldData.content.map((rating: any) => {
                            if (rating.id === variables.id) {
                                return {
                                    ...rating,
                                    likes: variables.likes,
                                    dislikes: variables.dislikes,
                                    status: variables.status,
                                };
                            }
                            return rating;
                        }),
                    };
                }
            );

            // Also update overall rating cache
            queryClient.invalidateQueries({
                queryKey: ['GET_ALL_USER_COURSE_RATINGS_OVERALL'],
            });

            setIsUpdating(false);
        },
        onError: (error: unknown) => {
            // Revert local state on error
            setLocalLikes(review.likes);
            setLocalDislikes(review.dislikes);
            setLocalStatus(review.status);
            setIsUpdating(false);

            if (error instanceof AxiosError) {
                toast.error(error?.response?.data?.ex || 'Failed to update rating', {
                    className: 'error-toast',
                    duration: 2000,
                });
            } else {
                toast.error('An unexpected error occurred', {
                    className: 'error-toast',
                    duration: 2000,
                });
                console.error('Unexpected error:', error);
            }
        },
    });

    const handleAction = (action: 'like' | 'dislike' | 'approve' | 'decline' | 'delete') => {
        if (isUpdating) return;

        setIsUpdating(true);
        const packageSessionId = getPackageSessionId({
            courseId: courseId || '',
            levelId: currentLevel || '',
            sessionId: currentSession || '',
        });

        let newLikes = localLikes;
        let newDislikes = localDislikes;
        let newStatus = localStatus;

        switch (action) {
            case 'like':
                newLikes = localLikes + 1;
                break;
            case 'dislike':
                newDislikes = localDislikes + 1;
                break;
            case 'approve':
                newStatus = 'ACTIVE';
                break;
            case 'decline':
                newStatus = 'DELETED';
                break;
            case 'delete':
                newStatus = 'DELETED';
                break;
        }

        handleUpdateRatingMutation.mutate({
            id: review.id,
            rating: review.rating,
            source_id: packageSessionId || '',
            status: newStatus,
            likes: newLikes,
            dislikes: newDislikes,
            text: review.description, // Ensure text is sent to backend
        });
    };

    return (
        <div className="flex flex-col bg-white p-5 md:items-start md:gap-4">
            {/* Avatar and User Info */}
            <div className="flex w-full items-center justify-between">
                <div className="flex shrink-0 items-center justify-center gap-2">
                    <Avatar>
                        {review.user.avatarUrl !== '' ? (
                            <AvatarImage
                                src={review.user.avatarUrl}
                                alt={review.user.name}
                            />
                        ) : (
                            <AvatarFallback>
                                {review.user.name
                                    .split(' ')
                                    .map((n) => n[0])
                                    .join('')
                                    .slice(0, 2)
                                    .toUpperCase()}
                            </AvatarFallback>
                        )}
                    </Avatar>
                    <div className="flex flex-col">
                        <span className="font-semibold text-neutral-800">
                            {review.user.name}
                        </span>
                        <span className="mt-0.5 text-xs text-neutral-400">
                            {timeAgo(review.createdAt)}
                        </span>
                    </div>
                </div>
            </div>
            <div className="flex flex-col">
                <div className="mt-1 flex items-center gap-2">
                    <StarRatingComponent
                        score={review.rating * 20}
                        starColor={true}
                    />
                </div>
                <div className="mt-2 text-neutral-700">{review.description}</div>
                <div className="mt-3 flex items-center justify-start gap-4">
                    {localStatus === 'PENDING' && hasRoleAdmin ? (
                        <>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="flex items-center gap-1 text-neutral-400 hover:text-green-600"
                                onClick={() => handleAction('approve')}
                                disabled={isUpdating}
                            >
                                <Check size={18} />
                                <span className="text-xs">Approve</span>
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="flex items-center gap-1 text-neutral-400 hover:text-red-600"
                                onClick={() => handleAction('decline')}
                                disabled={isUpdating}
                            >
                                <X size={18} />
                                <span className="text-xs">Decline</span>
                            </Button>
                        </>
                    ) : (
                        <>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="flex items-center gap-1 text-neutral-500 hover:text-blue-600"
                                onClick={() => handleAction('like')}
                                disabled={isUpdating}
                            >
                                <ThumbsUp size={18} />
                                <span className="text-xs">{localLikes}</span>
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="flex items-center gap-1 text-neutral-500 hover:text-red-500"
                                onClick={() => handleAction('dislike')}
                                disabled={isUpdating}
                            >
                                <ThumbsDown size={18} />
                                <span className="text-xs">{localDislikes}</span>
                            </Button>
                            {hasRoleAdmin && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="flex items-center gap-1 text-neutral-500 hover:text-red-600"
                                    onClick={() => handleAction('delete')}
                                    disabled={isUpdating}
                                >
                                    <Trash size={18} />
                                    <span className="text-xs">Delete</span>
                                </Button>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
