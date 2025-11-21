import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Controller, useFieldArray } from 'react-hook-form';
import { MyButton } from '@/components/design-system/button';
import { toast } from 'sonner';
import { useAudienceCampaignForm } from '../../-hooks/useAudienceCampaignForm';
import { AudienceCampaignForm, defaultFormValues } from '../../-schema/AudienceCampaignSchema';
import { useCreateAudienceCampaign } from '../../-hooks/useCreateAudienceCampaign';
import { useUpdateAudienceCampaign } from '../../-hooks/useUpdateAudienceCampaign';
import { useInstituteDetailsStore } from '@/stores/students/students-list/useInstituteDetailsStore';
import CustomInviteFormCard from './CustomInviteFormCard';
import CustomHTMLCard from './CustomHTMLCard';
import { useFileUpload } from '@/hooks/use-file-upload';
import { FileUploadComponent } from '@/components/design-system/file-upload';
import { DashboardLoader } from '@/components/core/dashboard-loader';
import { ImageSquare, PencilSimpleLine } from 'phosphor-react';
import { TokenKey } from '@/constants/auth/tokens';
import { getTokenDecodedData, getTokenFromCookie } from '@/lib/auth/sessionUtility';
import { Info } from '@phosphor-icons/react';
import MultiEmailInput from '../audience-invite/components/MultiEmailInput';
import { Switch } from '@/components/ui/switch';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import CampaignTypeDropdown from './CampaignTypeDropdown';
import StatusDropdown from './StatusDropdown';
import createCampaignLink from '../../-utils/createCampaignLink';
import CampaignLink from './CampaignLink';
import { CampaignItem } from '../../-services/get-campaigns-list';

const parseEmailsFromCsv = (value?: string | null) => {
    if (!value) return [];
    return value
        .split(',')
        .map((email) => email.trim())
        .filter((email) => email.length > 0);
};

const generateKeyFromName = (name: string): string =>
    name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '_')
        .replace(/^_+|_+$/g, '');

const mapApiFieldTypeToUi = (type?: string): 'text' | 'dropdown' | 'number' | 'textfield' => {
    const normalized = (type || '').toLowerCase();
    switch (normalized) {
        case 'dropdown':
        case 'select':
            return 'dropdown';
        case 'number':
            return 'number';
        case 'textfield':
        case 'textarea':
            return 'textfield';
        default:
            return 'text';
    }
};

const parseFieldsInput = (fields?: any[] | string | null) => {
    if (!fields) {
        return null;
    }

    if (Array.isArray(fields)) {
        return fields;
    }

    if (typeof fields === 'string') {
        try {
            const parsed = JSON.parse(fields);
            if (Array.isArray(parsed)) {
                return parsed;
            }
            // console.warn('⚠️ [convertExistingCustomFields] Parsed custom fields is not an array');
        } catch (error) {
            console.error('❌ [convertExistingCustomFields] Failed to parse custom fields JSON:', error);
        }
    }

    return null;
};

const convertExistingCustomFields = (fields?: any[] | string | null) => {
    const normalizedFields = parseFieldsInput(fields);

    if (!normalizedFields || normalizedFields.length === 0) {
        console.log('📋 [convertExistingCustomFields] No custom fields to convert');
        return null;
    }

    console.log('📋 [convertExistingCustomFields] Converting', normalizedFields.length, 'fields from API');
    
    const converted = normalizedFields
        .map((field, index) => {
            const meta = field?.custom_field || {};
            const fieldName = meta.fieldName || field.field_name || `Field ${index + 1}`;
            const fieldKey = meta.fieldKey || generateKeyFromName(fieldName);
            const normalizedKey = fieldKey ? fieldKey.toLowerCase() : '';
            const isPermanent = ['full_name', 'email', 'name'].includes(normalizedKey);
            const configOptions =
                typeof meta.config === 'string' && meta.config.length > 0
                    ? meta.config
                          .split(',')
                          .map((value: string) => value.trim())
                          .filter(Boolean)
                    : undefined;

            const convertedField = {
                id: field.id || meta.id || field.field_id || `${index}`,
                _id: meta.id || field.id || field.field_id,
                type: mapApiFieldTypeToUi(meta.fieldType || field.type),
                name: fieldName,
                oldKey: isPermanent,
                isRequired:
                    typeof meta.isMandatory === 'boolean' ? meta.isMandatory : field.isRequired ?? true,
                key: fieldKey,
                order:
                    typeof meta.formOrder === 'number'
                        ? Math.max(meta.formOrder - 1, 0)
                        : index,
                options: configOptions
                    ? configOptions.map((value: string, optIndex: number) => ({
                          id: `${field.id || meta.id || field.field_id || index}_opt_${optIndex}`,
                          value,
                          disabled: true,
                      }))
                    : undefined,
            };
            
            console.log('📋 [convertExistingCustomFields] Converted field:', fieldName, '(key:', fieldKey, ', permanent:', isPermanent, ')');
            return convertedField;
        })
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
        .map((field, index) => ({
            ...field,
            order: index,
        }));

    console.log('📋 [convertExistingCustomFields] Total converted fields:', converted.length);
    return converted;
};

const formatDateToDateInput = (value?: string | null, fallback?: string) => {
    if (!value) return fallback || '';
    const [datePart] = value.split('T');
    return datePart || value || fallback || '';
};

const formatDateTimeForPayload = (value?: string, isEndOfDay = false) => {
    if (!value) return '';
    if (value.includes('T')) return value;
    return `${value}${isEndOfDay ? 'T23:59:59' : 'T00:00:00'}`;
};

const getCampaignIdentifier = (campaign?: CampaignItem | null) =>
    campaign?.campaign_id || campaign?.id || campaign?.audience_id || '';

const buildInitialFormValues = (campaign?: CampaignItem | null): AudienceCampaignForm | undefined => {
    if (!campaign) return undefined;
    return {
        ...defaultFormValues,
        campaign_name: campaign.campaign_name || '',
        campaign_type: campaign.campaign_type || '',
        description: campaign.description || '',
        campaign_objective: campaign.campaign_objective || '',
        to_notify: campaign.to_notify || '',
        send_respondent_email:
            typeof campaign.send_respondent_email === 'boolean'
                ? campaign.send_respondent_email
                : defaultFormValues.send_respondent_email,
        start_date_local:
            formatDateToDateInput(campaign.start_date_local, defaultFormValues.start_date_local) ||
            defaultFormValues.start_date_local,
        end_date_local:
            formatDateToDateInput(campaign.end_date_local, defaultFormValues.end_date_local) ||
            defaultFormValues.end_date_local,
        status: campaign.status?.toUpperCase?.() || defaultFormValues.status,
        json_web_metadata: campaign.json_web_metadata || '',
    };
};

interface CreateCampaignFormProps {
    onSuccess?: () => void;
    campaign?: CampaignItem | null;
}

export const CreateCampaignForm: React.FC<CreateCampaignFormProps> = ({ onSuccess, campaign }) => {
    const initialFormValues = useMemo(() => buildInitialFormValues(campaign), [campaign]);
    const [emails, setEmails] = useState<string[]>(() => parseEmailsFromCsv(campaign?.to_notify));
    const [latestCampaignShareLink, setLatestCampaignShareLink] = useState<string | null>(null);
    const { form, handleDateChange, handleSubmit, handleReset, isSubmitting } =
        useAudienceCampaignForm(initialFormValues);
    const {
        control,
        register,
        watch,
        setValue,
        getValues,
        formState: { errors },
    } = form;
    const createCampaign = useCreateAudienceCampaign();
    const updateCampaign = useUpdateAudienceCampaign();
    const { instituteDetails } = useInstituteDetailsStore();
    const isEditMode = Boolean(campaign);
    const existingCustomFields = useMemo(
        () => convertExistingCustomFields(campaign?.institute_custom_fields),
        [campaign?.institute_custom_fields]
    );
    const editingCampaignId = useMemo(() => getCampaignIdentifier(campaign), [campaign]);
    const statusValue = watch('status');
    const isStatusActive = statusValue?.toUpperCase?.() === 'ACTIVE';

    useEffect(() => {
        if (campaign) {
            setEmails(parseEmailsFromCsv(campaign.to_notify));
        } else {
            setEmails([]);
        }
    }, [campaign]);

    useEffect(() => {
        if (campaign && editingCampaignId) {
            const shareLink = createCampaignLink(
                editingCampaignId,
                instituteDetails?.learner_portal_base_url
            );
            setLatestCampaignShareLink(shareLink);
        } else if (!campaign) {
            setLatestCampaignShareLink(null);
        }
    }, [campaign, editingCampaignId, instituteDetails?.learner_portal_base_url]);

    // Set start date to today (date only) when form initializes (create mode only)
    useEffect(() => {
        if (campaign) return;
        const today = new Date();
        const todayDateOnly = today.toISOString().split('T')[0] || today.toISOString().substring(0, 10); // Format: YYYY-MM-DD
        if (todayDateOnly) {
            setValue('start_date_local', todayDateOnly, { shouldValidate: false });
        }
    }, [campaign, setValue]);

    // File upload setup
    const { uploadFile, getPublicUrl } = useFileUpload();
    const campaignImageRef = useRef<HTMLInputElement>(null);
    const accessToken = getTokenFromCookie(TokenKey.accessToken);
    const tokenData = getTokenDecodedData(accessToken);
    const INSTITUTE_ID = tokenData && Object.keys(tokenData.authorities || {})[0];
    const userId =
        (tokenData as any)?.sub || (tokenData as any)?.userId || (tokenData as any)?.id || '';

    // Handle file upload for campaign image
    const handleCampaignImageUpload = async (file: File) => {
        try {
            const prev = getValues('uploadingStates');
            setValue('uploadingStates', { ...prev, campaign_image: true });

            const uploadedFileId = await uploadFile({
                file,
                setIsUploading: (state: boolean | ((prev: boolean) => boolean)) => {
                    const currentState = prev.campaign_image;
                    const newState = typeof state === 'function' ? state(currentState) : state;
                    setValue('uploadingStates', { ...prev, campaign_image: newState });
                },
                userId: 'your-user-id',
                source: INSTITUTE_ID,
                sourceId: 'CAMPAIGNS',
            });

            const publicUrl = await getPublicUrl(uploadedFileId || '');

            if (uploadedFileId) {
                setValue('campaign_image', uploadedFileId);
                setValue('campaign_imageBlob', publicUrl);
            }
        } catch (error) {
            console.error('Upload failed:', error);
            toast.error('Failed to upload campaign image');
        } finally {
            const prev = getValues('uploadingStates');
            setValue('uploadingStates', { ...prev, campaign_image: false });
        }
    };

    useEffect(() => {
        if (initialFormValues) {
            form.reset(initialFormValues);
        } else {
            form.reset(defaultFormValues);
        }
    }, [form, initialFormValues]);

    // Custom fields array management
    const { fields: customFieldsArray, move: moveCustomField } = useFieldArray({
        control,
        name: 'custom_fields',
    });
    const customFields = getValues('custom_fields');

    const applyDefaultCustomFields = useCallback(() => {
        // Always include Full Name and Email as permanent fields (first two fields)
        const permanentFields = [
            {
                id: 'full_name_permanent',
                type: 'text' as const,
                name: 'Full Name',
                oldKey: true,
                isRequired: true,
                key: 'full_name',
                order: 0,
            } as any,
            {
                id: 'email_permanent',
                type: 'text' as const,
                name: 'Email',
                oldKey: true,
                isRequired: true,
                key: 'email',
                order: 1,
            } as any,
        ];

        // Normalize all fields with proper order and ensure oldKey is set
        const normalizedFields = permanentFields.map((field, index) => ({
            ...field,
            order: index,
            id: field.id ?? String(index),
            isRequired: field.isRequired ?? true,
            oldKey: (field as any).oldKey ?? false, // Preserve oldKey if already set
        }));

        setValue('custom_fields', normalizedFields, {
            shouldDirty: false,
            shouldTouch: false,
        });
    }, [setValue]);

    const setCustomFieldsFromExisting = useCallback(
        (fields: any[]) => {
            const normalizedFields = fields.map((field, index) => ({
                ...field,
                order: index,
                id: field.id ?? String(index),
                isRequired: field.isRequired ?? true,
                oldKey: field.oldKey ?? false,
            }));
            setValue('custom_fields', normalizedFields, {
                shouldDirty: false,
                shouldTouch: false,
            });
        },
        [setValue]
    );

    useEffect(() => {
        if (isEditMode) {
            if (existingCustomFields && existingCustomFields.length > 0) {
                // console.log('📋 [CreateCampaignForm] Loading existing custom fields for edit:', existingCustomFields.length, 'fields');
                // console.log('📋 [CreateCampaignForm] Existing fields:', existingCustomFields.map(f => ({ name: f.name, key: f.key, oldKey: f.oldKey })));
                setCustomFieldsFromExisting(existingCustomFields);
            } else {
                // console.log('📋 [CreateCampaignForm] No existing custom fields, using defaults');
                applyDefaultCustomFields();
            }
        } else {
            // console.log('📋 [CreateCampaignForm] Create mode - applying default fields (Full Name, Email only)');
            applyDefaultCustomFields();
        }
    }, [
        applyDefaultCustomFields,
        existingCustomFields,
        isEditMode,
        setCustomFieldsFromExisting,
    ]);

    const handleFormReset = () => {
        handleReset();
        if (isEditMode && existingCustomFields && existingCustomFields.length > 0) {
            setCustomFieldsFromExisting(existingCustomFields);
            setEmails(parseEmailsFromCsv(campaign?.to_notify));
        } else {
            applyDefaultCustomFields();
            if (!isEditMode) {
                setEmails([]);
            }
        }
    };

    // Custom field handlers
    const updateFieldOrders = () => {
        const currentFields = getValues('custom_fields');
        if (!currentFields) return;
        const updatedFields = currentFields.map((field, index) => ({
            ...field,
            order: index,
        }));
        setValue('custom_fields', updatedFields, {
            shouldDirty: true,
            shouldTouch: true,
        });
    };

    const handleDeleteOpenField = (id: number) => {
        const updatedFields = customFieldsArray
            .filter((field, idx) => idx !== id)
            .map((field, index) => ({
                ...field,
                order: index,
            }));
        setValue('custom_fields', updatedFields);
    };

    const toggleIsRequired = (id: number) => {
        const updatedFields = customFieldsArray?.map((field, idx) =>
            idx === id ? { ...field, isRequired: !field.isRequired } : field
        );
        setValue('custom_fields', updatedFields);
    };

    const handleAddGender = (type: string, name: string, oldKey: boolean) => {
        const newField = {
            id: String(customFields.length),
            type,
            name,
            oldKey,
            ...(type === 'dropdown' && {
                options: [
                    { id: '0', value: 'MALE', disabled: true },
                    { id: '1', value: 'FEMALE', disabled: true },
                    { id: '2', value: 'OTHER', disabled: true },
                ],
            }),
            isRequired: true,
            key: '',
            order: customFields.length,
        };
        const updatedFields = [...customFields, newField];
        setValue('custom_fields', updatedFields);
    };

    const handleAddOpenFieldValues = (type: string, name: string, oldKey: boolean) => {
        const updatedFields = [
            ...customFields,
            {
                id: String(customFields.length),
                type,
                name,
                oldKey,
                isRequired: true,
                key: '',
                order: customFields.length,
            },
        ];
        setValue('custom_fields', updatedFields);
    };

    // Handler for adding Phone Number (similar to handleAddGender)
    const handleAddPhoneNumber = (type: string, name: string, oldKey: boolean) => {
        const newField = {
            id: String(customFields.length),
            type,
            name,
            oldKey,
            isRequired: true,
            key: 'phone_number',
            order: customFields.length,
        };
        const updatedFields = [...customFields, newField];
        setValue('custom_fields', updatedFields);
    };

    const handleValueChange = (id: string, newValue: string) => {
        const prevOptions = getValues('dropdownOptions');
        setValue(
            'dropdownOptions',
            prevOptions.map((option) =>
                option.id === id ? { ...option, value: newValue } : option
            )
        );
    };

    const handleEditClick = (id: number) => {
        const prevOptions = getValues('dropdownOptions');
        setValue(
            'dropdownOptions',
            prevOptions.map((option, idx) =>
                idx === id ? { ...option, disabled: !option.disabled } : option
            )
        );
    };

    const handleDeleteOptionField = (id: number) => {
        const prevOptions = getValues('dropdownOptions');
        setValue(
            'dropdownOptions',
            prevOptions.filter((field, idx) => idx !== id)
        );
    };

    const handleAddDropdownOptions = () => {
        const prevOptions = getValues('dropdownOptions');
        setValue('dropdownOptions', [
            ...prevOptions,
            {
                id: String(prevOptions.length),
                value: `option ${prevOptions.length + 1}`,
                disabled: true,
            },
        ]);
    };

    const handleCloseDialog = (type: string, name: string, oldKey: boolean) => {
        const newField = {
            id: String(customFields.length),
            type,
            name,
            oldKey,
            ...(type === 'dropdown' && { options: getValues('dropdownOptions') }),
            isRequired: true,
            key: '',
            order: customFields.length,
        };
        const updatedFields = [...customFields, newField];
        setValue('custom_fields', updatedFields);
        setValue('isDialogOpen', false);
        setValue('textFieldValue', '');
        setValue('dropdownOptions', []);
    };


    const mapFieldTypeToPayload = (type?: string) => {
        if (!type) return 'TEXT';
        const normalized = type.toLowerCase();
        switch (normalized) {
            case 'text':
            case 'textfield':
            case 'textarea':
                return 'TEXT';
            case 'number':
                return 'NUMBER';
            case 'email':
                return 'EMAIL';
            case 'date':
                return 'DATE';
            case 'dropdown':
            case 'select':
                return 'DROPDOWN';
            default:
                return normalized.toUpperCase();
        }
    };

    const convertFieldsToPayload = (fields: any[], instituteId: string) => {
        if (!Array.isArray(fields) || fields.length === 0) return [];

        return fields.map((field, index) => {
            const options =
                Array.isArray(field.options) && field.options.length > 0
                    ? field.options.map((option: any) => option.value?.trim()).filter(Boolean)
                    : undefined;

            return {
                institute_id: instituteId,
                custom_field: {
                    fieldName: field.name || field.custom_field?.fieldName || `Field ${index + 1}`,
                    fieldType: mapFieldTypeToPayload(field.type || field.custom_field?.fieldType),
                    isMandatory: Boolean(
                        typeof field.isRequired === 'boolean'
                            ? field.isRequired
                            : field.custom_field?.isMandatory
                    ),
                    formOrder:
                        typeof field.order === 'number'
                            ? field.order + 1
                            : field.custom_field?.formOrder || index + 1,
                    ...(options && { config: options.join(',') }),
                },
            };
        });
    };

    const onFormSubmit = handleSubmit(async (data: AudienceCampaignForm) => {
        if (!instituteDetails?.id) {
            toast.error('Institute context unavailable. Please refresh and try again.');
            return;
        }

        let parsedCustomFields: unknown = undefined;
        if (data.institute_custom_fields) {
            try {
                const parsed = JSON.parse(data.institute_custom_fields);
                if (parsed !== null && !Array.isArray(parsed)) {
                    toast.error('Custom fields JSON must be an array.');
                    return;
                }
                parsedCustomFields = parsed;
            } catch (error) {
                toast.error('Custom fields must be valid JSON.');
                console.error('Invalid custom fields JSON:', error);
                return;
            }
        }

        const hasCustomFieldShape = Array.isArray(parsedCustomFields)
            ? (parsedCustomFields as any[]).every((field) => field && field.custom_field)
            : false;

        const transformedCustomFields = convertFieldsToPayload(
            data.custom_fields || [],
            instituteDetails.id
        );

        const customFieldsFromJson =
            Array.isArray(parsedCustomFields) && parsedCustomFields.length > 0
                ? hasCustomFieldShape
                    ? (parsedCustomFields as any[])
                    : convertFieldsToPayload(parsedCustomFields as any[], instituteDetails.id)
                : [];

        const customFieldsToSend =
            customFieldsFromJson.length > 0 ? customFieldsFromJson : transformedCustomFields;

        // Debug logging
        // console.log('Custom Fields Debug:', {
        //     'data.custom_fields': data.custom_fields,
        //     transformedCustomFields,
        //     parsedCustomFields,
        //     customFieldsToSend,
        // });

        const payload = {
            id: editingCampaignId || undefined,
            institute_id: instituteDetails.id,
            campaign_name: data.campaign_name.trim(),
            campaign_type: data.campaign_type.trim(),
            description: data.description?.trim() || '',
            campaign_objective: data.campaign_objective?.trim() || '',
            to_notify: emails.join(', '),
            send_respondent_email: Boolean(data.send_respondent_email),
            json_web_metadata: data.json_web_metadata?.trim() || '',
            created_by_user_id: userId,
            start_date_local: formatDateTimeForPayload(data.start_date_local, false),
            end_date_local: formatDateTimeForPayload(data.end_date_local, true),
            status: data.status?.toUpperCase?.() || data.status,
            institute_custom_fields: customFieldsToSend,
        };

        try {
            if (isEditMode && editingCampaignId) {
                await updateCampaign.mutateAsync({
                    audienceId: editingCampaignId,
                    payload,
                });
                const shareLink = createCampaignLink(
                    editingCampaignId,
                    instituteDetails?.learner_portal_base_url
                );
                setLatestCampaignShareLink(shareLink);
                onSuccess?.();
            } else {
                const createdCampaign = await createCampaign.mutateAsync(payload);
                const createdCampaignId = createdCampaign?.id || createdCampaign?.campaign_id;
                if (createdCampaignId) {
                    const shareLink = createCampaignLink(
                        createdCampaignId,
                        instituteDetails?.learner_portal_base_url
                    );
                    setLatestCampaignShareLink(shareLink);
                }
                handleFormReset();
                onSuccess?.();
            }
        } catch (error) {
            console.error('Error saving campaign:', error);
            if (!isEditMode) {
                setLatestCampaignShareLink(null);
            }
        }
    });

    useEffect(() => {
        setValue('to_notify', emails.join(', '));
    }, [emails, setValue]);

    const isSaving = isSubmitting || createCampaign.isPending || updateCampaign.isPending;
    const primaryButtonLabel = isEditMode
        ? isSaving
            ? 'Saving...'
            : 'Save Changes'
        : isSaving
          ? 'Creating...'
          : 'Create Campaign';

    return (
        <form onSubmit={onFormSubmit} className="w-full space-y-6">
            {isStatusActive && latestCampaignShareLink && (
                <div className="rounded-lg border border-primary-100 bg-primary-50 p-4">
                    <p className="text-sm font-semibold text-primary-700">
                        Campaign link ready to share
                    </p>
                    <CampaignLink
                        presetLink={latestCampaignShareLink}
                        className="mt-2"
                        label={undefined}
                    />
                </div>
            )}
            {/* Campaign Name */}
            <div>
                <label className="block text-sm font-semibold text-neutral-700">
                    Campaign Name <span className="text-red-500">*</span>
                </label>
                <input
                    type="text"
                    placeholder="Enter campaign name"
                    {...register('campaign_name')}
                    className="mt-2 w-full rounded-lg border border-neutral-300 px-4 py-2.5 text-sm transition-all focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                />
                {errors.campaign_name && (
                    <span className="mt-1 block text-sm text-red-500">
                        {errors.campaign_name.message as string}
                    </span>
                )}
            </div>

            {/* Campaign Image */}

            {/* Campaign Type & Objective Row */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                    <label className="block text-sm font-semibold text-neutral-700">
                        Campaign Type <span className="text-red-500">*</span>
                    </label>
                    <div className="mt-2">
                        <CampaignTypeDropdown
                            value={watch('campaign_type')}
                            error={errors.campaign_type?.message as string}
                            onChange={(val) => {
                                setValue('campaign_type', val, {
                                    shouldValidate: true,
                                    shouldDirty: true,
                                });
                            }}
                        />
                    </div>
                </div>
                {/* CampaignObjective */}
                <div>
                    <label className="block text-sm font-semibold text-neutral-700">
                        Campaign Objective 
                        {/* <span className="text-red-500">*</span> */}
                    </label>
                    <input
                        type="text"
                        placeholder="e.g., Engagement, Retention"
                        {...register('campaign_objective')}
                        className="mt-2 w-full rounded-lg border border-neutral-300 px-4 py-2.5 text-sm transition-all focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                    />
                    {/* {errors.campaign_objective && (
                        <span className="mt-1 block text-sm text-red-500">
                            {errors.campaign_objective.message as string}
                        </span>
                    )} */}
                </div>
            </div>

            {/* Emails & Share Analytics */}
            <div  className="  w-full  gap-2 rounded-lg border border-neutral-300 px-3 py-2">
                <div className="flex flex-wrap gap-2">
                <label className="block text-sm font-semibold text-neutral-700"> Team Notifications </label>
                <TooltipProvider>
                        <Tooltip delayDuration={0}>
                            <TooltipTrigger asChild>
                                <button
                                    type="button"
                                    className="inline-flex items-center justify-center text-neutral-400 hover:text-neutral-600 transition-colors focus:outline-none"
                                    aria-label="Information about sharing campaign analytics"
                                >
                                    <Info className="size-4" weight="bold" />
                                </button>
                            </TooltipTrigger>
                            <TooltipContent className="max-w-xs bg-neutral-800 text-white text-xs">
                                <p>Enter email addresses of team members who should receive campaign updates</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>
                <MultiEmailInput
                    value={emails}
                    onChange={setEmails}
                    placeholder="Enter email addresses"
                    error={errors?.to_notify?.message}
                    
                />
            

            {/* Share Campaign Analytics */}
            <div className="flex items-center justify-between gap-2 px-2 py-2">
                <div className="flex items-center gap-2">
                    <label className="block text-sm font-semibold text-neutral-700">
                        Share Campaign Analytics with Team Members
                    </label>
                    <TooltipProvider>
                        <Tooltip delayDuration={0}>
                            <TooltipTrigger asChild>
                                <button
                                    type="button"
                                    className="inline-flex items-center justify-center text-neutral-400 hover:text-neutral-600 transition-colors focus:outline-none"
                                    aria-label="Information about sharing campaign analytics"
                                >
                                    <Info className="size-4" weight="regular" />
                                </button>
                            </TooltipTrigger>
                            <TooltipContent className="max-w-xs bg-neutral-800 text-white text-xs">
                                <p>Allow team members to view campaign performance metrics and reports</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>
                <Switch
                    checked={watch('send_respondent_email')}
                    onCheckedChange={(checked: boolean) =>
                        setValue('send_respondent_email', checked)
                    }
                />
                </div>
            </div>

            {/* Description */}
            <div>
                <label className="block text-sm font-semibold text-neutral-700">Campaign Description</label>
                <textarea
                    placeholder="Describe the campaign's goals, target audience, and key messages"
                    rows={3}
                    {...register('description')}
                    className="mt-2 w-full resize-none rounded-lg border border-neutral-300 px-4 py-2.5 text-sm transition-all focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                />
                {errors.description && (
                    <span className="mt-1 block text-sm text-red-500">
                        {errors.description.message as string}
                    </span>
                )}
            </div>

            {/* Start & End Date Row */}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {/* Start Date */}
                <div>
                    <label className="block text-sm font-semibold text-neutral-700">
                        Start Date <span className="text-red-500">*</span>
                    </label>
                    <Controller
                        name="start_date_local"
                        control={control}
                        render={({ field }) => {
                            const rawValue = field.value as unknown;
                            let dateValue = '';

                            // Handle different input types (string date, Date object, or ISO string)
                            if (typeof rawValue === 'string' && rawValue !== '') {
                                // If it's already in YYYY-MM-DD format, use it directly
                                if (rawValue.match(/^\d{4}-\d{2}-\d{2}$/)) {
                                    dateValue = rawValue;
                                } else {
                                    // If it's an ISO string, extract just the date part
                                    const date = new Date(rawValue);
                                    if (!Number.isNaN(date.getTime())) {
                                        dateValue = date.toISOString().split('T')[0] || date.toISOString().substring(0, 10);
                                    }
                                }
                            } else if (
                                rawValue &&
                                typeof rawValue === 'object' &&
                                typeof (rawValue as Date).toISOString === 'function'
                            ) {
                                const isoString = (rawValue as Date).toISOString();
                                dateValue = isoString.split('T')[0] || isoString.substring(0, 10);
                            }

                            // Set minimum date to today (date only)
                            const today = new Date();
                            const minDate = today.toISOString().split('T')[0] || today.toISOString().substring(0, 10); // Format: YYYY-MM-DD

                            return (
                                <input
                                    type="date"
                                    value={dateValue}
                                    min={minDate}
                                    onChange={(e) => {
                                        const selectedDate = e.target.value; // Already in YYYY-MM-DD format
                                        setValue('start_date_local', selectedDate, {
                                            shouldValidate: true,
                                            shouldDirty: true,
                                        });
                                    }}
                                    className="mt-2 w-full rounded-lg border border-neutral-300 px-4 py-2.5 text-sm transition-all focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                                />
                            );
                        }}
                    />
                    {errors.start_date_local && (
                        <span className="mt-1 block text-sm text-red-500">
                            {errors.start_date_local.message as string}
                        </span>
                    )}
                </div>

                {/* End Date */}
                <div>
                    <label className="block text-sm font-semibold text-neutral-700">
                        End Date <span className="text-red-500">*</span>
                    </label>
                    <Controller
                        name="end_date_local"
                        control={control}
                        render={({ field }) => {
                            const rawValue = field.value as unknown;
                            let dateValue = '';

                            // Handle different input types (string date, Date object, or ISO string)
                            if (typeof rawValue === 'string' && rawValue !== '') {
                                // If it's already in YYYY-MM-DD format, use it directly
                                if (rawValue.match(/^\d{4}-\d{2}-\d{2}$/)) {
                                    dateValue = rawValue;
                                } else {
                                    // If it's an ISO string, extract just the date part
                                    const date = new Date(rawValue);
                                    if (!Number.isNaN(date.getTime())) {
                                        dateValue = date.toISOString().split('T')[0] || date.toISOString().substring(0, 10);
                                    }
                                }
                            } else if (
                                rawValue &&
                                typeof rawValue === 'object' &&
                                typeof (rawValue as Date).toISOString === 'function'
                            ) {
                                const isoString = (rawValue as Date).toISOString();
                                dateValue = isoString.split('T')[0] || isoString.substring(0, 10);
                            }

                            // Compute minimum End Date = Start Date + 1 day (date only)
                            const startDateValue = watch('start_date_local');
                            let minEndDate: string;

                            if (startDateValue) {
                                const start = new Date(startDateValue);
                                const nextDay = new Date(start);
                                nextDay.setDate(start.getDate() + 1); // Move to the next day
                                const nextDayIso = nextDay.toISOString();
                                minEndDate = (nextDayIso.split('T')[0] || nextDayIso.substring(0, 10)) as string; // Format: YYYY-MM-DD
                            } else {
                                // Fallback: today + 1 day
                                const tomorrow = new Date();
                                tomorrow.setDate(tomorrow.getDate() + 1);
                                const tomorrowIso = tomorrow.toISOString();
                                minEndDate = (tomorrowIso.split('T')[0] || tomorrowIso.substring(0, 10)) as string; // Format: YYYY-MM-DD
                            }

                            return (
                                <input
                                    type="date"
                                    value={dateValue}
                                    min={minEndDate}
                                    onChange={(e) => {
                                        const selectedDate = e.target.value; // Already in YYYY-MM-DD format
                                        setValue('end_date_local', selectedDate, {
                                            shouldValidate: true,
                                            shouldDirty: true,
                                        });
                                    }}
                                    className="mt-2 w-full rounded-lg border border-neutral-300 px-4 py-2.5 text-sm transition-all focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                                />
                            );
                        }}
                    />
                    {errors.end_date_local && (
                        <span className="mt-1 block text-sm text-red-500">
                            {errors.end_date_local.message as string}
                        </span>
                    )}
                </div>
            </div>

            {/* Status */}
            <div>
                <div className="flex items-center gap-2">
                <label className="block text-sm font-semibold text-neutral-700">Status</label>
                <TooltipProvider>
                        <Tooltip delayDuration={0}>
                            <TooltipTrigger asChild>
                                <button
                                    type="button"
                                    className="inline-flex items-center justify-center text-neutral-400 hover:text-neutral-600 transition-colors focus:outline-none"
                                    aria-label="Information about sharing campaign analytics"
                                >
                                    <Info className="size-4" weight="bold" />
                                </button>
                            </TooltipTrigger>
                            <TooltipContent className="max-w-xs bg-neutral-800 text-white text-xs">
                                <p>To share the campaign link with Learners, please ensure the campaign status is set to Active.</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>
                <div className="mt-2">
                    <StatusDropdown
                        value={watch('status')}
                        error={errors.status?.message as string}
                        onChange={(val) => {
                            setValue('status', val, {
                                shouldValidate: true,
                                shouldDirty: true,
                            });
                        }}
                    />
                </div>
            </div>

            {/* JSON Metadata */}
            {/* <div>
                <label className="block text-sm font-semibold text-neutral-700">
                    JSON Web Metadata
                </label>
                <textarea
                    placeholder="Optional metadata JSON"
                    rows={3}
                    {...register('json_web_metadata')}
                    className="mt-2 w-full rounded-lg border border-neutral-300 px-4 py-2.5 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-all resize-none"
                />
                {errors.json_web_metadata && (
                    <span className="mt-1 block text-sm text-red-500">
                        {errors.json_web_metadata.message as string}
                    </span>
                )}
            </div> */}

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
                handleAddPhoneNumber={handleAddPhoneNumber}
            />

            {/* Custom HTML Card */}
            {/* <CustomHTMLCard form={form} /> */}

            {/* Form Actions */}
            <div className="flex items-center justify-end gap-3 border-t border-neutral-200 pt-6">
                <MyButton type="button" onClick={handleFormReset} buttonType="secondary" scale="medium">
                    Reset
                </MyButton>
                <MyButton
                    type="submit"
                    disabled={isSaving}
                    buttonType="primary"
                    scale="medium"
                >
                    {primaryButtonLabel}
                </MyButton>
            </div>
        </form>
    );
};
