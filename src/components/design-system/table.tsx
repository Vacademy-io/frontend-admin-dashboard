import { useEffect } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    flexRender,
    getCoreRowModel,
    useReactTable,
    RowSelectionState,
    OnChangeFn,
    ColumnDef,
} from "@tanstack/react-table";
import { ChangeBatchDialog } from "./table-components/student-menu-options/change-batch-dialog";
import { ExtendSessionDialog } from "./table-components/student-menu-options/extend-session-dialog";
import { ReRegisterDialog } from "./table-components/student-menu-options/re-register-dialog";
import { TerminateRegistrationDialog } from "./table-components/student-menu-options/terminate-registration-dialog";
import { useDialogStore } from "./utils/useDialogStore";
import { DeleteStudentDialog } from "./table-components/student-menu-options/delete-student-dialog";
import { ColumnWidthConfig } from "./utils/constants/table-layout";

const headerTextCss = "p-3 border-r border-neutral-300";
const cellCommonCss = "p-3";

interface TableData<T> {
    content: T[];
    total_pages: number;
    page_no: number;
    page_size: number;
    total_elements: number;
    last: boolean;
}

interface MyTableProps<T> {
    data: TableData<T> | undefined;
    columns: ColumnDef<T>[];
    isLoading: boolean;
    error: unknown;
    onSort?: (columnId: string, direction: string) => void;
    rowSelection?: RowSelectionState;
    onRowSelectionChange?: OnChangeFn<RowSelectionState>;
    currentPage: number;
    columnWidths?: ColumnWidthConfig;
}

export function MyTable<T>({
    data,
    columns,
    isLoading,
    error,
    onSort,
    columnWidths,
    rowSelection,
    onRowSelectionChange,
}: MyTableProps<T>) {
    const table = useReactTable({
        data: data?.content || [],
        columns,
        getCoreRowModel: getCoreRowModel(),
        meta: { onSort },
        state: {
            rowSelection,
        },
        enableRowSelection: true,
        onRowSelectionChange: (updaterOrValue) => {
            if (typeof updaterOrValue === "function") {
                if (rowSelection) {
                    const newSelection = updaterOrValue(rowSelection);
                    onRowSelectionChange && onRowSelectionChange(newSelection);
                }
            } else {
                onRowSelectionChange && onRowSelectionChange(updaterOrValue);
            }
        },
        autoResetPageIndex: false,
        // Remove autoResetRowSelection as it's not a valid option
    });

    const {
        isChangeBatchOpen,
        isExtendSessionOpen,
        isReRegisterOpen,
        isTerminateRegistrationOpen,
        isDeleteOpen,
        closeAllDialogs,
    } = useDialogStore();

    useEffect(() => {
        console.log("tableData:", data);
    }, [data]);

    if (isLoading) return <div>Loading...</div>;
    if (error) return <div>Error loading data</div>;
    if (!data) return null;

    return (
        <div className="w-full overflow-visible rounded-lg border">
            <div className="max-w-full overflow-visible rounded-lg">
                <Table className="rounded-lg">
                    <TableHeader className="relative bg-primary-200">
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id} className="hover:bg-primary-200">
                                {headerGroup.headers.map((header) => (
                                    <TableHead
                                        key={header.id}
                                        className={`${headerTextCss} overflow-visible bg-primary-100 text-subtitle font-semibold text-neutral-600 ${
                                            columnWidths?.[header.column.id] || ""
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
                        {table.getRowModel().rows.map((row) => (
                            <TableRow key={row.id} className="hover:bg-white">
                                {row.getVisibleCells().map((cell) => (
                                    <TableCell
                                        key={cell.id}
                                        className={`${cellCommonCss} z-10 bg-white text-body font-regular text-neutral-600 ${
                                            columnWidths?.[cell.column.id] || ""
                                        }`}
                                    >
                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
            <ChangeBatchDialog
                trigger={null}
                open={isChangeBatchOpen}
                onOpenChange={(open) => {
                    if (!open) closeAllDialogs();
                }}
            />

            <ExtendSessionDialog
                trigger={null}
                open={isExtendSessionOpen}
                onOpenChange={(open) => {
                    if (!open) closeAllDialogs();
                }}
            />

            <ReRegisterDialog
                trigger={null}
                open={isReRegisterOpen}
                onOpenChange={(open) => {
                    if (!open) closeAllDialogs();
                }}
            />

            <TerminateRegistrationDialog
                trigger={null}
                open={isTerminateRegistrationOpen}
                onOpenChange={(open) => {
                    if (!open) closeAllDialogs();
                }}
            />

            <DeleteStudentDialog
                trigger={null}
                open={isDeleteOpen}
                onOpenChange={(open) => {
                    if (!open) closeAllDialogs();
                }}
            />
        </div>
    );
}
