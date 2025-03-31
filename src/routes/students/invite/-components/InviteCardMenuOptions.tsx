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

interface InviteCardMenuOptionsProps {
    invite: InviteLinkType;
    onEdit: (updatedInvite: InviteForm) => void;
}

export const InviteCardMenuOptions = ({ invite }: InviteCardMenuOptionsProps) => {
    const dropdownList = ["edit", "delete"];
    const [openEditDialog, setOpenEditDialog] = useState(false);
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const updateInviteStatusMutation = useUpdateInviteLinkStatus();

    const handleSelect = (value: string) => {
        if (value == "delete") setOpenDeleteDialog(true);
        else setOpenEditDialog(true);
    };

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

    const dummyInviteData: InviteForm = {
        inviteLink: "Test link",
        activeStatus: true,
        custom_fields: [
            {
                id: 0,
                type: "textfield",
                name: "Full Name",
                oldKey: true,
                isRequired: true,
            },
            {
                id: 1,
                type: "textfield",
                name: "Email",
                oldKey: true,
                isRequired: true,
            },
            {
                id: 2,
                type: "textfield",
                name: "Phone Number",
                oldKey: true,
                isRequired: true,
            },
        ],
        batches: {
            maxCourses: 0,
            courseSelectionMode: "institute",
            preSelectedCourses: [],
            learnerChoiceCourses: [],
        },
        studentExpiryDays: 200,
        inviteeEmail: "shristi@gmail.com",
        inviteeEmails: [],
    };

    return (
        <>
            <MyDropdown dropdownList={dropdownList} onSelect={handleSelect}>
                <MyButton buttonType="secondary" scale="medium" layoutVariant="icon">
                    <DotsThree />
                </MyButton>
            </MyDropdown>
            <CreateInviteDialog
                initialValues={dummyInviteData}
                open={openEditDialog}
                onOpenChange={() => setOpenEditDialog(!openEditDialog)}
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
