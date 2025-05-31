import { CaretUp } from '@phosphor-icons/react';
import { CaretDown } from '@phosphor-icons/react';
import { Doubt } from '../../-types/get-doubts-type';
import { useState } from 'react';
import { AddReply } from './AddReply';
import { Reply } from './reply';
import { getUserId, isUserAdmin } from '@/utils/userDetails';

export const ShowReplies = ({ parent, refetch }: { parent: Doubt; refetch: () => void }) => {
    const [showReplies, setShowReplies] = useState<boolean>(false);
    const userId = getUserId();
    const isAdmin = isUserAdmin();
    return (
        <>
            {parent.replies.length > 0 ? (
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                        <p className="text-caption font-semibold sm:text-body">
                            Replies{' '}
                            <span className="text-primary-500">{parent.replies.length}</span>
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
                        <div className="flex flex-col gap-2 rounded-md border border-neutral-300 p-4">
                            {parent.replies?.map((reply, key) => (
                                <Reply reply={reply} key={key} refetch={refetch} />
                            ))}
                            {(isAdmin ||
                                (userId &&
                                    parent.doubt_assignee_request_user_ids?.includes(userId))) && (
                                <AddReply parent={parent} refetch={refetch} />
                            )}
                        </div>
                    )}
                </div>
            ) : isAdmin || (userId && parent.doubt_assignee_request_user_ids.includes(userId)) ? (
                <AddReply parent={parent} refetch={refetch} />
            ) : (
                <></>
            )}
        </>
    );
};
