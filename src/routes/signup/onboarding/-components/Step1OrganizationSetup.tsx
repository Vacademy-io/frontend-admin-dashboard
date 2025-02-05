import React, { useRef, useState } from "react";
import { OrganizationOnboardingProps } from "..";
import { OnboardingFrame } from "@/svgs";
import { z } from "zod";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormControl, FormField, FormItem } from "@/components/ui/form";
import { MyInput } from "@/components/design-system/input";
import SelectField from "@/components/design-system/select-field";
import { InstituteType } from "@/constants/dummy-data";
import { MyButton } from "@/components/design-system/button";
import { PencilSimpleLine } from "phosphor-react";
import { FileUploadComponent } from "@/components/design-system/file-upload";
import { INSTITUTE_ID } from "@/constants/urls";
import { useFileUpload } from "@/hooks/use-file-upload";

const organizationSetupSchema = z.object({
    instituteProfilePic: z.union([z.string(), z.undefined()]),
    instituteName: z.string().min(1, "Institute Name is required"),
    instituteType: z.string().min(1, "Select institute type"),
});

type FormValues = z.infer<typeof organizationSetupSchema>;

const Step1OrganizationSetup: React.FC<OrganizationOnboardingProps> = ({
    currentStep,
    handleCompleteCurrentStep,
    completedSteps,
}) => {
    const [isUploading, setIsUploading] = useState(false);
    const { uploadFile, getPublicUrl, isUploading: isUploadingFile } = useFileUpload();
    const fileInputRef = useRef<HTMLInputElement>(null);
    console.log(currentStep, completedSteps);
    const form = useForm<FormValues>({
        resolver: zodResolver(organizationSetupSchema),
        defaultValues: {
            instituteProfilePic: undefined,
            instituteName: "",
            instituteType: "",
        },
        mode: "onChange",
    });
    form.watch();
    function onSubmit(values: FormValues) {
        console.log(values);
        handleCompleteCurrentStep();
    }

    const handleFileSubmit = async (file: File) => {
        try {
            setIsUploading(true);
            // need to change soruce and soruceid and userId
            const fileId = await uploadFile({
                file,
                setIsUploading,
                userId: "your-user-id",
                source: INSTITUTE_ID,
                sourceId: "STUDENTS",
            });
            if (fileId) {
                const publicUrl = await getPublicUrl(fileId);
                form.setValue("instituteProfilePic", publicUrl);
            }
        } catch (error) {
            console.error("Upload failed:", error);
        } finally {
            setIsUploading(false);
        }
    };

    console.log(form.getValues());

    return (
        <FormProvider {...form}>
            <form>
                <div className="flex flex-col items-center justify-center gap-8">
                    <h1 className="text-[1.6rem]">Share your organization details</h1>
                    <div className="relative">
                        {form.getValues("instituteProfilePic") ? (
                            <img
                                src={form.getValues("instituteProfilePic")}
                                alt="logo"
                                className="size-52 rounded-full"
                            />
                        ) : (
                            <div className="rounded-full object-cover">
                                <OnboardingFrame className="mt-4" />
                            </div>
                        )}
                        <FileUploadComponent
                            fileInputRef={fileInputRef}
                            onFileSubmit={handleFileSubmit}
                            control={form.control}
                            name="instituteProfilePic"
                            acceptedFileTypes="image/*" // Optional - remove this line to accept all files
                        />
                        <MyButton
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isUploading || isUploadingFile}
                            buttonType="secondary"
                            layoutVariant="icon"
                            scale="small"
                            className="absolute bottom-0 right-0 bg-white"
                        >
                            <PencilSimpleLine />
                        </MyButton>
                    </div>

                    <FormField
                        control={form.control}
                        name="instituteName"
                        render={({ field: { onChange, value, ...field } }) => (
                            <FormItem>
                                <FormControl>
                                    <MyInput
                                        inputType="text"
                                        inputPlaceholder="Institute Name"
                                        input={value}
                                        onChangeFunction={onChange}
                                        required={true}
                                        error={form.formState.errors.instituteName?.message}
                                        size="large"
                                        label="Institute Name"
                                        {...field}
                                        className="w-96"
                                    />
                                </FormControl>
                            </FormItem>
                        )}
                    />
                    <SelectField
                        label="Institute Type"
                        name="instituteType"
                        options={InstituteType.map((option, index) => ({
                            value: option,
                            label: option,
                            _id: index,
                        }))}
                        control={form.control}
                        className="w-full"
                        required
                    />
                    <MyButton
                        type="button"
                        scale="large"
                        buttonType="primary"
                        layoutVariant="default"
                        onClick={form.handleSubmit(onSubmit)}
                        className="mt-4"
                    >
                        Continue
                    </MyButton>
                </div>
            </form>
        </FormProvider>
    );
};

export default Step1OrganizationSetup;
