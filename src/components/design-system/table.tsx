import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { ColumnDef, flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table";
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
    columnWidths?: ColumnWidthConfig;
}

export function MyTable<T>({
    data,
    columns,
    isLoading,
    error,
    onSort,
    columnWidths,
}: MyTableProps<T>) {
    const table = useReactTable({
        data: data?.content || [],
        columns,
        getCoreRowModel: getCoreRowModel(),
        meta: { onSort },
    });

    if (isLoading) return <div>Loading...</div>;
    if (error) return <div>Error loading data</div>;
    if (!data) return null;

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
        </div>
    );
}
