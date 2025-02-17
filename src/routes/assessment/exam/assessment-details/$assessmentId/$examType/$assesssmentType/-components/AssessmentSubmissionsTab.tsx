import { useState } from "react";
import { MyTable } from "@/components/design-system/table";
import { OnChangeFn, RowSelectionState } from "@tanstack/react-table";
import { StudentTable } from "@/schemas/student/student-list/table-schema";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
    ResponseQuestionList,
    ResponseQuestionListClose,
    ResponseQuestionListOpen,
} from "@/types/assessments/assessment-overview";
import {
    getAllColumnsForTable,
    getAssessmentFilteredDataForAssessmentStatus,
} from "../-utils/helper";
import { Route } from "..";
import { useMutation, useSuspenseQuery } from "@tanstack/react-query";
import { getInstituteId } from "@/constants/helper";
import {
    getAdminParticipants,
    handleAdminParticipantsData,
} from "../-services/assessment-details-services";

const AssessmentSubmissionsTab = ({
    type,
    studentsListData,
}: {
    type: string;
    studentsListData:
        | ResponseQuestionList[]
        | ResponseQuestionListOpen[]
        | ResponseQuestionListClose[];
}) => {
    const instituteId = getInstituteId();
    const { assessmentId, assesssmentType } = Route.useParams();
    const [selectedParticipantsTab, setSelectedParticipantsTab] = useState("internal");
    const [selectedTab, setSelectedTab] = useState("Attempted");
    const [batchSelectionTab, setBatchSelectionTab] = useState("batch");
    const [selectedFilter, setSelectedFilter] = useState({
        name: "",
        assessment_type: assesssmentType,
        attempt_type: ["ENDED"],
        registration_source: "BATCH_PREVIEW_REGISTRATION",
        batches: [],
        status: ["ACTIVE"],
        sort_columns: {},
    });

    const [page, setPage] = useState(1);
    const { data: participantsData } = useSuspenseQuery(
        handleAdminParticipantsData({
            assessmentId,
            instituteId,
            pageNo: page,
            pageSize: 10,
            selectedFilter,
        }),
    );

    const [rowSelections, setRowSelections] = useState<Record<number, Record<string, boolean>>>({});
    const currentPageSelection = rowSelections[page] || {};
    const studentTableData = getAssessmentFilteredDataForAssessmentStatus(
        studentsListData,
        type,
        selectedParticipantsTab,
        selectedTab,
    );

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
            selectedFilter: any;
        }) => getAdminParticipants(assessmentId, instituteId, pageNo, pageSize, selectedFilter),
        onSuccess: (data) => {
            console.log(data);
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
        internal: getAllColumnsForTable(type, selectedParticipantsTab).internal,
        external: getAllColumnsForTable(type, selectedParticipantsTab).external,
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
                    registration_source: "INDIVIDUAL_REGISTRATION",
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
                    registration_source: "INDIVIDUAL_REGISTRATION",
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
                    registration_source: "INDIVIDUAL_REGISTRATION",
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

    return (
        <>
            <Tabs
                value={selectedTab}
                onValueChange={handleAttemptedTab}
                className="flex w-full flex-col gap-4"
            >
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
                            className={`${selectedTab === "Attempted" ? "text-primary-500" : ""}`}
                        >
                            Attempted
                        </span>
                        <Badge
                            className="rounded-[10px] bg-primary-500 p-0 px-2 text-[9px] text-white"
                            variant="outline"
                        >
                            {studentTableData.length}
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
                        <span className={`${selectedTab === "Pending" ? "text-primary-500" : ""}`}>
                            Pending
                        </span>
                        <Badge
                            className="rounded-[10px] bg-primary-500 p-0 px-2 text-[9px] text-white"
                            variant="outline"
                        >
                            {studentTableData.length}
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
                        <span className={`${selectedTab === "Ongoing" ? "text-primary-500" : ""}`}>
                            Ongoing
                        </span>
                        <Badge
                            className="rounded-[10px] bg-primary-500 p-0 px-2 text-[9px] text-white"
                            variant="outline"
                        >
                            {studentTableData.length}
                        </Badge>
                    </TabsTrigger>
                </TabsList>
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
                                <Badge
                                    className="rounded-[10px] bg-primary-500 p-0 px-2 text-[9px] text-white"
                                    variant="outline"
                                >
                                    {studentTableData.length}
                                </Badge>
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
                                <Badge
                                    className="rounded-[10px] bg-primary-500 p-0 px-2 text-[9px] text-white"
                                    variant="outline"
                                >
                                    {studentTableData.length}
                                </Badge>
                            </TabsTrigger>
                        </TabsList>
                    </Tabs>
                )}
                <div className="max-h-[72vh] overflow-y-auto p-4">
                    <TabsContent value={selectedTab}>
                        <MyTable<StudentTable>
                            data={{
                                content: studentTableData,
                                total_pages: Math.ceil(studentTableData.length / 10),
                                page_no: page,
                                page_size: 10,
                                total_elements: studentTableData.length,
                                last: false,
                            }}
                            columns={
                                type === "question"
                                    ? getAssessmentColumn[
                                          selectedParticipantsTab as keyof typeof getAssessmentColumn
                                      ] || []
                                    : getAssessmentColumn[
                                          selectedTab as keyof typeof getAssessmentColumn
                                      ] || []
                            }
                            rowSelection={currentPageSelection}
                            onRowSelectionChange={handleRowSelectionChange}
                            currentPage={page}
                        />
                    </TabsContent>
                </div>
            </Tabs>
        </>
    );
};

export default AssessmentSubmissionsTab;
