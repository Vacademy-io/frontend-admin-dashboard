import { MyButton } from '@/components/design-system/button';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { FormControl, FormField, FormItem } from '@/components/ui/form';
import { zodResolver } from '@hookform/resolvers/zod';
import { FormProvider, useForm } from 'react-hook-form';
import { z } from 'zod';
import { adminProfileSchema } from '../-utils/admin-profile-schema';
import { OnboardingFrame } from '@/svgs';
import { FileUploadComponent } from '@/components/design-system/file-upload';
import { useEffect, useRef, useState } from 'react';
import { getInstituteId } from '@/constants/helper';
import { UploadFileInS3Public } from '@/routes/signup/-services/signup-services';
import { PencilSimpleLine } from 'phosphor-react';
import { MyInput } from '@/components/design-system/input';
import PhoneInputField from '@/components/design-system/phone-input-field';
import { Separator } from '@/components/ui/separator';
import MultiSelectDropdown from '@/components/design-system/multiple-select-field';
import { UserProfile } from '@/services/student-list-section/getAdminDetails';
import useAdminLogoStore from '@/components/common/layout-container/sidebar/admin-logo-zustand';
import { RoleType } from '@/constants/dummy-data';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { AxiosError } from 'axios';
import { handleUpdateAdminDetails } from '../-services/dashboard-services';

type FormValues = z.infer<typeof adminProfileSchema>;

const AdminProfile = ({ adminDetails }: { adminDetails: UserProfile }) => {
    const instituteId = getInstituteId();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [open, setOpen] = useState(false);
    const queryClient = useQueryClient();
    const [newRoles, setNewRoles] = useState<string[]>([]);
    const oldRoles = useRef<string[]>([]);
    const form = useForm<FormValues>({
        resolver: zodResolver(adminProfileSchema),
        defaultValues: {
            profilePictureUrl: '',
            profilePictureId: undefined,
            name: '',
            roleType: [],
            email: '',
            phone: '',
        },
        mode: 'onChange',
    });
    form.watch('roleType');

    const { handleSubmit } = form;
    const [isUploading, setIsUploading] = useState(false);

    const handleSubmitEditDataMutation = useMutation({
        mutationFn: ({ data }: { data: z.infer<typeof adminProfileSchema> }) =>
            handleUpdateAdminDetails(data, adminDetails.roles, oldRoles.current, newRoles),
        onSuccess: () => {
            toast.success('Your details has been updated successfully!', {
                className: 'success-toast',
                duration: 2000,
            });
            setOpen(false);
            queryClient.invalidateQueries({ queryKey: ['GET_ADMIN_DETAILS'] });
        },
        onError: (error: unknown) => {
            if (error instanceof AxiosError) {
                toast.error(error.message, {
                    className: 'error-toast',
                    duration: 2000,
                });
            } else {
                // Handle non-Axios errors if necessary
                console.error('Unexpected error:', error);
            }
        },
    });

    function onSubmit(values: FormValues) {
        handleSubmitEditDataMutation.mutate({
            data: values,
        });
    }

    const onInvalid = (err: unknown) => {
        console.log(err);
    };

    const handleFileSubmit = async (file: File) => {
        try {
            setIsUploading(true);
            // need to change soruce and soruceid and userId
            const fileId = await UploadFileInS3Public(
                file,
                setIsUploading,
                instituteId,
                'STUDENTS'
            );
            const imageUrl = URL.createObjectURL(file);
            form.setValue('profilePictureUrl', imageUrl);
            form.setValue('profilePictureId', fileId);
        } catch (error) {
            console.error('Upload failed:', error);
        } finally {
            setIsUploading(false);
        }
    };

    const { adminLogo } = useAdminLogoStore();

    useEffect(() => {
        const resetFormWithUrl = async () => {
            form.reset({
                profilePictureUrl: adminLogo || '',
                profilePictureId: adminDetails?.profile_pic_file_id ?? undefined,
                name: adminDetails?.full_name || '',
                roleType: adminDetails.roles.map((role) => role.role_name) || [],
                email: adminDetails?.email,
                phone: adminDetails?.mobile_number || '',
            });
            oldRoles.current = adminDetails.roles.map((role) => role.role_name);
        };
        resetFormWithUrl();
    }, [adminDetails, adminLogo]);

    useEffect(() => {
        const subscription = form.watch(() => {
            setNewRoles([...form.getValues('roleType')]);
        });

        return () => subscription.unsubscribe(); // cleanup
    }, [form.watch('roleType')]);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger>
                <MyButton
                    type="submit"
                    scale="large"
                    buttonType="secondary"
                    layoutVariant="default"
                    className="text-sm"
                >
                    Edit Profile
                </MyButton>
            </DialogTrigger>
            <DialogContent className="flex h-4/5 w-1/3 flex-col p-0 [&>button>svg]:size-5 [&>button>svg]:text-neutral-600">
                <h1 className="rounded-t-lg bg-primary-50 p-4 font-semibold text-primary-500">
                    Edit Profile
                </h1>
                <div className="flex h-full flex-1 flex-col">
                    <FormProvider {...form}>
                        <form
                            className="flex h-[86%] flex-col"
                            onSubmit={handleSubmit(onSubmit, onInvalid)}
                        >
                            {/* Scrollable form content */}
                            <div className="flex-1 overflow-y-auto p-4">
                                <div className="flex flex-col items-center justify-center gap-8">
                                    {/* Profile Picture Upload */}
                                    <div className="relative">
                                        {form.getValues('profilePictureUrl') ? (
                                            <img
                                                src={form.getValues('profilePictureUrl')}
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
                                            name="profilePictureId"
                                            acceptedFileTypes="image/*"
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

                                    {/* Form Fields */}
                                    <div className="flex w-full flex-col gap-4">
                                        {/* instituteName */}
                                        <FormField
                                            control={form.control}
                                            name="name"
                                            render={({ field: { onChange, value, ...field } }) => (
                                                <FormItem>
                                                    <FormControl>
                                                        <MyInput
                                                            inputType="text"
                                                            inputPlaceholder="Full Name (First and Last)"
                                                            input={value}
                                                            onChangeFunction={onChange}
                                                            required={true}
                                                            error={
                                                                form.formState.errors.name?.message
                                                            }
                                                            size="large"
                                                            label="Profile Name"
                                                            className="w-full"
                                                            {...field}
                                                        />
                                                    </FormControl>
                                                </FormItem>
                                            )}
                                        />
                                        <MultiSelectDropdown
                                            form={form}
                                            label="Role Type"
                                            name="roleType"
                                            options={RoleType.map((option, index) => ({
                                                value: option.name,
                                                label: option.name,
                                                _id: index,
                                            }))}
                                            control={form.control}
                                            className="flex w-full flex-col"
                                            required
                                        />
                                        <Separator />
                                        <h1 className="text-lg font-semibold">
                                            Contact Information
                                        </h1>
                                        <FormField
                                            control={form.control}
                                            name="email"
                                            render={({ field: { onChange, value, ...field } }) => (
                                                <FormItem>
                                                    <FormControl>
                                                        <MyInput
                                                            inputType="text"
                                                            inputPlaceholder="you@email.com"
                                                            input={value}
                                                            onChangeFunction={onChange}
                                                            error={
                                                                form.formState.errors.email?.message
                                                            }
                                                            size="large"
                                                            label="Email"
                                                            className="w-full"
                                                            {...field}
                                                        />
                                                    </FormControl>
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="phone"
                                            render={({ field: { value } }) => (
                                                <FormItem>
                                                    <FormControl>
                                                        <PhoneInputField
                                                            label="Mobile Number"
                                                            placeholder="123 456 7890"
                                                            name="phone"
                                                            control={form.control}
                                                            labelStyle="text-base font-normal"
                                                            country="in"
                                                            required={false}
                                                            value={value}
                                                        />
                                                    </FormControl>
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Fixed Save Changes button */}
                            <div className="flex justify-center bg-white p-4 pb-0">
                                <MyButton
                                    type="submit"
                                    scale="large"
                                    buttonType="secondary"
                                    layoutVariant="default"
                                    disable={Object.keys(form.formState.errors).length > 0}
                                >
                                    Save Changes
                                </MyButton>
                            </div>
                        </form>
                    </FormProvider>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default AdminProfile;
