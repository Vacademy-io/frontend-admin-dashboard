// editable-bulk-upload-table.tsx
import React, { useState, useMemo } from "react";
import { type Header } from "@/schemas/student/student-bulk-enroll/csv-bulk-init";
import { useBulkUploadStore } from "@/stores/students/enroll-students-bulk/useBulkUploadStore";
import { StudentSearchBox } from "../../student-search-box";
import { MyPagination } from "@/components/design-system/pagination";
import { MyButton } from "@/components/design-system/button";
import {
    convertExcelDateToDesiredFormat,
    createAndDownloadCsv,
    isValidDateFormat,
} from "./utils/csv-utils";
import { MyTable } from "@/components/design-system/table";
import { SchemaFields, ValidationError } from "@/types/students/bulk-upload-types";
import { Row } from "@tanstack/react-table";
import { createEditableBulkUploadColumns } from "./bulk-upload-columns";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface EditableBulkUploadTableProps {
    headers: Header[];
    onEdit?: (rowIndex: number, columnId: string, value: string) => void;
    statusColumnRenderer?: (props: { row: Row<SchemaFields> }) => JSX.Element;
}

interface RowWithError extends SchemaFields {
    ERROR: string;
}

const ITEMS_PER_PAGE = 10;

/**
 * Validate a single cell value based on header definition
 */
export const validateCellValue = (
    value: string,
    header: Header,
    rowIndex: number,
): ValidationError | null => {
    const fieldName = header.column_name;

    // Skip validation if the field is optional and empty
    if (header.optional && (!value || value.trim() === "")) {
        return null;
    }

    // Check if required field is missing
    if (!header.optional && (!value || value.trim() === "")) {
        return {
            path: [rowIndex, fieldName],
            message: `${fieldName.replace(/_/g, " ")} is required`,
            resolution: `Please provide a value for ${fieldName.replace(/_/g, " ")}`,
            currentVal: "N/A",
            format: "",
        };
    }

    // If field has a value, validate according to type
    if (value) {
        // Enum validation
        if (header.type === "enum" && header.options && header.options.length > 0) {
            if (!header.options.includes(value)) {
                return {
                    path: [rowIndex, fieldName],
                    message: `Invalid value for ${fieldName.replace(/_/g, " ")}`,
                    resolution: `Value must be one of: ${header.options.join(", ")}`,
                    currentVal: value,
                    format: header.options.join(", "),
                };
            }
        }

        // Date validation
        if (header.type === "date" && header.format) {
            const formattedDate = convertExcelDateToDesiredFormat(value, header.format);

            if (!isValidDateFormat(formattedDate, header.format)) {
                return {
                    path: [rowIndex, fieldName],
                    message: `Invalid date format for ${fieldName.replace(/_/g, " ")}`,
                    resolution: `Date must be in format: ${header.format}`,
                    currentVal: value,
                    format: header.format,
                };
            }
        }

        // Regex validation
        if (header.regex) {
            try {
                const regex = new RegExp(header.regex);
                if (!regex.test(value)) {
                    return {
                        path: [rowIndex, fieldName],
                        message:
                            header.regex_error_message ||
                            `Invalid format for ${fieldName.replace(/_/g, " ")}`,
                        resolution: `Please check the format`,
                        currentVal: value,
                        format: header.regex,
                    };
                }
            } catch (e) {
                console.error(`Invalid regex pattern: ${header.regex}`);
            }
        }
    }

    // No validation errors
    return null;
};

/**
 * Validate a full row of data
 */
export const validateRowData = (
    rowData: SchemaFields,
    headers: Header[],
    rowIndex: number,
): ValidationError[] => {
    const errors: ValidationError[] = [];

    // Validate each field according to its header
    headers.forEach((header) => {
        const fieldName = header.column_name;

        // Skip non-data columns like STATUS, ERROR, etc.
        if (["STATUS", "ERROR", "STATUS_MESSAGE"].includes(fieldName)) {
            return;
        }

        const value = rowData[fieldName] as string;
        const error = validateCellValue(value, header, rowIndex);

        if (error) {
            errors.push(error);
        }
    });

    return errors;
};

/**
 * Revalidate all data in the CSV
 */
export const revalidateAllData = (data: SchemaFields[], headers: Header[]): ValidationError[] => {
    let allErrors: ValidationError[] = [];

    // Validate each row
    data.forEach((row, rowIndex) => {
        const rowErrors = validateRowData(row, headers, rowIndex);
        allErrors = [...allErrors, ...rowErrors];
    });

    return allErrors;
};

/**
 * Check if a response row has errors
 */
export const hasErrors = (row: SchemaFields): boolean => {
    return row.STATUS === "false" || !!row.ERROR;
};

/**
 * Get upload statistics from response data
 */
export const getUploadStats = (responseData: SchemaFields[]) => {
    if (!responseData || responseData.length === 0) {
        return { successful: 0, failed: 0, total: 0 };
    }

    let successful = 0;
    let failed = 0;

    responseData.forEach((row) => {
        if (row.STATUS === "true") {
            successful++;
        } else {
            failed++;
        }
    });

    return {
        successful,
        failed,
        total: responseData.length,
    };
};

export function EditableBulkUploadTable({
    headers,
    onEdit,
    statusColumnRenderer,
}: EditableBulkUploadTableProps) {
    const { csvData, csvErrors, setIsEditing, isEditing, setCsvData } = useBulkUploadStore();
    const [page, setPage] = useState(0);
    const [searchInput, setSearchInput] = useState("");
    const [searchFilter, setSearchFilter] = useState("");
    const [editCell, setEditCell] = useState<{ rowIndex: number; columnId: string } | null>(null);
    const { setCsvErrors } = useBulkUploadStore();

    const handleCellEdit = (rowIndex: number, columnId: string, value: string) => {
        if (!csvData) return;

        // Create a new data array with the updated value
        const newData = [...csvData];
        newData[rowIndex] = { ...newData[rowIndex], [columnId]: value };

        // Update the data
        setCsvData(newData);

        // Find the header for this column to use in validation
        const header = headers.find((h) => h.column_name === columnId);
        if (header) {
            // Remove old errors for this specific cell
            const updatedErrors = csvErrors.filter(
                (error) => !(error.path[0] === rowIndex && error.path[1] === columnId),
            );

            // Validate the new value
            const cellError = validateCellValue(value, header, rowIndex);

            // Set updated errors
            setCsvErrors(cellError ? [...updatedErrors, cellError] : updatedErrors);
        }

        // Call external edit handler if provided
        if (onEdit) {
            onEdit(rowIndex, columnId, value);
        }

        setEditCell(null);
    };

    const columns = useMemo(() => {
        return createEditableBulkUploadColumns({
            csvErrors,
            headers,
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
    }, [csvErrors, headers, statusColumnRenderer, isEditing, editCell, csvData]);

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

    return paginatedData.content.length == 0 ? (
        <p className="w-full text-center text-subtitle text-primary-500">No uploaded data found!</p>
    ) : (
        <div className="no-scrollbar flex flex-col gap-6 px-6">
            <div className="no-scrollbar flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <StudentSearchBox
                        searchInput={searchInput}
                        searchFilter={searchFilter}
                        onSearchChange={handleSearchChange}
                        onSearchEnter={handleSearchEnter}
                        onClearSearch={handleClearSearch}
                    />
                    <div className="sticky top-0 flex items-center gap-2">
                        <Switch
                            checked={isEditing}
                            onCheckedChange={toggleEditing}
                            id="edit-mode"
                        />
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
