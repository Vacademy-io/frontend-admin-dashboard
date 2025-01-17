import { Helmet } from "react-helmet";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { EmptyScheduleTest } from "@/svgs";
import { useState } from "react";
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

export const ScheduleTestMainComponent = () => {
    const [selectedTab, setSelectedTab] = useState("liveTests");
    const { data: initData } = useSuspenseQuery(useInstituteQuery());
    const { BatchesFilterData, SubjectFilterData, StatusData } =
        useFilterDataForAssesment(initData);
    const [selectedQuestionPaperFilters, setSelectedQuestionPaperFilters] = useState<
        Record<string, MyFilterOption[]>
    >({});
    const [searchText, setSearchText] = useState("");

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
                    <div className="flex flex-wrap items-center justify-start gap-5">
                        <ScheduleTestTabList selectedTab={selectedTab} />
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
                            onSelectionChange={(items) => handleFilterChange("subject_ids", items)}
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
                        <ScheduleTestSearchComponent
                            onSearch={handleSearch}
                            searchText={searchText}
                            setSearchText={setSearchText}
                            clearSearch={clearSearch}
                        />
                    </div>
                    {scheduleTestTabsData.map((tab) => (
                        <TabsContent
                            key={tab.value}
                            value={tab.value}
                            className="my-4 rounded-xl bg-neutral-50"
                        >
                            <div className="flex h-screen flex-col items-center justify-center">
                                <EmptyScheduleTest />
                                <span className="text-neutral-600">{tab.message}</span>
                            </div>
                        </TabsContent>
                    ))}
                </Tabs>
            </div>
        </>
    );
};
