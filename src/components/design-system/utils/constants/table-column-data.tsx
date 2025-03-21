import { ColumnDef, Row } from "@tanstack/react-table";
import { StudentTable } from "@/schemas/student/student-list/table-schema";
import { ArrowSquareOut, CaretUpDown, Info } from "@phosphor-icons/react";
import { Checkbox } from "@/components/ui/checkbox";
import { MyDropdown } from "../../dropdown";
import { useGetStudentBatch } from "@/hooks/student-list-section/useGetStudentBatch";
import { ActivityStatus } from "../types/chips-types";
import { StatusChips } from "../../chips";
import { StudentMenuOptions } from "../../table-components/student-menu-options/student-menu-options";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useActivityStatsStore } from "@/stores/study-library/activity-stats-store";
import { useContentStore } from "@/stores/study-library/chapter-sidebar-store";
import { useState } from "react";
import { LogDetailsDialog } from "@/components/common/students/students-list/student-side-view/student-learning-progress/chapter-details/topic-details/log-details-dialog";
import { useStudentSidebar } from "@/context/selected-student-sidebar-context";

interface CustomTableMeta {
    onSort?: (columnId: string, direction: string) => void;
}

export interface ActivityLogType {
    activityDate: string;
    startTime: string;
    endTime: string;
    duration: string;
    lastPageRead: number;
    videos: {
        id: string;
        start_time_in_millis: number;
        end_time_in_millis: number;
    }[];
    documents: {
        id: string;
        start_time_in_millis: number;
        end_time_in_millis: number;
        page_number: number;
    }[];
}

const BatchCell = ({ package_session_id }: { package_session_id: string }) => {
    const { packageName, levelName } = useGetStudentBatch(package_session_id);
    return (
        <div>
            {levelName} {packageName}
        </div>
    );
};

const DetailsCell = ({ row }: { row: Row<StudentTable> }) => {
    const { setSelectedStudent } = useStudentSidebar();

    return (
        <SidebarTrigger
            onClick={() => {
                setSelectedStudent(row.original);
            }}
        >
            <ArrowSquareOut className="size-10 cursor-pointer text-neutral-600" />
        </SidebarTrigger>
    );
};

const InfoCell = ({ row }: { row: Row<ActivityLogType> }) => {
    const [isLogDetailsOpen, setIsLogDetailsOpen] = useState(false);

    return (
        <>
            <Info
                size={20}
                className="cursor-pointer text-primary-500"
                onClick={() => setIsLogDetailsOpen(true)}
            />
            <LogDetailsDialog
                isOpen={isLogDetailsOpen}
                onClose={() => setIsLogDetailsOpen(false)}
                logData={row.original}
            />
        </>
    );
};

export const myColumns: ColumnDef<StudentTable>[] = [
    {
        id: "checkbox",
        header: ({ table }) => (
            <Checkbox
                checked={table.getIsAllRowsSelected()}
                onCheckedChange={(value) => table.toggleAllRowsSelected(!!value)}
                className="border-neutral-400 bg-white text-neutral-600 data-[state=checked]:bg-primary-500 data-[state=checked]:text-white"
            />
        ),
        cell: ({ row }) => (
            <Checkbox
                checked={row.getIsSelected()}
                onCheckedChange={(value) => row.toggleSelected(!!value)}
                className="flex size-4 items-center justify-center border-neutral-400 text-neutral-600 shadow-none data-[state=checked]:bg-primary-500 data-[state=checked]:text-white"
            />
        ),
    },
    {
        id: "details",
        header: "Details",
        cell: ({ row }) => <DetailsCell row={row} />,
    },
    {
        accessorKey: "full_name",
        header: (props) => {
            const meta = props.table.options.meta as CustomTableMeta;
            return (
                <div className="relative">
                    <MyDropdown
                        dropdownList={["ASC", "DESC"]}
                        onSelect={(value) => {
                            if (typeof value == "string") meta.onSort?.("full_name", value);
                        }}
                    >
                        <button className="flex w-full cursor-pointer items-center justify-between">
                            <div>Student Name</div>
                            <div>
                                <CaretUpDown />
                            </div>
                        </button>
                    </MyDropdown>
                </div>
            );
        },
    },
    {
        accessorKey: "username",
        header: "Username",
    },
    {
        accessorKey: "package_session_id",
        header: "Batch",
        cell: ({ row }) => <BatchCell package_session_id={row.original.package_session_id} />,
    },
    {
        accessorKey: "institute_enrollment_id",
        header: "Enrollment Number",
    },
    {
        accessorKey: "linked_institute_name",
        header: "College/School",
    },
    {
        accessorKey: "gender",
        header: "Gender",
    },
    {
        accessorKey: "mobile_number",
        header: "Mobile Number",
    },
    {
        accessorKey: "email",
        header: "Email ID",
    },
    {
        accessorKey: "father_name",
        header: "Father's Name",
    },
    {
        accessorKey: "mother_name",
        header: "Mother's Name",
    },
    {
        accessorKey: "guardian_name",
        header: "Guardian's Name",
    },
    {
        accessorKey: "parents_mobile_number",
        header: "Parent/Guardian's Mobile Number",
    },
    {
        accessorKey: "parents_email",
        header: "Parent/Guardian's Email ID",
    },
    {
        accessorKey: "city",
        header: "City",
    },
    {
        accessorKey: "region",
        header: "State",
    },
    {
        accessorKey: "expiry_date",
        header: "Session Expiry",
        cell: ({ row }) => {
            if (row.original.expiry_date == null) return <></>;

            const expiryDate = new Date(row.original.expiry_date);
            const today = new Date();

            // Use getTime() to get timestamps in milliseconds
            const diffTime = expiryDate.getTime() - today.getTime();
            const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            return (
                <div
                    className={`${
                        daysLeft < 30
                            ? "text-danger-600"
                            : daysLeft < 180
                              ? "text-warning-500"
                              : "text-success-500"
                    }`}
                >
                    {daysLeft > 0 && daysLeft}
                </div>
            );
        },
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
            const status = row.original.status;
            const statusMapping: Record<string, ActivityStatus> = {
                ACTIVE: "active",
                TERMINATED: "inactive",
            };

            const mappedStatus = statusMapping[status] || "inactive";
            return <StatusChips status={mappedStatus} />;
        },
    },
    {
        id: "options",
        header: "",
        cell: ({ row }) => (
            <StudentMenuOptions student={row.original} /> // Pass the row.original which contains the student data
        ),
    },
];

export interface ActivityLogDialogProps {
    isOpen: boolean;
    onClose: () => void;
    activityData: ActivityLogType[];
    topicName: string;
    studyType: string;
}

const LastPageReadHeader = () => {
    const { activeItem } = useContentStore();
    return (
        <>
            {activeItem?.video_url != null || activeItem?.published_url != null
                ? "Percentage Watched"
                : "Total Pages Read"}
        </>
    );
};

export const activityLogColumns: ColumnDef<ActivityLogType>[] = [
    {
        accessorKey: "activityDate",
        header: "Activity Date",
    },
    {
        accessorKey: "startTime",
        header: "Start Time",
    },
    {
        accessorKey: "endTime",
        header: "End Time",
    },
    {
        accessorKey: "duration",
        header: "Duration",
    },
    {
        accessorKey: "lastPageRead",
        header: () => <LastPageReadHeader />,
    },
    {
        accessorKey: "Details",
        header: "Info",
        cell: ({ row }) => <InfoCell row={row} />,
    },
];

export interface ActivityStatsColumnsType {
    id: string;
    user_id: string;
    full_name: string;
    institute_enrollment_id: string;
    username: string;
    time_spent: string;
    last_active: string;
}

export const ActivityStatsColumns: ColumnDef<ActivityStatsColumnsType>[] = [
    {
        accessorKey: "details",
        header: "Details",
        cell: ({ row }) => {
            // Create a regular function to handle the click
            const handleClick = () => {
                const store = useActivityStatsStore.getState();
                store.openDialog(row.original.user_id);
            };

            return (
                <ArrowSquareOut
                    className="size-5 cursor-pointer text-neutral-500"
                    onClick={handleClick}
                />
            );
        },
    },
    {
        accessorKey: "full_name",
        header: "Student Name",
    },
    {
        accessorKey: "institute_enrollment_id",
        header: "Enrollment Number",
    },
    {
        accessorKey: "username",
        header: "User Name",
    },
    {
        accessorKey: "time_spent",
        header: "Time Spent",
    },
    {
        accessorKey: "last_active",
        header: "Last Active",
    },
];
