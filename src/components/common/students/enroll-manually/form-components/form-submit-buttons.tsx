import { MyButton } from "@/components/design-system/button";
import { DialogFooter } from "@/components/ui/dialog";
import { useFormStore } from "@/stores/students/students-list/enroll-students-manually/enroll-manually-form-store";

export const FormSubmitButtons = ({
    stepNumber,
    finishButtonDisable,
}: {
    stepNumber: number;
    finishButtonDisable?: boolean;
}) => {
    const { nextStep, prevStep, skipStep } = useFormStore();

    const handleFirstButton = () => {
        if (stepNumber === 1) {
            skipStep();
        } else {
            prevStep();
        }
    };

    return (
        <DialogFooter className="px-6 py-4">
            <div className="flex w-full justify-between">
                <MyButton
                    buttonType="secondary"
                    scale="large"
                    layoutVariant="default"
                    onClick={handleFirstButton}
                >
                    {stepNumber === 1 ? <span>Skip</span> : <span>Back</span>}
                </MyButton>
                <MyButton
                    buttonType="primary"
                    scale="large"
                    layoutVariant="default"
                    disabled={finishButtonDisable ? true : false}
                    onClick={nextStep}
                >
                    {stepNumber === 5 ? <span>Finish</span> : <span>Next</span>}
                </MyButton>
            </div>
        </DialogFooter>
    );
};
