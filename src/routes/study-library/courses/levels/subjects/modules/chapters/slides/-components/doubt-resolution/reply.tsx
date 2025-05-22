import { getPublicUrl } from '@/services/upload_file';
import { useEffect, useState } from 'react';
import { ReplyType } from '../../-types/doubt-list-type';

export const Reply = ({ reply }: { reply: ReplyType }) => {
    const [imageUrl, setImageUrl] = useState<string | null>(null);

    useEffect(() => {
        const fetchImageUrl = async () => {
            if (reply.face_file_id) {
                try {
                    const url = await getPublicUrl(reply.face_file_id);
                    setImageUrl(url);
                } catch (error) {
                    console.error('Failed to fetch image URL:', error);
                }
            }
        };

        fetchImageUrl();
    }, [reply.face_file_id]);

    return (
        <div className="text-regular flex flex-col gap-3 max-sm:text-caption">
            <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
                <div className="flex items-center gap-2">
                    <div className="size-8 rounded-full bg-neutral-300 sm:size-10">
                        {/* add image here */}
                        {imageUrl ? (
                            <img
                                src={imageUrl}
                                alt={reply.user_name}
                                className="size-full rounded-lg object-cover "
                            />
                        ) : (
                            <></>
                        )}
                    </div>
                    <p className="text-subtitle font-semibold text-neutral-700">
                        {reply.user_name}
                    </p>
                    {/* <StatusChip text={reply.role_type} textSize="text-caption" status="INFO" showIcon={false}/> */}
                </div>
                <div className="flex items-center gap-3">
                    <p>{reply.timestamp}</p>
                </div>
            </div>
            {/* <p>{reply.reply_text}</p> */}
            <div
                dangerouslySetInnerHTML={{
                    __html: reply.reply_text || '',
                }}
                className="custom-html-content"
            />
        </div>
    );
};
