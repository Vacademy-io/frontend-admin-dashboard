import { Switch } from '@/components/ui/switch';
import { Doubt } from '../../-types/get-doubts-type';
import { useState } from 'react';
import { DoubtType } from '../../-types/add-doubt-type';
import { useAddReply } from '../../-services/AddReply';
import { handleAddReply } from '../../-helper/handleAddReply';
import { MarkResolutionDropdown } from '@/routes/study-library/doubt-management/-components/doubt-table/mark-as-resolved-cell';

export const MarkAsResolved = ({ doubt, refetch, dropdownComponent }: { doubt: Doubt; refetch: () => void, dropdownComponent?: boolean }) => {
    const [resolved, setResolved] = useState(doubt.status === 'RESOLVED');
    const addReply = useAddReply();

    const handleDoubtResolve = async () => {
        setResolved(!resolved);
        const replyData: DoubtType = {
            id: doubt.id,
            user_id: doubt.user_id,
            name: doubt.name,
            source: doubt.source,
            source_id: doubt.source_id,
            raised_time: doubt.raised_time,
            resolved_time: new Date().toISOString(),
            content_position: doubt.content_position,
            content_type: doubt.content_type,
            html_text: doubt.html_text,
            status: resolved ? 'ACTIVE' : 'RESOLVED',
            parent_id: doubt.parent_id,
            parent_level: doubt.parent_level,
            doubt_assignee_request_user_ids: doubt.doubt_assignee_request_user_ids,
            all_doubt_assignee: doubt.all_doubt_assignee,
            delete_assignee_request: doubt.delete_assignee_request,
        };
        await handleAddReply({ replyData, addReply, refetch, id: doubt.id });
    };
    return (
        <div className="flex items-center gap-2 font-semibold">
            {dropdownComponent && dropdownComponent==true ?
                <MarkResolutionDropdown resolved={resolved} handleDoubtResolve={handleDoubtResolve} doubt={doubt} />
                :
                <div>Mark as resolved <Switch checked={resolved} onCheckedChange={handleDoubtResolve} /></div>
            }
        </div>
    );
};
