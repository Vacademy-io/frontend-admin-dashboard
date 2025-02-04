import { MyButton } from "@/components/design-system/button";
import { MyDropdown } from "@/components/design-system/dropdown";
import { DotsThree } from "phosphor-react";

interface CourseMenuOptionsProps {
    onDelete: () => void;
    onEdit: () => void;
}

export const CourseMenuOptions = ({ onDelete, onEdit }: CourseMenuOptionsProps) => {
    const DropdownList = ["Edit Course", "Delete Course"];

    const handleMenuOptionsChange = (value: string) => {
        if (value === "Delete Course") {
            onDelete();
        } else if (value === "Edit Course") {
            onEdit();
        }
    };

    return (
        <MyDropdown dropdownList={DropdownList} onSelect={handleMenuOptionsChange}>
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
