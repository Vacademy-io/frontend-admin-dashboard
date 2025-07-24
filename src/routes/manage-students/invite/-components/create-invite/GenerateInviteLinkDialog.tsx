import { MyButton } from '@/components/design-system/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useFieldArray, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form } from '@/components/ui/form';
import { Gift, CalendarBlank } from 'phosphor-react';
import { useInstituteDetailsStore } from '@/stores/students/students-list/useInstituteDetailsStore';
import { TokenKey } from '@/constants/auth/tokens';
import { getTokenDecodedData, getTokenFromCookie } from '@/lib/auth/sessionUtility';
import { useFileUpload } from '@/hooks/use-file-upload';
import { useEffect, useRef } from 'react';
import { useForm as useShadForm } from 'react-hook-form';
import { zodResolver as shadZodResolver } from '@hookform/resolvers/zod';
import { useForm as useDiscountForm } from 'react-hook-form';
import { zodResolver as discountZodResolver } from '@hookform/resolvers/zod';
import {
    AddDiscountFormValues,
    addDiscountSchema,
    AddPlanFormValues,
    addPlanSchema,
    AddReferralFormValues,
    addReferralSchema,
    GenerateInviteLinkDialogProps,
    InviteLinkFormValues,
    inviteLinkSchema,
} from './GenerateInviteLinkSchema';
import { PaymentPlansDialog } from './PaymentPlansDialog';
import AddPaymentPlanDialog from './AddPaymentPlanDialog';
import { DiscountSettingsDialog } from './DiscountSettingsDialog';
import { AddDiscountDialog } from './AddDiscountDialog';
import { AddReferralProgramDialog } from './AddReferralProgramDialog';
import { ReferralProgramDialog } from './ReferralProgramDialog';
import InstituteBrandingCard from './-components/InstituteBrandingCard';
import EnrollmentSettingsCard from './-components/EnrollmentSettingsCard';
import CoursePreviewCard from './-components/CoursePreviewCard';
import PaymentPlanCard from './-components/PaymentPlanCard';
import DiscountSettingsCard from './-components/DiscountSettingsCard';
import ReferralProgramCard from './-components/ReferralProgramCard';
import RestrictSameBatch from './-components/RestrictSameBatch';
import CustomInviteFormCard from './-components/CustomInviteFormCard';
import LearnerAccessDurationCard from './-components/LearnerAccessDurationCard';
import InviteViaEmailCard from './-components/InviteViaEmailCard';
import CustomHTMLCard from './-components/CustomHTMLCard';
import ShowRelatedCoursesCard from './-components/ShowRelatedCoursesCard';
import { toast } from 'sonner';
import { AxiosError } from 'axios';
import { handleEnrollInvite } from './-services/enroll-invite';
import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query';
import { handleGetPaymentDetails } from './-services/get-payments';
import InviteNameCard from './-components/InviteNameCard';

const GenerateInviteLinkDialog = ({
    showSummaryDialog,
    setShowSummaryDialog,
    selectedCourse,
    selectedBatches,
}: GenerateInviteLinkDialogProps) => {
    const queryClient = useQueryClient();
    const { data: paymentsData } = useSuspenseQuery(handleGetPaymentDetails());
    const form = useForm<InviteLinkFormValues>({
        resolver: zodResolver(inviteLinkSchema),
        defaultValues: {
            name: '',
            includeInstituteLogo: false,
            requireApproval: false,
            course: '',
            description: '',
            learningOutcome: '',
            aboutCourse: '',
            targetAudience: '',
            coursePreview: '',
            courseBanner: '',
            courseMedia: { type: '', id: '' },
            coursePreviewBlob: '',
            courseBannerBlob: '',
            courseMediaBlob: '',
            tags: [],
            custom_fields: [
                {
                    id: '0',
                    type: 'textfield',
                    name: 'Full Name',
                    oldKey: true,
                    isRequired: true,
                    key: 'full_name',
                    order: 0,
                },
                {
                    id: '1',
                    type: 'textfield',
                    name: 'Email',
                    oldKey: true,
                    isRequired: true,
                    key: 'email',
                    order: 1,
                },
                {
                    id: '2',
                    type: 'textfield',
                    name: 'Phone Number',
                    oldKey: true,
                    isRequired: true,
                    key: 'phone_number',
                    order: 2,
                },
            ],
            uploadingStates: {
                coursePreview: false,
                courseBanner: false,
                courseMedia: false,
            },
            youtubeUrl: '',
            youtubeError: '',
            showYoutubeInput: false,
            showMediaMenu: false,
            freePlans: [],
            paidPlans: [],
            showPlansDialog: false,
            selectedPlan: {},
            showAddPlanDialog: false,
            showDiscountDialog: false,
            discounts: [
                {
                    id: 'none',
                    title: 'No Discount Applied',
                    code: '',
                    type: '',
                    value: 0,
                    expires: '',
                },
                {
                    id: 'd1',
                    title: 'Early Bird',
                    code: 'EARLY20',
                    type: 'percent',
                    value: 20,
                    expires: '2024-07-31',
                },
                {
                    id: 'd2',
                    title: 'Flat 500 Off',
                    code: 'FLAT500',
                    type: 'rupees',
                    value: 500,
                    expires: '2024-08-15',
                },
                {
                    id: 'd3',
                    title: 'Summer Special',
                    code: 'SUMMER10',
                    type: 'percent',
                    value: 10,
                    expires: '2024-09-01',
                },
                {
                    id: 'd4',
                    title: 'Festive Bonanza',
                    code: 'FESTIVE25',
                    type: 'percent',
                    value: 25,
                    expires: '2024-10-10',
                },
                {
                    id: 'd5',
                    title: 'New User Offer',
                    code: 'NEWUSER100',
                    type: 'rupees',
                    value: 100,
                    expires: '2024-12-31',
                },
                {
                    id: 'd6',
                    title: 'Flash Sale',
                    code: 'FLASH50',
                    type: 'percent',
                    value: 50,
                    expires: '2024-08-01',
                },
                {
                    id: 'd7',
                    title: 'Refer & Earn',
                    code: 'REFER150',
                    type: 'rupees',
                    value: 150,
                    expires: '2024-09-15',
                },
            ],
            showAddDiscountDialog: false,
            selectedDiscountId: 'none',
            referralPrograms: [],
            selectedReferralId: 'r1',
            showReferralDialog: false,
            showAddReferralDialog: false,
            restrictToSameBatch: false,
            accessDurationType: 'define',
            accessDurationDays: '',
            inviteeEmail: '',
            inviteeEmails: [],
            customHtml: '',
            showRelatedCourses: false,
            selectedOptionValue: 'textfield',
            textFieldValue: '',
            dropdownOptions: [
                {
                    id: '0',
                    value: 'MALE',
                    disabled: true,
                },
                {
                    id: '1',
                    value: 'FEMALE',
                    disabled: true,
                },
                {
                    id: '2',
                    value: 'OTHER',
                    disabled: true,
                },
            ],
            isDialogOpen: false,
        },
    });

    const { control, setValue, getValues, handleSubmit } = form;
    const { fields: customFieldsArray } = useFieldArray({
        control,
        name: 'custom_fields',
    });
    const customFields = getValues('custom_fields');

    const { instituteDetails, getPackageSessionId } = useInstituteDetailsStore();
    const allTags = instituteDetails?.tags || [];
    const accessToken = getTokenFromCookie(TokenKey.accessToken);
    const data = getTokenDecodedData(accessToken);
    const INSTITUTE_ID = data && Object.keys(data.authorities)[0];

    const { uploadFile, getPublicUrl } = useFileUpload();

    const coursePreviewRef = useRef<HTMLInputElement>(null);
    const courseBannerRef = useRef<HTMLInputElement>(null);
    const courseMediaRef = useRef<HTMLInputElement>(null);
    const mediaMenuRef = useRef<HTMLDivElement>(null);
    const youtubeInputRef = useRef<HTMLDivElement>(null);

    const handleSubmitRatingMutation = useMutation({
        mutationFn: async ({ data }: { data: InviteLinkFormValues }) => {
            return handleEnrollInvite({
                data,
                selectedCourse,
                selectedBatches,
                getPackageSessionId,
                paymentsData,
            });
        },
        onSuccess: () => {
            toast.success('Your invite link has been created successfully!', {
                className: 'success-toast',
                duration: 2000,
            });
            form.reset();
            setShowSummaryDialog(false);
            queryClient.invalidateQueries({ queryKey: ['inviteList'] });
        },
        onError: (error: unknown) => {
            if (error instanceof AxiosError) {
                toast.error(error?.response?.data?.ex, {
                    className: 'error-toast',
                    duration: 2000,
                });
            } else {
                toast.error('An unexpected error occurred', {
                    className: 'error-toast',
                    duration: 2000,
                });
                console.error('Unexpected error:', error);
            }
        },
    });
    const onSubmit = (data: InviteLinkFormValues) => {
        handleSubmitRatingMutation.mutate({ data });
    };

    const onInvalid = (err: unknown) => {
        console.error(err);
    };

    const addPlanForm = useShadForm<AddPlanFormValues>({
        resolver: shadZodResolver(addPlanSchema),
        defaultValues: {
            planType: 'free',
            name: '',
            description: '',
            price: '',
        },
    });

    const handleAddPlan = (values: AddPlanFormValues) => {
        if (values.planType === 'free') {
            const freePlans = form.getValues('freePlans');
            form.setValue('freePlans', [
                ...freePlans,
                {
                    id: `free${freePlans.length + 1}`,
                    name: values.name,
                    description: values.description,
                },
            ]);
        } else {
            const paidPlans = form.getValues('paidPlans');
            form.setValue('paidPlans', [
                ...paidPlans,
                {
                    id: `paid${paidPlans.length + 1}`,
                    name: values.name,
                    description: values.description,
                    price: values.price || '',
                },
            ]);
        }
        form.setValue('showAddPlanDialog', false);
        addPlanForm.reset();
    };

    const extractYouTubeVideoId = (url: string): string | null => {
        const regExp = /^.*(?:youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        return match && match[1] && match[1].length === 11 ? match[1] : null;
    };

    const handleFileUpload = async (
        file: File,
        field: 'coursePreview' | 'courseBanner' | 'courseMedia'
    ) => {
        try {
            const prev = form.getValues('uploadingStates');
            form.setValue('uploadingStates', { ...prev, [field]: true });

            const uploadedFileId = await uploadFile({
                file,
                setIsUploading: (state) =>
                    form.setValue('uploadingStates', { ...prev, [field]: state }),
                userId: 'your-user-id',
                source: INSTITUTE_ID,
                sourceId: 'COURSES',
            });

            const publicUrl = await getPublicUrl(uploadedFileId || '');

            if (uploadedFileId) {
                if (field === 'courseMedia') {
                    form.setValue(field, {
                        type: file.type.includes('video') ? 'video' : 'image',
                        id: uploadedFileId,
                    }); // set as string
                } else {
                    form.setValue(field, uploadedFileId); // set as string
                }
                if (field === 'coursePreview') {
                    form.setValue('coursePreviewBlob', publicUrl);
                } else if (field === 'courseBanner') {
                    form.setValue('courseBannerBlob', publicUrl);
                } else if (field === 'courseMedia') {
                    form.setValue('courseMediaBlob', publicUrl);
                }
            }
        } catch (error) {
            console.error('Upload failed:', error);
        } finally {
            const prev = form.getValues('uploadingStates');
            form.setValue('uploadingStates', { ...prev, [field]: false });
        }
    };

    const handleTagInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const input = e.target.value;
        setValue('newTag', input);

        if (input.trim()) {
            const filtered = allTags
                ?.filter(
                    (tag) =>
                        tag.toLowerCase().includes(input.toLowerCase()) &&
                        !form.watch('tags').includes(tag) // Exclude already selected tags
                )
                .slice(0, 5);
            setValue('filteredTags', filtered);
        } else {
            setValue('filteredTags', []);
        }
    };

    const addTag = (e?: React.MouseEvent | React.KeyboardEvent, selectedTag?: string) => {
        if (e) e.preventDefault();
        const newTagValue = (form.watch('newTag') || '').trim();
        const tagToAdd = selectedTag || newTagValue;
        if (tagToAdd && !form.watch('tags').includes(tagToAdd)) {
            const updatedTags = [...form.watch('tags'), tagToAdd];
            setValue('tags', updatedTags);
        }
        setValue('newTag', '');
        setValue('filteredTags', []);
    };

    const removeTag = (tagToRemove: string) => {
        const updatedTags = form.watch('tags').filter((tag) => tag !== tagToRemove);
        setValue('tags', updatedTags);
    };

    const addDiscountForm = useDiscountForm<AddDiscountFormValues>({
        resolver: discountZodResolver(addDiscountSchema),
        defaultValues: {
            title: '',
            code: '',
            type: 'percent',
            value: 0,
            expires: '',
        },
    });

    const handleAddDiscount = (values: AddDiscountFormValues) => {
        const prevDiscounts = form.getValues('discounts');
        form.setValue('discounts', [
            ...prevDiscounts,
            {
                id: `d${prevDiscounts.length + 1}`,
                ...values,
            },
        ]);
        form.setValue('showAddDiscountDialog', false);
        addDiscountForm.reset();
    };

    const addReferralForm = useShadForm<AddReferralFormValues>({
        resolver: shadZodResolver(addReferralSchema),
        defaultValues: {
            name: '',
            refereeBenefit: '',
            referrerTiers: [{ tier: '', reward: '' }],
            vestingPeriod: 0,
            combineOffers: false,
        },
    });

    const handleAddReferral = (values: AddReferralFormValues) => {
        const referralPrograms = form.getValues('referralPrograms');
        const newId = `r${referralPrograms.length + 1}`;
        form.setValue('referralPrograms', [
            ...referralPrograms,
            {
                id: newId,
                name: values.name,
                refereeBenefit: values.refereeBenefit,
                referrerTiers: values.referrerTiers.map((t) => ({
                    ...t,
                    icon: t.reward.toLowerCase().includes('gift') ? (
                        <Gift size={16} className="text-yellow-600" />
                    ) : (
                        <CalendarBlank size={16} className="text-blue-600" />
                    ),
                })),
                vestingPeriod: values.vestingPeriod,
                combineOffers: values.combineOffers,
            },
        ]);
        form.setValue('selectedReferralId', newId);
        form.setValue('showAddReferralDialog', false);
        addReferralForm.reset();
    };

    const handleDeleteOpenField = (id: string) => {
        const updatedFields = customFieldsArray
            .filter((field) => field.id !== id)
            .map((field, index) => ({
                ...field,
                order: index, // Update order of remaining fields
            }));
        setValue('custom_fields', updatedFields);
    };

    // Function that explicitly updates the order property of all fields
    const updateFieldOrders = () => {
        const currentFields = getValues('custom_fields');

        if (!currentFields) return;

        // Create a copy with updated order values matching their array positions
        const updatedFields = currentFields.map((field, index) => ({
            ...field,
            order: index,
        }));

        // Update the form values
        setValue('custom_fields', updatedFields, {
            shouldDirty: true,
            shouldTouch: true,
        });
    };

    const toggleIsRequired = (id: string) => {
        const updatedFields = customFieldsArray?.map((field) =>
            field.id === id ? { ...field, isRequired: !field.isRequired } : field
        );
        setValue('custom_fields', updatedFields);
    };

    const handleAddGender = (type: string, name: string, oldKey: boolean) => {
        // Create the new field
        const newField = {
            id: String(customFields.length), // Use the current array length as the new ID
            type,
            name,
            oldKey,
            ...(type === 'dropdown' && {
                options: [
                    {
                        id: '0',
                        value: 'MALE',
                        disabled: true,
                    },
                    {
                        id: '1',
                        value: 'FEMALE',
                        disabled: true,
                    },
                    {
                        id: '2',
                        value: 'OTHER',
                        disabled: true,
                    },
                ],
            }), // Include options if type is dropdown
            isRequired: true,
            key: '',
            order: customFields.length,
        };

        // Add the new field to the array
        const updatedFields = [...customFields, newField];

        // Update the form state
        setValue('custom_fields', updatedFields);
    };

    const handleAddOpenFieldValues = (type: string, name: string, oldKey: boolean) => {
        // Add the new field to the array
        const updatedFields = [
            ...customFields,
            {
                id: String(customFields.length), // Use the current array length as the new ID
                type,
                name,
                oldKey,
                isRequired: true,
                key: '',
                order: customFields.length,
            },
        ];

        // Update the form state with the new array
        setValue('custom_fields', updatedFields);
    };

    const handleValueChange = (id: string, newValue: string) => {
        const prevOptions = form.getValues('dropdownOptions');
        form.setValue(
            'dropdownOptions',
            prevOptions.map((option) =>
                option.id === id ? { ...option, value: newValue } : option
            )
        );
    };

    const handleEditClick = (id: string) => {
        const prevOptions = form.getValues('dropdownOptions');
        form.setValue(
            'dropdownOptions',
            prevOptions.map((option) =>
                option.id === id ? { ...option, disabled: !option.disabled } : option
            )
        );
    };

    const handleDeleteOptionField = (id: string) => {
        const prevOptions = form.getValues('dropdownOptions');
        form.setValue(
            'dropdownOptions',
            prevOptions.filter((field) => field.id !== id)
        );
    };

    const handleAddDropdownOptions = () => {
        const prevOptions = form.getValues('dropdownOptions');
        form.setValue('dropdownOptions', [
            ...prevOptions,
            {
                id: String(prevOptions.length),
                value: `option ${prevOptions.length + 1}`,
                disabled: true,
            },
        ]);
    };

    const handleCloseDialog = (type: string, name: string, oldKey: boolean) => {
        // Create the new field
        const newField = {
            id: String(customFields.length), // Use the current array length as the new ID
            type,
            name,
            oldKey,
            ...(type === 'dropdown' && { options: form.getValues('dropdownOptions') }), // Include options if type is dropdown
            isRequired: true,
            key: '',
            order: customFields.length,
        };

        // Add the new field to the array
        const updatedFields = [...customFields, newField];

        // Update the form state
        setValue('custom_fields', updatedFields);

        // Reset dialog and temporary values
        form.setValue('isDialogOpen', false);
        form.setValue('textFieldValue', '');
        form.setValue('dropdownOptions', []);
    };

    const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    const handleAddInviteeEmail = () => {
        const inviteeEmail = form.getValues('inviteeEmail');
        const inviteeEmails = form.getValues('inviteeEmails');
        if (isValidEmail(inviteeEmail) && !inviteeEmails.includes(inviteeEmail)) {
            const updatedEmails = [...inviteeEmails, inviteeEmail];
            form.setValue('inviteeEmails', updatedEmails);
            form.setValue('inviteeEmail', '');
        }
    };
    const handleRemoveInviteeEmail = (email: string) => {
        const inviteeEmails = form.getValues('inviteeEmails');
        const updatedEmails = inviteeEmails.filter((e: string) => e !== email);
        form.setValue('inviteeEmails', updatedEmails);
    };

    // Hide menu when clicking outside
    useEffect(() => {
        if (!form.watch('showMediaMenu')) return;
        function handleClick(e: MouseEvent) {
            if (mediaMenuRef.current && !mediaMenuRef.current.contains(e.target as Node)) {
                form.setValue('showMediaMenu', false);
            }
        }
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, [form.watch('showMediaMenu')]);

    // Hide YouTube input when clicking outside
    useEffect(() => {
        if (!form.watch('showYoutubeInput')) return;
        function handleClick(e: MouseEvent) {
            if (youtubeInputRef.current && !youtubeInputRef.current.contains(e.target as Node)) {
                form.setValue('showYoutubeInput', false);
            }
        }
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, [form.watch('showYoutubeInput')]);

    return (
        <Dialog open={showSummaryDialog} onOpenChange={setShowSummaryDialog}>
            <DialogContent className="animate-fadeIn flex min-h-[90vh] min-w-[85vw] flex-col">
                <DialogHeader>
                    <DialogTitle className="font-bold">Create Invite Link</DialogTitle>
                    <div className="my-3 border-b" />
                </DialogHeader>
                <div className="max-h-[70vh] flex-1 overflow-auto">
                    <Form {...form}>
                        <form className="mt-6 space-y-6">
                            {/* Invite Name Card */}
                            <InviteNameCard form={form} />
                            {/* Institute Branding Card */}
                            <InstituteBrandingCard form={form} />
                            {/* Enrollment Settings Card */}
                            <EnrollmentSettingsCard form={form} />
                            {/* Course Preview Card */}
                            <CoursePreviewCard
                                form={form}
                                handleTagInputChange={handleTagInputChange}
                                addTag={addTag}
                                removeTag={removeTag}
                                coursePreviewRef={coursePreviewRef}
                                courseBannerRef={courseBannerRef}
                                mediaMenuRef={mediaMenuRef}
                                youtubeInputRef={youtubeInputRef}
                                courseMediaRef={courseMediaRef}
                                handleFileUpload={handleFileUpload}
                                extractYouTubeVideoId={extractYouTubeVideoId}
                            />
                            <PaymentPlanCard form={form} />
                            {/* Discount Settings Card */}
                            <DiscountSettingsCard form={form} />
                            {/* Referral Program Card */}
                            <ReferralProgramCard form={form} />
                            {/* New Card for Restrict to Same Batch */}
                            <RestrictSameBatch form={form} />
                            {/* Customize Invite Form Card */}
                            <CustomInviteFormCard
                                form={form}
                                updateFieldOrders={updateFieldOrders}
                                handleDeleteOpenField={handleDeleteOpenField}
                                toggleIsRequired={toggleIsRequired}
                                handleAddGender={handleAddGender}
                                handleAddOpenFieldValues={handleAddOpenFieldValues}
                                handleValueChange={handleValueChange}
                                handleEditClick={handleEditClick}
                                handleDeleteOptionField={handleDeleteOptionField}
                                handleAddDropdownOptions={handleAddDropdownOptions}
                                handleCloseDialog={handleCloseDialog}
                            />
                            {/* Learner Access Duration Card */}
                            <LearnerAccessDurationCard form={form} />
                            {/* Invite via email Card */}
                            <InviteViaEmailCard
                                form={form}
                                isValidEmail={isValidEmail}
                                handleAddInviteeEmail={handleAddInviteeEmail}
                                handleRemoveInviteeEmail={handleRemoveInviteeEmail}
                            />
                            {/* Custom HTML Card */}
                            <CustomHTMLCard form={form} />
                            {/* Include Related Courses Card */}
                            <ShowRelatedCoursesCard form={form} />
                        </form>
                    </Form>
                </div>
                <div className="mt-6 flex justify-end gap-4">
                    <MyButton
                        type="button"
                        scale="small"
                        buttonType="secondary"
                        className="p-5"
                        onClick={() => setShowSummaryDialog(false)}
                    >
                        Close
                    </MyButton>
                    <MyButton
                        type="button"
                        scale="small"
                        buttonType="primary"
                        className="p-5"
                        onClick={handleSubmit(onSubmit, onInvalid)}
                        disable={!form.watch('name')}
                    >
                        Create Invite Link
                    </MyButton>
                </div>
            </DialogContent>
            {/* Payment Plans Dialog */}
            <PaymentPlansDialog form={form} />
            {/* Add New Payment Plan Dialog */}
            {/* <AddPaymentPlanDialog
                form={form}
                addPlanForm={addPlanForm}
                handleAddPlan={handleAddPlan}
            /> */}
            <AddPaymentPlanDialog form={form} />
            {/* Discount Settings Dialog */}
            <DiscountSettingsDialog form={form} />
            {/* Add New Discount Dialog */}
            <AddDiscountDialog
                form={form}
                addDiscountForm={addDiscountForm}
                handleAddDiscount={handleAddDiscount}
            />
            {/* Referral Program Selection Dialog */}
            <ReferralProgramDialog form={form} />
            {/* Add New Referral Program Dialog */}
            <AddReferralProgramDialog
                form={form}
                addReferralForm={addReferralForm}
                handleAddReferral={handleAddReferral}
            />
        </Dialog>
    );
};

export default GenerateInviteLinkDialog;
