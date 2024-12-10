import { useState, useEffect } from "react";
import { MyButton } from "@/components/design-system/button";
import { MyInput } from "@/components/design-system/input";
import { Export, MagnifyingGlass } from "@phosphor-icons/react";
import { MyTable } from "@/components/design-system/table/table";
import { MyDropdown } from "@/components/design-system/dropdown";
import { Filters } from "./filters";
import { useNavHeadingStore } from "@/stores/layout-container/useNavHeadingStore";
import { useInstituteQuery } from "@/services/student-list-section/getInstituteDetails";
import { useFilters, useGetSessions } from "@/hooks/student-list-section/useFilters";

export const StudentsListSection = () => {
    const { setNavHeading } = useNavHeadingStore();
    const { isError, isLoading } = useInstituteQuery();

    const [currentSession, setCurrentSession] = useState<string>("");
    const [columnFilters, setColumnFilters] = useState<{ id: string; value: string[] }[]>([]);
    const [searchInput, setSearchInput] = useState("");
    const [clearFilters, setClearFilters] = useState<boolean>(false);

    const sessions = useGetSessions();
    const filters = useFilters(currentSession);

    // const studentFilters: StudentFilterRequest = {
    //     institute_ids: ["c70f40a5-e4d3-4b6c-a498-e612d0d4b133"],
    //     package_session_ids: ["1"],
    //     // other optional filters...
    // };

    // // // In your component
    // const { data: studentTableData, isLoading: loadingData, error: loadingError} = useStudentList(studentFilters, 0, 10);
    // useEffect(()=>{
    //     console.log(studentTableData)
    // }, [studentTableData])

    useEffect(() => {
        setNavHeading("Students");
    }, []);

    useEffect(() => {
        if (sessions.length > 0 && sessions[0]) {
            setCurrentSession(sessions[0]);
        }
    }, [sessions]);

    useEffect(() => {
        if (columnFilters.length === 0) {
            setClearFilters(false);
        }
    }, [columnFilters.length]);

    const handleFilterChange = (filterId: string, values: string[]) => {
        setColumnFilters((prev) => {
            const existing = prev.filter((f) => f.id !== filterId);
            if (values.length === 0) return existing;
            return [...existing, { id: filterId, value: values }];
        });
    };

    const handleClearFilters = () => {
        setClearFilters(true);
        setColumnFilters([]);
    };

    const handleSessionChange = (session: string | ((prevState: string) => string)) => {
        if (typeof session === "string") {
            setCurrentSession(session);
            setColumnFilters((prev) => prev.filter((f) => f.id !== "batch"));
        }
    };

    if (isLoading) return <div>Loading...</div>;
    if (isError) return <div>Error loading institute details</div>;

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
                            setCurrentValue={handleSessionChange}
                            dropdownList={sessions}
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
