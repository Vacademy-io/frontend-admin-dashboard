// components/test-report-dialog.tsx
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Export } from "@phosphor-icons/react";
import { TestReport } from "../student-view-dummy-data/test-record";
import { PieChart } from "./pie-chart";
import { MyButton } from "@/components/design-system/button";
import { Separator } from "@radix-ui/react-separator";
import { StatusChips } from "@/components/design-system/chips";

interface TestReportDialogProps {
    isOpen: boolean;
    onClose: () => void;
    testReport: TestReport;
}

export const TestReportDialog = ({ isOpen, onClose, testReport }: TestReportDialogProps) => {
    // Data for response breakdown pie chart
    const responseData = [
        {
            name: "Attempted",
            value: testReport.charts.responseBreakdown.attempted,
            color: "rgb(151, 212, 180)",
        },
        {
            name: "Skipped",
            value: testReport.charts.responseBreakdown.skipped,
            color: "rgb(238, 238, 238)",
        },
    ];

    // Data for marks breakdown pie chart
    const marksData = [
        {
            name: "Correct",
            value: testReport.charts.marksBreakdown.correctAnswers?.count || 0,
            marks: testReport.charts.marksBreakdown.correctAnswers?.marks || 0,
            color: "rgb(151, 212, 180)",
        },
        {
            name: "Incorrect",
            value: testReport.charts.marksBreakdown.incorrectAnswers?.count || 0,
            marks: testReport.charts.marksBreakdown.incorrectAnswers?.marks || 0,
            color: "rgb(244, 152, 152)",
        },
        {
            name: "Partially Correct",
            value: testReport.charts.marksBreakdown.partiallyCorrectAnswers?.count || 0,
            marks: testReport.charts.marksBreakdown.partiallyCorrectAnswers?.marks || 0,
            color: "rgb(255, 221, 130)",
        },
        {
            name: "Not Attempted",
            value: testReport.charts.marksBreakdown.notAttempted?.count || 0,
            marks: testReport.charts.marksBreakdown.notAttempted?.marks || 0,
            color: "rgb(238, 238, 238)",
        },
    ];

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
                                {testReport.testInfo.testName}
                            </div>
                            <div className="text-subtitle">{testReport.testInfo.description}</div>
                        </div>
                        <MyButton buttonType="secondary" scale="large" layoutVariant="default">
                            <Export /> Export
                        </MyButton>
                    </div>

                    <div className="grid grid-cols-3 text-body">
                        <div>Subject: {testReport.testInfo.subject}</div>
                        <div>Attempt Date: {testReport.testInfo.attemptDate}</div>
                        <div>Marks: {testReport.testInfo.marks}</div>
                        <div>Duration: {testReport.testInfo.duration}</div>
                        <div>Start Time: {testReport.testInfo.startTime}</div>
                        <div>End Time: {testReport.testInfo.endTime}</div>
                    </div>
                </div>

                <Separator />

                {/* Charts Section */}
                <div className="p-6 text-h3 font-semibold text-primary-500">Score Report</div>
                <div className="flex">
                    <div className="flex w-full flex-col items-center gap-6">
                        <div className="text-h3 font-semibold">Response Breakdown</div>
                        <PieChart data={responseData} width={200} height={200} />
                    </div>
                    <div className="flex w-full flex-col items-center gap-6">
                        <div className="text-h3 font-semibold">Marks Breakdown</div>
                        <PieChart data={marksData} width={200} height={200} />
                    </div>
                </div>

                <Separator />

                {/* Answer Review Section */}
                <div className="flex w-full flex-col gap-10 p-6">
                    <div className="text-h3 font-semibold text-primary-500">Answer Review</div>
                    <div className="flex w-full flex-col gap-10">
                        {testReport.answerReview.map((review, index) => (
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
                        ))}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};
