// bulk-upload-table.tsx
import { createBulkUploadColumns } from "./bulk-upload-columns";
import { type Header } from "@/schemas/student/student-bulk-enroll/csv-bulk-init";
import { useBulkUploadStore } from "@/stores/students/enroll-students-bulk/useBulkUploadStore";
import { StudentSearchBox } from "../students-list/student-search-box";
import { MyPagination } from "@/components/design-system/pagination";
import { MyButton } from "@/components/design-system/button";
import { createAndDownloadCsv } from "./utils/csv-utils";
import { useState, useMemo } from "react";
import { MyTable } from "@/components/design-system/table";
import { SchemaFields } from "@/types/students/bulk-upload-types";

interface BulkUploadTableProps {
    headers: Header[];
    onEdit?: (rowIndex: number, columnId: string, value: string) => void;
}

interface RowWithError extends SchemaFields {
    ERROR: string;
}

const ITEMS_PER_PAGE = 10;

export function BulkUploadTable({ headers }: BulkUploadTableProps) {
    const { csvData, csvErrors } = useBulkUploadStore();
    const [page, setPage] = useState(0);
    const [searchInput, setSearchInput] = useState("");
    const [searchFilter, setSearchFilter] = useState("");

    const isPostUpload = csvData?.some((row) => "STATUS" in row) ?? false;

    const columns = createBulkUploadColumns(csvErrors, headers, isPostUpload);

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
        const end = start + ITEMS_PER_PAGE;
        return {
            content: filteredData.slice(start, end),
            page_no: page,
            page_size: ITEMS_PER_PAGE,
            total_elements: filteredData.length,
            total_pages: Math.ceil(filteredData.length / ITEMS_PER_PAGE),
            last: end >= filteredData.length,
        };
    }, [filteredData, page]);

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

    const downloadValidData = () => {
        if (!csvData) return;

        const validData = csvData.filter(
            (_, index) => !csvErrors.some((error) => error.path[0] === index),
        );

        createAndDownloadCsv(validData, "VALID_DATA.csv");
    };

    const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);

    return (
        <div className="no-scrollbar flex flex-col gap-6 px-6">
            <div className="no-scrollbar flex items-center justify-between">
                <StudentSearchBox
                    searchInput={searchInput}
                    searchFilter={searchFilter}
                    onSearchChange={handleSearchChange}
                    onSearchEnter={handleSearchEnter}
                    onClearSearch={handleClearSearch}
                />
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

            <div className="no-scrollbar">
                <div className="no-scrollbar">
                    {" "}
                    {/* Minimum width to ensure horizontal scroll */}
                    <MyTable<SchemaFields>
                        data={paginatedData}
                        columns={columns}
                        isLoading={false}
                        error={null}
                        columnWidths={{
                            status: "w-[100px]", // Changed to fixed widths
                            error: "w-[200px]",
                            ...headers.reduce(
                                (acc, header) => ({
                                    ...acc,
                                    [header.column_name]: "w-[180px]",
                                }),
                                {},
                            ),
                        }}
                        currentPage={page}
                    />
                </div>
            </div>

            <MyPagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={(newPage) => setPage(newPage - 1)}
            />
        </div>
    );
}
