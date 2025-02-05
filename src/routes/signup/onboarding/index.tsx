import { createFileRoute } from "@tanstack/react-router";
import { OnboardingComponent } from "./-components/OnboardingComponent";
export interface OrganizationOnboardingSidebarProps {
    steps: string[];
    currentStep: number;
    completedSteps: boolean[];
    onStepClick: (index: number) => void;
}

export interface OrganizationOnboardingProps {
    currentStep: number;
    handleCompleteCurrentStep: () => void;
    completedSteps: boolean[];
}

export const Route = createFileRoute("/signup/onboarding/")({
    component: OnboardingComponent,
});
