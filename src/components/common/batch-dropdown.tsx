import { MyDropdown } from "@/components/design-system/dropdown";
import { dropdownSchema } from "@/components/design-system/utils/schema/dropdown-schema";
import { useState, useMemo } from "react";
import { useGetBatchNames } from "@/hooks/student-list-section/useFilters";
import { useInstituteDetailsStore } from "@/stores/students/students-list/useInstituteDetailsStore";

// components/common/students/batch-dropdown.tsx

interface BatchDropdownInterface {
    handleSessionValidation: (isValid: boolean) => void;
    session?: string;
    currentPackageSessionId?: string;
    onBatchSelect: (batchId: string) => void; // Add this line
}

export const BatchDropdown = ({
    handleSessionValidation,
    session,
    currentPackageSessionId,
    onBatchSelect, // Add this to destructuring
}: BatchDropdownInterface) => {
    const { instituteDetails } = useInstituteDetailsStore();
    const sessionList = useGetBatchNames(session);
    const [currentBatch, setCurrentBatch] = useState("");

    const filteredBatchList = useMemo(() => {
        if (!currentPackageSessionId) return sessionList;

        const currentBatchInfo = instituteDetails?.batches_for_sessions.find(
            (batch) => batch.id === currentPackageSessionId,
        );

        if (!currentBatchInfo) return sessionList;

        const currentBatchName = `${currentBatchInfo.level.level_name} ${currentBatchInfo.package_dto.package_name}`;

        return sessionList.filter((batchName) => batchName !== currentBatchName);
    }, [sessionList, currentPackageSessionId, instituteDetails]);

    const handleBatchChange = (batchName: string) => {
        setCurrentBatch(batchName);

        // Find the batch ID from the institute details
        const selectedBatch = instituteDetails?.batches_for_sessions.find(
            (batch) => `${batch.level.level_name} ${batch.package_dto.package_name}` === batchName,
        );

        if (selectedBatch) {
            onBatchSelect(selectedBatch.id);
        }
    };

    return (
        <div className="flex w-full flex-col gap-1">
            <div>
                Batch <span className="text-subtitle text-danger-600">*</span>
            </div>
            <MyDropdown
                currentValue={currentBatch}
                dropdownList={filteredBatchList}
                handleChange={handleBatchChange}
                placeholder="Select Batch"
                validation={dropdownSchema}
                onValidation={handleSessionValidation}
            />
        </div>
    );
};
