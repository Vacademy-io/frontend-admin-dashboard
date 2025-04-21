import { useEffect, useState } from "react";
import { toast } from "sonner";
import { MyButton } from "@/components/design-system/button";
import { Copy } from "phosphor-react";
import { MyDialog } from "@/components/design-system/dialog";
import { EnrollManuallyButton } from "@/components/common/students/enroll-manually/enroll-manually-button";
import { ContentType } from "../-types/enroll-request-types";
import createInviteLink from "../../invite/-utils/createInviteLink";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export const RequestCard = ({ obj }: { obj: ContentType }) => {
    const [copySuccess, setCopySuccess] = useState<string | null>(null);
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const handleCopyClick = (link: string) => {
        navigator.clipboard
            .writeText(link)
            .then(() => {
                setCopySuccess(link);
                setTimeout(() => setCopySuccess(null), 2000);
            })
            .catch((err) => {
                console.log("Error copying link: ", err);
                toast.error("Copy failed!");
            });
    };

    const [inviteLink, setInviteLink] = useState("");

    useEffect(() => {
        if (obj.learner_invitation.invite_code) {
            const link = createInviteLink(obj.learner_invitation.invite_code);
            setInviteLink(link);
        } else {
            setInviteLink("");
        }
    }, [obj]);

    return (
        <>
            <div className="flex w-full flex-col gap-6 rounded-lg border border-neutral-300 p-6">
                <div className="flex flex-col gap-4">
                    <div className="flex justify-between">
                        <div className="flex flex-col">
                            <div className="text-subtitle font-semibold">
                                {obj.learner_invitation_response_dto.full_name}
                            </div>
                            <div className="flex items-center gap-10">
                                <div className="text-body">
                                    <span className="font-semibold">Invite Link name</span>:{" "}
                                    {obj.learner_invitation.name}
                                </div>
                                <div className="flex items-center gap-2 text-body">
                                    <p className="text-body font-semibold">Invite Link: </p>
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger>
                                                <a
                                                    href={inviteLink}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-subtitle underline hover:text-primary-500"
                                                >
                                                    {`${inviteLink.slice(0, 40)}..`}
                                                </a>
                                            </TooltipTrigger>
                                            <TooltipContent className="cursor-pointer border border-neutral-300 bg-neutral-50 text-neutral-600 hover:text-primary-500">
                                                <a
                                                    href={inviteLink}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                >
                                                    {inviteLink}
                                                </a>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>

                                    <div className="flex items-center gap-2">
                                        <MyButton
                                            buttonType="secondary"
                                            scale="medium"
                                            layoutVariant="icon"
                                            onClick={() => handleCopyClick(inviteLink)}
                                        >
                                            <Copy />
                                        </MyButton>
                                        {copySuccess == inviteLink && (
                                            <span className="text-caption text-primary-500">
                                                Copied!
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="text-neutral-500">
                            {obj.learner_invitation_response_dto.recorded_on}
                        </div>
                    </div>
                    <div className="grid grid-cols-4 gap-x-20 gap-y-4">
                        <p>Batch:</p>
                        <p>Session: </p>
                        <p>Email: {obj.learner_invitation_response_dto.email}</p>
                        <p>Mobile Number: {obj.learner_invitation_response_dto.contact_number}</p>
                        <p>Gender: </p>
                        <p>School: </p>
                        <p>Address Line: </p>
                        <p>City/Village: </p>
                        <p>State: </p>
                    </div>
                </div>
                <div className="flex w-full items-center justify-end">
                    <div className="flex items-center gap-6">
                        <MyButton
                            buttonType="secondary"
                            scale="medium"
                            onClick={() => setOpenDeleteDialog(true)}
                        >
                            Delete
                        </MyButton>
                        <EnrollManuallyButton
                            triggerButton={
                                <MyButton buttonType="primary" scale="medium">
                                    Accept
                                </MyButton>
                            }
                            // initialValues={obj.learner_invitation_response_dto}
                        />
                    </div>
                </div>
            </div>
            <MyDialog
                heading="Delete Enroll Request"
                open={openDeleteDialog}
                onOpenChange={() => setOpenDeleteDialog(!openDeleteDialog)}
                footer={
                    <div className="flex w-full items-center justify-between py-2">
                        <MyButton buttonType="secondary" onClick={() => setOpenDeleteDialog(false)}>
                            Cancel
                        </MyButton>
                        <MyButton buttonType="primary">Yes, I am sure!</MyButton>
                    </div>
                }
            >
                Are you are you want to delete the enroll request of{" "}
                {obj.learner_invitation_response_dto.full_name}?
            </MyDialog>
        </>
    );
};
