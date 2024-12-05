// student-list-section.tsx
import { useState, useEffect } from "react";
import { MyButton } from "@/components/design-system/button";
import { MyInput } from "@/components/design-system/input";
import { Export, MagnifyingGlass } from "@phosphor-icons/react";
import { MyTable } from "@/components/design-system/table/table";
import { MyDropdown } from "@/components/design-system/dropdown";
import { Filters } from "./filters";
import { useNavHeadingStore } from "@/stores/layout-container/useNavHeadingStore";
import { useInstituteQuery } from "@/hooks/student-list/useInstituteDetails";
import { InstituteDetailsType } from "@/schemas/student-list/institute-schema";
import { PageFilters } from "@/types/students/students-list-types";

export const StudentsListSection = () => {
    const { setNavHeading } = useNavHeadingStore();
    const [currentSession, setCurrentSession] = useState<string>("");
    const [columnFilters, setColumnFilters] = useState<{ id: string; value: string[] }[]>([]);
    const [searchInput, setSearchInput] = useState("");
    const [clearFilters, setClearFilters] = useState<boolean>(false);

    const { data: instituteDetails, isError, isLoading } = useInstituteQuery();

    const filter_titles = [
        {
            id: "batch" as keyof PageFilters,
            title: "Batch",
        },
        {
            id: "status" as keyof PageFilters,
            title: "Status",
        },
        {
            id: "gender" as keyof PageFilters,
            title: "Gender",
        },
        {
            id: "session_expiry" as keyof PageFilters,
            title: "Session Expiry",
        },
    ];

    // Function to get batch names by combining level and package names
    const getBatchNames = (selectedSession?: string) => {
        if (!instituteDetails?.batches_for_sessions) return [];

        return instituteDetails.batches_for_sessions
            .filter((batch) => !selectedSession || batch.session.session_name === selectedSession)
            .map((batch) => `${batch.level.level_name} ${batch.package_dto.package_name}`)
            .sort();
    };

    // Function to get available sessions with type safety
    const getSessions = (instituteDetails: InstituteDetailsType | undefined): string[] => {
        return instituteDetails?.sessions?.map((session) => session.session_name) || [];
    };

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

    useEffect(() => {
        setNavHeading("Students");
    }, []);

    useEffect(() => {
        const sessions = getSessions(instituteDetails);
        if (sessions.length > 0) {
            setCurrentSession(sessions[0] || "");
        }
    }, [instituteDetails]);

    useEffect(() => {
        if (columnFilters.length === 0) {
            setClearFilters(false);
        }
    }, [columnFilters]);

    if (isLoading) return <div>Loading...</div>;
    if (isError) return <div>Error loading institute details</div>;
    if (!instituteDetails) return <div>No institute details available</div>;

    const page_filters: PageFilters = {
        session: getSessions(instituteDetails),
        batch: getBatchNames(currentSession),
        status: instituteDetails.student_statuses || [],
        gender: instituteDetails.genders || [],
        session_expiry: ["Above Session Threshold", "Below Session Threshold", "Session Expired"],
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
                            setCurrentValue={(session) => {
                                setCurrentSession(session);
                                setColumnFilters((prev) => prev.filter((f) => f.id !== "batch"));
                            }}
                            dropdownList={page_filters.session || []}
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
                        page_filters[obj.id] ? (
                            <Filters
                                key={key}
                                filterDetails={{
                                    label: obj.title,
                                    filters: page_filters[obj.id] || [],
                                }}
                                onFilterChange={(values) => handleFilterChange(obj.id, values)}
                                clearFilters={clearFilters}
                            />
                        ) : null,
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
