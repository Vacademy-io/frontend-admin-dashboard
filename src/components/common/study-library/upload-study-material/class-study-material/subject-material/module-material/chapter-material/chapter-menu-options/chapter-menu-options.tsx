import { MyButton } from "@/components/design-system/button";
import { MyDropdown } from "@/components/design-system/dropdown";
import { DotsThree } from "phosphor-react";
import { useState } from "react";
import { dropdownList } from "@/constants/study-library/chapter-menu-options";
import { MoveToDialog } from "./move-dialog";
import { CopyToDialog } from "./copy-dialog";

export const ChapterMenuOptions = ({ onDelete }: { onDelete: () => void }) => {
    const [openDialog, setOpenDialog] = useState<"copy" | "move" | "delete" | null>(null);

    const handleSelect = (value: string) => {
        switch (value) {
            case "view":
                break;
            case "edit":
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

            {/* Copy Dialog */}
            <CopyToDialog openDialog={openDialog} setOpenDialog={setOpenDialog} />

            {/* Move Dialog */}
            <MoveToDialog openDialog={openDialog} setOpenDialog={setOpenDialog} />
        </>
    );
};
