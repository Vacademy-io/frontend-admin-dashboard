import { DialogHeader } from "@/components/ui/dialog";
import { DialogDescription } from "@radix-ui/react-dialog";
import { useState } from "react";
import { UploadCSVButton } from "./upload-csv-button";
import { SessionDropdown } from "../session-dropdown";

export const EnrollBulkDialog = () => {
    const [isFormValid, setIsFormValid] = useState({
        session: false,
    });

    const handleSessionValidation = (isValid: boolean) => {
        setIsFormValid((prev) => ({ ...prev, session: isValid }));
    };

    return (
        <DialogHeader>
            <div className="bg-primary-50 px-6 py-4 text-h3 font-semibold text-primary-500">
                Enroll in Bulk
            </div>
            <DialogDescription className="flex flex-col items-center justify-center gap-6 p-6 text-neutral-600">
                <SessionDropdown handleSessionValidation={handleSessionValidation} />
                <UploadCSVButton disable={!isFormValid.session} />
            </DialogDescription>
        </DialogHeader>
    );
};
