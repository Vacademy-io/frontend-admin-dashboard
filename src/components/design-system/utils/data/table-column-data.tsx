import { ColumnDef, Row } from "@tanstack/react-table";
import { tableType } from "../schema/table-schema";
import { ArrowSquareOut, DotsThree } from "@phosphor-icons/react";
import { Checkbox } from "@/components/ui/checkbox";
import { MyButton } from "../../button";
import { StatusChips } from "../../chips";
import { ActivityStatus } from "../types/chips-types";
import { getSessionExpiryStatus } from "@/components/common/students/students-list/students-list-section";

const createStringFilterFn =
    () => (row: Row<tableType>, columnId: string, filterValue: string[]) => {
        const value = row.getValue(columnId) as string;
        return filterValue.length === 0 || filterValue.includes(value);
    };

export const myColumns: ColumnDef<tableType>[] = [
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
        cell: () => <ArrowSquareOut className="size-6 text-neutral-600" />,
    },
    {
        accessorKey: "studentName",
        header: "Student Name",
        filterFn: createStringFilterFn(),
        enableGlobalFilter: true,
    },
    {
        accessorKey: "batch",
        header: "Batch",
        filterFn: createStringFilterFn(),
        enableGlobalFilter: true,
    },
    {
        accessorKey: "enrollmentNumber",
        header: "Enrollment Number",
        filterFn: createStringFilterFn(),
        enableGlobalFilter: true,
    },
    {
        accessorKey: "collegeSchool",
        header: "College/School",
        filterFn: createStringFilterFn(),
        enableGlobalFilter: true,
    },
    {
        accessorKey: "gender",
        header: "Gender",
        filterFn: createStringFilterFn(),
        enableGlobalFilter: true,
    },
    {
        accessorKey: "mobileNumber",
        header: "Mobile Number",
        filterFn: createStringFilterFn(),
        enableGlobalFilter: true,
    },
    {
        accessorKey: "emailId",
        header: "Email ID",
        filterFn: createStringFilterFn(),
        enableGlobalFilter: true,
    },
    {
        accessorKey: "fatherName",
        header: "Father's Name",
        filterFn: createStringFilterFn(),
        enableGlobalFilter: true,
    },
    {
        accessorKey: "motherName",
        header: "Mother's Name",
        filterFn: createStringFilterFn(),
        enableGlobalFilter: true,
    },
    {
        accessorKey: "guardianName",
        header: "Guardian's Name",
        filterFn: createStringFilterFn(),
        enableGlobalFilter: true,
    },
    {
        accessorKey: "guardianNumber",
        header: "Parent/Guardian's Mobile Number",
        filterFn: createStringFilterFn(),
        enableGlobalFilter: true,
    },
    {
        accessorKey: "guardianEmail",
        header: "Parent/Guardian's Email ID",
        filterFn: createStringFilterFn(),
        enableGlobalFilter: true,
    },
    {
        accessorKey: "city",
        header: "City",
        filterFn: createStringFilterFn(),
        enableGlobalFilter: true,
    },
    {
        accessorKey: "state",
        header: "State",
        filterFn: createStringFilterFn(),
        enableGlobalFilter: true,
    },
    {
        accessorKey: "sessionExpiry",
        header: "Session Expiry",
        filterFn: (row: Row<tableType>, columnId: string, filterValue: string[]) => {
            if (filterValue.length === 0) return true;
            const value = row.getValue(columnId) as string;
            const status = getSessionExpiryStatus(value);
            return filterValue.includes(status);
        },
        enableGlobalFilter: true,
    },
    {
        accessorKey: "status",
        header: "Status",
        filterFn: createStringFilterFn(),
        enableGlobalFilter: true,
        cell: ({ row }) => <StatusChips status={row.getValue("status") as ActivityStatus} />,
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
