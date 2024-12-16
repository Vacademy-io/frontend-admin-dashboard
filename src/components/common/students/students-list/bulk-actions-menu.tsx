// components/BulkActionsMenu.tsx
import { MyDropdown } from "@/components/design-system/dropdown";
import { useDialogStore } from "@/components/design-system/utils/useDialogStore";
import { BulkActionInfo } from "@/types/students/bulk-actions-types";

const BulkActionDropdownList = [
    "Change Batch",
    "Extend Session",
    "Re-register for Next Session",
    "Terminate Registration",
    "Delete",
];

interface BulkActionsMenuProps {
    trigger: React.ReactNode;
    selectedStudentIds: string[];
    selectedCount: number;
}

export const BulkActionsMenu = ({
    trigger,
    selectedStudentIds,
    selectedCount,
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
