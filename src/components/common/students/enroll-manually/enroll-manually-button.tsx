import { MyButton } from "@/components/design-system/button";
import { StepOneForm } from "./forms/step-one-form";
import { StepTwoForm } from "./forms/step-two-form";
import { StepThreeForm } from "./forms/step-three-form";
import { StepFourForm } from "./forms/step-four-form";
import { StepFiveForm } from "./forms/step-five-form";
import { useFormStore } from "@/stores/students/enroll-students-manually/enroll-manually-form-store";
import { MyDialog } from "@/components/design-system/dialog";
import { StudentTable } from "@/types/student-table-types";

interface EnrollManuallyButtonProps {
    triggerButton?: JSX.Element;
    initialValues?: StudentTable;
}

export const EnrollManuallyButton = ({
    triggerButton,
    initialValues,
}: EnrollManuallyButtonProps) => {
    const currentStep = useFormStore((state) => state.currentStep);

    const renderCurrentStep = (initialValues?: StudentTable) => {
        switch (currentStep) {
            case 1:
                return <StepOneForm initialValues={initialValues} />;
            case 2:
                return <StepTwoForm initialValues={initialValues} />;
            case 3:
                return <StepThreeForm initialValues={initialValues} />;
            case 4:
                return <StepFourForm initialValues={initialValues} />;
            case 5:
                return <StepFiveForm initialValues={initialValues} />;
            default:
                return <StepOneForm initialValues={initialValues} />;
        }
    };

    return (
        <MyDialog
            trigger={
                triggerButton ? (
                    triggerButton
                ) : (
                    <MyButton buttonType="secondary" scale="large" layoutVariant="default">
                        Enroll Manually
                    </MyButton>
                )
            }
            heading="Enroll Student"
            dialogWidth="w-[800px]"
        >
            <>{renderCurrentStep(initialValues)}</>
        </MyDialog>
    );
};
