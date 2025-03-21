import { Badge } from "@/components/ui/badge";
import { Route } from "..";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useInstituteQuery } from "@/services/student-list-section/getInstituteDetails";
import { getAssessmentDetails } from "@/routes/assessment/create-assessment/$assessmentId/$examtype/-services/assessment-services";
import { DashboardLoader } from "@/components/core/dashboard-loader";

const AssessmentAccessControlTab = () => {
    const { assessmentId, examType } = Route.useParams();
    const { data: instituteDetails } = useSuspenseQuery(useInstituteQuery());
    const { data: assessmentDetails, isLoading } = useSuspenseQuery(
        getAssessmentDetails({
            assessmentId: assessmentId,
            instituteId: instituteDetails?.id,
            type: examType,
        }),
    );
    if (isLoading) return <DashboardLoader />;
    return (
        <div className="mt-4 flex flex-col gap-5">
            <div className="flex flex-col gap-3 rounded-xl border p-5">
                <h1 className="font-semibold">Assessment Creation Access</h1>
                <div className="flex flex-wrap items-center gap-4">
                    <div className="flex flex-wrap items-center gap-4">
                        {assessmentDetails[3]?.saved_data.creation_access.roles?.map((role) => (
                            <Badge
                                key={role}
                                className={`cursor-pointer rounded-lg border border-neutral-300 ${
                                    role === "EVALUATOR"
                                        ? "bg-[#F5F0FF]"
                                        : role === "CREATOR"
                                          ? "bg-[#FFF4F5]"
                                          : "bg-[#F4F9FF]"
                                } py-1.5 shadow-none`}
                            >
                                Role: {role}
                            </Badge>
                        ))}
                        {assessmentDetails[3]?.saved_data.creation_access.user_ids?.map((user) => (
                            <Badge
                                key={user}
                                className="whitespace-nowrap rounded-lg border border-neutral-300 bg-[#FFFDF5] py-1.5 shadow-none"
                            >
                                User: {user}
                            </Badge>
                        ))}
                    </div>
                </div>
            </div>
            <div className="flex flex-col gap-3 rounded-xl border p-5">
                <h1 className="font-semibold">Live Assessment Notifications</h1>
                <div className="flex items-center gap-4">
                    <div className="flex flex-wrap items-center gap-4">
                        {assessmentDetails[3]?.saved_data.live_assessment_access.roles?.map(
                            (role) => (
                                <Badge
                                    key={role}
                                    className={`cursor-pointer rounded-lg border border-neutral-300 ${
                                        role === "EVALUATOR"
                                            ? "bg-[#F5F0FF]"
                                            : role === "CREATOR"
                                              ? "bg-[#FFF4F5]"
                                              : "bg-[#F4F9FF]"
                                    } py-1.5 shadow-none`}
                                >
                                    Role: {role}
                                </Badge>
                            ),
                        )}
                        {assessmentDetails[3]?.saved_data.live_assessment_access.user_ids?.map(
                            (user) => (
                                <Badge
                                    key={user}
                                    className="whitespace-nowrap rounded-lg border border-neutral-300 bg-[#FFFDF5] py-1.5 shadow-none"
                                >
                                    User: {user}
                                </Badge>
                            ),
                        )}
                    </div>
                </div>
            </div>
            <div className="flex flex-col gap-3 rounded-xl border p-5">
                <h1 className="font-semibold">Assessment Submission & Reports Access</h1>
                <div className="flex items-center gap-4">
                    <div className="flex flex-wrap items-center gap-4">
                        {assessmentDetails[3]?.saved_data.report_and_submission_access.roles?.map(
                            (role) => (
                                <Badge
                                    key={role}
                                    className={`cursor-pointer rounded-lg border border-neutral-300 ${
                                        role === "EVALUATOR"
                                            ? "bg-[#F5F0FF]"
                                            : role === "CREATOR"
                                              ? "bg-[#FFF4F5]"
                                              : "bg-[#F4F9FF]"
                                    } py-1.5 shadow-none`}
                                >
                                    Role: {role}
                                </Badge>
                            ),
                        )}
                        {assessmentDetails[3]?.saved_data.report_and_submission_access.user_ids?.map(
                            (user) => (
                                <Badge
                                    key={user}
                                    className="whitespace-nowrap rounded-lg border border-neutral-300 bg-[#FFFDF5] py-1.5 shadow-none"
                                >
                                    User: {user}
                                </Badge>
                            ),
                        )}
                    </div>
                </div>
            </div>
            <div className="flex flex-col gap-3 rounded-xl border p-5">
                <h1 className="font-semibold">Evaluation Access</h1>
                <div className="flex items-center gap-4">
                    <div className="flex flex-wrap items-center gap-4">
                        {assessmentDetails[3]?.saved_data.evaluation_access.roles?.map((role) => (
                            <Badge
                                key={role}
                                className={`cursor-pointer rounded-lg border border-neutral-300 ${
                                    role === "EVALUATOR"
                                        ? "bg-[#F5F0FF]"
                                        : role === "CREATOR"
                                          ? "bg-[#FFF4F5]"
                                          : "bg-[#F4F9FF]"
                                } py-1.5 shadow-none`}
                            >
                                Role: {role}
                            </Badge>
                        ))}
                        {assessmentDetails[3]?.saved_data.evaluation_access.user_ids?.map(
                            (user) => (
                                <Badge
                                    key={user}
                                    className="whitespace-nowrap rounded-lg border border-neutral-300 bg-[#FFFDF5] py-1.5 shadow-none"
                                >
                                    User: {user}
                                </Badge>
                            ),
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AssessmentAccessControlTab;
