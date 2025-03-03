import { SidebarMenuItem } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { MyButton } from "@/components/design-system/button";
import { PencilSimpleLine } from "@phosphor-icons/react";
import { ProgressBar } from "@/components/design-system/progress-bar";
import { useStudentSidebar } from "@/context/selected-student-sidebar-context";
import { useEffect, useState } from "react";
import { OverViewData, OverviewDetailsType } from "../student-view-dummy-data/overview";
import { useInstituteDetailsStore } from "@/stores/students/students-list/useInstituteDetailsStore";

export const StudentOverview = () => {
    const { selectedStudent } = useStudentSidebar();
    const [overviewData, setOverviewData] = useState<OverviewDetailsType[] | null>(null);

    const { getDetailsFromPackageSessionId, instituteDetails } = useInstituteDetailsStore();

    useEffect(() => {
        const details = getDetailsFromPackageSessionId({
            packageSessionId: selectedStudent?.package_session_id || "",
        });
        setOverviewData(
            OverViewData({ selectedStudent: selectedStudent, packageSessionDetails: details }),
        );
    }, [selectedStudent, instituteDetails]);

    return (
        <div className="flex flex-col gap-10 text-neutral-600">
            <SidebarMenuItem className="flex w-full flex-col gap-2">
                <div className="flex gap-2">
                    <div className="text-subtitle font-semibold">Session Expiry (Days)</div>
                    <span className="text-subtitle font-semibold text-success-600">
                        {selectedStudent?.expiry_date || 0}
                    </span>
                </div>
                <ProgressBar progress={selectedStudent?.expiry_date || 0} />
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
                                                Student details not available
                                            </p>
                                        )}
                                    </div>
                                </div>
                                <MyButton buttonType="secondary" scale="small" layoutVariant="icon">
                                    <PencilSimpleLine size={14} />
                                </MyButton>
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
