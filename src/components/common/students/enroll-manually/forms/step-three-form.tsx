// step-three-form.tsx
import { FormStepHeading } from '../form-components/form-step-heading';
import { Form, FormControl, FormField, FormItem } from '@/components/ui/form';
import { FormItemWrapper } from '../form-components/form-item-wrapper';
import { useForm } from 'react-hook-form';
import { MyInput } from '@/components/design-system/input';
import { zodResolver } from '@hookform/resolvers/zod';
import { useFormStore } from '@/stores/students/enroll-students-manually/enroll-manually-form-store';
import {
    StepThreeData,
    stepThreeSchema,
} from '@/schemas/student/student-list/schema-enroll-students-manually';
import PhoneInputField from '@/components/design-system/phone-input-field';
import { useEffect, useRef } from 'react';
import { StudentTable } from '@/types/student-table-types';
import { useInstituteDetailsStore } from '@/stores/students/students-list/useInstituteDetailsStore';
import { HOLISTIC_INSTITUTE_ID } from '@/constants/urls';

export const StepThreeForm = ({
    initialValues,
    submitFn,
}: {
    initialValues?: StudentTable;
    submitFn: (fn: () => void) => void;
}) => {
    const { stepThreeData, setStepThreeData, nextStep, setStep } = useFormStore();
    const { showForInstitutes } = useInstituteDetailsStore();

    const form = useForm<StepThreeData>({
        resolver: zodResolver(stepThreeSchema),
        defaultValues: {
            mobileNumber: stepThreeData?.mobileNumber ?? initialValues?.mobile_number ?? '',
            email: stepThreeData?.email ?? initialValues?.email ?? '',
            addressLine: stepThreeData?.addressLine ?? initialValues?.address_line ?? '',
            city: stepThreeData?.city ?? initialValues?.city ?? '',
            state: stepThreeData?.state ?? initialValues?.region ?? '',
            pincode: stepThreeData?.pincode ?? initialValues?.pin_code ?? '',
        },
        mode: 'onChange',
    });

    const onSubmit = (values: StepThreeData) => {
        setStepThreeData(values);

        // Skip step 4 for holistic institute
        if (showForInstitutes([HOLISTIC_INSTITUTE_ID])) {
            setStep(5); // Go directly to step 5
        } else {
            nextStep(); // Go to step 4 as normal
        }
    };

    useEffect(() => {}, [form.watch('mobileNumber')]);

    const formRef = useRef<HTMLFormElement>(null);

    const requestFormSubmit = () => {
        if (formRef.current) {
            formRef.current.requestSubmit();
        }
    };

    useEffect(() => {
        if (submitFn) {
            submitFn(requestFormSubmit);
        }
    }, [submitFn]);

    return (
        <div>
            <div className="flex flex-col justify-center px-6 text-neutral-600">
                <Form {...form}>
                    <form
                        ref={formRef}
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="flex flex-col gap-6"
                    >
                        <FormItemWrapper<StepThreeData> control={form.control} name="mobileNumber">
                            <FormStepHeading
                                stepNumber={3}
                                heading="Contact Information and Location Details"
                            />
                        </FormItemWrapper>

                        <div className="flex flex-col gap-8">
                            <FormField
                                control={form.control}
                                name="mobileNumber"
                                render={() => (
                                    <FormItem>
                                        <FormControl>
                                            <PhoneInputField
                                                label="Mobile Number"
                                                placeholder="123 456 7890"
                                                name="mobileNumber"
                                                control={form.control}
                                                country="in"
                                                required={true}
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
                                name="addressLine"
                                render={({ field: { onChange, value, ...field } }) => (
                                    <FormItem>
                                        <FormControl>
                                            <MyInput
                                                inputType="text"
                                                label="Address Line"
                                                inputPlaceholder="Eg. 38, South Avenue, Central Perk"
                                                input={value}
                                                onChangeFunction={onChange}
                                                size="large"
                                                className="w-full"
                                                {...field}
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                            {!showForInstitutes([HOLISTIC_INSTITUTE_ID]) && (
                                <>
                                    <FormField
                                        control={form.control}
                                        name="city"
                                        render={({ field: { onChange, value, ...field } }) => (
                                            <FormItem>
                                                <FormControl>
                                                    <MyInput
                                                        inputType="text"
                                                        label="City/Village"
                                                        inputPlaceholder="Eg. Mumbai"
                                                        input={value}
                                                        onChangeFunction={onChange}
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
                                        render={({ field: { onChange, value, ...field } }) => (
                                            <FormItem>
                                                <FormControl>
                                                    <MyInput
                                                        inputType="text"
                                                        label="State"
                                                        inputPlaceholder="Eg. Maharashtra"
                                                        input={value}
                                                        onChangeFunction={onChange}
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
                                        name="pincode"
                                        render={({ field: { onChange, value, ...field } }) => (
                                            <FormItem>
                                                <FormControl>
                                                    <MyInput
                                                        inputType="number"
                                                        label="Pincode"
                                                        inputPlaceholder="Eg. 425562"
                                                        input={value}
                                                        onChangeFunction={onChange}
                                                        size="large"
                                                        className="w-full"
                                                        {...field}
                                                    />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />
                                </>
                            )}
                        </div>
                    </form>
                </Form>
            </div>
        </div>
    );
};
