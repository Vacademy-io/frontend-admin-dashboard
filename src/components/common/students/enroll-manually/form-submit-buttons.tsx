import { MyButton } from "@/components/design-system/button";
import { DialogFooter } from "@/components/ui/dialog";

export const FormSubmitButtons = ({
    stepNumber,
    finishButtonDisable,
}: {
    stepNumber: number;
    finishButtonDisable?: boolean;
}) => {
    return (
        <DialogFooter className="flex w-full justify-between">
            <MyButton buttonType="secondary" scale="large" layoutVariant="default">
                {stepNumber == 1 ? <span>Skip</span> : <span>Back</span>}
            </MyButton>
            <MyButton
                buttonType="primary"
                scale="large"
                layoutVariant="default"
                disabled={finishButtonDisable ? true : false}
            >
                {stepNumber == 5 ? <span>Finish</span> : <span>Next</span>}
            </MyButton>
        </DialogFooter>
    );
};
