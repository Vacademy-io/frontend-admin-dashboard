import { useState, useEffect } from "react";
import { MyButton } from "@/components/design-system/button";
import { MyInput } from "@/components/design-system/input";
import { Export, MagnifyingGlass, XCircle } from "@phosphor-icons/react";
import { MyTable } from "@/components/design-system/table/table";
import { MyDropdown } from "@/components/design-system/dropdown";
import { Filters } from "./filters";
import { useNavHeadingStore } from "@/stores/layout-container/useNavHeadingStore";
import { useInstituteQuery } from "@/services/student-list-section/getInstituteDetails";
import { useFilters, useGetSessions } from "@/hooks/student-list-section/useFilters";
import { KeyReturn } from "@phosphor-icons/react";
import { StudentFilterRequest } from "@/schemas/student-list/table-schema";
import { useStudentList } from "@/services/student-list-section/getStudentTable";
import { usePackageSessionIds } from "@/hooks/student-list-section/getPackageSessionId";
import { INSTITUTE_ID } from "@/constants/urls";

export const getCurrentSession = (): string => {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    return `${currentYear}-${currentYear + 1}`;
};

export const StudentsListSection = () => {
    const { setNavHeading } = useNavHeadingStore();
    const { isError, isLoading } = useInstituteQuery();

    const [currentSession, setCurrentSession] = useState<string>(getCurrentSession());
    const [columnFilters, setColumnFilters] = useState<{ id: string; value: string[] }[]>([]);
    const [searchInput, setSearchInput] = useState<string>("");
    const [clearFilters, setClearFilters] = useState<boolean>(false);
    const [searchFilter, setSearchFilter] = useState("");
    // const [page, setPage] = useState(0);
    // const [pageSize, setPageSize] = useState(10);
    const page = 0;
    const pageSize = 10;
    const [sortColumns, setSortColumns] = useState<Record<string, string>>({});

    const sessions = useGetSessions();
    const filters = useFilters(currentSession);

    const studentFilters: StudentFilterRequest = {
        name: searchFilter,
        institute_ids: [INSTITUTE_ID],
        package_session_ids: usePackageSessionIds(
            currentSession,
            columnFilters.find((filter) => filter.id === "batch")?.value,
        ),
        group_ids: [],
        gender: columnFilters.find((filter) => filter.id === "gender")?.value || [],
        statuses: columnFilters.find((filter) => filter.id === "statuses")?.value || [],
        sort_columns: sortColumns,
    };

    const {
        data: studentTableData,
        isLoading: loadingData,
        error: loadingError,
        refetch,
    } = useStudentList(studentFilters, page, pageSize);

    // Initial load
    useEffect(() => {
        refetch();
    }, []);

    useEffect(() => {
        setNavHeading("Students");
    }, []);

    useEffect(() => {
        if (columnFilters.length === 0) {
            setClearFilters(false);
        }
        console.log("studentFilters: ", studentFilters);
    }, [columnFilters.length]);

    useEffect(() => {
        console.log(studentTableData);
    }, [studentTableData]);

    const handleFilterChange = (filterId: string, values: string[]) => {
        setColumnFilters((prev) => {
            const existing = prev.filter((f) => f.id !== filterId);
            if (values.length === 0) return existing;
            return [...existing, { id: filterId, value: values }];
        });
    };

    const handleFilterClick = () => {
        setTimeout(() => refetch(), 0);
    };

    const handleClearFilters = () => {
        setClearFilters(true);
        setColumnFilters([]);
        setSearchFilter("");
        setSearchInput("");
        setTimeout(() => refetch(), 0);
    };

    const handleSessionChange = (session: string | ((prevState: string) => string)) => {
        if (typeof session === "string") {
            setCurrentSession(session);
            setColumnFilters((prev) => prev.filter((f) => f.id !== "batch"));
            setTimeout(() => refetch(), 0);
        }
    };

    const handleSearchEnter = () => {
        // if (searchInput.length) {
        setSearchFilter(searchInput);
        setTimeout(() => refetch(), 0);
        // }
    };

    const handleClearSearch = () => {
        setSearchInput("");
        setSearchFilter("");
        setTimeout(() => refetch(), 0);
    };

    const handleSort = (columnId: string, direction: string) => {
        setSortColumns({
            [columnId]: direction,
        });
        setTimeout(() => refetch(), 0);
    };

    // useEffect(()=>{
    //     console.log(studentFilters)
    // }, [columnFilters.length, sortColumns])

    if (isLoading) return <div>Loading...</div>;
    if (isError) return <div>Error loading institute details</div>;

    return (
        <section className="flex max-w-full flex-col gap-8 overflow-visible">
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
                            setCurrentValue={handleSessionChange}
                            dropdownList={sessions}
                        />
                    </div>

                    <div className="relative">
                        <MyInput
                            inputType="text"
                            input={searchInput}
                            setInput={setSearchInput}
                            inputPlaceholder="Search by name, enroll..."
                            className="pl-9 pr-9"
                        />
                        <MagnifyingGlass className="absolute left-3 top-1/4 size-[18px] text-neutral-600" />
                        <KeyReturn
                            weight="fill"
                            className={`absolute right-3 top-1/4 size-[18px] cursor-pointer text-primary-500 ${
                                (searchInput.length ||
                                    (searchFilter.length && !searchInput.length)) &&
                                searchFilter != searchInput
                                    ? "visible"
                                    : "hidden"
                            }`}
                            onClick={handleSearchEnter}
                        />
                        <XCircle
                            className={`absolute right-3 top-1/4 size-[18px] cursor-pointer text-neutral-400 ${
                                searchInput == searchFilter && searchInput != ""
                                    ? "visible"
                                    : "hidden"
                            }`}
                            onClick={handleClearSearch}
                        />
                    </div>

                    {filters.map((filter) => (
                        <Filters
                            key={filter.id}
                            filterDetails={{
                                label: filter.title,
                                filters: filter.filterList,
                            }}
                            onFilterChange={(values) => handleFilterChange(filter.id, values)}
                            clearFilters={clearFilters}
                        />
                    ))}

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
                            onClick={handleFilterClick}
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
                <MyTable
                    data={studentTableData}
                    isLoading={loadingData}
                    error={loadingError}
                    onSort={handleSort}
                />
            </div>
        </section>
    );
};
