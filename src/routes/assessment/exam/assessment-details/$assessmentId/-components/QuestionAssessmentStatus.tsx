import { useState } from "react";
import { MyTable } from "@/components/design-system/table";
import {
    assessmentStatusStudentAttemptedColumns,
    assessmentStatusStudentOngoingColumns,
    assessmentStatusStudentPendingColumns,
} from "../-utils/student-columns";
import { overviewTabCloseTestData, overviewTabOpenTestData } from "../-utils/dummy-data";
import { OnChangeFn, RowSelectionState } from "@tanstack/react-table";
import { StudentTable } from "@/schemas/student/student-list/table-schema";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

const QuestionAssessmentStatus = () => {
    const [selectedParticipantsTab, setSelectedParticipantsTab] = useState("internal");
    const [selectedTab, setSelectedTab] = useState("Attempted");
    const [page, setPage] = useState(1);
    const [rowSelections, setRowSelections] = useState<Record<number, Record<string, boolean>>>({});

    const currentPageSelection = rowSelections[page] || {};

    const studentTableData =
        overviewTabOpenTestData.assessmentStatus
            ?.find((status) => status.participantsType === selectedParticipantsTab) // First filter by internal/external
            ?.studentsData?.find((data) => data.type === selectedTab) // Then filter by Attempted, Pending, Ongoing
            ?.studentDetails?.map((student) => {
                switch (selectedTab) {
                    case "Attempted":
                        return {
                            status: selectedTab,
                            id: student.userId,
                            full_name: student.name,
                            package_session_id: student.batch || "-", // Batch might not exist for external users
                            institute_enrollment_id: student.enrollmentNumber || "-", // Enrollment number might be missing
                            gender: student.gender,
                            attempt_date: student.attemptDate,
                            start_time: student.startTime,
                            end_time: student.endTime,
                            duration: student.duration,
                            marks: `${student.scoredMarks}/${student.totalMarks}`,
                        };
                    case "Pending":
                        return {
                            status: selectedTab,
                            id: student.userId,
                            full_name: student.name,
                            package_session_id: student.batch || "-",
                            institute_enrollment_id: student.enrollmentNumber || "-",
                            gender: student.gender,
                            mobile_number: student.phoneNo,
                            email: student.email,
                            city: student.city,
                            state: student.state,
                        };
                    case "Ongoing":
                        return {
                            status: selectedTab,
                            id: student.userId,
                            full_name: student.name,
                            package_session_id: student.batch || "-",
                            institute_enrollment_id: student.enrollmentNumber || "-",
                            gender: student.gender,
                            start_time: student.startTime,
                        };
                    default:
                        return {};
                }
            }) || [];

    // const studentTableData =
    //     overviewTabCloseTestData.assessmentStatus
    //         ?.find((status) => status.type === selectedTab)
    //         ?.studentDetails?.map((student) => {
    //             switch (selectedTab) {
    //                 case "Attempted":
    //                     return {
    //                         status: selectedTab,
    //                         id: student.userId,
    //                         full_name: student.name,
    //                         package_session_id: student.batch,
    //                         institute_enrollment_id: student.enrollmentNumber,
    //                         gender: student.gender,
    //                         attempt_date: student.attemptDate,
    //                         start_time: student.startTime,
    //                         end_time: student.endTime,
    //                         duration: student.duration,
    //                         marks: `${student.scoredMarks}/${student.totalMarks}`,
    //                     };
    //                 case "Pending":
    //                     return {
    //                         status: selectedTab,
    //                         id: student.userId,
    //                         full_name: student.name,
    //                         package_session_id: student.batch,
    //                         institute_enrollment_id: student.enrollmentNumber,
    //                         gender: student.gender,
    //                         mobile_number: student.phoneNo,
    //                         email: student.email,
    //                         city: student.city,
    //                         state: student.state,
    //                     };
    //                 case "Ongoing":
    //                     return {
    //                         status: selectedTab,
    //                         id: student.userId,
    //                         full_name: student.name,
    //                         package_session_id: student.batch,
    //                         institute_enrollment_id: student.enrollmentNumber,
    //                         gender: student.gender,
    //                         start_time: student.startTime,
    //                     };
    //                 default:
    //                     return {};
    //             }
    //         }) || [];

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

    const allColumns = {
        Attempted: assessmentStatusStudentAttemptedColumns,
        Pending: assessmentStatusStudentPendingColumns,
        Ongoing: assessmentStatusStudentOngoingColumns,
    };

    return (
        <>
            <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
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
                    onValueChange={setSelectedParticipantsTab}
                    className="flex justify-end rounded-lg bg-white p-0 pr-4 shadow-none"
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
                <div className="max-h-[72vh] overflow-y-auto p-4">
                    <TabsContent value={selectedTab}>
                        <MyTable<StudentTable>
                            data={{
                                content: studentTableData,
                                total_pages: Math.ceil(studentTableData.length / 10),
                            }}
                            columns={allColumns[selectedTab]}
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

export default QuestionAssessmentStatus;
