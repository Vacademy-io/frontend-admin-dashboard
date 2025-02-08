import { MyButton } from "@/components/design-system/button";
import { MyDialog } from "@/components/design-system/dialog";
import { useSlides } from "@/hooks/study-library/use-slides";
import { useRouter } from "@tanstack/react-router";
import { Dispatch, SetStateAction } from "react";
import { toast } from "sonner";

interface DeleteProps {
    openDialog: "copy" | "move" | "delete" | null;
    setOpenDialog: Dispatch<SetStateAction<"copy" | "move" | "delete" | null>>;
}

export const DeleteDialog = ({ openDialog, setOpenDialog }: DeleteProps) => {
    const router = useRouter();
    const searchParams = router.state.location.search;
    const chapterId: string = searchParams.chapterId || "";
    const slideId: string = searchParams.slideId || "";
    const { updateSlideStatus } = useSlides(chapterId);

    const handleDeleteSlide = async () => {
        try {
            await updateSlideStatus({
                chapterId: chapterId,
                slideId: slideId,
                status: "DELETED",
            });

            toast.success("Video deleted successfully!");
        } catch (error) {
            toast.error("Failed to delete the video");
        }
    };

    return (
        <MyDialog
            heading="Delete"
            dialogWidth="w-[400px]"
            open={openDialog == "delete"}
            onOpenChange={() => setOpenDialog(null)}
        >
            <div className="flex w-full flex-col gap-6">
                <p>Are you sure you want to delete this?</p>
                <MyButton onClick={handleDeleteSlide}>Delete</MyButton>
            </div>
        </MyDialog>
    );
};
