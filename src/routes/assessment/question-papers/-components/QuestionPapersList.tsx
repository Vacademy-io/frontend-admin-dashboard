import { Button } from "@/components/ui/button";
import { DotsThree, Star } from "phosphor-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MyPagination } from "@/components/design-system/pagination";
import ViewQuestionPaper from "./ViewQuestionPaper";
import { useMutation } from "@tanstack/react-query";
import { markQuestionPaperStatus } from "../-utils/question-paper-services";
import { INSTITUTE_ID } from "@/constants/urls";
import { PaginatedResponse, QuestionPaperInterface } from "@/types/question-paper-template";
import { useInstituteDetailsStore } from "@/stores/students/students-list/useInstituteDetailsStore";
import { getLevelNameById, getSubjectNameById } from "../-utils/helper";
import { DashboardLoader } from "@/components/core/dashboard-loader";

export const QuestionPapersList = ({
    questionPaperList,
    pageNo,
    handlePageChange,
    refetchData,
}: {
    questionPaperList: PaginatedResponse;
    pageNo: number;
    handlePageChange: (newPage: number) => void;
    refetchData: () => void;
}) => {
    const { instituteDetails } = useInstituteDetailsStore();

    const handleMarkQuestionPaperStatus = useMutation({
        mutationFn: ({
            status,
            questionPaperId,
            instituteId,
        }: {
            status: string;
            questionPaperId: string;
            instituteId: string;
        }) => markQuestionPaperStatus(status, questionPaperId, instituteId),
        onSuccess: () => {
            refetchData();
        },
        onError: (error: unknown) => {
            throw error;
        },
    });

    const handleMarkFavourite = (questionPaperId: string, status: string) => {
        //Need to add logic through API
        handleMarkQuestionPaperStatus.mutate({
            status: status === "FAVOURITE" ? "ACTIVE" : "FAVOURITE",
            questionPaperId,
            instituteId: INSTITUTE_ID,
        });
    };

    const handleDeleteQuestionPaper = (questionPaperId: string) => {
        //Need to add logic through API
        handleMarkQuestionPaperStatus.mutate({
            status: "DELETE",
            questionPaperId,
            instituteId: INSTITUTE_ID,
        });
    };

    if (handleMarkQuestionPaperStatus.status === "pending") return <DashboardLoader />;

    return (
        <div className="mt-5 flex flex-col gap-5">
            {questionPaperList?.content?.map(
                (questionsData: QuestionPaperInterface, index: number) => (
                    <div
                        key={index}
                        className="flex flex-col gap-2 rounded-xl border-[1.5px] bg-neutral-50 p-4"
                    >
                        <div className="flex items-center justify-between">
                            <h1 className="font-medium">{questionsData.title}</h1>
                            <div className="flex items-center gap-4">
                                <Star
                                    size={20}
                                    weight={questionsData.status === "FAVOURITE" ? "fill" : "light"}
                                    onClick={() =>
                                        handleMarkFavourite(questionsData.id, questionsData.status)
                                    }
                                    className={`cursor-pointer ${
                                        questionsData.status === "FAVOURITE"
                                            ? "text-yellow-500"
                                            : "text-gray-300"
                                    }`}
                                />

                                <DropdownMenu>
                                    <DropdownMenuTrigger>
                                        <Button
                                            variant="outline"
                                            className="h-6 bg-transparent p-1 shadow-none"
                                        >
                                            <DotsThree size={20} />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent>
                                        <ViewQuestionPaper
                                            questionPaperId={questionsData.id}
                                            title={questionsData.title}
                                            subject={questionsData.subject_id}
                                            level={questionsData.level_id}
                                            refetchData={refetchData}
                                        />
                                        <DropdownMenuItem
                                            onClick={() =>
                                                handleDeleteQuestionPaper(questionsData.id)
                                            }
                                            className="cursor-pointer"
                                        >
                                            Delete Question Paper
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </div>
                        <div className="flex w-full items-center justify-start gap-8 text-xs">
                            <p>
                                Created On:{" "}
                                {new Date(questionsData.created_on).toLocaleDateString() || "N/A"}
                            </p>
                            <p>
                                Year/Class:{" "}
                                {instituteDetails &&
                                    getLevelNameById(
                                        instituteDetails.levels,
                                        questionsData.level_id,
                                    )}
                            </p>
                            <p>
                                Subject:{" "}
                                {instituteDetails &&
                                    getSubjectNameById(
                                        instituteDetails.subjects,
                                        questionsData.subject_id,
                                    )}
                            </p>
                        </div>
                    </div>
                ),
            )}
            <MyPagination
                currentPage={pageNo}
                totalPages={questionPaperList.total_pages}
                onPageChange={handlePageChange}
            />
        </div>
    );
};
