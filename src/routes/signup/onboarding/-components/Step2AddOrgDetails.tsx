import React from "react";
import { OrganizationOnboardingProps } from "..";

const Step2AddOrgDetails: React.FC<OrganizationOnboardingProps> = ({
    currentStep,
    handleCompleteCurrentStep,
    completedSteps,
}) => {
    return <div onClick={handleCompleteCurrentStep}>Step2AddOrgDetails</div>;
};

export default Step2AddOrgDetails;
