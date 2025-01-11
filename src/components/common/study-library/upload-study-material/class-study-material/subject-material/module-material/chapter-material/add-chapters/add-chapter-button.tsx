import { MyButton } from "@/components/design-system/button";
import { MyDialog } from "@/components/design-system/dialog";
import { Plus } from "@phosphor-icons/react";
import { useState } from "react";
import { ChapterType } from "../chapters";
import { AddChapterForm } from "./add-chapter-form";

interface AddChapterButtonProps {
    onAddChapter: (chapter: ChapterType) => void;
}

export const AddChapterButton = ({ onAddChapter }: AddChapterButtonProps) => {
    const [openDialog, setOpenDialog] = useState(false);

    const handleOpenChange = () => {
        setOpenDialog(!openDialog);
    };

    const triggerButton = (
        <MyButton scale="large">
            <Plus /> Add Chapter
        </MyButton>
    );

    const handleSubmitSuccess = (chapter: ChapterType) => {
        onAddChapter(chapter);
        handleOpenChange();
    };

    return (
        <MyDialog
            trigger={triggerButton}
            heading="Add Chapter"
            dialogWidth="min-w-[800px]"
            open={openDialog}
            onOpenChange={handleOpenChange}
        >
            <AddChapterForm onSubmitSuccess={handleSubmitSuccess} />
        </MyDialog>
    );
};
