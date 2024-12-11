import { useState, useEffect } from "react";
import { MyButton } from "@/components/design-system/button";
import { MyInput } from "@/components/design-system/input";
import { Export, MagnifyingGlass, XCircle } from "@phosphor-icons/react";
import { MyTable } from "@/components/design-system/table";
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
import { MyPagination } from "@/components/design-system/pagination";

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
    const [page, setPage] = useState(0);
    const pageSize = 10;
    const [sortColumns, setSortColumns] = useState<Record<string, string>>({});

    const sessions = useGetSessions();
    const filters = useFilters(currentSession);
    const currentPackageSessionIds = usePackageSessionIds(
        currentSession,
        columnFilters.find((filter) => filter.id === "batch")?.value,
    );

    const [appliedFilters, setAppliedFilters] = useState<StudentFilterRequest>({
        name: "",
        institute_ids: [INSTITUTE_ID],
        package_session_ids: currentPackageSessionIds,
        group_ids: [],
        gender: [],
        statuses: [],
        sort_columns: {},
    });

    const {
        data: studentTableData,
        isLoading: loadingData,
        error: loadingError,
        refetch,
    } = useStudentList(appliedFilters, page, pageSize);

    // Debug logs
    useEffect(() => {
        console.log("Applied Filters:", appliedFilters);
    }, [appliedFilters]);

    useEffect(() => {
        console.log("Table Data:", studentTableData);
    }, [studentTableData]);

    // Initial load
    useEffect(() => {
        const initialLoad = async () => {
            try {
                await refetch();
            } catch (error) {
                console.error("Error fetching initial data:", error);
            }
        };
        initialLoad();
    }, []);

    useEffect(() => {
        setNavHeading("Students");
    }, []);

    useEffect(() => {
        if (columnFilters.length === 0) {
            setClearFilters(false);
        }
    }, [columnFilters.length]);

    useEffect(() => {
        setAppliedFilters((prev) => ({
            ...prev,
            package_session_ids: currentPackageSessionIds,
        }));
    }, [currentSession, currentPackageSessionIds]);

    const handleSearchInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchInput(event.target.value);
    };

    const handleFilterChange = (filterId: string, values: string[]) => {
        setColumnFilters((prev) => {
            const existing = prev.filter((f) => f.id !== filterId);
            if (values.length === 0) return existing;
            return [...existing, { id: filterId, value: values }];
        });
    };

    const handleFilterClick = async () => {
        const newAppliedFilters: StudentFilterRequest = {
            name: searchFilter,
            institute_ids: [INSTITUTE_ID],
            package_session_ids: currentPackageSessionIds,
            group_ids: [],
            gender: columnFilters.find((filter) => filter.id === "gender")?.value || [],
            statuses: columnFilters.find((filter) => filter.id === "statuses")?.value || [],
            sort_columns: sortColumns,
        };

        await setAppliedFilters(newAppliedFilters);
        try {
            await refetch();
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    };

    const handleClearFilters = async () => {
        setClearFilters(true);
        setColumnFilters([]);
        setSearchFilter("");
        setSearchInput("");

        const clearedFilters: StudentFilterRequest = {
            name: "",
            institute_ids: [INSTITUTE_ID],
            package_session_ids: currentPackageSessionIds,
            group_ids: [],
            gender: [],
            statuses: [],
            sort_columns: sortColumns,
        };

        await setAppliedFilters(clearedFilters);
        try {
            await refetch();
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    };

    const handleSessionChange = async (session: string | ((prevState: string) => string)) => {
        if (typeof session === "string") {
            setCurrentSession(session);
            setColumnFilters((prev) => prev.filter((f) => f.id !== "batch"));

            const sessionUpdatedFilters = {
                ...appliedFilters,
                package_session_ids: [], // Initially set empty array
            };

            await setAppliedFilters(sessionUpdatedFilters);
            try {
                await refetch();
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        }
    };

    const handleSearchEnter = async () => {
        const newAppliedFilters = {
            ...appliedFilters,
            name: searchInput,
        };
        setSearchFilter(searchInput);
        await setAppliedFilters(newAppliedFilters);
        try {
            await refetch();
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    };

    const handleClearSearch = async () => {
        const newAppliedFilters = {
            ...appliedFilters,
            name: "",
        };
        setSearchInput("");
        setSearchFilter("");
        await setAppliedFilters(newAppliedFilters);
        try {
            await refetch();
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    };

    const handleSort = async (columnId: string, direction: string) => {
        const newSortColumns = {
            [columnId]: direction,
        };
        setSortColumns(newSortColumns);
        const newAppliedFilters = {
            ...appliedFilters,
            sort_columns: newSortColumns,
        };
        await setAppliedFilters(newAppliedFilters);
        try {
            await refetch();
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    };

    const handlePageChange = async (newPage: number) => {
        setPage(newPage);
        try {
            await refetch();
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    };

    if (isLoading) return <div>Loading...</div>;
    if (isError) return <div>Error loading institute details</div>;

    return (
        <section className="flex max-w-full flex-col gap-8 overflow-visible">
            <div className="flex flex-col gap-5">
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
                                handleChange={handleSessionChange}
                                dropdownList={sessions}
                            />
                        </div>

                        <div className="relative">
                            <MyInput
                                inputType="text"
                                input={searchInput}
                                onChangeFunction={handleSearchInputChange}
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
                <MyPagination
                    currentPage={page}
                    totalPages={studentTableData?.total_pages || 1}
                    onPageChange={handlePageChange}
                />
            </div>
        </section>
    );
};
