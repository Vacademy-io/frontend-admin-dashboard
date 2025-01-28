import { MyButton } from "@/components/design-system/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSub,
    DropdownMenuSubTrigger,
    DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu";
import { TestContent } from "@/types/schedule-test-list";
import { useNavigate } from "@tanstack/react-router";
import { DotsThree, Info } from "phosphor-react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { useState } from "react";
import { Input } from "@/components/ui/input";

export function ScheduleTestDetailsDropdownLive({
    scheduleTestContent,
}: {
    scheduleTestContent: TestContent;
}) {
    const [isRemiderAlertDialogOpen, setIsRemiderAlertDialogOpen] = useState(false);
    const [isDeleteAssessmentDialog, setIsDeleteAssessmentDialog] = useState(false);
    const [isPauseLiveStatausDialog, setIsPauseLiveStatausDialog] = useState(false);
    const [isResumeLiveStatusDialog, setIsResumeLiveStatusDialog] = useState(false);
    const navigate = useNavigate();
    const handleNavigateAssessment = (assessmentId: string) => {
        navigate({
            to: "/assessment/exam/assessment-details/$assessmentId/$examType",
            params: {
                assessmentId: assessmentId,
                examType: scheduleTestContent.play_mode,
            },
        });
    };
    const handleSendReminderClick = (assessmentId: string) => {
        console.log(assessmentId);
        setIsRemiderAlertDialogOpen(true);
    };
    const handleDeleteAssessmentClick = (assessmentId: string) => {
        console.log(assessmentId);
        setIsDeleteAssessmentDialog(true);
    };

    const handleRescheduleAssessment = (assessmentId: string) => {
        console.log(assessmentId);
    };

    const handleDuplicateAssessment = (assessmentId: string) => {
        console.log(assessmentId);
    };

    const handlePauseLiveStatus = (assessmentId: string, value: number) => {
        console.log(assessmentId, value);
    };

    const handleCustomPauseLiveAssessment = (assessmentId: string) => {
        console.log(assessmentId);
        setIsPauseLiveStatausDialog(true);
    };

    const handleResumeLiveAssessment = (assessmentId: string) => {
        console.log(assessmentId);
        setIsResumeLiveStatusDialog(true);
    };
    return (
        <>
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
                    <DropdownMenuItem
                        className="cursor-pointer"
                        onClick={() => handleNavigateAssessment(scheduleTestContent.assessment_id)}
                    >
                        View Assessment Details
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        className="cursor-pointer"
                        onClick={() => handleSendReminderClick(scheduleTestContent.assessment_id)}
                    >
                        Send Reminder
                    </DropdownMenuItem>
                    <DropdownMenuSub>
                        <DropdownMenuSubTrigger className="cursor-pointer">
                            Pause Live Status
                        </DropdownMenuSubTrigger>
                        <DropdownMenuSubContent>
                            <DropdownMenuItem
                                className="cursor-pointer"
                                onClick={() =>
                                    handlePauseLiveStatus(scheduleTestContent.assessment_id, 30)
                                }
                            >
                                For 30 min
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                className="cursor-pointer"
                                onClick={() =>
                                    handlePauseLiveStatus(scheduleTestContent.assessment_id, 60)
                                }
                            >
                                For 1 Hour
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                className="cursor-pointer"
                                onClick={() =>
                                    handlePauseLiveStatus(scheduleTestContent.assessment_id, 120)
                                }
                            >
                                For 2 Hour
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                className="cursor-pointer"
                                onClick={() =>
                                    handleCustomPauseLiveAssessment(
                                        scheduleTestContent.assessment_id,
                                    )
                                }
                            >
                                Custom
                            </DropdownMenuItem>
                        </DropdownMenuSubContent>
                    </DropdownMenuSub>
                    <DropdownMenuItem
                        className="cursor-pointer"
                        onClick={() =>
                            handleResumeLiveAssessment(scheduleTestContent.assessment_id)
                        }
                    >
                        Resume Live Status
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        className="cursor-pointer"
                        onClick={() =>
                            handleRescheduleAssessment(scheduleTestContent.assessment_id)
                        }
                    >
                        Reschedule Assessment
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        className="cursor-pointer"
                        onClick={() => handleDuplicateAssessment(scheduleTestContent.assessment_id)}
                    >
                        Duplicate Assessment
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        className="cursor-pointer"
                        onClick={() =>
                            handleDeleteAssessmentClick(scheduleTestContent.assessment_id)
                        }
                    >
                        Delete Assessment
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
            {isRemiderAlertDialogOpen && (
                <ScheduleTestReminderDialog onClose={() => setIsRemiderAlertDialogOpen(false)} />
            )}
            {isDeleteAssessmentDialog && (
                <ScheduleTestDeleteDialog onClose={() => setIsDeleteAssessmentDialog(false)} />
            )}
            {isPauseLiveStatausDialog && (
                <ScheduleTestPauseDialog onClose={() => setIsPauseLiveStatausDialog(false)} />
            )}
            {isResumeLiveStatusDialog && (
                <ScheduleTestResumeDialog onClose={() => setIsResumeLiveStatusDialog(false)} />
            )}
        </>
    );
}

export function ScheduleTestDetailsDropdownUpcoming({
    scheduleTestContent,
}: {
    scheduleTestContent: TestContent;
}) {
    const [isDeleteAssessmentDialog, setIsDeleteAssessmentDialog] = useState(false);
    const navigate = useNavigate();
    const handleNavigateAssessment = (assessmentId: string) => {
        navigate({
            to: "/assessment/exam/assessment-details/$assessmentId/$examType",
            params: {
                assessmentId: assessmentId,
                examType: scheduleTestContent.play_mode,
            },
        });
    };

    const handleRescheduleAssessment = (assessmentId: string) => {
        console.log(assessmentId);
    };

    const handleDuplicateAssessment = (assessmentId: string) => {
        console.log(assessmentId);
    };

    const handleDeleteAssessmentClick = (assessmentId: string) => {
        console.log(assessmentId);
        setIsDeleteAssessmentDialog(true);
    };

    return (
        <>
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
                    <DropdownMenuItem
                        className="cursor-pointer"
                        onClick={() => handleNavigateAssessment(scheduleTestContent.assessment_id)}
                    >
                        View Assessment Details
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        className="cursor-pointer"
                        onClick={() =>
                            handleRescheduleAssessment(scheduleTestContent.assessment_id)
                        }
                    >
                        Reschedule Assessment
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        className="cursor-pointer"
                        onClick={() => handleDuplicateAssessment(scheduleTestContent.assessment_id)}
                    >
                        Duplicate Assessment
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        className="cursor-pointer"
                        onClick={() =>
                            handleDeleteAssessmentClick(scheduleTestContent.assessment_id)
                        }
                    >
                        Delete Assessment
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
            {isDeleteAssessmentDialog && (
                <ScheduleTestDeleteDialog onClose={() => setIsDeleteAssessmentDialog(false)} />
            )}
        </>
    );
}

export function ScheduleTestDetailsDropdownPrevious({
    scheduleTestContent,
}: {
    scheduleTestContent: TestContent;
}) {
    const [isDeleteAssessmentDialog, setIsDeleteAssessmentDialog] = useState(false);
    const [isReopenAssessment, setIsReopenAssessment] = useState(false);
    const navigate = useNavigate();
    const handleNavigateAssessment = (assessmentId: string) => {
        navigate({
            to: "/assessment/exam/assessment-details/$assessmentId/$examType",
            params: {
                assessmentId: assessmentId,
                examType: scheduleTestContent.play_mode,
            },
        });
    };

    const handleRescheduleAssessment = (assessmentId: string) => {
        console.log(assessmentId);
    };

    const handleDuplicateAssessment = (assessmentId: string) => {
        console.log(assessmentId);
    };

    const handleDeleteAssessmentClick = (assessmentId: string) => {
        console.log(assessmentId);
        setIsDeleteAssessmentDialog(true);
    };

    const handleReopenAssessment = (assessmentId: string) => {
        console.log(assessmentId);
        setIsReopenAssessment(true);
    };

    return (
        <>
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
                    <DropdownMenuItem
                        className="cursor-pointer"
                        onClick={() => handleNavigateAssessment(scheduleTestContent.assessment_id)}
                    >
                        View Assessment Details
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        className="cursor-pointer"
                        onClick={() =>
                            handleRescheduleAssessment(scheduleTestContent.assessment_id)
                        }
                    >
                        Reschedule Assessment
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        className="cursor-pointer"
                        onClick={() => handleDuplicateAssessment(scheduleTestContent.assessment_id)}
                    >
                        Duplicate Assessment
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        className="cursor-pointer"
                        onClick={() => handleReopenAssessment(scheduleTestContent.assessment_id)}
                    >
                        Reopen Assessment
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        className="cursor-pointer"
                        onClick={() =>
                            handleDeleteAssessmentClick(scheduleTestContent.assessment_id)
                        }
                    >
                        Delete Assessment
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
            {isDeleteAssessmentDialog && (
                <ScheduleTestDeleteDialog onClose={() => setIsDeleteAssessmentDialog(false)} />
            )}
            {isReopenAssessment && (
                <ScheduleTestReopenDialog onClose={() => setIsReopenAssessment(false)} />
            )}
        </>
    );
}

export function ScheduleTestDetailsDropdowDrafts({
    scheduleTestContent,
}: {
    scheduleTestContent: TestContent;
}) {
    const [isDeleteAssessmentDialog, setIsDeleteAssessmentDialog] = useState(false);
    const navigate = useNavigate();
    const handleNavigateAssessment = (assessmentId: string) => {
        navigate({
            to: "/assessment/exam/assessment-details/$assessmentId/$examType",
            params: {
                assessmentId: assessmentId,
                examType: scheduleTestContent.play_mode,
            },
        });
    };
    const handleDeleteAssessmentClick = (assessmentId: string) => {
        console.log(assessmentId);
        setIsDeleteAssessmentDialog(true);
    };
    return (
        <>
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
                    <DropdownMenuItem
                        className="cursor-pointer"
                        onClick={() => handleNavigateAssessment(scheduleTestContent.assessment_id)}
                    >
                        View Assessment Details
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        className="cursor-pointer"
                        onClick={() =>
                            handleDeleteAssessmentClick(scheduleTestContent.assessment_id)
                        }
                    >
                        Delete Assessment
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
            {isDeleteAssessmentDialog && (
                <ScheduleTestDeleteDialog onClose={() => setIsDeleteAssessmentDialog(false)} />
            )}
        </>
    );
}

export function ScheduleTestMainDropdownComponent({
    scheduleTestContent,
    selectedTab,
}: {
    scheduleTestContent: TestContent;
    selectedTab: string;
}) {
    switch (selectedTab) {
        case "liveTests":
            return <ScheduleTestDetailsDropdownLive scheduleTestContent={scheduleTestContent} />;
        case "upcomingTests":
            return (
                <ScheduleTestDetailsDropdownUpcoming scheduleTestContent={scheduleTestContent} />
            );
        case "previousTests":
            return (
                <ScheduleTestDetailsDropdownPrevious scheduleTestContent={scheduleTestContent} />
            );
        case "draftTests":
            return <ScheduleTestDetailsDropdowDrafts scheduleTestContent={scheduleTestContent} />;
        default:
            return null;
    }
}

const ScheduleTestReminderDialog = ({ onClose }: { onClose: () => void }) => {
    return (
        <Dialog open={true} onOpenChange={onClose}>
            <DialogTrigger>Open</DialogTrigger>
            <DialogContent className="flex flex-col p-0">
                <h1 className="rounded-lg bg-primary-50 p-4 text-primary-500">Send Reminder</h1>
                <div className="flex flex-col gap-4 p-4 pt-3">
                    <div className="flex items-center gap-1">
                        <span className="text-danger-600">Attention</span>
                        <Info size={18} className="text-danger-600" />
                    </div>
                    <h1 className="-mt-2 font-thin">
                        A Assessment reminder will be sent to all
                        <span className="text-primary-500"> 56 participants </span>
                        who have not yet appeared from the assigned batches.
                    </h1>
                    <div className="mt-2 flex justify-end">
                        <MyButton type="button" scale="large" buttonType="primary">
                            Send
                        </MyButton>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

const ScheduleTestDeleteDialog = ({ onClose }: { onClose: () => void }) => {
    return (
        <Dialog open={true} onOpenChange={onClose}>
            <DialogTrigger>Open</DialogTrigger>
            <DialogContent className="flex flex-col p-0">
                <h1 className="rounded-lg bg-primary-50 p-4 text-primary-500">Send Reminder</h1>
                <div className="flex flex-col gap-4 p-4 pt-3">
                    <div className="flex items-center gap-1">
                        <span className="text-danger-600">Attention</span>
                        <Info size={18} className="text-danger-600" />
                    </div>
                    <h1 className="-mt-2 font-thin">
                        Are you sure you want to delete the Assessment named
                        <span className="text-primary-500">
                            &nbsp;The Human Eye and The Colourful World
                        </span>
                        ?
                    </h1>
                    <div className="mt-2 flex justify-end">
                        <MyButton type="button" scale="large" buttonType="primary">
                            Delete
                        </MyButton>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

const ScheduleTestPauseDialog = ({ onClose }: { onClose: () => void }) => {
    return (
        <Dialog open={true} onOpenChange={onClose}>
            <DialogTrigger>Open</DialogTrigger>
            <DialogContent className="flex flex-col p-0">
                <h1 className="rounded-lg bg-primary-50 p-4 text-primary-500">Pause Live Status</h1>
                <div className="flex flex-col gap-4 p-4 pt-3">
                    <div>
                        <h1 className="mb-1 text-sm">
                            Date <span className="text-danger-600">*</span>
                        </h1>
                        <Input type="date" placeholder="Date" />
                    </div>
                    <div className="text-sm">
                        <h1 className="mb-1 text-sm">
                            Pause Until <span className="text-danger-600">*</span>
                        </h1>
                        <Input type="time" placeholder="Time" />
                    </div>
                    <div className="mt-2 flex justify-end">
                        <MyButton type="button" scale="large" buttonType="primary">
                            Pause
                        </MyButton>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

const ScheduleTestResumeDialog = ({ onClose }: { onClose: () => void }) => {
    return (
        <Dialog open={true} onOpenChange={onClose}>
            <DialogTrigger>Open</DialogTrigger>
            <DialogContent className="flex flex-col p-0">
                <h1 className="rounded-lg bg-primary-50 p-4 text-primary-500">
                    Resume Live Status
                </h1>
                <div className="flex flex-col gap-4 p-4 pt-3">
                    <div className="flex items-center gap-1">
                        <span className="text-danger-600">Attention</span>
                        <Info size={18} className="text-danger-600" />
                    </div>
                    <h1 className="-mt-2 font-thin">
                        Do you want to resume your Live assessment
                        <span className="text-primary-500">
                            &nbsp;The Human Eye and The Colourful World
                        </span>
                        ?
                    </h1>
                    <div className="mt-2 flex justify-end">
                        <MyButton type="button" scale="large" buttonType="primary">
                            Resume
                        </MyButton>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

const ScheduleTestReopenDialog = ({ onClose }: { onClose: () => void }) => {
    return (
        <Dialog open={true} onOpenChange={onClose}>
            <DialogTrigger>Open</DialogTrigger>
            <DialogContent className="flex flex-col p-0">
                <h1 className="rounded-lg bg-primary-50 p-4 text-primary-500">Reopen Assessment</h1>
                <div className="flex flex-col gap-4 p-4 pt-3">
                    <div className="flex flex-col gap-4 p-4 pt-3">
                        <div className="flex items-center gap-1">
                            <span className="text-danger-600">Attention</span>
                            <Info size={18} className="text-danger-600" />
                        </div>
                        <h1 className="-mt-2 font-thin">
                            A Assessment reminder will be sent to all
                            <span className="text-primary-500"> 56 participants </span>
                            who have not yet appeared from the assigned batches.
                        </h1>
                    </div>
                    <h1>Select assessment reopening date and time</h1>
                    <div className="flex items-center">
                        <div>
                            <h1 className="mb-1 text-sm">
                                Start Date & Time <span className="text-danger-600">*</span>
                            </h1>
                            <Input type="datetime-local" placeholder="Date" />
                        </div>
                        <div className="text-sm">
                            <h1 className="mb-1 text-sm">
                                End Date & Time <span className="text-danger-600">*</span>
                            </h1>
                            <Input type="datetime-local" placeholder="Time" />
                        </div>
                    </div>
                    <div className="mt-2 flex justify-end">
                        <MyButton type="button" scale="large" buttonType="primary">
                            Reopen
                        </MyButton>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};
