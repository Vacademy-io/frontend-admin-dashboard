// chapters.tsx
import { EmptyChaptersImage } from "@/assets/svgs";
import { ChapterCard } from "./chapter-card";
export interface ChapterType {
    name: string;
    description: string;
    resourceCount?: {
        ebooks: number;
        videos: number;
    };
}

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
