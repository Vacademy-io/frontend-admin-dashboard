import { createContext, useContext } from "react";
import { StudentTable } from "@/types/student-table-types";
import { StudentCredentialsType } from "@/services/student-list-section/getStudentCredentails";
interface StudentSidebarContextType {
    selectedStudent: StudentTable | null;
    setSelectedStudent: (student: StudentTable | null) => void;
    selectedStudentCredentials: StudentCredentialsType | null;
    setSelectedStudentCredentials: (credentials: StudentCredentialsType | null) => void;
}

export const StudentSidebarContext = createContext<StudentSidebarContextType | undefined>(
    undefined,
);

export const useStudentSidebar = () => {
    const context = useContext(StudentSidebarContext);
    if (!context) {
        throw new Error("useStudentSidebar must be used within a StudentSidebarProvider");
    }
    return context;
};
