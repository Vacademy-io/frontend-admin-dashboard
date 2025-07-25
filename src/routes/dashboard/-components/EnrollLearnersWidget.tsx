import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { MyButton } from '@/components/design-system/button';
import { Plus, Users, UserPlus } from 'phosphor-react';
import { useNavigate } from '@tanstack/react-router';

export default function EnrollLearnersWidget() {
    const navigate = useNavigate();

    const handleInviteStudents = () => {
        navigate({ to: '/manage-students/invite' });
    };

    const handleManageStudents = () => {
        navigate({ to: '/manage-students/students-list' });
    };

    const handleEnrollRequests = () => {
        navigate({ to: '/manage-students/enroll-requests' });
    };

    return (
        <Card className="grow bg-neutral-50 shadow-none">
            <CardHeader className="p-4">
                <div className="flex items-center gap-2">
                    <UserPlus size={18} className="text-primary-500" weight="duotone" />
                    <div>
                        <CardTitle className="text-sm font-semibold">Enroll Learners</CardTitle>
                        <CardDescription className="mt-1 text-xs text-neutral-600">
                            Manage student enrollment and invitations
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>
            <div className="space-y-3 px-4 pb-4">
                <div className="grid grid-cols-1 gap-3">
                    <MyButton
                        type="button"
                        scale="medium"
                        buttonType="primary"
                        layoutVariant="default"
                        className="w-full justify-start gap-2 text-sm"
                        onClick={handleInviteStudents}
                    >
                        <Plus size={16} />
                        Invite New Students
                    </MyButton>

                    <MyButton
                        type="button"
                        scale="medium"
                        buttonType="secondary"
                        layoutVariant="default"
                        className="w-full justify-start gap-2 text-sm"
                        onClick={handleManageStudents}
                    >
                        <Users size={16} />
                        Manage Students List
                    </MyButton>

                    <MyButton
                        type="button"
                        scale="medium"
                        buttonType="secondary"
                        layoutVariant="default"
                        className="w-full justify-start gap-2 text-sm"
                        onClick={handleEnrollRequests}
                    >
                        <UserPlus size={16} />
                        Enrollment Requests
                    </MyButton>
                </div>
            </div>
        </Card>
    );
}
