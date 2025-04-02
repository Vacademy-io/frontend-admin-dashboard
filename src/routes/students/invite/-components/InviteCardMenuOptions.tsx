import { MyDropdown } from "@/components/design-system/dropdown";
import { MyButton } from "@/components/design-system/button";
import { DotsThree } from "phosphor-react";
import { useRef, useState } from "react";
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
import { useCourseManager } from "../-hooks/useCourseManager";
import { useUpdateInvite } from "../-services/update-invite";
import formDataToRequestData from "../-utils/formDataToRequestData";
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
    const { hasValidPreSelectedCourseStructure, hasValidLearnerChoiceCourseStructure } =
        useCourseManager();
    const updateInviteMutation = useUpdateInvite();
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
    const formSubmitRef = useRef<() => void>(() => {});

    const submitButton = (
        <div
            className="flex-end flex w-full items-center"
            onClick={() => {
                formSubmitRef.current();
            }}
        >
            <MyButton
                disable={
                    !hasValidLearnerChoiceCourseStructure() && !hasValidPreSelectedCourseStructure()
                }
            >
                Save Changes
            </MyButton>
        </div>
    );

    const handleOpenEditDialog = () => {
        if (openEditDialog == true) {
            reset();
            resetContext();
        }
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

    const onUpdateInvite = async (inviteData: InviteForm) => {
        console.log("insite update invite");
        try {
            const requestFormat = formDataToRequestData(inviteData, invite.id);
            await updateInviteMutation.mutateAsync({
                requestBody: requestFormat.learner_invitation,
            });
            toast.success("Invite edited successfully!");
            handleOpenEditDialog();
        } catch {
            toast.error("Failed to edit the invite");
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
                submitForm={(fn: () => void) => {
                    formSubmitRef.current = fn;
                }}
                onCreateInvite={onUpdateInvite}
                isEditing={true}
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
