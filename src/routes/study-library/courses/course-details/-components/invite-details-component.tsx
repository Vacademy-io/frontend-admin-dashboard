import { MyButton } from '@/components/design-system/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { InviteLink } from '@/routes/manage-students/-components/InviteLink';
import { useNavigate } from '@tanstack/react-router';
import { ArrowRight, Calendar, Plus } from 'phosphor-react';

// Inline types to fix linter errors
interface Instructor {
    id: string;
    name: string;
    email: string;
    profilePicId: string;
    roles: string[];
}
interface LevelDetail {
    id: string;
    name: string;
    duration_in_days: number;
    instructors: Instructor[];
    subjects: unknown[];
    inviteLink: string;
}
interface SessionDetails {
    id: string;
    session_name: string;
    status: string;
    start_date: string;
}
interface SessionData {
    levelDetails: LevelDetail[];
    sessionDetails: SessionDetails;
}

const InviteDetailsComponent = ({ sessionsData }: { sessionsData: SessionData[] }) => {
    // Flatten all levels for all sessions to count cards
    const navigate = useNavigate();
    const allCards = sessionsData.flatMap((session) => session.levelDetails);
    const shouldScroll = allCards.length > 3;

    return (
        <Dialog>
            <DialogTrigger>
                <MyButton
                    type="button"
                    scale="small"
                    buttonType="secondary"
                    className="mt-4 flex items-center gap-1"
                >
                    <Plus size={16} />
                    Invite Links
                </MyButton>
            </DialogTrigger>
            <DialogContent className="!w-[80vw] max-w-[80vw] p-0">
                <DialogHeader className="rounded-t-lg bg-primary-50 p-4">
                    <DialogTitle className="font-normal text-primary-500">
                        📨
                        <span className="ml-2">Invite Links</span>
                    </DialogTitle>
                </DialogHeader>
                <div
                    className={`space-y-4 p-4 ${shouldScroll ? 'overflow-y-auto' : ''}`}
                    style={shouldScroll ? { maxHeight: '60vh' } : {}}
                >
                    {sessionsData.flatMap((session) =>
                        session.levelDetails.map((level, index) => (
                            <div
                                className="animate-fadeIn group flex flex-col gap-3 rounded-lg border border-neutral-200 bg-white p-4 transition-all duration-200 hover:border-primary-200 hover:shadow-md"
                                key={index}
                                style={{ animationDelay: `${index * 0.1}s` }}
                            >
                                {/* Enhanced header with course info */}
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex-1">
                                        {/* Course, Level, Session info */}
                                        <div className=" space-y-1.5 text-xs text-neutral-600">
                                            <div className="flex items-center gap-2">
                                                <div className="flex size-3.5 items-center justify-center rounded bg-blue-100">
                                                    <div className="size-2 rounded bg-blue-500"></div>
                                                </div>
                                                <span className="font-medium">Level:</span>
                                                <span className="text-neutral-700">
                                                    {level.name}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Calendar className="size-3.5 text-neutral-400" />
                                                <span className="font-medium">Session:</span>
                                                <span className="text-neutral-700">
                                                    {session.sessionDetails.session_name}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Invite link section */}
                                <div className="border-t border-neutral-100  pt-2">
                                    <div className="mb-2 text-xs font-medium text-neutral-600">
                                        Invite Link:
                                    </div>
                                    <InviteLink inviteCode={level.inviteLink} linkLen={50} />
                                </div>
                            </div>
                        ))
                    )}
                </div>
                <Separator />
                <div className="p-4 pt-0">
                    <MyButton
                        type="button"
                        scale="small"
                        buttonType="secondary"
                        className="mt-4 flex items-center gap-1"
                        onClick={() => {
                            navigate({ to: '/manage-students/invite' });
                        }}
                    >
                        <ArrowRight size={18} />
                        Invite Page
                    </MyButton>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default InviteDetailsComponent;
