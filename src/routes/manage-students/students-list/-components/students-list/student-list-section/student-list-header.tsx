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
                className="flex items-center gap-1.5 text-xs hover:scale-102 transition-all duration-200"
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
                <div className="flex flex-col gap-4 max-h-[60vh] overflow-y-auto">
                    {currentSession?.id ? (
                        data?.flatMap((batch) =>
                            batch.batches.map((b, index) => {
                                // Get detailed information about this batch
                                const batchDetails = getDetailsFromPackageSessionId({
                                    packageSessionId: b.package_session_id
                                });
                                
                                const courseName = batch.package_dto.package_name;
                                const levelName = batchDetails?.level.level_name || 'Unknown Level';
                                const sessionName = batchDetails?.session.session_name || currentSession.name;
                                
                                return (
                                    <div 
                                        className="group flex flex-col gap-3 p-4 rounded-lg border border-neutral-200 hover:border-primary-200 bg-white transition-all duration-200 hover:shadow-md animate-fadeIn" 
                                        key={index}
                                        style={{ animationDelay: `${index * 0.1}s` }}
                                    >
                                        {/* Enhanced header with course info */}
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <div className="p-1.5 rounded-md bg-primary-100 group-hover:bg-primary-200 transition-colors duration-200">
                                                        <Users className="size-4 text-primary-600" />
                                                    </div>
                                                    <h3 className="text-sm font-semibold text-primary-600 group-hover:text-primary-700 transition-colors duration-200">
                                                        {b.batch_name}
                                                    </h3>
                                                </div>
                                                
                                                {/* Course, Level, Session info */}
                                                <div className="space-y-1.5 text-xs text-neutral-600 ml-6">
                                                    <div className="flex items-center gap-2">
                                                        <GraduationCap className="size-3.5 text-neutral-400" />
                                                        <span className="font-medium">Course:</span>
                                                        <span className="text-neutral-700">{courseName}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <div className="size-3.5 rounded bg-blue-100 flex items-center justify-center">
                                                            <div className="size-2 rounded bg-blue-500"></div>
                                                        </div>
                                                        <span className="font-medium">Level:</span>
                                                        <span className="text-neutral-700">{levelName}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Calendar className="size-3.5 text-neutral-400" />
                                                        <span className="font-medium">Session:</span>
                                                        <span className="text-neutral-700">{sessionName}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        {/* Invite link section */}
                                        <div className="pl-6 pt-2 border-t border-neutral-100">
                                            <div className="text-xs font-medium text-neutral-600 mb-2">Invite Link:</div>
                                            <InviteLink inviteCode={b.invite_code} linkLen={50} />
                                        </div>
                                    </div>
                                );
                            })
                        )
                    ) : (
                        <div className="py-6 text-center">
                            <div className="mb-2 p-2 rounded-full bg-neutral-100 w-fit mx-auto">
                                <Users className="size-4 text-neutral-400" />
                            </div>
                            <p className="text-xs text-neutral-500">No batches found for this session</p>
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
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 animate-slideInRight">
            {/* Compact professional title */}
            <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-gradient-to-br from-primary-100 to-primary-200 shadow-sm">
                    <Users className="size-4 text-primary-600" />
                </div>
                <div className="flex flex-col">
                    <h1 className={cn(
                        'font-semibold text-neutral-700',
                        titleSize ? titleSize : 'text-lg lg:text-xl'
                    )}>
                        Learner Management
                    </h1>
                    <div className="h-0.5 w-8 bg-gradient-to-r from-primary-500 to-primary-600 rounded-full"></div>
                </div>
            </div>

            {/* Compact professional action buttons */}
            <div className="flex items-center gap-2">
                <MyButton
                    onClick={() => setOpenInviteLinksDialog(true)}
                    scale="small"
                    buttonType="secondary"
                    className="group flex items-center gap-1.5 text-xs hover:scale-102 transition-all duration-200 bg-white border border-blue-200 text-blue-700 hover:bg-blue-50 hover:border-blue-300"
                >
                    <UserPlus className="size-3.5 group-hover:scale-110 transition-transform duration-200" />
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
                                    className="group flex items-center gap-1.5 text-xs hover:scale-102 transition-all duration-200 bg-primary-600 hover:bg-primary-700 text-white border-0 shadow-sm hover:shadow-md"
                                >
                                    <Users className="size-3.5 group-hover:scale-110 transition-transform duration-200" />
                                    <span className="hidden sm:inline">Enroll</span>
                                </MyButton>
                            }
                        />
                    ) : (
                        <div className="[&>button]:scale-90 [&>button]:text-xs [&>button]:py-1.5 [&>button]:px-3">
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
