import { useState } from "react";
import { ArrowCounterClockwise, Clock, Export } from "phosphor-react";
import { Crown, Person } from "@/svgs";
import { MyPagination } from "@/components/design-system/pagination";
import { AssessmentDetailsSearchComponent } from "./SearchComponent";
import { MyButton } from "@/components/design-system/button";
import { getInstituteId } from "@/constants/helper";
import { Route } from "..";
import { useMutation, useSuspenseQuery } from "@tanstack/react-query";
import {
    getStudentLeaderboardDetails,
    handleGetLeaderboardData,
} from "../-services/assessment-details-services";
import { DashboardLoader } from "@/components/core/dashboard-loader";
import { useInstituteQuery } from "@/services/student-list-section/getInstituteDetails";
import {
    calculateIndividualPercentile,
    calculatePercentiles,
    getBatchNameById,
} from "../-utils/helper";
import { StudentLeaderboard } from "@/types/assessment-overview";
export interface AssessmentStudentLeaderboardInterface {
    name: string;
    status: string[];
    sort_columns: Record<string, string>;
}

const AssessmentStudentLeaderboard = () => {
    const { data: instituteDetails } = useSuspenseQuery(useInstituteQuery());
    const { batches_for_sessions } = instituteDetails || {};
    console.log(instituteDetails);
    const instituteId = getInstituteId();
    const { assessmentId } = Route.useParams();
    const [selectedFilter] = useState<AssessmentStudentLeaderboardInterface>({
        name: "",
        status: [],
        sort_columns: {},
    });
    const [searchText, setSearchText] = useState("");
    const [pageNo, setPageNo] = useState(0);
    const { data, isLoading } = useSuspenseQuery(
        handleGetLeaderboardData({
            assessmentId,
            instituteId,
            pageNo,
            pageSize: 10,
            selectedFilter,
        }),
    );
    const studentDataWithPercentile = calculatePercentiles(data.content);

    const [studentLeaderboardData, setStudentLeaderboardData] = useState(data);

    const getStudentLeaderboardData = useMutation({
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
            selectedFilter: AssessmentStudentLeaderboardInterface;
        }) =>
            getStudentLeaderboardDetails(
                assessmentId,
                instituteId,
                pageNo,
                pageSize,
                selectedFilter,
            ),
        onSuccess: (data) => {
            setStudentLeaderboardData(data);
        },
        onError: (error: unknown) => {
            throw error;
        },
    });

    const clearSearch = () => {
        setSearchText("");
        selectedFilter["name"] = "";
        getStudentLeaderboardData.mutate({
            assessmentId,
            instituteId,
            pageNo,
            pageSize: 10,
            selectedFilter,
        });
    };

    const handleSearch = (searchValue: string) => {
        setSearchText(searchValue);
        getStudentLeaderboardData.mutate({
            assessmentId,
            instituteId,
            pageNo,
            pageSize: 10,
            selectedFilter: {
                ...selectedFilter,
                name: searchValue,
            },
        });
    };
    const handlePageChange = (newPage: number) => {
        setPageNo(newPage);
    };

    if (isLoading) return <DashboardLoader />;

    return (
        <div className="flex w-1/2 flex-col gap-4 rounded-xl border bg-neutral-50 p-4">
            <div className="flex items-center justify-between">
                <h1>Leaderboard</h1>
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
                    >
                        <ArrowCounterClockwise size={32} />
                    </MyButton>
                </div>
            </div>
            <AssessmentDetailsSearchComponent
                onSearch={handleSearch}
                searchText={searchText}
                setSearchText={setSearchText}
                clearSearch={clearSearch}
            />
            <div className="flex max-h-[60vh] flex-col gap-4 overflow-y-auto">
                {studentLeaderboardData.content?.map((student: StudentLeaderboard, idx: number) => {
                    return (
                        <div
                            key={idx}
                            className={`flex items-center justify-between rounded-xl border ${
                                student.rank === 1 ? "bg-primary-50" : "bg-white"
                            } p-4`}
                        >
                            <div className="flex items-center gap-4">
                                <span>{student.rank}</span>
                                {student.rank === 1 ? (
                                    <div>
                                        <Crown />
                                        <Person />
                                    </div>
                                ) : (
                                    <Person />
                                )}
                                <div className="flex flex-col">
                                    <span>{student.student_name}</span>
                                    <span className="text-[12px]">
                                        {getBatchNameById(batches_for_sessions, student.batch_id)}
                                    </span>
                                </div>
                            </div>
                            <div className="flex flex-col gap-2">
                                <div className="flex items-center gap-2">
                                    <Clock size={18} className="text-neutral-600" />
                                    <span className="text-sm text-neutral-500">
                                        {Math.floor(student.completion_time_in_seconds / 60)} min{" "}
                                        {student.completion_time_in_seconds % 60} sec
                                    </span>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="flex flex-col text-neutral-500">
                                        <span className="text-[12px]">Percentile</span>
                                        <span>
                                            {calculateIndividualPercentile(
                                                studentDataWithPercentile,
                                                student.user_id,
                                            )}
                                        </span>
                                    </div>
                                    <div className="flex flex-col text-center text-neutral-500">
                                        <span className="text-[12px]">Marks</span>
                                        <span>{student.achieved_marks}/20</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
                <MyPagination
                    currentPage={pageNo}
                    totalPages={studentLeaderboardData.total_pages}
                    onPageChange={handlePageChange}
                />
            </div>
        </div>
    );
};

export default AssessmentStudentLeaderboard;
