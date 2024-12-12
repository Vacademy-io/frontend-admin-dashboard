// step-one-form.tsx
import { FormStepHeading } from "../form-components/form-step-heading";
import { Form } from "@/components/ui/form";
import { FormItemWrapper } from "../form-components/form-item-wrapper";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { EnrollFormUploadImage } from "@/assets/svgs";
import { FormSubmitButtons } from "../form-components/form-submit-buttons";
import { DialogDescription } from "@radix-ui/react-dialog";
// import { useFormStore } from "@/stores/students/enroll-students-manually/enroll-manually-form-store";

const formSchema = z.object({
    step1heading: z.string(),
});

type FormData = z.infer<typeof formSchema>;

export const StepOneForm = () => {
    // const { stepOneData } = useFormStore();
    // const { setStepOneData, nextStep, skipStep } = useFormStore();

    // const handleFileUpload = (file: File) => {
    //     setStepOneData({ profilePicture: file });
    //     nextStep();
    // };

    // const handleSkip = () => {
    //     setStepOneData({ profilePicture: null });
    //     skipStep();
    // };

    const form = useForm<FormData>({
        defaultValues: {
            step1heading: "step 1",
        },
    });

    return (
        <div>
            <DialogDescription className="flex flex-col justify-center p-6 text-neutral-600">
                <Form {...form}>
                    <div className="flex flex-col items-center gap-20">
                        <FormItemWrapper<FormData> control={form.control} name="step1heading">
                            <FormStepHeading stepNumber={1} heading="Add Student Profile Picture" />
                        </FormItemWrapper>

                        <FormItemWrapper<FormData>
                            control={form.control}
                            name="step1heading"
                            className="flex items-center justify-between"
                        >
                            <EnrollFormUploadImage />
                        </FormItemWrapper>
                    </div>
                </Form>
            </DialogDescription>
            <FormSubmitButtons stepNumber={1} />
        </div>
    );
};
