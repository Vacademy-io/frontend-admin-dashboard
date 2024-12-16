import { type ColumnDef, type Row, type Table, type Column } from "@tanstack/react-table";
import { MdCheckCircle } from "react-icons/md";
import { MyButton } from "@/components/design-system/button";
import { type ErrorType, type SchemaFields } from "@/types/students/bulk-upload-types";
import { useBulkUploadStore } from "@/stores/students/enroll-students-bulk/useBulkUploadStore";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useEffect, useState } from "react";
import { Header } from "@/schemas/student/student-bulk-enroll/csv-bulk-init";

// Define custom meta type for the table
interface TableMeta {
    onEdit?: (rowIndex: number, columnId: string, value: string) => void;
}

// Extend the Table type to include our custom meta
interface CustomTable<TData> extends Table<TData> {
    options: {
        meta: TableMeta;
    } & Table<TData>["options"];
}

// Define props for the TableCell component
interface TableCellProps {
    getValue: () => unknown;
    row: Row<SchemaFields>;
    column: Column<SchemaFields, unknown>;
    table: CustomTable<SchemaFields>;
    columnOptions?: string[];
    isError: boolean;
}

const TableCell = ({ getValue, row, column, table, columnOptions, isError }: TableCellProps) => {
    const initialValue = getValue() as string;
    const [value, setValue] = useState(initialValue ?? "");
    const [editMode, setEditMode] = useState<"input" | "select" | null>(null);
    const { isEditing } = useBulkUploadStore();

    useEffect(() => {
        setValue(initialValue ?? "");
    }, [initialValue]);

    const onBlur = () => {
        table.options.meta?.onEdit?.(row.index, column.id, value);
        setEditMode(null);
    };

    if (!isEditing) {
        return (
            <div
                className={cn(
                    "overflow-hidden overflow-ellipsis text-nowrap",
                    isError && "border border-red-400",
                )}
            >
                {value}
            </div>
        );
    }

    return (
        <div
            className={cn(
                "overflow-hidden overflow-ellipsis text-nowrap",
                isError && "border border-red-400",
            )}
            onDoubleClick={() => {
                setEditMode(columnOptions ? "select" : "input");
            }}
        >
            {editMode === "select" && columnOptions ? (
                <Select
                    value={value}
                    onValueChange={(newValue) => {
                        setValue(newValue);
                        table.options.meta?.onEdit?.(row.index, column.id, newValue);
                        setEditMode(null);
                    }}
                >
                    <SelectTrigger>
                        <SelectValue placeholder="Select option" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectGroup>
                            {columnOptions.map((option) => (
                                <SelectItem key={option} value={option}>
                                    {option}
                                </SelectItem>
                            ))}
                        </SelectGroup>
                    </SelectContent>
                </Select>
            ) : editMode === "input" ? (
                <Input
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    onBlur={onBlur}
                    className="h-8"
                />
            ) : (
                value
            )}
        </div>
    );
};

export const createBulkUploadColumns = (
    csvErrors: ErrorType[],
    headers?: Header[],
): Array<ColumnDef<SchemaFields>> => {
    const columns: Array<ColumnDef<SchemaFields>> = [
        {
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
        },
    ];

    // Add columns for each field in the CSV
    headers?.forEach((header) => {
        columns.push({
            accessorKey: header.column_name,
            header: header.column_name.replace(/_/g, " "),
            cell: ({ row, column, table, getValue }) => {
                const error = csvErrors.find(
                    (error) => error.path[0] === row.index && error.path[1] === header.column_name,
                );

                return (
                    <TableCell
                        getValue={getValue}
                        row={row}
                        column={column}
                        table={table as CustomTable<SchemaFields>}
                        columnOptions={header.options ?? undefined}
                        isError={!!error}
                    />
                );
            },
        });
    });

    // Add error column
    columns.push({
        id: "error",
        header: "Error",
        cell: ({ row }) => {
            const rowErrors = csvErrors.filter((error) => error.path[0] === row.index);
            return (
                <div className="text-red-500">
                    {rowErrors.map((error, index) => (
                        <div key={index}>{`${error.path[1]}: ${error.message}`}</div>
                    ))}
                </div>
            );
        },
    });

    return columns;
};
