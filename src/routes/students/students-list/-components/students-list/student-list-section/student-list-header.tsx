import { MyButton } from "@/components/design-system/button";
import { EnrollStudentsButton } from "../../../../../../components/common/students/enroll-students-button";
import { useRouter } from "@tanstack/react-router";
import { BulkDialogProvider } from "../../../-providers/bulk-dialog-provider";
import { MyDialog } from "@/components/design-system/dialog";
import { useState } from "react";
import { DropdownItemType } from "@/components/common/students/enroll-manually/dropdownTypesForPackageItems";
import { useGetBatchesQuery } from "@/routes/students/manage-batches/-services/get-batches";
import { DashboardLoader } from "@/components/core/dashboard-loader";
import RootErrorComponent from "@/components/core/deafult-error";
import { InviteLink } from "@/routes/students/-components/InviteLink";
import { CreateInvite } from "@/routes/students/invite/-components/create-invite/CreateInvite";

const InviteLinksDialog = ({currentSession, openInviteLinksDialog, handleOpenChange}: {currentSession: DropdownItemType, openInviteLinksDialog: boolean, handleOpenChange: () => void}) => {
    const router = useRouter();

    const { data, isLoading, isError } = useGetBatchesQuery({
        sessionId: currentSession?.id || "",
    });

    const footer = (
        <div className="flex justify-between items-center w-full">
            <MyButton buttonType="secondary" onClick={()=>router.navigate({to: "/students/invite"})}>Go to Invite Page</MyButton>
            <CreateInvite />
        </div>
    )

    return (
    <MyDialog heading="Invite Links" open={openInviteLinksDialog} onOpenChange={handleOpenChange} footer={footer}>
        {isLoading ? <DashboardLoader /> : isError ? <RootErrorComponent /> : (
        <div className="flex flex-col gap-3">
            {data?.flatMap((batch)=>(
                batch.batches.map((b, index)=>(
                    <div className="flex flex-col gap-1" key={index}>
                        <p className="text-subtitle text-primary-500 font-semibold">{b.batch_name}</p>
                        <div className="text-body flex gap-2 ">
                            <InviteLink inviteCode={b.invite_code} linkLen={40} />
                        </div>
                    </div>
                ))
            ))}
        </div>
        )}
    </MyDialog>
    )
}

export const StudentListHeader = ({currentSession}: {currentSession: DropdownItemType}) => {
    const [openInviteLinksDialog, setOpenInviteLinksDialog] = useState(false);
    const handleOpenChange = () => {
        setOpenInviteLinksDialog(!openInviteLinksDialog);
    }
    return (
        <div className="flex items-center justify-between">
            <div className="text-h3 font-semibold">Students List</div>
            <div className="flex items-center gap-4">
                <MyButton onClick={()=>{setOpenInviteLinksDialog(true)}} scale="large" buttonType="secondary">
                    Invite Students
                </MyButton>
                <BulkDialogProvider>
                    <EnrollStudentsButton />
                </BulkDialogProvider>
            </div>
            <InviteLinksDialog currentSession={currentSession} openInviteLinksDialog={openInviteLinksDialog} handleOpenChange={handleOpenChange} />
        </div>
    );
};
