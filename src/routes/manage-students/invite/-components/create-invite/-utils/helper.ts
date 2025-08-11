import { getInstituteId } from '@/constants/helper';
import { InviteLinkFormValues } from '../GenerateInviteLinkSchema';
import { CustomField } from '../../../-schema/InviteFormSchema';
import { IndividualInviteLinkDetails } from '@/types/study-library/individual-invite-interface';
import { PaymentPlanApi } from '@/types/payment';

interface DropdownOptionForConversion {
    id: number | string;
    value: string;
    disabled?: boolean;
}

interface CustomFieldForConversion {
    id: number | string;
    type: string;
    name: string;
    oldKey: boolean;
    isRequired: boolean;
    options?: DropdownOptionForConversion[];
    key?: string;
    order?: number;
}

export interface ReferralData {
    id: string;
    name: string;
    status: string; // Add more status types if applicable
    source: string; // Adjust as needed
    source_id: string;
    referrer_discount_json: string;
    referee_discount_json: string;
    referrer_vesting_days: number;
    tag: string;
    description: string;
    created_at: string; // Consider `Date` if you parse it
    updated_at: string; // Consider `Date` if you parse it
}

interface ReferrerReward {
    referral_count: number;
    reward: {
        type: string;
    };
}

type ApiCourseData = {
    course: {
        id: string;
        package_name: string;
    };
    sessions: {
        session_dto: {
            id: string;
            session_name: string;
        };
        level_with_details: {
            id: string;
            name: string;
        }[];
    }[];
};

type FreePlan = {
    id: string;
    name: string;
    description: string;
    days?: number;
    suggestedAmount?: number[];
    minAmount?: number;
    currency?: string;
    type?: string;
};

interface PaidPlan {
    id: string;
    name: string;
    description: string;
    price?: string;
    type?: string;
    currency?: string;
    paymentOption?: {
        value: number;
        unit: string;
        price: string;
        features: string[];
        title: string;
        newFeature: string;
    }[];
}

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

export interface PaymentOption {
    id: string;
    name: string;
    status: string; // add more status types if needed
    source: string; // update with other possible sources
    source_id: string;
    tag: string; // restrict more if tag values are known
    type: string; // assuming these are the possible types
    require_approval: boolean;
    payment_plans: PaymentPlanApi[]; // Payment plans array
    payment_option_metadata_json: string; // or parsed as: PaymentOptionMetadata if you want to parse it
}

interface PaymentPlansInterface {
    value: number;
    unit: string;
    price: string;
    features: string[];
    title: string;
    newFeature: string;
}

export function transformApiDataToDummyStructure(data: ApiCourseData[]) {
    const dummyCourses: { id: string; name: string }[] = [];
    const dummyBatches: Record<
        string,
        {
            sessionId: string;
            sessionName: string;
            levels: {
                levelId: string;
                levelName: string;
            }[];
        }[]
    > = {};

    data.forEach((courseItem) => {
        const courseId = courseItem.course.id;
        const courseName = courseItem.course.package_name;

        // Add to dummyCourses
        dummyCourses.push({
            id: courseId,
            name: courseName,
        });

        // Prepare sessions for dummyBatches
        const sessions = courseItem.sessions.map((sessionItem) => ({
            sessionId: sessionItem.session_dto.id,
            sessionName: sessionItem.session_dto.session_name,
            levels: sessionItem.level_with_details.map((lvl) => ({
                levelId: lvl.id,
                levelName: lvl.name,
            })),
        }));

        dummyBatches[courseId] = sessions;
    });

    return { dummyCourses, dummyBatches };
}

function transformCustomFields(customFields: CustomField[], instituteId: string) {
    const toSnakeCase = (str: string) =>
        str
            .trim()
            .replace(/\s+/g, '_') // Replace spaces with underscores
            .replace(/([a-z])([A-Z])/g, '$1_$2') // Add underscore between camelCase transitions
            .toLowerCase();

    return customFields.map((field, index) => {
        const isDropdown = field.type === 'dropdown';
        const options = isDropdown ? field.options?.map((opt) => opt.value).join(',') : '';

        return {
            id: crypto.randomUUID(),
            institute_id: instituteId,
            type: field.type,
            type_id: '',
            custom_field: {
                guestId: '',
                id: crypto.randomUUID(),
                fieldKey: toSnakeCase(field.name),
                fieldName: field.name,
                fieldType: field.type,
                defaultValue: '',
                config: isDropdown ? JSON.stringify({ coommaSepartedOptions: options }) : '',
                formOrder: index,
                isMandatory: field.isRequired,
                isFilter: true,
                isSortable: true,
                createdAt: '',
                updatedAt: '',
                sessionId: '',
                liveSessionId: '',
                customFieldValue: '',
            },
        };
    });
}

function safeJsonParse<T = unknown>(str: string, fallback: T): T {
    if (!str) return fallback;
    try {
        return JSON.parse(str);
    } catch {
        return fallback;
    }
}

export function ReTransformCustomFields(customFields: IndividualInviteLinkDetails) {
    return customFields?.institute_custom_fields?.map((field) => {
        const config = safeJsonParse<{ coommaSepartedOptions?: string }>(
            field.custom_field.config,
            {}
        );
        return {
            id: field.id,
            type: field.type,
            name: field.custom_field.fieldName,
            oldKey: false,
            isRequired: field.custom_field.isMandatory,
            options: config.coommaSepartedOptions ? config.coommaSepartedOptions.split(',') : [],
            _id: '',
            status: 'ACTIVE',
        };
    });
}

export function convertInviteData(
    data: InviteLinkFormValues,
    selectedCourse: Course | null,
    selectedBatches: Batch[],
    getPackageSessionId: ({
        courseId,
        levelId,
        sessionId,
    }: {
        courseId: string;
        levelId: string;
        sessionId: string;
    }) => void,
    paymentPlans: PaymentOption[],
    referralProgramDetails: ReferralData[],
    instituteLogoFileId: string
) {
    const instituteId = getInstituteId();
    const jsonMetaData = {
        course: data.course,
        description: data.description,
        learningOutcome: data.learningOutcome,
        aboutCourse: data.aboutCourse,
        targetAudience: data.targetAudience,
        coursePreview: data.coursePreview,
        courseBanner: data.courseBanner,
        courseMedia: data.courseMedia,
        coursePreviewBlob: data.coursePreviewBlob,
        courseBannerBlob: data.courseBannerBlob,
        courseMediaBlob: data.courseMediaBlob,
        tags: data.tags,
        showRelatedCourses: data.showRelatedCourses,
        includeInstituteLogo: data.includeInstituteLogo,
        instituteLogoFileId: instituteLogoFileId,
        restrictToSameBatch: data.restrictToSameBatch,
        includePaymentPlans: data.includePaymentPlans,
        customHtml: data.customHtml,
    };
    const convertedData = {
        id: '',
        name: data.name,
        start_date: '',
        end_date: '',
        invite_code: '',
        status: 'ACTIVE',
        institute_id: instituteId,
        vendor: 'STRIPE',
        vendor_id: 'STRIPE',
        currency: '',
        tag: '',
        learner_access_days:
            data.selectedPlan?.type === 'subscription' ? data.accessDurationDays : null,
        web_page_meta_data_json: JSON.stringify(jsonMetaData),
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        institute_custom_fields: transformCustomFields(data.custom_fields, instituteId || ''),
        package_session_to_payment_options: [
            {
                package_session_id: getPackageSessionId({
                    courseId: selectedCourse ? selectedCourse.id : '',
                    levelId: selectedBatches[0]?.levelId || '',
                    sessionId: selectedBatches[0]?.sessionId || '',
                }),
                payment_option: getMatchingPaymentAndReferralPlanForAPIs(
                    paymentPlans,
                    data.selectedPlan?.id || '',
                    referralProgramDetails,
                    data.selectedReferralId
                ),
            },
        ],
    };
    return convertedData;
}

export function splitPlansByType(data: PaymentOption[]): {
    freePlans: FreePlan[];
    paidPlans: PaidPlan[];
} {
    const freePlans: FreePlan[] = [];
    const paidPlans: PaidPlan[] = [];

    data.forEach((item) => {
        if (item.type === 'FREE' || item.type === 'free' || item.type === 'donation') {
            const parsedData = JSON.parse(item.payment_option_metadata_json);
            if (item.type === 'donation') {
                freePlans.push({
                    id: item.id,
                    name: item.name,
                    description: 'Access to donation plan.',
                    suggestedAmount:
                        parsedData?.donationData?.suggestedAmounts
                            ?.split(',')
                            ?.map((x: string) => Number(x.trim())) || [],
                    minAmount: Number(parsedData?.donationData?.minimumAmount) || 0,
                    currency: parsedData?.currency || '',
                    type: item.type,
                });
            } else {
                freePlans.push({
                    id: item.id,
                    name: item.name,
                    description: 'Access to free plan.',
                    days: parsedData?.freeData?.validityDays || 0,
                    type: item.type,
                });
            }
        } else {
            const parsedData = JSON.parse(item.payment_option_metadata_json);
            if (item.type === 'upfront') {
                paidPlans.push({
                    id: item.id,
                    name: item.name,
                    description: 'Access to one time payment plan.',
                    price: parsedData?.upfrontData?.fullPrice || '',
                    currency: parsedData?.currency || '',
                    type: item.type,
                });
            } else {
                paidPlans.push({
                    id: item.id,
                    name: item.name,
                    description: 'Access to subscription plan.',
                    currency: parsedData?.currency || '',
                    type: item.type,
                    paymentOption:
                        parsedData?.subscriptionData?.customIntervals.map(
                            (interval: PaymentPlansInterface) => {
                                return {
                                    value: interval.value || 0,
                                    unit: interval.unit || '',
                                    price: interval.price || '',
                                    features: interval.features || [],
                                    title: interval.title || '',
                                    newFeature: interval.newFeature || '',
                                };
                            }
                        ) || [],
                });
            }
        }
    });

    return { freePlans, paidPlans };
}

export function getDefaultPlanFromPaymentsData(data: PaymentOption[]) {
    const item = data.find((item) => item.tag === 'DEFAULT');
    if (!item)
        return {
            id: '',
            name: '',
            days: 0,
            suggestedAmount: [],
            minAmount: 0,
            currency: '',
            price: '',
            paymentOption: [],
            type: '',
        };
    const parsedData = JSON.parse(item.payment_option_metadata_json);
    if (item.type === 'donation') {
        return {
            id: item.id,
            name: item.name,
            description: 'Access to donation plan.',
            suggestedAmount:
                parsedData?.donationData?.suggestedAmounts
                    ?.split(',')
                    ?.map((x: string) => Number(x.trim())) || [],
            minAmount: Number(parsedData?.donationData?.minimumAmount) || 0,
            currency: parsedData?.currency || '',
            type: item.type,
        };
    } else if (item.type === 'free' || item.type === 'FREE' || item.type === 'Free') {
        return {
            id: item.id,
            name: item.name,
            description: 'Access to free plan.',
            days: parsedData?.freeData?.validityDays || 0,
            type: item.type,
        };
    } else if (item.type === 'upfront') {
        return {
            id: item.id,
            name: item.name,
            description: 'Access to one time payment plan.',
            price: parsedData?.upfrontData?.fullPrice || '',
            currency: parsedData?.currency || '',
            type: item.type,
        };
    } else {
        return {
            id: item.id,
            name: item.name,
            description: 'Access to subscription plan.',
            currency: parsedData?.currency || '',
            type: item.type,
            paymentOption:
                parsedData?.subscriptionData?.customIntervals.map(
                    (interval: PaymentPlansInterface) => {
                        return {
                            value: interval.value || 0,
                            unit: interval.unit || '',
                            price: interval.price || '',
                            features: interval.features || [],
                            title: interval.title || '',
                            newFeature: interval.newFeature || '',
                        };
                    }
                ) || [],
        };
    }
}

export function getMatchingPaymentPlan(data: PaymentOption[], id: string) {
    const item = data.find((item) => item.id === id);
    if (!item)
        return {
            id: '',
            name: '',
            days: 0,
            suggestedAmount: [],
            minAmount: 0,
            currency: '',
            price: '',
            paymentOption: [],
            type: '',
        };
    const parsedData = JSON.parse(item.payment_option_metadata_json);
    if (item.type === 'donation') {
        return {
            id: item.id,
            name: item.name,
            description: 'Access to donation plan.',
            suggestedAmount:
                parsedData?.donationData?.suggestedAmounts
                    ?.split(',')
                    ?.map((x: string) => Number(x.trim())) || [],
            minAmount: Number(parsedData?.donationData?.minimumAmount) || 0,
            currency: parsedData?.currency || '',
            type: item.type,
        };
    } else if (item.type === 'free' || item.type === 'FREE' || item.type === 'Free') {
        return {
            id: item.id,
            name: item.name,
            description: 'Access to free plan.',
            days: parsedData?.freeData?.validityDays || 0,
            type: item.type,
        };
    } else if (item.type === 'upfront') {
        return {
            id: item.id,
            name: item.name,
            description: 'Access to one time payment plan.',
            price: parsedData?.upfrontData?.fullPrice || '',
            currency: parsedData?.currency || '',
            type: item.type,
        };
    } else {
        return {
            id: item.id,
            name: item.name,
            description: 'Access to subscription plan.',
            currency: parsedData?.currency || '',
            type: item.type,
            paymentOption:
                parsedData?.subscriptionData?.customIntervals.map(
                    (interval: PaymentPlansInterface) => {
                        return {
                            value: interval.value || 0,
                            unit: interval.unit || '',
                            price: interval.price || '',
                            features: interval.features || [],
                            title: interval.title || '',
                            newFeature: interval.newFeature || '',
                        };
                    }
                ) || [],
        };
    }
}

export function getMatchingPaymentAndReferralPlanForAPIs(
    data: PaymentOption[],
    id: string,
    referralProgramDetails: ReferralData[],
    referralId: string
) {
    const referralProgram = referralProgramDetails.find((item) => item.id === referralId);
    const item = data.find((item) => item.id === id);

    return {
        ...item,
        payment_plans: item?.payment_plans?.map((plan) => {
            return {
                ...plan,
                referral_option: referralProgram,
            };
        }),
    };
}

export function getPaymentOptionBySessionId(
    data: IndividualInviteLinkDetails,
    targetSessionId: string | null
) {
    return (
        data?.package_session_to_payment_options?.find(
            (item) => item.package_session_id === targetSessionId
        ) || null
    );
}

export function convertReferralData(data: ReferralData[]) {
    if (!data)
        return {
            id: '',
            name: '',
            refereeBenefit: {
                type: '',
                value: 0,
                currency: '',
            },
            referrerBenefit: [
                {
                    referralCount: 0,
                    type: '',
                },
            ],
            vestingPeriod: 0,
            combineOffers: false,
        };
    return data?.map((item) => {
        const refereeDiscountJson = safeJsonParse(item.referee_discount_json, {
            reward: { type: '', value: 0, currency: '' },
        });
        const referrerDiscountJson = safeJsonParse(item.referrer_discount_json, { rewards: [] });
        return {
            id: item?.id,
            name: item?.name,
            refereeBenefit: {
                type: refereeDiscountJson?.reward?.type || '',
                value: refereeDiscountJson?.reward?.value || 0,
                currency: refereeDiscountJson?.reward?.currency || '',
            },
            referrerBenefit:
                referrerDiscountJson?.rewards?.map((reward: ReferrerReward) => {
                    return {
                        referralCount: reward?.referral_count || 0,
                        type: reward?.reward?.type || '',
                    };
                }) || [],
            vestingPeriod: item?.referrer_vesting_days || 0,
            combineOffers: true,
        };
    });
}

export function getDefaultMatchingReferralData(data: ReferralData[]) {
    const item = data.find((item) => item.tag === 'DEFAULT');
    if (!item)
        return {
            id: '',
            name: '',
            refereeBenefit: {
                type: '',
                value: 0,
                currency: '',
            },
            referrerBenefit: [
                {
                    referralCount: 0,
                    type: '',
                },
            ],
            vestingPeriod: 0,
            combineOffers: false,
        };
    const refereeDiscountJson = safeJsonParse(item.referee_discount_json, {
        reward: { type: '', value: 0, currency: '' },
    });
    const referrerDiscountJson = safeJsonParse(item.referrer_discount_json, { rewards: [] });
    return {
        id: item.id,
        name: item.name,
        refereeBenefit: {
            type: refereeDiscountJson?.reward?.type || '',
            value: refereeDiscountJson?.reward?.value || 0,
            currency: refereeDiscountJson?.reward?.currency || '',
        },
        referrerBenefit:
            referrerDiscountJson?.rewards?.map((reward: ReferrerReward) => {
                return {
                    referralCount: reward?.referral_count || 0,
                    type: reward?.reward?.type || '',
                };
            }) || [],
        vestingPeriod: item.referrer_vesting_days || 0,
        combineOffers: true,
    };
}

export function convertRegistrationFormData(data: CustomFieldForConversion[]) {
    const now = new Date().toISOString();
    const transformedData = data.map((field: CustomFieldForConversion) => ({
        comma_separated_options:
            field.type === 'dropdown'
                ? field.options?.map((opt: DropdownOptionForConversion) => opt.value).join(',') ||
                  ''
                : '',
        created_at: now,
        field_key: field.key || field.name.toLowerCase().replace(/\s+/g, '_'),
        field_name: field.name,
        field_order: field.order ?? 0,
        field_type: field.type,
        id: field.id.toString(),
        is_mandatory: field.isRequired || false,
        status: 'ACTIVE',
        updated_at: now,
    }));
    return transformedData;
}
