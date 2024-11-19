import { useState } from "react";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { TabListComponent } from "./TabListComponent";
import { QuestionPapersFilter } from "./QuestionPapersFilter";
import { QuestionPapersSearchComponent } from "./QuestionPapersSearchComponent";
import { DateRangeComponent } from "./DateRangeComponent";
import { EmptyQuestionPapers } from "@/svgs";

export const QuestionPapersTabs = () => {
    const [selectedTab, setSelectedTab] = useState("All");

    const handleTabChange = (value: string) => {
        setSelectedTab(value);
    };

    const YearClassFilterData = ["10th Class", "9th Class", "8th Class"];
    const SubjectFilterData = [
        "Chemistry",
        "Biology",
        "Physics",
        "Olympiad",
        "Mathematics",
        "Civics",
        "History",
        "Geography",
        "Economics",
    ];

    return (
        <Tabs value={selectedTab} onValueChange={handleTabChange}>
            <div className="flex items-center justify-between gap-8">
                <div className="flex gap-8">
                    <TabListComponent selectedTab={selectedTab} />
                    <div className="flex gap-6">
                        <QuestionPapersFilter label="Year/Class" data={YearClassFilterData} />
                        <QuestionPapersFilter label="Subject" data={SubjectFilterData} />
                    </div>
                </div>
                <div className="flex gap-4">
                    <QuestionPapersSearchComponent />
                    <DateRangeComponent />
                </div>
            </div>
            <TabsContent value="All">
                <div className="flex h-screen flex-col items-center justify-center">
                    <EmptyQuestionPapers />
                    <span className="text-neutral-600">No question papers available</span>
                </div>
            </TabsContent>
            <TabsContent value="Favourites">
                <div className="flex h-screen flex-col items-center justify-center">
                    <EmptyQuestionPapers />
                    <span className="text-neutral-600">
                        No question paper has been marked as favourites yet.
                    </span>
                </div>
            </TabsContent>
        </Tabs>
    );
};
