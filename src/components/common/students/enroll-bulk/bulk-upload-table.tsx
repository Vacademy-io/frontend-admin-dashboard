// bulk-upload-table.tsx
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

const COLUMN_WIDTHS: ColumnWidths = {
    status: "w-[80px]",
    full_name: "w-[180px]",
    username: "w-[150px]",
    gender: "w-[100px]",
    enrollment_date: "w-[150px]",
    enrollment_number: "w-[150px]",
    mobile_number: "w-[150px]",
    date_of_birth: "w-[150px]",
    package_session: "w-[250px]",
    error: "w-[200px]",
};

const ITEMS_PER_PAGE = 10;

interface BulkUploadTableProps {
    headers: Header[];
    onEdit?: (rowIndex: number, columnId: string, value: string) => void;
}

interface ColumnWidths {
    [key: string]: string;
}

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

    // bulk-upload-table.tsx (continued)

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

        const dataWithErrors = csvData
            .map((row, index) => {
                if (errorMessages[index]) {
                    return {
                        ...row,
                        ERROR: errorMessages[index]?.join(", ") || "Unknown error",
                    };
                }
                return null;
            })
            .filter((row): row is typeof row & { ERROR: string } => row !== null);

        createAndDownloadCsv(dataWithErrors, "ERROR_CASES.csv");
    };

    const downloadValidData = () => {
        if (!csvData) return;

        const validData = csvData.filter(
            (_, index) => !csvErrors.some((error) => error.path[0] === index),
        );

        createAndDownloadCsv(validData, "VALID_DATA.csv");
    };

    const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);

    return (
        <div className="flex h-full flex-col gap-4">
            {/* Search and Controls Section */}
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

            {/* Table Section */}
            <div className="flex-1 rounded-lg border">
                <div className="h-full overflow-x-auto">
                    <div className="min-w-max">
                        {" "}
                        {/* This ensures the table takes minimum width needed */}
                        <Table>
                            <TableHeader className="sticky top-0 z-10 bg-primary-200">
                                {table.getHeaderGroups().map((headerGroup) => (
                                    <TableRow key={headerGroup.id}>
                                        {headerGroup.headers.map((header) => (
                                            <TableHead
                                                key={header.id}
                                                className={`whitespace-nowrap border-r border-neutral-300 p-3 text-subtitle font-semibold text-neutral-600 ${
                                                    COLUMN_WIDTHS[header.column.id] || "w-[150px]"
                                                }`}
                                            >
                                                {flexRender(
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
                                                <TableCell
                                                    key={cell.id}
                                                    className={`whitespace-nowrap border-r border-neutral-300 p-3 text-body font-regular text-neutral-600 ${
                                                        COLUMN_WIDTHS[cell.column.id] || "w-[150px]"
                                                    }`}
                                                >
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
                                        <TableCell
                                            colSpan={columns.length}
                                            className="h-24 text-center"
                                        >
                                            No results.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            </div>

            {/* Pagination Section */}
            <div>
                <MyPagination
                    currentPage={page + 1}
                    totalPages={totalPages}
                    onPageChange={(newPage) => setPage(newPage - 1)}
                />
            </div>
        </div>
    );
}
