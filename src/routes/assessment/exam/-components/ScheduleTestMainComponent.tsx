import { Helmet } from "react-helmet";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { DotIcon, DotIconOffline, EmptyScheduleTest } from "@/svgs";
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
import { Badge } from "@/components/ui/badge";
import { MyButton } from "@/components/design-system/button";
import {
    CheckCircle,
    Copy,
    DotsThree,
    DownloadSimple,
    LockSimple,
    PauseCircle,
} from "phosphor-react";
import { ReverseProgressBar } from "@/components/ui/progress";
import QRCode from "react-qr-code";
import { Separator } from "@/components/ui/separator";
import {
    copyToClipboard,
    handleDownloadQRCode,
} from "../../create-assessment/$examtype/-utils/helper";
import { MyPagination } from "@/components/design-system/pagination";

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
                    {scheduleTestTabsData.map((tab) => (
                        <TabsContent
                            key={tab.value}
                            value={tab.value}
                            className="my-4 flex flex-col gap-6 rounded-xl"
                        >
                            {tab.data.length === 0 ? (
                                <div className="flex h-screen flex-col items-center justify-center">
                                    <EmptyScheduleTest />
                                    <span className="text-neutral-600">{tab.message}</span>
                                </div>
                            ) : (
                                <>
                                    {tab.data.map((item, index) => (
                                        <div
                                            key={index}
                                            className="flex flex-col gap-4 rounded-xl border bg-neutral-50 p-4"
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-4">
                                                    <h1 className="font-semibold">
                                                        {item.questionPaperTitle}
                                                    </h1>
                                                    <Badge
                                                        className={`rounded-md border border-neutral-300 ${
                                                            item.type === "close"
                                                                ? "bg-primary-50"
                                                                : "bg-info-50"
                                                        } py-1.5 shadow-none`}
                                                    >
                                                        <LockSimple size={16} className="mr-2" />
                                                        {item.type}
                                                    </Badge>
                                                    <Badge
                                                        className={`rounded-md border border-neutral-300 ${
                                                            item.mode === "offline"
                                                                ? "bg-neutral-50"
                                                                : "bg-success-50"
                                                        } py-1.5 shadow-none`}
                                                    >
                                                        {item.mode === "online" ? (
                                                            <DotIcon className="mr-2" />
                                                        ) : (
                                                            <DotIconOffline className="mr-2" />
                                                        )}
                                                        {item.mode}
                                                    </Badge>
                                                    <Separator
                                                        orientation="vertical"
                                                        className="h-8 w-px bg-neutral-300"
                                                    />
                                                    <Badge
                                                        className={`rounded-md border ${
                                                            item.status === "active"
                                                                ? "bg-success-50"
                                                                : "bg-neutral-100"
                                                        } border-neutral-300 py-1.5 shadow-none`}
                                                    >
                                                        {item.status === "active" ? (
                                                            <CheckCircle
                                                                size={16}
                                                                weight="fill"
                                                                className="mr-2 text-success-600"
                                                            />
                                                        ) : (
                                                            <PauseCircle
                                                                size={16}
                                                                weight="fill"
                                                                className="mr-2 text-neutral-400"
                                                            />
                                                        )}
                                                        {item.status}
                                                    </Badge>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <Badge className="rounded-md border border-primary-200 bg-primary-50 py-1.5 shadow-none">
                                                        10th Premium Pro Group 1
                                                    </Badge>
                                                    <span className="text-sm text-primary-500">
                                                        +3 more
                                                    </span>
                                                    <MyButton
                                                        type="button"
                                                        scale="small"
                                                        buttonType="secondary"
                                                        className="w-6 !min-w-6"
                                                    >
                                                        <DotsThree size={32} />
                                                    </MyButton>
                                                </div>
                                            </div>
                                            <div className="flex w-3/4 items-center justify-between text-sm text-neutral-500">
                                                <div className="flex flex-col gap-4">
                                                    <p>Created on: {item.createdOn}</p>
                                                    <p>Subject: {item.subject}</p>
                                                </div>
                                                <div className="flex flex-col gap-4">
                                                    <p>Start Date and Time: {item.startDate}</p>
                                                    <p>Duration: {item.duration} min</p>
                                                </div>
                                                <div className="flex flex-col gap-4">
                                                    <p>End Date and Time: {item.endDate}</p>
                                                    <p>
                                                        Total Participants: {item.totalParticipants}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-between gap-8 text-sm text-neutral-500">
                                                <p>Attempted by: {item.attemptedParticipants}</p>
                                                <p>Pending: {item.remainingParticipants}</p>
                                            </div>
                                            <ReverseProgressBar
                                                value={
                                                    (item.remainingParticipants /
                                                        item.totalParticipants) *
                                                    100
                                                }
                                                className="-mt-3 w-full border"
                                            />
                                            <div className="flex justify-between">
                                                <div className="flex items-center gap-2 text-sm text-neutral-500">
                                                    <h1 className="!font-normal text-black">
                                                        Join Link:
                                                    </h1>
                                                    <p>{item.joinLink}</p>
                                                    <MyButton
                                                        type="button"
                                                        scale="small"
                                                        buttonType="secondary"
                                                        className="h-8 min-w-8"
                                                        onClick={() =>
                                                            copyToClipboard(item.joinLink)
                                                        }
                                                    >
                                                        <Copy size={32} />
                                                    </MyButton>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <QRCode
                                                        value={item.joinLink}
                                                        className="size-16"
                                                        id={`qr-code-svg-assessment-list-${item.id}`}
                                                    />
                                                    <MyButton
                                                        type="button"
                                                        scale="small"
                                                        buttonType="secondary"
                                                        className="h-8 min-w-8"
                                                        onClick={() =>
                                                            handleDownloadQRCode(
                                                                `qr-code-svg-assessment-list-${item.id}`,
                                                            )
                                                        }
                                                    >
                                                        <DownloadSimple size={32} />
                                                    </MyButton>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    <MyPagination
                                        currentPage={pageNo}
                                        totalPages={tab.data.length}
                                        onPageChange={handlePageChange}
                                    />
                                </>
                            )}
                        </TabsContent>
                    ))}
                </Tabs>
            </div>
        </>
    );
};
