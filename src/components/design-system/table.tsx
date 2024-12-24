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
} from "@tanstack/react-table";
import { myColumns } from "./utils/constants/table-column-data";
import { StudentListResponse } from "@/schemas/student/student-list/table-schema";
import { ChangeBatchDialog } from "./table-components/student-menu-options/change-batch-dialog";
import { ExtendSessionDialog } from "./table-components/student-menu-options/extend-session-dialog";
import { ReRegisterDialog } from "./table-components/student-menu-options/re-register-dialog";
import { TerminateRegistrationDialog } from "./table-components/student-menu-options/terminate-registration-dialog";
import { useDialogStore } from "./utils/useDialogStore";
import { DeleteStudentDialog } from "./table-components/student-menu-options/delete-student-dialog";

const headerTextCss = "p-3 border-r border-neutral-300";
const cellCommonCss = "p-3";

const COLUMN_WIDTHS = {
    checkbox: "min-w-[56px] sticky left-0",
    details: "min-w-[80px] sticky left-[52px]",
    full_name: "min-w-[180px] sticky left-[130px]",
    package_session_id: "min-w-[240px]",
    institute_enrollment_id: "min-w-[200px]",
    linked_institute_name: "min-w-[240px]",
    gender: "min-w-[120px]",
    mobile_number: "min-w-[180px]",
    email: "min-w-[240px]",
    father_name: "min-w-[180px]",
    mother_name: "min-w-[180px]",
    guardian_name: "min-w-[180px]",
    parents_mobile_number: "min-w-[180px]",
    parents_email: "min-w-[240px]",
    city: "min-w-[180px]",
    region: "min-w-[180px]",
    session_expiry_days: "min-w-[180px]",
    status: "min-w-[180px]",
    options: "min-w-[56px] sticky right-0",
};

interface MyTableProps {
    data: StudentListResponse | undefined;
    isLoading: boolean;
    error: unknown;
    onSort?: (columnId: string, direction: string) => void;
    rowSelection: RowSelectionState;
    onRowSelectionChange: OnChangeFn<RowSelectionState>;
    currentPage: number;
}

export function MyTable({
    data,
    isLoading,
    error,
    onSort,
    rowSelection,
    onRowSelectionChange,
}: MyTableProps) {
    const table = useReactTable({
        data: data?.content || [],
        columns: myColumns,
        getCoreRowModel: getCoreRowModel(),
        meta: { onSort },
        state: {
            rowSelection,
        },
        enableRowSelection: true,
        onRowSelectionChange: (updaterOrValue) => {
            if (typeof updaterOrValue === "function") {
                const newSelection = updaterOrValue(rowSelection);
                onRowSelectionChange(newSelection);
            } else {
                onRowSelectionChange(updaterOrValue);
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
    if (error) return <div>Error loading students</div>;

    return (
        <>
            <div className="w-full rounded-lg border">
                <div className="max-w-full overflow-visible rounded-lg">
                    <Table className="rounded-lg">
                        <TableHeader className="relative bg-primary-200">
                            {table.getHeaderGroups().map((headerGroup) => (
                                <TableRow key={headerGroup.id} className="hover:bg-primary-200">
                                    {headerGroup.headers.map((header) => (
                                        <TableHead
                                            key={header.id}
                                            className={`${headerTextCss} overflow-visible bg-primary-200 text-subtitle font-semibold text-neutral-600 ${
                                                COLUMN_WIDTHS[
                                                    header.column.id as keyof typeof COLUMN_WIDTHS
                                                ] || ""
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
                                                COLUMN_WIDTHS[
                                                    cell.column.id as keyof typeof COLUMN_WIDTHS
                                                ] || ""
                                            }`}
                                        >
                                            {flexRender(
                                                cell.column.columnDef.cell,
                                                cell.getContext(),
                                            )}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
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
        </>
    );
}
