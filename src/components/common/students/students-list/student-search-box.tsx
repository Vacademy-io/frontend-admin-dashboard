// components/StudentSearchBox.tsx
import { MyInput } from "@/components/design-system/input";
import { MagnifyingGlass, KeyReturn, XCircle } from "@phosphor-icons/react";

interface StudentSearchBoxProps {
    searchInput: string;
    searchFilter: string;
    onSearchChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    onSearchEnter: () => void;
    onClearSearch: () => void;
}

export const StudentSearchBox = ({
    searchInput,
    searchFilter,
    onSearchChange,
    onSearchEnter,
    onClearSearch,
}: StudentSearchBoxProps) => (
    <div className="relative">
        <MyInput
            inputType="text"
            input={searchInput}
            onChangeFunction={onSearchChange}
            inputPlaceholder="Search by name, enroll..."
            className="pl-9 pr-9"
        />
        <MagnifyingGlass className="absolute left-3 top-1/4 size-[18px] text-neutral-600" />
        <KeyReturn
            weight="fill"
            className={`absolute right-3 top-1/4 size-[18px] cursor-pointer text-primary-500 ${
                (searchInput.length || (searchFilter.length && !searchInput.length)) &&
                searchFilter != searchInput
                    ? "visible"
                    : "hidden"
            }`}
            onClick={onSearchEnter}
        />
        <XCircle
            className={`absolute right-3 top-1/4 size-[18px] cursor-pointer text-neutral-400 ${
                searchInput == searchFilter && searchInput != "" ? "visible" : "hidden"
            }`}
            onClick={onClearSearch}
        />
    </div>
);
