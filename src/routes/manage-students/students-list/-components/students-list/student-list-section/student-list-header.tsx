import { MyButton } from '@/components/design-system/button';
import { EnrollStudentsButton } from '../../../../../../components/common/students/enroll-students-button';
import { useRouter } from '@tanstack/react-router';
import { BulkDialogProvider } from '../../../-providers/bulk-dialog-provider';
import { MyDialog } from '@/components/design-system/dialog';
import { useState } from 'react';
import { DropdownItemType } from '@/components/common/students/enroll-manually/dropdownTypesForPackageItems';
import { useGetBatchesQuery } from '@/routes/manage-institute/batches/-services/get-batches';
import { DashboardLoader } from '@/components/core/dashboard-loader';
import RootErrorComponent from '@/components/core/deafult-error';
import { InviteLink } from '@/routes/manage-students/-components/InviteLink';
import { CreateInvite } from '@/routes/manage-students/invite/-components/create-invite/CreateInvite';
import { useInstituteDetailsStore } from '@/stores/students/students-list/useInstituteDetailsStore';
import { NoCourseDialog } from '@/components/common/students/no-course-dialog';
import { cn } from '@/lib/utils';
import { UserPlus, ArrowRight, Users, GraduationCap, Calendar } from '@phosphor-icons/react';

const InviteLinksDialog = ({
    currentSession,
    openInviteLinksDialog,
    handleOpenChange,
}: {
    currentSession?: DropdownItemType;
    openInviteLinksDialog: boolean;
    handleOpenChange: () => void;
}) => {
    const router = useRouter();
    const { getDetailsFromPackageSessionId } = useInstituteDetailsStore();

    const { data, isLoading, isError } = useGetBatchesQuery({
        sessionId: currentSession?.id || '',
    });

    const footer = (
        <div className="flex w-full items-center justify-between gap-2">
            <MyButton
                buttonType="secondary"
                scale="small"
                onClick={() => router.navigate({ to: '/manage-students/invite' })}
                className="hover:scale-102 flex items-center gap-1.5 text-xs transition-all duration-200"
            >
                <ArrowRight className="size-3.5" />
                Invite Page
            </MyButton>
            <CreateInvite />
        </div>
    );

    // Get session details for enhanced dialog title
    const sessionName = currentSession?.name || 'Unknown Session';
    const dialogTitle = `📨 Invite Links - ${sessionName}`;

    return (
        <MyDialog
            heading={dialogTitle}
            open={openInviteLinksDialog}
            onOpenChange={handleOpenChange}
            footer={footer}
            dialogWidth="w-[90vw] max-w-3xl"
        >
            {isLoading ? (
                <DashboardLoader />
            ) : isError ? (
                <RootErrorComponent />
            ) : (
                <div className="flex max-h-[60vh] flex-col gap-4 overflow-y-auto">
                    {currentSession?.id ? (
                        data?.flatMap((batch) =>
                            batch.batches.map((b, index) => {
                                // Get detailed information about this batch
                                const batchDetails = getDetailsFromPackageSessionId({
                                    packageSessionId: b.package_session_id,
                                });

                                const courseName = batch.package_dto.package_name;
                                const levelName = batchDetails?.level.level_name || 'Unknown Level';
                                const sessionName =
                                    batchDetails?.session.session_name || currentSession.name;

                                return (
                                    <div
                                        className="animate-fadeIn group flex flex-col gap-3 rounded-lg border border-neutral-200 bg-white p-4 transition-all duration-200 hover:border-primary-200 hover:shadow-md"
                                        key={index}
                                        style={{ animationDelay: `${index * 0.1}s` }}
                                    >
                                        {/* Enhanced header with course info */}
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="flex-1">
                                                <div className="mb-2 flex items-center gap-2">
                                                    <div className="rounded-md bg-primary-100 p-1.5 transition-colors duration-200 group-hover:bg-primary-200">
                                                        <Users className="text-primary-600 size-4" />
                                                    </div>
                                                    <h3 className="text-primary-600 group-hover:text-primary-700 text-sm font-semibold transition-colors duration-200">
                                                        {b.batch_name}
                                                    </h3>
                                                </div>

                                                {/* Course, Level, Session info */}
                                                <div className="ml-6 space-y-1.5 text-xs text-neutral-600">
                                                    <div className="flex items-center gap-2">
                                                        <GraduationCap className="size-3.5 text-neutral-400" />
                                                        <span className="font-medium">Course:</span>
                                                        <span className="text-neutral-700">
                                                            {courseName}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <div className="flex size-3.5 items-center justify-center rounded bg-blue-100">
                                                            <div className="size-2 rounded bg-blue-500"></div>
                                                        </div>
                                                        <span className="font-medium">Level:</span>
                                                        <span className="text-neutral-700">
                                                            {levelName}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Calendar className="size-3.5 text-neutral-400" />
                                                        <span className="font-medium">
                                                            Session:
                                                        </span>
                                                        <span className="text-neutral-700">
                                                            {sessionName}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Invite link section */}
                                        <div className="border-t border-neutral-100 pl-6 pt-2">
                                            <div className="mb-2 text-xs font-medium text-neutral-600">
                                                Invite Link:
                                            </div>
                                            <InviteLink inviteCode={b.invite_code} linkLen={50} />
                                        </div>
                                    </div>
                                );
                            })
                        )
                    ) : (
                        <div className="py-6 text-center">
                            <div className="mx-auto mb-2 w-fit rounded-full bg-neutral-100 p-2">
                                <Users className="size-4 text-neutral-400" />
                            </div>
                            <p className="text-xs text-neutral-500">
                                No batches found for this session
                            </p>
                        </div>
                    )}
                </div>
            )}
        </MyDialog>
    );
};

export const StudentListHeader = ({
    currentSession,
    titleSize,
}: {
    currentSession?: DropdownItemType;
    titleSize?: string;
}) => {
    const [openInviteLinksDialog, setOpenInviteLinksDialog] = useState(false);
    const { instituteDetails } = useInstituteDetailsStore();
    const [isOpen, setIsOpen] = useState(false);

    const handleOpenChange = () => {
        setOpenInviteLinksDialog(!openInviteLinksDialog);
    };

    return (
        <div className="animate-slideInRight flex flex-col justify-between gap-3 lg:flex-row lg:items-center">
            {/* Compact professional title */}
            <div className="flex items-center gap-2.5">
                <div className="rounded-lg bg-gradient-to-br from-primary-100 to-primary-200 p-1.5 shadow-sm">
                    <Users className="text-primary-600 size-4" />
                </div>
                <div className="flex flex-col">
                    <h1
                        className={cn(
                            'font-semibold text-neutral-700',
                            titleSize ? titleSize : 'text-lg lg:text-xl'
                        )}
                    >
                        Learner Management
                    </h1>
                    <div className="to-primary-600 h-0.5 w-8 rounded-full bg-gradient-to-r from-primary-500"></div>
                </div>
            </div>

            {/* Compact professional action buttons */}
            <div className="flex items-center gap-2">
                <MyButton
                    onClick={() => setOpenInviteLinksDialog(true)}
                    scale="small"
                    buttonType="secondary"
                    className="hover:scale-102 group flex items-center gap-1.5 border border-blue-200 bg-white text-xs text-blue-700 transition-all duration-200 hover:border-blue-300 hover:bg-blue-50"
                >
                    <UserPlus className="size-3.5 transition-transform duration-200 group-hover:scale-110" />
                    <span className="hidden sm:inline">Invite</span>
                </MyButton>

                <BulkDialogProvider>
                    {!instituteDetails?.batches_for_sessions.length ? (
                        <NoCourseDialog
                            isOpen={isOpen}
                            setIsOpen={setIsOpen}
                            type="Enroll Students"
                            content="You need to create a course and add a subject in it before"
                            trigger={
                                <MyButton
                                    scale="small"
                                    className="hover:scale-102 bg-primary-600 hover:bg-primary-700 group flex items-center gap-1.5 border-0 text-xs text-white shadow-sm transition-all duration-200 hover:shadow-md"
                                >
                                    <Users className="size-3.5 transition-transform duration-200 group-hover:scale-110" />
                                    <span className="hidden sm:inline">Enroll</span>
                                </MyButton>
                            }
                        />
                    ) : (
                        <div className="[&>button]:scale-90 [&>button]:px-3 [&>button]:py-1.5 [&>button]:text-xs">
                            <EnrollStudentsButton />
                        </div>
                    )}
                </BulkDialogProvider>
            </div>

            <InviteLinksDialog
                currentSession={currentSession}
                openInviteLinksDialog={openInviteLinksDialog}
                handleOpenChange={handleOpenChange}
            />
        </div>
    );
};
