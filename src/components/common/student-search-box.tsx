// components/StudentSearchBox.tsx
import { MyInput } from '@/components/design-system/input';
import { MagnifyingGlass, KeyReturn, XCircle } from '@phosphor-icons/react';
import { StudentSearchBoxProps } from '@/routes/manage-students/students-list/-types/students-list-types';

import { useCompactMode } from '@/hooks/use-compact-mode';
import { cn } from '@/lib/utils';

export const StudentSearchBox = ({
    searchInput,
    searchFilter,
    onSearchChange,
    onSearchEnter,
    onClearSearch,
    placeholder,
}: StudentSearchBoxProps) => {
    const { isCompact } = useCompactMode();
    return (
        <div className="relative">
            <MyInput
                inputType="text"
                input={searchInput}
                onChangeFunction={onSearchChange}
                inputPlaceholder={placeholder || "Search by name, enroll..."}
                className={cn("px-9", isCompact ? "h-8 text-xs placeholder:text-xs" : "")}
            />
            <MagnifyingGlass className={cn("absolute left-3 top-1/4 text-neutral-600", isCompact ? "size-3.5" : "size-[18px]")} />
            <KeyReturn
                weight="fill"
                className={`absolute right-3 top-1/4 size-[18px] cursor-pointer text-primary-500 ${(searchInput.length || (searchFilter.length && !searchInput.length)) &&
                    searchFilter != searchInput
                    ? 'visible'
                    : 'hidden'
                    }`}
                onClick={onSearchEnter}
            />
            <XCircle
                className={cn(
                    "absolute right-3 top-1/4 cursor-pointer text-neutral-400",
                    isCompact ? "size-3.5" : "size-[18px]",
                    searchInput == searchFilter && searchInput != '' ? 'visible' : 'hidden'
                )}
                onClick={onClearSearch}
            />
        </div>
    );
};
