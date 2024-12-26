// components/BulkActionsMenu.tsx
import { MyDropdown } from "@/components/design-system/dropdown";
import { useDialogStore } from "@/components/design-system/utils/useDialogStore";
import { BulkActionInfo } from "@/types/students/bulk-actions-types";
import { StudentTable } from "@/schemas/student/student-list/table-schema";
import { ReactNode } from "react";

const BulkActionDropdownList = [
    "Change Batch",
    "Extend Session",
    "Re-register for Next Session",
    "Terminate Registration",
    "Delete",
];

interface BulkActionsMenuProps {
    selectedCount: number;
    selectedStudentIds: string[];
    selectedStudents: StudentTable[]; // Add this line
    trigger: ReactNode;
}

export const BulkActionsMenu = ({
    selectedCount,
    selectedStudentIds,
    selectedStudents, // Add this
    trigger,
}: BulkActionsMenuProps) => {
    const {
        openBulkChangeBatchDialog,
        openBulkExtendSessionDialog,
        openBulkReRegisterDialog,
        openBulkTerminateRegistrationDialog,
        openBulkDeleteDialog,
    } = useDialogStore();

    const handleMenuOptionsChange = (value: string) => {
        const bulkActionInfo: BulkActionInfo = {
            selectedStudentIds,
            selectedStudents,
            displayText: `${selectedCount} students`,
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
