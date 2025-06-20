import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    flexRender,
    getCoreRowModel,
    useReactTable,
    RowSelectionState,
    OnChangeFn,
    ColumnDef,
    VisibilityState,
    ColumnResizeMode,
    ColumnSizingState,
    ColumnPinningState,
} from '@tanstack/react-table';
import { ChangeBatchDialog } from './table-components/student-menu-options/change-batch-dialog';
import { ExtendSessionDialog } from './table-components/student-menu-options/extend-session-dialog';
import { ReRegisterDialog } from './table-components/student-menu-options/re-register-dialog';
import { TerminateRegistrationDialog } from './table-components/student-menu-options/terminate-registration-dialog';
import { useDialogStore } from '../../routes/manage-students/students-list/-hooks/useDialogStore';
import { DeleteStudentDialog } from './table-components/student-menu-options/delete-student-dialog';
import { ColumnWidthConfig } from './utils/constants/table-layout';
import { DashboardLoader } from '../core/dashboard-loader';
import { useState, useCallback } from 'react';

const headerTextCss = 'p-3 border-r border-neutral-300';
const cellCommonCss = 'p-3';

// Resize handle component
const ResizeHandle = ({ header, table }: { header: any; table: any }) => {
    const [isHovered, setIsHovered] = useState(false);
    
    // Safety checks
    if (!header || !table) {
        return null;
    }
    
    // Get resize state safely
    const isResizing = header?.column?.getIsResizing?.() || false;
    const deltaOffset = table?.getState?.()?.columnSizingInfo?.deltaOffset || 0;
    const resizeHandler = header?.getResizeHandler?.();
    
    // Don't render if resize handler is not available or column can't be resized
    if (!resizeHandler || !header?.column?.getCanResize?.()) {
        return null;
    }
    
    return (
        <div
            onMouseDown={resizeHandler}
            onTouchStart={resizeHandler}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className={`
                absolute top-0 right-0 h-full w-2 cursor-col-resize select-none touch-none
                flex items-center justify-center group z-10
                ${isResizing ? 'bg-primary-100/50' : ''}
            `}
            style={{
                transform: isResizing ? `translateX(${deltaOffset}px)` : '',
            }}
        >
            {/* Visual indicator */}
            <div 
                className={`
                    w-0.5 h-4 rounded-full transition-all duration-200 ease-in-out
                    ${isHovered || isResizing
                        ? 'bg-primary-500 scale-y-150 shadow-md' 
                        : 'bg-neutral-300 group-hover:bg-primary-400'
                    }
                `}
            />
            
            {/* Invisible wider hit area for easier dragging */}
            <div className="absolute inset-0 w-4 -left-2" />
        </div>
    );
};

export interface TableData<T> {
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
    scrollable?: boolean;
    className?: string;
    tableState?: { columnVisibility: VisibilityState };
    onCellClick?: (row: T, column: ColumnDef<T>) => void;
    onHeaderClick?: () => void;
    enableColumnResizing?: boolean;
    columnResizeMode?: ColumnResizeMode;
    onColumnSizingChange?: (sizing: any) => void;
    minColumnWidth?: number;
    maxColumnWidth?: number;
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
    scrollable = false,
    className = '',
    tableState,
    onCellClick,
    onHeaderClick,
    enableColumnResizing = true,
    columnResizeMode = 'onChange',
    onColumnSizingChange,
    minColumnWidth = 50,
    maxColumnWidth = 1000,
}: MyTableProps<T>) {
    // State for column resizing
    const [columnSizing, setColumnSizing] = useState<ColumnSizingState>({});
    
    // State for column pinning - pin the first 3 columns by default
    const [columnPinning, setColumnPinning] = useState<ColumnPinningState>({
        left: ['checkbox', 'details', 'full_name']
    });
    
    // Handle column sizing changes
    const handleColumnSizingChange = useCallback((updaterOrValue: any) => {
        const newSizing = typeof updaterOrValue === 'function' 
            ? updaterOrValue(columnSizing) 
            : updaterOrValue;
        
        setColumnSizing(newSizing);
        onColumnSizingChange?.(newSizing);
    }, [columnSizing, onColumnSizingChange]);

    const table = useReactTable({
        data: data?.content || [],
        columns,
        getCoreRowModel: getCoreRowModel(),
        meta: { onSort },
        state: {
            columnVisibility: tableState?.columnVisibility || {},
            rowSelection,
            columnSizing,
            columnPinning,
        },
        enableRowSelection: true,
        enableColumnResizing,
        enableColumnPinning: true,
        columnResizeMode,
        onColumnSizingChange: handleColumnSizingChange,
        defaultColumn: {
            minSize: minColumnWidth,
            maxSize: maxColumnWidth,
        },
        debugTable: false,
        debugHeaders: false,
        debugColumns: false,
        onRowSelectionChange: (updaterOrValue) => {
            if (typeof updaterOrValue === 'function') {
                if (rowSelection) {
                    const newSelection = updaterOrValue(rowSelection);
                    if (onRowSelectionChange) {
                        onRowSelectionChange(newSelection);
                    }
                }
            } else {
                if (onRowSelectionChange) {
                    onRowSelectionChange(updaterOrValue);
                }
            }
        },
        autoResetPageIndex: false,
    });

    const {
        isChangeBatchOpen,
        isExtendSessionOpen,
        isReRegisterOpen,
        isTerminateRegistrationOpen,
        isDeleteOpen,
        closeAllDialogs,
    } = useDialogStore();

    if (isLoading) return <div>Loading...</div>;
    if (error) return <div>Error loading data {JSON.stringify(error)}</div>;
    if (!data) return null;
    if (!table) return <DashboardLoader />;

    return (
        <div
            className={`h-auto w-full ${className}`}
        >
            {/* Resizing indicator */}
            {table?.getState?.()?.columnSizingInfo?.isResizingColumn && (
                <div className="absolute top-0 left-0 w-full h-1 bg-primary-200 z-20">
                    <div className="h-full bg-primary-500 transition-all duration-150 ease-out" />
                </div>
            )}
            
            <div className="relative w-full border rounded-lg">
                <div className="overflow-x-auto overflow-y-auto max-h-[70vh]">
                    <Table 
                        className="w-full" 
                        style={{ 
                            width: table?.getCenterTotalSize?.() || 'auto',
                            minWidth: table?.getCenterTotalSize?.() || '100%'
                        }}
                    >
                    <TableHeader className="sticky top-0 z-30 bg-primary-200 shadow-sm border-b border-neutral-300">
                        {/* Ensure header background is solid to prevent content showing through */}
                        <div className="absolute inset-0 bg-primary-200 -z-10"></div>
                        {table &&
                            table?.getHeaderGroups()?.length > 0 &&
                            table?.getHeaderGroups()?.map((headerGroup) => (
                                <TableRow key={headerGroup.id} className="hover:bg-primary-200">
                                    {/* Left pinned headers */}
                                    {headerGroup.headers
                                        .filter(header => header.column.getIsPinned() === 'left')
                                        .map((header) => (
                                        <TableHead
                                            key={header.id}
                                            className={`${headerTextCss} sticky left-0 z-40 overflow-visible bg-primary-100 text-subtitle font-semibold text-neutral-600 border-r-2 border-primary-300 ${
                                                columnWidths?.[header.column.id] || ''
                                            }`}
                                            style={{
                                                width: header?.getSize?.(),
                                                minWidth: header?.column?.columnDef?.minSize || minColumnWidth,
                                                maxWidth: header?.column?.columnDef?.maxSize || maxColumnWidth,
                                                left: `${header.column.getStart('left')}px`,
                                                position: 'sticky',
                                            }}
                                            onClick={(e) => {
                                                // Prevent click when resizing
                                                if (header?.column?.getIsResizing?.()) {
                                                    e.preventDefault();
                                                    return;
                                                }
                                                if (onHeaderClick) {
                                                    onHeaderClick();
                                                }
                                            }}
                                        >
                                            <div className="flex items-center justify-between h-full">
                                                <div className="flex-1">
                                                    {header.isPlaceholder
                                                        ? null
                                                        : flexRender(
                                                              header.column.columnDef.header,
                                                              header.getContext()
                                                          )}
                                                </div>
                                                {header?.column?.getCanResize?.() && (
                                                    <ResizeHandle header={header} table={table} />
                                                )}
                                            </div>
                                        </TableHead>
                                    ))}
                                    
                                    {/* Regular headers */}
                                    {headerGroup.headers
                                        .filter(header => !header.column.getIsPinned())
                                        .map((header) => (
                                        <TableHead
                                            key={header.id}
                                            className={`${headerTextCss} relative overflow-visible bg-primary-100 text-subtitle font-semibold text-neutral-600 ${
                                                columnWidths?.[header.column.id] || ''
                                            }`}
                                            style={{
                                                width: header?.getSize?.(),
                                                minWidth: header?.column?.columnDef?.minSize || minColumnWidth,
                                                maxWidth: header?.column?.columnDef?.maxSize || maxColumnWidth,
                                                position: 'relative',
                                            }}
                                            onClick={(e) => {
                                                // Prevent click when resizing
                                                if (header?.column?.getIsResizing?.()) {
                                                    e.preventDefault();
                                                    return;
                                                }
                                                if (onHeaderClick) {
                                                    onHeaderClick();
                                                }
                                            }}
                                        >
                                            <div className="flex items-center justify-between h-full">
                                                <div className="flex-1">
                                                    {header.isPlaceholder
                                                        ? null
                                                        : flexRender(
                                                              header.column.columnDef.header,
                                                              header.getContext()
                                                          )}
                                                </div>
                                                {header?.column?.getCanResize?.() && (
                                                    <ResizeHandle header={header} table={table} />
                                                )}
                                            </div>
                                        </TableHead>
                                    ))}
                                </TableRow>
                            ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows.map((row) => (
                            <TableRow key={row.id} className="cursor-pointer hover:bg-white">
                                {/* Left pinned cells */}
                                {row.getLeftVisibleCells().map((cell) => (
                                    <TableCell
                                        key={cell.id}
                                        className={`${cellCommonCss} sticky left-0 z-30 bg-white text-body font-regular text-neutral-600 border-r-2 border-neutral-200 ${
                                            columnWidths?.[cell.column.id] || ''
                                        }`}
                                        style={{
                                            width: cell?.column?.getSize?.(),
                                            minWidth: cell?.column?.columnDef?.minSize || minColumnWidth,
                                            maxWidth: cell?.column?.columnDef?.maxSize || maxColumnWidth,
                                            left: `${cell.column.getStart('left')}px`,
                                            position: 'sticky',
                                        }}
                                        onClick={() => {
                                            if (onCellClick) {
                                                onCellClick(row.original, cell.column.columnDef);
                                            }
                                        }}
                                    >
                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                    </TableCell>
                                ))}
                                
                                {/* Regular cells */}
                                {row.getCenterVisibleCells().map((cell) => (
                                    <TableCell
                                        key={cell.id}
                                        className={`${cellCommonCss} z-10 bg-white text-body font-regular text-neutral-600 ${
                                            columnWidths?.[cell.column.id] || ''
                                        }`}
                                        style={{
                                            width: cell?.column?.getSize?.(),
                                            minWidth: cell?.column?.columnDef?.minSize || minColumnWidth,
                                            maxWidth: cell?.column?.columnDef?.maxSize || maxColumnWidth,
                                        }}
                                        onClick={() => {
                                            if (onCellClick) {
                                                onCellClick(row.original, cell.column.columnDef);
                                            }
                                        }}
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
