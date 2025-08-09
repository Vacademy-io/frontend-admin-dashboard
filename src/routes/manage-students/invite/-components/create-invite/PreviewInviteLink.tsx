import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Award, Target, Info, BookOpen, RotateCcw } from 'lucide-react';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { MyButton } from '@/components/design-system/button';
import { Eye, GraduationCap } from 'phosphor-react';
import { FormProvider, useForm, UseFormReturn } from 'react-hook-form';
import { InviteLinkFormValues } from './GenerateInviteLinkSchema';
import { FormControl, FormField, FormItem } from '@/components/ui/form';
import PhoneInputField from '@/components/design-system/phone-input-field';
import SelectField from '@/components/design-system/select-field';
import { MyInput } from '@/components/design-system/input';
import {
    AssessmentCustomFieldOpenRegistration,
    getDynamicSchema,
} from './-utils/dynamic-registration-form-helper';
import { convertRegistrationFormData } from './-utils/helper';
import z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useMemo } from 'react';

export interface PreviewInviteLinkProps {
    form: UseFormReturn<InviteLinkFormValues>;
    levelName: string;
    instituteLogo: string;
}

// Utility to extract YouTube video ID
const extractYouTubeVideoId = (url: string): string | null => {
    const regExp = /^.*(?:youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[1] && match[1].length === 11 ? match[1] : null;
};

const PreviewInviteLink = ({ form, levelName, instituteLogo }: PreviewInviteLinkProps) => {
    // Watch custom_fields for changes
    const watchedCustomFields = form.watch('custom_fields');

    // Memoized conversion of custom fields
    const convertedFields = useMemo(() => {
        const fields = watchedCustomFields || [];
        return convertRegistrationFormData(fields);
    }, [watchedCustomFields]);

    // Memoized zodSchema that updates when fields change
    const zodSchema = useMemo(() => {
        return getDynamicSchema(convertedFields);
    }, [convertedFields]);

    type FormValues = z.infer<typeof zodSchema>;
    type FormFieldPath = keyof FormValues extends string ? `${keyof FormValues}.value` : never;

    // Memoized default values that update when fields change
    const defaultValues = useMemo(() => {
        return convertedFields
            .sort(
                (
                    a: AssessmentCustomFieldOpenRegistration,
                    b: AssessmentCustomFieldOpenRegistration
                ) => a.field_order - b.field_order
            )
            .reduce(
                (
                    defaults: Record<
                        string,
                        {
                            id: string;
                            name: string;
                            value: string;
                            is_mandatory: boolean;
                            type: string;
                            comma_separated_options?: string[];
                        }
                    >,
                    field: AssessmentCustomFieldOpenRegistration
                ) => {
                    if (field.field_type === 'dropdown') {
                        const optionsArray = field.comma_separated_options
                            ? field.comma_separated_options.split(',').map((opt) => opt.trim())
                            : [];

                        defaults[field.field_key] = {
                            id: field.id,
                            name: field.field_name,
                            value: optionsArray[0] || '',
                            is_mandatory: field.is_mandatory || false,
                            comma_separated_options: optionsArray,
                            type: field.field_type,
                        };
                    } else {
                        defaults[field.field_key] = {
                            id: field.id,
                            name: field.field_name,
                            value: '',
                            is_mandatory: field.is_mandatory || false,
                            type: field.field_type,
                        };
                    }
                    return defaults;
                },
                {} as Record<
                    string,
                    {
                        id: string;
                        name: string;
                        value: string;
                        is_mandatory: boolean;
                        type: string;
                        comma_separated_options?: string[];
                    }
                >
            );
    }, [convertedFields]);

    const registrationForm = useForm<FormValues>({
        resolver: zodResolver(zodSchema),
        defaultValues,
        mode: 'onChange',
    });

    // Reset form when schema or defaults change
    useEffect(() => {
        registrationForm.reset(defaultValues);
    }, [defaultValues, registrationForm]);
    return (
        <>
            <Dialog>
                <DialogTrigger>
                    <MyButton
                        type="button"
                        scale="small"
                        buttonType="secondary"
                        className="mr-4 p-4 py-5"
                    >
                        <Eye size={32} />
                        Preview Invite
                    </MyButton>
                </DialogTrigger>
                <DialogContent className="mx-auto max-h-[90vh] w-full space-y-8 overflow-y-auto md:max-w-[80%]">
                    <Card className="w-full overflow-hidden border-0 bg-white/80 shadow-xl backdrop-blur-sm">
                        {/* Instiute Logo */}
                        {instituteLogo && (
                            <div className="flex items-center justify-center rounded-lg pt-8">
                                <img
                                    src={instituteLogo}
                                    alt="Institute Logo"
                                    className="size-12 rounded-full"
                                />
                            </div>
                        )}
                        {/* Banner Image */}
                        <div className="rounded-lg p-8 !pb-0">
                            {form.getValues('courseBannerBlob') ? (
                                <div className="relative h-32 w-full overflow-hidden rounded-xl sm:h-56 lg:h-72">
                                    <img
                                        src={form.getValues('courseBannerBlob')}
                                        alt="Course Banner"
                                        className="size-full object-contain"
                                    />
                                </div>
                            ) : (
                                <div className="relative h-32 w-full overflow-hidden rounded-xl bg-primary-500 sm:h-56 lg:h-72"></div>
                            )}
                        </div>
                        <CardContent className="p-6 sm:p-8">
                            {/* Course Name */}
                            <div className="mb-4 flex items-start gap-2 sm:gap-3">
                                <BookOpen className="mt-0.5 size-5 shrink-0 text-blue-600 sm:size-6" />
                                <h2 className="text-lg font-semibold leading-tight text-gray-900 sm:text-xl md:text-2xl">
                                    {form.getValues('course')}
                                </h2>
                            </div>
                            {/* Tags Row */}
                            {form.getValues('tags')?.length > 0 && (
                                <div className="mb-6 flex flex-wrap gap-2">
                                    {form.getValues('tags')?.map((tag: string, index: number) => (
                                        <Badge
                                            key={index}
                                            variant="secondary"
                                            className="bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800 transition-colors hover:bg-blue-200"
                                        >
                                            {tag}
                                        </Badge>
                                    ))}
                                </div>
                            )}

                            {/* Course Description */}
                            <p
                                className="mb-6 text-base leading-relaxed text-gray-700 sm:text-lg"
                                dangerouslySetInnerHTML={{
                                    __html: form.getValues('description') || '',
                                }}
                            />

                            {/* Level Badge */}
                            <div className="mb-8 flex items-start gap-2">
                                <Award className="mt-0.5 size-5 shrink-0 text-amber-500" />
                                <Badge
                                    variant="outline"
                                    className="border-amber-200 px-3 py-1 text-sm font-medium text-amber-700"
                                >
                                    Level:&nbsp;{levelName}
                                </Badge>
                            </div>

                            <Separator className="my-8" />

                            {/* What Learners Will Gain Section */}
                            {form.getValues('learningOutcome') && (
                                <div className="mb-8">
                                    <div className="mb-4 flex items-start gap-2 sm:gap-3">
                                        <Target className="mt-0.5 size-5 shrink-0 text-green-600 sm:size-6" />
                                        <h2 className="text-lg font-semibold leading-tight text-gray-900 sm:text-xl md:text-2xl">
                                            What Learners Will Gain
                                        </h2>
                                    </div>
                                    <div className="grid gap-3">
                                        <p
                                            className="text-sm text-gray-700 sm:text-base"
                                            dangerouslySetInnerHTML={{
                                                __html: form.getValues('learningOutcome') || '',
                                            }}
                                        />
                                    </div>
                                </div>
                            )}

                            {form.getValues('coursePreviewBlob') && (
                                <div className="flex items-center justify-center rounded-lg pt-8">
                                    <img
                                        src={form.getValues('coursePreviewBlob')}
                                        alt="Course Preview Image"
                                        className="w-fit"
                                    />
                                </div>
                            )}

                            <Separator className="my-8" />

                            {/* About the Course Section */}
                            {form.getValues('aboutCourse') && (
                                <div className="mb-8">
                                    <div className="mb-4 flex items-start gap-2 sm:gap-3">
                                        <Info className="mt-0.5 size-5 shrink-0 text-blue-600 sm:size-6" />
                                        <h2 className="text-lg font-semibold leading-tight text-gray-900 sm:text-xl md:text-2xl">
                                            About the Course
                                        </h2>
                                    </div>
                                    <p
                                        className="text-sm leading-relaxed text-gray-700 sm:text-base"
                                        dangerouslySetInnerHTML={{
                                            __html: form.getValues('aboutCourse') || '',
                                        }}
                                    />
                                </div>
                            )}

                            {/* Right side - Video Player - More Compact */}
                            {form.getValues('courseMedia')?.id &&
                                (form.getValues('courseMedia')?.type === 'youtube' ? (
                                    <div
                                        className={`shrink-0 overflow-hidden rounded-lg shadow-lg`}
                                    >
                                        <div className="relative flex aspect-video items-center justify-center overflow-hidden rounded-lg bg-black">
                                            <iframe
                                                width="100%"
                                                height="100%"
                                                src={`https://www.youtube.com/embed/${extractYouTubeVideoId(form.getValues('courseMedia')?.id || '')}`}
                                                title="YouTube video player"
                                                frameBorder="0"
                                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                allowFullScreen
                                                className="size-full object-contain"
                                            />
                                        </div>
                                    </div>
                                ) : form.getValues('courseMedia')?.type === 'video' ? (
                                    <div
                                        className={`shrink-0 overflow-hidden rounded-lg shadow-lg`}
                                    >
                                        <div className="relative aspect-video overflow-hidden rounded-lg bg-black">
                                            <video
                                                src={form.getValues('courseMediaBlob')}
                                                controls
                                                controlsList="nodownload noremoteplayback"
                                                disablePictureInPicture
                                                disableRemotePlayback
                                                className="size-full object-contain"
                                                onError={(e) => {
                                                    e.currentTarget.style.display = 'none';
                                                    e.currentTarget.parentElement?.classList.add(
                                                        'bg-black'
                                                    );
                                                }}
                                            >
                                                Your browser does not support the video tag.
                                            </video>
                                        </div>
                                    </div>
                                ) : (
                                    <div
                                        className={`shrink-0 overflow-hidden rounded-lg shadow-lg`}
                                    >
                                        <div className="relative aspect-video overflow-hidden rounded-lg bg-black">
                                            <img
                                                src={form.getValues('courseMediaBlob')}
                                                alt="Course Banner"
                                                className="size-full object-contain"
                                            />
                                        </div>
                                    </div>
                                ))}
                        </CardContent>
                    </Card>
                    <Card
                        id="registration-card"
                        className="w-full overflow-hidden border-0 bg-white/80 shadow-xl backdrop-blur-sm"
                    >
                        <CardContent className="p-6 sm:p-8">
                            <div className="mb-6 flex items-start gap-2 sm:gap-3">
                                <div className="shrink-0 rounded-lg bg-blue-100 p-1.5 sm:p-2">
                                    <GraduationCap className="size-5 text-blue-600 sm:size-6" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-semibold leading-tight text-gray-900 sm:text-xl md:text-2xl">
                                        Registration Details
                                    </h2>
                                    <p className="mt-1 text-sm text-gray-600">
                                        Fill in your details to enroll in the course
                                    </p>
                                </div>
                            </div>

                            <Separator className="mb-6" />

                            <div className="flex w-full items-center justify-center">
                                <div className="mx-4 mb-4 flex w-full flex-col items-start justify-center rounded-xl bg-white p-4 py-0">
                                    <FormProvider {...registrationForm}>
                                        <form className="mt-4 flex max-h-full w-full flex-col gap-6 overflow-auto">
                                            {Object.entries(registrationForm.getValues()).map(
                                                ([key, value]: [
                                                    string,
                                                    {
                                                        id: string;
                                                        name: string;
                                                        value: string;
                                                        is_mandatory: boolean;
                                                        type: string;
                                                        comma_separated_options?: string[];
                                                    },
                                                ]) =>
                                                    key === 'phone_number' ? (
                                                        <FormField
                                                            key={key}
                                                            control={registrationForm.control}
                                                            name={`${key}.value` as FormFieldPath}
                                                            render={() => (
                                                                <FormItem>
                                                                    <FormControl>
                                                                        <PhoneInputField
                                                                            label="Phone Number"
                                                                            placeholder="123 456 7890"
                                                                            name={`${key}.value`}
                                                                            control={
                                                                                registrationForm.control
                                                                            }
                                                                            country="in"
                                                                            required
                                                                        />
                                                                    </FormControl>
                                                                </FormItem>
                                                            )}
                                                        />
                                                    ) : (
                                                        <FormField
                                                            key={key}
                                                            control={registrationForm.control}
                                                            name={`${key}.value` as FormFieldPath}
                                                            render={({ field }) => (
                                                                <FormItem>
                                                                    <FormControl>
                                                                        {value.type ===
                                                                        'dropdown' ? (
                                                                            <SelectField
                                                                                label={value.name}
                                                                                name={`${key}.value`}
                                                                                options={
                                                                                    value.comma_separated_options?.map(
                                                                                        (
                                                                                            option: string,
                                                                                            index: number
                                                                                        ) => ({
                                                                                            value: option,
                                                                                            label: option,
                                                                                            _id: index,
                                                                                        })
                                                                                    ) || []
                                                                                }
                                                                                control={
                                                                                    registrationForm.control
                                                                                }
                                                                                required={
                                                                                    value.is_mandatory
                                                                                }
                                                                                className="!w-full"
                                                                            />
                                                                        ) : (
                                                                            <MyInput
                                                                                inputType="text"
                                                                                inputPlaceholder={
                                                                                    value.name
                                                                                }
                                                                                input={
                                                                                    field.value as string
                                                                                }
                                                                                onChangeFunction={
                                                                                    field.onChange
                                                                                }
                                                                                required={
                                                                                    value.is_mandatory
                                                                                }
                                                                                size="large"
                                                                                label={value.name}
                                                                                className="!w-full !max-w-full"
                                                                            />
                                                                        )}
                                                                    </FormControl>
                                                                </FormItem>
                                                            )}
                                                        />
                                                    )
                                            )}
                                            <div className="flex flex-col items-center justify-center gap-4">
                                                <MyButton
                                                    type="button"
                                                    buttonType="primary"
                                                    scale="large"
                                                    layoutVariant="default"
                                                    className="w-full rounded-lg bg-gradient-to-r from-green-600 to-green-700 px-6 py-3 font-semibold text-white shadow-lg transition-all duration-200 hover:from-green-700 hover:to-green-800 hover:shadow-xl md:w-fit"
                                                >
                                                    <GraduationCap className="mr-2 size-5" />
                                                    Register
                                                </MyButton>
                                                <button
                                                    type="button"
                                                    className="mb-2 flex cursor-pointer items-center gap-2 text-sm text-gray-500 transition-colors duration-200 hover:text-gray-700"
                                                    onClick={() => registrationForm.reset()}
                                                >
                                                    <RotateCcw className="size-4" />
                                                    Reset Form
                                                </button>
                                            </div>
                                        </form>
                                    </FormProvider>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    {form.getValues('customHtml') && (
                        <Card
                            id="registration-card"
                            className="w-full overflow-hidden border-0 bg-white/80 shadow-xl backdrop-blur-sm"
                        >
                            <CardContent className="p-6 sm:p-8">
                                <div className="mb-6 flex items-start gap-2 sm:gap-3">
                                    <div
                                        className="size-full"
                                        dangerouslySetInnerHTML={{
                                            __html: form.getValues('customHtml') || '',
                                        }}
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
};

export default PreviewInviteLink;
