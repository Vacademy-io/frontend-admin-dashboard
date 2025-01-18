// subject-card.tsx
import { DotsSixVertical } from "@phosphor-icons/react";
import { useState, useEffect } from "react";
import { AddSubjectForm } from "./add-subject-form";
import { MyDialog } from "@/components/design-system/dialog";
import { useRouter } from "@tanstack/react-router";
import { MenuOptions } from "./subject-menu-options";
import { SubjectDefaultImage } from "@/assets/svgs";
import { useFileUpload } from "@/hooks/use-file-upload";

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

    const handleCardClick = (e: React.MouseEvent) => {
        if (
            (e.target as HTMLElement).closest(".menu-options-container") ||
            (e.target as HTMLElement).closest('[role="menu"]') ||
            (e.target as HTMLElement).closest('[role="dialog"]')
        ) {
            return;
        }

        const subjectRoute = subject.name.toLowerCase().replace(/\s+/g, "-");
        const formattedClassName = `${classNumber}-class-study-library`;

        router.navigate({
            to: `/study-library/${formattedClassName}/${subjectRoute}`,
        });
    };

    return (
        <div onClick={handleCardClick} className="cursor-pointer">
            <div className="relative flex size-[300px] flex-col items-center justify-center gap-4 border-neutral-500 bg-neutral-50 p-4 shadow-md">
                <DotsSixVertical className="absolute right-4 top-4 size-6 cursor-pointer" />
                {imageUrl ? (
                    <img
                        src={imageUrl}
                        alt={subject.name}
                        className="h-[200px] w-[200px] rounded-lg object-cover"
                    />
                ) : (
                    <SubjectDefaultImage />
                )}
                <div className="flex items-center justify-between gap-5">
                    <div className="text-h2 font-semibold">{subject.name}</div>
                    <MenuOptions onDelete={onDelete} onEdit={() => setIsEditDialogOpen(true)} />
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
