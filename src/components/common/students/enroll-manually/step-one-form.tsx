// step-one-form.tsx
import { FormStepHeading } from "./form-step-heading";
import { Form } from "@/components/ui/form";
import { FormItemWrapper } from "./form-item-wrapper";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { EnrollFormUploadImage } from "@/assets/svgs";
import { FormSubmitButtons } from "./form-submit-buttons";
import { DialogDescription } from "@radix-ui/react-dialog";

const formSchema = z.object({
    step1heading: z.string(),
});

type FormData = z.infer<typeof formSchema>;

export const StepOneForm = () => {
    const form = useForm<FormData>({
        defaultValues: {
            step1heading: "",
        },
    });

    return (
        <DialogDescription className="flex flex-col justify-center gap-6 p-6 text-neutral-600">
            <Form {...form}>
                <FormItemWrapper<FormData> control={form.control} name="step1heading">
                    <FormStepHeading stepNumber={1} heading="Add Student Profile Picture" />
                </FormItemWrapper>

                <FormItemWrapper<FormData> control={form.control} name="step1heading">
                    <EnrollFormUploadImage />
                </FormItemWrapper>
                <FormItemWrapper<FormData> control={form.control} name="step1heading">
                    <FormSubmitButtons stepNumber={1} />
                </FormItemWrapper>
            </Form>
        </DialogDescription>
    );
};
