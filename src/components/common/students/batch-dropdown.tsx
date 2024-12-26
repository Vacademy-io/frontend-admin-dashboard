import { MyDropdown } from "@/components/design-system/dropdown";
import { dropdownSchema } from "@/components/design-system/utils/schema/dropdown-schema";
import { useState, useMemo } from "react";
import { useGetBatchNames } from "@/hooks/student-list-section/useFilters";
import { useInstituteDetailsStore } from "@/stores/students/students-list/useInstituteDetailsStore";

interface BatchDropdownInterface {
    handleSessionValidation: (isValid: boolean) => void;
    session?: string;
    currentPackageSessionId?: string;
}

export const BatchDropdown = ({
    handleSessionValidation,
    session,
    currentPackageSessionId,
}: BatchDropdownInterface) => {
    const { instituteDetails } = useInstituteDetailsStore();
    const sessionList = useGetBatchNames(session);
    const [currentBatch, setCurrentBatch] = useState("");

    // Filter out the current batch from the options
    const filteredBatchList = useMemo(() => {
        if (!currentPackageSessionId) return sessionList;

        const currentBatchInfo = instituteDetails?.batches_for_sessions.find(
            (batch) => batch.id === currentPackageSessionId,
        );

        if (!currentBatchInfo) return sessionList;

        const currentBatchName = `${currentBatchInfo.level.level_name} ${currentBatchInfo.package_dto.package_name}`;

        return sessionList.filter((batchName) => batchName !== currentBatchName);
    }, [sessionList, currentPackageSessionId, instituteDetails]);

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
                dropdownList={filteredBatchList}
                handleChange={handleBatchChange}
                placeholder="Select Batch"
                validation={dropdownSchema}
                onValidation={handleSessionValidation}
            />
        </div>
    );
};
