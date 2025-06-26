import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ThumbsUp, ThumbsDown, Trash, Star } from 'phosphor-react';
import { StarRatingComponent } from '@/components/common/star-rating-component';
import { Progress } from '@/components/ui/progress';
import { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { MyButton } from '@/components/design-system/button';
import { MyPagination } from '@/components/design-system/pagination';
import { AxiosError } from 'axios';
import { toast } from 'sonner';
import { useMutation } from '@tanstack/react-query';
import { handleSubmitRating } from '../-services/rating-services';

// Mock data for demonstration
const mockReviews = [
    {
        id: '1',
        user: {
            name: 'Alice Johnson',
            avatarUrl: '',
        },
        createdAt: '2024-06-01T10:30:00Z',
        rating: 5,
        description: 'Great course! Learned a lot and the instructor was amazing.',
        likes: 12,
        dislikes: 1,
    },
    {
        id: '2',
        user: {
            name: 'Bob Smith',
            avatarUrl: '',
        },
        createdAt: '2024-05-28T14:15:00Z',
        rating: 4,
        description: 'Good content, but could use more real-world examples.',
        likes: 7,
        dislikes: 0,
    },
    {
        id: '3',
        user: {
            name: 'Carol Lee',
            avatarUrl: '',
        },
        createdAt: '2024-05-20T09:00:00Z',
        rating: 3,
        description: 'Average experience. Some topics were rushed.',
        likes: 2,
        dislikes: 3,
    },
];

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

export function CourseDetailsRatingsComponent() {
    // Feedback form state
    const [feedbackText, setFeedbackText] = useState('');
    const [selectedRating, setSelectedRating] = useState<number | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [page, setPage] = useState(0);

    const handleStarClick = (rating: number) => {
        setSelectedRating(rating);
    };

    const handleSubmitRatingMutation = useMutation({
        mutationFn: async ({
            id,
            rating,
            desc,
            source_id,
        }: {
            id: string;
            rating: string;
            desc: string;
            source_id: string;
        }) => {
            return handleSubmitRating(id, rating, desc, source_id);
        },
        onSuccess: (data) => {
            console.log(data);
        },
        onError: (error: unknown) => {
            if (error instanceof AxiosError) {
                toast.error(error?.response?.data?.ex, {
                    className: 'error-toast',
                    duration: 2000,
                });
            } else {
                console.error('Unexpected error:', error);
            }
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedRating || !feedbackText.trim()) return;
        setSubmitting(true);
        // Simulate submit
        setTimeout(() => {
            setSubmitting(false);
            setFeedbackText('');
            setSelectedRating(null);
            // Optionally show a toast or update reviews
        }, 1000);
    };

    const handlePageChange = (pageNo: number) => {
        setPage(pageNo);
    };

    return (
        <div className="flex flex-col gap-5">
            <h1 className="text-2xl font-bold text-neutral-600">Ratings & Reviews</h1>
            {/* Feedback Form */}
            <form
                onSubmit={handleSubmit}
                className="mb-8 flex flex-col gap-4 rounded-xl border bg-gray-50 p-5"
            >
                <label className="font-semibold text-neutral-700">Your Feedback</label>
                <Textarea
                    value={feedbackText}
                    onChange={(e) => setFeedbackText(e.target.value)}
                    placeholder="Write your feedback..."
                    rows={3}
                    className="resize-none"
                />
                <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <button
                            type="button"
                            key={star}
                            onClick={() => handleStarClick(star)}
                            className="focus:outline-none"
                        >
                            <Star
                                size={28}
                                weight={
                                    selectedRating && selectedRating >= star ? 'fill' : 'regular'
                                }
                                className={
                                    selectedRating && selectedRating >= star
                                        ? 'text-yellow-400'
                                        : 'text-gray-300'
                                }
                            />
                        </button>
                    ))}
                    <span className="ml-2 text-sm text-neutral-500">
                        {selectedRating
                            ? `${selectedRating} Star${selectedRating > 1 ? 's' : ''}`
                            : ''}
                    </span>
                </div>
                <MyButton
                    type="submit"
                    disable={submitting || !selectedRating || !feedbackText.trim()}
                    className="w-fit"
                >
                    {submitting ? 'Submitting...' : 'Submit Feedback'}
                </MyButton>
            </form>
            <div className="flex w-full gap-12">
                <div className="flex flex-col gap-2 text-center">
                    <h1 className="text-3xl">4.5</h1>
                    <StarRatingComponent score={40} starColor={true} />
                    <span>120 reviews</span>
                </div>
                <div className="flex w-full flex-col gap-4">
                    <div className="flex items-center gap-2">
                        <span>5</span>
                        <Progress value={100} />
                        <span>100%</span>
                    </div>
                    <div className="flex w-1/2 items-center gap-2">
                        <span>4</span>
                        <Progress value={100} />
                        <span>40%</span>
                    </div>
                    <div className="flex w-1/2 items-center gap-2">
                        <span>3</span>
                        <Progress value={100} />
                        <span>40%</span>
                    </div>
                    <div className="flex w-1/2 items-center gap-2">
                        <span>2</span>
                        <Progress value={100} />
                        <span>40%</span>
                    </div>
                    <div className="flex w-1/2 items-center gap-2">
                        <span>1</span>
                        <Progress value={100} />
                        <span>40%</span>
                    </div>
                </div>
            </div>
            {/* User Reviews List */}
            <div className="mt-8 flex flex-col gap-4">
                {mockReviews.map((review) => (
                    <div
                        key={review.id}
                        className="flex flex-col rounded-lg border  bg-white p-5 md:items-start md:gap-4"
                    >
                        {/* Avatar */}
                        <div className="flex shrink-0 items-center justify-center gap-2">
                            <Avatar>
                                {review.user.avatarUrl ? (
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
                        <div className="flex flex-col">
                            <div className="mt-1 flex items-center gap-2">
                                <StarRatingComponent score={review.rating * 20} starColor={true} />
                                <span className="text-xs text-neutral-500">{review.rating}.0</span>
                            </div>
                            <div className="mt-2 text-neutral-700">{review.description}</div>
                            <div className="mt-3 flex items-center justify-start gap-4">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="flex items-center gap-1 text-neutral-500 hover:text-blue-600"
                                >
                                    <ThumbsUp size={18} />
                                    <span className="text-xs">{review.likes}</span>
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="flex items-center gap-1 text-neutral-500 hover:text-red-500"
                                >
                                    <ThumbsDown size={18} />
                                    <span className="text-xs">{review.dislikes}</span>
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="flex items-center gap-1 text-neutral-400 hover:text-red-600"
                                >
                                    <Trash size={18} />
                                    <span className="text-xs">Delete</span>
                                </Button>
                            </div>
                        </div>
                    </div>
                ))}
                <MyPagination currentPage={page} totalPages={10} onPageChange={handlePageChange} />
            </div>
        </div>
    );
}
