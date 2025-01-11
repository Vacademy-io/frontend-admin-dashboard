// StudentMenuOptions.tsx
import { MyDropdown } from "../../dropdown";
import { MyButton } from "../../button";
import { DotsThree } from "@phosphor-icons/react";
import { useDialogStore } from "../../utils/useDialogStore";
import { StudentTable } from "@/schemas/student/student-list/table-schema";

const getMenuOptions = (status?: string) => {
    if (status === "INACTIVE") {
        return ["View Student Portal", "Re-enroll Student", "Delete Student"];
    }

    return [
        "View Student Portal",
        "Change Batch",
        "Extend Session",
        "Re-register for Next Session",
        "Terminate Registration",
        "Delete Student",
    ];
};

export const StudentMenuOptions = ({ student }: { student: StudentTable }) => {
    const {
        openChangeBatchDialog,
        openExtendSessionDialog,
        openReRegisterDialog,
        openTerminateRegistrationDialog,
        openDeleteDialog,
    } = useDialogStore();

    const menuOptions = getMenuOptions(student.status);

    const handleMenuOptionsChange = (value: string) => {
        switch (value) {
            case "Re-enroll Student":
                // You can reuse openReRegisterDialog or create a new dialog for re-enrollment
                // openReRegisterDialog(student);
                break;
            case "Change Batch":
                openChangeBatchDialog(student);
                break;
            case "Extend Session":
                openExtendSessionDialog(student);
                break;
            case "Re-register for Next Session":
                openReRegisterDialog(student);
                break;
            case "Terminate Registration":
                openTerminateRegistrationDialog(student);
                break;
            case "Delete Student":
                openDeleteDialog(student);
                break;
            // Handle View Student Portal if needed
            case "View Student Portal":
                // Add portal view logic here
                break;
        }
    };

    return (
        <MyDropdown dropdownList={menuOptions} onSelect={handleMenuOptionsChange}>
            <MyButton
                buttonType="secondary"
                scale="small"
                layoutVariant="icon"
                className="flex items-center justify-center"
            >
                <DotsThree />
            </MyButton>
        </MyDropdown>
    );
};
