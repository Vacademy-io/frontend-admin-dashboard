import { EnrollStudentsButton } from "./enroll-students-button";
import { EmptyDashboardImage } from "@/assets/svgs";

export const EmptyDashboard = () => {
    return (
        <div
            className={`flex w-full flex-col items-center justify-center gap-4 rounded-md bg-neutral-50 py-10`}
            style={{ height: `calc(100vh - 160px)` }}
        >
            <EmptyDashboardImage />
            <div className="text-title font-regular text-neutral-600">
                No student data available
            </div>
            <EnrollStudentsButton />
        </div>
    );
};
