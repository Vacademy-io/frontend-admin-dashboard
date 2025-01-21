import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { questionInsightsData } from "../-utils/dummy-data";
import { useState } from "react";
import { DotOutline } from "@phosphor-icons/react";
import { Separator } from "@/components/ui/separator";
import { MyButton } from "@/components/design-system/button";
import { ArrowCounterClockwise, Export } from "phosphor-react";
import { QuestionInsightsAnalysisChartComponent } from "./QuestionInsightsAnalysisChartComponent";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import QuestionAssessmentStatus from "./QuestionAssessmentStatus";

interface CorrectOption {
    optionId: string;
    optionName: string;
}

const getCorrectAnswer = (correctOption: CorrectOption) => {
    const optionMap: Record<string, string> = { "0": "a", "1": "b", "2": "c", "3": "d" };
    return { optionType: optionMap[correctOption.optionId], optionName: correctOption.optionName };
};

export function QuestionInsightsComponent() {
    const [selectedTab, setSelectedTab] = useState(questionInsightsData[0]?.sectionName);
    return (
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="px-8">
            <div className="flex items-center justify-between">
                <TabsList className="mb-2 mt-6 inline-flex h-auto justify-start gap-4 rounded-none border-b !bg-transparent p-0">
                    {questionInsightsData.map((section) => (
                        <TabsTrigger
                            key={section.sectionName}
                            value={section.sectionName}
                            className={`flex gap-1.5 rounded-none px-12 py-2 !shadow-none ${
                                selectedTab === section.sectionName
                                    ? "rounded-t-sm border !border-b-0 border-primary-200 !bg-primary-50"
                                    : "border-none bg-transparent"
                            }`}
                        >
                            <span
                                className={`${
                                    selectedTab === section.sectionName ? "text-primary-500" : ""
                                }`}
                            >
                                {section.sectionName}
                            </span>
                        </TabsTrigger>
                    ))}
                </TabsList>
                <div className="mt-3 flex items-center gap-6">
                    <MyButton
                        type="button"
                        scale="large"
                        buttonType="secondary"
                        className="font-medium"
                    >
                        <Export size={32} />
                        Export
                    </MyButton>
                    <MyButton
                        type="button"
                        scale="large"
                        buttonType="secondary"
                        className="min-w-8 font-medium"
                    >
                        <ArrowCounterClockwise size={32} />
                    </MyButton>
                </div>
            </div>
            {questionInsightsData.map((section) => (
                <TabsContent key={section.sectionName} value={section.sectionName}>
                    {section.questions.map((question, index) => (
                        <div key={question.questionId}>
                            <div className="flex w-full items-start justify-between gap-8">
                                <div className="my-4 flex w-1/2 flex-col gap-8 p-2">
                                    <h3>
                                        Question ({index + 1}.)&nbsp;&nbsp;{question.questionName}
                                    </h3>
                                    <div className="flex flex-nowrap items-center gap-8 text-sm font-semibold">
                                        <p className="whitespace-nowrap font-normal">
                                            Correct Answer:
                                        </p>
                                        <p className="flex w-full items-center gap-4 rounded-md bg-primary-50 p-4">
                                            <span className="rounded-full bg-white p-2">
                                                (
                                                {question.correctOptionIds.data[0]
                                                    ? getCorrectAnswer(
                                                          question.correctOptionIds.data[0],
                                                      ).optionType
                                                    : ""}
                                                .)
                                            </span>
                                            <span>
                                                {question.correctOptionIds.data[0]
                                                    ? getCorrectAnswer(
                                                          question.correctOptionIds.data[0],
                                                      ).optionName
                                                    : ""}
                                            </span>
                                        </p>
                                    </div>
                                    <p className="flex items-start gap-14 text-sm text-gray-600">
                                        <span>Explanation:</span>
                                        <span>{question.questionExplanation}</span>
                                    </p>
                                    <div className="flex flex-col gap-2">
                                        <h3 className="text-primary-500">
                                            Top 3 quick correct responses
                                        </h3>
                                        <div className="flex flex-wrap items-center gap-4">
                                            {question.quickResponses.map((response, index) => {
                                                return (
                                                    <div
                                                        key={index}
                                                        className="flex items-center whitespace-nowrap rounded-md border p-2 text-sm"
                                                    >
                                                        <h1>{response.name}</h1>&nbsp;:&nbsp;
                                                        <h1>{response.time} sec</h1>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                                <div className="-mt-2 flex w-1/2 flex-col">
                                    <QuestionInsightsAnalysisChartComponent question={question} />
                                    <div className="flex flex-col justify-center">
                                        <h1 className="text-center font-semibold text-neutral-500">
                                            Total Attempt:{" "}
                                            {question.questionAttemptedAnalysis.totalAttempt}{" "}
                                            students
                                        </h1>
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
                                                    <p>
                                                        {question.questionAttemptedAnalysis.correct}
                                                    </p>
                                                    <p>
                                                        (
                                                        {question.questionAttemptedAnalysis
                                                            .totalAttempt
                                                            ? (
                                                                  (question
                                                                      .questionAttemptedAnalysis
                                                                      .correct /
                                                                      question
                                                                          .questionAttemptedAnalysis
                                                                          .totalAttempt) *
                                                                  100
                                                              ).toFixed(2) + "%"
                                                            : "N/A"}
                                                        )
                                                    </p>
                                                    <Dialog>
                                                        <DialogTrigger>
                                                            <p className="text-sm text-primary-500">
                                                                View List
                                                            </p>
                                                        </DialogTrigger>
                                                        <DialogContent className="no-scrollbar !m-0 flex h-full !w-full !max-w-full flex-col items-start !gap-0 overflow-y-auto !rounded-none !p-0">
                                                            <h1 className="h-14 w-full bg-primary-50 p-4 font-semibold text-primary-500">
                                                                Correct Respondents
                                                            </h1>
                                                            <QuestionAssessmentStatus
                                                                type="question"
                                                                studentsListData={
                                                                    question.studentResponseList
                                                                        .correctResponse
                                                                }
                                                            />
                                                        </DialogContent>
                                                    </Dialog>
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
                                                    <p>
                                                        {
                                                            question.questionAttemptedAnalysis
                                                                .partiallyCorrect
                                                        }
                                                    </p>
                                                    <p>
                                                        (
                                                        {question.questionAttemptedAnalysis
                                                            .totalAttempt
                                                            ? (
                                                                  (question
                                                                      .questionAttemptedAnalysis
                                                                      .partiallyCorrect /
                                                                      question
                                                                          .questionAttemptedAnalysis
                                                                          .totalAttempt) *
                                                                  100
                                                              ).toFixed(2) + "%"
                                                            : "N/A"}
                                                        )
                                                    </p>
                                                    <Dialog>
                                                        <DialogTrigger>
                                                            <p className="text-sm text-primary-500">
                                                                View List
                                                            </p>
                                                        </DialogTrigger>
                                                        <DialogContent className="no-scrollbar !m-0 flex h-full !w-full !max-w-full flex-col items-start !gap-0 overflow-y-auto !rounded-none !p-0">
                                                            <h1 className="h-14 w-full bg-primary-50 p-4 font-semibold text-primary-500">
                                                                Partially Correct Respondents
                                                            </h1>
                                                            <QuestionAssessmentStatus
                                                                type="question"
                                                                studentsListData={
                                                                    question.studentResponseList
                                                                        .partiallyCorrect
                                                                }
                                                            />
                                                        </DialogContent>
                                                    </Dialog>
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
                                                    <p>
                                                        {
                                                            question.questionAttemptedAnalysis
                                                                .wrongResponse
                                                        }
                                                    </p>
                                                    <p>
                                                        (
                                                        {question.questionAttemptedAnalysis
                                                            .totalAttempt
                                                            ? (
                                                                  (question
                                                                      .questionAttemptedAnalysis
                                                                      .wrongResponse /
                                                                      question
                                                                          .questionAttemptedAnalysis
                                                                          .totalAttempt) *
                                                                  100
                                                              ).toFixed(2) + "%"
                                                            : "N/A"}
                                                        )
                                                    </p>
                                                    <Dialog>
                                                        <DialogTrigger>
                                                            <p className="text-sm text-primary-500">
                                                                View List
                                                            </p>
                                                        </DialogTrigger>
                                                        <DialogContent className="no-scrollbar !m-0 flex h-full !w-full !max-w-full flex-col items-start !gap-0 overflow-y-auto !rounded-none !p-0">
                                                            <h1 className="h-14 w-full bg-primary-50 p-4 font-semibold text-primary-500">
                                                                Wrong Respondents
                                                            </h1>
                                                            <QuestionAssessmentStatus
                                                                type="question"
                                                                studentsListData={
                                                                    question.studentResponseList
                                                                        .wrongResponse
                                                                }
                                                            />
                                                        </DialogContent>
                                                    </Dialog>
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
                                                    <p>
                                                        {question.questionAttemptedAnalysis.skipped}
                                                    </p>
                                                    <p>
                                                        (
                                                        {question.questionAttemptedAnalysis
                                                            .totalAttempt
                                                            ? (
                                                                  (question
                                                                      .questionAttemptedAnalysis
                                                                      .skipped /
                                                                      question
                                                                          .questionAttemptedAnalysis
                                                                          .totalAttempt) *
                                                                  100
                                                              ).toFixed(2) + "%"
                                                            : "N/A"}
                                                        )
                                                    </p>
                                                    <Dialog>
                                                        <DialogTrigger>
                                                            <p className="text-sm text-primary-500">
                                                                View List
                                                            </p>
                                                        </DialogTrigger>
                                                        <DialogContent className="no-scrollbar !m-0 flex h-full !w-full !max-w-full flex-col items-start !gap-0 overflow-y-auto !rounded-none !p-0">
                                                            <h1 className="h-14 w-full bg-primary-50 p-4 font-semibold text-primary-500">
                                                                Skipped Respondents
                                                            </h1>
                                                            <QuestionAssessmentStatus
                                                                type="question"
                                                                studentsListData={
                                                                    question.studentResponseList
                                                                        .skipped
                                                                }
                                                            />
                                                        </DialogContent>
                                                    </Dialog>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <Separator className="my-8" />
                        </div>
                    ))}
                </TabsContent>
            ))}
        </Tabs>
    );
}
