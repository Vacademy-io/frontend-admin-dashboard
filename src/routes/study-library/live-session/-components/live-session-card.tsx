import QRCode from 'react-qr-code';
import { Copy, DownloadSimple, LockSimple } from 'phosphor-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { MyButton } from '@/components/design-system/button';
import { convertToLocalDateTime } from '@/constants/helper';
import { BASE_URL_LEARNER_DASHBOARD } from '@/constants/urls';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { copyToClipboard } from '@/routes/assessment/create-assessment/$assessmentId/$examtype/-utils/helper';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { DotsThree } from 'phosphor-react';

// Dummy placeholders to prevent errors. Replace with actual props or state.
const scheduleTestContent = {
    assessment_visibility: 'Private',
    play_mode: 'EXAM',
    status: 'Paused',
    created_at: new Date().toISOString(),
    subject_id: 'phy-101',
    bound_start_time: new Date().toISOString(),
    duration: 90,
    bound_end_time: new Date().toISOString(),
    user_registrations: 45,
    join_link: 'abc123',
};

const batchIdsList = ['Batch A', 'Batch B', 'Batch C'];

// const getSubjectNameById = (subjects: any[], id: string) =>
//     subjects.find((sub) => sub.id === id)?.name || 'Unknown';

export default function LiveSessionCard() {
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    return (
        <div className="my-6 flex cursor-pointer flex-col gap-4 rounded-xl border bg-neutral-50 p-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <h1 className="font-semibold">Live Session</h1>
                    <Badge className="rounded-md border border-neutral-300 bg-primary-50 py-1.5 shadow-none">
                        <LockSimple size={16} className="mr-2" />
                        {scheduleTestContent.assessment_visibility}
                    </Badge>
                </div>

                <div className="flex items-center gap-4">
                    <Badge className="rounded-md border border-primary-200 bg-primary-50 py-1.5 shadow-none">
                        {batchIdsList[0]}
                    </Badge>

                    {batchIdsList.length - 1 > 0 && (
                        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                            <DialogTrigger onClick={(e) => e.stopPropagation()}>
                                <span className="text-sm text-primary-500">
                                    +{batchIdsList.length - 1} more
                                </span>
                            </DialogTrigger>
                            <DialogContent className="p-0">
                                <h1 className="rounded-t-lg bg-primary-50 p-4 font-semibold text-primary-500">
                                    Assessment Batches
                                </h1>
                                <ul className="flex list-disc flex-col gap-4 pb-4 pl-8 pr-4">
                                    {batchIdsList.map(
                                        (batchId, idx) => idx > 0 && <li key={idx}>{batchId}</li>
                                    )}
                                </ul>
                            </DialogContent>
                        </Dialog>
                    )}

                    <DropdownMenu>
                        <DropdownMenuTrigger>
                            <MyButton
                                type="button"
                                scale="small"
                                buttonType="secondary"
                                className="w-6 !min-w-6"
                            >
                                <DotsThree size={32} />
                            </MyButton>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                            <DropdownMenuItem className="cursor-pointer" onClick={() => {}}>
                                View Live Session Details
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                className="cursor-pointer"
                                onClick={(e) => {
                                    e.stopPropagation();
                                }}
                            >
                                Duplicate Live Session
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                className="cursor-pointer"
                                onClick={(e) => {
                                    e.stopPropagation();
                                }}
                            >
                                Delete Live Session
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            <div className="flex w-full items-center justify-start gap-8 text-sm text-neutral-500">
                <div className="flex items-center gap-2">
                    <span className="text-black">Subject:</span>
                    <span>
                        {/* {getSubjectNameById(
                            instituteDetails.subjects || [],
                            scheduleTestContent.subject_id || ''
                        )} */}
                    </span>
                </div>

                <div className="flex items-center gap-2">
                    <span className="text-black">Start Date & Time:</span>
                    <span>{convertToLocalDateTime(scheduleTestContent.bound_start_time)}</span>
                </div>

                <div className="flex items-center gap-2">
                    <span className="text-black">Duration:</span>
                    <span>
                        {scheduleTestContent.duration >= 60
                            ? `${(scheduleTestContent.duration / 60).toFixed(2)} hrs`
                            : `${scheduleTestContent.duration} min`}
                    </span>
                </div>

                <div className="flex items-center gap-2">
                    <span className="text-black">Occurrence:</span>
                    <span>{'One-time'}</span>
                </div>
            </div>

            <div className="flex justify-between">
                <div className="flex items-center gap-2 text-sm text-neutral-500">
                    <h1 className="!font-normal text-black">Join Link:</h1>
                    <span className="px-3 py-2 text-sm underline">
                        {`${BASE_URL_LEARNER_DASHBOARD}/register?code=${scheduleTestContent.join_link}`}
                    </span>
                    <MyButton
                        type="button"
                        scale="small"
                        buttonType="secondary"
                        className="h-8 min-w-8"
                        onClick={(e) => {
                            e.stopPropagation();
                            copyToClipboard(
                                `${BASE_URL_LEARNER_DASHBOARD}/register?code=${scheduleTestContent.join_link}`
                            );
                        }}
                    >
                        <Copy size={32} />
                    </MyButton>
                </div>

                <div className="flex items-center gap-4">
                    <QRCode
                        value={`${BASE_URL_LEARNER_DASHBOARD}/register?code=${scheduleTestContent.join_link}`}
                        className="size-16"
                        id={`qr-code-svg-assessment-list-${scheduleTestContent.join_link}`}
                    />
                    <MyButton
                        type="button"
                        scale="small"
                        buttonType="secondary"
                        className="h-8 min-w-8"
                        onClick={(e) => {
                            e.stopPropagation();
                            // TODO: implement download QR code
                        }}
                    >
                        <DownloadSimple size={32} />
                    </MyButton>
                </div>
            </div>
        </div>
    );
}
