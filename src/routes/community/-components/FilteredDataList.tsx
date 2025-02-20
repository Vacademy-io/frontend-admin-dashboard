import { DataCard } from "./DataCard";
// import { useMutation } from "@tanstack/react-query";
import { getQuestionPaperDataWithFilters } from "../-services/utils";
// import { FilterOption } from "@/types/assessments/question-paper-filter";
import { useState, useEffect } from "react";
import { QuestionPaperInterface } from "@/types/assessments/question-paper-template";

export function FilteredDataList() {
    const [questionPaperList, setQuestionPaperList] = useState<QuestionPaperInterface[]>([]);
    // const getFilteredData = useMutation({
    //     mutationFn: ({
    //         pageNo,
    //         pageSize,
    //         data,
    //     }: {
    //         pageNo: number;
    //         pageSize: number;
    //         data: Record<string, FilterOption[]>;
    //     }) => getQuestionPaperDataWithFilters(pageNo, pageSize, data),
    //     onSuccess: (data) => {
    //         setQuestionPaperList(data.content);
    //     },
    //     onError: (error: unknown) => {
    //         throw error;
    //     },
    // });

    useEffect(() => {
        // setIsLoading(true);
        const timeoutId = setTimeout(() => {
            getQuestionPaperDataWithFilters(0, 10, {})
                .then((data) => {
                    setQuestionPaperList(data.content);
                    // setIsLoading(false);
                })
                .catch((error) => {
                    console.error(error);
                    // setIsLoading(false);
                });
        }, 0);

        return () => {
            clearTimeout(timeoutId);
        };
    }, []);
    return (
        <div className="mx-10 grid grid-cols-4 gap-6">
            {questionPaperList?.map((question, idx) => (
                <DataCard key={idx} title={question.title} />
            ))}
        </div>
    );
}
