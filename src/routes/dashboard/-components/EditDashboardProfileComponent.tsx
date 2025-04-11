import { MyButton } from "@/components/design-system/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormControl, FormField, FormItem } from "@/components/ui/form";
import { PencilSimpleLine, Plus } from "phosphor-react";
import { FormProvider, useForm } from "react-hook-form";
import { z } from "zod";
import { editDashboardProfileSchema } from "../-utils/edit-dashboard-profile-schema";
import { OnboardingFrame } from "@/svgs";
import { FileUploadComponent } from "@/components/design-system/file-upload";
import { UploadFileInS3Public } from "@/routes/signup/-services/signup-services";
import { useRef, useState } from "react";
import { getInstituteId } from "@/constants/helper";
import { MyInput } from "@/components/design-system/input";
import SelectField from "@/components/design-system/select-field";
import { InstituteType } from "@/constants/dummy-data";
import { Separator } from "@/components/ui/separator";

type FormValues = z.infer<typeof editDashboardProfileSchema>;

const EditDashboardProfileComponent = () => {
    const instituteId = getInstituteId();
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const form = useForm<FormValues>({
        resolver: zodResolver(editDashboardProfileSchema),
        defaultValues: {
            instituteProfilePictureUrl: "",
            instituteProfilePictureId: undefined,
            instituteName: "",
            instituteType: "",
            instituteEmail: "",
            institutePhoneNumber: "",
            instituteWebsite: "",
            instituteAddress: "",
            instituteCountry: "",
            instituteState: "",
            instituteCity: "",
            institutePinCode: "",
        },
        mode: "onChange",
    });
    const handleFileSubmit = async (file: File) => {
        try {
            setIsUploading(true);
            // need to change soruce and soruceid and userId
            const fileId = await UploadFileInS3Public(
                file,
                setIsUploading,
                instituteId,
                "STUDENTS",
            );
            const imageUrl = URL.createObjectURL(file);
            form.setValue("instituteProfilePictureUrl", imageUrl);
            form.setValue("instituteProfilePictureId", fileId);
        } catch (error) {
            console.error("Upload failed:", error);
        } finally {
            setIsUploading(false);
        }
    };

    function onSubmit(values: FormValues) {
        console.log(values);
    }

    return (
        <>
            <Dialog>
                <DialogTrigger>
                    <MyButton
                        type="submit"
                        scale="medium"
                        buttonType="secondary"
                        layoutVariant="default"
                        className="text-sm"
                    >
                        <Plus size={32} />
                        Add Details
                    </MyButton>
                </DialogTrigger>
                <DialogContent className="flex h-4/5 flex-col overflow-auto p-0">
                    <h1 className="rounded-t-lg bg-primary-50 p-4 text-primary-500">
                        Edit Institute Profile
                    </h1>
                    <FormProvider {...form}>
                        <form>
                            <div className="flex flex-col items-center justify-center gap-8">
                                <div className="relative">
                                    {form.getValues("instituteProfilePictureUrl") ? (
                                        <img
                                            src={form.getValues("instituteProfilePictureUrl")}
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
                                        name="instituteProfilePictureId"
                                        acceptedFileTypes="image/*" // Optional - remove this line to accept all files
                                    />
                                    <MyButton
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        disabled={isUploading}
                                        buttonType="secondary"
                                        layoutVariant="icon"
                                        scale="small"
                                        className="absolute bottom-0 right-0 bg-white"
                                    >
                                        <PencilSimpleLine />
                                    </MyButton>
                                </div>
                                <div className="flex w-full flex-col gap-4 p-4">
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
                                                        error={
                                                            form.formState.errors.instituteName
                                                                ?.message
                                                        }
                                                        size="large"
                                                        label="Institute Name"
                                                        className="w-full"
                                                        {...field}
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
                                    <Separator />
                                    <MyButton
                                        type="button"
                                        scale="large"
                                        buttonType="primary"
                                        layoutVariant="default"
                                        onClick={form.handleSubmit(onSubmit)}
                                        className="mt-4"
                                    >
                                        Save Changes
                                    </MyButton>
                                    <FormField
                                        control={form.control}
                                        name="instituteEmail"
                                        render={({ field: { onChange, value, ...field } }) => (
                                            <FormItem>
                                                <FormControl>
                                                    <MyInput
                                                        inputType="text"
                                                        inputPlaceholder="Institute Email"
                                                        input={value}
                                                        onChangeFunction={onChange}
                                                        required={true}
                                                        error={
                                                            form.formState.errors.instituteEmail
                                                                ?.message
                                                        }
                                                        size="large"
                                                        label="Institute Email"
                                                        className="w-full"
                                                        {...field}
                                                    />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="institutePhoneNumber"
                                        render={({ field: { onChange, value, ...field } }) => (
                                            <FormItem>
                                                <FormControl>
                                                    <MyInput
                                                        inputType="text"
                                                        inputPlaceholder="Institute Phone Number"
                                                        input={value}
                                                        onChangeFunction={onChange}
                                                        required={true}
                                                        error={
                                                            form.formState.errors
                                                                .institutePhoneNumber?.message
                                                        }
                                                        size="large"
                                                        label="Institute Phone Number"
                                                        className="w-full"
                                                        {...field}
                                                    />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="instituteWebsite"
                                        render={({ field: { onChange, value, ...field } }) => (
                                            <FormItem>
                                                <FormControl>
                                                    <MyInput
                                                        inputType="text"
                                                        inputPlaceholder="Institute Website"
                                                        input={value}
                                                        onChangeFunction={onChange}
                                                        required={true}
                                                        error={
                                                            form.formState.errors.instituteWebsite
                                                                ?.message
                                                        }
                                                        size="large"
                                                        label="Institute Website"
                                                        className="w-full"
                                                        {...field}
                                                    />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </div>
                        </form>
                    </FormProvider>
                </DialogContent>
            </Dialog>
        </>
    );
};

export default EditDashboardProfileComponent;
