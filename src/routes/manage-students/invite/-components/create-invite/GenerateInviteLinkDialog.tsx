import { MyButton } from '@/components/design-system/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { useFieldArray, useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import {
    Form,
    FormField,
    FormItem,
    FormControl,
    FormMessage,
    FormLabel,
} from '@/components/ui/form';
import { Building, X } from 'lucide-react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
    Gift,
    ImageSquare,
    PencilSimpleLine,
    WarningCircle,
    CalendarBlank,
    Tag,
    Users,
    Gear,
    TrendUp,
    TrashSimple,
    DotsSixVertical,
    Plus,
    PencilSimple,
    Clock,
    CodeSimple,
    Prohibit,
} from 'phosphor-react';
import { useInstituteDetailsStore } from '@/stores/students/students-list/useInstituteDetailsStore';
import { TokenKey } from '@/constants/auth/tokens';
import { getTokenDecodedData, getTokenFromCookie } from '@/lib/auth/sessionUtility';
import { useFileUpload } from '@/hooks/use-file-upload';
import { useEffect, useRef } from 'react';
import { MyInput } from '@/components/design-system/input';
import { MainViewQuillEditor } from '@/components/quill/MainViewQuillEditor';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { DashboardLoader } from '@/components/core/dashboard-loader';
import { FileUploadComponent } from '@/components/design-system/file-upload';
import {
    Dialog as ShadDialog,
    DialogContent as ShadDialogContent,
    DialogHeader as ShadDialogHeader,
    DialogTitle as ShadDialogTitle,
    DialogDescription as ShadDialogDescription,
} from '@/components/ui/dialog';
import { useForm as useShadForm } from 'react-hook-form';
import { z as zod } from 'zod';
import { zodResolver as shadZodResolver } from '@hookform/resolvers/zod';
import { useForm as useDiscountForm } from 'react-hook-form';
import { z as zodDiscount } from 'zod';
import { zodResolver as discountZodResolver } from '@hookform/resolvers/zod';
import { Switch as ShadSwitch } from '@/components/ui/switch';
import SelectField from '@/components/design-system/select-field';
import { Sortable, SortableDragHandle, SortableItem } from '@/components/ui/sortable';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { PPTViewQuillEditor } from '@/components/quill/PPTViewQuillEditor';

// Dummy related courses data
const relatedCourses = [
    {
        id: 'c1',
        name: 'Advanced Mathematics',
        description: 'Deep dive into calculus and algebra.',
        image: '/public/related-math.png',
        tags: ['Math', 'Advanced', 'STEM'],
    },
    {
        id: 'c2',
        name: 'Physics for Engineers',
        description: 'Mechanics, thermodynamics, and more.',
        image: '/public/related-physics.png',
        tags: ['Physics', 'Engineering'],
    },
    {
        id: 'c3',
        name: 'Creative Writing',
        description: 'Unlock your storytelling potential.',
        image: '/public/related-writing.png',
        tags: ['Writing', 'Creativity', 'Arts'],
    },
];

export interface Course {
    id: string;
    name: string;
}

export interface Batch {
    sessionId: string;
    levelId: string;
    sessionName: string;
    levelName: string;
}

export interface GenerateInviteLinkDialogProps {
    selectedCourse: Course | null;
    selectedBatches: Batch[];
    showSummaryDialog: boolean;
    setShowSummaryDialog: (open: boolean) => void;
}

const testInputFieldSchema = z.object({
    id: z.string(),
    type: z.string(),
    name: z.string(),
    oldKey: z.boolean(),
    isRequired: z.boolean(),
    key: z.string(),
    order: z.number(),
    options: z
        .array(
            z.object({
                id: z.string(),
                value: z.string(),
            })
        )
        .optional(),
});

// Schema for the form
const inviteLinkSchema = z.object({
    includeInstituteLogo: z.boolean().default(false),
    requireApproval: z.boolean().default(false),
    messageTemplate: z.enum(['standard', 'review', 'custom']).optional(),
    customMessage: z.string().optional(),
    id: z.string().optional(),
    course: z.string().min(1, { message: 'Course name is required' }),
    description: z.string().optional(),
    learningOutcome: z.string().optional(),
    aboutCourse: z.string().optional(),
    targetAudience: z.string().optional(),
    coursePreview: z.string().optional(),
    courseBanner: z.string().optional(),
    courseMedia: z.object({
        type: z.string().optional(),
        id: z.string().optional(),
    }),
    coursePreviewBlob: z.string().optional(),
    courseBannerBlob: z.string().optional(),
    courseMediaBlob: z.string().optional(),
    tags: z.array(z.string()).default([]),
    newTag: z.string().default(''),
    filteredTags: z.array(z.string()).default([]),
    custom_fields: z.array(testInputFieldSchema),
    uploadingStates: z.object({
        coursePreview: z.boolean().default(false),
        courseBanner: z.boolean().default(false),
        courseMedia: z.boolean().default(false),
    }),
    youtubeUrl: z.string().default(''),
    youtubeError: z.string().default(''),
    showYoutubeInput: z.boolean().default(false),
    showMediaMenu: z.boolean().default(false),
    freePlans: z
        .array(
            z.object({
                id: z.string(),
                name: z.string(),
                description: z.string(),
                price: z.string().optional(),
            })
        )
        .default([]),
    paidPlans: z
        .array(
            z.object({
                id: z.string(),
                name: z.string(),
                description: z.string(),
                price: z.string().optional(),
            })
        )
        .default([]),
    showPlansDialog: z.boolean().default(false),
    selectedPlan: z
        .object({
            id: z.string(),
            name: z.string(),
            description: z.string(),
            price: z.string().optional(),
        })
        .optional(),
    showAddPlanDialog: z.boolean().default(false),
    showDiscountDialog: z.boolean().default(false),
    discounts: z
        .array(
            z.object({
                id: z.string(),
                title: z.string(),
                code: z.string(),
                type: z.string(),
                value: z.number(),
                expires: z.string(),
            })
        )
        .default([]),
    showAddDiscountDialog: z.boolean().default(false),
    selectedDiscountId: z.string().default('none'),
    referralPrograms: z
        .array(
            z.object({
                id: z.string(),
                name: z.string(),
                refereeBenefit: z.string(),
                referrerTiers: z.array(
                    z.object({
                        tier: z.string(),
                        reward: z.string(),
                        icon: z.any().optional(),
                    })
                ),
                vestingPeriod: z.string(),
                combineOffers: z.boolean(),
            })
        )
        .default([]),
    selectedReferralId: z.string().default('r1'),
    showReferralDialog: z.boolean().default(false),
    showAddReferralDialog: z.boolean().default(false),
    restrictToSameBatch: z.boolean().default(false),
    accessDurationType: z.string().default('define'),
    accessDurationDays: z.string().default(''),
    inviteeEmail: z.string().default(''),
    inviteeEmails: z.array(z.string()).default([]),
    customHtml: z.string().default(''),
    showRelatedCourses: z.boolean().default(false),
    selectedOptionValue: z.string().default('textfield'),
    textFieldValue: z.string().default(''),
    dropdownOptions: z
        .array(
            z.object({
                id: z.string(),
                value: z.string(),
                disabled: z.boolean(),
            })
        )
        .default([]),
    isDialogOpen: z.boolean().default(false),
});

type InviteLinkFormValues = z.infer<typeof inviteLinkSchema>;

// Add new plan form schema
const addPlanSchema = zod.object({
    planType: zod.enum(['free', 'paid']),
    name: zod.string().min(1, 'Plan name is required'),
    description: zod.string().min(1, 'Description is required'),
    price: zod.string().optional(),
});

type AddPlanFormValues = zod.infer<typeof addPlanSchema>;

const addDiscountSchema = zodDiscount.object({
    title: zodDiscount.string().min(1, 'Title is required'),
    code: zodDiscount.string().min(1, 'Code is required'),
    type: zodDiscount.enum(['percent', 'rupees']),
    value: zodDiscount.number().min(1, 'Value is required'),
    expires: zodDiscount.string().min(1, 'Expiry date is required'),
});
type AddDiscountFormValues = zodDiscount.infer<typeof addDiscountSchema>;

// Add Referral Program form schema
const addReferralSchema = zod.object({
    name: zod.string().min(1, 'Program name is required'),
    refereeBenefit: zod.string().min(1, 'Referee benefit is required'),
    referrerTiers: zod
        .array(
            zod.object({
                tier: zod.string().min(1, 'Tier is required'),
                reward: zod.string().min(1, 'Reward is required'),
            })
        )
        .min(1, 'At least one tier is required'),
    vestingPeriod: zod.string().min(1, 'Vesting period is required'),
    combineOffers: zod.boolean(),
});
type AddReferralFormValues = zod.infer<typeof addReferralSchema>;

const GenerateInviteLinkDialog = ({
    showSummaryDialog,
    setShowSummaryDialog,
}: GenerateInviteLinkDialogProps) => {
    const form = useForm<InviteLinkFormValues>({
        resolver: zodResolver(inviteLinkSchema),
        defaultValues: {
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
            freePlans: [
                {
                    id: 'free1',
                    name: 'Free Basic',
                    description: 'Access to basic course content.',
                },
                {
                    id: 'free2',
                    name: 'Free Plus',
                    description: 'Access to all free resources.',
                },
            ],
            paidPlans: [
                {
                    id: 'paid1',
                    name: 'Premium',
                    description: 'Full access to all course materials and support.',
                    price: '$49',
                },
                {
                    id: 'paid2',
                    name: 'Pro',
                    description: 'Premium plus 1-on-1 mentorship.',
                    price: '$99',
                },
            ],
            showPlansDialog: false,
            selectedPlan: {
                id: 'free1',
                name: 'Free Basic',
                description: 'Access to basic course content.',
            },
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
            referralPrograms: [
                {
                    id: 'r1',
                    name: 'Default Referral',
                    refereeBenefit: '₹200 off',
                    referrerTiers: [
                        {
                            tier: '5 referrals',
                            reward: 'Gift',
                            icon: <Gift size={16} className="text-yellow-600" />,
                        },
                        {
                            tier: '10 referrals',
                            reward: 'Calendar',
                            icon: <CalendarBlank size={16} className="text-blue-600" />,
                        },
                    ],
                    vestingPeriod: '30 days',
                    combineOffers: true,
                },
                {
                    id: 'r2',
                    name: 'Super Saver',
                    refereeBenefit: '₹300 off',
                    referrerTiers: [
                        {
                            tier: '3 referrals',
                            reward: 'Gift',
                            icon: <Gift size={16} className="text-yellow-600" />,
                        },
                        {
                            tier: '8 referrals',
                            reward: 'Calendar',
                            icon: <CalendarBlank size={16} className="text-blue-600" />,
                        },
                    ],
                    vestingPeriod: '15 days',
                    combineOffers: false,
                },
            ],
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

    const { control, setValue, getValues } = form;
    const { fields: customFieldsArray, move: moveCustomField } = useFieldArray({
        control,
        name: 'custom_fields',
    });
    const customFields = getValues('custom_fields');

    const { instituteDetails } = useInstituteDetailsStore();
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

    const freePlans = form.getValues('freePlans');
    const paidPlans = form.getValues('paidPlans');
    const discounts = form.getValues('discounts');
    const referralPrograms = form.getValues('referralPrograms');

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
            const freePlans = form.getValues('paidPlans');
            form.setValue('paidPlans', [
                ...freePlans,
                {
                    id: `paid${freePlans.length + 1}`,
                    name: values.name,
                    description: values.description,
                    price: values.price || '',
                },
            ]);
        }
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
            ...form.getValues('discounts'),
            {
                id: `d${prevDiscounts.length + 1}`,
                ...values,
            },
        ]);
        addDiscountForm.reset();
    };

    const addReferralForm = useShadForm<AddReferralFormValues>({
        resolver: shadZodResolver(addReferralSchema),
        defaultValues: {
            name: '',
            refereeBenefit: '',
            referrerTiers: [{ tier: '', reward: '' }],
            vestingPeriod: '',
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

        setValue('selectedReferralId', newId);
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
                            {/* Institute Branding Card */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Building size={20} />
                                        <span className="text-2xl font-bold">
                                            Institute Branding
                                        </span>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <FormField
                                        control={form.control}
                                        name="includeInstituteLogo"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormControl>
                                                    <div className="flex items-center gap-2">
                                                        <Switch
                                                            id="institute-logo-switch"
                                                            checked={field.value}
                                                            onCheckedChange={field.onChange}
                                                        />
                                                        <span>Include institute logo.</span>
                                                    </div>
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />
                                </CardContent>
                            </Card>
                            {/* Enrollment Settings Card */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-2xl font-bold">
                                        Enrollment Settings
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <FormField
                                        control={form.control}
                                        name="requireApproval"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormControl>
                                                    <div className="flex items-center justify-between gap-4">
                                                        <div className="w-full">
                                                            <div className="text-base font-semibold">
                                                                Require Approval
                                                            </div>
                                                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                                                                <span>
                                                                    Enable if you want to review and
                                                                    approve enrollment requests
                                                                </span>
                                                                <Switch
                                                                    id="require-approval-switch"
                                                                    checked={field.value}
                                                                    onCheckedChange={field.onChange}
                                                                />
                                                            </div>
                                                            {/* Conditional warning and message template */}
                                                            {field.value && (
                                                                <div className="mt-4 flex flex-col">
                                                                    <div className="mb-2 flex items-center gap-2 rounded-xl border p-3 text-xs font-medium">
                                                                        <WarningCircle size={18} />
                                                                        Students will see your
                                                                        message while their
                                                                        enrollment request is
                                                                        pending approval.
                                                                    </div>
                                                                    <span>Message Template</span>
                                                                    <FormField
                                                                        control={form.control}
                                                                        name="messageTemplate"
                                                                        render={({
                                                                            field: templateField,
                                                                        }) => (
                                                                            <FormItem>
                                                                                <Select
                                                                                    value={
                                                                                        templateField.value ||
                                                                                        'standard'
                                                                                    }
                                                                                    onValueChange={(
                                                                                        val
                                                                                    ) => {
                                                                                        templateField.onChange(
                                                                                            val
                                                                                        );
                                                                                        if (
                                                                                            val !==
                                                                                            'custom'
                                                                                        ) {
                                                                                            form.setValue(
                                                                                                'customMessage',
                                                                                                undefined
                                                                                            );
                                                                                        }
                                                                                    }}
                                                                                >
                                                                                    <FormControl>
                                                                                        <SelectTrigger className="mt-2 w-full">
                                                                                            <SelectValue placeholder="Select message template" />
                                                                                        </SelectTrigger>
                                                                                    </FormControl>
                                                                                    <SelectContent>
                                                                                        <SelectItem value="standard">
                                                                                            Standard
                                                                                            Approval
                                                                                            Message
                                                                                        </SelectItem>
                                                                                        <SelectItem value="review">
                                                                                            Custom
                                                                                            Review
                                                                                            Process
                                                                                        </SelectItem>
                                                                                        <SelectItem value="custom">
                                                                                            Custom
                                                                                            Message
                                                                                        </SelectItem>
                                                                                    </SelectContent>
                                                                                </Select>
                                                                            </FormItem>
                                                                        )}
                                                                    />
                                                                    <span className="mt-2">
                                                                        Approval Message
                                                                    </span>
                                                                    <FormField
                                                                        control={form.control}
                                                                        name="customMessage"
                                                                        render={({
                                                                            field: msgField,
                                                                        }) => {
                                                                            const template =
                                                                                form.watch(
                                                                                    'messageTemplate'
                                                                                ) || 'standard';
                                                                            let value =
                                                                                msgField.value;
                                                                            let disabled = false;
                                                                            if (
                                                                                template ===
                                                                                'standard'
                                                                            ) {
                                                                                value =
                                                                                    'Thank you for your interest in our course. Your enrollment request is being reviewed by our team. We will notify you once your request has been approved.';
                                                                                disabled = true;
                                                                            } else if (
                                                                                template ===
                                                                                'review'
                                                                            ) {
                                                                                value =
                                                                                    'Your enrollment request has been received. Our team will review your application within 2 business days. You will receive an email notification with the decision.';
                                                                                disabled = true;
                                                                            } else if (
                                                                                template ===
                                                                                'custom'
                                                                            ) {
                                                                                disabled = false;
                                                                            }
                                                                            return (
                                                                                <Textarea
                                                                                    className="mt-3 min-h-[90px]"
                                                                                    value={
                                                                                        value || ''
                                                                                    }
                                                                                    onChange={(e) =>
                                                                                        msgField.onChange(
                                                                                            e.target
                                                                                                .value
                                                                                        )
                                                                                    }
                                                                                    disabled={
                                                                                        disabled
                                                                                    }
                                                                                    placeholder="Enter your custom message..."
                                                                                />
                                                                            );
                                                                        }}
                                                                    />
                                                                    <span className="-mb-2 mt-3 text-xs text-neutral-500">
                                                                        You can use markdown
                                                                        formatting in your message.
                                                                    </span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />
                                </CardContent>
                            </Card>
                            {/* Course Preview Card */}
                            <Card className="pb-4">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-2xl font-bold">
                                        <PencilSimpleLine size={22} />
                                        <span>Course Preview</span>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-2 gap-8">
                                        {/* Left Column - Form Fields */}
                                        <div className="space-y-6">
                                            <FormField
                                                control={form.control}
                                                name="course"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormControl>
                                                            <MyInput
                                                                id="course-name"
                                                                required={true}
                                                                label="Course"
                                                                inputType="text"
                                                                inputPlaceholder="Enter course name"
                                                                className="w-full"
                                                                input={field.value}
                                                                onChangeFunction={(e) =>
                                                                    field.onChange(e.target.value)
                                                                }
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            <div className="flex flex-col">
                                                <FormField
                                                    control={form.control}
                                                    name="description"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Description</FormLabel>
                                                            <FormControl>
                                                                <MainViewQuillEditor
                                                                    onChange={(value: string) => {
                                                                        const plainText = value
                                                                            .replace(/<[^>]*>/g, '')
                                                                            .trim();
                                                                        const words =
                                                                            plainText.split(/\s+/);
                                                                        if (words.length <= 30) {
                                                                            field.onChange(value);
                                                                        } else {
                                                                            // Truncate to first 30 words and update editor content
                                                                            const truncatedText =
                                                                                words
                                                                                    .slice(0, 30)
                                                                                    .join(' ');
                                                                            field.onChange(
                                                                                truncatedText
                                                                            );
                                                                        }
                                                                    }}
                                                                    value={field.value}
                                                                    onBlur={field.onBlur}
                                                                    CustomclasssName="h-[120px]"
                                                                    placeholder="Enter course description (max 30 words)"
                                                                />
                                                            </FormControl>
                                                        </FormItem>
                                                    )}
                                                />

                                                <span className="relative top-12 text-xs text-red-500">
                                                    *Max 30 words allowed
                                                </span>
                                            </div>

                                            {/* Tags Section */}
                                            <div className="space-y-2 pt-10">
                                                <Label className="font-medium text-gray-900">
                                                    Course Tags
                                                </Label>
                                                <p className="text-sm text-gray-600">
                                                    Add tags to help categorize and find your course
                                                    easily
                                                </p>
                                                <div className="flex gap-2">
                                                    <Input
                                                        type="text"
                                                        placeholder="Enter a tag"
                                                        value={form.watch('newTag')}
                                                        onChange={handleTagInputChange}
                                                        onKeyDown={(e) => {
                                                            if (e.key === 'Enter') {
                                                                addTag(e);
                                                            }
                                                        }}
                                                        className="h-9 border-gray-300"
                                                    />

                                                    <MyButton
                                                        type="button"
                                                        buttonType="secondary"
                                                        scale="medium"
                                                        layoutVariant="default"
                                                        onClick={addTag}
                                                        disable={
                                                            !(form.watch('newTag') || '').trim()
                                                        }
                                                    >
                                                        Add
                                                    </MyButton>
                                                </div>

                                                {/* Suggestions dropdown */}
                                                {form.watch('filteredTags')?.length > 0 && (
                                                    <div className="w-full overflow-y-auto rounded-md border border-neutral-200 bg-white shadow-sm">
                                                        <div className="flex flex-wrap gap-1.5 p-2">
                                                            {form
                                                                .watch('filteredTags')
                                                                .map((tag, index) => (
                                                                    <span
                                                                        key={index}
                                                                        className="hover:text-primary-600 cursor-pointer select-none rounded-full bg-neutral-100 px-2 py-1 text-xs text-neutral-700 transition-colors hover:bg-primary-100"
                                                                        onClick={(e) =>
                                                                            addTag(e, tag)
                                                                        }
                                                                    >
                                                                        {tag}
                                                                    </span>
                                                                ))}
                                                        </div>
                                                    </div>
                                                )}

                                                {form.watch('tags')?.length > 0 && (
                                                    <div className="flex flex-wrap gap-2">
                                                        {form.watch('tags').map((tag, index) => (
                                                            <Badge
                                                                key={index}
                                                                variant="secondary"
                                                                className="flex items-center gap-1 px-3 py-1"
                                                            >
                                                                {tag}
                                                                <X
                                                                    className="size-3 cursor-pointer"
                                                                    onClick={() => removeTag(tag)}
                                                                />
                                                            </Badge>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex flex-col gap-16 pb-8">
                                                <FormField
                                                    control={form.control}
                                                    name="learningOutcome"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>
                                                                What learners will gain?
                                                            </FormLabel>
                                                            <FormControl>
                                                                <MainViewQuillEditor
                                                                    onChange={field.onChange}
                                                                    value={field.value}
                                                                    onBlur={field.onBlur}
                                                                    CustomclasssName="h-[120px]"
                                                                    placeholder="Provide a detailed overview of the course. Include learning objectives, topics covered, format (video, quizzes, projects), and who this course is for."
                                                                />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                                <FormField
                                                    control={form.control}
                                                    name="aboutCourse"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>About the course</FormLabel>
                                                            <FormControl>
                                                                <MainViewQuillEditor
                                                                    onChange={field.onChange}
                                                                    value={field.value}
                                                                    onBlur={field.onBlur}
                                                                    CustomclasssName="h-[120px]"
                                                                    placeholder="Provide a detailed overview of the course. Include learning objectives, topics covered, format (video, quizzes, projects), and who this course is for."
                                                                />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                                <FormField
                                                    control={form.control}
                                                    name="targetAudience"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Who should join?</FormLabel>
                                                            <FormControl>
                                                                <MainViewQuillEditor
                                                                    onChange={field.onChange}
                                                                    value={field.value}
                                                                    onBlur={field.onBlur}
                                                                    CustomclasssName="h-[120px]"
                                                                    placeholder="Provide a detailed overview of the course. Include learning objectives, topics covered, format (video, quizzes, projects), and who this course is for."
                                                                />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>
                                        </div>

                                        {/* Right Column - Image Uploads */}
                                        <div className="space-y-6">
                                            {/* Course Preview */}
                                            <div className="flex flex-col gap-1">
                                                <FormLabel>Course Preview Image</FormLabel>
                                                <p className="text-sm text-gray-500">
                                                    This is the thumbnail that appears on the course
                                                    card. Recommended size: 2:1 ratio
                                                </p>
                                                <div className="relative">
                                                    {form.watch('uploadingStates').coursePreview ? (
                                                        <div className="flex h-[200px] items-center justify-center rounded-lg bg-gray-100">
                                                            <DashboardLoader />
                                                        </div>
                                                    ) : form.watch('coursePreview') ? (
                                                        <div className="h-[200px] w-full rounded-lg bg-gray-100">
                                                            <img
                                                                src={form.watch(
                                                                    'coursePreviewBlob'
                                                                )}
                                                                alt="Course Preview"
                                                                className="size-full rounded-lg object-contain"
                                                            />
                                                        </div>
                                                    ) : (
                                                        <div className="flex h-[200px] items-center justify-center rounded-lg bg-gray-100">
                                                            <p className="text-white">
                                                                <ImageSquare size={100} />
                                                            </p>
                                                        </div>
                                                    )}
                                                    <FileUploadComponent
                                                        fileInputRef={coursePreviewRef}
                                                        onFileSubmit={(file) =>
                                                            handleFileUpload(file, 'coursePreview')
                                                        }
                                                        control={form.control}
                                                        name="coursePreview"
                                                        acceptedFileTypes={[
                                                            'image/jpeg',
                                                            'image/png',
                                                            'image/svg+xml',
                                                        ]}
                                                    />
                                                    <MyButton
                                                        type="button"
                                                        onClick={() =>
                                                            coursePreviewRef.current?.click()
                                                        }
                                                        disabled={
                                                            form.watch('uploadingStates')
                                                                .coursePreview
                                                        }
                                                        buttonType="secondary"
                                                        layoutVariant="icon"
                                                        scale="small"
                                                        className="absolute bottom-2 right-2 bg-white"
                                                    >
                                                        <PencilSimpleLine />
                                                    </MyButton>
                                                </div>
                                            </div>

                                            {/* Course Banner */}
                                            <div className="flex flex-col gap-1">
                                                <FormLabel>Course Banner Image</FormLabel>
                                                <p className="text-sm text-gray-500">
                                                    A wide background image displayed on top of the
                                                    course detail page. Recommended size: 2.64:1
                                                    ratio
                                                </p>
                                                <div className="relative">
                                                    {form.watch('uploadingStates').courseBanner ? (
                                                        <div className="flex h-[200px] items-center justify-center rounded-lg bg-gray-100">
                                                            <DashboardLoader />
                                                        </div>
                                                    ) : form.watch('courseBanner') ? (
                                                        <div className="h-[200px] w-full rounded-lg bg-gray-100">
                                                            <img
                                                                src={form.watch('courseBannerBlob')}
                                                                alt="Course Banner"
                                                                className="size-full rounded-lg object-contain"
                                                            />
                                                        </div>
                                                    ) : (
                                                        <div className="flex h-[200px] items-center justify-center rounded-lg bg-gray-100">
                                                            <p className="text-white">
                                                                <ImageSquare size={100} />
                                                            </p>
                                                        </div>
                                                    )}
                                                    <FileUploadComponent
                                                        fileInputRef={courseBannerRef}
                                                        onFileSubmit={(file) =>
                                                            handleFileUpload(file, 'courseBanner')
                                                        }
                                                        control={form.control}
                                                        name="courseBanner"
                                                        acceptedFileTypes={[
                                                            'image/jpeg',
                                                            'image/png',
                                                            'image/svg+xml',
                                                        ]}
                                                    />
                                                    <MyButton
                                                        type="button"
                                                        onClick={() =>
                                                            courseBannerRef.current?.click()
                                                        }
                                                        disabled={
                                                            form.watch('uploadingStates')
                                                                .courseBanner
                                                        }
                                                        buttonType="secondary"
                                                        layoutVariant="icon"
                                                        scale="small"
                                                        className="absolute bottom-2 right-2 bg-white"
                                                    >
                                                        <PencilSimpleLine />
                                                    </MyButton>
                                                </div>
                                            </div>

                                            {/* Course Media */}
                                            <div className="flex flex-col gap-1">
                                                <FormLabel>Course Media (Image or Video)</FormLabel>
                                                <p className="text-sm text-gray-500">
                                                    A featured media block within the course page;
                                                    this can visually represent the content or offer
                                                    a teaser. For videos, recommended format: MP4
                                                </p>
                                                <div className="flex flex-col gap-2">
                                                    {/* Preview logic remains unchanged */}
                                                    {form.watch('uploadingStates').courseMedia ? (
                                                        <div className="flex h-[200px] items-center justify-center rounded-lg bg-gray-100">
                                                            <DashboardLoader />
                                                        </div>
                                                    ) : form.watch('courseMedia')?.id &&
                                                      form.watch('courseMedia')?.type !==
                                                          'youtube' ? (
                                                        form.watch('courseMedia')?.type ===
                                                        'video' ? (
                                                            <div className="h-[200px] w-full rounded-lg bg-gray-100">
                                                                <video
                                                                    src={form.watch(
                                                                        'courseMediaBlob'
                                                                    )}
                                                                    controls
                                                                    controlsList="nodownload noremoteplayback"
                                                                    disablePictureInPicture
                                                                    disableRemotePlayback
                                                                    className="size-full rounded-lg object-contain"
                                                                >
                                                                    Your browser does not support
                                                                    the video tag.
                                                                </video>
                                                            </div>
                                                        ) : (
                                                            <div className="flex h-[200px] items-center justify-center rounded-lg bg-gray-100">
                                                                <img
                                                                    src={form.watch(
                                                                        'courseMediaBlob'
                                                                    )}
                                                                    alt="Course Banner"
                                                                    className="size-full rounded-lg object-contain"
                                                                />
                                                            </div>
                                                        )
                                                    ) : form.watch('courseMedia')?.type ===
                                                          'youtube' &&
                                                      form.watch('courseMedia')?.id ? (
                                                        <div className="mt-2 flex h-[200px] w-full items-center justify-center rounded-lg bg-gray-100">
                                                            <iframe
                                                                width="100%"
                                                                height="100%"
                                                                src={`https://www.youtube.com/embed/${extractYouTubeVideoId(form.watch('courseMedia')?.id || '')}`}
                                                                title="YouTube video player"
                                                                frameBorder="0"
                                                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                                allowFullScreen
                                                                className="size-full rounded-lg object-contain"
                                                            />
                                                        </div>
                                                    ) : (
                                                        <div className="flex h-[200px] items-center justify-center rounded-lg bg-gray-100">
                                                            <p className="text-white">
                                                                <ImageSquare size={100} />
                                                            </p>
                                                        </div>
                                                    )}
                                                    {/* Pen icon and dropdown logic */}
                                                    <div className="-mt-10 mr-2 flex flex-col items-end justify-end">
                                                        <MyButton
                                                            type="button"
                                                            disabled={
                                                                form.watch('uploadingStates')
                                                                    .courseMedia
                                                            }
                                                            buttonType="secondary"
                                                            layoutVariant="icon"
                                                            scale="small"
                                                            className="bg-white hover:bg-white active:bg-white"
                                                            onClick={() => {
                                                                form.setValue(
                                                                    'showMediaMenu',
                                                                    !form.watch('showMediaMenu')
                                                                );
                                                                form.setValue(
                                                                    'showYoutubeInput',
                                                                    false
                                                                );
                                                            }}
                                                        >
                                                            <PencilSimpleLine />
                                                        </MyButton>
                                                        {form.watch('showMediaMenu') && (
                                                            <div
                                                                ref={mediaMenuRef}
                                                                className=" flex w-48 flex-col gap-2 rounded bg-white p-2 shadow"
                                                            >
                                                                <button
                                                                    className="w-full rounded px-3 py-2 text-left text-sm hover:bg-gray-100"
                                                                    onClick={() => {
                                                                        form.setValue(
                                                                            'showMediaMenu',
                                                                            false
                                                                        );
                                                                        courseMediaRef.current?.click();
                                                                    }}
                                                                >
                                                                    Upload Image/Video
                                                                </button>
                                                                <button
                                                                    className="w-full rounded px-3 py-2 text-left text-sm hover:bg-gray-100"
                                                                    onClick={() => {
                                                                        form.setValue(
                                                                            'showMediaMenu',
                                                                            false
                                                                        );
                                                                        form.setValue(
                                                                            'showYoutubeInput',
                                                                            true
                                                                        );
                                                                    }}
                                                                >
                                                                    YouTube Link
                                                                </button>
                                                            </div>
                                                        )}
                                                        {form.watch('showYoutubeInput') && (
                                                            <div
                                                                ref={youtubeInputRef}
                                                                className=" w-64 rounded bg-white p-4 shadow"
                                                            >
                                                                <label className="mb-1 block text-sm font-medium text-gray-700">
                                                                    Paste YouTube Link
                                                                </label>
                                                                <Input
                                                                    type="text"
                                                                    placeholder="https://youtube.com/watch?v=..."
                                                                    value={
                                                                        form.watch('youtubeUrl') ||
                                                                        ''
                                                                    }
                                                                    onChange={(e) => {
                                                                        form.setValue(
                                                                            'youtubeUrl',
                                                                            e.target.value
                                                                        );
                                                                        form.setValue(
                                                                            'youtubeError',
                                                                            ''
                                                                        );
                                                                    }}
                                                                    className="mb-2"
                                                                />
                                                                {form.watch('youtubeError') && (
                                                                    <div className="mb-2 text-xs text-red-500">
                                                                        {form.watch('youtubeError')}
                                                                    </div>
                                                                )}
                                                                <MyButton
                                                                    buttonType="primary"
                                                                    scale="medium"
                                                                    layoutVariant="default"
                                                                    className="w-full"
                                                                    onClick={() => {
                                                                        const id =
                                                                            extractYouTubeVideoId(
                                                                                form.watch(
                                                                                    'youtubeUrl'
                                                                                )
                                                                            );
                                                                        if (!id) {
                                                                            form.setValue(
                                                                                'youtubeError',
                                                                                'Invalid YouTube link'
                                                                            );
                                                                            return;
                                                                        }
                                                                        form.setValue(
                                                                            'courseMedia',
                                                                            {
                                                                                type: 'youtube',
                                                                                id: form.watch(
                                                                                    'youtubeUrl'
                                                                                ),
                                                                            }
                                                                        );
                                                                        form.setValue(
                                                                            'courseMediaBlob',
                                                                            form.watch('youtubeUrl')
                                                                        );
                                                                        form.setValue(
                                                                            'showYoutubeInput',
                                                                            false
                                                                        );
                                                                    }}
                                                                    disable={
                                                                        !form.watch('youtubeUrl')
                                                                    }
                                                                >
                                                                    Save YouTube Link
                                                                </MyButton>
                                                            </div>
                                                        )}
                                                    </div>
                                                    {/* Always render the FileUploadComponent, but hide it visually */}
                                                    <div style={{ display: 'none' }}>
                                                        <FileUploadComponent
                                                            fileInputRef={courseMediaRef}
                                                            onFileSubmit={(file) =>
                                                                handleFileUpload(
                                                                    file,
                                                                    'courseMedia'
                                                                )
                                                            }
                                                            control={form.control}
                                                            name="courseMedia"
                                                            acceptedFileTypes={[
                                                                'image/jpeg',
                                                                'image/png',
                                                                'image/svg+xml',
                                                                'video/mp4',
                                                                'video/quicktime',
                                                                'video/x-msvideo',
                                                                'video/webm',
                                                            ]}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                            {/* Payment Plan Section */}
                            <div className="flex items-center justify-between py-2">
                                <span className="text-base font-semibold">Payment Plan</span>
                                <MyButton
                                    type="button"
                                    scale="small"
                                    buttonType="secondary"
                                    className="p-4"
                                    onClick={() => form.setValue('showPlansDialog', true)}
                                >
                                    Change Payment Plans
                                </MyButton>
                            </div>
                            {/* Show selected plan in a card */}
                            {form.watch('selectedPlan') && (
                                <Card className="mb-4 flex flex-col gap-0">
                                    <div className="flex items-center gap-2 px-6 pt-6 text-lg font-semibold">
                                        {form.watch('selectedPlan')?.price ? (
                                            <CalendarBlank size={20} />
                                        ) : (
                                            <Gift size={20} />
                                        )}
                                        <span>{form.watch('selectedPlan')?.name}</span>
                                        <Badge variant="default" className="ml-2">
                                            Default
                                        </Badge>
                                    </div>
                                    <CardContent className="">
                                        <div className="text-sm text-gray-600">
                                            {form.watch('selectedPlan')?.description}
                                        </div>
                                        {form.watch('selectedPlan')?.price && (
                                            <div className="mt-2 text-base font-bold text-green-700">
                                                {form.watch('selectedPlan')?.price}
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            )}
                            {/* Discount Settings Card */}
                            <Card className="mb-4">
                                <CardHeader className="flex flex-row items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Tag size={22} />
                                        <CardTitle className="text-2xl font-bold">
                                            Discount Settings
                                        </CardTitle>
                                    </div>
                                    <MyButton
                                        type="button"
                                        scale="small"
                                        buttonType="secondary"
                                        className="p-4"
                                        onClick={() => form.setValue('showDiscountDialog', true)}
                                    >
                                        Change Discount Settings
                                    </MyButton>
                                </CardHeader>
                                {form.watch('selectedDiscountId') === 'none' && (
                                    <Card className="mx-4 mb-4 border">
                                        <div className="flex items-center justify-between p-4">
                                            <div className="flex items-center gap-2">
                                                <WarningCircle size={16} />
                                                <span className="text-base font-semibold">
                                                    No Discount Applied
                                                </span>
                                            </div>
                                            <Badge variant="default" className="ml-2">
                                                Active
                                            </Badge>
                                        </div>
                                    </Card>
                                )}
                                {form.watch('selectedDiscountId') &&
                                    form.watch('selectedDiscountId') !== 'none' &&
                                    (() => {
                                        const activeDiscount = discounts.find(
                                            (d) => d.id === form.watch('selectedDiscountId')
                                        );
                                        if (!activeDiscount) return null;
                                        return (
                                            <Card className="mx-4 mb-4 border">
                                                <div className="flex items-center justify-between p-4">
                                                    <div className="flex items-center gap-2">
                                                        {activeDiscount.id === 'none' ? (
                                                            <WarningCircle size={16} />
                                                        ) : (
                                                            <Tag size={16} />
                                                        )}
                                                        <span className="text-base font-semibold">
                                                            {activeDiscount.title}
                                                        </span>
                                                        {form.watch('selectedDiscountId') ===
                                                            activeDiscount.id && (
                                                            <Badge
                                                                variant="default"
                                                                className="ml-2"
                                                            >
                                                                Active
                                                            </Badge>
                                                        )}
                                                        {activeDiscount.code && (
                                                            <span className="rounded bg-gray-100 px-2 py-1 font-mono text-xs text-gray-700">
                                                                {activeDiscount.code}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <Badge variant="default" className="ml-2">
                                                        Active
                                                    </Badge>
                                                </div>
                                                <div className="flex items-center gap-4 px-4 pb-4 text-sm">
                                                    <span className="font-semibold text-green-700">
                                                        {activeDiscount.type === 'percent'
                                                            ? `${activeDiscount.value}% off`
                                                            : `₹${activeDiscount.value} off`}
                                                    </span>
                                                    <span className="text-xs text-gray-500">
                                                        Expires: {activeDiscount.expires}
                                                    </span>
                                                </div>
                                            </Card>
                                        );
                                    })()}
                            </Card>
                            {/* Referral Program Card */}
                            <div className="flex flex-col">
                                <div className="flex flex-col">
                                    <span className="font-medium">Referral Settings</span>
                                    <span className="text-sm">
                                        Configure rewards for referrers and referees when referral
                                        codes are used
                                    </span>
                                </div>
                            </div>
                            <Card className="mb-4">
                                <CardHeader className="-mb-5 flex flex-row items-center justify-between ">
                                    <div className="flex items-center gap-2">
                                        <span className="flex items-center gap-2 text-lg font-semibold">
                                            <TrendUp size={20} />
                                            <span>Referral Program</span>
                                        </span>
                                        <Badge variant="default" className="ml-2">
                                            Default
                                        </Badge>
                                    </div>
                                    <MyButton
                                        type="button"
                                        scale="small"
                                        buttonType="secondary"
                                        className="p-4"
                                        onClick={() => form.setValue('showReferralDialog', true)}
                                    >
                                        Change Referral Settings
                                    </MyButton>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {/* Referee Benefit */}
                                    <div className="mt-2 flex flex-col items-start gap-2">
                                        <div className="flex items-center gap-2">
                                            <Gift size={18} />
                                            <span className="font-semibold">Referee Benefit</span>
                                        </div>
                                        <span className="ml-6 font-semibold text-green-700">
                                            {
                                                referralPrograms.find(
                                                    (p) => p.id === form.watch('selectedReferralId')
                                                )?.refereeBenefit
                                            }
                                        </span>
                                    </div>
                                    {/* Referrer Tiers */}
                                    <div className="mt-2 flex flex-col items-start gap-2">
                                        <div className="flex items-center gap-2">
                                            <Users size={18} />
                                            <span className="font-semibold">Referrer Tiers</span>
                                        </div>
                                        {referralPrograms
                                            .find((p) => p.id === form.watch('selectedReferralId'))
                                            ?.referrerTiers.map((tier, idx) => (
                                                <div
                                                    key={idx}
                                                    className="ml-4 flex w-full items-center justify-between pr-4"
                                                >
                                                    <span className="ml-2 text-gray-700">
                                                        {tier.tier}
                                                    </span>
                                                    {tier.icon}
                                                </div>
                                            ))}
                                    </div>
                                    {/* Program Settings */}
                                    <div className="mt-4">
                                        <div className="flex items-center gap-2">
                                            <Gear size={18} />
                                            <span className="font-semibold">Program Settings</span>
                                        </div>
                                        <div className="ml-6 mt-2 flex items-center justify-between">
                                            <span className="text-gray-700">Vesting Period</span>
                                            <span>
                                                {
                                                    referralPrograms.find(
                                                        (p) =>
                                                            p.id ===
                                                            form.watch('selectedReferralId')
                                                    )?.vestingPeriod
                                                }
                                            </span>
                                        </div>
                                        <div className="ml-6 mt-2 flex items-center justify-between">
                                            <span className="text-gray-700">Combine Offers</span>
                                            <span>
                                                {referralPrograms.find(
                                                    (p) => p.id === form.watch('selectedReferralId')
                                                )?.combineOffers
                                                    ? 'Yes'
                                                    : 'No'}
                                            </span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                            {/* New Card for Restrict to Same Batch */}
                            <Card className="mb-4 flex flex-row items-center justify-between p-4">
                                <div className="flex flex-col">
                                    <span className="font-semibold">
                                        Check if the referrer is a part of the same course and
                                        batch?
                                    </span>
                                    <span className="text-sm text-gray-600">
                                        Enable this to restrict referrals to students from the same
                                        batch
                                    </span>
                                </div>
                                <ShadSwitch
                                    checked={form.watch('restrictToSameBatch')}
                                    onCheckedChange={(value) =>
                                        form.setValue('restrictToSameBatch', value)
                                    }
                                />
                            </Card>
                            {/* Customize Invite Form Card */}
                            <Card className="mb-4">
                                <CardHeader>
                                    <CardTitle className="flex flex-col text-lg font-semibold">
                                        <span className="text-2xl font-bold">
                                            Customize Invite Form
                                        </span>
                                        <span className="text-sm text-gray-600">
                                            Configure the fields students will fill out
                                        </span>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex w-full flex-col gap-4">
                                        <div className="flex flex-col gap-4">
                                            <Sortable
                                                value={customFieldsArray}
                                                onMove={({ activeIndex, overIndex }) => {
                                                    moveCustomField(activeIndex, overIndex);
                                                    updateFieldOrders();
                                                }}
                                            >
                                                <div className="flex flex-col gap-4">
                                                    {customFieldsArray.map((field, index) => {
                                                        return (
                                                            <SortableItem
                                                                key={field.id}
                                                                value={field.id}
                                                                asChild
                                                            >
                                                                <div
                                                                    key={index}
                                                                    className="flex items-center gap-4"
                                                                >
                                                                    <div className="flex w-3/4 items-center justify-between rounded-lg border border-neutral-300 bg-neutral-50 px-4 py-2">
                                                                        <h1 className="text-sm">
                                                                            {field.name}
                                                                            {field.oldKey && (
                                                                                <span className="text-subtitle text-danger-600">
                                                                                    *
                                                                                </span>
                                                                            )}
                                                                            {!field.oldKey &&
                                                                                field.isRequired && (
                                                                                    <span className="text-subtitle text-danger-600">
                                                                                        *
                                                                                    </span>
                                                                                )}
                                                                        </h1>
                                                                        <div className="flex items-center gap-6">
                                                                            {!field.oldKey && (
                                                                                <MyButton
                                                                                    type="button"
                                                                                    scale="small"
                                                                                    buttonType="secondary"
                                                                                    className="min-w-6 !rounded-sm !p-0"
                                                                                    onClick={() =>
                                                                                        handleDeleteOpenField(
                                                                                            field.id
                                                                                        )
                                                                                    }
                                                                                >
                                                                                    <TrashSimple className="!size-4 text-danger-500" />
                                                                                </MyButton>
                                                                            )}
                                                                            <SortableDragHandle
                                                                                variant="ghost"
                                                                                size="icon"
                                                                                className="cursor-grab"
                                                                            >
                                                                                <DotsSixVertical
                                                                                    size={20}
                                                                                />
                                                                            </SortableDragHandle>
                                                                        </div>
                                                                    </div>
                                                                    {!field.oldKey && (
                                                                        <>
                                                                            <h1 className="text-sm">
                                                                                Required
                                                                            </h1>
                                                                            <Switch
                                                                                checked={
                                                                                    field.isRequired
                                                                                }
                                                                                onCheckedChange={() =>
                                                                                    toggleIsRequired(
                                                                                        field.id
                                                                                    )
                                                                                }
                                                                            />
                                                                        </>
                                                                    )}
                                                                </div>
                                                            </SortableItem>
                                                        );
                                                    })}
                                                </div>
                                            </Sortable>
                                        </div>
                                        <div className="mt-2 flex items-center gap-6">
                                            {!customFields?.some(
                                                (field) => field.name === 'Gender'
                                            ) && (
                                                <MyButton
                                                    type="button"
                                                    scale="medium"
                                                    buttonType="secondary"
                                                    onClick={() =>
                                                        handleAddGender('dropdown', 'Gender', false)
                                                    }
                                                >
                                                    <Plus size={32} /> Add Gender
                                                </MyButton>
                                            )}
                                            {!customFields?.some(
                                                (field) => field.name === 'State'
                                            ) && (
                                                <MyButton
                                                    type="button"
                                                    scale="medium"
                                                    buttonType="secondary"
                                                    onClick={() =>
                                                        handleAddOpenFieldValues(
                                                            'textfield',
                                                            'State',
                                                            false
                                                        )
                                                    }
                                                >
                                                    <Plus size={32} /> Add State
                                                </MyButton>
                                            )}
                                            {!customFields?.some(
                                                (field) => field.name === 'City'
                                            ) && (
                                                <MyButton
                                                    type="button"
                                                    scale="medium"
                                                    buttonType="secondary"
                                                    onClick={() =>
                                                        handleAddOpenFieldValues(
                                                            'textfield',
                                                            'City',
                                                            false
                                                        )
                                                    }
                                                >
                                                    <Plus size={32} /> Add City
                                                </MyButton>
                                            )}
                                            {!customFields?.some(
                                                (field) => field.name === 'School/College'
                                            ) && (
                                                <MyButton
                                                    type="button"
                                                    scale="medium"
                                                    buttonType="secondary"
                                                    onClick={() =>
                                                        handleAddOpenFieldValues(
                                                            'textfield',
                                                            'School/College',
                                                            false
                                                        )
                                                    }
                                                >
                                                    <Plus size={32} /> Add School/College
                                                </MyButton>
                                            )}
                                            <Dialog
                                                open={form.watch('isDialogOpen')}
                                                onOpenChange={(open) =>
                                                    form.setValue('isDialogOpen', open)
                                                }
                                            >
                                                <DialogTrigger asChild>
                                                    <MyButton
                                                        type="button"
                                                        scale="medium"
                                                        buttonType="secondary"
                                                        onClick={() =>
                                                            form.setValue('isDialogOpen', true)
                                                        }
                                                    >
                                                        <Plus size={32} /> Add Custom Field
                                                    </MyButton>
                                                </DialogTrigger>
                                                <DialogContent className="!w-[500px] p-0">
                                                    <h1 className="rounded-lg bg-primary-50 p-4 text-primary-500">
                                                        Add Custom Field
                                                    </h1>
                                                    <div className="flex flex-col gap-4 px-4">
                                                        <h1>
                                                            Select the type of custom field you want
                                                            to add:
                                                        </h1>
                                                        <RadioGroup
                                                            defaultValue={form.watch(
                                                                'selectedOptionValue'
                                                            )}
                                                            onValueChange={(value) =>
                                                                form.setValue(
                                                                    'selectedOptionValue',
                                                                    value
                                                                )
                                                            }
                                                            className="flex items-center gap-6"
                                                        >
                                                            <div className="flex items-center space-x-2">
                                                                <RadioGroupItem
                                                                    value="textfield"
                                                                    id="option-one"
                                                                />
                                                                <Label htmlFor="option-one">
                                                                    Text Field
                                                                </Label>
                                                            </div>
                                                            <div className="flex items-center space-x-2">
                                                                <RadioGroupItem
                                                                    value="dropdown"
                                                                    id="option-two"
                                                                />
                                                                <Label htmlFor="option-two">
                                                                    Dropdown
                                                                </Label>
                                                            </div>
                                                        </RadioGroup>
                                                        {form.watch('selectedOptionValue') ===
                                                        'textfield' ? (
                                                            <div className="flex flex-col gap-1">
                                                                <h1>
                                                                    Text Field Name
                                                                    <span className="text-subtitle text-danger-600">
                                                                        *
                                                                    </span>
                                                                </h1>
                                                                <MyInput
                                                                    inputType="text"
                                                                    inputPlaceholder="Type Here"
                                                                    input={form.watch(
                                                                        'textFieldValue'
                                                                    )}
                                                                    onChangeFunction={(e) =>
                                                                        form.setValue(
                                                                            'textFieldValue',
                                                                            e.target.value
                                                                        )
                                                                    }
                                                                    size="large"
                                                                    className="w-full"
                                                                />
                                                            </div>
                                                        ) : (
                                                            <div className="flex flex-col gap-1">
                                                                <h1>
                                                                    Dropdown Name
                                                                    <span className="text-subtitle text-danger-600">
                                                                        *
                                                                    </span>
                                                                </h1>
                                                                <MyInput
                                                                    inputType="text"
                                                                    inputPlaceholder="Type Here"
                                                                    input={form.watch(
                                                                        'textFieldValue'
                                                                    )}
                                                                    onChangeFunction={(e) =>
                                                                        form.setValue(
                                                                            'textFieldValue',
                                                                            e.target.value
                                                                        )
                                                                    }
                                                                    size="large"
                                                                    className="w-full"
                                                                />
                                                                <h1 className="mt-4">
                                                                    Dropdown Options
                                                                </h1>
                                                                <div className="flex flex-col gap-4">
                                                                    {form
                                                                        .watch('dropdownOptions')
                                                                        .map((option) => {
                                                                            return (
                                                                                <div
                                                                                    className="flex w-full items-center justify-between rounded-lg border border-neutral-300 bg-neutral-50 px-4 py-1"
                                                                                    key={option.id} // Use unique identifier
                                                                                >
                                                                                    <MyInput
                                                                                        inputType="text"
                                                                                        inputPlaceholder={
                                                                                            option.value
                                                                                        }
                                                                                        input={
                                                                                            option.value
                                                                                        }
                                                                                        onChangeFunction={(
                                                                                            e
                                                                                        ) =>
                                                                                            handleValueChange(
                                                                                                option.id,
                                                                                                e
                                                                                                    .target
                                                                                                    .value
                                                                                            )
                                                                                        }
                                                                                        size="large"
                                                                                        disabled={
                                                                                            option.disabled
                                                                                        }
                                                                                        className="border-none pl-0"
                                                                                    />
                                                                                    <div className="flex items-center gap-6">
                                                                                        <MyButton
                                                                                            type="button"
                                                                                            scale="medium"
                                                                                            buttonType="secondary"
                                                                                            className="h-6 min-w-6 !rounded-sm px-1"
                                                                                            onClick={() =>
                                                                                                handleEditClick(
                                                                                                    option.id
                                                                                                )
                                                                                            }
                                                                                        >
                                                                                            <PencilSimple
                                                                                                size={
                                                                                                    32
                                                                                                }
                                                                                            />
                                                                                        </MyButton>
                                                                                        {form.watch(
                                                                                            'dropdownOptions'
                                                                                        ).length >
                                                                                            1 && (
                                                                                            <MyButton
                                                                                                type="button"
                                                                                                scale="medium"
                                                                                                buttonType="secondary"
                                                                                                onClick={() =>
                                                                                                    handleDeleteOptionField(
                                                                                                        option.id
                                                                                                    )
                                                                                                }
                                                                                                className="h-6 min-w-6 !rounded-sm px-1"
                                                                                            >
                                                                                                <TrashSimple className="!size-4 text-danger-500" />
                                                                                            </MyButton>
                                                                                        )}
                                                                                    </div>
                                                                                </div>
                                                                            );
                                                                        })}
                                                                </div>
                                                                <MyButton
                                                                    type="button"
                                                                    scale="small"
                                                                    buttonType="secondary"
                                                                    className="mt-2 w-20 min-w-4 border-none font-thin !text-primary-500"
                                                                    onClick={
                                                                        handleAddDropdownOptions
                                                                    }
                                                                >
                                                                    <Plus size={18} />
                                                                    Add
                                                                </MyButton>
                                                            </div>
                                                        )}
                                                        <div className="mb-6 flex justify-center">
                                                            <MyButton
                                                                type="button"
                                                                scale="medium"
                                                                buttonType="primary"
                                                                className="mt-4 w-fit"
                                                                onClick={() =>
                                                                    handleCloseDialog(
                                                                        form.watch(
                                                                            'selectedOptionValue'
                                                                        ),
                                                                        form.watch(
                                                                            'textFieldValue'
                                                                        ),
                                                                        false
                                                                    )
                                                                }
                                                            >
                                                                Done
                                                            </MyButton>
                                                        </div>
                                                    </div>
                                                </DialogContent>
                                            </Dialog>
                                        </div>
                                        <Dialog>
                                            <DialogTrigger className="flex justify-start">
                                                <MyButton
                                                    type="button"
                                                    scale="medium"
                                                    buttonType="secondary"
                                                    className="mt-4 w-fit"
                                                >
                                                    Preview Registration Form
                                                </MyButton>
                                            </DialogTrigger>
                                            <DialogContent className="p-0">
                                                <h1 className="rounded-md bg-primary-50 p-4 font-semibold text-primary-500">
                                                    Preview Registration Form
                                                </h1>
                                                <div className="flex max-h-[80vh] flex-col gap-4 overflow-y-auto px-4 py-2">
                                                    {customFields?.map((testInputFields, idx) => {
                                                        return (
                                                            <div
                                                                className="flex flex-col items-start gap-4"
                                                                key={idx}
                                                            >
                                                                {testInputFields.type ===
                                                                'dropdown' ? (
                                                                    <SelectField
                                                                        label={testInputFields.name}
                                                                        labelStyle="font-normal"
                                                                        name={testInputFields.name}
                                                                        options={
                                                                            testInputFields?.options?.map(
                                                                                (
                                                                                    option,
                                                                                    index
                                                                                ) => ({
                                                                                    value: option.value,
                                                                                    label: option.value,
                                                                                    _id: index,
                                                                                })
                                                                            ) || []
                                                                        }
                                                                        control={form.control}
                                                                        className="w-full font-thin"
                                                                        required={
                                                                            testInputFields.isRequired
                                                                                ? true
                                                                                : false
                                                                        }
                                                                    />
                                                                ) : (
                                                                    <div className="flex w-full flex-col gap-[0.4rem]">
                                                                        <h1 className="text-sm">
                                                                            {testInputFields.name}
                                                                            {testInputFields.isRequired && (
                                                                                <span className="text-subtitle text-danger-600">
                                                                                    *
                                                                                </span>
                                                                            )}
                                                                        </h1>
                                                                        <MyInput
                                                                            inputType="text"
                                                                            inputPlaceholder={
                                                                                testInputFields.name
                                                                            }
                                                                            input=""
                                                                            onChangeFunction={() => {}}
                                                                            size="large"
                                                                            disabled
                                                                            className="!min-w-full"
                                                                        />
                                                                    </div>
                                                                )}
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </DialogContent>
                                        </Dialog>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card className="mb-4">
                                <CardHeader>
                                    <div className="flex items-center gap-2">
                                        <Clock size={22} />
                                        <CardTitle className="text-2xl font-bold">
                                            Learner Access Duration
                                        </CardTitle>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <RadioGroup
                                        value={form.watch('accessDurationType')}
                                        onValueChange={(value) =>
                                            form.setValue('accessDurationType', value)
                                        }
                                        className="flex flex-col gap-2"
                                    >
                                        <div className="flex items-center gap-2">
                                            <RadioGroupItem value="define" id="define-validity" />
                                            <label htmlFor="define-validity" className="text-base">
                                                Define Validity (Days)
                                            </label>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <RadioGroupItem value="session" id="same-session" />
                                            <label htmlFor="same-session" className="text-base">
                                                Same as Session Expiry
                                            </label>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <RadioGroupItem value="payment" id="same-payment" />
                                            <label htmlFor="same-payment" className="text-base">
                                                Same as Payment Plan
                                            </label>
                                        </div>
                                    </RadioGroup>
                                    {form.watch('accessDurationType') === 'define' && (
                                        <div className="mt-4 flex flex-col gap-1">
                                            <label
                                                htmlFor="access-duration-days"
                                                className="text-sm font-medium"
                                            >
                                                Access Duration (Days)
                                            </label>
                                            <Input
                                                id="access-duration-days"
                                                type="number"
                                                min={1}
                                                value={form.watch('accessDurationDays')}
                                                onChange={(e) => {
                                                    form.setValue(
                                                        'accessDurationDays',
                                                        e.target.value
                                                    );
                                                }}
                                                placeholder="Enter number of days"
                                                className="w-48"
                                            />
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                            <Card className="mb-4">
                                <CardHeader>
                                    <CardTitle className="text-2xl font-bold">
                                        Invite via email
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex w-full items-end gap-2">
                                        <div className="flex-1">
                                            <label
                                                htmlFor="invitee-email-input"
                                                className="mb-1 block text-sm font-medium"
                                            >
                                                Enter invitee email
                                            </label>
                                            <Input
                                                id="invitee-email-input"
                                                type="email"
                                                value={form.watch('inviteeEmail')}
                                                onChange={(e) => {
                                                    form.setValue('inviteeEmail', e.target.value);
                                                }}
                                                placeholder="you@email.com"
                                                className="w-full"
                                            />
                                        </div>
                                        <MyButton
                                            type="button"
                                            scale="medium"
                                            buttonType="primary"
                                            className="mb-0"
                                            disable={
                                                !isValidEmail(form.watch('inviteeEmail')) ||
                                                form
                                                    .watch('inviteeEmails')
                                                    .includes(form.watch('inviteeEmail'))
                                            }
                                            onClick={handleAddInviteeEmail}
                                        >
                                            Add
                                        </MyButton>
                                    </div>
                                    {form.watch('inviteeEmails').length > 0 && (
                                        <div className="mt-4 flex flex-wrap gap-2">
                                            {form.watch('inviteeEmails').map((email) => (
                                                <span
                                                    key={email}
                                                    className="text-primary-700 flex items-center gap-1 rounded-full border border-primary-200 bg-primary-50 px-3 py-1 text-sm"
                                                >
                                                    {email}
                                                    <button
                                                        type="button"
                                                        className="ml-1 text-primary-500 hover:text-danger-600"
                                                        onClick={() => {
                                                            handleRemoveInviteeEmail(email);
                                                        }}
                                                    >
                                                        <X size={16} />
                                                    </button>
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                            <Card className="mb-4">
                                <CardHeader>
                                    <div className="flex items-center gap-2">
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <CodeSimple size={22} />
                                                <CardTitle className="text-2xl font-bold">
                                                    Custom HTML
                                                </CardTitle>
                                            </div>
                                            <span className="text-sm text-gray-600">
                                                Add custom HTML content to the invite page
                                            </span>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <PPTViewQuillEditor
                                        value={form.watch('customHtml')}
                                        onChange={(value: string) =>
                                            form.setValue('customHtml', value)
                                        }
                                        placeholder="Enter custom HTML code here..."
                                        className="h-[100px]"
                                    />
                                </CardContent>
                            </Card>
                            <Card className="mb-4">
                                <CardHeader>
                                    <CardTitle className="text-lg font-semibold">
                                        Include Related Courses
                                    </CardTitle>
                                    <span className="text-sm text-gray-600">
                                        Show related courses to students on the invite page
                                    </span>
                                </CardHeader>
                                <CardContent>
                                    <div className="mt-2 flex items-center gap-3">
                                        <ShadSwitch
                                            checked={form.watch('showRelatedCourses')}
                                            onCheckedChange={(value) =>
                                                form.setValue('showRelatedCourses', value)
                                            }
                                        />
                                        <span className="text-sm text-gray-700">
                                            Show related courses on invite page
                                        </span>
                                    </div>
                                    {form.watch('showRelatedCourses') && (
                                        <>
                                            <hr className="my-4 border-t border-gray-200" />
                                            <p className="mb-4">Related Courses</p>
                                            <div className="mb-2 grid grid-cols-1 gap-4 md:grid-cols-2">
                                                {relatedCourses.map((course) => (
                                                    <Card
                                                        key={course.id}
                                                        className="flex flex-row items-center gap-4 border border-gray-200 p-3 shadow-none"
                                                    >
                                                        <img
                                                            src={course.image}
                                                            alt={course.name}
                                                            className="size-12 rounded border border-gray-200 bg-gray-100 object-cover"
                                                        />
                                                        <div className="flex flex-1 flex-row items-center">
                                                            <div className="flex flex-1 flex-col">
                                                                <div className="text-base font-semibold">
                                                                    {course.name}
                                                                </div>
                                                                <div className="mb-1 text-sm text-gray-600">
                                                                    {course.description}
                                                                </div>
                                                            </div>
                                                            <div className="ml-4 flex flex-wrap items-center justify-end gap-1">
                                                                {course.tags.map((tag) => (
                                                                    <span
                                                                        key={tag}
                                                                        className="rounded-xl bg-gray-100 px-3 py-1 text-xs font-bold"
                                                                    >
                                                                        {tag}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </Card>
                                                ))}
                                            </div>
                                            <span className="text-xs text-gray-600">
                                                These courses will be displayed as suggestions on
                                                the invite page to encourage additional enrollments.
                                            </span>
                                        </>
                                    )}
                                </CardContent>
                            </Card>
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
                        onClick={() => setShowSummaryDialog(false)}
                    >
                        Create Invite Link
                    </MyButton>
                </div>
            </DialogContent>
            {/* Payment Plans Dialog */}
            <ShadDialog
                open={form.watch('showPlansDialog')}
                onOpenChange={(open) => form.setValue('showPlansDialog', open)}
            >
                <ShadDialogContent className="flex h-[80vh] min-w-[60vw] max-w-lg flex-col overflow-auto">
                    <ShadDialogHeader>
                        <ShadDialogTitle className="font-bold">
                            Select a Payment Plan
                        </ShadDialogTitle>
                        <ShadDialogDescription className="mt-1">
                            Choose a payment plan for this course
                        </ShadDialogDescription>
                    </ShadDialogHeader>
                    <div className="flex-1 overflow-auto">
                        <div className="mb-4">
                            <div className="mb-2 mt-4 font-semibold">Free Plans</div>
                            <div className="flex flex-col gap-4">
                                {freePlans.map((plan) => (
                                    <Card
                                        key={plan.id}
                                        className={`cursor-pointer border-2 ${form.watch('selectedPlan')?.id === plan.id ? 'border-primary' : 'border-gray-200'} transition-all`}
                                        onClick={() => {
                                            form.setValue('selectedPlan', plan);
                                            form.setValue('showPlansDialog', false);
                                        }}
                                    >
                                        <div className="flex items-center gap-3 p-4">
                                            <Gift size={18} />
                                            <div className="flex flex-1 flex-col">
                                                <span>{plan.name}</span>
                                                <span className="text-neutral-600">
                                                    {plan.description}
                                                </span>
                                            </div>
                                            {form.watch('selectedPlan')?.id === plan.id && (
                                                <Badge variant="default" className="ml-auto">
                                                    Default
                                                </Badge>
                                            )}
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        </div>
                        <div>
                            <div className="mb-2 font-semibold">Paid Plans</div>
                            <div className="flex flex-col gap-4">
                                {paidPlans.map((plan) => (
                                    <Card
                                        key={plan.id}
                                        className={`cursor-pointer border-2 ${form.watch('selectedPlan')?.id === plan.id ? 'border-primary' : 'border-gray-200'} transition-all`}
                                        onClick={() => {
                                            form.setValue('selectedPlan', plan);
                                            form.setValue('showPlansDialog', false);
                                        }}
                                    >
                                        <div className="flex items-center gap-3 p-4">
                                            <Gift size={18} />
                                            <div className="flex flex-1 flex-col">
                                                <span>{plan.name}</span>
                                                <span className="text-neutral-600">
                                                    {plan.description}
                                                </span>
                                                <span className="text-neutral-600">
                                                    {plan.price}
                                                </span>
                                            </div>
                                            {form.watch('selectedPlan')?.id === plan.id && (
                                                <Badge variant="default" className="ml-auto">
                                                    Default
                                                </Badge>
                                            )}
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className="-mb-2 flex justify-center border-t bg-white pt-4">
                        <MyButton
                            type="button"
                            scale="small"
                            buttonType="secondary"
                            onClick={() => form.setValue('showAddPlanDialog', true)}
                            className="p-4"
                        >
                            + Add New Payment Plan
                        </MyButton>
                    </div>
                </ShadDialogContent>
            </ShadDialog>
            {/* Add New Payment Plan Dialog */}
            <ShadDialog
                open={form.watch('showAddPlanDialog')}
                onOpenChange={(open) => form.setValue('showAddPlanDialog', open)}
            >
                <ShadDialogContent className="max-w-md">
                    <ShadDialogHeader>
                        <ShadDialogTitle>Add New Payment Plan</ShadDialogTitle>
                    </ShadDialogHeader>
                    <Form {...addPlanForm}>
                        <form
                            className="space-y-4"
                            onSubmit={addPlanForm.handleSubmit(handleAddPlan)}
                        >
                            <FormField
                                control={addPlanForm.control}
                                name="planType"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Plan Type</FormLabel>
                                        <FormControl>
                                            <Select
                                                value={field.value}
                                                onValueChange={field.onChange}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select plan type" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="free">Free</SelectItem>
                                                    <SelectItem value="paid">Paid</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={addPlanForm.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Plan Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Enter plan name" {...field} />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={addPlanForm.control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Plan Description</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="Enter plan description"
                                                {...field}
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                            {addPlanForm.watch('planType') === 'paid' && (
                                <FormField
                                    control={addPlanForm.control}
                                    name="price"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Plan Charges</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="Enter plan charges (e.g. $49)"
                                                    {...field}
                                                />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                            )}
                            <div className="flex justify-end">
                                <MyButton type="submit" scale="small" buttonType="primary">
                                    Save
                                </MyButton>
                            </div>
                        </form>
                    </Form>
                </ShadDialogContent>
            </ShadDialog>
            {/* Discount Settings Dialog */}
            <ShadDialog
                open={form.watch('showDiscountDialog')}
                onOpenChange={(open) => form.setValue('showDiscountDialog', open)}
            >
                <ShadDialogContent className="flex h-[70vh] min-w-[60vw] max-w-lg flex-col">
                    <ShadDialogHeader>
                        <ShadDialogTitle>Select Discount Settings</ShadDialogTitle>
                        <ShadDialogDescription>
                            Choose a discount coupon or create a new one
                        </ShadDialogDescription>
                    </ShadDialogHeader>
                    <div className="mt-4 flex-1 space-y-4 overflow-auto">
                        {discounts.map((discount) => (
                            <Card
                                key={discount.id}
                                className={`cursor-pointer flex-col gap-1 border-2 p-4 ${form.watch('selectedDiscountId') === discount.id ? 'border-primary' : 'border-gray-200'} transition-all`}
                                onClick={() => {
                                    form.setValue('selectedDiscountId', discount.id);
                                    form.setValue('showDiscountDialog', false);
                                }}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        {discount.id === 'none' ? (
                                            <Prohibit size={16} />
                                        ) : (
                                            <Tag size={16} />
                                        )}
                                        <span className="text-base font-semibold">
                                            {discount.title}
                                        </span>
                                        {form.watch('selectedDiscountId') === discount.id && (
                                            <Badge variant="default" className="ml-2">
                                                Active
                                            </Badge>
                                        )}
                                        {discount.code && (
                                            <span className="rounded bg-gray-100 px-2 py-1 font-mono text-xs text-gray-700">
                                                {discount.code}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                {discount.id !== 'none' && (
                                    <div className="mt-1 flex items-center gap-4 text-sm">
                                        <span className="font-semibold text-green-700">
                                            {discount.type === 'percent'
                                                ? `${discount.value}% off`
                                                : `₹${discount.value} off`}
                                        </span>
                                        <span className="text-xs text-gray-500">
                                            Expires: {discount.expires}
                                        </span>
                                    </div>
                                )}
                            </Card>
                        ))}
                    </div>
                    <div className="-mb-2 flex justify-center border-t bg-white pt-4">
                        <MyButton
                            type="button"
                            scale="small"
                            buttonType="secondary"
                            onClick={() => form.setValue('showAddDiscountDialog', true)}
                            className="p-4"
                        >
                            + Add New Discount
                        </MyButton>
                    </div>
                </ShadDialogContent>
            </ShadDialog>
            {/* Add New Discount Dialog */}
            <ShadDialog
                open={form.watch('showAddDiscountDialog')}
                onOpenChange={(open) => form.setValue('showAddDiscountDialog', open)}
            >
                <ShadDialogContent className="max-w-md">
                    <ShadDialogHeader>
                        <ShadDialogTitle>Add New Discount</ShadDialogTitle>
                    </ShadDialogHeader>
                    <Form {...addDiscountForm}>
                        <form
                            className="space-y-4"
                            onSubmit={addDiscountForm.handleSubmit(handleAddDiscount)}
                        >
                            <FormField
                                control={addDiscountForm.control}
                                name="title"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Discount Title</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Enter discount title" {...field} />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={addDiscountForm.control}
                                name="code"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Discount Code</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Enter discount code" {...field} />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={addDiscountForm.control}
                                name="type"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Discount Type</FormLabel>
                                        <FormControl>
                                            <Select
                                                value={field.value}
                                                onValueChange={field.onChange}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select type" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="percent">
                                                        Percentage Off
                                                    </SelectItem>
                                                    <SelectItem value="rupees">
                                                        Rupees Off
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={addDiscountForm.control}
                                name="value"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Discount Value</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                placeholder={
                                                    addDiscountForm.watch('type') === 'percent'
                                                        ? 'Enter percentage (e.g. 10)'
                                                        : 'Enter amount (e.g. 500)'
                                                }
                                                {...field}
                                                onChange={(e) =>
                                                    field.onChange(Number(e.target.value))
                                                }
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={addDiscountForm.control}
                                name="expires"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Expiry Date</FormLabel>
                                        <FormControl>
                                            <Input type="date" {...field} />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                            <div className="flex justify-end">
                                <MyButton type="submit" scale="small" buttonType="primary">
                                    Save
                                </MyButton>
                            </div>
                        </form>
                    </Form>
                </ShadDialogContent>
            </ShadDialog>
            {/* Referral Program Selection Dialog */}
            <ShadDialog
                open={form.watch('showReferralDialog')}
                onOpenChange={(open) => form.setValue('showReferralDialog', open)}
            >
                <ShadDialogContent className="flex h-[70vh] min-w-[60vw] max-w-lg flex-col">
                    <ShadDialogHeader>
                        <ShadDialogTitle>Select Referral Program</ShadDialogTitle>
                        <ShadDialogDescription>
                            Choose a referral program for this course
                        </ShadDialogDescription>
                    </ShadDialogHeader>
                    <div className="mt-4 flex-1 space-y-4 overflow-auto">
                        {referralPrograms.map((program) => (
                            <Card
                                key={program.id}
                                className={`cursor-pointer flex-col gap-1 border-2 p-4 ${form.watch('selectedReferralId') === program.id ? 'border-primary' : 'border-gray-200'} transition-all`}
                                onClick={() => {
                                    form.setValue('selectedReferralId', program.id);
                                    form.setValue('showReferralDialog', false);
                                }}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <TrendUp size={16} />
                                        <span className="text-base font-semibold">
                                            {program.name}
                                        </span>
                                    </div>
                                    {form.watch('selectedReferralId') === program.id && (
                                        <Badge variant="default" className="ml-2">
                                            Default
                                        </Badge>
                                    )}
                                </div>
                                <div className="mt-2 flex flex-col gap-2">
                                    <div className="flex items-center gap-2">
                                        <Gift size={16} />
                                        <span className="font-semibold">Referee Benefit:</span>
                                        <span className="text-green-700">
                                            {program.refereeBenefit}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Users size={16} />
                                        <span className="font-semibold">Referrer Tiers:</span>
                                    </div>
                                    {program.referrerTiers.map((tier, idx) => (
                                        <div key={idx} className="ml-6 flex items-center gap-2">
                                            <span className="text-gray-700">{tier.tier}</span>
                                            {tier.icon}
                                        </div>
                                    ))}
                                    <div className="flex items-center gap-2">
                                        <Gear size={16} />
                                        <span className="font-semibold">Program Settings:</span>
                                    </div>
                                    <div className="ml-6 flex items-center justify-between">
                                        <span className="text-gray-700">Vesting Period</span>
                                        <span>{program.vestingPeriod}</span>
                                    </div>
                                    <div className="ml-6 flex items-center justify-between">
                                        <span className="text-gray-700">Combine Offers</span>
                                        <span>{program.combineOffers ? 'Yes' : 'No'}</span>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                    <div className="-mb-2 flex justify-center border-t bg-white pt-4">
                        <MyButton
                            type="button"
                            scale="small"
                            buttonType="secondary"
                            onClick={() => form.setValue('showAddReferralDialog', true)}
                            className="p-4"
                        >
                            + Add New Referral Program
                        </MyButton>
                    </div>
                </ShadDialogContent>
            </ShadDialog>
            {/* Add New Referral Program Dialog */}
            <ShadDialog
                open={form.watch('showAddReferralDialog')}
                onOpenChange={(open) => form.setValue('showAddReferralDialog', open)}
            >
                <ShadDialogContent className="max-w-md">
                    <ShadDialogHeader>
                        <ShadDialogTitle>Add New Referral Program</ShadDialogTitle>
                    </ShadDialogHeader>
                    <Form {...addReferralForm}>
                        <form
                            className="space-y-4"
                            onSubmit={addReferralForm.handleSubmit(handleAddReferral)}
                        >
                            <FormField
                                control={addReferralForm.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Program Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Enter program name" {...field} />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={addReferralForm.control}
                                name="refereeBenefit"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Referee Benefit</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g. ₹200 off" {...field} />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={addReferralForm.control}
                                name="referrerTiers"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Referrer Tiers</FormLabel>
                                        <div className="space-y-2">
                                            {field.value.map((tier, idx) => (
                                                <div key={idx} className="flex items-center gap-2">
                                                    <Input
                                                        placeholder="e.g. 5 referrals"
                                                        value={tier.tier}
                                                        onChange={(e) => {
                                                            const newTiers = [...field.value];
                                                            if (newTiers[idx]) {
                                                                newTiers[idx].tier = e.target.value;
                                                                field.onChange(newTiers);
                                                            }
                                                        }}
                                                    />
                                                    <Input
                                                        placeholder="Reward (Gift/Calendar)"
                                                        value={tier.reward}
                                                        onChange={(e) => {
                                                            const newTiers = [...field.value];
                                                            if (newTiers[idx]) {
                                                                newTiers[idx].reward =
                                                                    e.target.value;
                                                                field.onChange(newTiers);
                                                            }
                                                        }}
                                                    />
                                                    <MyButton
                                                        type="button"
                                                        scale="small"
                                                        buttonType="secondary"
                                                        onClick={() => {
                                                            const newTiers = field.value.filter(
                                                                (_, i) => i !== idx
                                                            );
                                                            field.onChange(newTiers);
                                                        }}
                                                        className="px-2"
                                                        disabled={field.value.length === 1}
                                                    >
                                                        Remove
                                                    </MyButton>
                                                </div>
                                            ))}
                                            <MyButton
                                                type="button"
                                                scale="small"
                                                buttonType="secondary"
                                                onClick={() =>
                                                    field.onChange([
                                                        ...field.value,
                                                        { tier: '', reward: '' },
                                                    ])
                                                }
                                                className="mt-1"
                                            >
                                                + Add Tier
                                            </MyButton>
                                        </div>
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={addReferralForm.control}
                                name="vestingPeriod"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Vesting Period</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g. 30 days" {...field} />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={addReferralForm.control}
                                name="combineOffers"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Combine Offers</FormLabel>
                                        <FormControl>
                                            <ShadSwitch
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                            <div className="flex justify-end">
                                <MyButton type="submit" scale="small" buttonType="primary">
                                    Save
                                </MyButton>
                            </div>
                        </form>
                    </Form>
                </ShadDialogContent>
            </ShadDialog>
        </Dialog>
    );
};

export default GenerateInviteLinkDialog;
