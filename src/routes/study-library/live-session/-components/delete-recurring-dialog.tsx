import { useState, useEffect, useMemo } from 'react';
import { MyDialog } from '@/components/design-system/dialog';
import { MyButton } from '@/components/design-system/button';
import { MyRadioButton } from '@/components/design-system/radio';
import { deleteLiveSession, DeleteScope } from '../schedule/-services/utils';
import { getSessionBySessionId, SessionBySessionIdResponse } from '../-services/utils';
import { useQueryClient } from '@tanstack/react-query';
import { Checkbox } from '@/components/ui/checkbox';
import { format } from 'date-fns';

// Safely parse 'HH:mm' string into numeric hours & minutes
function parseHM(time: string): [number, number] {
    const [hStr = '0', mStr = '0'] = time.split(':');
    const h = Number(hStr);
    const m = Number(mStr);
    return [isNaN(h) ? 0 : h, isNaN(m) ? 0 : m];
}

interface DeleteRecurringDialogProps {
    open: boolean;
    onOpenChange: (val: boolean) => void;
    sessionId: string;
    onSuccess?: () => void;
}

// Helper to generate all dates for a recurring weekly schedule
function generateOccurrences(
    scheduleData: SessionBySessionIdResponse['schedule']
): Array<{ id: string; date: Date; day: string; time: string }> {
    const occurrences: Array<{ id: string; date: Date; day: string; time: string }> = [];

    // Helper to format day & time when pushing to occurrences
    const pushOccurrence = (dateObj: Date, idSeed: string, time: string) => {
        occurrences.push({
            id: `${idSeed}_${format(dateObj, 'yyyy-MM-dd')}`,
            date: dateObj,
            day: format(dateObj, 'eeee'),
            time,
        });
    };

    // 1. Handle weekly recurring sessions (existing behaviour, with a fallback if end date missing)
    if (scheduleData.recurrence_type === 'weekly') {
        const weeklyPattern = scheduleData.added_schedules;
        if (!weeklyPattern || weeklyPattern.length === 0) return occurrences;

        const startDate = new Date(scheduleData.start_time);
        // If session_end_date is unavailable, generate occurrences for the next 6 months by default
        const endDate = scheduleData.session_end_date
            ? new Date(scheduleData.session_end_date)
            : new Date(startDate.getTime() + 180 /*days*/ * 24 * 60 * 60 * 1000);

        // Map day names to numbers (0=Sun, 1=Mon, ...)
        const dayMap: { [key: string]: number } = {
            Sunday: 0,
            Monday: 1,
            Tuesday: 2,
            Wednesday: 3,
            Thursday: 4,
            Friday: 5,
            Saturday: 6,
        };

        let currentDate = new Date(startDate);
        while (currentDate <= endDate) {
            const currentDayOfWeek = currentDate.getDay();
            for (const pattern of weeklyPattern) {
                const dayKey = pattern.day.charAt(0).toUpperCase() + pattern.day.slice(1).toLowerCase();
                if (dayMap[dayKey] === currentDayOfWeek) {
                    const occurrenceDate = new Date(currentDate);
                    pushOccurrence(occurrenceDate, pattern.id, pattern.startTime);
                }
            }
            currentDate.setDate(currentDate.getDate() + 1);
        }
        // do not return here; continue to common sorting/return at bottom
    }

    // 2. Handle one-time or non-recurring sessions (if no weekly recurrence)
    if (scheduleData.recurrence_type !== 'weekly') {
        const singleDate = new Date(scheduleData.start_time);
        pushOccurrence(
            singleDate,
            scheduleData.schedule_id || scheduleData.session_id || 'single',
            format(singleDate, 'HH:mm')
        );
    }

    // Sort ascending by date/time for a cleaner list (applies to both weekly & single)
    occurrences.sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        const [hA, mA] = parseHM(a.time);
        const [hB, mB] = parseHM(b.time);
        dateA.setHours(hA, mA, 0, 0);
        dateB.setHours(hB, mB, 0, 0);
        return dateA.getTime() - dateB.getTime();
    });

    return occurrences;
}

export default function DeleteRecurringDialog({
    open,
    onOpenChange,
    sessionId,
    onSuccess,
}: DeleteRecurringDialogProps) {
    type Choice = DeleteScope | 'manual';
    const [choice, setChoice] = useState<Choice>('single');
    const [loading, setLoading] = useState(false);
    const queryClient = useQueryClient();

    // State for manual selection
    const [sessionDetails, setSessionDetails] = useState<SessionBySessionIdResponse | null>(null);
    const [selectedDates, setSelectedDates] = useState<Set<string>>(new Set());

    const occurrences = useMemo(() => {
        if (!sessionDetails) return [];
        return generateOccurrences(sessionDetails.schedule);
    }, [sessionDetails]);

    useEffect(() => {
        if (open) {
            // Reset state on open
            setChoice('single');
            setSelectedDates(new Set());
            setSessionDetails(null);

            // Fetch schedule details to generate dates
            const fetchDetails = async () => {
                try {
                    setLoading(true);
                    const details = await getSessionBySessionId(sessionId);
                    setSessionDetails(details);
                } catch (err) {
                    console.error("Failed to fetch session details:", err);
                } finally {
                    setLoading(false);
                }
            };
            fetchDetails();
        }
    }, [open, sessionId]);

    const handleConfirm = async () => {
        if (choice === 'manual') {
            // NOTE: Implement API call for manual deletion once backend supports manual scope
            console.log('Manually selected dates to delete:', Array.from(selectedDates));
            alert("Manual deletion API is not yet implemented. Check the console for selected dates.");
            return;
        }

        setLoading(true);
        try {
            await deleteLiveSession(sessionId, choice);
            await queryClient.invalidateQueries({ queryKey: ['liveSessions'] });
            await queryClient.invalidateQueries({ queryKey: ['upcomingSessions'] });
            await queryClient.invalidateQueries({ queryKey: ['pastSessions'] });
            await queryClient.invalidateQueries({ queryKey: ['draftSessions'] });
            onOpenChange(false);
            if (onSuccess) onSuccess();
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleDateSelect = (occurrenceId: string, isSelected: boolean) => {
        const newSet = new Set(selectedDates);
        if (isSelected) {
            newSet.add(occurrenceId);
        } else {
            newSet.delete(occurrenceId);
        }
        setSelectedDates(newSet);
    };

    return (
        <MyDialog open={open} onOpenChange={onOpenChange} heading="Remove recurring event">
            <div className="flex flex-col gap-6 p-4">
                <MyRadioButton
                    name="delete-scope"
                    value={choice}
                    onChange={(val) => setChoice(val as Choice)}
                    options={[
                        { label: 'This event', value: 'single' },
                        { label: 'This and all following events', value: 'following' },
                        { label: 'Manually select events', value: 'manual' },
                    ]}
                    className="flex flex-col gap-4"
                />

                {choice === 'manual' && (
                    <div className="border-t pt-4">
                        <h3 className="font-semibold mb-2">Select dates to remove:</h3>
                        {loading && <div>Loading schedule...</div>}
                        <div className="max-h-60 overflow-y-auto pr-2 flex flex-col gap-2">
                            {occurrences.map((occ) => (
                                <div key={occ.id} className="flex items-center gap-3 p-2 rounded-md hover:bg-neutral-50">
                                    {(() => {
                                        const dateTime = new Date(occ.date);
                                        const [h, m] = parseHM(occ.time);
                                        dateTime.setHours(h, m, 0, 0);
                                        const isPast = dateTime < new Date();
                                        return (
                                            <Checkbox
                                                id={occ.id}
                                                checked={selectedDates.has(occ.id)}
                                                onCheckedChange={(checked) =>
                                                    handleDateSelect(occ.id, !!checked)
                                                }
                                                disabled={isPast}
                                            />
                                        );
                                    })()}
                                    <label htmlFor={occ.id} className="cursor-pointer">
                                        {format(occ.date, 'eeee, MMMM dd, yyyy')}
                                    </label>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="flex justify-end gap-4 pt-2 border-t">
                    <MyButton
                        type="button"
                        buttonType="text"
                        onClick={() => onOpenChange(false)}
                        disabled={loading}
                    >
                        Cancel
                    </MyButton>
                    <MyButton
                        type="button"
                        buttonType="primary"
                        onClick={handleConfirm}
                        disabled={loading || (choice === 'manual' && selectedDates.size === 0)}
                    >
                        Delete
                    </MyButton>
                </div>
            </div>
        </MyDialog>
    );
}
