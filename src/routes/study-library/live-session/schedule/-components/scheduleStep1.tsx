import { MyButton } from '@/components/design-system/button';
import { zodResolver } from '@hookform/resolvers/zod';
import { Separator } from '@radix-ui/react-separator';
import { FieldErrors, FormProvider, useForm, useWatch } from 'react-hook-form';
import { FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { z } from 'zod';
import { MyInput } from '@/components/design-system/input';
import SelectField from '@/components/design-system/select-field';
import { MainViewQuillEditor } from '@/components/quill/MainViewQuillEditor';
import { useFilterDataForAssesment } from '@/routes/assessment/assessment-list/-utils.ts/useFiltersData';
import { useSuspenseQuery } from '@tanstack/react-query';
import { useInstituteQuery } from '@/services/student-list-section/getInstituteDetails';
import { MyRadioButton } from '@/components/design-system/radio';
import { useState } from 'react';
import { RecurringType } from '../../-constants/enums';
import { WEEK_DAYS } from '../../-constants/type';
import { sessionFormSchema } from '../-schema/schema';
import { Trash } from 'phosphor-react';
import { MyDialog } from '@/components/design-system/dialog';
import { MeetLogo, YoutubeLogo, ZoomLogo } from '@/svgs';
import { mapFormToStep1DTO, timeOptions } from '../../-constants/helper';

export default function ScheduleStep1() {
    const [createLinkDialog, setCreateLinkDialog] = useState<boolean>(false);

    const form = useForm<z.infer<typeof sessionFormSchema>>({
        resolver: zodResolver(sessionFormSchema),
        defaultValues: {
            title: '',
            description: '',
            meetingType: RecurringType.ONCE,
            recurringSchedule: WEEK_DAYS.map((day) => ({
                day: day.value,
                isSelect: false,
                sessions: [
                    {
                        startTime: '00:00',
                        duration: '',
                        link: '',
                    },
                ],
            })),
            timeZone: '(GMT 5:30) India Standard Time (Asia/Kolkata)',
            events: '1',
        },
        mode: 'onChange',
    });

    const { control, watch } = form;

    const addSessionToDay = (dayIndex: number) => {
        const currentSchedule = form.getValues('recurringSchedule');
        const daySchedule = currentSchedule?.[dayIndex];

        if (!daySchedule) return; // early exit if for some reason it's undefined

        const updatedSessions = [
            ...daySchedule.sessions,
            {
                startTime: '',
                duration: '',
                link: '',
            },
        ];

        form.setValue(`recurringSchedule.${dayIndex}.sessions`, updatedSessions, {
            shouldDirty: true,
            shouldValidate: true,
        });
    };

    const removeSessionFromDay = (dayIndex: number, sessionIndex: number) => {
        const sessions = form.getValues(`recurringSchedule.${dayIndex}.sessions`);
        const updatedSessions = [...sessions];
        updatedSessions.splice(sessionIndex, 1);

        form.setValue(`recurringSchedule.${dayIndex}.sessions`, updatedSessions);

        // If no sessions left, deselect the day
        if (updatedSessions.length === 0) {
            form.setValue(`recurringSchedule.${dayIndex}.isSelect`, false);
        }
    };

    const { data: instituteDetails } = useSuspenseQuery(useInstituteQuery());
    const { SubjectFilterData } = useFilterDataForAssesment(instituteDetails);

    const meetingType = useWatch({
        control,
        name: 'meetingType',
    });

    const onSubmit = (data: z.infer<typeof sessionFormSchema>) => {
        console.log('Valid form data:', data);
        // Perform your API call or next step here
        const body = mapFormToStep1DTO(data);
        console.log(body);
    };

    const onError = (errors: FieldErrors<typeof sessionFormSchema>) => {
        console.log('Validation errors:', errors);
        // You can show a toast or scroll to the first error here
    };

    const toggleEveryDay = () => {
        const currentSchedule = form.getValues('recurringSchedule');
        const allSelected = currentSchedule?.every((day) => day.isSelect);

        currentSchedule?.forEach((day, index) => {
            const isSelecting = !allSelected;

            form.setValue(`recurringSchedule.${index}.isSelect`, isSelecting);

            if (isSelecting) {
                const sessions = form.getValues(`recurringSchedule.${index}.sessions`);
                if (!sessions || sessions.length === 0) {
                    form.setValue(`recurringSchedule.${index}.sessions`, [
                        {
                            startTime: '',
                            duration: '',
                            link: '',
                        },
                    ]);
                }
            }
        });
    };

    const recurringSchedule = watch('recurringSchedule');

    return (
        <FormProvider {...form}>
            <form onSubmit={form.handleSubmit(onSubmit, onError)} className="flex flex-col gap-4">
                <div className="m-0 flex items-center justify-between p-0">
                    <h1>Live Session Information</h1>
                    <MyButton type="submit" scale="large" buttonType="primary">
                        Next
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

                    <div className="flex h-[280px] flex-col gap-6">
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

                    <div>
                        <FormField
                            control={control}
                            name="meetingType"
                            render={({ field }) => (
                                <MyRadioButton
                                    name="meetingType"
                                    value={field.value}
                                    onChange={field.onChange}
                                    options={[
                                        { label: 'One Time Class', value: RecurringType.ONCE },
                                        { label: 'Recurring Class', value: RecurringType.WEEKLY },
                                    ]}
                                    className="flex flex-row gap-4"
                                />
                            )}
                        />
                    </div>

                    <div className="flex flex-col gap-4">
                        <div className="flex flex-row gap-6">
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
                            <div>
                                <div>duration</div>
                                <div className="flex flex-row items-center gap-2">
                                    <FormField
                                        control={control}
                                        name="durationHours"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel></FormLabel>
                                                <FormControl>
                                                    <MyInput
                                                        inputType="text" // Keep the input type as text
                                                        inputPlaceholder="00"
                                                        input={field.value}
                                                        onKeyPress={(e) => {
                                                            const charCode = e.key;
                                                            if (!/[0-9]/.test(charCode)) {
                                                                e.preventDefault(); // Prevent non-numeric input
                                                            }
                                                        }}
                                                        onChangeFunction={(e) => {
                                                            const inputValue =
                                                                e.target.value.replace(
                                                                    /[^0-9]/g,
                                                                    ''
                                                                ); // Sanitize input
                                                            field.onChange(inputValue); // Update field value
                                                        }}
                                                        className="w-11 p-2"
                                                    />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />
                                    <div>hrs :</div>
                                    <FormField
                                        control={control}
                                        name="durationMinutes"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel></FormLabel>
                                                <FormControl>
                                                    <MyInput
                                                        inputType="text" // Keep the input type as text
                                                        inputPlaceholder="00"
                                                        input={field.value}
                                                        onKeyPress={(e) => {
                                                            const charCode = e.key;
                                                            if (!/[0-9]/.test(charCode)) {
                                                                e.preventDefault(); // Prevent non-numeric input
                                                            }
                                                        }}
                                                        onChangeFunction={(e) => {
                                                            const inputValue =
                                                                e.target.value.replace(
                                                                    /[^0-9]/g,
                                                                    ''
                                                                ); // Sanitize input
                                                            field.onChange(inputValue); // Update field value
                                                        }}
                                                        className="w-11 p-2"
                                                    />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />
                                    <div>minutes</div>
                                </div>
                            </div>
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
                        </div>
                        {meetingType === RecurringType.WEEKLY && (
                            <div className="flex flex-row gap-6">
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
                        )}

                        <div className="flex flex-row items-end gap-4">
                            <FormField
                                control={control}
                                name="defaultLink"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Live Class Link</FormLabel>
                                        <FormControl>
                                            <MyInput
                                                inputType="text"
                                                inputPlaceholder="Add Link"
                                                input={field.value}
                                                labelStyle="font-thin"
                                                onChangeFunction={field.onChange}
                                                error={form.formState.errors.defaultLink?.message}
                                                required
                                                size="large"
                                                {...field}
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                            <MyButton type="button" buttonType="secondary">
                                Create
                            </MyButton>
                            <MyDialog
                                open={createLinkDialog}
                                onOpenChange={setCreateLinkDialog}
                                heading="Create Live Class Link"
                            >
                                <div className="flex w-full flex-col items-center justify-center gap-4 p-4">
                                    <div className="flex w-3/4 cursor-pointer items-center justify-center rounded-md border p-2 shadow-sm">
                                        <MeetLogo></MeetLogo>
                                    </div>
                                    <div className="flex w-3/4 cursor-pointer items-center justify-center rounded-md border p-2 shadow-sm">
                                        <YoutubeLogo></YoutubeLogo>
                                    </div>
                                    <div className="flex w-3/4 cursor-pointer items-center justify-center rounded-md border p-2 shadow-sm">
                                        <ZoomLogo></ZoomLogo>
                                    </div>
                                </div>
                            </MyDialog>
                        </div>
                    </div>

                    {meetingType === RecurringType.WEEKLY && (
                        <>
                            <div className="flex w-fit flex-col items-start justify-start gap-4">
                                <div className="flex flex-row items-center gap-2 ">
                                    <MyButton
                                        type="button"
                                        buttonType="secondary"
                                        scale="small"
                                        onClick={toggleEveryDay}
                                        className="p-4"
                                    >
                                        Every day
                                    </MyButton>
                                    <div className="w-[100px]">Start Time</div>
                                    <div className="w-[200px]">Duration</div>
                                    <div>Live Class link</div>
                                </div>
                            </div>
                        </>
                    )}

                    {meetingType === RecurringType.WEEKLY &&
                        recurringSchedule?.map((dayField, dayIndex) => {
                            const isSelect = watch(`recurringSchedule.${dayIndex}.isSelect`);

                            return (
                                <div key={dayField.day} className="flex flex-col">
                                    <div className="flex flex-row gap-2">
                                        <div
                                            className={`flex h-9 w-24 cursor-pointer items-center justify-center rounded-lg border px-2 py-1 text-center ${
                                                isSelect
                                                    ? 'border-primary-500 bg-primary-100'
                                                    : 'border-gray-300'
                                            }`}
                                            onClick={() =>
                                                form.setValue(
                                                    `recurringSchedule.${dayIndex}.isSelect`,
                                                    !isSelect
                                                )
                                            }
                                        >
                                            {dayField.day}
                                        </div>
                                        <div className="flex  flex-col  gap-2">
                                            {isSelect &&
                                                dayField.sessions.map((session, sessionIndex) => (
                                                    <div
                                                        key={dayField.day}
                                                        className="flex flex-row items-center gap-2"
                                                    >
                                                        <SelectField
                                                            label=""
                                                            name={`recurringSchedule.${dayIndex}.sessions.${sessionIndex}.startTime`}
                                                            labelStyle="font-thin"
                                                            options={timeOptions?.map(
                                                                (option, index) => ({
                                                                    value: option, // option is already a string like "06:00"
                                                                    label: option,
                                                                    _id: index,
                                                                })
                                                            )}
                                                            control={form.control}
                                                            className="mt w-[100px] -translate-y-1 font-thin"
                                                        />
                                                        <FormField
                                                            control={control}
                                                            name={`recurringSchedule.${dayIndex}.sessions.${sessionIndex}.duration`}
                                                            render={({ field }) => (
                                                                <MyInput
                                                                    inputType="text"
                                                                    input={field.value}
                                                                    placeholder="Duration (in Mins)"
                                                                    onChangeFunction={
                                                                        field.onChange
                                                                    }
                                                                    className="w-[100px]"
                                                                />
                                                            )}
                                                        />
                                                        <FormField
                                                            control={control}
                                                            name={`recurringSchedule.${dayIndex}.sessions.${sessionIndex}.link`}
                                                            render={({ field }) => (
                                                                <MyInput
                                                                    inputType="text"
                                                                    input={field.value}
                                                                    placeholder="Live Link"
                                                                    onChangeFunction={
                                                                        field.onChange
                                                                    }
                                                                />
                                                            )}
                                                        />
                                                        <Trash
                                                            className="m-0 size-6 cursor-pointer p-0 text-red-500"
                                                            onClick={() =>
                                                                removeSessionFromDay(
                                                                    dayIndex,
                                                                    sessionIndex
                                                                )
                                                            }
                                                        />
                                                        <MyButton
                                                            buttonType="secondary"
                                                            type="button"
                                                            onClick={() => {
                                                                setCreateLinkDialog(
                                                                    !createLinkDialog
                                                                );
                                                            }}
                                                        >
                                                            Create Link
                                                        </MyButton>
                                                        <MyDialog
                                                            open={createLinkDialog}
                                                            onOpenChange={setCreateLinkDialog}
                                                            heading="Create Live Class Link"
                                                        >
                                                            <div className="flex w-full flex-col items-center justify-center gap-4 p-4">
                                                                <div className="flex w-3/4 cursor-pointer items-center justify-center rounded-md border p-2 shadow-sm">
                                                                    <MeetLogo></MeetLogo>
                                                                </div>
                                                                <div className="flex w-3/4 cursor-pointer items-center justify-center rounded-md border p-2 shadow-sm">
                                                                    <YoutubeLogo></YoutubeLogo>
                                                                </div>
                                                                <div className="flex w-3/4 cursor-pointer items-center justify-center rounded-md border p-2 shadow-sm">
                                                                    <ZoomLogo></ZoomLogo>
                                                                </div>
                                                            </div>
                                                        </MyDialog>
                                                    </div>
                                                ))}
                                        </div>
                                    </div>
                                    <div>
                                        {isSelect && (
                                            <MyButton
                                                type="button"
                                                buttonType="text"
                                                onClick={() => addSessionToDay(dayIndex)}
                                                className="m-0 p-0 text-start text-sm text-primary-500"
                                            >
                                                + Add session
                                            </MyButton>
                                        )}
                                    </div>
                                </div>
                            );
                        })}

                    <Separator />
                </div>
            </form>
        </FormProvider>
    );
}
