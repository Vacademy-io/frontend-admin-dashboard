// step-one-form.tsx
import { FormStepHeading } from "../form-components/form-step-heading";
import { Form } from "@/components/ui/form";
import { FormItemWrapper } from "../form-components/form-item-wrapper";
import { useForm } from "react-hook-form";
import { FormSubmitButtons } from "../form-components/form-submit-buttons";
import { useFormStore } from "@/stores/students/enroll-students-manually/enroll-manually-form-store";
import { StepOneData, stepOneSchema } from "@/types/students/schema-enroll-students-manually";
import { zodResolver } from "@hookform/resolvers/zod";
import { EnrollFormUploadImage } from "@/assets/svgs";
import { useState, useRef, useEffect } from "react";
import { useFileUpload } from "@/hooks/use-file-upload";
import { FileUploadComponent } from "@/components/design-system/file-upload";
import { MyButton } from "@/components/design-system/button";
import { PencilSimpleLine } from "phosphor-react";
import { getTokenDecodedData, getTokenFromCookie } from "@/lib/auth/sessionUtility";
import { TokenKey } from "@/constants/auth/tokens";

export const StepOneForm = () => {
    const accessToken = getTokenFromCookie(TokenKey.accessToken);
    const data = getTokenDecodedData(accessToken);
    const INSTITUTE_ID = data && Object.keys(data.authorities)[0];
    const [isUploading, setIsUploading] = useState(false);
    const { uploadFile, getPublicUrl, isUploading: isUploadingFile } = useFileUpload();
    const { stepOneData, setStepOneData, nextStep } = useFormStore();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [nextButtonDisable, setNextButtonDisable] = useState(true);

    useEffect(() => {
        if (stepOneData?.profilePictureUrl != undefined) {
            setNextButtonDisable(false);
        } else {
            setNextButtonDisable(true);
        }
    }, [stepOneData?.profilePictureUrl]);

    const form = useForm<StepOneData>({
        resolver: zodResolver(stepOneSchema),
        defaultValues: stepOneData || {
            profilePicture: null,
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

    const onSubmit = () => {
        nextStep();
    };

    return (
        <div>
            <div className="flex flex-col justify-center p-6 text-neutral-600">
                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="flex flex-col items-center gap-20"
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
            <div className="">
                <FormSubmitButtons
                    stepNumber={1}
                    finishButtonDisable={nextButtonDisable}
                    onNext={form.handleSubmit(onSubmit)}
                />
            </div>
        </div>
    );
};
