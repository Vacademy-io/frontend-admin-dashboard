import { LockSimple } from 'phosphor-react';
import { Badge } from '@/components/ui/badge';
import { LiveSession } from '../schedule/-services/utils';
import { useState } from 'react';
import { MyDialog } from '@/components/design-system/dialog';

interface PreviousSessionCardProps {
    session: LiveSession;
}

export default function PreviousSessionCard({ session }: PreviousSessionCardProps) {
    const [openDialog, setOpenDialog] = useState<boolean>(false);

    const handleOpenDialog = () => {
        setOpenDialog(!openDialog);
    };
    const formattedDateTime = `${session.meeting_date} ${session.start_time}`;
    return (
        <div className="my-6 flex cursor-pointer flex-col gap-4 rounded-xl border bg-neutral-50 p-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <h1 className="font-semibold">{session.title}</h1>
                    <Badge className="rounded-md border border-neutral-300 bg-primary-50 py-1.5 shadow-none">
                        <LockSimple size={16} className="mr-2" />
                        {session.access_level}
                    </Badge>
                </div>
            </div>

            <div className="flex w-full items-center justify-start gap-8 text-sm text-neutral-500">
                <div className="flex items-center gap-2">
                    <span className="text-black">Subject:</span>
                    <span>{session.subject}</span>
                </div>

                <div className="flex items-center gap-2">
                    <span className="text-black">Start Date & Time:</span>
                    <span>{formattedDateTime}</span>
                </div>

                <div className="flex items-center gap-2">
                    <span className="text-black">Last Entry:</span>
                    <span>{session.last_entry_time}</span>
                </div>
                <div
                    className="flex items-center gap-2 text-primary-500"
                    onClick={handleOpenDialog}
                >
                    <span>View Attendance Report</span>
                    <MyDialog
                        heading="Attendance Report"
                        open={openDialog}
                        onOpenChange={handleOpenDialog}
                    >
                        this is the attendance report dialog
                    </MyDialog>
                </div>
            </div>
        </div>
    );
}
