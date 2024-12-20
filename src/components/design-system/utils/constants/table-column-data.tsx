import { ColumnDef } from "@tanstack/react-table";
import { StudentTable } from "@/schemas/student-list/table-schema";
import { ArrowSquareOut, DotsThree, CaretUp, CaretDown } from "@phosphor-icons/react";
import { Checkbox } from "@/components/ui/checkbox";
import { MyButton } from "../../button";
import { MyDropdown } from "../../dropdown";
import { useGetStudentBatch } from "@/hooks/student-list-section/useGetStudentBatch";
import { ActivityStatus } from "../types/chips-types";
import { StatusChips } from "../../chips";

interface CustomTableMeta {
    onSort?: (columnId: string, direction: string) => void;
}

const BatchCell = ({ package_session_id }: { package_session_id: string }) => {
    const batchName = useGetStudentBatch(package_session_id);
    return <div>{batchName}</div>;
};

export const myColumns: ColumnDef<StudentTable>[] = [
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
        cell: () => <ArrowSquareOut className="size-6 cursor-pointer text-neutral-600" />,
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
        accessorKey: "session_expiry_days",
        header: "Session Expiry",
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
    {
        id: "options",
        header: "",
        cell: () => (
            <MyButton
                buttonType="secondary"
                scale="small"
                layoutVariant="icon"
                className="flex items-center justify-center"
            >
                <DotsThree />
            </MyButton>
        ),
    },
];
