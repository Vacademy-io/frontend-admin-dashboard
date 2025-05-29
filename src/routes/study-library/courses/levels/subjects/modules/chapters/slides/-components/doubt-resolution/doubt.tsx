import { useEffect, useState } from 'react';
import { ArrowSquareOut } from '@phosphor-icons/react';
import { StatusChip } from '@/components/design-system/status-chips';
import { useContentStore } from '../../-stores/chapter-sidebar-store';
import { useMediaNavigationStore } from '../../-stores/media-navigation-store';
import { useSidebar } from '@/components/ui/sidebar';
import { Doubt as DoubtType } from '../../-types/get-doubts-type';
import { TokenKey } from '@/constants/auth/tokens';
import { getTokenDecodedData, getTokenFromCookie } from '@/lib/auth/sessionUtility';
import { getInstituteId } from '@/constants/helper';
import { useRouter } from '@tanstack/react-router';
import { FacultyFilterParams } from '@/routes/dashboard/-services/dashboard-services';
import { useInstituteDetailsStore } from '@/stores/students/students-list/useInstituteDetailsStore';
import { ShowReplies } from './ShowReplies';
import { DeleteDoubt } from './DeleteDoubt';
import { MarkAsResolved } from './MarkAsResolved';
import { formatISODateTimeReadable } from '@/helpers/formatISOTime';
import { useGetUserBasicDetails } from '@/services/get_user_basic_details';
import { EnrollFormUploadImage } from '@/assets/svgs';
import { getPublicUrl } from '@/services/upload_file';
import { TeacherSelection } from './TeacherSelection';
import { formatTime } from '@/helpers/formatYoutubeVideoTime';

export const Doubt = ({ doubt, refetch }: { doubt: DoubtType; refetch: () => void }) => {
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const { activeItem } = useContentStore();
    const { navigateToTimestamp } = useMediaNavigationStore();
    const { setOpen } = useSidebar();
    const router = useRouter();
    const { getPackageSessionId } = useInstituteDetailsStore();

    const accessToken = getTokenFromCookie(TokenKey.accessToken);
    const tokenData = getTokenDecodedData(accessToken);
    const InstituteId = getInstituteId();
    const userId = tokenData?.user;
    const isAdmin = tokenData?.authorities[InstituteId || '']?.roles.includes('ADMIN');
    const { courseId, sessionId, levelId, subjectId } = router.state.location.search;
    const pksId = getPackageSessionId({
        courseId: courseId || '',
        sessionId: sessionId || '',
        levelId: levelId || '',
    });
    const filters: FacultyFilterParams = {
        name: '',
        batches: [pksId || ''],
        subjects: [subjectId || ''],
        status: [],
        sort_columns: { name: 'DESC' },
    };

    const { data: userBasicDetails } = useGetUserBasicDetails([doubt.user_id]);

    const handleTimeStampClick = (timestamp: number) => {
        // Navigate to the appropriate timestamp based on media type
        if (activeItem?.source_type === 'VIDEO') {
            // For videos, timestamp is in milliseconds, convert to seconds for video player
            navigateToTimestamp(timestamp, 'VIDEO');
        } else if (activeItem?.source_type === 'DOCUMENT') {
            // For PDFs, timestamp represents page number
            navigateToTimestamp(timestamp, 'DOCUMENT');
        }

        setOpen(false);
    };

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
        <div className="flex flex-col gap-3 rounded-lg p-3 max-sm:text-caption md:px-1 lg:px-3">
            <div className="flex w-full flex-col gap-2">
                <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
                    <div className="flex items-center gap-2">
                        <div className="size-8 rounded-full bg-neutral-300 sm:size-10">
                            {/* add image here */}
                            {imageUrl ? (
                                <img
                                    src={imageUrl}
                                    alt={doubt.name}
                                    className="size-full rounded-lg object-cover "
                                />
                            ) : (
                                <EnrollFormUploadImage className="size-10" />
                            )}
                        </div>
                        <div className="text-subtitle font-semibold text-neutral-700">
                            {userBasicDetails?.[0]?.name}
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <StatusChip
                            text={doubt.status === 'RESOLVED' ? 'Resolved' : 'Unresolved'}
                            textSize="text-caption"
                            status={doubt.status === 'RESOLVED' ? 'SUCCESS' : 'INFO'}
                        />
                        <p className="text-caption text-neutral-500 sm:text-body">
                            {formatISODateTimeReadable(doubt.raised_time)}
                        </p>
                    </div>
                </div>
                <div className="flex w-full items-center justify-between">
                    {(activeItem?.source_type == 'VIDEO' ||
                        (activeItem?.source_type == 'DOCUMENT' &&
                            activeItem?.document_slide?.type == 'PDF')) && (
                        <div className="flex gap-2">
                            <p>
                                <span className="font-semibold">
                                    {activeItem?.source_type == 'VIDEO' ? 'Timestamp' : 'Page No'}:{' '}
                                </span>
                                {activeItem?.source_type == 'VIDEO'
                                    ? formatTime(parseInt(doubt.content_position) / 1000)
                                    : activeItem?.source_type == 'DOCUMENT'
                                      ? parseInt(doubt.content_position) + 1
                                      : doubt.content_position}
                            </p>
                            <ArrowSquareOut
                                className="mt-[3px] cursor-pointer"
                                onClick={() =>
                                    handleTimeStampClick(parseInt(doubt.content_position))
                                }
                            />
                        </div>
                    )}
                    {(isAdmin ||
                        (userId && doubt.doubt_assignee_request_user_ids?.includes(userId))) && (
                        <MarkAsResolved doubt={doubt} refetch={refetch} />
                    )}
                </div>
                <div
                    dangerouslySetInnerHTML={{
                        __html: doubt.html_text || '',
                    }}
                    className="custom-html-content"
                />

                <TeacherSelection doubt={doubt} filters={filters} canChange={isAdmin || false} />
                {isAdmin && <DeleteDoubt doubt={doubt} refetch={refetch} />}
                <ShowReplies parent={doubt} refetch={refetch} />
            </div>
        </div>
    );
};
