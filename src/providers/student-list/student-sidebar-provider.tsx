// StudentSidebarProvider.tsx
import { ReactNode, useState } from "react";
import { StudentSidebarContext } from "@/routes/students/students-list/-context/selected-student-sidebar-context";
import { StudentTable } from "@/types/student-table-types";
import { StudentCredentialsType } from "@/services/student-list-section/getStudentCredentails";

interface StudentSidebarProviderProps {
    children: ReactNode;
}

export const StudentSidebarProvider = ({ children }: StudentSidebarProviderProps) => {
    const [selectedStudent, setSelectedStudent] = useState<StudentTable | null>(null);
    const [selectedStudentCredentials, setSelectedStudentCredentials] =
        useState<StudentCredentialsType | null>(null);

    const value = {
        selectedStudent,
        setSelectedStudent,
        selectedStudentCredentials,
        setSelectedStudentCredentials,
    };

    return (
        <StudentSidebarContext.Provider value={value}>{children}</StudentSidebarContext.Provider>
    );
};
