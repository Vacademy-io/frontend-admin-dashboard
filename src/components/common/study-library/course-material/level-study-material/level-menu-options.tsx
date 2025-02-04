import { MyButton } from "@/components/design-system/button";
import { MyDropdown } from "@/components/design-system/dropdown";
import { DotsThree } from "phosphor-react";

interface LevelMenuOptionsProps {
    onDelete: () => void;
    onEdit: () => void;
}

export const LevelMenuOptions = ({ onDelete, onEdit }: LevelMenuOptionsProps) => {
    const DropdownList = ["Edit Level", "Delete Level"];

    const handleMenuOptionsChange = (value: string) => {
        if (value === "Delete Level") {
            onDelete();
        } else if (value === "Edit Level") {
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
