import { ColumnDef } from "@tanstack/react-table";
import { StudentTable } from "@/schemas/student-list/table-schema";
import { CaretUp, CaretDown } from "@phosphor-icons/react";
import { Checkbox } from "@/components/ui/checkbox";
import { useGetStudentBatch } from "@/hooks/student-list-section/useGetStudentBatch";
import { MyDropdown } from "@/components/design-system/dropdown";
import { ActivityStatus } from "@/components/design-system/utils/types/chips-types";
import { StatusChips } from "@/components/design-system/chips";

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

export const myAssessmentColumns: ColumnDef<StudentTable>[] = [
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
        accessorKey: "city",
        header: "City",
    },
    {
        accessorKey: "region",
        header: "State",
    },
    {
        accessorKey: "region",
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
];
