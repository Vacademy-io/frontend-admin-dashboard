import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { createBulkUploadColumns } from "./bulk-upload-columns";
import { type Header } from "@/schemas/student/student-bulk-enroll/csv-bulk-init";
import { useBulkUploadStore } from "@/stores/students/enroll-students-bulk/useBulkUploadStore";
import { StudentSearchBox } from "../students-list/student-search-box";
import { MyPagination } from "@/components/design-system/pagination";
import { Switch } from "@/components/ui/switch";
import { MyButton } from "@/components/design-system/button";
import { createAndDownloadCsv } from "./utils/csv-utils";
import { useState, useMemo } from "react";

interface BulkUploadTableProps {
    headers: Header[];
    onEdit?: (rowIndex: number, columnId: string, value: string) => void;
}

// types/students/bulk-upload-types.ts

const ITEMS_PER_PAGE = 10;

export function BulkUploadTable({ headers, onEdit }: BulkUploadTableProps) {
    const { csvData, csvErrors, isEditing, setIsEditing } = useBulkUploadStore();
    const [page, setPage] = useState(0);
    const [searchInput, setSearchInput] = useState("");
    const [searchFilter, setSearchFilter] = useState("");

    const columns = createBulkUploadColumns(csvErrors, headers);

    const filteredData = useMemo(() => {
        if (!csvData) return [];
        return csvData.filter((row) =>
            Object.values(row).some(
                (value) => value?.toString().toLowerCase().includes(searchFilter.toLowerCase()),
            ),
        );
    }, [csvData, searchFilter]);

    const paginatedData = useMemo(() => {
        const start = page * ITEMS_PER_PAGE;
        return filteredData.slice(start, start + ITEMS_PER_PAGE);
    }, [filteredData, page]);

    const table = useReactTable({
        data: paginatedData,
        columns,
        getCoreRowModel: getCoreRowModel(),
        meta: { onEdit },
    });

    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchInput(event.target.value);
    };

    const handleSearchEnter = () => {
        setSearchFilter(searchInput);
        setPage(0);
    };

    const handleClearSearch = () => {
        setSearchInput("");
        setSearchFilter("");
        setPage(0);
    };

    interface SchemaFields {
        [key: string]: string | number | boolean;
    }

    // Create a type for rows with errors
    interface RowWithError extends SchemaFields {
        ERROR: string;
    }

    const downloadErrorCases = () => {
        if (!csvData) return;

        const errorMessages: Record<number, string[]> = {};
        csvErrors.forEach((error) => {
            const [rowIndex, column] = error.path;
            if (!errorMessages[rowIndex]) {
                errorMessages[rowIndex] = [];
            }
            errorMessages[rowIndex]?.push(`(${column}: ${error.message})`);
        });

        // Create data with errors using the new type
        const dataWithErrors = csvData
            .map((row, index) => {
                if (errorMessages[index]) {
                    const errorRow: RowWithError = {
                        ...row,
                        ERROR: errorMessages[index]?.join(", ") || "Unknown error",
                    };
                    return errorRow;
                }
                return null;
            })
            .filter((row): row is RowWithError => row !== null);

        createAndDownloadCsv(dataWithErrors, "ERROR_CASES.csv");
    };

    // types/students/bulk-upload-types.ts

    const downloadValidData = () => {
        if (!csvData) return;

        const validData = csvData.filter(
            (_, index) => !csvErrors.some((error) => error.path[0] === index),
        );

        createAndDownloadCsv(validData, "VALID_DATA.csv");
    };

    const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <StudentSearchBox
                        searchInput={searchInput}
                        searchFilter={searchFilter}
                        onSearchChange={handleSearchChange}
                        onSearchEnter={handleSearchEnter}
                        onClearSearch={handleClearSearch}
                    />
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">Enable Editing</span>
                        <Switch checked={isEditing} onCheckedChange={setIsEditing} />
                    </div>
                </div>
                <div className="flex gap-4">
                    {csvErrors.length > 0 && (
                        <MyButton
                            buttonType="secondary"
                            scale="small"
                            layoutVariant="default"
                            onClick={downloadErrorCases}
                        >
                            Download Error Cases
                        </MyButton>
                    )}
                    {csvData && csvData.length > 0 && csvErrors.length === 0 && (
                        <MyButton
                            buttonType="primary"
                            scale="small"
                            layoutVariant="default"
                            onClick={downloadValidData}
                        >
                            Download Valid Data
                        </MyButton>
                    )}
                </div>
            </div>

            <div className="rounded-lg border">
                <Table>
                    <TableHeader className="bg-primary-50">
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => (
                                    <TableHead
                                        key={header.id}
                                        className="text-subtitle font-semibold text-neutral-600"
                                    >
                                        {header.isPlaceholder
                                            ? null
                                            : flexRender(
                                                  header.column.columnDef.header,
                                                  header.getContext(),
                                              )}
                                    </TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow key={row.id} className="hover:bg-neutral-50">
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id}>
                                            {flexRender(
                                                cell.column.columnDef.cell,
                                                cell.getContext(),
                                            )}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-24 text-center">
                                    No results.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {totalPages > 1 && (
                <MyPagination
                    currentPage={page + 1}
                    totalPages={totalPages}
                    onPageChange={(newPage) => setPage(newPage - 1)}
                />
            )}
        </div>
    );
}
