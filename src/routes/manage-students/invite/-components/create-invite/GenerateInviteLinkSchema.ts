// Dummy related courses data
import { z, z as zod } from 'zod';
import { z as zodDiscount } from 'zod';

export const relatedCourses = [
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
    inviteLinkId?: string;
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
export const inviteLinkSchema = z.object({
    name: z.string(),
    includeInstituteLogo: z.boolean().default(false),
    requireApproval: z.boolean().default(false),
    messageTemplate: z.enum(['standard', 'review', 'custom']).optional(),
    customMessage: z.string().optional(),
    id: z.string().optional(),
    course: z.string().optional(),
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
                days: z.number().optional(),
                suggestedAmount: z.array(z.number()).optional(),
                minAmount: z.number().optional(),
                currency: z.string().optional(),
                type: z.string().optional(),
            })
        )
        .default([]),
    paidPlans: z
        .array(
            z.object({
                id: z.string(),
                name: z.string(),
                price: z.string().optional(),
                currency: z.string().optional(),
                paymentOption: z
                    .array(
                        z.object({
                            value: z.number(),
                            unit: z.string(),
                            price: z.string(),
                            features: z.array(z.string()),
                            title: z.string(),
                            newFeature: z.string(),
                        })
                    )
                    .optional(),
                type: z.string().optional(),
            })
        )
        .default([]),
    showPlansDialog: z.boolean().default(false),
    selectedPlan: z
        .object({
            id: z.string(),
            name: z.string(),
            days: z.number().optional(),
            suggestedAmount: z.array(z.number()).optional(),
            minAmount: z.number().optional(),
            currency: z.string().optional(),
            price: z.string().optional(),
            paymentOption: z
                .array(
                    z.object({
                        value: z.number(),
                        unit: z.string(),
                        price: z.string(),
                        features: z.array(z.string()),
                        title: z.string(),
                        newFeature: z.string(),
                    })
                )
                .optional(),
            type: z.string().optional(),
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
                vestingPeriod: z.number(),
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

export type InviteLinkFormValues = z.infer<typeof inviteLinkSchema>;

// Add new plan form schema
export const addPlanSchema = zod.object({
    planType: zod.enum(['free', 'paid']),
    name: zod.string().min(1, 'Plan name is required'),
    description: zod.string().min(1, 'Description is required'),
    price: zod.string().optional(),
});

export type AddPlanFormValues = zod.infer<typeof addPlanSchema>;

export const addDiscountSchema = zodDiscount.object({
    title: zodDiscount.string().min(1, 'Title is required'),
    code: zodDiscount.string().min(1, 'Code is required'),
    type: zodDiscount.enum(['percent', 'rupees']),
    value: zodDiscount.number().min(1, 'Value is required'),
    expires: zodDiscount.string().min(1, 'Expiry date is required'),
});
export type AddDiscountFormValues = zodDiscount.infer<typeof addDiscountSchema>;

// Add Referral Program form schema
export const addReferralSchema = zod.object({
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
    vestingPeriod: zod.number(),
    combineOffers: zod.boolean(),
});
export type AddReferralFormValues = zod.infer<typeof addReferralSchema>;
