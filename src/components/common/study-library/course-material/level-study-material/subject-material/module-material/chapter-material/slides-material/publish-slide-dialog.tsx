// publish-dialog.tsx
import { MyButton } from "@/components/design-system/button";
import { MyDialog } from "@/components/design-system/dialog";
import { TokenKey } from "@/constants/auth/tokens";
import { useSlides } from "@/hooks/study-library/use-slides";
import { getTokenDecodedData, getTokenFromCookie } from "@/lib/auth/sessionUtility";
import { useRouter } from "@tanstack/react-router";
import { Dispatch, SetStateAction } from "react";
import { toast } from "sonner";

interface PublishDialogProps {
    isOpen: boolean;
    setIsOpen: Dispatch<SetStateAction<boolean>>;
}

export const PublishDialog = ({ isOpen, setIsOpen }: PublishDialogProps) => {
    const router = useRouter();
    const { chapterId, slideId } = router.state.location.search;
    const { updateSlideStatus } = useSlides(chapterId || "");
    const accessToken = getTokenFromCookie(TokenKey.accessToken);
    const data = getTokenDecodedData(accessToken);
    const INSTITUTE_ID = data && Object.keys(data.authorities)[0];

    const handlePublish = async () => {
        try {
            await updateSlideStatus({
                chapterId: chapterId || "",
                slideId: slideId || "",
                status: "PUBLISHED",
                instituteId: INSTITUTE_ID || "",
            });
            toast.success("Slide published successfully!");
            setIsOpen(false);
        } catch (error) {
            toast.error("Failed to publish the slide");
        }
    };

    const trigger = (
        <MyButton buttonType="primary" scale="medium" layoutVariant="default">
            Publish
        </MyButton>
    );

    return (
        <MyDialog
            heading="Publish Slide"
            dialogWidth="w-[400px]"
            open={isOpen}
            onOpenChange={setIsOpen}
            trigger={trigger}
        >
            <div className="flex w-full flex-col gap-6">
                <p>Are you sure you want to publish this slide?</p>
                <div className="flex justify-end gap-4">
                    <MyButton buttonType="secondary" onClick={() => setIsOpen(false)}>
                        Cancel
                    </MyButton>
                    <MyButton buttonType="primary" onClick={handlePublish}>
                        Yes, I&apos;m sure
                    </MyButton>
                </div>
            </div>
        </MyDialog>
    );
};
