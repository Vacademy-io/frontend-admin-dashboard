// step-one-form.tsx
import { FormStepHeading } from "../form-components/form-step-heading";
import { Form } from "@/components/ui/form";
import { FormItemWrapper } from "../form-components/form-item-wrapper";
import { useForm } from "react-hook-form";
import { FormSubmitButtons } from "../form-components/form-submit-buttons";
import { DialogDescription } from "@radix-ui/react-dialog";
import { useFormStore } from "@/stores/students/enroll-students-manually/enroll-manually-form-store";
import { StepOneData, stepOneSchema } from "@/types/students/schema-enroll-students-manually";
import { zodResolver } from "@hookform/resolvers/zod";
import { EnrollFormUploadImage } from "@/assets/svgs";
import { useState } from "react";
import { useFileUpload } from "@/hooks/use-file-upload";

export const StepOneForm = () => {
    const [isUploading, setIsUploading] = useState(false);
    const { uploadFile, getPublicUrl } = useFileUpload();
    const { stepOneData, setStepOneData } = useFormStore();

    const form = useForm<StepOneData>({
        resolver: zodResolver(stepOneSchema),
        defaultValues: stepOneData || {
            profilePicture: null,
        },
    });

    // step-one-form.tsx
    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            const fileId = await uploadFile({
                file,
                setIsUploading,
                userId: "your-user-id",
                source: "c70f40a5-e4d3-4b6c-a498-e612d0d4b133",
                sourceId: "STUDENTS",
            });

            if (fileId) {
                const publicUrl = await getPublicUrl(fileId);
                setStepOneData({ profilePicture: publicUrl.url }); // Access url property
            }
        } catch (error) {
            console.error("Upload failed:", error);
        }
    };

    return (
        <div>
            <DialogDescription className="flex flex-col justify-center p-6 text-neutral-600">
                <Form {...form}>
                    <div className="flex flex-col items-center gap-20">
                        <FormItemWrapper<StepOneData> control={form.control} name="profilePicture">
                            <FormStepHeading stepNumber={1} heading="Add Student Profile Picture" />
                        </FormItemWrapper>

                        <FormItemWrapper<StepOneData>
                            control={form.control}
                            name="profilePicture"
                            className="flex flex-col items-center justify-between"
                        >
                            <div className="items-center justify-center rounded-full">
                                {stepOneData?.profilePicture ? (
                                    <img
                                        src={stepOneData.profilePicture}
                                        alt="Profile"
                                        className="h-24 w-24 rounded-full object-cover"
                                    />
                                ) : (
                                    <div className="rounded-full object-cover">
                                        <EnrollFormUploadImage />
                                    </div>
                                )}
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    disabled={isUploading}
                                    className="hidden"
                                    id="profile-upload"
                                />
                                <label htmlFor="profile-upload" className="cursor-pointer">
                                    {isUploading ? "Uploading..." : "Upload Photo"}
                                </label>
                            </div>
                        </FormItemWrapper>
                    </div>
                </Form>
            </DialogDescription>
            <FormSubmitButtons stepNumber={1} />
        </div>
    );
};
