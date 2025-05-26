import { Doubt } from '../../-types/get-doubts-type';
import { getTokenDecodedData } from '@/lib/auth/sessionUtility';
import { getTokenFromCookie } from '@/lib/auth/sessionUtility';
import { TokenKey } from '@/constants/auth/tokens';
import { DeleteDoubt } from './DeleteDoubt';

export const Reply = ({ reply, refetch }: { reply: Doubt; refetch: () => void }) => {
    // const [imageUrl, setImageUrl] = useState<string | null>(null);
    const imageUrl: string | null = null;
    const accessToken = getTokenFromCookie(TokenKey.accessToken);
    const tokenData = getTokenDecodedData(accessToken);
    const userId = tokenData?.user;

    return (
        <div className="text-regular flex flex-col gap-3 max-sm:text-caption">
            <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
                <div className="flex items-center gap-2">
                    <div className="size-8 rounded-full bg-neutral-300 sm:size-10">
                        {/* add image here */}
                        {imageUrl ? (
                            <img
                                src={imageUrl}
                                alt={reply.name}
                                className="size-full rounded-lg object-cover "
                            />
                        ) : (
                            <></>
                        )}
                    </div>
                    <p className="text-subtitle font-semibold text-neutral-700">{reply.name}</p>
                    {/* <StatusChip text={reply.role_type} textSize="text-caption" status="INFO" showIcon={false}/> */}
                </div>
                <div className="flex items-center gap-3 text-body text-neutral-500">
                    <p>{reply.raised_time}</p>
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
