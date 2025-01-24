import { Separator } from "@/components/ui/separator";
// import { getAssessmentDetails } from "@/routes/assessment/create-assessment/$examtype/-services/assessment-services";
// import { useInstituteQuery } from "@/services/student-list-section/getInstituteDetails";
// import { useSuspenseQuery } from "@tanstack/react-query";
import { CheckCircle } from "phosphor-react";
// import { Route } from "..";

export const AssessmentBasicInfoTab = () => {
    // const { assessmentId } = Route.useParams();
    // const { data: instituteDetails } = useSuspenseQuery(useInstituteQuery());
    // const { data: assessmentDetails, isLoading } = useSuspenseQuery(
    //     getAssessmentDetails({
    //         assessmentId: assessmentId,
    //         instituteId: instituteDetails?.id,
    //         type: examType,
    //     }),
    // );
    return (
        <>
            <div className="mt-4 flex flex-col gap-8">
                <div className="flex flex-col gap-6">
                    <h1 className="text-sm font-semibold">
                        Assessment Name:{" "}
                        <span className="font-thin">The Human Eye and The Colourful World</span>
                    </h1>
                    <h1 className="text-sm font-semibold">
                        Subject: <span className="font-thin">Physics</span>
                    </h1>
                    <div className="flex flex-col gap-1 text-sm">
                        <h1 className="font-semibold">Assessment Instructions:</h1>
                        <p className="font-thin">
                            Attempt All Questions: Answer all questions. Ensure accuracy and
                            completeness in each response. Objective Format: All questions are
                            multiple-choice. Select the best answer for each question. Single
                            Attempt Only: This Assessment allows for one submission only. Once you
                            submit, you cannot change your answers. Negative Marking: Incorrect
                            answers may result in a deduction of points. Submission Guidelines:
                            Double-check all answers before submitting. Click Submit only when you
                            are ready. No External Help: This is an individual Assessment. Using
                            textbooks, notes, or assistance from others is not permitted. Stay
                            Focused: Avoid switching tabs or leaving the exam screen, as it may be
                            flagged as suspicious behavior. Good luck! Answer carefully and review
                            each question before proceeding.
                        </p>
                    </div>
                </div>
                <div className="flex flex-col gap-1 font-semibold">
                    <h1>Live Date Range</h1>
                    <div className="flex items-center gap-8">
                        <h1 className="text-sm">
                            Start Date and Time:{" "}
                            <span className="font-thin">13/10/2024, 11:15 AM</span>{" "}
                        </h1>
                        <h1 className="text-sm">
                            End Date and Time:{" "}
                            <span className="font-thin">15/10/2024, 08:30 PM</span>{" "}
                        </h1>
                    </div>
                </div>
                <Separator className="my-6" />
                <div className="flex w-1/2 flex-col gap-4">
                    <h1 className="font-semibold">Attempt settings</h1>
                    <div className="flex items-center gap-6 text-sm">
                        <h1 className="whitespace-nowrap font-semibold">
                            Assessment Duration Settings:
                        </h1>
                        <h1 className="whitespace-nowrap font-thin">Entire Assessment duration</h1>
                        <h1 className="whitespace-nowrap font-thin">20 min</h1>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-6">
                            <h1 className="font-semibold">Assessment Preview:</h1>
                            <h1 className="font-thin">2 min</h1>
                        </div>
                        <CheckCircle size={22} weight="fill" className="text-success-600" />
                    </div>
                    <div className="flex items-center justify-between text-sm">
                        <h1 className="font-semibold">
                            Allow participants to switch between sections
                        </h1>
                        <CheckCircle size={22} weight="fill" className="text-success-600" />
                    </div>
                    <div className="flex items-center justify-between text-sm">
                        <h1 className="font-semibold">
                            Allow participants to raise reattempt request
                        </h1>
                        <CheckCircle size={22} weight="fill" className="text-success-600" />
                    </div>
                    <div className="flex items-center justify-between text-sm">
                        <h1 className="font-semibold">
                            Allow participants to raise time increase request
                        </h1>
                        <CheckCircle size={22} weight="fill" className="text-success-600" />
                    </div>
                </div>
            </div>
        </>
    );
};
