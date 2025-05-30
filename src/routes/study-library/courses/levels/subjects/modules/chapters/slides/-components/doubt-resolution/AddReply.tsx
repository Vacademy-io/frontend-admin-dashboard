import { MainViewQuillEditor } from '@/components/quill/MainViewQuillEditor';
import { MyButton } from '@/components/design-system/button';
import { ArrowUp } from '@phosphor-icons/react';
import { handleAddReply } from '../../-helper/handleAddReply';
import { DoubtType } from '../../-types/add-doubt-type';
import { useContentStore } from '../../-stores/chapter-sidebar-store';
import { useState } from 'react';
import { useAddReply } from '../../-services/AddReply';
import { getUserId, getUserName } from '@/utils/userDetails';

export const AddReply = ({ parent, refetch }: { parent: DoubtType; refetch: () => void }) => {
    const userId = getUserId();
    const userName = getUserName();
    const { activeItem } = useContentStore();
    const [teacherReply, setTeacherReply] = useState<string>('');
    const addReply = useAddReply();

    const submitReply = async () => {
        const replyData: DoubtType = {
            user_id: userId || '',
            name: userName || '',
            source: 'SLIDE',
            source_id: activeItem?.id || '',
            raised_time: new Date().toISOString(),
            resolved_time: null,
            content_position: parent.content_position,
            content_type: (activeItem?.source_type == 'DOCUMENT'
                ? activeItem.document_slide?.type
                : activeItem?.source_type || '') as string,
            html_text: teacherReply,
            status: 'ACTIVE',
            parent_id: parent.id || null,
            parent_level: parent.parent_level + 1,
            doubt_assignee_request_user_ids: parent.doubt_assignee_request_user_ids,
            delete_assignee_request: parent.delete_assignee_request,
            all_doubt_assignee: parent.all_doubt_assignee,
        };
        await handleAddReply({ replyData, addReply, setReply: setTeacherReply, refetch });
    };

    return (
        <div className=" relative flex w-full items-center gap-2 rounded-md">
            <MainViewQuillEditor
                value={teacherReply}
                onChange={setTeacherReply}
                CustomclasssName="mb-16 h-[80px] w-full max-sm:h-[50px] sm:mb-10 custom-quill-padding"
                placeholder="Add your reply here"
            />
            <div
                className="absolute bottom-6 right-2 flex flex-col items-center gap-3"
                onClick={submitReply}
            >
                <MyButton layoutVariant="icon" className="rounded-full">
                    <ArrowUp />
                </MyButton>
            </div>
        </div>
    );
};
