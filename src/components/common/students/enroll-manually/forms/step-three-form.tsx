import { FormStepHeading } from "../form-components/form-step-heading";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { FormItemWrapper } from "../form-components/form-item-wrapper";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { FormSubmitButtons } from "../form-components/form-submit-buttons";
import { DialogDescription } from "@radix-ui/react-dialog";
import { MyInput } from "@/components/design-system/input";
import { MyDropdown } from "@/components/design-system/dropdown";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFormStore } from "@/stores/students/enroll-students-manually/enroll-manually-form-store";

const formSchema = z.object({
    mobileNumber: z
        .string()
        .min(1, "Mobile number is required")
        .regex(/^\d{10}$/, "Mobile number must be 10 digits"),
    email: z.string().min(1, "Email is required").email("Invalid email format"),
    state: z.string().min(1, "State is required"),
    city: z.string().min(1, "City is required"),
});

export type StepThreeDataType = z.infer<typeof formSchema>;

export const StepThreeForm = () => {
    const { stepThreeData, setStepThreeData, nextStep } = useFormStore();
    const stateList = ["Madhya Pradesh", "Himachal Pradesh", "Rajasthan"];
    const cityList = ["Bhopal", "Indore", "Delhi"];

    const form = useForm<StepThreeDataType>({
        resolver: zodResolver(formSchema),
        defaultValues: stepThreeData || {
            mobileNumber: "",
            email: "",
            state: "Madhya Pradesh",
            city: "Bhopal",
        },
        mode: "onChange",
    });

    const onSubmit = (values: StepThreeDataType) => {
        setStepThreeData(values);
        nextStep();
    };

    return (
        <div>
            <DialogDescription className="flex flex-col justify-center p-6 text-neutral-600">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-6">
                        <FormItemWrapper<StepThreeDataType>
                            control={form.control}
                            name="mobileNumber"
                        >
                            <FormStepHeading
                                stepNumber={3}
                                heading="Contact Information and Location Details"
                            />
                        </FormItemWrapper>

                        <div className="flex flex-col gap-8">
                            <FormField
                                control={form.control}
                                name="mobileNumber"
                                render={({ field: { onChange, value, ...field } }) => (
                                    <FormItem>
                                        <FormControl>
                                            <MyInput
                                                inputType="tel"
                                                label="Mobile Number"
                                                inputPlaceholder="123 456 7890"
                                                input={value}
                                                onChangeFunction={onChange}
                                                error={form.formState.errors.mobileNumber?.message}
                                                required={true}
                                                size="large"
                                                className="w-full"
                                                {...field}
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field: { onChange, value, ...field } }) => (
                                    <FormItem>
                                        <FormControl>
                                            <MyInput
                                                inputType="email"
                                                label="Email"
                                                inputPlaceholder="you@email.com"
                                                input={value}
                                                onChangeFunction={onChange}
                                                error={form.formState.errors.email?.message}
                                                required={true}
                                                size="large"
                                                className="w-full"
                                                {...field}
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="state"
                                render={({ field: { onChange, value } }) => (
                                    <FormItem>
                                        <FormControl>
                                            <div className="flex flex-col gap-1">
                                                <div>
                                                    State{" "}
                                                    <span className="text-subtitle text-danger-600">
                                                        *
                                                    </span>
                                                </div>
                                                <MyDropdown
                                                    currentValue={value}
                                                    dropdownList={stateList}
                                                    handleChange={onChange}
                                                />
                                            </div>
                                        </FormControl>
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="city"
                                render={({ field: { onChange, value } }) => (
                                    <FormItem>
                                        <FormControl>
                                            <div className="flex flex-col gap-1">
                                                <div>
                                                    City{" "}
                                                    <span className="text-subtitle text-danger-600">
                                                        *
                                                    </span>
                                                </div>
                                                <MyDropdown
                                                    currentValue={value}
                                                    dropdownList={cityList}
                                                    handleChange={onChange}
                                                />
                                            </div>
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                        </div>
                    </form>
                </Form>
            </DialogDescription>
            <FormSubmitButtons stepNumber={3} onNext={form.handleSubmit(onSubmit)} />
        </div>
    );
};
