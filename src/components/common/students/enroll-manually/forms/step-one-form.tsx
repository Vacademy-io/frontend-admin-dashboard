import { FormStepHeading } from '../form-components/form-step-heading';
import { Form } from '@/components/ui/form';
import { FormItemWrapper } from '../form-components/form-item-wrapper';
import { useForm } from 'react-hook-form';
import { useFormStore } from '@/stores/students/enroll-students-manually/enroll-manually-form-store';
import {
    StepOneData,
    stepOneSchema,
} from '@/schemas/student/student-list/schema-enroll-students-manually';
import { zodResolver } from '@hookform/resolvers/zod';
import { EnrollFormUploadImage } from '@/assets/svgs';
import { useState, useRef, useEffect } from 'react';
import { useFileUpload } from '@/hooks/use-file-upload';
import { FileUploadComponent } from '@/components/design-system/file-upload';
import { MyButton } from '@/components/design-system/button';
import { getTokenDecodedData, getTokenFromCookie } from '@/lib/auth/sessionUtility';
import { TokenKey } from '@/constants/auth/tokens';
import { StudentTable } from '@/types/student-table-types';
import { DashboardLoader } from '@/components/core/dashboard-loader';

export const StepOneForm = ({
    initialValues,
    handleNextButtonDisable,
    submitFn,
}: {
    initialValues?: StudentTable;
    handleNextButtonDisable: (value: boolean) => void;
    submitFn: (fn: () => void) => void;
}) => {
    const accessToken = getTokenFromCookie(TokenKey.accessToken);
    const data = getTokenDecodedData(accessToken);
    const INSTITUTE_ID = data && Object.keys(data.authorities)[0];

    const [isUploading, setIsUploading] = useState(false);
    const { uploadFile, getPublicUrl, isUploading: isUploadingFile } = useFileUpload();
    const { stepOneData, setStepOneData, nextStep } = useFormStore();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const form = useForm<StepOneData>({
        resolver: zodResolver(stepOneSchema),
        defaultValues: {
            profilePicture: initialValues?.face_file_id || '',
        },
    });

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

    useEffect(() => {
        if (!stepOneData) {
            setStepOneData({
                profilePicture: '',
                profilePictureUrl: '',
            });
        }
    }, []);

    useEffect(() => {
        if (!initialValues?.face_file_id) return;

        const fileId = initialValues.face_file_id;

        const prefillProfilePicture = async () => {
            const publicUrl = await getPublicUrl(fileId);
            setStepOneData({
                profilePicture: fileId,
                profilePictureUrl: publicUrl,
            });

            form.reset({
                profilePicture: fileId,
            });
        };

        prefillProfilePicture();
    }, [initialValues]);

    // ✅ Updated logic: keep Next disabled until image uploaded
    useEffect(() => {
        const isUploaded =
            typeof stepOneData?.profilePictureUrl === 'string' &&
            stepOneData.profilePictureUrl.trim() !== '';
        handleNextButtonDisable(!isUploaded);
    }, [stepOneData?.profilePictureUrl]);

    const handleFileSubmit = async (file: File) => {
        try {
            setIsUploading(true);
            const fileId = await uploadFile({
                file,
                setIsUploading,
                userId: 'your-user-id',
                source: INSTITUTE_ID,
                sourceId: 'STUDENTS',
            });

            if (fileId) {
                const publicUrl = await getPublicUrl(fileId);
                setStepOneData({
                    profilePicture: fileId,
                    profilePictureUrl: publicUrl,
                });
                form.reset({
                    profilePicture: fileId,
                });
            }
        } catch (error) {
            console.error('Upload failed:', error);
        } finally {
            setIsUploading(false);
        }
    };

    const onSubmit = (values: StepOneData) => {
        setStepOneData({
            profilePicture: values.profilePicture ?? '',
            profilePictureUrl: stepOneData?.profilePictureUrl ?? '',
        });
        nextStep();
    };

    return (
        <div>
            <div className="flex flex-col justify-center px-6 text-neutral-600">
                <Form {...form}>
                    <form
                        ref={formRef}
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="flex flex-col items-center gap-5"
                    >
                        <FormItemWrapper<StepOneData> control={form.control} name="profilePicture">
                            <FormStepHeading stepNumber={1} heading="Add Student Profile Picture" />
                        </FormItemWrapper>

                        <FormItemWrapper<StepOneData>
                            control={form.control}
                            name="profilePicture"
                            className="flex flex-col items-center justify-between gap-2"
                        >
                            <div className="flex flex-col">
                                {isUploading ? (
                                    <div className="flex size-[300px] items-center justify-center rounded-full bg-neutral-100">
                                        <DashboardLoader />
                                    </div>
                                ) : stepOneData?.profilePictureUrl ? (
                                    <img
                                        src={stepOneData.profilePictureUrl}
                                        alt="Profile"
                                        className="size-[300px] rounded-full object-cover"
                                    />
                                ) : (
                                    <div className="relative items-center justify-center rounded-full">
                                        <div className="flex size-[320px] items-center justify-center rounded-full bg-neutral-100 object-cover">
                                            <EnrollFormUploadImage />
                                        </div>
                                    </div>
                                )}

                                {!isUploading && (
                                    <>
                                        <FileUploadComponent
                                            fileInputRef={fileInputRef}
                                            onFileSubmit={handleFileSubmit}
                                            control={form.control}
                                            name="profilePicture"
                                            acceptedFileTypes="image/*"
                                        />
                                        <div className="">
                                            <MyButton
                                                onClick={() => fileInputRef.current?.click()}
                                                disabled={isUploading || isUploadingFile}
                                                buttonType="secondary"
                                                layoutVariant="default"
                                                scale="large"
                                                type="button"
                                            >
                                                Upload Image
                                            </MyButton>
                                        </div>
                                    </>
                                )}
                            </div>
                        </FormItemWrapper>
                    </form>
                </Form>
            </div>
        </div>
    );
};
