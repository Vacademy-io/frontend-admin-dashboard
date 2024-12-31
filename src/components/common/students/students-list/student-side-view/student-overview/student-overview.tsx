import { SidebarMenuItem } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { MyButton } from "@/components/design-system/button";
import { PencilSimpleLine } from "@phosphor-icons/react";
import { StudentOverviewType } from "../student-view-dummy-data/student-view-dummy-data";

interface ProgressBarProps {
    progress: number;
}

const ProgressBar = ({ progress }: ProgressBarProps) => {
    return (
        <div className="flex flex-col gap-1">
            <Progress value={progress} className="w-full bg-white [&>div]:bg-success-600" />
        </div>
    );
};

export const StudentOverview = ({ overviewData }: { overviewData: StudentOverviewType }) => {
    return (
        <div className="flex flex-col gap-10 text-neutral-600">
            <SidebarMenuItem className="flex w-full flex-col gap-2">
                <div className="flex gap-2">
                    <div className="text-subtitle font-semibold">Session Expiry (Days)</div>
                    <span className="text-subtitle font-semibold text-success-600">
                        {overviewData.session_expiry}
                    </span>
                </div>
                <ProgressBar progress={overviewData.session_expiry} />
            </SidebarMenuItem>
            <SidebarMenuItem className="flex flex-col gap-10">
                {overviewData.data.map((studentDetail, key) => (
                    <div key={key} className="flex flex-col gap-10">
                        <div className="flex justify-between">
                            <div className="flex flex-col gap-2">
                                <div className="text-subtitle font-semibold text-neutral-600">
                                    {studentDetail.heading}
                                </div>
                                <div className="flex flex-col gap-2">
                                    {studentDetail.content.map((obj, key2) => (
                                        <div className="text-body" key={key2}>
                                            {obj}
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <MyButton buttonType="secondary" scale="small" layoutVariant="icon">
                                <PencilSimpleLine size={14} />
                            </MyButton>
                        </div>
                        <Separator />
                    </div>
                ))}
            </SidebarMenuItem>
        </div>
    );
};
