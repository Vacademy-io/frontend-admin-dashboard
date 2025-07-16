import { useState, useEffect, useMemo } from 'react';
import { MyDialog } from '@/components/design-system/dialog';
import { MyButton } from '@/components/design-system/button';
import { MyRadioButton } from '@/components/design-system/radio';
import { deleteLiveSession, DeleteScope } from '../schedule/-services/utils';
import { getSessionBySessionId, SessionBySessionIdResponse } from '../-services/utils';
import { useQueryClient } from '@tanstack/react-query';
import { Checkbox } from '@/components/ui/checkbox';
import { format } from 'date-fns';

interface DeleteRecurringDialogProps {
    open: boolean;
    onOpenChange: (val: boolean) => void;
    sessionId: string;
    onSuccess?: () => void;
}

// Helper to generate all dates for a recurring weekly schedule
function generateOccurrences(scheduleData: SessionBySessionIdResponse['schedule']) {
    if (scheduleData.recurrence_type !== 'weekly' || !scheduleData.session_end_date) {
        return [];
    }

    const occurrences: Array<{ id: string; date: Date; day: string; time: string }> = [];
    const startDate = new Date(scheduleData.start_time);
    const endDate = new Date(scheduleData.session_end_date);
    const weeklyPattern = scheduleData.added_schedules;

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
            if (dayMap[pattern.day] === currentDayOfWeek) {
                const occurrenceDate = new Date(currentDate);
                occurrences.push({
                    id: `${pattern.id}_${format(occurrenceDate, 'yyyy-MM-dd')}`,
                    date: occurrenceDate,
                    day: pattern.day,
                    time: pattern.startTime,
                });
            }
        }
        currentDate.setDate(currentDate.getDate() + 1);
    }
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
            // TODO: Implement API call for manual deletion
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
                                    <Checkbox
                                        id={occ.id}
                                        checked={selectedDates.has(occ.id)}
                                        onCheckedChange={(checked) => handleDateSelect(occ.id, !!checked)}
                                    />
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
