import { MyDropdown } from "@/components/design-system/dropdown";
import { dropdownSchema } from "@/components/design-system/utils/schema/dropdown-schema";
import { useState } from "react";
import { useGetSessions } from "@/hooks/student-list-section/useFilters";

export const SessionDropdown = ({
    handleSessionValidation,
}: {
    handleSessionValidation: (isValid: boolean) => void;
}) => {
    const sessionList = useGetSessions();
    const [currentSession, setCurrentSession] = useState("");

    const handleSessionChange = (session: string) => {
        setCurrentSession(session);
    };

    return (
        <div className="flex w-full flex-col gap-1">
            <div>
                Session <span className="text-subtitle text-danger-600">*</span>
            </div>
            <MyDropdown
                currentValue={currentSession}
                dropdownList={sessionList}
                handleChange={handleSessionChange}
                placeholder="Select Session"
                validation={dropdownSchema}
                onValidation={handleSessionValidation}
            />
        </div>
    );
};
