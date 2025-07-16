import { z } from 'zod';
import { AccessType, RecurringType } from '../../-constants/enums';

const weekDaysEnum = z.enum([
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
    'saturday',
    'sunday',
]);

const sessionDetailsSchema = z.object({
    id: z.string().optional(),
    startTime: z.string().optional(),
    durationHours: z
        .string()
        .refine(
            (val) => {
                const num = parseInt(val);
                return !val || (num >= 0 && num <= 24);
            },
            { message: 'Hours must be between 0 and 24' }
        )
        .optional(),
    durationMinutes: z
        .string()
        .refine(
            (val) => {
                const num = parseInt(val);
                return !val || (num >= 0 && num <= 59);
            },
            { message: 'Minutes must be between 0 and 59' }
        )
        .optional(),
    link: z.string().url('Invalid URL').optional().or(z.literal('')),
});

export const weeklyClassSchema = z.object({
    id: z.string().optional(),
    day: weekDaysEnum,
    isSelect: z.boolean(),
    sessions: z.array(sessionDetailsSchema),
}).superRefine((data, ctx) => {
    if (data.isSelect) {
        data.sessions.forEach((session, sessionIndex) => {
            if (!session.startTime || session.startTime.trim() === '') {
                ctx.addIssue({
                    code: 'custom',
                    message: 'Start time is required for selected days',
                    path: ['sessions', sessionIndex, 'startTime'],
                });
            }

            const hours = parseInt(session.durationHours || '0') || 0;
            const minutes = parseInt(session.durationMinutes || '0') || 0;

            if (hours === 0 && minutes === 0) {
                ctx.addIssue({
                    code: 'custom',
                    message: 'Duration is required for selected days',
                    path: ['sessions', sessionIndex, 'durationHours'],
                });
            }

            if (!session.link || session.link.trim() === '') {
                ctx.addIssue({
                    code: 'custom',
                    message: 'Live class link is required for selected days',
                    path: ['sessions', sessionIndex, 'link'],
                });
            } else if (session.link.trim() !== '' && !/^https?:\/\/.+/.test(session.link)) {
                ctx.addIssue({
                    code: 'custom',
                    message: 'Invalid URL format',
                    path: ['sessions', sessionIndex, 'link'],
                });
            }
        });
    }
});

export const sessionFormSchema = z
    .object({
        id: z.string().optional(),
        title: z.string().min(1, 'Title must be at least 1 characters'),
        subject: z
            .string()
            .transform((val) => (val === 'none' ? '' : val))
            .optional(),
        openWaitingRoomBefore: z.string(),
        sessionType: z.string(),
        sessionPlatform: z.string(),
        enableWaitingRoom: z.boolean(),
        streamingType: z.string(),
        allowRewind: z.boolean(),
        startTime: z.string({
            required_error: 'Start time is required',
            invalid_type_error: 'Invalid date',
        }),
        endDate: z
            .string({
                required_error: 'End date is required',
                invalid_type_error: 'Invalid date',
            })
            .optional(),
        timeZone: z.string().min(1, 'Time zone is required'),
        events: z.string().regex(/^\d+$/, 'Must be a number'),
        description: z.string().min(1, 'Description is required'),
        durationMinutes: z.string({
            required_error: 'Duration is required',
        }),
        durationHours: z.string({
            required_error: 'Duration is required',
        }),
        defaultLink: z.string().min(1, 'Live class link is required').url('Invalid URL'),
        meetingType: z.nativeEnum(RecurringType),
        recurringSchedule: z.array(weeklyClassSchema).optional(),
    })
    .superRefine((data, ctx) => {
        if (data.meetingType === RecurringType.WEEKLY && !data.endDate) {
            ctx.addIssue({
                code: 'custom',
                message: 'End date is required for recurring meetings.',
                path: ['endDate'],
            });
        }

        // Validate that duration is not zero
        const hours = parseInt(data.durationHours) || 0;
        const minutes = parseInt(data.durationMinutes) || 0;

        if (hours === 0 && minutes === 0) {
            ctx.addIssue({
                code: 'custom',
                message: 'Duration must be at least 1 minute',
                path: ['durationHours'],
            });
            ctx.addIssue({
                code: 'custom',
                message: 'Duration must be at least 1 minute',
                path: ['durationMinutes'],
            });
        }
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
            id: z.string().optional(),
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
