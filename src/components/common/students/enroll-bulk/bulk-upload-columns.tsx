// bulk-upload-columns.tsx
import { type ColumnDef } from "@tanstack/react-table";
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
