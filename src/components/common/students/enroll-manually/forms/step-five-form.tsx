import { FormStepHeading } from '../form-components/form-step-heading';
import { Form, FormControl, FormField, FormItem } from '@/components/ui/form';
import { FormItemWrapper } from '../form-components/form-item-wrapper';
import { useForm } from 'react-hook-form';
import { MyInput } from '@/components/design-system/input';
import { MyButton } from '@/components/design-system/button';
import { zodResolver } from '@hookform/resolvers/zod';
import { useFormStore } from '@/stores/students/enroll-students-manually/enroll-manually-form-store';
import {
    stepFiveSchema,
    StepFiveData,
} from '@/schemas/student/student-list/schema-enroll-students-manually';
import { useEnrollStudent } from '@/hooks/student-list-section/enroll-student-manually/useEnrollStudent';
import { useEffect, useRef, useState } from 'react';
import { useInstituteDetailsStore } from '@/stores/students/students-list/useInstituteDetailsStore';
import { toast } from 'sonner';
import { StudentTable, StudentCredentialsType } from '@/types/student-table-types';
import { useReEnrollStudent } from '@/hooks/student-list-section/enroll-student-manually/useReEnrollStudent';
export const StepFiveForm = ({
    initialValues,
    handleNextButtonDisable,
    submitFn,
    handleOpenDialog,
    credentials,
    isLoadingCreds,
    isReEnroll = false,
}: {
    initialValues?: StudentTable;
    handleNextButtonDisable: (value: boolean) => void;
    submitFn: (fn: () => void) => void;
    handleOpenDialog: (open: boolean) => void;
    credentials?: StudentCredentialsType | null;
    isLoadingCreds?: boolean;
    isReEnroll?: boolean;
}) => {
    const [showCredentials, setShowCredentials] = useState(false);
    const {
        stepOneData,
        stepTwoData,
        stepThreeData,
        stepFourData,
        stepFiveData,
        setStepFiveData,
        resetForm,
    } = useFormStore();

    useEffect(() => {
        handleNextButtonDisable(!showCredentials);
    }, [showCredentials]);

    const { getPackageSessionId } = useInstituteDetailsStore();
    const [packageSessionId, setPackageSessionId] = useState(
        getPackageSessionId({
            courseId: stepTwoData?.course.id || '',
            levelId: stepTwoData?.level.id || '',
            sessionId: stepTwoData?.session.id || '',
        })
    );

    useEffect(() => {
        setPackageSessionId(
            getPackageSessionId({
                courseId: stepTwoData?.course.id || '',
                levelId: stepTwoData?.level.id || '',
                sessionId: stepTwoData?.session.id || '',
            })
        );
    }, [stepTwoData?.course, stepTwoData?.level, stepTwoData?.session]);

    const form = useForm<StepFiveData>({
        resolver: zodResolver(stepFiveSchema),
        defaultValues: stepFiveData || {
            username: credentials?.username || initialValues?.username || '',
            password: credentials?.password || initialValues?.password || '',
        },
        mode: 'onChange',
    });

    const generateUsername = () => {
        let namePart =
            stepTwoData?.fullName.replace(/\s+/g, '').substring(0, 4).toLowerCase() || '';
        while (namePart.length < 4) namePart += 'X';
        return namePart + Math.floor(1000 + Math.random() * 9000).toString();
    };

    const generatePassword = () => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        return Array.from({ length: 8 }, () =>
            chars.charAt(Math.floor(Math.random() * chars.length))
        ).join('');
    };

    const generateCredentials = () => {
        form.setValue('username', generateUsername());
        form.setValue('password', generatePassword());
        setShowCredentials(true);
    };

    const enrollStudentMutation = useEnrollStudent();
    const reEnrollStudentMutation = useReEnrollStudent();

    const onSubmit = async (values: StepFiveData) => {
        setStepFiveData(values);

        if (!stepOneData || !stepTwoData || !stepThreeData || !stepFourData) {
            toast.error(
                'Some form steps are incomplete. Please complete all steps before submitting.'
            );
            return;
        }

        try {
            const mutationToUse = isReEnroll ? reEnrollStudentMutation : enrollStudentMutation;

            if (!mutationToUse || !mutationToUse.mutateAsync) {
                toast.error('Mutation function is missing or not initialized properly.');
                return;
            }

            await mutationToUse.mutateAsync({
                formData: {
                    stepOneData,
                    stepTwoData,
                    stepThreeData,
                    stepFourData,
                    stepFiveData: values,
                },
                packageSessionId: packageSessionId || '',
            });

            toast.success(
                isReEnroll ? 'Learner re-enrolled successfully' : 'Learner enrolled successfully'
            );

            resetForm();
            handleOpenDialog(false);
        } catch (error) {
            console.error('Enrollment Error:', error);
            toast.error(
                isReEnroll ? 'Failed to re-enroll the Learner' : 'Failed to enroll the Learner'
            );
        }
    };

    const formRef = useRef<HTMLFormElement>(null);
    const requestFormSubmit = () => formRef.current?.requestSubmit();

    useEffect(() => {
        if (submitFn) submitFn(requestFormSubmit);
    }, [submitFn]);

    useEffect(() => {
        if (initialValues?.username || credentials?.username) {
            setShowCredentials(true);
        }
    }, [initialValues, credentials]);

    return (
        <div>
            <div className="flex flex-col justify-center px-6 text-neutral-600">
                {isLoadingCreds && (
                    <div className="mb-4 text-center text-sm text-gray-500">
                        Loading credentials...
                    </div>
                )}
                <Form {...form}>
                    <form
                        ref={formRef}
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="flex flex-col gap-8"
                    >
                        <FormItemWrapper<StepFiveData> control={form.control} name="username">
                            <FormStepHeading stepNumber={5} heading="Generate Login Credentials" />
                        </FormItemWrapper>

                        {(!showCredentials || initialValues?.username) && (
                            <FormItemWrapper<StepFiveData> control={form.control} name="username">
                                <div className="flex flex-col items-center justify-center gap-5">
                                    <div className="text-subtitle">
                                        Auto-generate student&apos;s username and password
                                    </div>
                                    <MyButton
                                        buttonType="primary"
                                        scale="large"
                                        layoutVariant="default"
                                        onClick={generateCredentials}
                                        type="button"
                                    >
                                        {showCredentials ? 'Re-generate' : 'Generate'}
                                    </MyButton>
                                </div>
                            </FormItemWrapper>
                        )}

                        {(showCredentials || initialValues || credentials) && (
                            <div className="flex flex-col gap-8">
                                <FormField
                                    control={form.control}
                                    name="username"
                                    render={({ field: { value, ...field } }) => (
                                        <FormItem>
                                            <FormControl>
                                                <MyInput
                                                    inputType="text"
                                                    label="Username"
                                                    inputPlaceholder="username"
                                                    input={value}
                                                    onChangeFunction={() => {}}
                                                    error={form.formState.errors.username?.message}
                                                    required={true}
                                                    size="large"
                                                    className="w-full"
                                                    disabled={true}
                                                    {...field}
                                                />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="password"
                                    render={({ field: { onChange, value, ...field } }) => (
                                        <FormItem>
                                            <FormControl>
                                                <MyInput
                                                    inputType="password"
                                                    label="Password"
                                                    inputPlaceholder="....."
                                                    input={value}
                                                    onChangeFunction={onChange}
                                                    error={form.formState.errors.password?.message}
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
                        )}
                    </form>
                </Form>
            </div>
        </div>
    );
};
