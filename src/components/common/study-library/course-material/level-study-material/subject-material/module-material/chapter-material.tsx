// module-material.tsx
import { useEffect, useState } from "react";
import { SessionDropdown } from "@/components/common/session-dropdown";
import { AddChapterButton } from "./chapter-material/add-chapters/add-chapter-button";
import { useForm } from "react-hook-form";
import { ChapterWithSlides } from "@/stores/study-library/use-modules-with-chapters-store";
import { getModuleById } from "@/utils/helpers/study-library-helpers.ts/get-list-from-stores/getModulesWithChaptersByModuleId";
import { Chapters } from "./chapter-material/chapters";
import { getChaptersByModuleId } from "@/utils/helpers/study-library-helpers.ts/get-list-from-stores/getChaptersByModuleId";

export interface FormValues {
    chapters: ChapterWithSlides[];
}

export const ChapterMaterial = ({ currentModuleId }: { currentModuleId: string }) => {
    const [isChapterLoading, setIsChapterLoading] = useState(true);
    const moduleWithChapters = getModuleById(currentModuleId);
    const existingChapters = getChaptersByModuleId(currentModuleId) || [];

    const form = useForm<FormValues>({
        defaultValues: {
            chapters: existingChapters,
        },
    });

    const handleAddChapter = (chapter: ChapterWithSlides) => {
        const newChapter = {
            ...chapter,
            description: "Click to view and access eBooks and video lectures for this chapter.",
            resourceCount: {
                ebooks: 0,
                videos: 0,
            },
        };
        form.setValue("chapters", [...form.getValues("chapters"), newChapter]);
    };

    const handleDeleteChapter = (index: number) => {
        const currentChapters = form.getValues("chapters");
        form.setValue(
            "chapters",
            currentChapters.filter((_, i) => i !== index),
        );
    };

    const handleEditChapter = (index: number, updatedChapter: ChapterWithSlides) => {
        const currentChapters = form.getValues("chapters");
        form.setValue(
            "chapters",
            currentChapters.map((chapter, i) => (i === index ? updatedChapter : chapter)),
        );
    };

    useEffect(() => {
        if (existingChapters) {
            form.reset({ chapters: existingChapters });
            setIsChapterLoading(false);
        }
    }, [existingChapters, form]);

    return (
        <div className="flex h-full w-full flex-col gap-8 text-neutral-600">
            <div className="flex items-center justify-between gap-80">
                <div className="flex items-center justify-between gap-80">
                    <div className="flex w-full flex-col gap-2">
                        <p className="text-h3 font-semibold">
                            {moduleWithChapters?.module.module_name}
                        </p>
                        <p className="text-subtitle">
                            Explore and manage chapters for 10th Class Physics. Click on a chapter
                            to view and access eBooks, video lectures, and study resources, or add
                            new materials to enhance your learning experience.
                        </p>
                    </div>
                    <AddChapterButton onAddChapter={handleAddChapter} />
                </div>
            </div>
            <SessionDropdown className="text-title font-semibold" />
            {/* Add your module content here */}
            <Chapters
                form={form}
                chapters={form.watch("chapters")}
                onDeleteChapter={handleDeleteChapter}
                onEditChapter={handleEditChapter}
                isLoading={isChapterLoading}
            />
        </div>
    );
};
