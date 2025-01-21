import { Helmet } from "react-helmet";
import { Tabs } from "@/components/ui/tabs";
import { useEffect, useState } from "react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useInstituteQuery } from "@/services/student-list-section/getInstituteDetails";
import { ScheduleTestFilters } from "./ScheduleTestFilters";
import { useFilterDataForAssesment } from "../-utils.ts/useFiltersData";
import { ScheduleTestSearchComponent } from "./ScheduleTestSearchComponent";
import { MyFilterOption } from "@/types/my-filter";
import { ScheduleTestHeaderDescription } from "./ScheduleTestHeaderDescription";
import ScheduleTestTabList from "./ScheduleTestTabList";
import ScheduleTestFilterButtons from "./ScheduleTestFilterButtons";
import { scheduleTestTabsData } from "@/constants/dummy-data";
import { useNavHeadingStore } from "@/stores/layout-container/useNavHeadingStore";
import ScheduleTestLists from "./ScheduleTestLists";

export const ScheduleTestMainComponent = () => {
    const { setNavHeading } = useNavHeadingStore();
    const [selectedTab, setSelectedTab] = useState("liveTests");
    const { data: initData } = useSuspenseQuery(useInstituteQuery());
    const { BatchesFilterData, SubjectFilterData, StatusData } =
        useFilterDataForAssesment(initData);
    const [selectedQuestionPaperFilters, setSelectedQuestionPaperFilters] = useState<
        Record<string, MyFilterOption[]>
    >({});
    const [searchText, setSearchText] = useState("");
    const [pageNo, setPageNo] = useState(0);

    const handleFilterChange = (filterKey: string, selectedItems: MyFilterOption[]) => {
        setSelectedQuestionPaperFilters((prev) => {
            const updatedFilters = { ...prev, [filterKey]: selectedItems };
            if (selectedItems.length === 0) {
                delete updatedFilters[filterKey]; // Remove empty filters
            }
            return updatedFilters;
        });
    };

    const clearSearch = () => {
        setSearchText("");
        delete selectedQuestionPaperFilters["name"];
    };

    const handleSearch = (searchValue: string) => {
        setSearchText(searchValue);
        setSelectedQuestionPaperFilters((prev) => {
            const updatedFilters = {
                ...prev,
                name: [{ id: searchValue, name: searchValue }],
            };
            return updatedFilters;
        });
    };

    const handleResetFilters = () => {
        setSelectedQuestionPaperFilters({});
        setSearchText("");
    };

    const handleSubmitFilters = () => {
        console.log("Filter Clicked!");
    };

    const handlePageChange = (newPage: number) => {
        setPageNo(newPage);
    };

    useEffect(() => {
        setNavHeading(<h1 className="text-lg">Assessments List</h1>);
    }, []);

    return (
        <>
            <Helmet>
                <title>Schedule Tests</title>
                <meta
                    name="description"
                    content="This page shows the list of all the schedules tests and also an assessment can be scheduled here."
                />
            </Helmet>
            <ScheduleTestHeaderDescription />
            <div className="flex flex-col gap-4">
                <Tabs value={selectedTab} onValueChange={setSelectedTab}>
                    <ScheduleTestTabList selectedTab={selectedTab} />
                    <div className="my-6 flex flex-wrap items-center justify-between">
                        <div className="flex items-center gap-4">
                            <ScheduleTestFilters
                                label="Batches"
                                data={BatchesFilterData}
                                selectedItems={
                                    selectedQuestionPaperFilters["package_session_ids"] || []
                                }
                                onSelectionChange={(items) =>
                                    handleFilterChange("package_session_ids", items)
                                }
                            />
                            <ScheduleTestFilters
                                label="Subjects"
                                data={SubjectFilterData}
                                selectedItems={selectedQuestionPaperFilters["subject_ids"] || []}
                                onSelectionChange={(items) =>
                                    handleFilterChange("subject_ids", items)
                                }
                            />
                            <ScheduleTestFilters
                                label="Status"
                                data={StatusData}
                                selectedItems={selectedQuestionPaperFilters["statuses"] || []}
                                onSelectionChange={(items) => handleFilterChange("statuses", items)}
                            />
                            <ScheduleTestFilterButtons
                                selectedQuestionPaperFilters={selectedQuestionPaperFilters}
                                handleSubmitFilters={handleSubmitFilters}
                                handleResetFilters={handleResetFilters}
                            />
                        </div>
                        <ScheduleTestSearchComponent
                            onSearch={handleSearch}
                            searchText={searchText}
                            setSearchText={setSearchText}
                            clearSearch={clearSearch}
                        />
                    </div>
                    {scheduleTestTabsData.map((tab, index) => (
                        <ScheduleTestLists
                            key={index}
                            tab={tab}
                            pageNo={pageNo}
                            handlePageChange={handlePageChange}
                        />
                    ))}
                </Tabs>
            </div>
        </>
    );
};
