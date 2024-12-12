import { FormStepHeading } from "../form-components/form-step-heading";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { FormItemWrapper } from "../form-components/form-item-wrapper";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { FormSubmitButtons } from "../form-components/form-submit-buttons";
import { DialogDescription } from "@radix-ui/react-dialog";
import { MyInput } from "@/components/design-system/input";
import { MyDropdown } from "@/components/design-system/dropdown";
import { useEffect } from "react";
import {
    useGetBatchNames,
    useGetSessions,
    useGetGenders,
} from "@/hooks/student-list-section/useFilterData";
import { useInstituteQuery } from "@/services/student-list-section/getInstituteDetails";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFormStore } from "@/stores/students/enroll-students-manually/enroll-manually-form-store";

const formSchema = z.object({
    name: z.string().min(1, "Full name is required"),
    enrollmentNumber: z.string().min(1, "Enrollment number is required"),
    collegeName: z.string().min(1, "College/School name is required"),
    batch: z.string().min(1, "Batch is required"),
    session: z.string().min(1, "Session is required"),
    gender: z.string().min(1, "Gender is required"),
});

export type StepTwoDataType = z.infer<typeof formSchema>;

export const StepTwoForm = () => {
    const { stepTwoData, setStepTwoData, nextStep } = useFormStore();
    const { isLoading } = useInstituteQuery();
    const sessionList = useGetSessions();
    const genderList = useGetGenders();

    const form = useForm<StepTwoDataType>({
        resolver: zodResolver(formSchema),
        defaultValues: stepTwoData || {
            name: "",
            enrollmentNumber: "",
            collegeName: "",
            batch: "",
            session: "",
            gender: "",
        },
        mode: "onChange",
    });

    const batchList = useGetBatchNames(form.watch("session"));

    const onSubmit = (values: StepTwoDataType) => {
        setStepTwoData(values); // Store the form data
        nextStep(); // Move to next step
    };

    // Set initial values once data is loaded
    useEffect(() => {
        if (sessionList.length > 0) {
            form.setValue("session", sessionList[0] || "");
        }
        if (genderList.length > 0) {
            form.setValue("gender", genderList[0] || "");
        }
        if (batchList.length > 0) {
            form.setValue("batch", batchList[0] || "");
        }
    }, [sessionList, genderList, batchList, form]);

    return (
        <div>
            <DialogDescription className="flex flex-col justify-center p-6 text-neutral-600">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-6">
                        <FormItemWrapper<StepTwoDataType> control={form.control} name="name">
                            <FormStepHeading stepNumber={2} heading="General Details" />
                        </FormItemWrapper>

                        <div className="flex flex-col gap-8">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field: { onChange, value, ...field } }) => (
                                    <FormItem>
                                        <FormControl>
                                            <MyInput
                                                inputType="text"
                                                label="Full Name"
                                                inputPlaceholder="Full name (First and Last)"
                                                input={value}
                                                onChangeFunction={onChange}
                                                error={form.formState.errors.name?.message}
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
                                name="batch"
                                render={({ field: { onChange, value } }) => (
                                    <FormItem>
                                        <FormControl>
                                            <div className="flex flex-col gap-1">
                                                <div>
                                                    Batch{" "}
                                                    <span className="text-subtitle text-danger-600">
                                                        *
                                                    </span>
                                                </div>
                                                <MyDropdown
                                                    currentValue={value}
                                                    dropdownList={batchList}
                                                    handleChange={onChange}
                                                />
                                            </div>
                                        </FormControl>
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="enrollmentNumber"
                                render={({ field: { onChange, value, ...field } }) => (
                                    <FormItem>
                                        <FormControl>
                                            <MyInput
                                                inputType="text"
                                                label="Enrollment Number"
                                                inputPlaceholder="00000000"
                                                input={value}
                                                onChangeFunction={onChange}
                                                error={
                                                    form.formState.errors.enrollmentNumber?.message
                                                }
                                                required={true}
                                                size="large"
                                                className="w-full"
                                                {...field}
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />

                            <div className="flex items-center justify-between gap-8">
                                <FormField
                                    control={form.control}
                                    name="session"
                                    render={({ field: { onChange, value } }) => (
                                        <FormItem className="w-full">
                                            <FormControl>
                                                <div className="flex flex-col gap-1">
                                                    <div>
                                                        Session{" "}
                                                        <span className="text-subtitle text-danger-600">
                                                            *
                                                        </span>
                                                    </div>
                                                    {isLoading ? (
                                                        <div>Loading...</div>
                                                    ) : (
                                                        <MyDropdown
                                                            currentValue={value}
                                                            dropdownList={sessionList}
                                                            handleChange={onChange}
                                                        />
                                                    )}
                                                </div>
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="gender"
                                    render={({ field: { onChange, value } }) => (
                                        <FormItem className="w-full">
                                            <FormControl>
                                                <div className="flex flex-col gap-1">
                                                    <div>
                                                        Gender{" "}
                                                        <span className="text-subtitle text-danger-600">
                                                            *
                                                        </span>
                                                    </div>
                                                    {isLoading ? (
                                                        <div>Loading...</div>
                                                    ) : (
                                                        <MyDropdown
                                                            currentValue={value}
                                                            dropdownList={genderList}
                                                            handleChange={onChange}
                                                        />
                                                    )}
                                                </div>
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <FormField
                                control={form.control}
                                name="collegeName"
                                render={({ field: { onChange, value, ...field } }) => (
                                    <FormItem>
                                        <FormControl>
                                            <MyInput
                                                inputType="text"
                                                label="College/School Name"
                                                inputPlaceholder="Enter Student's College/School Name"
                                                input={value}
                                                onChangeFunction={onChange}
                                                error={form.formState.errors.collegeName?.message}
                                                required={true}
                                                size="large"
                                                className="w-full"
                                                {...field}
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                        </div>
                    </form>
                </Form>
            </DialogDescription>
            <FormSubmitButtons stepNumber={2} onNext={form.handleSubmit(onSubmit)} />
        </div>
    );
};
