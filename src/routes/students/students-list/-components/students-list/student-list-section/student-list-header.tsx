import { EnrollStudentsButton } from "../../../../../../components/common/students/enroll-students-button";

export const StudentListHeader = () => (
    <div className="flex items-center justify-between">
        <div className="text-h3 font-semibold">Students List</div>
        <EnrollStudentsButton />
    </div>
);
