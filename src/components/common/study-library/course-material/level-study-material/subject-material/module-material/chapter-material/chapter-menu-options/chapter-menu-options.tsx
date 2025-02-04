import { MyButton } from "@/components/design-system/button";
import { MyDialog } from "@/components/design-system/dialog";
import { MyDropdown } from "@/components/design-system/dropdown";
import { DotsThree } from "phosphor-react";
import { useState } from "react";
import { dropdownList } from "@/constants/study-library/chapter-menu-options";
import { MoveToDialog } from "./move-dialog";
import { CopyToDialog } from "./copy-dialog";
import { AddChapterForm } from "../add-chapters/add-chapter-form";
import { ChapterWithSlides } from "@/stores/study-library/use-modules-with-chapters-store";

interface ChapterMenuOptionsProps {
    chapter: ChapterWithSlides;
    onDelete: () => void;
    onEdit: (updatedChapter: ChapterWithSlides) => void;
}

export const ChapterMenuOptions = ({ chapter, onDelete, onEdit }: ChapterMenuOptionsProps) => {
    const [openDialog, setOpenDialog] = useState<"copy" | "move" | "delete" | "edit" | null>(null);

    const handleSelect = (value: string) => {
        switch (value) {
            case "view":
                break;
            case "edit":
                setOpenDialog("edit");
                break;
            case "delete":
                onDelete();
                break;
            case "copy":
                setOpenDialog("copy");
                break;
            case "move":
                setOpenDialog("move");
                break;
        }
    };

    const handleEditSuccess = (updatedChapter: ChapterWithSlides) => {
        onEdit(updatedChapter);
        setOpenDialog(null);
    };

    return (
        <>
            <MyDropdown dropdownList={dropdownList} onSelect={handleSelect}>
                <MyButton
                    buttonType="secondary"
                    scale="small"
                    layoutVariant="icon"
                    className="flex items-center justify-center"
                >
                    <DotsThree />
                </MyButton>
            </MyDropdown>

            {/* Edit Dialog */}
            <MyDialog
                heading="Edit Chapter"
                dialogWidth="min-w-[800px]"
                open={openDialog === "edit"}
                onOpenChange={() => setOpenDialog(null)}
            >
                <AddChapterForm
                    mode="edit"
                    initialValues={chapter}
                    onSubmitSuccess={handleEditSuccess}
                />
            </MyDialog>

            {/* Copy Dialog */}
            <CopyToDialog openDialog={openDialog} setOpenDialog={setOpenDialog} />

            {/* Move Dialog */}
            <MoveToDialog openDialog={openDialog} setOpenDialog={setOpenDialog} />
        </>
    );
};
