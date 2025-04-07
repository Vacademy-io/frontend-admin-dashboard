import { EnrollManuallyButton } from "@/components/common/students/enroll-manually/enroll-manually-button";
import { MyButton } from "@/components/design-system/button";
import { useStudentSidebar } from "@/routes/students/students-list/-context/selected-student-sidebar-context";

export const EditStudentDetails = () => {
    const { selectedStudent } = useStudentSidebar();
    return selectedStudent != null ? (
        <EnrollManuallyButton
            triggerButton={
                <div className="flex w-full items-center justify-center">
                    <MyButton buttonType="secondary" scale="large" className="w-fit">
                        Edit Student Details
                    </MyButton>
                </div>
            }
            initialValues={selectedStudent}
        />
    ) : (
        <></>
    );
};
