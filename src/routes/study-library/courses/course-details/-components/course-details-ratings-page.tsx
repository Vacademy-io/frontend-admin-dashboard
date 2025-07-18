import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ThumbsUp, ThumbsDown, Trash, Check, X } from 'phosphor-react';
import { StarRatingComponent } from '@/components/common/star-rating-component';
import { useState, useEffect } from 'react';
import { MyPagination } from '@/components/design-system/pagination';
import { AxiosError } from 'axios';
import { toast } from 'sonner';
import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query';
import {
    handleGetOverAllRatingDetails,
    handleGetRatingDetails,
    handleUpdateRating,
} from '../-services/rating-services';
import { useRouter } from '@tanstack/react-router';
import { useInstituteDetailsStore } from '@/stores/students/students-list/useInstituteDetailsStore';
import { ProgressBar } from '@/components/ui/custom-progress-bar';
import { getPublicUrl } from '@/services/upload_file';
import { getTokenDecodedData, getTokenFromCookie } from '@/lib/auth/sessionUtility';
import { TokenKey } from '@/constants/auth/tokens';
import { getInstituteId } from '@/constants/helper';

// Types for API Response
interface User {
    id: string;
    username: string;
    email: string;
    full_name: string;
    profile_pic_file_id: string | null;
}

interface Rating {
    id: string;
    points: number;
    likes: number;
    dislikes: number;
    text: string;
    user: User;
    created_at: string;
    status: string;
}

interface PaginatedResponse {
    content: Rating[];
    totalPages: number;
    totalElements: number;
    number: number;
    size: number;
}

// Type for transformed review data
interface Review {
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
}

// Helper function to transform API data to Review format
const transformRatingToReview = (rating: Rating): Review => {
    return {
        id: rating.id,
        user: {
            name: rating.user.full_name || rating.user.username,
            avatarUrl: rating.user.profile_pic_file_id || '',
        },
        createdAt: rating.created_at,
        rating: rating.points,
        description: rating.text,
        likes: rating.likes,
        dislikes: rating.dislikes,
        status: rating.status,
    };
};

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

export function CourseDetailsRatingsComponent({
    currentSession,
    currentLevel,
}: {
    currentSession: string;
    currentLevel: string;
}) {
    const instituteId = getInstituteId();
    const accessToken = getTokenFromCookie(TokenKey.accessToken);
    const tokenData = getTokenDecodedData(accessToken);
    const hasRoleAdmin = instituteId
        ? tokenData?.authorities[instituteId]?.roles.includes('ADMIN')
        : false;
    const queryClient = useQueryClient();
    const router = useRouter();
    const courseId = router.state.location.search.courseId;
    const [page, setPage] = useState(0);
    const [resolvedReviews, setResolvedReviews] = useState<Review[]>([]);
    const [loadingAvatars, setLoadingAvatars] = useState(false);

    const { getPackageSessionId } = useInstituteDetailsStore();

    const { data: ratingData } = useSuspenseQuery<PaginatedResponse>(
        handleGetRatingDetails({
            pageNo: page,
            pageSize: 10,
            data: {
                source_id:
                    getPackageSessionId({
                        courseId: courseId || '',
                        levelId: currentLevel || '',
                        sessionId: currentSession || '',
                    }) || '',
                source_type: 'PACKAGE_SESSION',
            },
        })
    );

    const { data: overallRatingData } = useSuspenseQuery(
        handleGetOverAllRatingDetails({
            source_id:
                getPackageSessionId({
                    courseId: courseId || '',
                    levelId: currentLevel || '',
                    sessionId: currentSession || '',
                }) || '',
        })
    );

    // Transform API data to reviews format
    const reviews = ratingData?.content.map(transformRatingToReview) || [];
    const totalPages = ratingData?.totalPages || 0;

    useEffect(() => {
        let isMounted = true;
        async function preloadAvatars() {
            setLoadingAvatars(true);
            // Get all unique avatar IDs (filter out empty strings)
            const uniqueAvatarIds = [
                ...new Set(reviews.map((r) => r.user.avatarUrl).filter((id) => !!id)),
            ];
            // Fetch all public URLs in parallel
            const idToUrl: Record<string, string> = {};
            await Promise.all(
                uniqueAvatarIds.map(async (id) => {
                    try {
                        idToUrl[id] = await getPublicUrl(id);
                    } catch {
                        idToUrl[id] = '';
                    }
                })
            );
            // Map reviews to use the resolved URL
            if (isMounted) {
                setResolvedReviews(
                    reviews.map((review) => ({
                        ...review,
                        user: {
                            ...review.user,
                            avatarUrl: review.user.avatarUrl
                                ? idToUrl[review.user.avatarUrl] || ''
                                : '',
                        },
                    }))
                );
                setLoadingAvatars(false);
            }
        }
        preloadAvatars();
        return () => {
            isMounted = false;
        };
    }, [JSON.stringify(reviews)]);

    const handleUpdateRatingMutation = useMutation({
        mutationFn: async ({
            id,
            rating,
            source_id,
            status,
            likes,
            dislikes,
        }: {
            id: string;
            rating: number;
            source_id: string;
            status: string;
            likes: number;
            dislikes: number;
        }) => {
            return handleUpdateRating(id, rating, source_id, status, likes, dislikes);
        },
        onSuccess: (_, variables) => {
            // Optimistically update the cache instead of invalidating
            queryClient.setQueryData(
                [
                    'GET_ALL_USER_COURSE_RATINGS',
                    page,
                    10,
                    {
                        source_id:
                            getPackageSessionId({
                                courseId: courseId || '',
                                levelId: currentLevel || '',
                                sessionId: currentSession || '',
                            }) || '',
                        source_type: 'PACKAGE_SESSION',
                    },
                ],
                (oldData: PaginatedResponse | undefined) => {
                    if (!oldData) return oldData;

                    return {
                        ...oldData,
                        content: oldData.content.map((rating) => {
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
        },
        onError: (error: unknown) => {
            if (error instanceof AxiosError) {
                toast.error(error?.response?.data?.ex || 'Failed to submit rating', {
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

    const handlePageChange = (pageNo: number) => {
        setPage(pageNo);
    };

    return (
        <div className="flex flex-col gap-5 bg-white p-8">
            <h1 className="mb-1 text-2xl font-bold text-neutral-600">Ratings & Reviews</h1>
            {/* Feedback Form */}
            {overallRatingData?.average_rating !== null &&
                overallRatingData?.average_rating !== undefined && (
                    <div className="flex w-full gap-12">
                        <div className="flex flex-col gap-2 text-center">
                            <h1 className="text-3xl">
                                {overallRatingData?.average_rating !== null &&
                                overallRatingData?.average_rating !== undefined
                                    ? Number(overallRatingData.average_rating).toFixed(1)
                                    : 'N/A'}
                            </h1>
                            <StarRatingComponent
                                score={
                                    overallRatingData?.average_rating !== null &&
                                    overallRatingData?.average_rating !== undefined
                                        ? Number(overallRatingData.average_rating) * 20
                                        : 0
                                }
                                starColor={true}
                            />
                            <span>
                                {overallRatingData?.total_reviews !== null &&
                                overallRatingData?.total_reviews !== undefined
                                    ? overallRatingData.total_reviews
                                    : 0}{' '}
                                reviews
                            </span>
                        </div>
                        <div className="flex w-full flex-col gap-4">
                            <div className="flex w-1/2 items-center gap-2">
                                <span>5</span>
                                <ProgressBar value={overallRatingData?.percent_five_star ?? 0} />
                                <span>
                                    {overallRatingData?.percent_five_star !== null &&
                                    overallRatingData?.percent_five_star !== undefined
                                        ? `${overallRatingData.percent_five_star}%`
                                        : '0%'}
                                </span>
                            </div>
                            <div className="flex w-1/2 items-center gap-2">
                                <span>4</span>
                                <ProgressBar value={overallRatingData?.percent_four_star ?? 0} />
                                <span>
                                    {overallRatingData?.percent_four_star !== null &&
                                    overallRatingData?.percent_four_star !== undefined
                                        ? `${overallRatingData.percent_four_star}%`
                                        : '0%'}
                                </span>
                            </div>
                            <div className="flex w-1/2 items-center gap-2">
                                <span>3</span>
                                <ProgressBar value={overallRatingData?.percent_three_star ?? 0} />
                                <span>
                                    {overallRatingData?.percent_three_star !== null &&
                                    overallRatingData?.percent_three_star !== undefined
                                        ? `${overallRatingData.percent_three_star}%`
                                        : '0%'}
                                </span>
                            </div>
                            <div className="flex w-1/2 items-center gap-2">
                                <span>2</span>
                                <ProgressBar value={overallRatingData?.percent_two_star ?? 0} />
                                <span>
                                    {overallRatingData?.percent_two_star !== null &&
                                    overallRatingData?.percent_two_star !== undefined
                                        ? `${overallRatingData.percent_two_star}%`
                                        : '0%'}
                                </span>
                            </div>
                            <div className="flex w-1/2 items-center gap-2">
                                <span>1</span>
                                <ProgressBar value={overallRatingData?.percent_one_star ?? 0} />
                                <span>
                                    {overallRatingData?.percent_one_star !== null &&
                                    overallRatingData?.percent_one_star !== undefined
                                        ? `${overallRatingData.percent_one_star}%`
                                        : '0%'}
                                </span>
                            </div>
                        </div>
                    </div>
                )}
            {/* User Reviews List */}
            <div className={`${reviews.length === 0 ? 'mt-0' : 'mt-8'} flex flex-col gap-4`}>
                {loadingAvatars ? (
                    <div>Loading avatars...</div>
                ) : resolvedReviews.length === 0 ? (
                    <div className="text-center text-neutral-500">No reviews yet</div>
                ) : (
                    resolvedReviews.map((review) => (
                        <div
                            key={review.id}
                            className="flex flex-col bg-white p-5 md:items-start md:gap-4"
                        >
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
                                    {review.status === 'PENDING' && hasRoleAdmin ? (
                                        <>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="flex items-center gap-1 text-neutral-400 hover:text-green-600"
                                                onClick={() => {
                                                    handleUpdateRatingMutation.mutate({
                                                        id: review.id,
                                                        rating: review.rating,
                                                        source_id:
                                                            getPackageSessionId({
                                                                courseId: courseId || '',
                                                                levelId: currentLevel,
                                                                sessionId: currentSession,
                                                            }) || '',
                                                        status: 'APPROVED',
                                                        likes: review.likes,
                                                        dislikes: review.dislikes,
                                                    });
                                                }}
                                            >
                                                <Check size={18} />
                                                <span className="text-xs">Approve</span>
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="flex items-center gap-1 text-neutral-400 hover:text-red-600"
                                                onClick={() => {
                                                    handleUpdateRatingMutation.mutate({
                                                        id: review.id,
                                                        rating: review.rating,
                                                        source_id:
                                                            getPackageSessionId({
                                                                courseId: courseId || '',
                                                                levelId: currentLevel,
                                                                sessionId: currentSession,
                                                            }) || '',
                                                        status: 'DELETED',
                                                        likes: review.likes,
                                                        dislikes: review.dislikes,
                                                    });
                                                }}
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
                                                onClick={() => {
                                                    handleUpdateRatingMutation.mutate({
                                                        id: review.id,
                                                        rating: review.rating,
                                                        source_id:
                                                            getPackageSessionId({
                                                                courseId: courseId || '',
                                                                levelId: currentLevel,
                                                                sessionId: currentSession,
                                                            }) || '',
                                                        status: 'ACTIVE',
                                                        likes: review.likes + 1,
                                                        dislikes: review.dislikes,
                                                    });
                                                }}
                                            >
                                                <ThumbsUp size={18} />
                                                <span className="text-xs">{review.likes}</span>
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="flex items-center gap-1 text-neutral-500 hover:text-red-500"
                                                onClick={() => {
                                                    handleUpdateRatingMutation.mutate({
                                                        id: review.id,
                                                        rating: review.rating,
                                                        source_id:
                                                            getPackageSessionId({
                                                                courseId: courseId || '',
                                                                levelId: currentLevel,
                                                                sessionId: currentSession,
                                                            }) || '',
                                                        status: 'ACTIVE',
                                                        likes: review.likes,
                                                        dislikes: review.dislikes + 1,
                                                    });
                                                }}
                                            >
                                                <ThumbsDown size={18} />
                                                <span className="text-xs">{review.dislikes}</span>
                                            </Button>
                                            {hasRoleAdmin && (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="flex items-center gap-1 text-neutral-500 hover:text-red-600"
                                                    onClick={() => {
                                                        handleUpdateRatingMutation.mutate({
                                                            id: review.id,
                                                            rating: review.rating,
                                                            source_id:
                                                                getPackageSessionId({
                                                                    courseId: courseId || '',
                                                                    levelId: currentLevel,
                                                                    sessionId: currentSession,
                                                                }) || '',
                                                            status: 'DELETED',
                                                            likes: review.likes,
                                                            dislikes: review.dislikes,
                                                        });
                                                    }}
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
                    ))
                )}
                {totalPages > 1 && (
                    <MyPagination
                        currentPage={page}
                        totalPages={totalPages}
                        onPageChange={handlePageChange}
                    />
                )}
            </div>
        </div>
    );
}
