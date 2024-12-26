import { StepContentProps } from "@/types/step-content-props";
import React from "react";

const Step1BasicInfo: React.FC<StepContentProps> = ({
    currentStep,
    handleCompleteCurrentStep,
    completedSteps,
}) => {
    console.log(currentStep, completedSteps);
    return <div onClick={handleCompleteCurrentStep}>Step1BasicInfo</div>;
};

export default Step1BasicInfo;
