import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { CheckCircle } from "phosphor-react";
import { Section } from "@/types/assessment-data-type";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Route } from "..";
import {
    getAssessmentDetails,
    getQuestionDataForSection,
} from "@/routes/assessment/create-assessment/$assessmentId/$examtype/-services/assessment-services";
import { DashboardLoader } from "@/components/core/dashboard-loader";
import { useInstituteQuery } from "@/services/student-list-section/getInstituteDetails";
import { QuestionData } from "@/types/assessment-steps";
import { getQuestionTypeCounts } from "@/routes/assessment/create-assessment/$assessmentId/$examtype/-utils/helper";

interface QuestionDuration {
    hrs: string;
    min: string;
}

interface Question {
    questionId: string;
    questionName: string;
    questionType: string; // You can use a union type like `"MCQM" | "SCQ" | "TF"` if needed
    questionMark: string;
    questionPenalty: string;
    questionDuration: QuestionDuration;
}

const AssessmentQuestionsSection = ({ section, index }: { section: Section; index: number }) => {
    const { assessmentId, examType } = Route.useParams();
    const { data: instituteDetails } = useSuspenseQuery(useInstituteQuery());
    const { data: assessmentDetails, isLoading: isAssessmentDetailsLoading } = useSuspenseQuery(
        getAssessmentDetails({
            assessmentId: assessmentId,
            instituteId: instituteDetails?.id,
            type: examType,
        }),
    );
    const { data: questionsData, isLoading } = useSuspenseQuery(
        getQuestionDataForSection({ assessmentId, sectionIds: section.id }),
    );

    const questionsForSection = questionsData[section.id] || [];

    // Map questions to adaptive_marking_for_each_question format
    const adaptiveMarking = questionsForSection.map((questionData: QuestionData) => {
        const markingJson = questionData.marking_json ? JSON.parse(questionData.marking_json) : {};
        return {
            questionId: questionData.question_id || "",
            questionName: questionData.question?.content || "",
            questionType: questionData.question_type || "",
            questionMark: markingJson.data?.totalMark || "0",
            questionPenalty: markingJson.data?.negativeMark || "0",
            questionDuration: {
                hrs:
                    typeof questionData.question_duration === "number"
                        ? String(Math.floor(questionData.question_duration / 60))
                        : "0",
                min:
                    typeof questionData.question_duration === "number"
                        ? String(questionData.question_duration % 60)
                        : "0",
            },
        };
    });

    if (isLoading || isAssessmentDetailsLoading) return <DashboardLoader />;
    return (
        <AccordionItem value={`section-${index}`} key={index}>
            <AccordionTrigger className="flex items-center justify-between">
                <div className="flex w-full items-center justify-between">
                    <div className="flex items-center justify-start text-primary-500">
                        <h1 className="!ml-0 w-20 border-none !pl-0 text-primary-500">
                            {section.name}
                        </h1>
                        <span className="font-thin !text-neutral-600">
                            (MCQ(Single Correct):&nbsp;
                            {getQuestionTypeCounts(adaptiveMarking).MCQS}
                            ,&nbsp; MCQ(Multiple Correct):&nbsp;
                            {getQuestionTypeCounts(adaptiveMarking).MCQM}
                            ,&nbsp; <span className="font-semibold">Total:&nbsp;</span>
                            {getQuestionTypeCounts(adaptiveMarking).totalQuestions})
                        </span>
                    </div>
                </div>
            </AccordionTrigger>
            <AccordionContent className="flex flex-col gap-8">
                <div className="flex items-center justify-between rounded-md border border-primary-200 px-4 py-2">
                    <h1>The Human Eye and The Colourful World</h1>
                    <div className="flex items-center">
                        <span className="text-primary-500">View</span>
                    </div>
                </div>
                <div className="flex flex-col gap-2">
                    <h1>Section Description</h1>
                    <p className="font-thin">{section.description}</p>
                </div>
                {assessmentDetails[0]?.saved_data?.duration_distribution === "QUESTION" && (
                    <div className="flex w-96 items-center justify-start gap-8 text-sm font-thin">
                        <h1 className="font-normal">Question Duration:</h1>
                        <div className="flex items-center gap-1">
                            <span>{Math.floor(section.duration / 60)}</span>
                            <span>hrs</span>
                            <span>:</span>
                            <span>{section.duration % 60}</span>
                            <span>minutes</span>
                        </div>
                    </div>
                )}
                {assessmentDetails[0]?.saved_data?.duration_distribution === "SECTION" && (
                    <div className="flex w-96 items-center justify-start gap-8 text-sm font-thin">
                        <h1 className="font-normal">Section Duration:</h1>
                        <div className="flex items-center gap-1">
                            <span>{Math.floor(section.duration / 60)}</span>
                            <span>hrs</span>
                            <span>:</span>
                            <span>{section.duration % 60}</span>
                            <span>minutes</span>
                        </div>
                    </div>
                )}
                <div className="flex items-start gap-8 text-sm font-thin">
                    <h1 className="font-normal">Marks Per Question (Default):</h1>
                    <span>2</span>
                </div>
                <div className="flex w-1/2 items-center justify-between">
                    <div className="flex w-52 items-center justify-start gap-8">
                        <h1>Negative Marking:</h1>
                        <span className="font-thin">2</span>
                    </div>
                    <CheckCircle size={22} weight="fill" className="text-success-600" />
                </div>
                <div className="flex w-1/2 items-center justify-between">
                    <h1>Partial Marking:</h1>
                    <CheckCircle size={22} weight="fill" className="text-success-600" />
                </div>
                {section.cutoff_marks > 0 && (
                    <div className="flex w-1/2 items-center justify-between">
                        <div className="flex w-52 items-center justify-start gap-8">
                            <h1>Cutoff Marking:</h1>
                            <span className="font-thin">{section.cutoff_marks}</span>
                        </div>
                        <CheckCircle size={22} weight="fill" className="text-success-600" />
                    </div>
                )}
                {section.problem_randomization && (
                    <div className="flex w-1/2 items-center justify-between">
                        <h1>Problem Randamization:</h1>
                        <CheckCircle size={22} weight="fill" className="text-success-600" />
                    </div>
                )}
                <div>
                    <h1 className="mb-4 text-primary-500">Adaptive Marking Rules</h1>
                    <Table>
                        <TableHeader className="bg-primary-200">
                            <TableRow>
                                <TableHead>Q.No.</TableHead>
                                <TableHead>Question</TableHead>
                                <TableHead>Question Type</TableHead>
                                <TableHead>Marks</TableHead>
                                <TableHead>Penalty</TableHead>
                                <TableHead>Time</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody className="bg-neutral-50">
                            {adaptiveMarking.map((question: Question, index: number) => {
                                return (
                                    <TableRow key={index}>
                                        <TableCell>{index + 1}</TableCell>
                                        <TableCell>{question.questionName}</TableCell>
                                        <TableCell>{question.questionType}</TableCell>
                                        <TableCell>{question.questionMark}</TableCell>
                                        <TableCell>{question.questionPenalty}</TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                {question.questionDuration.hrs}
                                                <span>:</span>
                                                {question.questionDuration.min}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </div>
                <div className="flex items-center justify-end gap-1">
                    <span>Total Marks</span>
                    <span>:</span>
                    <h1>{section.total_marks}</h1>
                </div>
            </AccordionContent>
        </AccordionItem>
    );
};

export default AssessmentQuestionsSection;
