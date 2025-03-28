import React from "react";
import { QuestionPaperTemplateFormProps } from "../../-utils/question-paper-template-form";
import { SingleCorrectQuestionPaperTemplateMainView } from "./MCQ(Single Correct)/SingleCorrectQuestionPaperTemplateMainView";
import { MultipleCorrectQuestionPaperTemplateMainView } from "./MCQ(Multiple Correct)/MultipleCorrectQuestionPaperTemplateMainView";
import { QuestionType } from "@/constants/dummy-data";
import { OneWordQuestionPaperTemplateMainView } from "./OneWordType/OneWordQuestionPaperTemplateMainView";
import { LongAnswerQuestionPaperTemplateMainView } from "./LongAnswerType/LongAnswerQuestionPaperTemplateMainView";

type MainViewComponentType = QuestionType;

type MainViewComponent = (props: QuestionPaperTemplateFormProps) => React.ReactElement;

const MainViewComponentsMap: Record<MainViewComponentType, MainViewComponent> = {
    MCQS: SingleCorrectQuestionPaperTemplateMainView,
    MCQM: MultipleCorrectQuestionPaperTemplateMainView,
    ONE_WORD: OneWordQuestionPaperTemplateMainView,
    LONG_ANSWER: LongAnswerQuestionPaperTemplateMainView,
};

export const MainViewComponentFactory = (params: {
    type: MainViewComponentType;
    props: QuestionPaperTemplateFormProps;
}) => {
    const Component = MainViewComponentsMap[params.type];
    return <Component {...params.props} />;
};
