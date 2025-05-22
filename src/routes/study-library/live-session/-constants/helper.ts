import { z } from 'zod';
import { sessionFormSchema } from '../schedule/-schema/schema';

export const timeOptions = Array.from({ length: 96 }, (_, i) => {
    const hours = Math.floor(i / 4)
        .toString()
        .padStart(2, '0');
    const minutes = ((i % 4) * 15).toString().padStart(2, '0');
    return `${hours}:${minutes}`;
});

type WeeklyDetailsDTO = {
    day: string;
    startTime?: string;
    duration?: string;
    link?: string;
};

type LiveSessionStep1RequestDTO = {
    sessionId?: string;
    title: string;
    subject?: string;
    descriptionHtml: string;
    defaultMeetLink?: string;
    startTime: string; // ISO string
    lastEntryTime?: string; // Optional, not in schema but supported in DTO
    sessionEndDate: string; // End date
    link?: string;
    recurrenceType?: string;
    recurringWeeklySchedule?: WeeklyDetailsDTO[];
};

export function mapFormToStep1DTO(
    formData: z.infer<typeof sessionFormSchema>
): LiveSessionStep1RequestDTO {
    return {
        sessionId: undefined, // if needed you can pass this separately
        title: formData.title,
        descriptionHtml: formData.description,
        defaultMeetLink: formData.defaultLink || undefined,
        startTime: new Date(formData.startTime).toISOString(),
        sessionEndDate: formData.endDate,
        recurrenceType: formData.meetingType,
        recurringWeeklySchedule: formData.recurringSchedule
            ?.map((week) => {
                return week.sessions
                    .filter((session) => session.startTime) // Optional: skip empty ones
                    .map((session) => ({
                        day: week.day,
                        startTime: session.startTime,
                        duration: session.duration,
                        link: session.link || undefined,
                    }));
            })
            .flat(), // Flatten array of arrays
    };
}
