import { LoadingSpinner } from '@/components/ai-course-builder/LoadingSpinner';
import { MyButton } from '@/components/design-system/button';
import { MyDialog } from '@/components/design-system/dialog';
import { MyDropdown } from '@/components/design-system/dropdown';
import { InviteLinkDataInterface } from '@/schemas/study-library/invite-links-schema';
import { useInstituteDetailsStore } from '@/stores/students/students-list/useInstituteDetailsStore';
import { DotsThree } from 'phosphor-react';
import { useState, Suspense } from 'react';
import { toast } from 'sonner';
import { useQueryClient, useSuspenseQuery } from '@tanstack/react-query';
import { handleGetEnrollSingleInviteDetails } from '@/routes/manage-students/invite/-components/create-invite/-services/enroll-invite';
import { extractBatchesFromInviteDetails } from '@/routes/manage-students/invite/-utils/enrollInviteTransformers';
import GenerateInviteLinkDialog from '@/routes/manage-students/invite/-components/create-invite/GenerateInviteLinkDialog';
import { handleGetPaymentDetails } from '@/routes/manage-students/invite/-components/create-invite/-services/get-payments';
import { useUpdateInviteLinkStatus } from '@/routes/manage-students/invite/-services/update-invite-link-status';

interface AudienceInviteCardMenuOptionsProps {
    invite: InviteLinkDataInterface;
}

const EditAudienceInviteDialog = ({ invite }: { invite: InviteLinkDataInterface }) => {
    const [openEditDialog, setOpenEditDialog] = useState(true);
    const { getDetailsFromPackageSessionId } = useInstituteDetailsStore();

    const { data: inviteLinkDetails } = useSuspenseQuery(
        handleGetEnrollSingleInviteDetails({ inviteId: invite.id })
    );

    useSuspenseQuery(handleGetPaymentDetails());

    const selectedBatches = extractBatchesFromInviteDetails(
        inviteLinkDetails,
        getDetailsFromPackageSessionId
    );

    const parentBatch = selectedBatches[0];
    const selectedCourse = parentBatch
        ? {
              id: parentBatch.package_dto.package_name,
              name: parentBatch.package_dto.package_name,
          }
        : null;

    return (
        <GenerateInviteLinkDialog
            showSummaryDialog={openEditDialog}
            setShowSummaryDialog={setOpenEditDialog}
            selectedCourse={selectedCourse}
            selectedBatches={selectedBatches
                .filter((batch) => batch !== null)
                .map((batch) => ({
                    sessionId: batch.session.id,
                    levelId: batch.level.id,
                    sessionName: batch.session.session_name,
                    levelName: batch.level.level_name,
                    courseId: batch.package_dto.id,
                    courseName: batch.package_dto.package_name,
                    isParent: false,
                }))}
            inviteLinkId={invite.id}
            singlePackageSessionId={true}
            isEditInviteLink={true}
            setDialogOpen={setOpenEditDialog}
        />
    );
};

export const AudienceInviteCardMenuOptions = ({ invite }: AudienceInviteCardMenuOptionsProps) => {
    const queryClient = useQueryClient();
    const dropdownList = ['edit', 'delete'];
    const [openEditDialog, setOpenEditDialog] = useState(false);
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const updateInviteStatusMutation = useUpdateInviteLinkStatus();

    const handleDeleteInvite = async (inviteToDelete: InviteLinkDataInterface) => {
        try {
            await updateInviteStatusMutation.mutateAsync({
                requestBody: {
                    learner_invitation_ids: [inviteToDelete.id],
                    status: 'DELETED',
                },
            });
            queryClient.invalidateQueries({ queryKey: ['inviteList'] });
            queryClient.invalidateQueries({ queryKey: ['GET_INVITE_LINKS'] });
            toast.success('Audience invite deleted');
            setOpenDeleteDialog(false);
        } catch {
            toast.error('Failed to delete the audience invite link');
        }
    };

    const handleSelect = async (value: string) => {
        if (value === 'delete') {
            setOpenDeleteDialog(true);
        } else {
            setOpenEditDialog(true);
        }
    };

    return (
        <>
            <MyDropdown dropdownList={dropdownList} onSelect={handleSelect}>
                <MyButton buttonType="secondary" scale="medium" layoutVariant="icon">
                    <DotsThree />
                </MyButton>
            </MyDropdown>

            {openEditDialog && (
                <Suspense fallback={<LoadingSpinner />}>
                    <EditAudienceInviteDialog invite={invite} />
                </Suspense>
            )}

            <MyDialog
                open={openDeleteDialog}
                onOpenChange={() => setOpenDeleteDialog((prev) => !prev)}
                heading="Delete Audience Invite"
                footer={
                    <div className="flex w-full items-center justify-between py-2">
                        <MyButton buttonType="secondary" onClick={() => setOpenDeleteDialog(false)}>
                            Cancel
                        </MyButton>
                        <MyButton buttonType="primary" onClick={() => handleDeleteInvite(invite)}>
                            Yes, delete it
                        </MyButton>
                    </div>
                }
            >
                Are you sure you want to delete the {invite.name} audience invite?
            </MyDialog>
        </>
    );
};

