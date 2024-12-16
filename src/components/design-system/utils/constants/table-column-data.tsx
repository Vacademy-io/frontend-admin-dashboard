import { ColumnDef } from "@tanstack/react-table";
import { StudentTable } from "@/schemas/student/student-list/table-schema";
import { ArrowSquareOut, CaretUpDown } from "@phosphor-icons/react";
import { Checkbox } from "@/components/ui/checkbox";
import { MyDropdown } from "../../dropdown";
import { StudentMenuOptions } from "../../table-components/student-menu-options/student-menu-options";

interface CustomTableMeta {
    onSort?: (columnId: string, direction: string) => void;
}

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
                                <CaretUpDown />
                            </div>
                        </button>
                    </MyDropdown>
                </div>
            );
        },
    },
    {
        accessorKey: "batch_id",
        header: "Batch",
    },
    {
        accessorKey: "enrollment_no",
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
        accessorKey: "session_expiry",
        header: "Session Expiry",
    },
    {
        accessorKey: "status",
        header: "Status",
        // cell: ({ row }) => <StatusChips status={row.getValue("status") as ActivityStatus} />,
    },
    {
        id: "options",
        header: "",
        cell: ({ row }) => (
            <StudentMenuOptions student={row.original} /> // Pass the row.original which contains the student data
        ),
    },
];
