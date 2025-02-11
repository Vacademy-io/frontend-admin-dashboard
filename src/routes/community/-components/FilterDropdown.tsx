import { useState } from "react";
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
// components/session-dropdown.tsx
import { MyDropdown } from "@/components/design-system/dropdown";
import { useSessionDropdown } from "@/hooks/student-list-section/useSessionDropdown";

interface FilterDropdownProps {
    sessionDirection?: string;
    defaultSession?: string;
    onSessionChange?: (session: string) => void;
}

export const FilterDropdown = ({
    sessionDirection,
    defaultSession,
    onSessionChange,
}: FilterDropdownProps) => {
    const { sessionList, currentSession, handleSessionChange } = useSessionDropdown({
        defaultSession,
        onSessionChange,
    });

    return (
        <div className={`flex items-center gap-2 ${sessionDirection}`}>
            <MyDropdown
                currentValue={currentSession}
                dropdownList={sessionList}
                placeholder="Select Session"
                handleChange={handleSessionChange}
            />
        </div>
    );
};

export const SearchableFilterDropdown = () => {
    const [search, setSearch] = useState("");
    const options = [
        { label: "Light", value: "light" },
        { label: "Dark", value: "dark" },
        { label: "System", value: "system" },
    ];

    const filteredOptions = options.filter((option) =>
        option.label.toLowerCase().includes(search.toLowerCase()),
    );

    return (
        <Select>
            <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Theme" />
            </SelectTrigger>
            <SelectContent>
                {/* Search Input */}
                <div className="p-2">
                    <Input
                        placeholder="Search..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full"
                    />
                </div>

                {/* Filtered Options */}
                {filteredOptions.length > 0 ? (
                    filteredOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                            {option.label}
                        </SelectItem>
                    ))
                ) : (
                    <div className="p-2 text-sm text-gray-500">No results found</div>
                )}
            </SelectContent>
        </Select>
    );
};
