import { ColumnDef } from "@tanstack/react-table";
import { CaretUp, CaretDown } from "@phosphor-icons/react";
import { Checkbox } from "@/components/ui/checkbox";
import { useGetStudentBatch } from "@/hooks/student-list-section/useGetStudentBatch";
import { MyDropdown } from "@/components/design-system/dropdown";
import { StudentTable } from "@/schemas/student/student-list/table-schema";
import { AssessmentStatusOptions } from "../-components/AssessmentStatusOptions";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ArrowSquareOut } from "phosphor-react";

interface CustomTableMeta {
    onSort?: (columnId: string, direction: string) => void;
}

const BatchCell = ({ package_session_id }: { package_session_id: string }) => {
    const { packageName, levelName } = useGetStudentBatch(package_session_id);
    return (
        <div>
            {levelName} {packageName}
        </div>
    );
};

export const assessmentStatusStudentAttemptedColumnsInternal: ColumnDef<StudentTable>[] = [
    {
        id: "checkbox",
        header: ({ table }) => (
            <Checkbox
                checked={table.getIsAllRowsSelected()}
                onCheckedChange={(value) => table.toggleAllRowsSelected(!!value)}
                className="border-neutral-400 bg-white text-neutral-600"
            />
        ),
        cell: ({ row }) => (
            <Checkbox
                checked={row.getIsSelected()}
                onCheckedChange={(value) => row.toggleSelected(!!value)}
                className="flex size-4 items-center justify-center border-neutral-400 text-neutral-600 shadow-none"
            />
        ),
    },
    {
        id: "details",
        header: "Details",
        cell: () => (
            <SidebarTrigger>
                <ArrowSquareOut className="size-10 cursor-pointer text-neutral-600" />
            </SidebarTrigger>
        ),
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
                            meta.onSort?.("full_name", value);
                        }}
                    >
                        <button className="flex w-full cursor-pointer items-center justify-between">
                            <div>Student Name</div>
                            <div>
                                <CaretUp />
                                <CaretDown />
                            </div>
                        </button>
                    </MyDropdown>
                </div>
            );
        },
    },
    {
        accessorKey: "package_session_id",
        header: "Batch",
        cell: ({ row }) => <BatchCell package_session_id={row.original.package_session_id} />,
    },
    {
        accessorKey: "attempt_date",
        header: "Attempt Date",
    },
    {
        accessorKey: "start_time",
        header: "Start Time",
    },
    {
        accessorKey: "end_time",
        header: "End Time",
    },
    {
        accessorKey: "duration",
        header: "Duration",
    },
    {
        accessorKey: "score",
        header: "Score",
    },
    {
        accessorKey: "evaluation_status",
        header: "Evaluation Status",
    },
    {
        id: "options",
        header: "",
        cell: ({ row }) => <AssessmentStatusOptions student={row.original} />,
    },
];

export const assessmentStatusStudentOngoingColumnsInternal: ColumnDef<StudentTable>[] = [
    {
        id: "checkbox",
        header: ({ table }) => (
            <Checkbox
                checked={table.getIsAllRowsSelected()}
                onCheckedChange={(value) => table.toggleAllRowsSelected(!!value)}
                className="border-neutral-400 bg-white text-neutral-600"
            />
        ),
        cell: ({ row }) => (
            <Checkbox
                checked={row.getIsSelected()}
                onCheckedChange={(value) => row.toggleSelected(!!value)}
                className="flex size-4 items-center justify-center border-neutral-400 text-neutral-600 shadow-none"
            />
        ),
    },
    {
        id: "details",
        header: "Details",
        cell: () => (
            <SidebarTrigger>
                <ArrowSquareOut className="size-10 cursor-pointer text-neutral-600" />
            </SidebarTrigger>
        ),
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
                            meta.onSort?.("full_name", value);
                        }}
                    >
                        <button className="flex w-full cursor-pointer items-center justify-between">
                            <div>Student Name</div>
                            <div>
                                <CaretUp />
                                <CaretDown />
                            </div>
                        </button>
                    </MyDropdown>
                </div>
            );
        },
    },
    {
        accessorKey: "start_time",
        header: "Start Time",
    },
    {
        id: "options",
        header: "",
        cell: ({ row }) => <AssessmentStatusOptions student={row.original} />,
    },
];

export const assessmentStatusStudentPendingColumnsInternal: ColumnDef<StudentTable>[] = [
    {
        id: "checkbox",
        header: ({ table }) => (
            <Checkbox
                checked={table.getIsAllRowsSelected()}
                onCheckedChange={(value) => table.toggleAllRowsSelected(!!value)}
                className="border-neutral-400 bg-white text-neutral-600"
            />
        ),
        cell: ({ row }) => (
            <Checkbox
                checked={row.getIsSelected()}
                onCheckedChange={(value) => row.toggleSelected(!!value)}
                className="flex size-4 items-center justify-center border-neutral-400 text-neutral-600 shadow-none"
            />
        ),
    },
    {
        id: "details",
        header: "Details",
        cell: () => (
            <SidebarTrigger>
                <ArrowSquareOut className="size-10 cursor-pointer text-neutral-600" />
            </SidebarTrigger>
        ),
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
                            meta.onSort?.("full_name", value);
                        }}
                    >
                        <button className="flex w-full cursor-pointer items-center justify-between">
                            <div>Student Name</div>
                            <div>
                                <CaretUp />
                                <CaretDown />
                            </div>
                        </button>
                    </MyDropdown>
                </div>
            );
        },
    },
    {
        id: "options",
        header: "",
        cell: ({ row }) => <AssessmentStatusOptions student={row.original} />,
    },
];

export const assessmentStatusStudentAttemptedColumnsExternal: ColumnDef<StudentTable>[] = [
    {
        id: "checkbox",
        header: ({ table }) => (
            <Checkbox
                checked={table.getIsAllRowsSelected()}
                onCheckedChange={(value) => table.toggleAllRowsSelected(!!value)}
                className="border-neutral-400 bg-white text-neutral-600"
            />
        ),
        cell: ({ row }) => (
            <Checkbox
                checked={row.getIsSelected()}
                onCheckedChange={(value) => row.toggleSelected(!!value)}
                className="flex size-4 items-center justify-center border-neutral-400 text-neutral-600 shadow-none"
            />
        ),
    },
    {
        id: "details",
        header: "Details",
        cell: () => (
            <SidebarTrigger>
                <ArrowSquareOut className="size-10 cursor-pointer text-neutral-600" />
            </SidebarTrigger>
        ),
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
                            meta.onSort?.("full_name", value);
                        }}
                    >
                        <button className="flex w-full cursor-pointer items-center justify-between">
                            <div>Student Name</div>
                            <div>
                                <CaretUp />
                                <CaretDown />
                            </div>
                        </button>
                    </MyDropdown>
                </div>
            );
        },
    },
    {
        accessorKey: "attempt_date",
        header: "Attempt Date",
    },
    {
        accessorKey: "start_time",
        header: "Start Time",
    },
    {
        accessorKey: "end_time",
        header: "End Time",
    },
    {
        accessorKey: "duration",
        header: "Duration",
    },
    {
        accessorKey: "score",
        header: "Score",
    },
    {
        accessorKey: "evaluation_status",
        header: "Evaluation Status",
    },
    {
        id: "options",
        header: "",
        cell: ({ row }) => <AssessmentStatusOptions student={row.original} />,
    },
];

export const assessmentStatusStudentOngoingColumnsExternal: ColumnDef<StudentTable>[] = [
    {
        id: "checkbox",
        header: ({ table }) => (
            <Checkbox
                checked={table.getIsAllRowsSelected()}
                onCheckedChange={(value) => table.toggleAllRowsSelected(!!value)}
                className="border-neutral-400 bg-white text-neutral-600"
            />
        ),
        cell: ({ row }) => (
            <Checkbox
                checked={row.getIsSelected()}
                onCheckedChange={(value) => row.toggleSelected(!!value)}
                className="flex size-4 items-center justify-center border-neutral-400 text-neutral-600 shadow-none"
            />
        ),
    },
    {
        id: "details",
        header: "Details",
        cell: () => (
            <SidebarTrigger>
                <ArrowSquareOut className="size-10 cursor-pointer text-neutral-600" />
            </SidebarTrigger>
        ),
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
                            meta.onSort?.("full_name", value);
                        }}
                    >
                        <button className="flex w-full cursor-pointer items-center justify-between">
                            <div>Student Name</div>
                            <div>
                                <CaretUp />
                                <CaretDown />
                            </div>
                        </button>
                    </MyDropdown>
                </div>
            );
        },
    },
    {
        accessorKey: "start_time",
        header: "Start Time",
    },
    {
        id: "options",
        header: "",
        cell: ({ row }) => <AssessmentStatusOptions student={row.original} />,
    },
];

export const assessmentStatusStudentPendingColumnsExternal: ColumnDef<StudentTable>[] = [
    {
        id: "checkbox",
        header: ({ table }) => (
            <Checkbox
                checked={table.getIsAllRowsSelected()}
                onCheckedChange={(value) => table.toggleAllRowsSelected(!!value)}
                className="border-neutral-400 bg-white text-neutral-600"
            />
        ),
        cell: ({ row }) => (
            <Checkbox
                checked={row.getIsSelected()}
                onCheckedChange={(value) => row.toggleSelected(!!value)}
                className="flex size-4 items-center justify-center border-neutral-400 text-neutral-600 shadow-none"
            />
        ),
    },
    {
        id: "details",
        header: "Details",
        cell: () => (
            <SidebarTrigger>
                <ArrowSquareOut className="size-10 cursor-pointer text-neutral-600" />
            </SidebarTrigger>
        ),
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
                            meta.onSort?.("full_name", value);
                        }}
                    >
                        <button className="flex w-full cursor-pointer items-center justify-between">
                            <div>Student Name</div>
                            <div>
                                <CaretUp />
                                <CaretDown />
                            </div>
                        </button>
                    </MyDropdown>
                </div>
            );
        },
    },
    {
        id: "options",
        header: "",
        cell: ({ row }) => <AssessmentStatusOptions student={row.original} />,
    },
];

export const assessmentStatusStudentQuestionResponseInternal: ColumnDef<StudentTable>[] = [
    {
        accessorKey: "full_name",
        header: (props) => {
            const meta = props.table.options.meta as CustomTableMeta;
            return (
                <div className="relative">
                    <MyDropdown
                        dropdownList={["ASC", "DESC"]}
                        onSelect={(value) => {
                            meta.onSort?.("full_name", value);
                        }}
                    >
                        <button className="flex w-full cursor-pointer items-center justify-between">
                            <div>Student Name</div>
                            <div>
                                <CaretUp />
                                <CaretDown />
                            </div>
                        </button>
                    </MyDropdown>
                </div>
            );
        },
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
        accessorKey: "gender",
        header: "Gender",
    },
    {
        accessorKey: "responseTime",
        header: "Response Time",
    },
];

export const assessmentStatusStudentQuestionResponseExternal: ColumnDef<StudentTable>[] = [
    {
        accessorKey: "full_name",
        header: (props) => {
            const meta = props.table.options.meta as CustomTableMeta;
            return (
                <div className="relative">
                    <MyDropdown
                        dropdownList={["ASC", "DESC"]}
                        onSelect={(value) => {
                            meta.onSort?.("full_name", value);
                        }}
                    >
                        <button className="flex w-full cursor-pointer items-center justify-between">
                            <div>Student Name</div>
                            <div>
                                <CaretUp />
                                <CaretDown />
                            </div>
                        </button>
                    </MyDropdown>
                </div>
            );
        },
    },
    {
        accessorKey: "gender",
        header: "Gender",
    },
    {
        accessorKey: "responseTime",
        header: "Response Time",
    },
];
