import { useState } from "react";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { TabListComponent } from "./TabListComponent";
import { QuestionPapersFilter } from "./QuestionPapersFilter";
import { QuestionPapersSearchComponent } from "./QuestionPapersSearchComponent";
import { QuestionPapersDateRangeComponent } from "./QuestionPapersDateRangeComponent";
import { EmptyQuestionPapers } from "@/svgs";
import { QuestionPapersList } from "./QuestionPapersList";
import { useAllQuestionsStore } from "../-global-states/questions-store";
import { countFavourites } from "../-utils/helper";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useInstituteQuery } from "@/services/student-list-section/getInstituteDetails";
import { FilterOption } from "@/types/question-paper-filter";
import { MyButton } from "@/components/design-system/button";

export const QuestionPapersTabs = () => {
    const { data } = useSuspenseQuery(useInstituteQuery());
    const { questionPaperList } = useAllQuestionsStore();
    const totalFavouriteQuesionPaper = countFavourites(questionPaperList);
    const [selectedTab, setSelectedTab] = useState("All");
    const [selectedQuestionPaperFilters, setSelectedQuestionPaperFilters] = useState<
        Record<string, FilterOption[]>
    >({});

    const YearClassFilterData = data?.levels?.map((level) => ({
        id: level.id,
        name: level.level_name,
    }));

    const SubjectFilterData = data?.levels?.map((level) => ({
        id: level.id,
        name: level.level_name,
    }));

    const handleTabChange = (value: string) => {
        setSelectedTab(value);
    };

    const handleFilterChange = (filterKey: string, selectedItems: FilterOption[]) => {
        setSelectedQuestionPaperFilters((prev) => {
            const updatedFilters = { ...prev, [filterKey]: selectedItems };
            if (selectedItems.length === 0) {
                delete updatedFilters[filterKey]; // Remove empty filters
            }
            return updatedFilters;
        });
    };

    const handleResetFilters = () => {
        setSelectedQuestionPaperFilters({});
    };

    console.log(selectedQuestionPaperFilters);

    return (
        <Tabs value={selectedTab} onValueChange={handleTabChange}>
            <div className="flex flex-wrap items-center justify-between gap-8">
                <div className="flex flex-wrap gap-8">
                    <TabListComponent selectedTab={selectedTab} />
                    <QuestionPapersFilter
                        label="Year/Class"
                        data={YearClassFilterData}
                        selectedItems={selectedQuestionPaperFilters["yearClass"] || []}
                        onSelectionChange={(items) => handleFilterChange("yearClass", items)}
                    />
                    <QuestionPapersFilter
                        label="Subject"
                        data={SubjectFilterData}
                        selectedItems={selectedQuestionPaperFilters["subject"] || []}
                        onSelectionChange={(items) => handleFilterChange("subject", items)}
                    />
                    {Object.keys(selectedQuestionPaperFilters).length > 0 && (
                        <div className="flex gap-6">
                            <MyButton
                                buttonType="primary"
                                scale="small"
                                layoutVariant="default"
                                className="h-8"
                            >
                                Filter
                            </MyButton>
                            <MyButton
                                buttonType="secondary"
                                scale="small"
                                layoutVariant="default"
                                className="h-8 border border-neutral-400 bg-neutral-200 hover:border-neutral-500 hover:bg-neutral-300 active:border-neutral-600 active:bg-neutral-400"
                                onClick={handleResetFilters}
                            >
                                Reset
                            </MyButton>
                        </div>
                    )}
                    <div
                        className={`flex gap-4 ${
                            Object.keys(selectedQuestionPaperFilters).length > 0 ? "mt-[-3px]" : ""
                        }`}
                    >
                        <QuestionPapersSearchComponent />
                        <QuestionPapersDateRangeComponent />
                    </div>
                </div>
            </div>
            <TabsContent value="All">
                {questionPaperList.length > 0 ? (
                    <QuestionPapersList isFavourite={false} />
                ) : (
                    <div className="flex h-screen flex-col items-center justify-center">
                        <EmptyQuestionPapers />
                        <span className="text-neutral-600">No question papers available</span>
                    </div>
                )}
            </TabsContent>
            <TabsContent value="Favourites">
                {totalFavouriteQuesionPaper > 0 ? (
                    <QuestionPapersList isFavourite={true} />
                ) : (
                    <div className="flex h-screen flex-col items-center justify-center">
                        <EmptyQuestionPapers />
                        <span className="text-neutral-600">
                            No question paper has been marked as favourites yet.
                        </span>
                    </div>
                )}
            </TabsContent>
        </Tabs>
    );
};
