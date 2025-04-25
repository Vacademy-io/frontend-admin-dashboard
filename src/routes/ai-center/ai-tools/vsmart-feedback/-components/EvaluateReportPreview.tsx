import { Separator } from "@/components/ui/separator";
import { MyButton } from "@/components/design-system/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useState } from "react";

function getPerformanceLabel(score: number): string {
    if (score < 40) return "Needs Improvement";
    if (score >= 40 && score < 60) return "Average";
    if (score >= 60 && score < 80) return "Good";
    return "Excellent"; // score >= 80
}

function getPerformanceColor(score: number): string {
    if (score < 40) return "text-destructive text-sm"; // or "text-danger-500" if using custom
    if (score >= 40 && score < 60) return "text-warning-500 text-sm";
    if (score > 60 && score <= 80) return "text-success-500 text-sm";
    return "text-success-500 text-sm"; // for score > 80
}

function getScoreFromString(input: string): number {
    const scores: Record<string, number> = {
        "Delivery & Presentation": 20,
        "Content Quality": 20,
        "Student Engagement": 15,
        "Assessment & Feedback": 10,
        "Inclusivity & Language": 10,
        "Classroom Management": 10,
        "Teaching Aids": 10,
        Professionalism: 5,
    };

    return scores[input.trim()] ?? 0;
}

interface StarRatingProps {
    score: number; // out of 100
}

import { Star, StarHalf } from "phosphor-react";
import { AILectureFeedbackInterface } from "@/types/ai/generate-assessment/generate-complete-assessment";

interface StarRatingProps {
    score: number; // out of 100
}

export const StarRating = ({ score }: StarRatingProps) => {
    const maxStars = 5;
    const starValue = (score / 100) * maxStars;
    const fullStars = Math.floor(starValue);
    const hasHalfStar = starValue - fullStars >= 0.5;
    const emptyStars = maxStars - fullStars - (hasHalfStar ? 1 : 0);

    return (
        <div className="flex items-center gap-1">
            {/* Full Stars */}
            {Array.from({ length: fullStars }).map((_, i) => (
                <Star
                    key={`full-${i}`}
                    className="size-5 fill-yellow-500 text-yellow-500"
                    weight="fill"
                />
            ))}

            {/* Half Star */}
            {hasHalfStar && <StarHalf weight="fill" className="size-5 text-yellow-500" />}

            {/* Empty Stars — render only if there's any */}
            {emptyStars > 0 &&
                Array.from({ length: emptyStars }).map((_, i) => (
                    <Star key={`empty-${i}`} className="size-5 text-gray-300" />
                ))}
        </div>
    );
};

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
                                <StarRating score={Number(evaluateLectureData?.total_score)} />
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
