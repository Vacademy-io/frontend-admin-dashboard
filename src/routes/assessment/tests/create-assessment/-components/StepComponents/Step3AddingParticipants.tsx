import { StepContentProps } from "@/types/step-content-props";
import React from "react";

const Step3AddingParticipants: React.FC<StepContentProps> = ({
    currentStep,
    handleCompleteCurrentStep,
    completedSteps,
}) => {
    console.log(currentStep, completedSteps);
    return <div onClick={handleCompleteCurrentStep}>Step3AddingParticipants</div>;
};

export default Step3AddingParticipants;
