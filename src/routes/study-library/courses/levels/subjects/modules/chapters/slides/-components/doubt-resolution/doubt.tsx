import { Dispatch, SetStateAction, useEffect } from 'react';
import { ArrowSquareOut } from '@phosphor-icons/react';
import { StatusChip } from '@/components/design-system/status-chips';
import { useContentStore } from '../../-stores/chapter-sidebar-store';
import { useSidebar } from '@/components/ui/sidebar';
import { Doubt as DoubtType } from '../../-types/get-doubts-type';
import { TokenKey } from '@/constants/auth/tokens';
import { getTokenDecodedData, getTokenFromCookie } from '@/lib/auth/sessionUtility';
import { getInstituteId } from '@/constants/helper';
import { useRouter } from '@tanstack/react-router';
import { FacultyFilterParams } from '@/routes/dashboard/-services/dashboard-services';
import { useInstituteDetailsStore } from '@/stores/students/students-list/useInstituteDetailsStore';
import { useTeacherList } from '@/routes/dashboard/-hooks/useTeacherList';
import { ShowReplies } from './ShowReplies';
import { DeleteDoubt } from './DeleteDoubt';
import { MarkAsResolved } from './MarkAsResolved';
import { formatISODateTimeReadable } from '@/helpers/formatISOTime';
import { useGetUserBasicDetails } from '@/services/get_user_basic_details';
export const Doubt = ({
    doubt,
    setDoubtProgressMarkerPdf,
    setDoubtProgressMarkerVideo,
    refetch,
}: {
    doubt: DoubtType;
    setDoubtProgressMarkerPdf: Dispatch<SetStateAction<number | null>>;
    setDoubtProgressMarkerVideo: Dispatch<SetStateAction<number | null>>;
    refetch: () => void;
}) => {
    // const [imageUrl, setImageUrl] = useState<string | null>(null);
    const imageUrl: string | null = null;
    const { activeItem } = useContentStore();
    const { setOpen } = useSidebar();
    const router = useRouter();
    const { getPackageSessionId } = useInstituteDetailsStore();

    const accessToken = getTokenFromCookie(TokenKey.accessToken);
    const tokenData = getTokenDecodedData(accessToken);
    const InstituteId = getInstituteId();
    const userId = tokenData?.user;
    const isAdmin = tokenData?.authorities[InstituteId || '']?.roles.includes('ADMIN');
    const isTeacher = tokenData?.authorities[InstituteId || '']?.roles.includes('TEACHER');
    // get teacher list
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
    const { data } = useTeacherList(InstituteId || '', 0, 100, filters, true);
    console.log('data: ', data, isTeacher, userId);

    const { data: userBasicDetails } = useGetUserBasicDetails([doubt.user_id]);
    useEffect(() => {
        console.log('userBasicDetails: ', userBasicDetails);
    }, [userBasicDetails]);

    const handleTimeStampClick = (timestamp: number) => {
        if (activeItem?.source_type == 'VIDEO') {
            setDoubtProgressMarkerVideo(timestamp);
        } else if (activeItem?.source_type == 'DOCUMENT') {
            setDoubtProgressMarkerPdf(timestamp);
        }
        setOpen(false);
    };

    // useEffect(() => {
    //     const fetchImageUrl = async () => {
    //       if (doubt.face_file_id) {
    //         try {
    //           const url = await getPublicUrl(doubt.face_file_id);
    //           setImageUrl(url);
    //         } catch (error) {
    //           console.error("Failed to fetch image URL:", error);
    //         }
    //       }
    //     };

    //     fetchImageUrl();
    //   }, [doubt.face_file_id]);

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
                                    alt={doubt.name}
                                    className="size-full rounded-lg object-cover "
                                />
                            ) : (
                                <></>
                            )}
                        </div>
                        <div className="text-subtitle font-semibold text-neutral-700">
                            {doubt.name}
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
                <div className="flex items-center justify-between">
                    <div className="flex gap-2">
                        <p>
                            <span className="font-semibold">Timestamp: </span>
                            {doubt.content_position}
                        </p>
                        <ArrowSquareOut
                            className="mt-[3px] cursor-pointer"
                            onClick={() => handleTimeStampClick(parseInt(doubt.content_position))}
                        />
                    </div>
                    {isAdmin ||
                        (userId && doubt.doubt_assignee_request_user_ids.includes(userId) && (
                            <MarkAsResolved doubt={doubt} refetch={refetch} />
                        ))}
                </div>
                <div
                    dangerouslySetInnerHTML={{
                        __html: doubt.html_text || '',
                    }}
                    className="custom-html-content"
                />
                {isAdmin && <DeleteDoubt doubt={doubt} refetch={refetch} />}
                <ShowReplies parent={doubt} refetch={refetch} />
            </div>
        </div>
    );
};
