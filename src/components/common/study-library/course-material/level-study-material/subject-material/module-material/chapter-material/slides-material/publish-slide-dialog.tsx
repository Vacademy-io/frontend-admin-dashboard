// publish-dialog.tsx
import { MyButton } from "@/components/design-system/button";
import { MyDialog } from "@/components/design-system/dialog";
import { useContentStore } from "@/stores/study-library/chapter-sidebar-store";
import { Dispatch, SetStateAction } from "react";

interface PublishUnpublishDialogProps {
    isOpen: boolean;
    setIsOpen: Dispatch<SetStateAction<boolean>>;
    handlePublishUnpublishSlide: (setIsOpen: Dispatch<SetStateAction<boolean>>) => void;
}

export const PublishUnpublishDialog = ({
    isOpen,
    setIsOpen,
    handlePublishUnpublishSlide,
}: PublishUnpublishDialogProps) => {
    const { activeItem } = useContentStore();

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

    return (
        <MyDialog
            heading="Publish Slide"
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
                            handlePublishUnpublishSlide(setIsOpen);
                        }}
                    >
                        Yes, I&apos;m sure
                    </MyButton>
                </div>
            </div>
        </MyDialog>
    );
};
