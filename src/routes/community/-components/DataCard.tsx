// import { QuestionEntityData, QuestionPaperEntityData } from "@/types/community/filters/types";
interface DataCardProps {
    // data: QuestionEntityData | QuestionPaperEntityData;
    title?: string;
}

export function DataCard({ title }: DataCardProps) {
    return (
        <div className="flex flex-col gap-4 rounded-lg border p-4 shadow-md">
            <div className="h-[214px] w-full rounded-md border">
                <img className="size-full" src="" alt="" />
            </div>
            <div className="flex flex-col gap-8">
                <div className="text-caption font-semibold">{title}</div>
                <div className="text-subtitle"></div>
                <div></div>
            </div>
        </div>
    );
}
