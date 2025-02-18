/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck

import { useEffect, useState } from "react";
import { MyTable } from "@/components/design-system/table";
import { OnChangeFn, RowSelectionState } from "@tanstack/react-table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
    getAllColumnsForTable,
    getAllColumnsForTableWidth,
    getAssessmentSubmissionsFilteredDataStudentData,
} from "../-utils/helper";
import { Route } from "..";
import { useMutation, useSuspenseQuery } from "@tanstack/react-query";
import { getInstituteId } from "@/constants/helper";
import { getAdminParticipants } from "../-services/assessment-details-services";
import { MyPagination } from "@/components/design-system/pagination";
import { MyButton } from "@/components/design-system/button";
import { ArrowCounterClockwise, Export } from "phosphor-react";
import { AssessmentDetailsSearchComponent } from "./SearchComponent";
import { useInstituteQuery } from "@/services/student-list-section/getInstituteDetails";
import { useFilterDataForAssesment } from "@/routes/assessment/exam/-utils.ts/useFiltersData";
import { ScheduleTestFilters } from "@/routes/assessment/exam/-components/ScheduleTestFilters";
import { MyFilterOption } from "@/types/assessments/my-filter";
import { DashboardLoader } from "@/components/core/dashboard-loader";
import AssessmentSubmissionsFilterButtons from "./AssessmentSubmissionsFilterButtons";

export interface SelectedSubmissionsFilterInterface {
    name: string;
    assessment_type: string;
    attempt_type: string[];
    registration_source: string;
    batches: MyFilterOption[];
    status: string[];
    sort_columns: Record<string, string>;
}

const AssessmentSubmissionsTab = ({ type }: { type: string }) => {
    const { data: initData } = useSuspenseQuery(useInstituteQuery());
    const { BatchesFilterData } = useFilterDataForAssesment(initData);
    const instituteId = getInstituteId();
    const { assessmentId, assesssmentType } = Route.useParams();
    const [selectedParticipantsTab, setSelectedParticipantsTab] = useState("internal");
    const [selectedTab, setSelectedTab] = useState("Attempted");
    const [batchSelectionTab, setBatchSelectionTab] = useState("batch");
    const [page, setPage] = useState(0);
    const [selectedFilter, setSelectedFilter] = useState<SelectedSubmissionsFilterInterface>({
        name: "",
        assessment_type: assesssmentType,
        attempt_type: ["ENDED"],
        registration_source: "BATCH_PREVIEW_REGISTRATION",
        batches: [],
        status: ["ACTIVE"],
        sort_columns: {},
    });
    const [searchText, setSearchText] = useState("");
    const [participantsData, setParticipantsData] = useState({
        content: [],
        total_pages: 0,
        page_no: 0,
        page_size: 10,
        total_elements: 0,
        last: false,
    });
    const [isParticipantsLoading, setIsParticipantsLoading] = useState(false);

    const [rowSelections, setRowSelections] = useState<Record<number, Record<string, boolean>>>({});
    const currentPageSelection = rowSelections[page] || {};

    const [attemptedCount, setAttemptedCount] = useState(0);
    const [ongoingCount, setOngoingCount] = useState(0);
    const [pendingCount, setPendingCount] = useState(0);

    const getParticipantsListData = useMutation({
        mutationFn: ({
            assessmentId,
            instituteId,
            pageNo,
            pageSize,
            selectedFilter,
        }: {
            assessmentId: string;
            instituteId: string | undefined;
            pageNo: number;
            pageSize: number;
            selectedFilter: SelectedSubmissionsFilterInterface;
        }) => getAdminParticipants(assessmentId, instituteId, pageNo, pageSize, selectedFilter),
        onSuccess: (data) => {
            setParticipantsData(data);
        },
        onError: (error: unknown) => {
            throw error;
        },
    });

    const handleRowSelectionChange: OnChangeFn<RowSelectionState> = (updaterOrValue) => {
        const newSelection =
            typeof updaterOrValue === "function"
                ? updaterOrValue(rowSelections[page] || {})
                : updaterOrValue;

        setRowSelections((prev) => ({
            ...prev,
            [page]: newSelection,
        }));
    };

    const getAssessmentColumn = {
        Attempted: getAllColumnsForTable(type, selectedParticipantsTab).Attempted,
        Pending: getAllColumnsForTable(type, selectedParticipantsTab).Pending,
        Ongoing: getAllColumnsForTable(type, selectedParticipantsTab).Ongoing,
    };

    const getAssessmentColumnWidth = {
        Attempted: getAllColumnsForTableWidth(type, selectedParticipantsTab).Attempted,
        Pending: getAllColumnsForTableWidth(type, selectedParticipantsTab).Pending,
        Ongoing: getAllColumnsForTableWidth(type, selectedParticipantsTab).Ongoing,
    };

    const handleAttemptedTab = (value: string) => {
        setSelectedTab(value);
        if (selectedParticipantsTab === "internal" && batchSelectionTab === "batch") {
            getParticipantsListData.mutate({
                assessmentId,
                instituteId,
                pageNo: page,
                pageSize: 10,
                selectedFilter: {
                    ...selectedFilter,
                    registration_source: "BATCH_PREVIEW_REGISTRATION",
                    attempt_type: [
                        value === "Attempted" ? "ENDED" : value === "Pending" ? "PENDING" : "LIVE",
                    ],
                },
            });
        }

        if (selectedParticipantsTab === "internal" && batchSelectionTab === "individual") {
            getParticipantsListData.mutate({
                assessmentId,
                instituteId,
                pageNo: page,
                pageSize: 10,
                selectedFilter: {
                    ...selectedFilter,
                    registration_source: "ADMIN_PRE_REGISTRATION",
                    attempt_type: [
                        value === "Attempted" ? "ENDED" : value === "Pending" ? "PENDING" : "LIVE",
                    ],
                },
            });
        }

        if (selectedParticipantsTab === "external") {
            getParticipantsListData.mutate({
                assessmentId,
                instituteId,
                pageNo: page,
                pageSize: 10,
                selectedFilter: {
                    ...selectedFilter,
                    registration_source: "OPEN_REGISTRATION",
                    attempt_type: [
                        value === "Attempted" ? "ENDED" : value === "Pending" ? "PENDING" : "LIVE",
                    ],
                },
            });
        }
    };

    const handleParticipantsTab = (value: string) => {
        setSelectedParticipantsTab(value);
        if (value === "internal" && batchSelectionTab === "batch") {
            getParticipantsListData.mutate({
                assessmentId,
                instituteId,
                pageNo: page,
                pageSize: 10,
                selectedFilter: {
                    ...selectedFilter,
                    registration_source: "BATCH_PREVIEW_REGISTRATION",
                    attempt_type: [
                        selectedTab === "Attempted"
                            ? "ENDED"
                            : selectedTab === "Pending"
                              ? "PENDING"
                              : "LIVE",
                    ],
                },
            });
        }

        if (value === "internal" && batchSelectionTab === "individual") {
            getParticipantsListData.mutate({
                assessmentId,
                instituteId,
                pageNo: page,
                pageSize: 10,
                selectedFilter: {
                    ...selectedFilter,
                    registration_source: "ADMIN_PRE_REGISTRATION",
                    attempt_type: [
                        selectedTab === "Attempted"
                            ? "ENDED"
                            : selectedTab === "Pending"
                              ? "PENDING"
                              : "LIVE",
                    ],
                },
            });
        }

        if (value === "external") {
            getParticipantsListData.mutate({
                assessmentId,
                instituteId,
                pageNo: page,
                pageSize: 10,
                selectedFilter: {
                    ...selectedFilter,
                    registration_source: "OPEN_REGISTRATION",
                    attempt_type: [
                        selectedTab === "Attempted"
                            ? "ENDED"
                            : selectedTab === "Pending"
                              ? "PENDING"
                              : "LIVE",
                    ],
                },
            });
        }
    };

    const handleBatchSeletectionTab = (value: string) => {
        setBatchSelectionTab(value);
        if (selectedParticipantsTab === "internal" && value === "batch") {
            getParticipantsListData.mutate({
                assessmentId,
                instituteId,
                pageNo: page,
                pageSize: 10,
                selectedFilter: {
                    ...selectedFilter,
                    registration_source: "BATCH_PREVIEW_REGISTRATION",
                    attempt_type: [
                        selectedTab === "Attempted"
                            ? "ENDED"
                            : selectedTab === "Pending"
                              ? "PENDING"
                              : "LIVE",
                    ],
                },
            });
        }

        if (selectedParticipantsTab === "internal" && value === "individual") {
            getParticipantsListData.mutate({
                assessmentId,
                instituteId,
                pageNo: page,
                pageSize: 10,
                selectedFilter: {
                    ...selectedFilter,
                    registration_source: "ADMIN_PRE_REGISTRATION",
                    attempt_type: [
                        selectedTab === "Attempted"
                            ? "ENDED"
                            : selectedTab === "Pending"
                              ? "PENDING"
                              : "LIVE",
                    ],
                },
            });
        }

        if (selectedParticipantsTab === "external") {
            getParticipantsListData.mutate({
                assessmentId,
                instituteId,
                pageNo: page,
                pageSize: 10,
                selectedFilter: {
                    ...selectedFilter,
                    registration_source: "OPEN_REGISTRATION",
                    attempt_type: [
                        selectedTab === "Attempted"
                            ? "ENDED"
                            : selectedTab === "Pending"
                              ? "PENDING"
                              : "LIVE",
                    ],
                },
            });
        }
    };

    const handlePageChange = (newPage: number) => {
        setPage(newPage);
        if (selectedParticipantsTab === "internal" && batchSelectionTab === "batch") {
            getParticipantsListData.mutate({
                assessmentId,
                instituteId,
                pageNo: newPage,
                pageSize: 10,
                selectedFilter: {
                    ...selectedFilter,
                    registration_source: "BATCH_PREVIEW_REGISTRATION",
                    attempt_type: [
                        selectedTab === "Attempted"
                            ? "ENDED"
                            : selectedTab === "Pending"
                              ? "PENDING"
                              : "LIVE",
                    ],
                },
            });
        }

        if (selectedParticipantsTab === "internal" && batchSelectionTab === "individual") {
            getParticipantsListData.mutate({
                assessmentId,
                instituteId,
                pageNo: newPage,
                pageSize: 10,
                selectedFilter: {
                    ...selectedFilter,
                    registration_source: "ADMIN_PRE_REGISTRATION",
                    attempt_type: [
                        selectedTab === "Attempted"
                            ? "ENDED"
                            : selectedTab === "Pending"
                              ? "PENDING"
                              : "LIVE",
                    ],
                },
            });
        }

        if (selectedParticipantsTab === "external") {
            getParticipantsListData.mutate({
                assessmentId,
                instituteId,
                pageNo: newPage,
                pageSize: 10,
                selectedFilter: {
                    ...selectedFilter,
                    registration_source: "OPEN_REGISTRATION",
                    attempt_type: [
                        selectedTab === "Attempted"
                            ? "ENDED"
                            : selectedTab === "Pending"
                              ? "PENDING"
                              : "LIVE",
                    ],
                },
            });
        }
    };

    const handleRefreshLeaderboard = () => {
        if (selectedParticipantsTab === "internal" && batchSelectionTab === "batch") {
            getParticipantsListData.mutate({
                assessmentId,
                instituteId,
                pageNo: page,
                pageSize: 10,
                selectedFilter: {
                    ...selectedFilter,
                    registration_source: "BATCH_PREVIEW_REGISTRATION",
                    attempt_type: [
                        selectedTab === "Attempted"
                            ? "ENDED"
                            : selectedTab === "Pending"
                              ? "PENDING"
                              : "LIVE",
                    ],
                },
            });
        }

        if (selectedParticipantsTab === "internal" && batchSelectionTab === "individual") {
            getParticipantsListData.mutate({
                assessmentId,
                instituteId,
                pageNo: page,
                pageSize: 10,
                selectedFilter: {
                    ...selectedFilter,
                    registration_source: "ADMIN_PRE_REGISTRATION",
                    attempt_type: [
                        selectedTab === "Attempted"
                            ? "ENDED"
                            : selectedTab === "Pending"
                              ? "PENDING"
                              : "LIVE",
                    ],
                },
            });
        }

        if (selectedParticipantsTab === "external") {
            getParticipantsListData.mutate({
                assessmentId,
                instituteId,
                pageNo: page,
                pageSize: 10,
                selectedFilter: {
                    ...selectedFilter,
                    registration_source: "OPEN_REGISTRATION",
                    attempt_type: [
                        selectedTab === "Attempted"
                            ? "ENDED"
                            : selectedTab === "Pending"
                              ? "PENDING"
                              : "LIVE",
                    ],
                },
            });
        }
    };

    const clearSearch = () => {
        setSearchText("");
        selectedFilter["name"] = "";
        if (selectedParticipantsTab === "internal" && batchSelectionTab === "batch") {
            getParticipantsListData.mutate({
                assessmentId,
                instituteId,
                pageNo: page,
                pageSize: 10,
                selectedFilter: {
                    ...selectedFilter,
                    registration_source: "BATCH_PREVIEW_REGISTRATION",
                    attempt_type: [
                        selectedTab === "Attempted"
                            ? "ENDED"
                            : selectedTab === "Pending"
                              ? "PENDING"
                              : "LIVE",
                    ],
                },
            });
        }

        if (selectedParticipantsTab === "internal" && batchSelectionTab === "individual") {
            getParticipantsListData.mutate({
                assessmentId,
                instituteId,
                pageNo: page,
                pageSize: 10,
                selectedFilter: {
                    ...selectedFilter,
                    registration_source: "ADMIN_PRE_REGISTRATION",
                    attempt_type: [
                        selectedTab === "Attempted"
                            ? "ENDED"
                            : selectedTab === "Pending"
                              ? "PENDING"
                              : "LIVE",
                    ],
                },
            });
        }

        if (selectedParticipantsTab === "external") {
            getParticipantsListData.mutate({
                assessmentId,
                instituteId,
                pageNo: page,
                pageSize: 10,
                selectedFilter: {
                    ...selectedFilter,
                    registration_source: "OPEN_REGISTRATION",
                    attempt_type: [
                        selectedTab === "Attempted"
                            ? "ENDED"
                            : selectedTab === "Pending"
                              ? "PENDING"
                              : "LIVE",
                    ],
                },
            });
        }
    };

    const handleSearch = (searchValue: string) => {
        setSearchText(searchValue);
        if (selectedParticipantsTab === "internal" && batchSelectionTab === "batch") {
            getParticipantsListData.mutate({
                assessmentId,
                instituteId,
                pageNo: page,
                pageSize: 10,
                selectedFilter: {
                    ...selectedFilter,
                    name: searchValue,
                    registration_source: "BATCH_PREVIEW_REGISTRATION",
                    attempt_type: [
                        selectedTab === "Attempted"
                            ? "ENDED"
                            : selectedTab === "Pending"
                              ? "PENDING"
                              : "LIVE",
                    ],
                },
            });
        }

        if (selectedParticipantsTab === "internal" && batchSelectionTab === "individual") {
            getParticipantsListData.mutate({
                assessmentId,
                instituteId,
                pageNo: page,
                pageSize: 10,
                selectedFilter: {
                    ...selectedFilter,
                    name: searchValue,
                    registration_source: "ADMIN_PRE_REGISTRATION",
                    attempt_type: [
                        selectedTab === "Attempted"
                            ? "ENDED"
                            : selectedTab === "Pending"
                              ? "PENDING"
                              : "LIVE",
                    ],
                },
            });
        }

        if (selectedParticipantsTab === "external") {
            getParticipantsListData.mutate({
                assessmentId,
                instituteId,
                pageNo: page,
                pageSize: 10,
                selectedFilter: {
                    ...selectedFilter,
                    name: searchValue,
                    registration_source: "OPEN_REGISTRATION",
                    attempt_type: [
                        selectedTab === "Attempted"
                            ? "ENDED"
                            : selectedTab === "Pending"
                              ? "PENDING"
                              : "LIVE",
                    ],
                },
            });
        }
    };

    const handleFilterChange = (filterKey: string, selectedItems: MyFilterOption[]) => {
        setSelectedFilter((prev) => {
            const updatedFilters = { ...prev, [filterKey]: selectedItems };
            return updatedFilters;
        });
    };

    const handleResetFilters = () => {
        setSelectedFilter((prevFilter) => ({
            ...prevFilter,
            name: "",
            batches: [],
        }));
        setSearchText("");
        if (selectedParticipantsTab === "internal" && batchSelectionTab === "batch") {
            getParticipantsListData.mutate({
                assessmentId,
                instituteId,
                pageNo: page,
                pageSize: 10,
                selectedFilter: {
                    ...selectedFilter,
                    name: "",
                    batches: [],
                    registration_source: "BATCH_PREVIEW_REGISTRATION",
                    attempt_type: [
                        selectedTab === "Attempted"
                            ? "ENDED"
                            : selectedTab === "Pending"
                              ? "PENDING"
                              : "LIVE",
                    ],
                },
            });
        }

        if (selectedParticipantsTab === "internal" && batchSelectionTab === "individual") {
            getParticipantsListData.mutate({
                assessmentId,
                instituteId,
                pageNo: page,
                pageSize: 10,
                selectedFilter: {
                    ...selectedFilter,
                    name: "",
                    batches: [],
                    registration_source: "ADMIN_PRE_REGISTRATION",
                    attempt_type: [
                        selectedTab === "Attempted"
                            ? "ENDED"
                            : selectedTab === "Pending"
                              ? "PENDING"
                              : "LIVE",
                    ],
                },
            });
        }

        if (selectedParticipantsTab === "external") {
            getParticipantsListData.mutate({
                assessmentId,
                instituteId,
                pageNo: page,
                pageSize: 10,
                selectedFilter: {
                    ...selectedFilter,
                    name: "",
                    batches: [],
                    registration_source: "OPEN_REGISTRATION",
                    attempt_type: [
                        selectedTab === "Attempted"
                            ? "ENDED"
                            : selectedTab === "Pending"
                              ? "PENDING"
                              : "LIVE",
                    ],
                },
            });
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            const fetchAllParticipants = async () => {
                setIsParticipantsLoading(true);

                try {
                    const [attemptedData, ongoingData, pendingData] = await Promise.all([
                        getAdminParticipants(assessmentId, instituteId, page, 10, selectedFilter),
                        getAdminParticipants(assessmentId, instituteId, page, 10, {
                            ...selectedFilter,
                            attempt_type: ["LIVE"],
                        }),
                        getAdminParticipants(assessmentId, instituteId, page, 10, {
                            ...selectedFilter,
                            attempt_type: ["Pending"],
                        }),
                    ]);

                    setParticipantsData(attemptedData);
                    setAttemptedCount(attemptedData.content.length);
                    setOngoingCount(ongoingData.content.length);
                    setPendingCount(pendingData.content.length);
                } catch (error) {
                    console.log(error);
                } finally {
                    setIsParticipantsLoading(false);
                }
            };
            fetchAllParticipants();
        }, 300); // Adjust the debounce time as needed

        return () => clearTimeout(timer); // Cleanup the timeout on component unmount
    }, []);

    if (isParticipantsLoading) return <DashboardLoader />;

    return (
        <>
            <Tabs
                value={selectedTab}
                onValueChange={handleAttemptedTab}
                className="flex w-full flex-col gap-4"
            >
                <div className="flex items-center justify-between">
                    <TabsList className="mb-2 ml-4 mt-6 inline-flex h-auto justify-start gap-4 rounded-none border-b !bg-transparent p-0">
                        <TabsTrigger
                            value="Attempted"
                            className={`flex gap-1.5 rounded-none px-12 py-2 !shadow-none ${
                                selectedTab === "Attempted"
                                    ? "rounded-t-sm border !border-b-0 border-primary-200 !bg-primary-50"
                                    : "border-none bg-transparent"
                            }`}
                        >
                            <span
                                className={`${
                                    selectedTab === "Attempted" ? "text-primary-500" : ""
                                }`}
                            >
                                Attempted
                            </span>
                            <Badge
                                className="rounded-[10px] bg-primary-500 p-0 px-2 text-[9px] text-white"
                                variant="outline"
                            >
                                {attemptedCount}
                            </Badge>
                        </TabsTrigger>
                        <TabsTrigger
                            value="Ongoing"
                            className={`flex gap-1.5 rounded-none px-12 py-2 !shadow-none ${
                                selectedTab === "Ongoing"
                                    ? "rounded-t-sm border !border-b-0 border-primary-200 !bg-primary-50"
                                    : "border-none bg-transparent"
                            }`}
                        >
                            <span
                                className={`${selectedTab === "Ongoing" ? "text-primary-500" : ""}`}
                            >
                                Ongoing
                            </span>
                            <Badge
                                className="rounded-[10px] bg-primary-500 p-0 px-2 text-[9px] text-white"
                                variant="outline"
                            >
                                {ongoingCount}
                            </Badge>
                        </TabsTrigger>
                        <TabsTrigger
                            value="Pending"
                            className={`flex gap-1.5 rounded-none px-12 py-2 !shadow-none ${
                                selectedTab === "Pending"
                                    ? "rounded-t-sm border !border-b-0 border-primary-200 !bg-primary-50"
                                    : "border-none bg-transparent"
                            }`}
                        >
                            <span
                                className={`${selectedTab === "Pending" ? "text-primary-500" : ""}`}
                            >
                                Pending
                            </span>
                            <Badge
                                className="rounded-[10px] bg-primary-500 p-0 px-2 text-[9px] text-white"
                                variant="outline"
                            >
                                {pendingCount}
                            </Badge>
                        </TabsTrigger>
                    </TabsList>
                    <div className="flex items-center gap-6">
                        <MyButton
                            type="button"
                            scale="large"
                            buttonType="secondary"
                            className="font-medium"
                        >
                            <Export size={32} />
                            Export
                        </MyButton>
                        <MyButton
                            type="button"
                            scale="large"
                            buttonType="secondary"
                            className="min-w-8 font-medium"
                            onClick={handleRefreshLeaderboard}
                        >
                            <ArrowCounterClockwise size={32} />
                        </MyButton>
                    </div>
                </div>
                <div className="flex items-center justify-between">
                    <Tabs
                        value={selectedParticipantsTab}
                        onValueChange={handleParticipantsTab}
                        className={`ml-4 flex justify-start rounded-lg bg-white p-0 pr-4 shadow-none`}
                    >
                        <TabsList className="flex h-auto flex-wrap justify-start border border-gray-500 !bg-transparent p-0">
                            <TabsTrigger
                                value="internal"
                                className={`flex gap-1.5 rounded-l-lg rounded-r-none p-2 px-4 ${
                                    selectedParticipantsTab === "internal"
                                        ? "!bg-primary-100"
                                        : "bg-transparent"
                                }`}
                            >
                                <span
                                    className={`${
                                        selectedParticipantsTab === "internal"
                                            ? "text-teal-800 dark:text-teal-400"
                                            : ""
                                    }`}
                                >
                                    Internal Participants
                                </span>
                            </TabsTrigger>
                            <Separator orientation="vertical" className="h-full bg-gray-500" />
                            <TabsTrigger
                                value="external"
                                className={`flex gap-1.5 rounded-l-none rounded-r-lg p-2 px-4 ${
                                    selectedParticipantsTab === "external"
                                        ? "!bg-primary-100"
                                        : "bg-transparent"
                                }`}
                            >
                                <span
                                    className={`${
                                        selectedParticipantsTab === "external"
                                            ? "text-teal-800 dark:text-teal-400"
                                            : ""
                                    }`}
                                >
                                    External Participants
                                </span>
                            </TabsTrigger>
                        </TabsList>
                    </Tabs>
                    <div className="flex items-center gap-6">
                        <AssessmentDetailsSearchComponent
                            onSearch={handleSearch}
                            searchText={searchText}
                            setSearchText={setSearchText}
                            clearSearch={clearSearch}
                        />
                        <ScheduleTestFilters
                            label="Batches"
                            data={BatchesFilterData}
                            selectedItems={selectedFilter["batches"] || []}
                            onSelectionChange={(items) => handleFilterChange("batches", items)}
                        />
                        <AssessmentSubmissionsFilterButtons
                            selectedQuestionPaperFilters={selectedFilter}
                            handleSubmitFilters={handleRefreshLeaderboard}
                            handleResetFilters={handleResetFilters}
                        />
                    </div>
                </div>
                {selectedParticipantsTab === "internal" && (
                    <Tabs
                        value={batchSelectionTab}
                        onValueChange={handleBatchSeletectionTab}
                        className="flex w-full flex-col gap-4"
                    >
                        <TabsList className="mb-2 ml-4 mt-6 inline-flex h-auto justify-start gap-4 rounded-none border-b !bg-transparent p-0">
                            <TabsTrigger
                                value="batch"
                                className={`flex gap-1.5 rounded-none px-12 py-2 !shadow-none ${
                                    batchSelectionTab === "batch"
                                        ? "rounded-t-sm border !border-b-0 border-primary-200 !bg-primary-50"
                                        : "border-none bg-transparent"
                                }`}
                            >
                                <span
                                    className={`${
                                        batchSelectionTab === "batch" ? "text-primary-500" : ""
                                    }`}
                                >
                                    Batch Selection
                                </span>
                            </TabsTrigger>
                            <TabsTrigger
                                value="individual"
                                className={`flex gap-1.5 rounded-none px-12 py-2 !shadow-none ${
                                    batchSelectionTab === "individual"
                                        ? "rounded-t-sm border !border-b-0 border-primary-200 !bg-primary-50"
                                        : "border-none bg-transparent"
                                }`}
                            >
                                <span
                                    className={`${
                                        batchSelectionTab === "individual" ? "text-primary-500" : ""
                                    }`}
                                >
                                    Individual Selection
                                </span>
                            </TabsTrigger>
                        </TabsList>
                    </Tabs>
                )}
                <div className="flex max-h-[72vh] flex-col gap-6 overflow-y-auto p-4">
                    <TabsContent value={selectedTab}>
                        <MyTable
                            data={{
                                content: getAssessmentSubmissionsFilteredDataStudentData(
                                    participantsData.content,
                                    type,
                                    selectedTab,
                                ),
                                total_pages: participantsData.total_pages,
                                page_no: page,
                                page_size: 10,
                                total_elements: participantsData.total_elements,
                                last: participantsData.last,
                            }}
                            columns={
                                getAssessmentColumn[
                                    selectedTab as keyof typeof getAssessmentColumn
                                ] || []
                            }
                            columnWidths={
                                getAssessmentColumnWidth[
                                    selectedTab as keyof typeof getAssessmentColumnWidth
                                ] || []
                            }
                            rowSelection={currentPageSelection}
                            onRowSelectionChange={handleRowSelectionChange}
                            currentPage={page}
                        />
                    </TabsContent>
                    <MyPagination
                        currentPage={page}
                        totalPages={participantsData.total_pages}
                        onPageChange={handlePageChange}
                    />
                </div>
            </Tabs>
        </>
    );
};

export default AssessmentSubmissionsTab;
