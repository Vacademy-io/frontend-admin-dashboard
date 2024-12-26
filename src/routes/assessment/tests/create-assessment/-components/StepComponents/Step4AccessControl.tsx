import { StepContentProps } from "@/types/step-content-props";
import React from "react";

const Step4AccessControl: React.FC<StepContentProps> = ({
    currentStep,
    handleCompleteCurrentStep,
    completedSteps,
}) => {
    console.log(currentStep, completedSteps);
    return <div onClick={handleCompleteCurrentStep}>Step4AccessControl</div>;
};

export default Step4AccessControl;
