import { MyButton } from "@/components/design-system/button";
import { MyDialog } from "@/components/design-system/dialog";
import { useState } from "react";
import { CreateCourseStep } from "./create-course-step";
import { CreateSessionStep } from "./create-session-step";
import { CreateLevelStep } from "./create-level-step";
import { FormProvider, useForm } from "react-hook-form";

export const CreateBatchDialog = () => {
    const triggerButton = <MyButton scale="large">Create Batch</MyButton>;
    const [currentStep, setCurrentStep] = useState(0);
    const [openManageBatchDialog, setOpenManageBatchDialog] = useState(false);

    const handleOpenManageBatchDialog = (open: boolean) => setOpenManageBatchDialog(open);

    // Set up the form with default values
    const methods = useForm({
        defaultValues: {
            // Course step
            courseCreationType: "existing",
            selectedCourse: null,

            // Session step
            sessionCreationType: "existing",
            selectedSession: null,

            // Level step
            levelCreationType: "existing",
            selectedLevel: null,
        },
    });

    const nextStep = () => {
        // Validate current step before proceeding
        if (currentStep === 0) {
            methods.trigger(["courseCreationType", "selectedCourse"]).then((isValid) => {
                if (isValid) setCurrentStep(currentStep + 1);
            });
        } else if (currentStep === 1) {
            methods.trigger(["sessionCreationType", "selectedSession"]).then((isValid) => {
                if (isValid) setCurrentStep(currentStep + 1);
            });
        } else {
            setCurrentStep(currentStep + 1);
        }
    };

    const prevStep = () => setCurrentStep(currentStep - 1);

    const submit = () => {
        methods.handleSubmit((data) => {
            console.log("Form submitted with data:", data);
            // Handle submission here
        })();
    };

    const backButton = (
        <MyButton buttonType="secondary" onClick={prevStep}>
            Back
        </MyButton>
    );

    const nextButton = (
        <MyButton
            onClick={() => {
                currentStep === 2 ? submit() : nextStep();
            }}
        >
            {currentStep === 2 ? "Create" : "Next"}
        </MyButton>
    );

    const footer =
        currentStep !== 0 ? (
            <div className="flex w-full items-center justify-between">
                {backButton}
                {nextButton}
            </div>
        ) : (
            <div className="flex justify-end">{nextButton}</div>
        );

    const steps = [
        <CreateCourseStep key="course" handleOpenManageBatchDialog={handleOpenManageBatchDialog} />,
        <CreateSessionStep key="session" />,
        <CreateLevelStep key="level" />,
    ];

    return (
        <MyDialog
            trigger={triggerButton}
            heading="Create Batch"
            footer={footer}
            dialogWidth="w-[800px]"
            open={openManageBatchDialog}
            onOpenChange={handleOpenManageBatchDialog}
        >
            <FormProvider {...methods}>
                <form onSubmit={methods.handleSubmit(submit)}>{steps[currentStep]}</form>
            </FormProvider>
        </MyDialog>
    );
};
