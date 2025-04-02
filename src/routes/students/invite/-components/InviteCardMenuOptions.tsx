import { MyDropdown } from "@/components/design-system/dropdown";
import { MyButton } from "@/components/design-system/button";
import { DotsThree } from "phosphor-react";
import { useState } from "react";
import { MyDialog } from "@/components/design-system/dialog";
import { InviteLinkType } from "../-types/invite-link-types";
import { InviteForm } from "../-schema/InviteFormSchema";
import { CreateInviteDialog } from "./create-invite/CreateInviteDialog";
import { useUpdateInviteLinkStatus } from "../-services/update-invite-link-status";
import { toast } from "sonner";
import { useInviteForm } from "../-hooks/useInviteForm";
import { useGetInviteDetails } from "../-services/get-invite-details";
import { DashboardLoader } from "@/components/core/dashboard-loader";
import responseDataToFormData from "../-utils/responseDataToFormData";
import { useInviteFormContext } from "../-context/useInviteFormContext";
interface InviteCardMenuOptionsProps {
    invite: InviteLinkType;
    onEdit: (updatedInvite: InviteForm) => void;
}

export const InviteCardMenuOptions = ({ invite }: InviteCardMenuOptionsProps) => {
    const dropdownList = ["edit", "delete"];
    const [openEditDialog, setOpenEditDialog] = useState(false);
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const { form } = useInviteForm();
    const { form: contextForm } = useInviteFormContext();
    const { getValues, reset } = form;
    const { reset: resetContext } = contextForm;
    const updateInviteStatusMutation = useUpdateInviteLinkStatus();
    const { data, isLoading, isError } = useGetInviteDetails({ learnerInvitationId: invite.id });

    const onDeleteInvite = async (invite: InviteLinkType) => {
        try {
            await updateInviteStatusMutation.mutateAsync({
                requestBody: {
                    learner_invitation_ids: [invite.id],
                    status: "DELETED",
                },
            });
            toast.success("Invite deleted!");
            setOpenDeleteDialog(false);
        } catch {
            toast.error("failed to delete the invite link!");
        }
    };

    const submitButton = (
        <div className="flex-end flex w-full items-center">
            <MyButton>Save Changes</MyButton>
        </div>
    );

    const handleOpenEditDialog = () => {
        if (openEditDialog == true) reset();
        setOpenEditDialog(!openEditDialog);
    };

    if (isLoading) return <DashboardLoader />;

    const handleSelect = (value: string) => {
        if (value == "delete") setOpenDeleteDialog(true);
        else {
            if (isError) {
                toast.error("Error fetching invite details");
            }
            if (data) {
                console.log("data: ", data);
                const formData = responseDataToFormData(data);
                reset(formData);
                resetContext(formData);

                console.log("formdata: ", getValues());
                setOpenEditDialog(true);
            }
        }
    };

    return (
        <>
            <MyDropdown dropdownList={dropdownList} onSelect={handleSelect}>
                <MyButton buttonType="secondary" scale="medium" layoutVariant="icon">
                    <DotsThree />
                </MyButton>
            </MyDropdown>

            <CreateInviteDialog
                initialValues={getValues()}
                open={openEditDialog}
                onOpenChange={handleOpenEditDialog}
                submitButton={submitButton}
            />
            <MyDialog
                open={openDeleteDialog}
                onOpenChange={() => setOpenDeleteDialog(!openDeleteDialog)}
                heading="Delete Dialog"
                footer={
                    <div className="flex w-full items-center justify-between py-2">
                        <MyButton buttonType="secondary" onClick={() => setOpenDeleteDialog(false)}>
                            Cancel
                        </MyButton>
                        <MyButton buttonType="primary" onClick={() => onDeleteInvite(invite)}>
                            Yes, I am sure
                        </MyButton>
                    </div>
                }
            >
                Are you sure you want to delete the {invite.name} invite?
            </MyDialog>
        </>
    );
};
