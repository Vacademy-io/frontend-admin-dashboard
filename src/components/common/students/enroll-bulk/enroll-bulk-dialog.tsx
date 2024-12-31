import { DialogHeader } from "@/components/ui/dialog";
import { MyDropdown } from "@/components/design-system/dropdown";
import { DialogDescription } from "@radix-ui/react-dialog";
import { useGetSessions } from "@/hooks/student-list-section/useFilters";
import { useState } from "react";
import { UploadCSVButton } from "./upload-csv-button";
import { dropdownSchema } from "@/components/design-system/utils/schema/dropdown-schema";

export const EnrollBulkDialog = () => {
    const sessionList = useGetSessions();
    const [currentSession, setCurrentSession] = useState("");
    const [isFormValid, setIsFormValid] = useState({
        session: false,
    });

    const handleSessionChange = (session: string) => {
        setCurrentSession(session);
    };

    const handleSessionValidation = (isValid: boolean) => {
        setIsFormValid((prev) => ({ ...prev, session: isValid }));
    };

    return (
        <DialogHeader>
            <div className="bg-primary-50 px-6 py-4 text-h3 font-semibold text-primary-500">
                Enroll in Bulk
            </div>
            <DialogDescription className="flex flex-col items-center justify-center gap-6 p-6 text-neutral-600">
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
                <UploadCSVButton disable={!isFormValid.session} />
            </DialogDescription>
        </DialogHeader>
    );
};
