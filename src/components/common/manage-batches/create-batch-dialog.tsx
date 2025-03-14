import { MyButton } from "@/components/design-system/button";
import { MyDialog } from "@/components/design-system/dialog";
import { useState } from "react";
import { CreateCourseStep } from "./create-course-step";
import { CreateSessionStep } from "./create-session-step";
import { CreateLevelStep } from "./create-level-step";

export const CreateBatchDialog = () => {
    const triggerButton = <MyButton scale="large">Create Batch</MyButton>;

    const [currentStep, setCurrentStep] = useState(0);

    const nextStep = () => setCurrentStep(currentStep + 1);
    const prevStep = () => setCurrentStep(currentStep - 1);
    const submit = () => {};

    const backButton = (
        <MyButton buttonType="secondary" onClick={() => prevStep()}>
            Back
        </MyButton>
    );
    const nextButton = (
        <MyButton
            onClick={() => {
                currentStep == 2 ? submit() : nextStep();
            }}
        >
            {currentStep == 2 ? "Create" : "Next"}
        </MyButton>
    );

    const footer =
        currentStep != 0 ? (
            <div className="flex w-full items-center justify-between">
                {backButton}
                {nextButton}
            </div>
        ) : (
            <div className="flex justify-end">{nextButton}</div>
        );

    const steps = [
        <CreateCourseStep key="course" />,
        <CreateSessionStep key="session" />,
        <CreateLevelStep key="level" />,
    ];

    return (
        <MyDialog
            trigger={triggerButton}
            heading="Create Batch"
            footer={footer}
            dialogWidth="w-[800px]"
        >
            {steps[currentStep]}
        </MyDialog>
    );
};
