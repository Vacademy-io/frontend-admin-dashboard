// bulk-upload-columns.tsx
import { type ColumnDef } from "@tanstack/react-table";
import { MdCheckCircle } from "react-icons/md";
import { MyButton } from "@/components/design-system/button";
import { type ErrorType, type SchemaFields } from "@/types/students/bulk-upload-types";
import { cn } from "@/lib/utils";
import { Header } from "@/schemas/student/student-bulk-enroll/csv-bulk-init";

// bulk-upload-columns.tsx
export const createBulkUploadColumns = (
    csvErrors: ErrorType[],
    headers?: Header[],
    isPostUpload: boolean = false, // Add this parameter to check if upload API was hit
): Array<ColumnDef<SchemaFields>> => {
    const columns: Array<ColumnDef<SchemaFields>> = [];

    // Add header columns first
    headers?.forEach((header) => {
        columns.push({
            accessorKey: header.column_name,
            header: header.column_name.replace(/_/g, " "),
            cell: ({ getValue, row }) => {
                const error = csvErrors.find(
                    (error) => error.path[0] === row.index && error.path[1] === header.column_name,
                );

                const value = getValue();

                return (
                    <div
                        className={cn(
                            "overflow-hidden overflow-ellipsis text-nowrap",
                            error && "border border-red-400",
                        )}
                    >
                        {value as string}
                    </div>
                );
            },
        });
    });

    // Add validation status column - always visible
    columns.push({
        id: "validation_status",
        header: "Validation Status",
        cell: ({ row }) => {
            const rowErrors = csvErrors.filter((error) => error.path[0] === row.index);
            return (
                <div className="flex items-center text-xl">
                    {rowErrors.length > 0 ? (
                        <MyButton
                            layoutVariant="default"
                            scale="small"
                            className="cursor-pointer bg-danger-500 hover:bg-danger-400 active:bg-danger-600"
                            buttonType="primary"
                        >
                            Check errors
                        </MyButton>
                    ) : (
                        <MdCheckCircle className="text-green-500" />
                    )}
                </div>
            );
        },
    });

    // Only add these columns if upload API was hit
    if (isPostUpload) {
        columns.push(
            {
                id: "upload_status",
                header: "Upload Status",
                cell: ({ row }) => {
                    const status = row.original.STATUS;
                    const message = row.original.STATUS_MESSAGE;
                    return (
                        <div
                            className={cn(
                                "text-sm font-semibold",
                                status === "true" ? "text-success-500" : "text-danger-500",
                            )}
                        >
                            {status === "true" ? message || "Success" : "Failed"}
                        </div>
                    );
                },
            },
            {
                id: "upload_error",
                header: "Upload Error",
                cell: ({ row }) => {
                    const error = row.original.ERROR;
                    if (!error) return null;

                    return (
                        <div className="max-w-[300px] whitespace-normal break-words text-sm text-danger-500">
                            {error}
                        </div>
                    );
                },
            },
        );
    }

    return columns;
};
