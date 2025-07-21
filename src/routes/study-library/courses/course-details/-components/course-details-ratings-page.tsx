import { StarRatingComponent } from '@/components/common/star-rating-component';
import { useState } from 'react';
import { MyPagination } from '@/components/design-system/pagination';
import { useQuery } from '@tanstack/react-query';
import {
    handleGetOverAllRatingDetails,
    handleGetRatingDetails,
} from '../-services/rating-services';
import { useRouter } from '@tanstack/react-router';
import { useInstituteDetailsStore } from '@/stores/students/students-list/useInstituteDetailsStore';
import { ProgressBar } from '@/components/ui/custom-progress-bar';
import { ReviewItem } from './ReviewItem';

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

export function CourseDetailsRatingsComponent({
    currentSession,
    currentLevel,
}: {
    currentSession: string;
    currentLevel: string;
}) {
    const router = useRouter();
    const courseId = router.state.location.search.courseId;
    const [page, setPage] = useState(0);

    const { getPackageSessionId } = useInstituteDetailsStore();

    const packageSessionId = getPackageSessionId({
        courseId: courseId || '',
        levelId: currentLevel || '',
        sessionId: currentSession || '',
    });

    const { data: ratingData, isError: ratingError } = useQuery({
        ...handleGetRatingDetails({
            pageNo: page,
            pageSize: 10,
            data: {
                source_id: packageSessionId || '',
                source_type: 'PACKAGE_SESSION',
            },
        }),
        enabled: !!packageSessionId, // Only run query if packageSessionId exists
    });

    const { data: overallRatingData, isError: overallRatingError } = useQuery({
        ...handleGetOverAllRatingDetails({
            source_id: packageSessionId || '',
        }),
        enabled: !!packageSessionId, // Only run query if packageSessionId exists
    });

    // Transform API data to reviews format and filter out deleted
    const reviews: Review[] = (ratingData?.content?.map(transformRatingToReview) || []).filter(
        (review) => review.status !== 'DELETED'
    );
    const totalPages = ratingData?.totalPages || 0;

    const handlePageChange = (pageNo: number) => {
        setPage(pageNo);
    };

    // Handle errors
    if (ratingError || overallRatingError) {
        return (
            <div className="flex flex-col gap-5 bg-white p-8">
                <h1 className="mb-1 text-2xl font-bold text-neutral-600">Ratings & Reviews</h1>
                <div className="text-center text-neutral-500">
                    {!packageSessionId
                        ? 'Unable to load ratings - missing course information'
                        : 'Unable to load ratings. Please try again later.'}
                </div>
            </div>
        );
    }

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
                {reviews.length === 0 ? (
                    <div className="text-center text-neutral-500">No reviews yet</div>
                ) : (
                    reviews.map((review: Review) => (
                        <ReviewItem
                            key={review.id}
                            review={review}
                            courseId={courseId || ''}
                            currentLevel={currentLevel}
                            currentSession={currentSession}
                        />
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
