// editable-bulk-upload-table.tsx
import React, { useState, useMemo, useEffect } from "react";
import { type Header } from "@/schemas/student/student-bulk-enroll/csv-bulk-init";
import { useBulkUploadStore } from "@/stores/students/enroll-students-bulk/useBulkUploadStore";
import { StudentSearchBox } from "../../student-search-box";
import { MyPagination } from "@/components/design-system/pagination";
import { MyButton } from "@/components/design-system/button";
import { createAndDownloadCsv } from "./utils/csv-utils";
import { MyTable } from "@/components/design-system/table";
import { SchemaFields } from "@/types/students/bulk-upload-types";
import { Row } from "@tanstack/react-table";
import { createEditableBulkUploadColumns } from "./bulk-upload-columns";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { validateRowData, revalidateAllData } from "./utils/cell-validation-utils";

interface EditableBulkUploadTableProps {
    headers: Header[];
    onEdit?: (rowIndex: number, columnId: string, value: string) => void;
    statusColumnRenderer?: (props: { row: Row<SchemaFields> }) => JSX.Element;
}

interface RowWithError extends SchemaFields {
    ERROR: string;
}

const ITEMS_PER_PAGE = 10;

export function EditableBulkUploadTable({
    headers,
    onEdit,
    statusColumnRenderer,
}: EditableBulkUploadTableProps) {
    const { csvData, csvErrors, setIsEditing, isEditing, setCsvData, setCsvErrors } =
        useBulkUploadStore();
    const [page, setPage] = useState(0);
    const [searchInput, setSearchInput] = useState("");
    const [searchFilter, setSearchFilter] = useState("");
    const [editCell, setEditCell] = useState<{ rowIndex: number; columnId: string } | null>(null);

    // Add status header if it doesn't exist in the headers
    const enhancedHeaders = useMemo(() => {
        const hasStatusHeader = headers.some((h) => h.column_name === "STATUS");
        if (!hasStatusHeader) {
            return [
                {
                    column_name: "STATUS",
                    type: "status",
                    optional: true,
                    order: -1,
                    options: null,
                    send_option_id: null,
                    option_ids: null,
                    format: null,
                    regex: null,
                    regex_error_message: null,
                    sample_values: [],
                } as Header,
                ...headers,
            ];
        }
        return headers;
    }, [headers]);

    const handleCellEdit = (rowIndex: number, columnId: string, value: string) => {
        if (!csvData) return;

        // Create a new data array with the updated value
        const newData = [...csvData];

        // Ensure the row exists before updating
        if (rowIndex >= 0 && rowIndex < newData.length) {
            newData[rowIndex] = {
                ...newData[rowIndex],
                [columnId]: value,
            };

            // Update the data
            setCsvData(newData);

            // Revalidate the edited row to update errors
            const header = headers.find((h) => h.column_name === columnId);
            if (header) {
                // Get all errors except for the ones for the edited cell
                const otherErrors = csvErrors.filter(
                    (error) => !(error.path[0] === rowIndex && error.path[1] === columnId),
                );

                // Validate the updated row
                const rowData = newData[rowIndex];
                // Make sure rowData is defined before validation
                if (rowData) {
                    const newRowErrors = validateRowData(rowData, headers, rowIndex);
                    // Combine errors
                    setCsvErrors([...otherErrors, ...newRowErrors]);
                }
            }

            // Call external edit handler if provided
            if (onEdit) {
                onEdit(rowIndex, columnId, value);
            }
        }

        // Reset edit cell state
        setEditCell(null);
    };

    // Revalidate all data when editing is enabled/disabled
    useEffect(() => {
        if (csvData && headers.length > 0) {
            const allErrors = revalidateAllData(csvData, headers);
            setCsvErrors(allErrors);
        }
    }, [isEditing]);

    const columns = useMemo(() => {
        return createEditableBulkUploadColumns({
            csvErrors,
            headers: enhancedHeaders,
            isPostUpload: false,
            statusColumnRenderer,
            isEditing,
            onCellClick: (rowIndex, columnId) => {
                if (isEditing) {
                    setEditCell({ rowIndex, columnId });
                }
            },
            editCell,
            handleCellEdit,
        });
    }, [csvErrors, enhancedHeaders, statusColumnRenderer, isEditing, editCell, csvData]);

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

    const toggleEditing = (value: boolean) => {
        setIsEditing(value);
        setEditCell(null); // Reset any active edit cell when toggling
    };

    return (
        <div className="no-scrollbar flex flex-col gap-6 px-6">
            <div className="mb-4 flex flex-col gap-2">
                <div className="flex items-center space-x-2">
                    <Switch checked={isEditing} onCheckedChange={toggleEditing} id="edit-mode" />
                    <Label htmlFor="edit-mode" className="font-medium text-neutral-900">
                        Enable Editing Mode
                    </Label>
                </div>
                {isEditing && (
                    <div className="ml-6 text-sm text-neutral-600">
                        Double click on cell to edit
                    </div>
                )}
            </div>

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
                    <MyTable<SchemaFields>
                        data={paginatedData}
                        columns={columns}
                        isLoading={false}
                        error={null}
                        columnWidths={{
                            STATUS: "w-[100px]",
                            status: "w-[100px]",
                            error: "w-[200px]",
                            ...enhancedHeaders.reduce(
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
