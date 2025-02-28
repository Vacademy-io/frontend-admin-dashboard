import { MyDropdown } from "@/components/design-system/dropdown";
import { BulkActionInfo } from "@/types/students/bulk-actions-types";
import { StudentTable } from "@/schemas/student/student-list/table-schema";
import { ReactNode } from "react";
import { BulkActionDropdownList } from "@/constants/student-list/bulk-actions-menu-options";
import { useSubmissionsBulkActionsDialogStore } from "../bulk-actions-zustand-store/useSubmissionsBulkActionsDialogStore";

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
    } = useSubmissionsBulkActionsDialogStore();

    const handleMenuOptionsChange = (value: string) => {
        const validStudents = selectedStudents.filter((student) => student && student.user_id);

        if (validStudents.length === 0) {
            console.error("No valid students selected");
            return;
        }

        const bulkActionInfo: BulkActionInfo = {
            selectedStudentIds: validStudents.map((student) => student.user_id),
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
