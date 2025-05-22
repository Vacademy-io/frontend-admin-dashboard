import { z } from 'zod';
import { AccessType, RecurringType } from '../../-constants/enums';

const weekDaysEnum = z.enum(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']);

const sessionDetailsSchema = z.object({
    startTime: z.string().optional(),
    duration: z.string().optional(),
    link: z.string().url('Invalid URL').optional().or(z.literal('')),
});

const weeklyClassSchema = z.object({
    day: weekDaysEnum,
    isSelect: z.boolean(),
    sessions: z.array(sessionDetailsSchema),
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
    durationMinutes: z.string({
        required_error: 'Duration is required',
    }),
    durationHours: z.string({
        required_error: 'Duration is required',
    }),
    defaultLink: z.string().url('Invalid URL').optional().or(z.literal('')),
    meetingType: z.nativeEnum(RecurringType),
    recurringSchedule: z.array(weeklyClassSchema).optional(),
});

export const addParticipantsSchema = z.object({
    accessType: z.nativeEnum(AccessType),
    batchSelectionType: z.enum(['batch', 'individual']),
    selectedLevels: z.array(
        z.object({
            courseId: z.string(),
            sessionId: z.string(),
            levelId: z.string(),
        })
    ),
    selectedLearners: z.array(z.string()).optional(),
    joinLink: z.string().url('Enter a valid URL'),
    notifyBy: z.object({
        mail: z.boolean(),
        whatsapp: z.boolean(),
    }),
    notifySettings: z.object({
        onCreate: z.boolean(),
        beforeLive: z.boolean(),
        beforeLiveTime: z
            .array(
                z.object({
                    time: z.string().min(1, 'Select time'), // e.g., "10 min"
                })
            )
            .optional(),
        onLive: z.boolean(),
    }),
    fields: z.array(
        z.object({
            label: z.string().min(1, 'Field label is required').max(100, 'Field label too long'),
            required: z.boolean(),
            isDefault: z.boolean(),
            type: z.string(),
            options: z.array(z.object({ label: z.string(), name: z.string() })).optional(),
        })
    ),
});

export const addCustomFiledSchema = z.object({
    fieldType: z.string(),
    fieldName: z.string(),
    options: z.array(z.object({ optionField: z.string() })),
});
