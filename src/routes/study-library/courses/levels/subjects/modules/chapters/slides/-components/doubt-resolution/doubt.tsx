import { DoubtType } from '../../-types/doubt-list-type';
import { useEffect, Dispatch, SetStateAction, useState } from 'react';
import { ArrowSquareOut, CaretUp, TrashSimple } from '@phosphor-icons/react';
import { CaretDown } from '@phosphor-icons/react';
import { Reply } from './reply';
import { getPublicUrl } from '@/services/upload_file';
import { StatusChip } from '@/components/design-system/status-chips';
import { Switch } from '@/components/ui/switch';
import { useContentStore } from '../../-stores/chapter-sidebar-store';
import { useSidebar } from '@/components/ui/sidebar';

export const Doubt = ({
    doubt,
    setDoubtProgressMarkerPdf,
    setDoubtProgressMarkerVideo,
}: {
    doubt: DoubtType;
    setDoubtProgressMarkerPdf: Dispatch<SetStateAction<number | null>>;
    setDoubtProgressMarkerVideo: Dispatch<SetStateAction<number | null>>;
}) => {
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [userId, setUserId] = useState<string | null>(null);
    const [showReplies, setShowReplies] = useState<boolean>(false);
    const { activeItem } = useContentStore();
    const { setOpen } = useSidebar();

    const handleTimeStampClick = (timestamp: number) => {
        if (activeItem?.source_type == 'VIDEO') {
            setDoubtProgressMarkerVideo(timestamp);
        } else if (activeItem?.source_type == 'DOCUMENT') {
            setDoubtProgressMarkerPdf(timestamp);
        }
        setOpen(false);
    };

    useEffect(() => {
        const fetchUserId = async () => {
            // const id = await getUserId();
            const id = '';
            setUserId(id);
        };
        fetchUserId();
    }, []);

    useEffect(() => {
        const fetchImageUrl = async () => {
            if (doubt.face_file_id) {
                try {
                    const url = await getPublicUrl(doubt.face_file_id);
                    setImageUrl(url);
                } catch (error) {
                    console.error('Failed to fetch image URL:', error);
                }
            }
        };

        fetchImageUrl();
    }, [doubt.face_file_id]);

    return (
        <div className="flex flex-col gap-3 rounded-lg p-3 max-sm:text-caption md:px-1 lg:px-3">
            <div className="flex flex-col gap-2">
                <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
                    <div className="flex items-center gap-2">
                        <div className="size-8 rounded-full bg-neutral-300 sm:size-10">
                            {/* add image here */}
                            {imageUrl ? (
                                <img
                                    src={imageUrl}
                                    alt={doubt.user_name}
                                    className="size-full rounded-lg object-cover "
                                />
                            ) : (
                                <></>
                            )}
                        </div>
                        <div className="text-body font-semibold">{doubt.user_name}</div>
                    </div>
                    <div className="flex items-center gap-3">
                        <StatusChip
                            text={doubt.status === 'RESOLVED' ? 'Resolved' : 'Unresolved'}
                            textSize="text-caption"
                            status={doubt.status === 'RESOLVED' ? 'SUCCESS' : 'INFO'}
                        />
                        <p className="sm:text-regular text-caption text-neutral-500">
                            {doubt.timestamp}
                        </p>
                    </div>
                </div>
                <div className="flex items-center justify-between">
                    <div className="flex gap-2">
                        <p>
                            <span className="font-semibold">Timestamp: </span>
                            {doubt.slide_progress_marker}
                        </p>
                        <ArrowSquareOut
                            className="mt-[3px] cursor-pointer"
                            onClick={() => handleTimeStampClick(doubt.slide_progress_marker)}
                        />
                    </div>
                    {userId && doubt.user_id === userId && (
                        <div className="flex w-full items-center gap-2 font-semibold ">
                            Mark as resolved{' '}
                            <Switch
                                checked={doubt.status === 'RESOLVED'}
                                onCheckedChange={() => {}}
                            />
                        </div>
                    )}
                </div>
                <div
                    dangerouslySetInnerHTML={{
                        __html: doubt.doubt_text || '',
                    }}
                    className="custom-html-content"
                />
                {doubt.user_id == userId && doubt.replies.length == 0 && (
                    <div className="flex cursor-pointer items-center gap-1">
                        <TrashSimple className="text-danger-500" />
                        <p className="text-body">Delete</p>
                    </div>
                )}
            </div>
            {doubt.replies.length > 0 && (
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                        <p className="text-caption font-semibold sm:text-body">
                            Replies <span className="text-primary-500">{doubt.replies.length}</span>
                        </p>
                        {showReplies == false && (
                            <CaretDown
                                onClick={() => setShowReplies(true)}
                                className="cursor-pointer"
                            />
                        )}
                        {showReplies == true && (
                            <CaretUp
                                onClick={() => setShowReplies(false)}
                                className="cursor-pointer"
                            />
                        )}
                    </div>
                    {showReplies && (
                        <div className="flex flex-col gap-6 rounded-md border border-neutral-300 p-4">
                            {doubt.replies.map((reply, key) => (
                                <Reply reply={reply} key={key} />
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
