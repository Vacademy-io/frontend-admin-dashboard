import { MyButton } from '@/components/design-system/button';
import { DialogFooter } from '@/components/ui/dialog';
import { useFormStore } from '@/stores/students/enroll-students-manually/enroll-manually-form-store';
import { useInstituteDetailsStore } from '@/stores/students/students-list/useInstituteDetailsStore';
import { HOLISTIC_INSTITUTE_ID } from '@/constants/urls';

export const FormSubmitButtons = ({
    stepNumber,
    finishButtonDisable,
    onNext,
}: {
    stepNumber: number;
    finishButtonDisable?: boolean;
    onNext?: () => void;
}) => {
    const { prevStep, skipStep, setStep } = useFormStore();
    const { showForInstitutes } = useInstituteDetailsStore();

    // Define the handleFirstButton function
    const handleFirstButton = () => {
        if (stepNumber === 1) {
            skipStep();
        } else if (stepNumber === 5 && showForInstitutes([HOLISTIC_INSTITUTE_ID])) {
            // For holistic institute, go directly to step 3 when clicking back from step 5
            setStep(3);
        } else {
            prevStep();
        }
    };

    return (
        <DialogFooter className="flex w-full">
            <div className="flex w-full justify-between">
                <MyButton
                    buttonType="secondary"
                    scale="large"
                    layoutVariant="default"
                    onClick={handleFirstButton}
                    type="button"
                >
                    {stepNumber === 1 ? <span>Skip</span> : <span>Back</span>}
                </MyButton>
                <MyButton
                    buttonType="primary"
                    scale="large"
                    layoutVariant="default"
                    disable={finishButtonDisable}
                    onClick={onNext}
                    type="submit"
                >
                    {stepNumber === 5 ? <span>Finish</span> : <span>Next</span>}
                </MyButton>
            </div>
        </DialogFooter>
    );
};
