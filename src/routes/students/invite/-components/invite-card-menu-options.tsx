import { MyDropdown } from "@/components/design-system/dropdown";
import { CreateInviteDialog, InviteFormType } from "./create-invite-dialog";
import { MyButton } from "@/components/design-system/button";
import { DotsThree } from "phosphor-react";
import { useState } from "react";
import { MyDialog } from "@/components/design-system/dialog";
import { InviteLinkType } from "../-types/invite-link-types";

interface InviteCardMenuOptionsProps {
    invite: InviteLinkType;
    onDelete: (invite: InviteLinkType) => void;
    onEdit: (updatedInvite: InviteFormType) => void;
}

export const InviteCardMenuOptions = ({ invite, onDelete }: InviteCardMenuOptionsProps) => {
    const dropdownList = ["edit", "delete"];
    const [openEditDialog, setOpenEditDialog] = useState(false);
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

    const handleSelect = (value: string) => {
        if (value == "delete") setOpenDeleteDialog(true);
        else setOpenEditDialog(true);
    };

    const submitButton = (
        <div className="flex-end flex w-full items-center">
            <MyButton>Save Changes</MyButton>
        </div>
    );

    const dummyInviteData: InviteFormType = {
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
        courseSelectionMode: "institute",
        sessionSelectionMode: "institute",
        levelSelectionMode: "institute",
        studentExpiryDays: 200,
        generatedInviteLink: "https://forms.gle/example123",
        inviteeEmail: "shristi@gmail.com",
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
                        <MyButton buttonType="primary" onClick={() => onDelete(invite)}>
                            Yes, I am sure
                        </MyButton>
                    </div>
                }
            >
                Are you sure you want to delete the {invite.invite_link_name} invite?
            </MyDialog>
        </>
    );
};
