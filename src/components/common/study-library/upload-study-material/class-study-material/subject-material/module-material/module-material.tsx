// module-material.tsx
import { useEffect, useState } from "react";
import { useNavHeadingStore } from "@/stores/layout-container/useNavHeadingStore";
import { CaretLeft } from "@phosphor-icons/react";
import { useRouter } from "@tanstack/react-router";
import { ModuleType } from "./add-modules.tsx/modules";
import { formatClassName } from "@/lib/study-library/class-formatter";
import { SessionDropdown } from "@/components/common/session-dropdown";
import { Chapters, ChapterType } from "./chapter-material/chapters";
import { AddChapterButton } from "./chapter-material/add-chapters/add-chapter-button";

interface ModuleMaterialProps {
    classNumber: string | undefined;
    subject: string;
    module: ModuleType;
}

export const ModuleMaterial = ({ classNumber, subject, module }: ModuleMaterialProps) => {
    const router = useRouter();
    const { setNavHeading } = useNavHeadingStore();

    const formattedClass = formatClassName(classNumber);

    const handleBackClick = () => {
        const formattedSubject = subject.toLowerCase().replace(/\s+/g, "-");
        router.navigate({
            to: `/study-library/${formattedClass.toLowerCase()}-class-study-library/${formattedSubject}`,
        });
    };

    const heading = (
        <div className="flex items-center gap-4">
            <CaretLeft onClick={handleBackClick} className="cursor-pointer" />
            <div>{`${formattedClass} Class ${subject}`}</div>
        </div>
    );

    useEffect(() => {
        setNavHeading(heading);
    }, []);

    const [chapters, setChapters] = useState<ChapterType[]>([]);

    const handleAddChapter = (chapter: ChapterType) => {
        const newChapter = {
            ...chapter,
            description: "Click to view and access eBooks and video lectures for this chapter.", // Add default description
            resourceCount: {
                ebooks: 0,
                videos: 0,
            },
        };
        setChapters((prev) => [...prev, newChapter]);
    };

    const handleDeleteChapter = (index: number) => {
        setChapters((prev) => prev.filter((_, i) => i !== index));
    };

    const handleEditChapter = (index: number, updatedChapter: ChapterType) => {
        setChapters((prev) => prev.map((chapter, i) => (i === index ? updatedChapter : chapter)));
    };

    return (
        <div className="flex h-full w-full flex-col gap-12 text-neutral-600">
            <div className="flex items-center justify-between gap-80">
                <div className="flex items-center justify-between gap-80">
                    <div className="flex w-full flex-col gap-2">
                        <div className="text-h3 font-semibold">{module.name}</div>
                        <div className="text-subtitle">{module.description} </div>
                    </div>
                    <AddChapterButton onAddChapter={handleAddChapter} />
                </div>
            </div>
            <SessionDropdown className="text-title font-semibold" />
            {/* Add your module content here */}
            <Chapters
                chapters={chapters}
                onDeleteChapter={handleDeleteChapter}
                onEditChapter={handleEditChapter}
            />
        </div>
    );
};
