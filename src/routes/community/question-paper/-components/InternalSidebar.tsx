import { MyButton } from "@/components/design-system/button";
import { getTageByQuestionPaperId } from "../-service/utils";
import { useEffect, useState } from "react";
import { QuestionPaperData } from "@/types/community/filters/types";

export function InternalSidebar({ id }: { id: string }) {
    const [data, setData] = useState<QuestionPaperData>();
    const fetch = async () => {
        const responseData = await getTageByQuestionPaperId(id);
        setData(responseData);
    };
    useEffect(() => {
        fetch();
    }, []);
    return (
        <div className="sticky top-[72px] flex max-h-[calc(100vh-72px)] w-[300px] flex-col justify-between border-r p-4">
            <div>
                <div className="size-full w-full rounded-md"></div>
                <div className="flex flex-col gap-2">
                    <div className="text-title font-bold">{data?.questionPaper.title}</div>
                    <div className="flex flex-row flex-wrap gap-3">
                        {data?.tags.map((tag) => (
                            <div key={tag.tagId} className="w-fit rounded-md border p-2">
                                {tag.tagName}
                            </div>
                        ))}
                    </div>
                </div>
                <div className="">
                    <div></div>
                </div>
            </div>
            <div className="flex flex-col gap-4">
                <MyButton buttonType="secondary">Share</MyButton>
                <MyButton buttonType="primary">Add to Assessment</MyButton>
            </div>
        </div>
    );
}
