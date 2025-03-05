// StudentSidebarProvider.tsx
import { ReactNode, useState } from "react";
import { StudentSidebarContext } from "@/context/selected-student-sidebar-context";
import { StudentTable } from "@/schemas/student/student-list/table-schema";

interface StudentSidebarProviderProps {
    children: ReactNode;
}

export const StudentSidebarProvider = ({ children }: StudentSidebarProviderProps) => {
    const [selectedStudent, setSelectedStudent] = useState<StudentTable | null>(null);

    const value = {
        selectedStudent,
        setSelectedStudent,
    };

    return (
        <StudentSidebarContext.Provider value={value}>{children}</StudentSidebarContext.Provider>
    );
};
