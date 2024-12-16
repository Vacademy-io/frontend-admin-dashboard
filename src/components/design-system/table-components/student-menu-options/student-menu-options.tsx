// StudentMenuOptions.tsx
import { MyDropdown } from "../../dropdown";
import { MyButton } from "../../button";
import { DotsThree } from "@phosphor-icons/react";
import { useDialogStore } from "../../utils/useDialogStore";
import { StudentTable } from "@/schemas/student/student-list/table-schema";

const ActiveStudentDropdownList = [
    "View Student Portal",
    "Change Batch",
    "Extend Session",
    "Re-register for Next Session",
    "Terminate Registration",
    "Delete Student",
];

export const StudentMenuOptions = ({ student }: { student: StudentTable }) => {
    const {
        openChangeBatchDialog,
        openExtendSessionDialog,
        openReRegisterDialog,
        openTerminateRegistrationDialog,
        openDeleteDialog,
    } = useDialogStore();

    const handleMenuOptionsChange = (value: string) => {
        switch (value) {
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
        }
    };

    return (
        <MyDropdown dropdownList={ActiveStudentDropdownList} onSelect={handleMenuOptionsChange}>
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
