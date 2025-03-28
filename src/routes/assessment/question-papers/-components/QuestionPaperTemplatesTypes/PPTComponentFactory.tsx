import React from "react";
import { SingleCorrectQuestionPaperTemplatePPTView } from "./MCQ(Single Correct)/SingleCorrectQuestionPaperTemplatePPTView";
import { QuestionPaperTemplateFormProps } from "../../-utils/question-paper-template-form";
import { MultipleCorrectQuestionPaperTemplatePPTView } from "./MCQ(Multiple Correct)/MultipleCorrectQuestionPaperTemplatePPTView";
import { QuestionType } from "@/constants/dummy-data";
import { OneWordQuestionPaperTemplatePPTView } from "./OneWordType/OneWordQuestionPaperTemplatePPTView";
import { LongAnswerQuestionPaperTemplatePPTView } from "./LongAnswerType/LongAnswerQuestionPaperTemplatePPTView";

type PPTComponentType = QuestionType;

type PPTComponent = (props: QuestionPaperTemplateFormProps) => React.ReactElement;

const PPTComponentsMap: Record<PPTComponentType, PPTComponent> = {
    MCQS: SingleCorrectQuestionPaperTemplatePPTView,
    MCQM: MultipleCorrectQuestionPaperTemplatePPTView,
    ONE_WORD: OneWordQuestionPaperTemplatePPTView,
    LONG_ANSWER: LongAnswerQuestionPaperTemplatePPTView,
};

export const PPTComponentFactory = (params: {
    type: PPTComponentType;
    props: QuestionPaperTemplateFormProps;
}) => {
    const Component = PPTComponentsMap[params.type];
    return <Component {...params.props} />;
};
