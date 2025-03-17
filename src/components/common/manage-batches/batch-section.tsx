import { MyButton } from "@/components/design-system/button";
import { MyDialog } from "@/components/design-system/dialog";
import { BatchType, batchWithStudentDetails } from "@/types/students/manage-batches-types";
import { Plus, TrashSimple } from "phosphor-react";
import { useState } from "react";

interface batchCardProps {
    batch: BatchType;
}

const BatchCard = ({ batch }: batchCardProps) => {
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
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
                </div>
                <div className="flex items-center justify-between">
                    <MyButton
                        buttonType="text"
                        layoutVariant="default"
                        scale="medium"
                        className="text-primary-500"
                    >
                        {" "}
                        <Plus /> Enroll Student
                    </MyButton>
                    <MyButton buttonType="secondary" layoutVariant="default" scale="medium">
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
                        <MyButton buttonType="primary">Yes, I am sure</MyButton>
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
            {batch.batches.length > 0 && (
                <div className="flex flex-col gap-4">
                    <p className="text-title font-semibold">{batch.package_dto.package_name}</p>
                    <div className="grid grid-cols-3 gap-6">
                        {batch.batches.map((batchLevel, index) => (
                            <BatchCard batch={batchLevel} key={index} />
                        ))}
                    </div>
                </div>
            )}
        </>
    );
};
