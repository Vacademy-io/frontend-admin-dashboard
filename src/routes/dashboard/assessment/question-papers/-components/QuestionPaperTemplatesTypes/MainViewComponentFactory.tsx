import React from "react";
import { QuestionPaperTemplateFormProps } from "../../-utils/question-paper-template-form";
import { SingleCorrectQuestionPaperTemplateMainView } from "./MCQ(Single Correct)/SingleCorrectQuestionPaperTemplateMainView";
import { MultipleCorrectQuestionPaperTemplateMainView } from "./MCQ(Multiple Correct)/MultipleCorrectQuestionPaperTemplateMainView";

type MainViewComponentType = "MCQ (Single Correct)" | "MCQ (Multiple Correct)";

type MainViewComponent = (props: QuestionPaperTemplateFormProps) => React.ReactElement;

const MainViewComponentsMap: Record<MainViewComponentType, MainViewComponent> = {
    "MCQ (Single Correct)": SingleCorrectQuestionPaperTemplateMainView,
    "MCQ (Multiple Correct)": MultipleCorrectQuestionPaperTemplateMainView,
};

export const MainViewComponentFactory = (params: {
    type: MainViewComponentType;
    props: QuestionPaperTemplateFormProps;
}) => {
    const Component = MainViewComponentsMap[params.type];
    return <Component {...params.props} />;
};