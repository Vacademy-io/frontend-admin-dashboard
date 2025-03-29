import { MyButton } from "@/components/design-system/button";
import { MyDialog } from "@/components/design-system/dialog";
import { useState, useEffect } from "react";
import { Row } from "@tanstack/react-table";
import {
    SubjectOverviewColumnType,
    ChapterReport,
    ChapterOverviewColumns,
    CHAPTER_OVERVIEW_WIDTH,
} from "../../-types/types";
import { useMutation } from "@tanstack/react-query";
import { DashboardLoader } from "@/components/core/dashboard-loader";
import { MyTable } from "@/components/design-system/table";
import { fetchChapterWiseProgress } from "../../-services/utils";
import { usePacageDetails } from "../../-store/usePacageDetails";
import dayjs from "dayjs";

export const ViewDetails = ({ row }: { row: Row<SubjectOverviewColumnType> }) => {
    const [viewDetailsState, setViewDetailsState] = useState(false);
    const [chapterReportData, setChapterReportData] = useState<ChapterReport>();
    const { pacageSessionId, course, session, level } = usePacageDetails();
    console.log(row.getValue("module_id"));
    const ChapterWiseMutation = useMutation({
        mutationFn: fetchChapterWiseProgress,
    });
    const { isPending, error } = ChapterWiseMutation;
    const date = new Date().toString();
    const currDate = dayjs(date).format("DD/MM/YYYY");
    useEffect(() => {
        if (viewDetailsState) {
            ChapterWiseMutation.mutate(
                {
                    packageSessionId: pacageSessionId,
                    moduleId: row.getValue("module_id"),
                },
                {
                    onSuccess: (data) => {
                        console.log("Success:", data);
                        setChapterReportData(data);
                    },
                    onError: (error) => {
                        console.error("Error:", error);
                    },
                },
            );
        }
    }, [viewDetailsState]);

    return (
        <div
            className="cursor-pointer text-primary-500"
            onClick={() => {
                setViewDetailsState(!viewDetailsState);
            }}
        >
            View Details
            <MyDialog
                heading="Module Details Report"
                open={viewDetailsState}
                onOpenChange={setViewDetailsState}
                dialogWidth="w-[800px]"
            >
                <div className="flex flex-col gap-4">
                    <div className="flex flex-row items-center justify-between">
                        <div>Date: {currDate}</div>
                        <MyButton buttonType="secondary">Export</MyButton>
                    </div>
                    <div className="grid grid-cols-3 items-center justify-between gap-4">
                        <div>Course: {course}</div>
                        <div>Session: {session}</div>
                        <div>Level: {level}</div>
                        <div>Subject: {row.getValue("subject")}</div>
                        <div>Module: {row.getValue("module")}</div>
                    </div>
                    {isPending && <DashboardLoader height="10vh" />}
                    {chapterReportData &&
                        chapterReportData.map((chapter) => (
                            <div key={chapter.chapter_id} className="flex flex-col gap-6">
                                <div className="flex flex-row gap-4">
                                    <div className="text-h3 font-[600]">Chapter</div>
                                    <div className="text-h3 text-primary-500">
                                        {chapter.chapter_name}
                                    </div>
                                </div>
                                <MyTable
                                    key={chapter.chapter_id} // Unique key for React list rendering
                                    data={{
                                        content:
                                            chapter.slides?.map((slide) => ({
                                                study_slide: slide.slide_title,
                                                batch_concentration_score:
                                                    slide.avg_concentration_score.toFixed(2), // Formatting as string
                                                average_time_spent: `${slide.avg_time_spent.toFixed(
                                                    2,
                                                )} mins`,
                                            })) || [],
                                        total_pages: 0,
                                        page_no: 0,
                                        page_size: 10,
                                        total_elements: 0,
                                        last: false,
                                    }}
                                    columns={ChapterOverviewColumns} // Use correct column config
                                    isLoading={isPending}
                                    error={error}
                                    columnWidths={CHAPTER_OVERVIEW_WIDTH} // Ensure this width config matches
                                    currentPage={0}
                                />
                            </div>
                        ))}
                </div>
            </MyDialog>
        </div>
    );
};
