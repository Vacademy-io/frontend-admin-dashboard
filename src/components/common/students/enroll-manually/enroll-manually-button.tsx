import { Dialog, DialogContent, DialogHeader, DialogTrigger } from "@/components/ui/dialog";
import { StepOneForm } from "./forms/step-one-form";
import { MyButton } from "@/components/design-system/button";

export const EnrollManuallyButton = () => {
    return (
        <Dialog>
            <DialogTrigger>
                <MyButton buttonType="secondary" scale="large" layoutVariant="default">
                    Enroll Manually
                </MyButton>
            </DialogTrigger>
            <DialogContent className="p-0 font-normal">
                <DialogHeader className=" ">
                    <div className="bg-primary-50 px-6 py-4 text-h3 font-semibold text-primary-500">
                        Enroll Student
                    </div>

                    <StepOneForm />
                </DialogHeader>
            </DialogContent>
        </Dialog>
    );
};
