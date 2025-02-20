import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DotOutline, Export } from "@phosphor-icons/react";
import { MyButton } from "@/components/design-system/button";
import { Separator } from "@radix-ui/react-separator";
import { getSubjectNameById } from "@/routes/assessment/question-papers/-utils/helper";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useInstituteQuery } from "@/services/student-list-section/getInstituteDetails";
import { convertToLocalDateTime, extractDateTime } from "@/constants/helper";
import { ResponseBreakdownComponent } from "./response-breakdown-component";
import { MarksBreakdownComponent } from "./marks-breakdown-component";
import { Crown } from "@/svgs";

interface TestReportDialogProps {
    isOpen: boolean;
    onClose: () => void;
    testReport: any;
    studentReport: any;
}

export const TestReportDialog = ({
    isOpen,
    onClose,
    testReport,
    studentReport,
}: TestReportDialogProps) => {
    const { data: instituteDetails } = useSuspenseQuery(useInstituteQuery());
    const responseData = {
        attempted: testReport.question_overall_detail_dto.correctAttempt,
        skipped: testReport.question_overall_detail_dto.skippedCount,
    };
    const marksData = {
        correct: testReport.question_overall_detail_dto.correctAttempt,
        partiallyCorrect: testReport.question_overall_detail_dto.partialCorrectAttempt,
        wrongResponse: testReport.question_overall_detail_dto.wrongAttempt,
        skipped: testReport.question_overall_detail_dto.skippedCount,
    };
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-h-[90vh] max-w-[1200px] overflow-y-auto p-0 text-neutral-600">
                <DialogHeader className="flex flex-col gap-6">
                    <div className="flex items-center justify-between">
                        <DialogTitle className="w-full bg-primary-50 px-6 py-4 text-h3 font-semibold text-primary-500">
                            Student Test Report
                        </DialogTitle>
                    </div>
                </DialogHeader>

                {/* Test Info Section */}

                <div className="flex flex-col gap-10 p-6">
                    <div className="flex justify-between">
                        <div className="flex flex-col gap-4">
                            <div className="text-h2 font-semibold">
                                {studentReport.assessment_name}
                            </div>
                        </div>
                        <MyButton buttonType="secondary" scale="large" layoutVariant="default">
                            <Export /> Export
                        </MyButton>
                    </div>

                    <div className="grid grid-cols-3 text-body">
                        <div>
                            Subject:{" "}
                            {getSubjectNameById(
                                instituteDetails?.subjects || [],
                                studentReport.subject_id,
                            ) || ""}
                        </div>
                        <div>
                            Attempt Date:{" "}
                            {extractDateTime(convertToLocalDateTime(studentReport.start_time)).date}
                        </div>
                        <div>Marks: {studentReport.total_marks}</div>
                        <div>Duration: {studentReport.duration_in_seconds * 60} min</div>
                        <div>
                            Start Time:{" "}
                            {extractDateTime(convertToLocalDateTime(studentReport.start_time)).time}
                        </div>
                        <div>
                            End Time:{" "}
                            {extractDateTime(convertToLocalDateTime(studentReport.end_time)).time}
                        </div>
                    </div>
                </div>

                <Separator />

                {/* Charts Section */}
                <div className="p-6 text-h3 font-semibold text-primary-500">Score Report</div>
                <div className="flex">
                    <div className="ml-6 flex flex-col items-center gap-20 p-6">
                        <div className="flex flex-col">
                            <h1>Rank</h1>
                            <div className="flex items-center gap-1">
                                {/* {testReport.question_overall_detail_dto.rank === 1 && (
                                    <Crown className="size-6" />
                                )}
                                <p className="text-neutral-500">
                                    {testReport.question_overall_detail_dto.rank}
                                </p> */}
                            </div>
                        </div>
                        <div>
                            <h1>Percentile</h1>
                            <p className="text-center text-neutral-500">
                                {testReport.question_overall_detail_dto.percentile}%
                            </p>
                        </div>
                        <div>
                            <h1>Marks</h1>
                            <p className="text-neutral-500">{studentReport.total_marks}/20</p>
                        </div>
                    </div>
                    <div className="flex w-full flex-col items-center gap-6">
                        <div className="text-h3 font-semibold">Response Breakdown</div>
                        <ResponseBreakdownComponent responseData={responseData} />
                        <div className="flex flex-col">
                            <div className="-mt-14 flex items-center">
                                <DotOutline weight="fill" className="size-20 text-success-400" />
                                <p className="-ml-4 text-[14px]">
                                    Attempted: &nbsp;{responseData.attempted}
                                </p>
                            </div>
                            <div className="-mt-12 flex items-center">
                                <DotOutline weight="fill" className="size-20 text-neutral-200" />
                                <p className="-ml-4 text-[14px]">
                                    Skipped: &nbsp;{responseData.skipped}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="flex w-full flex-col items-center gap-6">
                        <div className="text-h3 font-semibold">Marks Breakdown</div>
                        <MarksBreakdownComponent marksData={marksData} />
                        <div className="flex flex-col">
                            <div className="-mb-8 flex items-center justify-between">
                                <div className="flex items-center">
                                    <DotOutline
                                        size={70}
                                        weight="fill"
                                        className="text-success-400"
                                    />
                                    <p>Correct Respondents: </p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <p>{marksData.correct}</p>
                                </div>
                            </div>
                            <div className="-mb-8 flex items-center justify-between gap-4">
                                <div className="flex items-center">
                                    <DotOutline
                                        size={70}
                                        weight="fill"
                                        className="text-warning-400"
                                    />
                                    <p>Partially Correct Respondents: </p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <p>{marksData.partiallyCorrect}</p>
                                </div>
                            </div>
                            <div className="-mb-8 flex items-center justify-between">
                                <div className="flex items-center">
                                    <DotOutline
                                        size={70}
                                        weight="fill"
                                        className="text-danger-400"
                                    />
                                    <p>Wrong Respondents: </p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <p>{marksData.wrongResponse}</p>
                                </div>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <DotOutline
                                        size={70}
                                        weight="fill"
                                        className="text-neutral-200"
                                    />
                                    <p>Skipped: </p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <p>{marksData.skipped}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <Separator />

                {/* Answer Review Section */}
                {/* <div className="flex w-full flex-col gap-10 p-6">
                    <div className="text-h3 font-semibold text-primary-500">Answer Review</div>
                    <div className="flex w-full flex-col gap-10">
                        {testReport.answerReview && testReport.answerReview.length > 0 ? (
                            testReport.answerReview.map((review, index) => (
                                <div className="flex w-full flex-col gap-10" key={index}>
                                    <div className="flex w-full flex-col gap-4">
                                        <div className="flex items-center gap-6 text-title">
                                            <div> Question ({review.questionNumber}.)</div>
                                            <div> Question {review.question}</div>
                                        </div>
                                        <div className="flex w-full items-center gap-6 text-subtitle">
                                            <div>Student answer:</div>
                                            <div className="flex w-full items-center justify-between">
                                                <div
                                                    className={`flex h-16 w-[644px] items-center rounded-lg px-4 py-3 ${
                                                        review.status == "correct"
                                                            ? "bg-success-50"
                                                            : review.status == "incorrect"
                                                              ? "bg-danger-100"
                                                              : "bg-neutral-50"
                                                    }`}
                                                >
                                                    {review.studentAnswer
                                                        ? review.studentAnswer
                                                        : "No response"}
                                                </div>
                                                <StatusChips
                                                    status={
                                                        review.status == "correct"
                                                            ? "active"
                                                            : review.status == "incorrect"
                                                              ? "error"
                                                              : "inactive"
                                                    }
                                                    showIcon={false}
                                                >
                                                    {review.marks} Marks
                                                </StatusChips>
                                                <StatusChips
                                                    status={
                                                        review.status == "correct"
                                                            ? "active"
                                                            : review.status == "incorrect"
                                                              ? "error"
                                                              : "inactive"
                                                    }
                                                    className="rounded-full"
                                                >
                                                    <></>
                                                </StatusChips>
                                            </div>
                                        </div>
                                        {review.status != "correct" && (
                                            <div className="flex w-full items-center gap-6 text-subtitle">
                                                <div>Correct answer:</div>
                                                <div className="flex w-full items-center justify-between">
                                                    <div
                                                        className={`h-16 w-[644px] bg-success-50 px-4 py-3`}
                                                    >
                                                        {review.correctAnswer}
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                        <div className="flex items-center gap-6 text-subtitle">
                                            <div>Explanation:</div>
                                            <div>{review.explanation}</div>
                                        </div>
                                    </div>
                                    <Separator />
                                </div>
                            ))
                        ) : (
                            <div className="py-4 text-center text-subtitle">
                                No answer review available
                            </div>
                        )}
                    </div>
                </div> */}
            </DialogContent>
        </Dialog>
    );
};
