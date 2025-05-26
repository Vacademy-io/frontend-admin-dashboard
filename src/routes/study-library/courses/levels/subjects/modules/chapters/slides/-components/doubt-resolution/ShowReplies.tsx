import { CaretUp } from '@phosphor-icons/react';
import { CaretDown } from '@phosphor-icons/react';
import { Doubt } from '../../-types/get-doubts-type';
import { useState } from 'react';
import { AddReply } from './AddReply';
import { Reply } from './Reply';
import { getTokenFromCookie } from '@/lib/auth/sessionUtility';
import { TokenKey } from '@/constants/auth/tokens';
import { getTokenDecodedData } from '@/lib/auth/sessionUtility';
import { getInstituteId } from '@/constants/helper';

export const ShowReplies = ({ parent, refetch }: { parent: Doubt; refetch: () => void }) => {
    const [showReplies, setShowReplies] = useState<boolean>(false);
    const accessToken = getTokenFromCookie(TokenKey.accessToken);
    const tokenData = getTokenDecodedData(accessToken);
    const InstituteId = getInstituteId();
    const userId = tokenData?.user;
    const isAdmin = tokenData?.authorities[InstituteId || '']?.roles.includes('ADMIN');
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
                        <div className="flex flex-col gap-6 rounded-md border border-neutral-300 p-4">
                            {parent.replies.map((reply, key) => (
                                <Reply reply={reply} key={key} refetch={refetch} />
                            ))}
                            {(isAdmin ||
                                (userId &&
                                    parent.doubt_assignee_request_user_ids.includes(userId))) && (
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
