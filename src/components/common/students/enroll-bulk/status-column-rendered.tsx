import React, { useState } from "react";
import { CheckCircle } from "@phosphor-icons/react";
import { MyButton } from "@/components/design-system/button";
import { ErrorDetailsDialog } from "./error-details-dialog";
import { SchemaFields, ValidationError } from "@/types/students/bulk-upload-types";
import { Row } from "@tanstack/react-table";

interface StatusColumnRendererProps {
    row: Row<SchemaFields>;
    csvErrors: ValidationError[];
    csvData: SchemaFields[] | undefined;
}

export const StatusColumnRenderer: React.FC<StatusColumnRendererProps> = ({
    row,
    csvErrors,
    csvData,
}) => {
    const [showErrorDialog, setShowErrorDialog] = useState(false);
    const rowIndex = row.index;

    // Check if there are any errors for this row
    const rowErrors = csvErrors.filter((error) => error.path[0] === rowIndex);
    const hasErrors = rowErrors.length > 0;

    if (!hasErrors) {
        return (
            <div className="flex justify-center">
                <CheckCircle className="h-6 w-6 text-success-500" weight="fill" />
            </div>
        );
    }

    return (
        <>
            <div className="flex justify-center">
                <MyButton
                    buttonType="primary"
                    scale="small"
                    layoutVariant="default"
                    onClick={() => setShowErrorDialog(true)}
                >
                    Check errors
                </MyButton>
            </div>

            {showErrorDialog && (
                <ErrorDetailsDialog
                    isOpen={showErrorDialog}
                    onClose={() => setShowErrorDialog(false)}
                    errors={rowErrors}
                    rowData={
                        (csvData && rowIndex >= 0 && rowIndex < csvData.length
                            ? csvData[rowIndex]
                            : {}) as SchemaFields
                    }
                />
            )}
        </>
    );
};
