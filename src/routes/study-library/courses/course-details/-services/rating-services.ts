import { SUBMIT_RATING_URL } from '@/constants/urls';
import authenticatedAxiosInstance from '@/lib/auth/axiosInstance';

export const handleSubmitRating = async (
    id: string,
    rating: number,
    desc: string,
    source_id: string
) => {
    const response = await authenticatedAxiosInstance({
        method: 'POST',
        url: SUBMIT_RATING_URL,
        data: {
            id,
            points: rating,
            user_id: '',
            likes: 0,
            dislikes: 0,
            source_id,
            source_type: 'PACKAGESESSIONID',
            text: desc,
            status: '',
        },
    });
    return response?.data;
};
