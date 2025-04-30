// batch-section.tsx
import { MyButton } from "@/components/design-system/button";
import { MyDialog } from "@/components/design-system/dialog";
import {
    BatchType,
    batchWithStudentDetails,
} from "@/routes/students/manage-batches/-types/manage-batches-types";
import { Check, Copy, Plus, TrashSimple } from "phosphor-react";
import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useGetStudentBatch } from "@/routes/students/students-list/-hooks/useGetStudentBatch";
import { EnrollManuallyButton } from "@/components/common/students/enroll-manually/enroll-manually-button";
import { useDeleteBatches } from "@/routes/students/manage-batches/-services/delete-batches";
import { toast } from "sonner";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger  } from "@/components/ui/tooltip";
import createInviteLink from "../../invite/-utils/createInviteLink";
interface batchCardProps {
    batch: BatchType;
}

const BatchCard = ({ batch }: batchCardProps) => {
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const navigate = useNavigate();
    const { levelName, packageName } = useGetStudentBatch(batch.package_session_id);
    const deleteBatchesMutation = useDeleteBatches();
    const [copySuccess, setCopySuccess] = useState<string | null>(null);

    const handleViewBatch = () => {
        // Navigate to student list with this batch pre-selected
        const batchName = `${levelName} ${packageName}`;
        console.log(
            "Navigating with batch:",
            batchName,
            "package_session_id:",
            batch.package_session_id,
        );

        navigate({
            to: "/students/students-list",
            search: {
                batch: batchName,
                package_session_id: batch.package_session_id,
            },
        });
    };

    const handleDeleteBatch = () => {
        deleteBatchesMutation.mutate(
            { packageSessionIds: [batch.package_session_id] },
            {
                onSuccess: () => {
                    toast.success("Batch deleted successfully");
                    setOpenDeleteDialog(false);
                },
                onError: () => {
                    toast.error("Failed to delete batch");
                },
            },
        );
    };

    const handleCopyClick = (link: string) => {
        navigator.clipboard
            .writeText(link)
            .then(() => {
                setCopySuccess(link);
                setTimeout(() => {
                    setCopySuccess(null);
                }, 2000);
            })
            .catch((err) => {
                console.log("Failed to copy link: ", err);
                toast.error("Copy failed");
            });
    };

    return (
        <>
            <div className="flex flex-col gap-8 rounded-lg border border-neutral-300 bg-neutral-50 p-6">
                <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                        <p className="text-title font-semibold">{batch.batch_name}</p>

                        <TrashSimple
                            className="cursor-pointer text-danger-400"
                            onClick={() => setOpenDeleteDialog(true)}
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <p className="text-h1 font-semibold text-primary-500">
                            {batch.count_students}
                        </p>
                        <p className="text-subtitle font-semibold">students</p>
                    </div>
                    <div className="flex gap-2 text-body items-center">
                        <p>Invite: </p>
                        <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger>
                                                <a
                                                    href={createInviteLink(batch.invite_code)}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-body underline hover:text-primary-500"
                                                >
                                                    {`${createInviteLink(batch.invite_code).slice(
                                                        0,
                                                        32,
                                                    )}..`}
                                                </a>
                                            </TooltipTrigger>
                                            <TooltipContent className="cursor-pointer border border-neutral-300 bg-neutral-50 text-neutral-600 hover:text-primary-500">
                                                <a
                                                    href={createInviteLink(batch.invite_code)}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                >
                                                    {createInviteLink(batch.invite_code)}
                                                </a>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                    <div className="flex items-center gap-2">
                                        <MyButton
                                            buttonType="secondary"
                                            scale="medium"
                                            layoutVariant="icon"
                                            onClick={() =>
                                                handleCopyClick(createInviteLink(batch.invite_code))
                                            }
                                        >
                                            <Copy />
                                        </MyButton>
                                        {copySuccess == createInviteLink(batch.invite_code) && (
                                            <div className=" text-primary-500">
                                                <Check />
                                            </div>
                                        )}
                                    </div>
                    </div>
                </div>
                <div className="flex items-center justify-between">
                    <EnrollManuallyButton
                        triggerButton={
                            <MyButton
                                buttonType="text"
                                layoutVariant="default"
                                scale="medium"
                                className="text-primary-500"
                            >
                                {" "}
                                <Plus /> Enroll Student
                            </MyButton>
                        }
                    />
                    <MyButton
                        buttonType="secondary"
                        layoutVariant="default"
                        scale="medium"
                        onClick={handleViewBatch}
                    >
                        View Batch
                    </MyButton>
                </div>
            </div>
            <MyDialog
                heading="Delete Batch"
                open={openDeleteDialog}
                onOpenChange={() => setOpenDeleteDialog(!openDeleteDialog)}
                footer={
                    <div className="flex w-full items-center justify-between py-2 text-neutral-600">
                        <MyButton buttonType="secondary" onClick={() => setOpenDeleteDialog(false)}>
                            Cancel
                        </MyButton>
                        <MyButton buttonType="primary" onClick={handleDeleteBatch}>
                            Yes, I am sure
                        </MyButton>
                    </div>
                }
            >
                Are you sure you want to delete {batch.batch_name}?
            </MyDialog>
        </>
    );
};

export const BatchSection = ({ batch }: { batch: batchWithStudentDetails }) => {
    return (
        <>
            {batch.batches.length > 0 ? (
                <div className="flex flex-col gap-4">
                    <p className="text-title font-semibold">{batch.package_dto.package_name}</p>
                    <div className="grid grid-cols-3 gap-6">
                        {batch.batches.map((batchLevel, index) => (
                            <BatchCard batch={batchLevel} key={index} />
                        ))}
                    </div>
                </div>
            ) : (
                <div className="flex flex-col gap-4">
                    <p className="text-title font-semibold">{batch.package_dto.package_name}</p>
                    <p className="text-neutral-400">No batches found</p>
                </div>
            )}
        </>
    );
};
