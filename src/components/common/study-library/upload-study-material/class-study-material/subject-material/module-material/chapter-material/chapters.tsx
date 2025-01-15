// chapters.tsx
import { EmptyChaptersImage } from "@/assets/svgs";
import { MyButton } from "@/components/design-system/button";
import { MyDialog } from "@/components/design-system/dialog";
import { MyDropdown } from "@/components/design-system/dropdown";
import { DotsSixVertical, DotsThree, FileDoc, FilePdf, Video } from "@phosphor-icons/react";
import { useNavigate, useRouter } from "@tanstack/react-router";
import { useState } from "react";

export interface ChapterType {
    name: string;
    description: string;
    resourceCount?: {
        ebooks: number;
        videos: number;
    };
}

interface MenuOptionsProps {
    onDelete: () => void;
    onEdit: () => void;
}

const MenuOptions = ({ onDelete, onEdit }: MenuOptionsProps) => {
    const DropdownList = ["Edit Chapter", "Delete Chapter"];

    const handleMenuOptionsChange = (value: string) => {
        if (value === "Delete Chapter") {
            onDelete();
        } else if (value === "Edit Chapter") {
            onEdit();
        }
    };

    return (
        <div className="menu-options-container">
            <MyDropdown dropdownList={DropdownList} onSelect={handleMenuOptionsChange}>
                <MyButton
                    buttonType="secondary"
                    scale="small"
                    layoutVariant="icon"
                    className="flex items-center justify-center"
                >
                    <DotsThree />
                </MyButton>
            </MyDropdown>
        </div>
    );
};

interface ChapterCardProps {
    chapter: ChapterType;
    onDelete: () => void;
    onEdit: (updatedChapter: ChapterType) => void;
}

const ChapterCard = ({ chapter, onDelete }: ChapterCardProps) => {
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

    const router = useRouter();
    const navigate = useNavigate();
    const handleCardClick = (e: React.MouseEvent) => {
        if (
            (e.target as HTMLElement).closest(".menu-options-container") ||
            (e.target as HTMLElement).closest('[role="menu"]') ||
            (e.target as HTMLElement).closest('[role="dialog"]')
        ) {
            return;
        }

        const currentPath = router.state.location.pathname;
        const formatterChapterName = chapter.name.replace(/\s+/g, "-");

        navigate({ to: `${currentPath}/${formatterChapterName}` });
    };

    return (
        <div onClick={handleCardClick} className="w-full cursor-pointer">
            <div className="flex w-full flex-col justify-center gap-4 rounded-lg border border-neutral-300 bg-neutral-50 p-6 shadow-md">
                <div className="flex items-center justify-between text-subtitle font-semibold">
                    <div>{chapter.name}</div>
                    <div className="flex items-center gap-6">
                        <MenuOptions onDelete={onDelete} onEdit={() => setIsEditDialogOpen(true)} />
                        <DotsSixVertical />
                    </div>
                </div>
                <div className="flex gap-4 text-title font-semibold">
                    <div className="flex items-center gap-2">
                        <FilePdf />
                        <div className="text-primary-500">{chapter.resourceCount?.ebooks || 0}</div>
                    </div>
                    <div className="flex items-center gap-2">
                        <FileDoc />
                        <div className="text-primary-500">{chapter.resourceCount?.videos || 0}</div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Video />
                        <div className="text-primary-500">{chapter.resourceCount?.videos || 0}</div>
                    </div>
                </div>
            </div>

            <MyDialog
                trigger={<></>}
                heading="Edit Chapter"
                dialogWidth="w-[400px]"
                open={isEditDialogOpen}
                onOpenChange={setIsEditDialogOpen}
            >
                {/* Add ChapterForm component here later */}
                Edit Chapter
            </MyDialog>
        </div>
    );
};

interface ChaptersProps {
    chapters?: ChapterType[];
    onDeleteChapter?: (index: number) => void;
    onEditChapter?: (index: number, updatedChapter: ChapterType) => void;
}

export const Chapters = ({
    chapters = [],
    onDeleteChapter = () => {},
    onEditChapter = () => {},
}: ChaptersProps) => {
    return (
        <div className="h-full w-full">
            {!chapters.length && (
                <div className="flex w-full flex-col items-center justify-center gap-8 rounded-lg py-10">
                    <EmptyChaptersImage />
                    <div>No Modules have been added yet.</div>
                </div>
            )}
            <div className="flex flex-col gap-6">
                {chapters.map((chapter, index) => (
                    <ChapterCard
                        key={index}
                        chapter={chapter}
                        onDelete={() => onDeleteChapter(index)}
                        onEdit={(updatedChapter) => onEditChapter(index, updatedChapter)}
                    />
                ))}
            </div>
        </div>
    );
};
