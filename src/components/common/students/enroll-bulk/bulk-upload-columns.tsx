// bulk-upload-columns.tsx
import { type ColumnDef } from "@tanstack/react-table";
import { type ErrorType, type SchemaFields } from "@/types/students/bulk-upload-types";
import { cn } from "@/lib/utils";
import { Header } from "@/schemas/student/student-bulk-enroll/csv-bulk-init";
import { Row } from "@tanstack/react-table";
import { CheckCircle, Warning } from "@phosphor-icons/react";
import { MyButton } from "@/components/design-system/button";

// Define the type for statusColumnRenderer properly
type StatusColumnRenderer = (props: { row: Row<SchemaFields> }) => JSX.Element;

// bulk-upload-columns.tsx
export const createBulkUploadColumns = (
    csvErrors: ErrorType[],
    headers?: Header[],
    isPostUpload: boolean = false,
    statusColumnRenderer?: StatusColumnRenderer,
): Array<ColumnDef<SchemaFields>> => {
    const columns: Array<ColumnDef<SchemaFields>> = [];

    // Add header columns
    headers?.forEach((header) => {
        // Handle special status column
        if (header.column_name === "STATUS") {
            columns.push({
                id: "status",
                header: "STATUS",
                cell: (props) => {
                    if (statusColumnRenderer) {
                        return statusColumnRenderer({ row: props.row });
                    }

                    // Default renderer if custom renderer not provided
                    const rowIndex = props.row.index;

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
                        <div className="flex justify-center">
                            <MyButton buttonType="primary" scale="small" layoutVariant="default">
                                Check errors
                            </MyButton>
                        </div>
                    );
                },
            });
        } else {
            columns.push({
                accessorKey: header.column_name,
                header: () => {
                    return (
                        <div className="flex flex-col">
                            <span>{header.column_name.replace(/_/g, " ")}</span>
                            {!header.optional && (
                                <span className="text-xs text-danger-500">*Required</span>
                            )}
                            {header.type === "enum" && header.options && (
                                <span className="text-xs text-neutral-500">(Select one)</span>
                            )}
                            {header.type === "date" && header.format && (
                                <span className="text-xs text-neutral-500">({header.format})</span>
                            )}
                        </div>
                    );
                },
                cell: ({ getValue, row }) => {
                    const error = csvErrors.find(
                        (error) =>
                            error.path[0] === row.index && error.path[1] === header.column_name,
                    );

                    const value = getValue();

                    return (
                        <div className={cn("relative py-2", error && "bg-danger-50")}>
                            <div
                                className={cn(
                                    "max-w-[180px] overflow-hidden overflow-ellipsis whitespace-nowrap",
                                    error &&
                                        "border-b border-dashed border-danger-500 text-danger-700",
                                )}
                            >
                                {value as string}
                                {error && (
                                    <Warning className="ml-1 inline h-4 w-4 text-danger-500" />
                                )}
                            </div>
                        </div>
                    );
                },
            });
        }
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
