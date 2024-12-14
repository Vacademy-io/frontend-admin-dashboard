// components/StudentListHeader.tsx
import { MyButton } from "@/components/design-system/button";

interface StudentListHeaderProps {
    onEnrollClick: () => void;
}

export const StudentListHeader = ({ onEnrollClick }: StudentListHeaderProps) => (
    <div className="flex items-center justify-between">
        <div className="text-h3 font-semibold">Students List</div>
        <MyButton
            scale="large"
            buttonType="primary"
            layoutVariant="default"
            onClick={onEnrollClick}
        >
            Enroll Student
        </MyButton>
    </div>
);
