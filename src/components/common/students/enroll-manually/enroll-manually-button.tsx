import { MyButton } from "@/components/design-system/button";
import { StepOneForm } from "./forms/step-one-form";
import { StepTwoForm } from "./forms/step-two-form";
import { StepThreeForm } from "./forms/step-three-form";
import { StepFourForm } from "./forms/step-four-form";
import { StepFiveForm } from "./forms/step-five-form";
import { useFormStore } from "@/stores/students/enroll-students-manually/enroll-manually-form-store";
import { MyDialog } from "@/components/design-system/dialog";

export const EnrollManuallyButton = () => {
    const currentStep = useFormStore((state) => state.currentStep);

    const renderCurrentStep = () => {
        switch (currentStep) {
            case 1:
                return <StepOneForm />;
            case 2:
                return <StepTwoForm />;
            case 3:
                return <StepThreeForm />;
            case 4:
                return <StepFourForm />;
            case 5:
                return <StepFiveForm />;
            default:
                return <StepOneForm />;
        }
    };

    return (
        <MyDialog
            trigger={
                <MyButton buttonType="secondary" scale="large" layoutVariant="default">
                    Enroll Manually
                </MyButton>
            }
            heading="Enroll Student"
            dialogWidth="w-[800px]"
        >
            <>{renderCurrentStep()}</>
        </MyDialog>
    );
};
