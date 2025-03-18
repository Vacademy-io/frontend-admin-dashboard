import { useState } from "react";
import { LearnerEnrollRequestType } from "../-types/request-data";
import { toast } from "sonner";
import { MyButton } from "@/components/design-system/button";
import { Copy } from "phosphor-react";
import { MyDialog } from "@/components/design-system/dialog";
import { EnrollManuallyButton } from "@/components/common/students/enroll-manually/enroll-manually-button";

export const RequestCard = ({ obj }: { obj: LearnerEnrollRequestType }) => {
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
    return (
        <>
            <div className="flex w-full flex-col gap-6 rounded-lg border border-neutral-300 p-6">
                <div className="flex flex-col gap-4">
                    <div className="flex justify-between">
                        <div className="flex flex-col">
                            <div className="text-subtitle font-semibold">
                                {obj.learner.full_name}
                            </div>
                            <div className="flex items-center gap-10">
                                <div className="text-body">
                                    <span className="font-semibold">Invite Link name</span>:{" "}
                                    {obj.invite_link_name}
                                </div>
                                <div className="flex items-center gap-2 text-body">
                                    <p className="font-semibold">Invite Link: </p>
                                    <p className="underline">{obj.invite_link}</p>
                                    <div className="flex items-center gap-2">
                                        <MyButton
                                            buttonType="secondary"
                                            layoutVariant="icon"
                                            scale="medium"
                                            onClick={() => handleCopyClick(obj.invite_link)}
                                        >
                                            <Copy />
                                        </MyButton>
                                        {copySuccess == obj.invite_link && (
                                            <span className="text-caption text-primary-500">
                                                Copied!
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="text-neutral-500">{obj.request_time}</div>
                    </div>
                    <div className="grid grid-cols-4 gap-x-20 gap-y-4">
                        <p>Batch: 10th Premium Pro Group</p>
                        <p>Session: 2024-2025</p>
                        <p>Email: {obj.learner.email}</p>
                        <p>Mobile Number: {obj.learner.mobile_number}</p>
                        <p>Gender: {obj.learner.gender}</p>
                        <p>School: {obj.learner.linked_institute_name}</p>
                        <p>Address Line: {obj.learner.address_line}</p>
                        <p>City/Village: {obj.learner.city}</p>
                        <p>State: {obj.learner.region}</p>
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
                            initialValues={obj.learner}
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
                Are you are you want to delete the enroll request of {obj.learner.full_name}?
            </MyDialog>
        </>
    );
};
