import { DataCard } from "./DataCard";
// import { useMutation } from "@tanstack/react-query";
// import { getQuestionPaperDataWithFilters } from "../-services/utils";
// import { FilterOption } from "@/types/assessments/question-paper-filter";
// import { useState } from "react";

export function FilteredDataList() {
    // const [questionPaperList, setQuestionPaperList] = useState(null);

    // const getFilteredData = useMutation({
    //     mutationFn: ({
    //         pageNo,
    //         pageSize,
    //         data,
    //     }: {
    //         pageNo: number;
    //         pageSize: number;
    //         instituteId: string;
    //         data: Record<string, FilterOption[]>;
    //     }) => getQuestionPaperDataWithFilters(pageNo, pageSize, data),
    //     onSuccess: (data) => {
    //         setQuestionPaperList(data);
    //     },
    //     onError: (error: unknown) => {
    //         throw error;
    //     },
    // });

    // useEffect(() => {
    //     setIsLoading(true);
    //     const timeoutId = setTimeout(() => {
    //         getQuestionPaperDataWithFilters(pageNo, 10, INSTITUTE_ID, {
    //             ...selectedQuestionPaperFilters,
    //             statuses: [{ id: "ACTIVE", name: "ACTIVE" }],
    //         })
    //             .then((data) => {
    //                 setQuestionPaperList(data);
    //                 setIsLoading(false);
    //             })
    //             .catch((error) => {
    //                 console.error(error);
    //                 setIsLoading(false);
    //             });
    //     }, 0);

    //     return () => {
    //         clearTimeout(timeoutId);
    //     };
    // }, []);
    return (
        <div className="mx-10 grid grid-cols-4 gap-6">
            <DataCard />
            <DataCard />
            <DataCard />
            <DataCard />
            <DataCard />
            <DataCard />
        </div>
    );
}
