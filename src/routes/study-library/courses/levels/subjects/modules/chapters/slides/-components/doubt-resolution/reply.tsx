import { Doubt } from '../../-types/get-doubts-type';
import { getTokenDecodedData } from '@/lib/auth/sessionUtility';
import { getTokenFromCookie } from '@/lib/auth/sessionUtility';
import { TokenKey } from '@/constants/auth/tokens';
import { DeleteDoubt } from './DeleteDoubt';
import { formatISODateTimeReadable } from '@/helpers/formatISOTime';
import { useGetUserBasicDetails } from '@/services/get_user_basic_details';
import { getPublicUrl } from '@/services/upload_file';
import { useEffect, useState } from 'react';
import { EnrollFormUploadImage } from '@/assets/svgs';

export const Reply = ({ reply, refetch }: { reply: Doubt; refetch: () => void }) => {
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const accessToken = getTokenFromCookie(TokenKey.accessToken);
    const tokenData = getTokenDecodedData(accessToken);
    const userId = tokenData?.user;

    const { data: userBasicDetails } = useGetUserBasicDetails([reply.user_id]);
    useEffect(() => {
        const fetchImageUrl = async () => {
            if (userBasicDetails?.[0]?.face_file_id) {
                try {
                    const url = await getPublicUrl(userBasicDetails?.[0]?.face_file_id);
                    setImageUrl(url);
                } catch (error) {
                    console.error('Failed to fetch image URL:', error);
                }
            }
        };

        fetchImageUrl();
    }, [userBasicDetails?.[0]?.face_file_id]);

    return (
        <div className="text-regular flex flex-col max-sm:text-caption">
            <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
                <div className="flex items-center gap-2">
                    <div className="size-8 rounded-full bg-neutral-300 object-contain sm:size-10">
                        {/* add image here */}
                        {imageUrl ? (
                            <img
                                src={imageUrl}
                                alt={reply.name}
                                className="size-full rounded-lg object-cover"
                            />
                        ) : (
                            <EnrollFormUploadImage className="size-10 object-contain" />
                        )}
                    </div>
                    <p className="text-subtitle font-semibold text-neutral-700">
                        {' '}
                        {userBasicDetails?.[0]?.name}
                    </p>
                </div>
                <div className="flex items-center gap-3 text-body text-neutral-500">
                    <p>{formatISODateTimeReadable(reply.raised_time)}</p>
                </div>
            </div>
            {/* <p>{reply.reply_text}</p> */}
            <div
                dangerouslySetInnerHTML={{
                    __html: reply.html_text || '',
                }}
                className="custom-html-content"
            />
            {reply.user_id == userId && <DeleteDoubt doubt={reply} refetch={refetch} />}
        </div>
    );
};
