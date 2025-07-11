import { MyButton } from '@/components/design-system/button';
import { MyDialog } from '@/components/design-system/dialog';
import { MyDropdown } from '@/components/common/students/enroll-manually/dropdownForPackageItems';
import { MyInput } from '@/components/design-system/input';
import PhoneInputField from '@/components/design-system/phone-input-field';
import { FormControl, FormField, FormItem } from '@/components/ui/form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, FormProvider } from 'react-hook-form';
import { z } from 'zod';
import { useEffect, useRef, useState } from 'react';
import { EnrollFormUploadImage } from '@/assets/svgs';
import { FileUploadComponent } from '@/components/design-system/file-upload';
import { useFileUpload } from '@/hooks/use-file-upload';
import { TokenKey } from '@/constants/auth/tokens';
import { getTokenDecodedData, getTokenFromCookie } from '@/lib/auth/sessionUtility';
import { useEditStudentDetails } from '@/routes/manage-students/students-list/-services/editStudentDetails';
import { DashboardLoader } from '@/components/core/dashboard-loader';
import { useStudentSidebar } from '@/routes/manage-students/students-list/-context/selected-student-sidebar-context';
import { useInstituteDetailsStore } from '@/stores/students/students-list/useInstituteDetailsStore';
import { DropdownValueType } from '@/components/common/students/enroll-manually/dropdownTypesForPackageItems';
import { Menu, Transition } from '@headlessui/react';
import { Pencil, Upload, Trash2 } from 'lucide-react';
import { RoleTerms, SystemTerms } from '@/routes/settings/-components/NamingSettings';
import { getTerminology } from '@/components/common/layout-container/sidebar/utils';

const EditStudentDetailsFormSchema = z.object({
    user_id: z.string().min(1, 'This field is required'),
    email: z.string().email('Invalid email address'),
    full_name: z.string().min(1, 'This field is required'),
    contact_number: z.string().min(1, 'This field is required'),
    gender: z.string().min(1, 'This field is required'),
    address_line: z.string().optional(),
    state: z.string().optional(),
    pin_code: z.string().optional(),
    institute_name: z.string().optional(),
    father_name: z.string().optional(),
    mother_name: z.string().optional(),
    parents_mobile_number: z.string().optional(),
    parents_email: z.string().email('Invalid email').optional().or(z.literal('')),
    face_file_id: z.string().optional().or(z.literal('')),
});

export type EditStudentDetailsFormValues = z.infer<typeof EditStudentDetailsFormSchema>;

export const EditStudentDetails = () => {
    const { selectedStudent, setSelectedStudent } = useStudentSidebar();
    const form = useForm<EditStudentDetailsFormValues>({
        resolver: zodResolver(EditStudentDetailsFormSchema),
        defaultValues: {},
    });

    const { setValue } = form;
    const { instituteDetails } = useInstituteDetailsStore();
    const genderList: DropdownValueType[] =
        instituteDetails?.genders.map((gender) => ({ id: crypto.randomUUID(), name: gender })) ||
        [];

    const accessToken = getTokenFromCookie(TokenKey.accessToken);
    const data = getTokenDecodedData(accessToken);
    const INSTITUTE_ID = data && Object.keys(data.authorities)[0];

    const [faceUrl, setFaceUrl] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const { uploadFile, getPublicUrl } = useFileUpload();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const formRef = useRef<HTMLFormElement>(null);
    const [openDialog, setOpenDialog] = useState(false);
    const [removedImage, setRemovedImage] = useState(false); // 🆕 new state for tracking unsaved removal

    const loadImage = async (fileId: string) => {
        if (fileId) {
            const url = await getPublicUrl(fileId);
            setFaceUrl(url || '');
        }
    };

    useEffect(() => {
        if (selectedStudent && openDialog) {
            form.reset({
                user_id: selectedStudent?.user_id || '',
                email: selectedStudent?.email || '',
                full_name: selectedStudent?.full_name || '',
                contact_number: selectedStudent?.mobile_number || '',
                gender: selectedStudent?.gender || '',
                address_line: selectedStudent?.address_line || '',
                state: selectedStudent?.region || '',
                pin_code: selectedStudent?.pin_code || '',
                institute_name: selectedStudent?.linked_institute_name || '',
                father_name: selectedStudent?.father_name || '',
                mother_name: selectedStudent?.mother_name || '',
                parents_mobile_number: selectedStudent?.parents_mobile_number || '',
                parents_email: selectedStudent?.parents_email || '',
                face_file_id: selectedStudent?.face_file_id || '',
            });

            if (selectedStudent.face_file_id && !removedImage) {
                loadImage(selectedStudent.face_file_id);
            } else {
                setFaceUrl(null); // fallback if image was removed
            }

            setRemovedImage(false); // reset on open
        }
    }, [selectedStudent, openDialog]);

    const handleFileSubmit = async (file: File) => {
        setIsUploading(true);
        const fileId = await uploadFile({
            file,
            setIsUploading,
            userId: selectedStudent?.user_id || '',
            source: INSTITUTE_ID || '',
            sourceId: 'STUDENTS',
        });

        if (fileId) {
            await loadImage(fileId);
            setValue('face_file_id', fileId);
        }

        setIsUploading(false);
    };

    const handleRemoveImage = () => {
        setFaceUrl(null);
        setValue('face_file_id', '');
        setRemovedImage(true); // 🆕 flag to remember removal
    };

    const handleDialogChange = (isOpen: boolean) => {
        setOpenDialog(isOpen);
    };

    const editStudentDetailsMutation = useEditStudentDetails();
    const onSubmit = async (values: EditStudentDetailsFormValues) => {
        try {
            const face_file_id = form.getValues('face_file_id') ?? '';

            const payload = { ...values, face_file_id };

            await editStudentDetailsMutation.mutateAsync(payload);

            if (selectedStudent) {
                const updatedStudent = {
                    ...selectedStudent,
                    ...payload,
                    id: selectedStudent.id,
                    mobile_number: payload.contact_number,
                    region: payload.state ?? null,
                    linked_institute_name: payload.institute_name ?? null,
                    face_file_id: payload.face_file_id ?? '', // Ensure it's a string
                };

                setSelectedStudent(updatedStudent);
            }

            if (face_file_id) {
                const newFaceUrl = await getPublicUrl(face_file_id);
                setFaceUrl(newFaceUrl || '');
            } else {
                setFaceUrl(null); // if image was removed
            }

            setOpenDialog(false);
        } catch (err) {
            console.error('Failed to update student:', err);
        }
    };

    const submitButton = (
        <MyButton onClick={() => formRef.current?.requestSubmit()}>Save Changes</MyButton>
    );

    return selectedStudent ? (
        <MyDialog
            trigger={
                <div className="flex w-full justify-center">
                    <MyButton buttonType="secondary" scale="medium">
                        ✏️ Edit Details
                    </MyButton>
                </div>
            }
            footer={submitButton}
            heading={`Edit ${getTerminology(RoleTerms.Learner, SystemTerms.Learner)} Details`}
            open={openDialog}
            onOpenChange={handleDialogChange}
            dialogWidth="w-[35vw]"
        >
            <FormProvider {...form}>
                <form
                    ref={formRef}
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="flex max-h-[80vh] w-full flex-col items-center gap-4"
                >
                    <div className="flex flex-col items-center">
                        {isUploading ? (
                            <DashboardLoader />
                        ) : (
                            <div className="relative">
                                {faceUrl ? (
                                    <img
                                        src={faceUrl}
                                        alt="Profile"
                                        className="size-[300px] rounded-full object-cover"
                                    />
                                ) : (
                                    <div className="flex size-[320px] items-center justify-center rounded-full bg-neutral-100">
                                        <EnrollFormUploadImage />
                                    </div>
                                )}

                                {faceUrl && (
                                    <div className="absolute bottom-3 right-3 z-10">
                                        <Menu as="div" className="relative inline-block text-left">
                                            <Menu.Button className="rounded-full bg-white p-1 shadow hover:bg-neutral-100">
                                                <Pencil className="size-5 text-neutral-700" />
                                            </Menu.Button>
                                            <Transition
                                                enter="transition ease-out duration-100"
                                                enterFrom="transform opacity-0 scale-95"
                                                enterTo="transform opacity-100 scale-100"
                                                leave="transition ease-in duration-75"
                                                leaveFrom="transform opacity-100 scale-100"
                                                leaveTo="transform opacity-0 scale-95"
                                            >
                                                <Menu.Items className="absolute bottom-10 right-0 z-20 w-40 origin-bottom-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black/5 focus:outline-none">
                                                    <div className="p-1">
                                                        <Menu.Item>
                                                            {({ active }) => (
                                                                <button
                                                                    type="button"
                                                                    onClick={() =>
                                                                        fileInputRef.current?.click()
                                                                    }
                                                                    className={`${
                                                                        active
                                                                            ? 'bg-neutral-100'
                                                                            : ''
                                                                    } group flex w-full items-center gap-2 rounded-md p-2 text-sm`}
                                                                >
                                                                    <Upload className="size-4" />
                                                                    Upload New
                                                                </button>
                                                            )}
                                                        </Menu.Item>
                                                        <Menu.Item>
                                                            {({ active }) => (
                                                                <button
                                                                    type="button"
                                                                    onClick={handleRemoveImage}
                                                                    className={`${
                                                                        active
                                                                            ? 'bg-neutral-100'
                                                                            : ''
                                                                    } group flex w-full items-center gap-2 rounded-md p-2 text-sm text-red-600`}
                                                                >
                                                                    <Trash2 className="size-4" />
                                                                    Remove Image
                                                                </button>
                                                            )}
                                                        </Menu.Item>
                                                    </div>
                                                </Menu.Items>
                                            </Transition>
                                        </Menu>
                                    </div>
                                )}
                            </div>
                        )}

                        <FileUploadComponent
                            fileInputRef={fileInputRef}
                            onFileSubmit={handleFileSubmit}
                            control={form.control}
                            name="face_file_id"
                            acceptedFileTypes="image/*"
                        />

                        {!faceUrl && (
                            <div className="mt-2">
                                <MyButton
                                    onClick={() => fileInputRef.current?.click()}
                                    disable={isUploading}
                                    buttonType="secondary"
                                    layoutVariant="default"
                                    scale="large"
                                    type="button"
                                >
                                    Upload Image
                                </MyButton>
                            </div>
                        )}
                    </div>

                    {/* Form Fields */}
                    <FormField
                        control={form.control}
                        name="full_name"
                        render={({ field }) => (
                            <FormItem className="w-full">
                                <FormControl className="w-full">
                                    <MyInput
                                        input={field.value}
                                        onChangeFunction={(e) => field.onChange(e.target.value)}
                                        inputType="text"
                                        inputPlaceholder="Full Name"
                                        className="w-full"
                                        required={true}
                                        label="Full Name"
                                        error={form.formState.errors.full_name?.message}
                                    />
                                </FormControl>
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem className="w-full">
                                <FormControl className="w-full">
                                    <MyInput
                                        input={field.value}
                                        onChangeFunction={(e) => field.onChange(e.target.value)}
                                        inputType="text"
                                        inputPlaceholder="Email"
                                        className="w-full"
                                        required={true}
                                        label="Email"
                                        error={form.formState.errors.email?.message}
                                    />
                                </FormControl>
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="contact_number"
                        render={() => (
                            <FormItem className="w-full">
                                <FormControl>
                                    <div className="flex flex-col gap-1">
                                        <PhoneInputField
                                            label="Mobile Number"
                                            placeholder="123 456 7890"
                                            name="mobileNumber"
                                            control={form.control}
                                            country="in"
                                            required={true}
                                        />
                                        <p className="text-subtitle text-danger-600">
                                            {form.formState.errors.contact_number?.message}
                                        </p>
                                    </div>
                                </FormControl>
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="gender"
                        render={({ field }) => (
                            <FormItem className="w-full">
                                <FormControl>
                                    <div className="flex flex-col gap-1">
                                        <div>
                                            Gender{' '}
                                            <span className="text-subtitle text-danger-600">*</span>
                                        </div>
                                        <MyDropdown
                                            currentValue={field.value}
                                            dropdownList={genderList}
                                            handleChange={field.onChange}
                                            placeholder="Select Gender"
                                            error={form.formState.errors.gender?.message}
                                            required={true}
                                        />
                                    </div>
                                </FormControl>
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="address_line"
                        render={({ field }) => (
                            <FormItem className="w-full">
                                <FormControl className="w-full">
                                    <MyInput
                                        input={field.value}
                                        onChangeFunction={(e) => field.onChange(e.target.value)}
                                        inputType="text"
                                        inputPlaceholder="Address Line"
                                        className="w-full"
                                        label="Address Line"
                                        error={form.formState.errors.address_line?.message}
                                    />
                                </FormControl>
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="state"
                        render={({ field }) => (
                            <FormItem className="w-full">
                                <FormControl className="w-full">
                                    <MyInput
                                        input={field.value}
                                        onChangeFunction={(e) => field.onChange(e.target.value)}
                                        inputType="text"
                                        inputPlaceholder="State"
                                        className="w-full"
                                        label="State"
                                        error={form.formState.errors.state?.message}
                                    />
                                </FormControl>
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="pin_code"
                        render={({ field: { onChange, value, ...field } }) => (
                            <FormItem className="w-full">
                                <FormControl className="w-full">
                                    <MyInput
                                        inputType="number"
                                        label="Pincode"
                                        inputPlaceholder="Eg.425562"
                                        input={value}
                                        onChangeFunction={onChange}
                                        size="large"
                                        className="w-full"
                                        {...field}
                                        error={form.formState.errors.pin_code?.message}
                                    />
                                </FormControl>
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="institute_name"
                        render={({ field }) => (
                            <FormItem className="w-full">
                                <FormControl className="w-full">
                                    <MyInput
                                        input={field.value}
                                        onChangeFunction={(e) => field.onChange(e.target.value)}
                                        inputType="text"
                                        inputPlaceholder="Institute Name"
                                        className="w-full"
                                        label="Institute Name"
                                        error={form.formState.errors.institute_name?.message}
                                    />
                                </FormControl>
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="father_name"
                        render={({ field }) => (
                            <FormItem className="w-full">
                                <FormControl className="w-full">
                                    <MyInput
                                        input={field.value}
                                        onChangeFunction={(e) => field.onChange(e.target.value)}
                                        inputType="text"
                                        inputPlaceholder="Father/Male Gardian Name"
                                        className="w-full"
                                        label="Father/Male Gardian Name"
                                        error={form.formState.errors.father_name?.message}
                                    />
                                </FormControl>
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="mother_name"
                        render={({ field }) => (
                            <FormItem className="w-full">
                                <FormControl className="w-full">
                                    <MyInput
                                        input={field.value}
                                        onChangeFunction={(e) => field.onChange(e.target.value)}
                                        inputType="text"
                                        inputPlaceholder="Mother/Female Gardian Name"
                                        className="w-full"
                                        label="Mother/Female Gardian Name"
                                        error={form.formState.errors.mother_name?.message}
                                    />
                                </FormControl>
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="parents_mobile_number"
                        render={() => (
                            <FormItem className="w-full">
                                <FormControl>
                                    <div className="flex flex-col gap-1">
                                        <PhoneInputField
                                            label="Parents Mobile Number"
                                            placeholder="123 456 7890"
                                            name="mobileNumber"
                                            control={form.control}
                                            country="in"
                                            required={false}
                                        />
                                        <p className="text-subtitle text-danger-600">
                                            {form.formState.errors.parents_mobile_number?.message}
                                        </p>
                                    </div>
                                </FormControl>
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="parents_email"
                        render={({ field }) => (
                            <FormItem className="w-full">
                                <FormControl className="w-full">
                                    <MyInput
                                        input={field.value}
                                        onChangeFunction={(e) => field.onChange(e.target.value)}
                                        inputType="email"
                                        inputPlaceholder="Parents Email"
                                        className="w-full"
                                        label="Parents Email"
                                        error={form.formState.errors.parents_email?.message}
                                    />
                                </FormControl>
                            </FormItem>
                        )}
                    />
                </form>
            </FormProvider>
        </MyDialog>
    ) : (
        <p>No Student Found</p>
    );
};
