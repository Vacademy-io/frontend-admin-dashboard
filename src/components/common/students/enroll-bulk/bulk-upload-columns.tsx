// bulk-upload-columns.tsx
import { type ColumnDef } from "@tanstack/react-table";
import { MdCheckCircle } from "react-icons/md";
import { MyButton } from "@/components/design-system/button";
import { type ErrorType, type SchemaFields } from "@/types/students/bulk-upload-types";
import { cn } from "@/lib/utils";
import { Header } from "@/schemas/student/student-bulk-enroll/csv-bulk-init";

export const createBulkUploadColumns = (
    csvErrors: ErrorType[],
    headers?: Header[],
): Array<ColumnDef<SchemaFields>> => {
    const columns: Array<ColumnDef<SchemaFields>> = [];

    console.log("CSV Errors:", csvErrors);

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

    // Add status column at the end
    columns.push({
        id: "status",
        header: "Status",
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

    // Add error column at the very end with simplified error message
    columns.push({
        id: "error",
        header: "Error",
        cell: ({ row }) => {
            const rowErrors = csvErrors.filter((error) => error.path[0] === row.index);
            return (
                <div className="text-red-500">
                    {rowErrors.map((error, index) => (
                        <div key={index}>ERROR in [{error.path[1]}]</div>
                    ))}
                </div>
            );
        },
    });

    return columns;
};
