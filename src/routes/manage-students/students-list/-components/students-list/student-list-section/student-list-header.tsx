import { MyButton } from '@/components/design-system/button';
import { EnrollStudentsButton } from '../../../../../../components/common/students/enroll-students-button';
import { useRouter } from '@tanstack/react-router';
import { BulkDialogProvider } from '../../../-providers/bulk-dialog-provider';
import { MyDialog } from '@/components/design-system/dialog';
import { useState } from 'react';
import { DropdownItemType } from '@/components/common/students/enroll-manually/dropdownTypesForPackageItems';
import { useGetBatchesQuery } from '@/routes/manage-institute/batches/-services/get-batches';
import { DashboardLoader } from '@/components/core/dashboard-loader';
import RootErrorComponent from '@/components/core/deafult-error';
import { InviteLink } from '@/routes/manage-students/-components/InviteLink';
import { CreateInvite } from '@/routes/manage-students/invite/-components/create-invite/CreateInvite';
import { useInstituteDetailsStore } from '@/stores/students/students-list/useInstituteDetailsStore';
import { NoCourseDialog } from '@/components/common/students/no-course-dialog';
import { cn } from '@/lib/utils';
import { useGetInviteList } from '@/routes/manage-students/invite/-services/get-invite-list';
import { getInstituteId } from '@/constants/helper';
import { usePaginationState } from '@/hooks/pagination';
import { MyPagination } from '@/components/design-system/pagination';

const InviteLinksDialog = ({
    currentSession,
    openInviteLinksDialog,
    handleOpenChange,
}: {
    currentSession?: DropdownItemType;
    openInviteLinksDialog: boolean;
    handleOpenChange: () => void;
}) => {
    const router = useRouter();

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

    const footer = (
        <div className="flex w-full items-center justify-between">
            <MyButton
                buttonType="secondary"
                onClick={() => router.navigate({ to: '/manage-students/invite' })}
            >
                Go to Invite Page
            </MyButton>
            <CreateInvite />
        </div>
    );

    return (
        <MyDialog
            heading="Invite Links"
            open={openInviteLinksDialog}
            onOpenChange={handleOpenChange}
            footer={footer}
            dialogWidth='w-fit'
        >
            {isLoading ? (
                <DashboardLoader />
            ) : isError ? (
                <RootErrorComponent />
            ) : (
                <div className="flex flex-col gap-3 items-center w-full">
                    {inviteList?.content?.length && inviteList?.content?.length>0 ?
                        <div className='flex flex-col gap-3 items-center'>
                        {inviteList?.content?.map((invite, index) => (
                            <div className="flex flex-col gap-1" key={index}>
                                <p className="text-subtitle font-semibold text-primary-500">
                                    {invite.name}
                                </p>
                                <div className="flex gap-2 text-body ">
                                    <InviteLink inviteCode={invite.invite_code} linkLen={60} />
                                </div>
                            </div>
                        ))}
                        <MyPagination
                            currentPage={page}
                            totalPages={inviteList.totalPages}
                            onPageChange={handlePageChange}
                        />
                        </div>
                    :
                        (<p>No invite links found</p>)
                    }
                </div>
            )}
        </MyDialog>
    );
};

export const StudentListHeader = ({
    currentSession,
    titleSize,
}: {
    currentSession?: DropdownItemType;
    titleSize?: string;
}) => {
    const [openInviteLinksDialog, setOpenInviteLinksDialog] = useState(false);
    const { instituteDetails } = useInstituteDetailsStore();
    const [isOpen, setIsOpen] = useState(false);
    const handleOpenChange = () => {
        setOpenInviteLinksDialog(!openInviteLinksDialog);
    };
    return (
        <div className="flex items-center justify-between">
            <div className={cn('font-semibold', titleSize ? titleSize : 'text-h3')}>
                Learner List
            </div>
            <div className="flex items-center gap-4">
                <MyButton
                    onClick={() => {
                        setOpenInviteLinksDialog(true);
                    }}
                    scale="large"
                    buttonType="secondary"
                >
                    Invite Learner
                </MyButton>
                <BulkDialogProvider>
                    {!instituteDetails?.batches_for_sessions.length ? (
                        <div className="flex flex-col items-center gap-1">
                            <NoCourseDialog
                                isOpen={isOpen}
                                setIsOpen={setIsOpen}
                                type="Enroll Students"
                                content="You need to create a course and add a subject in it before"
                                trigger={<MyButton scale="large">Enroll Students</MyButton>}
                            />
                        </div>
                    ) : (
                        <EnrollStudentsButton />
                    )}
                </BulkDialogProvider>
            </div>
            <InviteLinksDialog
                currentSession={currentSession}
                openInviteLinksDialog={openInviteLinksDialog}
                handleOpenChange={handleOpenChange}
            />
        </div>
    );
};
