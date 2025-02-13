import { FC } from "react";
import Step1OrganizationSetup from "./Step1OrganizationSetup";
import Step2AddOrgDetails from "./Step2AddOrgDetails";
import { OrganizationOnboardingProps } from "..";

// Define a mapping of step index to component
const stepComponents: {
    [key: number]: FC<OrganizationOnboardingProps>;
} = {
    0: Step1OrganizationSetup,
    1: Step2AddOrgDetails,
};

export const OnboardingSteps: React.FC<OrganizationOnboardingProps> = ({
    currentStep,
    handleCompleteCurrentStep,
    completedSteps,
}) => {
    // Get the component based on currentStep
    const StepComponent = stepComponents[currentStep];

    // If no matching step component, return null
    if (!StepComponent) return null;

    return (
        <StepComponent
            currentStep={currentStep}
            handleCompleteCurrentStep={handleCompleteCurrentStep}
            completedSteps={completedSteps}
        />
    );
};
