import { Separator } from "@/components/ui/separator";
import { MyButton } from "@/components/design-system/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useState } from "react";
import { AILectureFeedbackInterface } from "@/types/ai/generate-assessment/generate-complete-assessment";
import { StarRatingComponent } from "@/components/common/star-rating-component";
import {
    getPerformanceColor,
    getPerformanceLabel,
    getScoreFromString,
} from "@/routes/ai-center/-utils/helper";

const EvaluateReportPreview = ({
    openDialog = false,
    evaluateLectureData,
}: {
    openDialog: boolean;
    evaluateLectureData: AILectureFeedbackInterface;
}) => {
    const [open, setOpen] = useState(openDialog);
    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="no-scrollbar !m-0 h-full !w-full !max-w-full !gap-0 overflow-y-auto !rounded-none p-0">
                <h1 className="bg-primary-50 p-4 font-semibold text-primary-500">
                    {evaluateLectureData?.report_title}
                </h1>
                <div className="flex h-screen w-screen flex-col gap-4 p-6">
                    <div className="flex items-center justify-between">
                        <h1 className="text-xl font-semibold">{evaluateLectureData?.title}</h1>
                        <MyButton type="button" scale="large" buttonType="secondary">
                            Export
                        </MyButton>
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="flex flex-col gap-1">
                            <div className="flex items-center">
                                <span className="text-sm font-semibold">Lecture Title:&nbsp;</span>
                                <span className="text-sm font-thin">
                                    {evaluateLectureData?.lecture_info?.lecture_title}
                                </span>
                            </div>
                            <div className="flex items-center">
                                <span className="text-sm font-semibold">Duration:&nbsp;</span>
                                <span className="text-sm font-thin">
                                    {evaluateLectureData?.lecture_info?.duration}
                                </span>
                            </div>
                            <div className="flex items-center">
                                <span className="text-sm font-semibold">
                                    Evaluation Date:&nbsp;
                                </span>
                                <span className="text-sm font-thin">
                                    {evaluateLectureData?.lecture_info?.evaluation_date}
                                </span>
                            </div>
                        </div>
                        <div className="flex items-center gap-8">
                            <div className="flex flex-col items-center">
                                <span className="text-sm">Total Score</span>
                                <span className="font-bold text-neutral-400">
                                    {evaluateLectureData?.total_score}/100
                                </span>
                            </div>
                            <div className="flex flex-col items-center">
                                <StarRatingComponent
                                    score={Number(evaluateLectureData?.total_score)}
                                />
                                <span
                                    className={getPerformanceColor(
                                        Number(evaluateLectureData?.total_score),
                                    )}
                                >
                                    {getPerformanceLabel(Number(evaluateLectureData?.total_score))}
                                </span>
                            </div>
                        </div>
                    </div>
                    <Separator />
                    <div className="flex flex-col gap-4">
                        <span className="font-semibold">Evaluation Criteria</span>
                        {evaluateLectureData?.criteria?.map((criterion, index) => (
                            <div key={index} className="flex flex-col gap-3">
                                <div className="flex items-center gap-4">
                                    <h1 className="font-semibold">
                                        {index + 1}. {criterion?.name}
                                    </h1>
                                    <span className="text-primary-300">
                                        (Score: {criterion?.score}/
                                        {getScoreFromString(criterion?.name)})
                                    </span>
                                </div>
                                <div className="flex flex-col gap-1">
                                    {criterion?.points?.map((point, pointIndex) => (
                                        <div key={pointIndex}>
                                            <div className="flex flex-nowrap items-start">
                                                <span className="text-sm font-semibold">
                                                    • {point?.title}: &nbsp;
                                                </span>
                                            </div>
                                            {point?.description?.map((desc, descIndex) => (
                                                <div
                                                    key={descIndex}
                                                    className="flex flex-nowrap items-center pl-4"
                                                >
                                                    <span className="text-sm font-thin">
                                                        - {desc}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    ))}
                                </div>
                                {criterion &&
                                    criterion.scope_of_improvement &&
                                    criterion.scope_of_improvement.length > 0 && (
                                        <div className="mt-2 flex flex-col gap-1">
                                            <span className="text-sm font-semibold">
                                                Scope of Improvement:
                                            </span>
                                            {criterion?.scope_of_improvement?.map(
                                                (improvement, impIndex) => (
                                                    <div
                                                        key={impIndex}
                                                        className="flex flex-nowrap items-center pl-4"
                                                    >
                                                        <span className="text-sm font-thin">
                                                            - {improvement}
                                                        </span>
                                                    </div>
                                                ),
                                            )}
                                        </div>
                                    )}
                            </div>
                        ))}
                    </div>
                    {evaluateLectureData?.summary && (
                        <div className="flex flex-col gap-1 pb-4">
                            <h1 className="font-semibold">Summary</h1>
                            <div className="flex flex-col gap-1">
                                {evaluateLectureData?.summary?.map((summaryPoint, index) => (
                                    <div key={index} className="flex flex-nowrap items-start">
                                        <span className="text-sm font-thin">• {summaryPoint}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default EvaluateReportPreview;
