import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { myColumns } from "./utils/data/table-column-data";
import { useTableData } from "../../hooks/student-list/useTableData";
import { useEffect } from "react";

const headerTextCss = "p-3 border-r border-neutral-300";
const cellCommonCss = "p-3";

const COLUMN_WIDTHS = {
    checkbox: "min-w-[56px] sticky left-0",
    details: "min-w-[80px] sticky left-[52px]",
    studentName: "min-w-[180px] sticky left-[130px]",
    batch: "min-w-[240px]",
    enrollmentNumber: "min-w-[200px]",
    collegeSchool: "min-w-[240px]",
    gender: "min-w-[120px]",
    mobileNumber: "min-w-[180px]",
    emailId: "min-w-[240px]",
    fatherName: "min-w-[180px]",
    motherName: "min-w-[180px]",
    guardianName: "min-w-[180px]",
    guardianNumber: "min-w-[180px]",
    guardianEmail: "min-w-[240px]",
    city: "min-w-[180px]",
    state: "min-w-[180px]",
    sessionExpiry: "min-w-[180px]",
    status: "min-w-[180px]",
    options: "min-w-[56px] sticky right-0",
};

export function MyTable() {
    const tableMutation = useTableData();

    const table = useReactTable({
        data: tableMutation.data?.content || [],
        columns: myColumns,
        getCoreRowModel: getCoreRowModel(),
    });

    useEffect(() => {
        tableMutation
            .mutateAsync({
                queryParams: {
                    pageNo: 0,
                    pageSize: 10,
                },
                body: {
                    session: ["2024-2025"],
                    batches: [],
                    status: [],
                    gender: [],
                    session_expiry: [],
                },
            })
            .catch(console.error);
    }, []);

    if (tableMutation.isPending) return <div>Loading</div>;
    if (tableMutation.isError) return <div>Error: {tableMutation.error.message}</div>;

    return (
        <div className="w-full rounded-lg border">
            <div className="max-w-full overflow-x-auto rounded-lg">
                <Table className="rounded-lg">
                    <TableHeader className="bg-primary-200">
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id} className="hover:bg-primary-200">
                                {headerGroup.headers.map((header) => (
                                    <TableHead
                                        key={header.id}
                                        className={`${headerTextCss} bg-primary-200 text-subtitle font-semibold text-neutral-600 ${
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
                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
