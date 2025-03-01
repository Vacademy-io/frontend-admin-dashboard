import StudentAttemptDropdown from "./assessment-submissions-dropdown/student-attempt-dropdown";
import StudentOngoingDropdown from "./assessment-submissions-dropdown/student-ongoing-dropdown";
import StudentPendingDropdown from "./assessment-submissions-dropdown/student-pending-dropdown";
import { AssessmentRevaluateStudentInterface } from "@/types/assessments/assessment-overview";

export const AssessmentStatusOptions = ({
    student,
    studentType,
}: {
    student: AssessmentRevaluateStudentInterface;
    studentType: string;
}) => {
    return (
        <>
            {studentType === "Attempted" && <StudentAttemptDropdown student={student} />}
            {studentType === "Pending" && <StudentPendingDropdown student={student} />}
            {studentType === "Ongoing" && <StudentOngoingDropdown student={student} />}
        </>
    );
};
