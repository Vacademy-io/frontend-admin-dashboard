// chapters.tsx
import { EmptyChaptersImage } from "@/assets/svgs";
import { ChapterCard } from "./chapter-card";
import { DashboardLoader } from "@/components/core/dashboard-loader";
import { Sortable, SortableItem } from "@/components/ui/sortable";
import { useFieldArray, UseFormReturn } from "react-hook-form";
import { FormValues } from "../chapter-material";
import { ChapterWithSlides } from "@/stores/study-library/use-modules-with-chapters-store";

interface ChaptersProps {
    chapters?: ChapterWithSlides[];
    onDeleteChapter?: (index: number) => void;
    onEditChapter?: (index: number, updatedChapter: ChapterWithSlides) => void;
    onOrderChange?: (
        updatedOrder: {
            chapter_id: string;
            chapter_name: string;
            package_session_id: string;
            chapter_order: number;
        }[],
    ) => void;
    isLoading?: boolean;
    form: UseFormReturn<FormValues>;
}

export const Chapters = ({
    onDeleteChapter = () => {},
    onEditChapter = () => {},
    onOrderChange,
    isLoading = false,
    form, // Add form prop
}: ChaptersProps) => {
    // const [chapters, setChapters] = useState(initialChapters);

    const { fields, move } = useFieldArray({
        control: form.control,
        name: "chapters",
    });

    const handleMove = ({ activeIndex, overIndex }: { activeIndex: number; overIndex: number }) => {
        move(activeIndex, overIndex);

        // Create order payload after move
        const updatedFields = form.getValues("chapters");

        // Create order payload with the updated order
        const orderPayload = updatedFields.map((chapter, index) => ({
            chapter_id: chapter.chapter.id,
            chapter_name: chapter.chapter.chapter_name,
            package_session_id: "",
            chapter_order: index,
        }));
        console.log("order payload: ", orderPayload);

        // Call onOrderChange with the updated order
        onOrderChange?.(orderPayload);
    };

    if (isLoading) {
        return <DashboardLoader />;
    }

    return (
        <div className="h-full w-full">
            {!fields.length && (
                <div className="flex w-full flex-col items-center justify-center gap-8 rounded-lg py-10">
                    <EmptyChaptersImage />
                    <div>No Modules have been added yet.</div>
                </div>
            )}
            <Sortable value={fields} onMove={handleMove} fast={false}>
                <div className="flex flex-col gap-6">
                    {fields.map((chapter, index) => (
                        <SortableItem key={chapter.id} value={chapter.id} asChild>
                            <div className="cursor-grab active:cursor-grabbing">
                                <ChapterCard
                                    chapter={chapter}
                                    onDelete={() => onDeleteChapter(index)}
                                    onEdit={(updatedChapter) =>
                                        onEditChapter(index, updatedChapter)
                                    }
                                />
                            </div>
                        </SortableItem>
                    ))}
                </div>
            </Sortable>
        </div>
    );
};
