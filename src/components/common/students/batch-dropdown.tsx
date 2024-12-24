import { MyDropdown } from "@/components/design-system/dropdown";
import { dropdownSchema } from "@/components/design-system/utils/schema/dropdown-schema";
import { useState } from "react";
import { useGetBatchNames } from "@/hooks/student-list-section/useFilters";

interface BatchDropdownInterface {
    handleSessionValidation: (isValid: boolean) => void;
    session?: string;
}

export const BatchDropdown = ({ handleSessionValidation, session }: BatchDropdownInterface) => {
    // Call the hook unconditionally
    const sessionList = useGetBatchNames(session);
    const [currentBatch, setCurrentBatch] = useState("");

    const handleBatchChange = (batch: string) => {
        setCurrentBatch(batch);
    };

    return (
        <div className="flex w-full flex-col gap-1">
            <div>
                Batch <span className="text-subtitle text-danger-600">*</span>
            </div>
            <MyDropdown
                currentValue={currentBatch}
                dropdownList={sessionList}
                handleChange={handleBatchChange}
                placeholder="Select Batch"
                validation={dropdownSchema}
                onValidation={handleSessionValidation}
            />
        </div>
    );
};
