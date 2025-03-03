import React, { useMemo } from "react";
import { SchemaFields } from "@/types/students/bulk-upload-types";
import { CheckCircle, X, Warning } from "@phosphor-icons/react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { MyButton } from "@/components/design-system/button";
import { MyTable } from "@/components/design-system/table";
import { ColumnDef } from "@tanstack/react-table";

interface UploadResultsTableProps {
    data: SchemaFields[];
    onViewError?: (rowIndex: number) => void;
    onClose?: () => void;
    onDownloadResponse?: () => void;
}

export const UploadResultsTable = ({
    data,
    onViewError,
    onClose,
    onDownloadResponse,
}: UploadResultsTableProps) => {
    // Calculate upload stats
    const successCount = data.filter((row) => row.STATUS === "true").length;
    const failedCount = data.filter((row) => row.STATUS !== "true").length;

    // Get all unique columns from data
    const getDisplayColumns = () => {
        const excludeColumns = ["STATUS_MESSAGE", "ERROR"];
        const allColumns = new Set<string>();

        data.forEach((row) => {
            Object.keys(row).forEach((key) => {
                if (!excludeColumns.includes(key)) {
                    allColumns.add(key);
                }
            });
        });

        // Ensure essential columns appear first
        const essentialColumns = [
            "FULL_NAME",
            "USERNAME",
            "ENROLLMENT_NUMBER",
            "MOBILE_NUMBER",
            "EMAIL",
            "INSTITUTE_ID",
            "STATUS",
        ];

        const displayColumns = [...essentialColumns];

        // Add any other columns that weren't in essential columns
        [...allColumns].forEach((col) => {
            if (!displayColumns.includes(col)) {
                displayColumns.push(col);
            }
        });

        return displayColumns;
    };

    const displayColumns = getDisplayColumns();

    // Get abbreviated error message (first line or first 100 chars)
    const getAbbreviatedError = (error: string): string => {
        if (!error) return "";
        const firstLine = error.split("\n")[0];
        if (firstLine)
            return firstLine.length > 100 ? firstLine.substring(0, 97) + "..." : firstLine;
        return "";
    };

    // Create columns definition for the table
    const columns = useMemo<ColumnDef<SchemaFields>[]>(() => {
        const tableColumns: ColumnDef<SchemaFields>[] = [];

        // Add all data columns
        displayColumns.forEach((column) => {
            tableColumns.push({
                accessorKey: column,
                header: column.replace(/_/g, " "),
                cell: ({ row }) => {
                    const value = row.original[column];

                    if (column === "STATUS") {
                        return (
                            <div className="flex justify-center">
                                {row.original.STATUS === "true" ? (
                                    <CheckCircle
                                        className="h-6 w-6 text-success-500"
                                        weight="fill"
                                    />
                                ) : (
                                    <X className="h-6 w-6 text-danger-500" weight="bold" />
                                )}
                            </div>
                        );
                    }

                    return (
                        <div className="max-w-[180px] overflow-hidden overflow-ellipsis whitespace-nowrap">
                            {value?.toString() || ""}
                        </div>
                    );
                },
            });
        });

        // Add ERROR column
        tableColumns.push({
            id: "ERROR",
            header: "ERROR",
            cell: ({ row }) => {
                const error = row.original.ERROR;

                if (!error) {
                    return <span className="text-success-500">No errors</span>;
                }

                return (
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <div className="flex items-center text-danger-500">
                                    <span className="max-w-[200px] overflow-hidden overflow-ellipsis whitespace-nowrap">
                                        {getAbbreviatedError(error as string)}
                                    </span>
                                    {onViewError && (
                                        <MyButton
                                            buttonType="text"
                                            scale="small"
                                            layoutVariant="default"
                                            className="ml-2 text-danger-500"
                                            onClick={() => onViewError(row.index)}
                                        >
                                            View
                                        </MyButton>
                                    )}
                                </div>
                            </TooltipTrigger>
                            <TooltipContent className="max-w-md whitespace-pre-wrap p-3">
                                <p className="text-sm font-medium text-danger-700">
                                    Error Details:
                                </p>
                                <p className="text-xs text-neutral-600">{error}</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                );
            },
        });

        return tableColumns;
    }, [displayColumns, onViewError]);

    // Create column widths config for the table
    const columnWidths = useMemo(() => {
        const widths: Record<string, string> = {
            STATUS: "w-[100px]",
            ERROR: "w-[200px]",
        };

        // Set standard width for other columns
        displayColumns.forEach((column) => {
            if (column !== "STATUS") {
                widths[column] = "w-[180px]";
            }
        });

        return widths;
    }, [displayColumns]);

    // Create table data in the format expected by MyTable
    const tableData = useMemo(() => {
        return {
            content: data,
            page_no: 0,
            page_size: data.length,
            total_elements: data.length,
            total_pages: 1,
            last: true,
        };
    }, [data]);

    return (
        <div className="flex h-full flex-col">
            <div className="flex items-center justify-between bg-primary-50 px-6 py-4 text-h3 font-semibold text-primary-500">
                <span>Upload Results</span>
                {onDownloadResponse && (
                    <MyButton
                        buttonType="secondary"
                        scale="small"
                        layoutVariant="default"
                        onClick={onDownloadResponse}
                    >
                        Download Response
                    </MyButton>
                )}
            </div>

            <div
                className={`mx-6 mt-4 rounded-md p-4 ${
                    failedCount > 0 ? "bg-warning-50" : "bg-success-50"
                }`}
            >
                <div className="flex items-center">
                    {failedCount > 0 ? (
                        <Warning className="h-5 w-5 text-warning-500" />
                    ) : (
                        <CheckCircle className="h-5 w-5 text-success-500" weight="fill" />
                    )}
                    <h3
                        className={`ml-2 text-lg font-medium ${
                            failedCount > 0 ? "text-warning-700" : "text-success-700"
                        }`}
                    >
                        Upload Summary: {successCount} successful, {failedCount} failed
                    </h3>
                </div>
                {failedCount > 0 && (
                    <p className="mt-2 text-sm text-warning-700">
                        Some entries were not uploaded successfully. Please check the ERROR column
                        for details.
                    </p>
                )}
            </div>

            <div className="flex-grow px-6 pb-0 pt-6">
                <div className="no-scrollbar">
                    <div className="no-scrollbar">
                        <MyTable<SchemaFields>
                            data={tableData}
                            columns={columns}
                            isLoading={false}
                            error={null}
                            columnWidths={columnWidths}
                            currentPage={0}
                        />
                    </div>
                </div>
            </div>

            <div className="flex justify-end border-t p-6">
                <MyButton
                    buttonType="primary"
                    scale="large"
                    layoutVariant="default"
                    onClick={onClose}
                >
                    Close
                </MyButton>
            </div>
        </div>
    );
};
