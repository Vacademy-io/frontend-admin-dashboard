import { useEffect } from "react";
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
import { StudentListResponse } from "@/schemas/student-list/table-schema";

const headerTextCss = "p-3 border-r border-neutral-300";
const cellCommonCss = "p-3";

const COLUMN_WIDTHS = {
    checkbox: "min-w-[56px] sticky left-0",
    details: "min-w-[80px] sticky left-[52px]",
    full_name: "min-w-[180px] sticky left-[130px]",
    batch_id: "min-w-[240px]",
    enrollment_no: "min-w-[200px]",
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
    state: "min-w-[180px]",
    session_expiry: "min-w-[180px]",
    status: "min-w-[180px]",
    options: "min-w-[56px] sticky right-0",
};

interface MyTableProps {
    data: StudentListResponse | undefined;
    isLoading: boolean;
    error: unknown;
    onSort?: (columnId: string, direction: string) => void;
}

export function MyTable({ data, isLoading, error, onSort }: MyTableProps) {
    const table = useReactTable({
        data: data?.content || [],
        columns: myColumns,
        getCoreRowModel: getCoreRowModel(),
        meta: { onSort },
    });

    useEffect(() => {
        console.log("tableData:", data);
    }, [data]);

    if (isLoading) return <div>Loading...</div>;
    if (error) return <div>Error loading students</div>;

    return (
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
