import { useState, SetStateAction, Dispatch } from "react";
import { MyButton } from "@/components/design-system/button";
import { MyInput } from "@/components/design-system/input";
import { Export, MagnifyingGlass } from "@phosphor-icons/react";
import { MyTable } from "@/components/design-system/table/table";
import { MyDropdown } from "../../../design-system/dropdown";
import { Filters } from "./filters";
import { useNavHeadingStore } from "@/stores/layout-container/useNavHeadingStore";
import { useEffect } from "react";
import { PageFilters } from "@/hooks/student-list/usePageSetup";
import { usePageSetup } from "@/hooks/student-list/usePageSetup";

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
    const { setNavHeading } = useNavHeadingStore();
    const setCurrentSession: Dispatch<SetStateAction<string>> = () => {};
    const [columnFilters, setColumnFilters] = useState<{ id: string; value: string[] }[]>([]);
    const [searchInput, setSearchInput] = useState("");
    const [clearFilters, setClearFilters] = useState<boolean>(false);

    useEffect(() => {
        setNavHeading("Students");
    }, []);

    useEffect(() => {
        if (columnFilters.length == 0) {
            setClearFilters(false);
        }
    }, [JSON.stringify(columnFilters)]);

    const handleClearFilters = () => {
        setClearFilters(true);
    };

    const handleFilterChange = (filterId: string, values: string[]) => {
        setColumnFilters((prev) => {
            const existing = prev.filter((f) => f.id !== filterId);
            if (values.length === 0) return existing;
            return [...existing, { id: filterId, value: values }];
        });
    };

    const { data, isLoading, error } = usePageSetup();
    if (isLoading) return <div>Loading filters...</div>;
    if (error) return <div>Error loading filters...</div>;

    const page_filters = data;

    type FilterTitle = {
        id: keyof PageFilters;
        title: string;
    };
    const filter_titles: FilterTitle[] = [
        {
            id: "batch",
            title: "Batch",
        },
        {
            id: "status",
            title: "Status",
        },
        {
            id: "gender",
            title: "Gender",
        },
        {
            id: "session_expiry",
            title: "Session Expiry",
        },
    ];

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
                            currentValue={"2024-2025"}
                            setCurrentValue={setCurrentSession}
                            dropdownList={page_filters ? page_filters.session : []}
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

                    {filter_titles.map((obj, key) =>
                        page_filters ? (
                            page_filters[obj.id] ? (
                                <Filters
                                    key={key}
                                    filterDetails={{
                                        label: obj.title,
                                        filters: page_filters[obj.id],
                                    }}
                                    onFilterChange={(values) => handleFilterChange(obj.id, values)}
                                    clearFilters={clearFilters}
                                />
                            ) : (
                                <></>
                            )
                        ) : (
                            <></>
                        ),
                    )}
                    <div
                        className={`flex flex-wrap items-center gap-6 ${
                            columnFilters.length ? "visible" : "hidden"
                        }`}
                    >
                        <MyButton
                            buttonType="primary"
                            scale="small"
                            layoutVariant="default"
                            className="h-8 bg-success-500 hover:bg-success-400 active:bg-success-600"
                        >
                            Filter
                        </MyButton>
                        <MyButton
                            buttonType="primary"
                            scale="small"
                            layoutVariant="default"
                            className="h-8 bg-danger-600 hover:bg-danger-400 active:bg-danger-700"
                            onClick={handleClearFilters}
                        >
                            Reset
                        </MyButton>
                    </div>
                </div>
                <MyButton scale="large" buttonType="secondary" layoutVariant="default">
                    <Export />
                    <div>Export</div>
                </MyButton>
            </div>
            <div className="max-w-full">
                <MyTable />
            </div>
        </section>
    );
};
