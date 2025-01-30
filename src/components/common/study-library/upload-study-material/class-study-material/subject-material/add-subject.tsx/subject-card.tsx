// subject-card.tsx
import { DotsSixVertical } from "@phosphor-icons/react";
import { useState, useEffect } from "react";
import { AddSubjectForm } from "./add-subject-form";
import { MyDialog } from "@/components/design-system/dialog";
import { useRouter } from "@tanstack/react-router";
import { MenuOptions } from "./subject-menu-options";
import { SubjectDefaultImage } from "@/assets/svgs";
import { useFileUpload } from "@/hooks/use-file-upload";
import { useSidebar } from "@/components/ui/sidebar";
import { SortableDragHandle } from "@/components/ui/sortable";

export interface Subject {
    id: string;
    name: string;
    code: string | null;
    credit: number | null;
    imageId: string | null;
    createdAt: string | null;
    updatedAt: string | null;
}

interface SubjectCardProps {
    subject: Subject;
    onDelete: () => void;
    onEdit: (updatedSubject: Subject) => void;
    classNumber: string;
}

export const SubjectCard = ({ subject, onDelete, onEdit, classNumber }: SubjectCardProps) => {
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [imageUrl, setImageUrl] = useState<string | undefined>(undefined);
    const { getPublicUrl } = useFileUpload();
    const router = useRouter();
    const { open } = useSidebar();

    const handleCardClick = (e: React.MouseEvent) => {
        if (
            e.target instanceof Element &&
            (e.target.closest(".menu-options-container") ||
                e.target.closest(".drag-handle-container") ||
                e.target.closest('[role="menu"]') ||
                e.target.closest('[role="dialog"]'))
        ) {
            return;
        }

        const subjectRoute = subject.name.toLowerCase().replace(/\s+/g, "-");
        const formattedClassName = `${classNumber}-class-study-library`;

        router.navigate({
            to: `/study-library/${formattedClassName}/${subjectRoute}`,
            search: { subjectId: subject.id }, // Add subject ID to the URL search params
        });
    };

    const handleMenuOptionClick = (e: React.MouseEvent) => {
        e.stopPropagation();
    };
    useEffect(() => {
        const fetchImageUrl = async () => {
            if (subject.imageId) {
                try {
                    const url = await getPublicUrl(subject.imageId);
                    setImageUrl(url);
                } catch (error) {
                    console.error("Failed to fetch image URL:", error);
                }
            }
        };

        fetchImageUrl();
    }, [subject.imageId]);

    return (
        <div className="relative">
            <div
                onClick={handleCardClick}
                className={`relative flex ${
                    open ? "size-[260px]" : "size-[300px]"
                } cursor-pointer flex-col items-center justify-center gap-4 border-neutral-500 bg-neutral-50 p-4 shadow-md`}
            >
                <div className="drag-handle-container absolute right-4 top-4 z-10">
                    <SortableDragHandle
                        variant="ghost"
                        size="icon"
                        className="cursor-grab hover:bg-neutral-100"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <DotsSixVertical className="size-6" />
                    </SortableDragHandle>
                </div>
                {imageUrl ? (
                    <img
                        src={imageUrl}
                        alt={subject.name}
                        className={`${
                            open ? "h-[150px] w-[150px]" : "h-[200px] w-[200px]"
                        } rounded-lg object-cover`}
                    />
                ) : (
                    <SubjectDefaultImage
                        className={`${open ? "h-[150px] w-[150px]" : "h-[200px] w-[200px]"}`}
                    />
                )}
                <div className="flex items-center justify-between gap-5">
                    <div className="text-h2 font-semibold">{subject.name}</div>
                    <div onClick={handleMenuOptionClick} className="menu-options-container">
                        <MenuOptions onDelete={onDelete} onEdit={() => setIsEditDialogOpen(true)} />
                    </div>
                </div>
            </div>

            <MyDialog
                trigger={<></>}
                heading="Edit Subject"
                dialogWidth="w-[400px]"
                open={isEditDialogOpen}
                onOpenChange={setIsEditDialogOpen}
            >
                <AddSubjectForm
                    initialValues={subject}
                    onSubmitSuccess={(updatedSubject) => {
                        onEdit(updatedSubject);
                        setIsEditDialogOpen(false);
                    }}
                />
            </MyDialog>
        </div>
    );
};
