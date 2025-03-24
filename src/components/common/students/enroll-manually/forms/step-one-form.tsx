// step-one-form.tsx
import { FormStepHeading } from "../form-components/form-step-heading";
import { Form } from "@/components/ui/form";
import { FormItemWrapper } from "../form-components/form-item-wrapper";
import { useForm } from "react-hook-form";
import { useFormStore } from "@/stores/students/enroll-students-manually/enroll-manually-form-store";
import {
    StepOneData,
    stepOneSchema,
} from "@/schemas/student/student-list/schema-enroll-students-manually";
import { zodResolver } from "@hookform/resolvers/zod";
import { EnrollFormUploadImage } from "@/assets/svgs";
import { useState, useRef, useEffect } from "react";
import { useFileUpload } from "@/hooks/use-file-upload";
import { FileUploadComponent } from "@/components/design-system/file-upload";
import { MyButton } from "@/components/design-system/button";
import { PencilSimpleLine } from "phosphor-react";
import { getTokenDecodedData, getTokenFromCookie } from "@/lib/auth/sessionUtility";
import { TokenKey } from "@/constants/auth/tokens";
import { StudentTable } from "@/types/student-table-types";

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

    useEffect(() => {
        if (stepOneData?.profilePictureUrl != undefined) {
            handleNextButtonDisable(false);
        } else {
            handleNextButtonDisable(true);
        }
    }, [stepOneData?.profilePictureUrl]);

    const form = useForm<StepOneData>({
        resolver: zodResolver(stepOneSchema),
        defaultValues: stepOneData || {
            profilePicture: initialValues?.face_file_id || null,
        },
    });

    const handleFileSubmit = async (file: File) => {
        try {
            setIsUploading(true);
            const fileId = await uploadFile({
                file,
                setIsUploading,
                userId: "your-user-id",
                source: INSTITUTE_ID,
                sourceId: "STUDENTS",
            });

            if (fileId) {
                const publicUrl = await getPublicUrl(fileId);
                setStepOneData({
                    profilePicture: fileId,
                    profilePictureUrl: publicUrl,
                });
            }
        } catch (error) {
            console.error("Upload failed:", error);
        } finally {
            setIsUploading(false);
        }
    };

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

    const onSubmit = () => {
        nextStep();
    };

    return (
        <div className="">
            <div className="flex flex-col justify-center px-6 text-neutral-600">
                <Form {...form}>
                    <form
                        ref={formRef}
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="flex flex-col items-center gap-10"
                    >
                        <FormItemWrapper<StepOneData> control={form.control} name="profilePicture">
                            <FormStepHeading stepNumber={1} heading="Add Student Profile Picture" />
                        </FormItemWrapper>

                        <FormItemWrapper<StepOneData>
                            control={form.control}
                            name="profilePicture"
                            className="flex flex-col items-center justify-between"
                        >
                            <div className="relative items-center justify-center rounded-full">
                                {stepOneData?.profilePictureUrl ? (
                                    <img
                                        src={stepOneData.profilePictureUrl}
                                        alt="Profile"
                                        className="h-[300px] w-[300px] rounded-full object-cover"
                                    />
                                ) : (
                                    <div className="rounded-full object-cover">
                                        <EnrollFormUploadImage />
                                    </div>
                                )}
                                <FileUploadComponent
                                    fileInputRef={fileInputRef}
                                    onFileSubmit={handleFileSubmit}
                                    control={form.control}
                                    name="profilePicture"
                                    acceptedFileTypes="image/*" // Optional - remove this line to accept all files
                                />
                                <div className="absolute bottom-2 right-20">
                                    <MyButton
                                        onClick={() => fileInputRef.current?.click()}
                                        disabled={isUploading || isUploadingFile}
                                        buttonType="secondary"
                                        layoutVariant="icon"
                                        scale="small"
                                        className="bg-white"
                                        type="button"
                                    >
                                        <PencilSimpleLine />
                                    </MyButton>
                                </div>
                            </div>
                        </FormItemWrapper>
                    </form>
                </Form>
            </div>
        </div>
    );
};
