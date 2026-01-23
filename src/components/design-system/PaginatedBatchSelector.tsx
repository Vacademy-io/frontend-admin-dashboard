/**
 * PaginatedBatchSelector - A batch/package selector with proper pagination
 *
 * Features:
 * - Loads batches in pages of 20
 * - "Load More" button at bottom of list
 * - Search/filter support
 * - Single and multi-select modes
 * - Shows loading states appropriately
 */

import React, { useState, useMemo, useCallback } from 'react';
import { useInfiniteBatches, useBatchesByIds, getBatchDisplayName } from '@/services/paginated-batches';
import type { PaginatedBatch } from '@/services/paginated-batches/paginated-batches-service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import { MagnifyingGlass, CircleNotch, CaretDown, X, Check } from '@phosphor-icons/react';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export interface PaginatedBatchSelectorProps {
    /** Currently selected batch IDs */
    selectedIds: string[];
    /** Called when selection changes */
    onChange: (ids: string[]) => void;
    /** Allow multiple selection */
    multiSelect?: boolean;
    /** Placeholder text */
    placeholder?: string;
    /** Additional class names */
    className?: string;
    /** Number of batches per page */
    pageSize?: number;
    /** Filter by session ID */
    sessionId?: string;
    /** Filter by level ID */
    levelId?: string;
    /** Filter by package ID */
    packageId?: string;
    /** Display format */
    displayFormat?: 'full' | 'compact';
    /** Disabled state */
    disabled?: boolean;
}

const PAGE_SIZE = 20;

export function PaginatedBatchSelector({
    selectedIds,
    onChange,
    multiSelect = false,
    placeholder = 'Select batch...',
    className,
    pageSize = PAGE_SIZE,
    sessionId,
    levelId,
    packageId,
    displayFormat = 'compact',
    disabled = false,
}: PaginatedBatchSelectorProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    // Fetch batches with infinite loading
    const {
        batches,
        isLoading,
        isLoadingMore,
        hasNextPage,
        loadMore,
        totalElements,
    } = useInfiniteBatches({
        size: pageSize,
        search: searchTerm || undefined,
        sessionId,
        levelId,
        packageId,
    });

    // Fetch details for selected IDs (for display)
    const { data: selectedBatchesData } = useBatchesByIds(selectedIds, undefined, {
        enabled: selectedIds.length > 0,
    });

    const selectedBatches = selectedBatchesData?.content ?? [];

    // Handle batch selection
    const handleToggleBatch = useCallback(
        (batch: PaginatedBatch) => {
            if (multiSelect) {
                const isSelected = selectedIds.includes(batch.id);
                if (isSelected) {
                    onChange(selectedIds.filter((id) => id !== batch.id));
                } else {
                    onChange([...selectedIds, batch.id]);
                }
            } else {
                onChange([batch.id]);
                setIsOpen(false);
            }
        },
        [multiSelect, selectedIds, onChange]
    );

    // Remove a selected batch
    const handleRemoveBatch = useCallback(
        (batchId: string) => {
            onChange(selectedIds.filter((id) => id !== batchId));
        },
        [selectedIds, onChange]
    );

    // Clear all selections
    const handleClearAll = useCallback(() => {
        onChange([]);
    }, [onChange]);

    // Display text for trigger button
    const displayText = useMemo(() => {
        if (selectedIds.length === 0) {
            return placeholder;
        }
        if (selectedIds.length === 1 && selectedBatches.length === 1) {
            return getBatchDisplayName(selectedBatches[0], displayFormat);
        }
        return `${selectedIds.length} selected`;
    }, [selectedIds, selectedBatches, placeholder, displayFormat]);

    return (
        <div className={cn('relative', className)}>
            <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
                <DropdownMenuTrigger asChild disabled={disabled}>
                    <Button
                        variant="outline"
                        className={cn(
                            'w-full justify-between font-normal',
                            selectedIds.length === 0 && 'text-muted-foreground'
                        )}
                    >
                        <span className="truncate">{displayText}</span>
                        <CaretDown
                            className={cn(
                                'ml-2 h-4 w-4 shrink-0 opacity-50 transition-transform',
                                isOpen && 'rotate-180'
                            )}
                        />
                    </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent
                    className="w-[var(--radix-dropdown-menu-trigger-width)] p-0"
                    align="start"
                >
                    {/* Search Input */}
                    <div className="border-b p-2">
                        <div className="relative">
                            <MagnifyingGlass className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search batches..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-8"
                            />
                        </div>
                    </div>

                    {/* Batch List */}
                    <ScrollArea className="max-h-[300px]">
                        {isLoading ? (
                            <div className="flex items-center justify-center py-8">
                                <CircleNotch className="h-6 w-6 animate-spin text-primary" />
                            </div>
                        ) : batches.length === 0 ? (
                            <div className="py-8 text-center text-sm text-muted-foreground">
                                {searchTerm ? 'No batches found' : 'No batches available'}
                            </div>
                        ) : (
                            <div className="p-1">
                                {batches.map((batch) => {
                                    const isSelected = selectedIds.includes(batch.id);
                                    return (
                                        <div
                                            key={batch.id}
                                            className={cn(
                                                'flex cursor-pointer items-center gap-2 rounded px-2 py-2 hover:bg-accent',
                                                isSelected && 'bg-accent/50'
                                            )}
                                            onClick={() => handleToggleBatch(batch)}
                                        >
                                            {multiSelect ? (
                                                <Checkbox
                                                    checked={isSelected}
                                                    className="pointer-events-none"
                                                />
                                            ) : (
                                                <div className="w-4">
                                                    {isSelected && (
                                                        <Check className="h-4 w-4 text-primary" />
                                                    )}
                                                </div>
                                            )}
                                            <div className="flex-1 truncate">
                                                <div className="text-sm font-medium">
                                                    {batch.package_dto?.package_name || 'Unknown'}
                                                </div>
                                                <div className="text-xs text-muted-foreground">
                                                    {batch.level?.level_name !== 'DEFAULT' &&
                                                        batch.level?.level_name}
                                                    {batch.level?.level_name !== 'DEFAULT' &&
                                                        batch.session?.session_name !== 'DEFAULT' &&
                                                        ' • '}
                                                    {batch.session?.session_name !== 'DEFAULT' &&
                                                        batch.session?.session_name}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}

                                {/* Load More Button */}
                                {hasNextPage && (
                                    <div className="border-t p-2">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="w-full"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                loadMore();
                                            }}
                                            disabled={isLoadingMore}
                                        >
                                            {isLoadingMore ? (
                                                <>
                                                    <CircleNotch className="mr-2 h-4 w-4 animate-spin" />
                                                    Loading...
                                                </>
                                            ) : (
                                                <>
                                                    Load More ({batches.length} of {totalElements})
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                )}
                            </div>
                        )}
                    </ScrollArea>

                    {/* Selected Count & Clear */}
                    {multiSelect && selectedIds.length > 0 && (
                        <div className="flex items-center justify-between border-t p-2">
                            <span className="text-sm text-muted-foreground">
                                {selectedIds.length} selected
                            </span>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleClearAll}
                                className="h-7 text-xs"
                            >
                                Clear All
                            </Button>
                        </div>
                    )}
                </DropdownMenuContent>
            </DropdownMenu>

            {/* Selected Chips (for multi-select) */}
            {multiSelect && selectedBatches.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                    {selectedBatches.map((batch) => (
                        <div
                            key={batch.id}
                            className="flex items-center gap-1 rounded-full bg-primary/10 px-2 py-1 text-xs"
                        >
                            <span className="max-w-[150px] truncate">
                                {getBatchDisplayName(batch, 'compact')}
                            </span>
                            <button
                                type="button"
                                onClick={() => handleRemoveBatch(batch.id)}
                                className="ml-1 rounded-full p-0.5 hover:bg-primary/20"
                            >
                                <X className="h-3 w-3" />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default PaginatedBatchSelector;
