import { StepContentProps } from "@/types/step-content-props";
import React from "react";

const Step2AddingQuestions: React.FC<StepContentProps> = ({
    currentStep,
    handleCompleteCurrentStep,
    completedSteps,
}) => {
    console.log(currentStep, completedSteps);
    return <div onClick={handleCompleteCurrentStep}>Step2AddingQuestions</div>;
};

export default Step2AddingQuestions;
