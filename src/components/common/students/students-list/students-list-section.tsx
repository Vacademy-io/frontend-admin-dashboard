import { useState } from "react";
import { MyButton } from "@/components/design-system/button";
import { MyInput } from "@/components/design-system/input";
import { Export, MagnifyingGlass } from "@phosphor-icons/react";
import { MyTable } from "@/components/design-system/table";
import { MyDropdown } from "./dropdown";
import { Filters } from "./filters";
import { useNavHeadingStore } from "@/stores/layout-container/useNavHeadingStore";
import { useEffect } from "react";
import { filters } from "@/components/design-system/utils/hooks/dummy/useTable";
import { sessionlist } from "@/components/design-system/utils/hooks/dummy/useTable";

export const getSessionExpiryStatus = (expiryDate: string) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const threshold = new Date();
    threshold.setMonth(threshold.getMonth() + 1); // 1 month threshold

    if (expiry < today) return "Session Expired";
    if (expiry <= threshold) return "Below Session Threshold";
    return "Above Session Threshold";
};

export type SessionExpiryStatus =
    | "Session Expired"
    | "Below Session Threshold"
    | "Above Session Threshold";

export const StudentsListSection = () => {
    /*An API which will return a list containing all the sessions and their respected students data or 2 apis for both the operations*/

    const { setNavHeading } = useNavHeadingStore();

    const [currentSession, setCurrentSession] = useState<string>("2024-2025");
    const [columnFilters, setColumnFilters] = useState<{ id: string; value: string[] }[]>([]);
    const [searchInput, setSearchInput] = useState("");

    useEffect(() => {
        setNavHeading("Students");
    }, []);

    const handleFilterChange = (filterId: string, values: string[]) => {
        setColumnFilters((prev) => {
            const existing = prev.filter((f) => f.id !== filterId);
            if (values.length === 0) return existing;
            return [...existing, { id: filterId, value: values }];
        });
    };

    return (
        <section className="flex max-w-full flex-col gap-8">
            <div className="flex items-center justify-between">
                <div className="text-h3 font-semibold">Students List</div>
                <MyButton scale="large" buttonType="primary" layoutVariant="default">
                    Enroll Student
                </MyButton>
            </div>
            <div className="flex items-start justify-between">
                <div className="flex flex-wrap items-center gap-6 gap-y-4">
                    <div className="flex items-center gap-2">
                        <div className="text-title">Session</div>
                        <MyDropdown
                            currentValue={currentSession}
                            setCurrentValue={setCurrentSession}
                            dropdownList={sessionlist}
                        />
                    </div>

                    <div className="relative">
                        <MyInput
                            inputType="text"
                            input={searchInput}
                            setInput={setSearchInput}
                            inputPlaceholder="Search by name, enrollment ..."
                            className="pl-9"
                        />
                        <MagnifyingGlass className="absolute left-3 top-1/4 size-[18px] text-neutral-600" />
                    </div>

                    {filters.map((obj, ind) => (
                        <Filters
                            filterDetails={obj}
                            key={ind}
                            onFilterChange={(values) => handleFilterChange(obj.id, values)}
                        />
                    ))}
                </div>
                <MyButton scale="large" buttonType="secondary" layoutVariant="default">
                    <Export />
                    <div>Export</div>
                </MyButton>
            </div>
            <div className="max-w-full">
                <MyTable columnFilters={columnFilters} searchValue={searchInput} />
            </div>
        </section>
    );
};
