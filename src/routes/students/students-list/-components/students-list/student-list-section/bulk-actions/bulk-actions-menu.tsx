// components/BulkActionsMenu.tsx
import { MyDropdown } from "@/components/design-system/dropdown";
import { useDialogStore } from "@/routes/students/students-list/-hooks/useDialogStore";
import { BulkActionInfo } from "@/routes/students/students-list/-types/bulk-actions-types";
import { StudentTable } from "@/types/student-table-types";
import { ReactNode } from "react";
import { BulkActionDropdownList } from "@/routes/students/students-list/-constants/bulk-actions-menu-options";

interface BulkActionsMenuProps {
    selectedCount: number;
    selectedStudentIds: string[];
    selectedStudents: StudentTable[];
    trigger: ReactNode;
}

export const BulkActionsMenu = ({ selectedStudents, trigger }: BulkActionsMenuProps) => {
    const {
        openBulkChangeBatchDialog,
        openBulkExtendSessionDialog,
        openBulkReRegisterDialog,
        openBulkTerminateRegistrationDialog,
        openBulkDeleteDialog,
    } = useDialogStore();

    const handleMenuOptionsChange = (value: string) => {
        const validStudents = selectedStudents.filter(
            (student) => student && student.user_id && student.package_session_id,
        );

        if (validStudents.length === 0) {
            console.error("No valid students selected");
            return;
        }

        const bulkActionInfo: BulkActionInfo = {
            selectedStudentIds: validStudents.map((student) => student.id),
            selectedStudents: validStudents,
            displayText: `${validStudents.length} students`,
        };

        switch (value) {
            case "Change Batch":
                openBulkChangeBatchDialog(bulkActionInfo);
                break;
            case "Extend Session":
                openBulkExtendSessionDialog(bulkActionInfo);
                break;
            case "Re-register for Next Session":
                openBulkReRegisterDialog(bulkActionInfo);
                break;
            case "Terminate Registration":
                openBulkTerminateRegistrationDialog(bulkActionInfo);
                break;
            case "Delete":
                openBulkDeleteDialog(bulkActionInfo);
                break;
        }
    };

    return (
        <MyDropdown dropdownList={BulkActionDropdownList} onSelect={handleMenuOptionsChange}>
            {trigger}
        </MyDropdown>
    );
};
