import { MyButton } from '@/components/design-system/button';
import { zodResolver } from '@hookform/resolvers/zod';
import { Separator } from '@radix-ui/react-separator';
import { FormProvider, useFieldArray, useForm } from 'react-hook-form';
import { FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { z } from 'zod';
import { MyInput } from '@/components/design-system/input';
import SelectField from '@/components/design-system/select-field';
import { MainViewQuillEditor } from '@/components/quill/MainViewQuillEditor';
import { useFilterDataForAssesment } from '@/routes/assessment/assessment-list/-utils.ts/useFiltersData';
import { useSuspenseQuery } from '@tanstack/react-query';
import { useInstituteQuery } from '@/services/student-list-section/getInstituteDetails';

const weekDaysEnum = z.enum(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']);

const recurringClassSchema = z.object({
    day: weekDaysEnum,
    startTime: z.string().min(1, 'Start time is required'),
    duration: z.string().min(1, 'Duration is required'),
    link: z.string().url('Invalid link').optional().or(z.literal('')),
});

export const sessionFormSchema = z.object({
    title: z.string().min(3, 'Title must be at least 3 characters'),
    startTime: z.string({
        required_error: 'Start time is required',
        invalid_type_error: 'Invalid date',
    }),
    endDate: z.string({
        required_error: 'End date is required',
        invalid_type_error: 'Invalid date',
    }),
    timeZone: z.string().min(1, 'Time zone is required'),
    events: z.string().regex(/^\d+$/, 'Must be a number'),
    description: z.string().min(1, 'Enter some description'),
    durationMinutes: z
        .number({
            required_error: 'Duration is required',
            invalid_type_error: 'Duration must be a number',
        })
        .min(15, 'Minimum duration is 15 minutes'),
    access: z.enum(['public', 'private']),
    meetingType: z.enum(['once', 'recurring']),
    recurringSchedule: z.array(recurringClassSchema).optional(),
});

export default function ScheduleStep1() {
    const form = useForm<z.infer<typeof sessionFormSchema>>({
        resolver: zodResolver(sessionFormSchema),
        defaultValues: {
            title: '',
            description: '',
            meetingType: 'recurring',
            access: 'public',
            recurringSchedule: [],
            timeZone: '(GMT 5:30) India Standard Time (Asia/Kolkata)',
            events: '1',
        },
        mode: 'onChange',
    });

    const { control } = form;
    const { data: instituteDetails } = useSuspenseQuery(useInstituteQuery());
    const { SubjectFilterData } = useFilterDataForAssesment(instituteDetails);

    const { fields, append, remove } = useFieldArray({
        control,
        name: 'recurringSchedule',
    });

    const addLiveClass = () =>
        append({
            day: 'Tue',
            startTime: '06:00 AM',
            duration: '1 hr',
            link: '',
        });

    return (
        <FormProvider {...form}>
            <form>
                <div className="m-0 flex items-center justify-between p-0">
                    <h1>Live Session Information</h1>
                    <MyButton type="button" scale="large" buttonType="primary">
                        {/* Submit or Next */}
                    </MyButton>
                </div>
                <Separator className="my-4" />

                <div className="flex flex-col gap-6">
                    <div className="flex w-full items-start justify-start gap-4">
                        <FormField
                            control={control}
                            name="title"
                            render={({ field }) => (
                                <FormItem>
                                    <FormControl>
                                        <MyInput
                                            inputType="text"
                                            inputPlaceholder="Add Title"
                                            input={field.value}
                                            labelStyle="font-thin"
                                            onChangeFunction={field.onChange}
                                            error={form.formState.errors.title?.message}
                                            required
                                            size="large"
                                            label="Title"
                                            {...field}
                                        />
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                        <SelectField
                            label="Subject"
                            name="subject"
                            labelStyle="font-thin"
                            options={SubjectFilterData.map((option, index) => ({
                                value: option.name,
                                label: option.name,
                                _id: index,
                            }))}
                            control={form.control}
                            className="mt-[8px] w-56 font-thin"
                        />
                    </div>

                    <div className="flex flex-col gap-6" id="assessment-instructions">
                        <h1 className="-mb-5 font-thin">Description</h1>
                        <FormField
                            control={control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormControl>
                                        <MainViewQuillEditor
                                            onChange={field.onChange}
                                            value={field.value}
                                            CustomclasssName="h-[200px]"
                                        />
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                    </div>

                    <Separator />

                    {/* Recurring Class Settings */}
                    <div className="flex flex-wrap gap-4">
                        <FormField
                            control={control}
                            name="startTime"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Start Date & Time</FormLabel>
                                    <FormControl>
                                        <MyInput
                                            inputType="datetime-local"
                                            input={field.value}
                                            onChangeFunction={field.onChange}
                                        />
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={control}
                            name="endDate"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>End Date</FormLabel>
                                    <FormControl>
                                        <MyInput
                                            inputType="date"
                                            input={field.value}
                                            onChangeFunction={field.onChange}
                                        />
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={control}
                            name="timeZone"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Time Zone</FormLabel>
                                    <FormControl>
                                        <MyInput
                                            inputType="text"
                                            input={field.value}
                                            onChangeFunction={field.onChange}
                                        />
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={control}
                            name="events"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Events</FormLabel>
                                    <FormControl>
                                        <MyInput
                                            inputType="number"
                                            input={field.value}
                                            onChangeFunction={field.onChange}
                                        />
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                    </div>

                    <div className="flex flex-col gap-4">
                        <div className="flex gap-2 text-sm text-muted-foreground">
                            <span>Every day</span>
                            <span>Start Time</span>
                            <span>Duration</span>
                            <span>Live Class link</span>
                        </div>

                        {fields.map((item, index) => (
                            <div key={item.id} className="flex items-center gap-3">
                                <FormField
                                    control={control}
                                    name={`recurringSchedule.${index}.day`}
                                    render={({ field }) => (
                                        <MyInput
                                            label=""
                                            input={field.value}
                                            onChangeFunction={field.onChange}
                                        />
                                    )}
                                />
                                <FormField
                                    control={control}
                                    name={`recurringSchedule.${index}.startTime`}
                                    render={({ field }) => (
                                        <MyInput
                                            input={field.value}
                                            onChangeFunction={field.onChange}
                                        />
                                    )}
                                />
                                <FormField
                                    control={control}
                                    name={`recurringSchedule.${index}.duration`}
                                    render={({ field }) => (
                                        <MyInput
                                            input={field.value}
                                            onChangeFunction={field.onChange}
                                        />
                                    )}
                                />
                                <FormField
                                    control={control}
                                    name={`recurringSchedule.${index}.link`}
                                    render={({ field }) => (
                                        <MyInput
                                            input={field.value}
                                            onChangeFunction={field.onChange}
                                            placeholder="Live class link"
                                        />
                                    )}
                                />
                                <MyButton type="button" onClick={() => remove(index)}>
                                    Remove
                                </MyButton>
                            </div>
                        ))}

                        <MyButton type="button" onClick={addLiveClass}>
                            + Add more live class
                        </MyButton>
                    </div>

                    <Separator />
                </div>
            </form>
        </FormProvider>
    );
}
