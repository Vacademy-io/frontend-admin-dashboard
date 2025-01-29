// chapters.tsx
import { EmptyChaptersImage } from "@/assets/svgs";
import { ChapterCard } from "./chapter-card";
import { DashboardLoader } from "@/components/core/dashboard-loader";
import { Sortable, SortableItem } from "@/components/ui/sortable";
import { useFieldArray, UseFormReturn } from "react-hook-form";
import { FormValues } from "../module-material";

export interface ChapterType {
    id: string;
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
    // chapters = [],
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
            chapter_id: chapter.id,
            chapter_name: chapter.name,
            package_session_id: "",
            chapter_order: index,
        }));
        console.log("order payload: ", orderPayload);

        // Call onOrderChange with the updated order
        onOrderChange?.(orderPayload);
    };

    // useEffect(()=>{
    //     setChapters(initialChapters)
    // }, [initialChapters])

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
