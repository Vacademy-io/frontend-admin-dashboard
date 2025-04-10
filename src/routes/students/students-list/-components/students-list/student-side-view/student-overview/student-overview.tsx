import { SidebarMenuItem } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { ProgressBar } from "@/components/design-system/progress-bar";
import { useStudentSidebar } from "@/routes/students/students-list/-context/selected-student-sidebar-context";
import { useEffect, useState } from "react";
import { OverViewData, OverviewDetailsType } from "./overview";
import { useInstituteDetailsStore } from "@/stores/students/students-list/useInstituteDetailsStore";
import { EditStudentDetails } from "./EditStudentDetails";
import { useStudentCredentialsStore } from "@/stores/students/students-list/useStudentCredentialsStore";

export const StudentOverview = () => {
    const { selectedStudent } = useStudentSidebar();
    const [overviewData, setOverviewData] = useState<OverviewDetailsType[] | null>(null);
    const [daysUntilExpiry, setDaysUntilExpiry] = useState<number>(0);

    const { getDetailsFromPackageSessionId, instituteDetails } = useInstituteDetailsStore();
    const { getCredentials } = useStudentCredentialsStore();
    const [password, setPassword] = useState(
        getCredentials(selectedStudent?.user_id || "")?.password || "password not found",
    );

    useEffect(() => {
        if (selectedStudent) {
            const credentials = getCredentials(selectedStudent.user_id);
            setPassword(credentials?.password || "password not found");
        }
    }, [selectedStudent]);

    useEffect(() => {
        const details = getDetailsFromPackageSessionId({
            packageSessionId: selectedStudent?.package_session_id || "",
        });
        setOverviewData(
            OverViewData({
                selectedStudent: selectedStudent,
                packageSessionDetails: details,
                password: password,
            }),
        );

        // Calculate days until expiry
        if (selectedStudent?.expiry_date) {
            const expiryDate = new Date(selectedStudent.expiry_date);
            const currentDate = new Date();

            // Calculate the difference in milliseconds
            const diffTime = expiryDate.getTime() - currentDate.getTime();

            // Convert to days and round down
            const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

            // Set the days until expiry (0 if negative)
            setDaysUntilExpiry(diffDays > 0 ? diffDays : 0);
        } else {
            setDaysUntilExpiry(0);
        }
    }, [selectedStudent, instituteDetails, password]);

    return (
        <div className="flex flex-col gap-10 text-neutral-600">
            <EditStudentDetails selectedStudent={selectedStudent} />
            <SidebarMenuItem className="flex w-full flex-col gap-2">
                <div className="flex gap-2">
                    <div className="text-subtitle font-semibold">Session Expiry (Days)</div>
                    <span
                        className={`text-subtitle font-semibold ${
                            daysUntilExpiry >= 180
                                ? "text-success-600"
                                : daysUntilExpiry >= 30
                                  ? "text-warning-600"
                                  : "text-danger-600"
                        }`}
                    >
                        {daysUntilExpiry}
                    </span>
                </div>
                <ProgressBar progress={daysUntilExpiry} />
            </SidebarMenuItem>
            <SidebarMenuItem className="flex flex-col gap-10">
                {selectedStudent != null ? (
                    overviewData?.map((studentDetail, key) => (
                        <div key={key} className="flex flex-col gap-10">
                            <div className="flex justify-between">
                                <div className="flex flex-col gap-2">
                                    <div className="text-subtitle font-semibold text-neutral-600">
                                        {studentDetail.heading}
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        {studentDetail.content &&
                                        studentDetail.content.length > 0 ? (
                                            studentDetail.content.map((obj, key2) => (
                                                <div className="text-body" key={key2}>
                                                    {obj}
                                                </div>
                                            ))
                                        ) : (
                                            <p className="py-4 text-center text-subtitle">
                                                {" "}
                                                S tudent details not available
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <Separator />
                        </div>
                    ))
                ) : (
                    <p className="py-4 text-center text-subtitle">No overview data available</p>
                )}
            </SidebarMenuItem>
        </div>
    );
};
