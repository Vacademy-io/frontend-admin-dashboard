import { MyButton } from "@/components/design-system/button";
import { EnrollStudentsButton } from "../../../../../../components/common/students/enroll-students-button";
import { useRouter } from "@tanstack/react-router";

export const StudentListHeader = () => {
    const router = useRouter();

    const handleInviteButtonClick = () => {
        router.navigate({
            to: `/students/invite`,
        });
    };

    return (
        <div className="flex items-center justify-between">
            <div className="text-h3 font-semibold">Students List</div>
            <div className="flex items-center gap-4">
                <MyButton onClick={handleInviteButtonClick} scale="large" buttonType="secondary">
                    Invite Students
                </MyButton>
                <EnrollStudentsButton />
            </div>
        </div>
    );
};
