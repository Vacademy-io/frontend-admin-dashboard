import React from "react";
import { OrganizationOnboardingProps } from "..";
import { OnboardingFrame } from "@/svgs";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

export const organizationSetupSchema = z.object({
    instituteName: z.string().min(1, "Institute Name is required"),
    instituteType: z.string().min(1, "Select institute type"),
});

type FormValues = z.infer<typeof organizationSetupSchema>;

const Step1OrganizationSetup: React.FC<OrganizationOnboardingProps> = ({
    currentStep,
    handleCompleteCurrentStep,
    completedSteps,
}) => {
    const form = useForm<FormValues>({
        resolver: zodResolver(organizationSetupSchema),
        defaultValues: {
            instituteName: "",
            instituteType: "",
        },
        mode: "onTouched",
    });
    return (
        <div className="flex flex-col items-center justify-center">
            <h1>Share your organization details</h1>
            <OnboardingFrame />
        </div>
    );
};

export default Step1OrganizationSetup;
