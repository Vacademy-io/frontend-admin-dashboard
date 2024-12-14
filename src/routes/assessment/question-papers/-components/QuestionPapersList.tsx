import { Button } from "@/components/ui/button";
import { DotsThree, Star } from "phosphor-react";
import { useAllQuestionsStore } from "../-global-states/questions-store";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const QuestionPapersList = ({ isFavourite }: { isFavourite: boolean }) => {
    const { questionPaperList, setQuestionPaperList } = useAllQuestionsStore();

    // Filter question papers based on isFavourite
    const filteredQuestionPapers = isFavourite
        ? questionPaperList.filter((paper) => paper.isFavourite)
        : questionPaperList;

    const handleMarkFavourite = (questionPaperId: number | undefined) => {
        setQuestionPaperList(
            filteredQuestionPapers.map((paper) => {
                if (paper.questionPaperId === questionPaperId) {
                    return { ...paper, isFavourite: !paper.isFavourite };
                }
                return paper;
            }),
        );
    };
    const handleDeleteQuestionPaper = (questionPaperId: number | undefined) => {
        setQuestionPaperList(
            filteredQuestionPapers.filter((paper) => paper.questionPaperId !== questionPaperId),
        );
    };
    return (
        <div className="mt-5 flex flex-col gap-5">
            {filteredQuestionPapers.length > 0 ? (
                filteredQuestionPapers.map((questionsData, index) => (
                    <div
                        key={index}
                        className="flex flex-col gap-2 rounded-xl border-[1.5px] bg-neutral-50 p-4"
                    >
                        <div className="flex items-center justify-between">
                            <h1 className="font-medium">{questionsData.title}</h1>
                            <div className="flex items-center gap-4">
                                <Star
                                    size={20}
                                    weight={questionsData.isFavourite ? "fill" : "light"}
                                    onClick={() =>
                                        handleMarkFavourite(questionsData.questionPaperId)
                                    }
                                    className={`cursor-pointer ${
                                        questionsData.isFavourite
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
                                        <DropdownMenuItem>View Question Paper</DropdownMenuItem>
                                        <DropdownMenuItem
                                            onClick={() =>
                                                handleDeleteQuestionPaper(
                                                    questionsData.questionPaperId,
                                                )
                                            }
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
                                {new Date(questionsData.createdOn).toLocaleDateString() || "N/A"}
                            </p>
                            <p>Year/Class: {questionsData.yearClass || "N/A"}</p>
                            <p>Subject: {questionsData.subject || "N/A"}</p>
                        </div>
                    </div>
                ))
            ) : (
                <p className="text-center text-neutral-500">No question papers found.</p>
            )}
        </div>
    );
};
