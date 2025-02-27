// editable-bulk-upload-columns.tsx
import { type ColumnDef } from "@tanstack/react-table";
import { type ValidationError, type SchemaFields } from "@/types/students/bulk-upload-types";
import { cn } from "@/lib/utils";
import { Header } from "@/schemas/student/student-bulk-enroll/csv-bulk-init";
import { Row } from "@tanstack/react-table";
import { CheckCircle, Warning } from "@phosphor-icons/react";
import { MyButton } from "@/components/design-system/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

// Define the type for statusColumnRenderer properly
type StatusColumnRenderer = (props: { row: Row<SchemaFields> }) => JSX.Element;

interface EditableBulkUploadColumnsProps {
    csvErrors: ValidationError[];
    headers?: Header[];
    isPostUpload?: boolean;
    statusColumnRenderer?: StatusColumnRenderer;
    isEditing: boolean;
    onCellClick: (rowIndex: number, columnId: string) => void;
    editCell: { rowIndex: number; columnId: string } | null;
    handleCellEdit: (rowIndex: number, columnId: string, value: string) => void;
}

// Create editable bulk upload columns
export const createEditableBulkUploadColumns = ({
    csvErrors,
    headers,
    isPostUpload = false,
    statusColumnRenderer,
    isEditing,
    onCellClick,
    editCell,
    handleCellEdit,
}: EditableBulkUploadColumnsProps): Array<ColumnDef<SchemaFields>> => {
    const columns: Array<ColumnDef<SchemaFields>> = [];

    // Always include a status column, even if it's not in the headers
    const hasStatusColumn = headers?.some((h) => h.column_name === "STATUS");

    if (!hasStatusColumn) {
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
    }

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
                cell: ({ getValue, row, column }) => {
                    const rowIndex = row.index;
                    const columnId = column.id;
                    const error = csvErrors.find(
                        (error) =>
                            error.path[0] === rowIndex && error.path[1] === header.column_name,
                    );
                    const value = getValue() as string;
                    const isCurrentlyEditing =
                        editCell?.rowIndex === rowIndex && editCell?.columnId === columnId;

                    // Render editable cell if in edit mode
                    if (isEditing && isCurrentlyEditing) {
                        // For enum type fields, render a dropdown
                        if (header.type === "enum" && header.options && header.options.length > 0) {
                            return (
                                <Select
                                    defaultValue={value}
                                    onValueChange={(newValue) =>
                                        handleCellEdit(rowIndex, columnId, newValue)
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select an option" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {header.options.map((option) => (
                                            <SelectItem key={option} value={option}>
                                                {option}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            );
                        }

                        // For other types, render a text input
                        return (
                            <Input
                                autoFocus
                                defaultValue={value}
                                onChange={(e) => e.stopPropagation()}
                                onBlur={(e) => handleCellEdit(rowIndex, columnId, e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        handleCellEdit(
                                            rowIndex,
                                            columnId,
                                            (e.target as HTMLInputElement).value,
                                        );
                                    }
                                }}
                                onClick={(e) => e.stopPropagation()}
                            />
                        );
                    }

                    // Otherwise, render the cell normally with double-click support
                    return (
                        <div
                            className={cn(
                                "relative py-2",
                                error && "bg-danger-50",
                                isEditing && "cursor-pointer hover:bg-primary-50",
                            )}
                            onDoubleClick={() => isEditing && onCellClick(rowIndex, columnId)}
                        >
                            <div
                                className={cn(
                                    "max-w-[180px] overflow-hidden overflow-ellipsis whitespace-nowrap",
                                    error &&
                                        "border-b border-dashed border-danger-500 text-danger-700",
                                )}
                            >
                                {value}
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
