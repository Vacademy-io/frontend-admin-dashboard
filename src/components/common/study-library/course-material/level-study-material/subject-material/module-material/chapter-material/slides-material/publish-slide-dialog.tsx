// publish-dialog.tsx
import { MyButton } from "@/components/design-system/button";
import { MyDialog } from "@/components/design-system/dialog";
import { useContentStore } from "@/stores/study-library/chapter-sidebar-store";
import { Dispatch, SetStateAction, useState } from "react";

interface PublishUnpublishDialogProps {
    isOpen: boolean;
    setIsOpen: Dispatch<SetStateAction<boolean>>;
    handlePublishUnpublishSlide: (
        setIsOpen: Dispatch<SetStateAction<boolean>>,
        notify: boolean,
    ) => void;
}
interface NotifyDialogProps {
    openNotifyDialog: boolean;
    setOpenNotifyDialog: Dispatch<SetStateAction<boolean>>;
    handleNotify: (notify: boolean) => void;
}

const NotifyDialog = ({
    openNotifyDialog,
    setOpenNotifyDialog,
    handleNotify,
}: NotifyDialogProps) => {
    return (
        <MyDialog
            heading="Notify"
            dialogWidth="w-[400px]"
            open={openNotifyDialog}
            onOpenChange={setOpenNotifyDialog}
        >
            <div className="flex w-full flex-col gap-6">
                <p>Do you want to send the notification to students about this slide?</p>
                <div className="flex justify-end gap-4">
                    <MyButton
                        buttonType="secondary"
                        onClick={() => {
                            handleNotify(false);
                        }}
                    >
                        No
                    </MyButton>
                    <MyButton
                        buttonType="primary"
                        onClick={() => {
                            handleNotify(true);
                        }}
                    >
                        Yes
                    </MyButton>
                </div>
            </div>
        </MyDialog>
    );
};

export const PublishUnpublishDialog = ({
    isOpen,
    setIsOpen,
    handlePublishUnpublishSlide,
}: PublishUnpublishDialogProps) => {
    const { activeItem } = useContentStore();
    const [notify, setNotify] = useState(false);
    const [openNotifyDialog, setOpenNotifyDialog] = useState(false);

    const publishTrigger = (
        <MyButton buttonType="primary" scale="medium" layoutVariant="default">
            Publish
        </MyButton>
    );

    const unpublishTrigger = (
        <MyButton buttonType="secondary" scale="medium" layoutVariant="default">
            Unpublish
        </MyButton>
    );

    const trigger = activeItem?.status == "PUBLISHED" ? unpublishTrigger : publishTrigger;

    const handleNotify = (notify: boolean) => {
        setNotify(notify);
        setOpenNotifyDialog(false);
        setIsOpen(false);
        handlePublishUnpublishSlide(setIsOpen, notify);
    };

    return (
        <MyDialog
            heading={`${trigger == unpublishTrigger ? "Unpublish" : "Publish"} Slide`}
            dialogWidth="w-[400px]"
            open={isOpen}
            onOpenChange={setIsOpen}
            trigger={trigger}
        >
            <div className="flex w-full flex-col gap-6">
                <p>
                    Are you sure you want to {trigger == unpublishTrigger ? "unpublish" : "publish"}{" "}
                    this slide?
                </p>
                <div className="flex justify-end gap-4">
                    <MyButton buttonType="secondary" onClick={() => setIsOpen(false)}>
                        Cancel
                    </MyButton>

                    <MyButton
                        buttonType="primary"
                        onClick={() => {
                            if (trigger == unpublishTrigger) {
                                handlePublishUnpublishSlide(setIsOpen, notify);
                            } else {
                                setOpenNotifyDialog(true);
                            }
                        }}
                    >
                        Yes, I&apos;m sure
                    </MyButton>

                    <NotifyDialog
                        openNotifyDialog={openNotifyDialog}
                        setOpenNotifyDialog={setOpenNotifyDialog}
                        handleNotify={handleNotify}
                    />
                </div>
            </div>
        </MyDialog>
    );
};
