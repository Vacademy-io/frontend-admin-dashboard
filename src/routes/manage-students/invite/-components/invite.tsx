import { InviteForm } from '../-schema/InviteFormSchema';
import { EmptyInvitePage } from '@/assets/svgs';
import { InviteCardMenuOptions } from './InviteCardMenuOptions';
import { MyPagination } from '@/components/design-system/pagination';
import { usePaginationState } from '@/hooks/pagination';
import { useGetInviteList } from '../-services/get-invite-list';
import { DashboardLoader } from '@/components/core/dashboard-loader';
import { InviteLink } from '../../-components/InviteLink';
import { CreateInvite } from './create-invite/CreateInvite';
import { getInstituteId } from '@/constants/helper';

export const Invite = () => {
    
    const INSTITUTE_ID = getInstituteId()

    const { page, pageSize, handlePageChange } = usePaginationState({
        initialPage: 0,
        initialPageSize: 5,
    });

    const filterRequest = {
        status: ['ACTIVE', 'INACTIVE'],
        name: '',
    };

    const {
        data: inviteList,
        isLoading,
        isError,
    } = useGetInviteList({
        instituteId: INSTITUTE_ID || '',
        pageNo: page,
        pageSize: pageSize,
        requestFilterBody: filterRequest,
    });

    const onEditInvite = (updatedInvite: InviteForm) => {
        console.log(updatedInvite);
    };

    return (
        <div className="flex w-full flex-col gap-10">
            <div className="flex items-center justify-between">
                <p className="text-h3 font-semibold">Invite Link List</p>
                <CreateInvite />
            </div>
            <div className="flex w-full flex-col gap-10">
                {isError ? (
                    <p>Error fetching invitation links</p>
                ) : isLoading ? (
                    <DashboardLoader />
                ) : !inviteList || !inviteList.content || inviteList?.content.length == 0 ? (
                    <div className="flex h-[70vh] w-full flex-col items-center justify-center gap-2">
                        <EmptyInvitePage />
                        <p>No invite link has been created yet!</p>
                    </div>
                ) : (
                    <div className="flex flex-col gap-10">
                        {inviteList.content.map((obj, index) => (
                            <div
                                key={index}
                                className="flex w-full flex-col gap-4 rounded-lg border border-neutral-300 p-6"
                            >
                                <div className="flex items-center justify-between">
                                    <p className="text-title font-semibold">{obj.name}</p>
                                    <InviteCardMenuOptions invite={obj} onEdit={onEditInvite} />
                                </div>
                                <div className="flex items-center gap-12 text-body font-regular">
                                    <p>Created on: {obj.date_generated}</p>
                                    <p>Invites accepted by: {obj.accepted_by}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <p className="text-body font-semibold">Invite Link: </p>
                                    <InviteLink inviteCode={obj.invite_code || ''} />
                                </div>
                            </div>
                        ))}
                        <MyPagination
                            currentPage={page}
                            totalPages={inviteList.totalPages}
                            onPageChange={handlePageChange}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};
