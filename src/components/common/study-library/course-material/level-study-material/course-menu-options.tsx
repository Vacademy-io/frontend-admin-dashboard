import { MyButton } from "@/components/design-system/button";
import { MyDropdown } from "@/components/design-system/dropdown";
import { CourseType } from "@/stores/study-library/use-study-library-store";
import { DotsThree } from "phosphor-react";

interface CourseMenuOptionsProps {
    onDelete: (courseId: string) => void;
    onEdit: () => void;
    course: CourseType;
}

export const CourseMenuOptions = ({ onDelete, onEdit, course }: CourseMenuOptionsProps) => {
    const DropdownList = ["Edit Course", "Delete Course"];

    const handleMenuOptionsChange = (value: string) => {
        if (value === "Delete Course") {
            onDelete(course.id);
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
