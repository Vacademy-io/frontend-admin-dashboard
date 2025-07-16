import { MainViewQuillEditor } from '@/components/quill/MainViewQuillEditor';
import { MyButton } from '@/components/design-system/button';
import { PaperPlaneTilt } from '@phosphor-icons/react';
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
        if (!teacherReply.trim()) return;

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
        <div className="relative flex w-full items-center gap-2">
            <MainViewQuillEditor
                value={teacherReply}
                onBlur={() => {}}
                onChange={setTeacherReply}
                CustomclasssName="flex-grow min-h-[70px] max-h-[150px] w-full text-sm custom-quill-compact-padding ql-editor-flex-grow"
                placeholder="Type your reply..."
            />
            <MyButton
                layoutVariant="icon"
                buttonType="primary"
                className="absolute bottom-3 right-2 rounded-full p-1.5 shadow-md transition-shadow hover:shadow-lg"
                onClick={submitReply}
                disabled={!teacherReply.trim()}
            >
                <PaperPlaneTilt size={18} weight="fill" />
            </MyButton>
        </div>
    );
};
