import React from "react";
import { SingleCorrectQuestionPaperTemplatePPTView } from "./MCQ(Single Correct)/SingleCorrectQuestionPaperTemplatePPTView";
import { QuestionPaperTemplateFormProps } from "../../-utils/question-paper-template-form";
import { MultipleCorrectQuestionPaperTemplatePPTView } from "./MCQ(Multiple Correct)/MultipleCorrectQuestionPaperTemplatePPTView";

type PPTComponentType = "MCQS" | "MCQM";

type PPTComponent = (props: QuestionPaperTemplateFormProps) => React.ReactElement;

const PPTComponentsMap: Record<PPTComponentType, PPTComponent> = {
    MCQS: SingleCorrectQuestionPaperTemplatePPTView,
    MCQM: MultipleCorrectQuestionPaperTemplatePPTView,
};

export const PPTComponentFactory = (params: {
    type: PPTComponentType;
    props: QuestionPaperTemplateFormProps;
}) => {
    const Component = PPTComponentsMap[params.type];
    return <Component {...params.props} />;
};
