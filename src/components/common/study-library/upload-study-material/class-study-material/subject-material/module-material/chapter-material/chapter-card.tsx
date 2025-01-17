import { ChapterType } from "./chapters";
import { MyDialog } from "@/components/design-system/dialog";
import { DotsSixVertical, FileDoc, FilePdf, Video } from "@phosphor-icons/react";
import { useNavigate, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { ChapterMenuOptions } from "./chapter-menu-options/chapter-menu-options";

interface ChapterCardProps {
    chapter: ChapterType;
    onDelete: () => void;
    onEdit: (updatedChapter: ChapterType) => void;
}

export const ChapterCard = ({ chapter, onDelete }: ChapterCardProps) => {
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
                        <ChapterMenuOptions onDelete={onDelete} />
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
