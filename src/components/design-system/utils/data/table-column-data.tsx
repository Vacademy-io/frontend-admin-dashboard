// import { ColumnDef, Row } from "@tanstack/react-table";
// import { tableType } from "../../../../schemas/student-list/table-schema";
// import { ArrowSquareOut, DotsThree, CaretUp, CaretDown } from "@phosphor-icons/react";
// import { Checkbox } from "@/components/ui/checkbox";
// import { MyButton } from "../../button";
// import { StatusChips } from "../../chips";
// import { ActivityStatus } from "../types/chips-types";
// import { MyDropdown } from "../../dropdown";

// const createStringFilterFn =
//     () => (row: Row<tableType>, columnId: string, filterValue: string[]) => {
//         const value = row.getValue(columnId) as string;
//         return filterValue.length === 0 || filterValue.includes(value);
//     };

// export const myColumns: ColumnDef<tableType>[] = [
//     {
//         id: "checkbox",
//         header: ({ table }) => (
//             <Checkbox
//                 checked={table.getIsAllRowsSelected()}
//                 onCheckedChange={(value) => table.toggleAllRowsSelected(!!value)}
//                 className="border-neutral-400 bg-white text-neutral-600"
//             />
//         ),
//         cell: ({ row }) => (
//             <Checkbox
//                 checked={row.getIsSelected()}
//                 onCheckedChange={(value) => row.toggleSelected(!!value)}
//                 className="flex size-4 items-center justify-center border-neutral-400 text-neutral-600 shadow-none"
//             />
//         ),
//     },
//     {
//         id: "details",
//         header: "Details",
//         cell: () => <ArrowSquareOut className="size-6 cursor-pointer text-neutral-600" />,
//     },
//     {
//         accessorKey: "studentName",
//         header: () => (
//             <MyDropdown dropdownList={["Asc", "Desc"]}>
//                 <button className="flex w-full cursor-pointer items-center justify-between">
//                     <div>Student Name</div>
//                     <div>
//                         <CaretUp />
//                         <CaretDown />
//                     </div>
//                 </button>
//             </MyDropdown>
//         ),
//         filterFn: createStringFilterFn(),
//         enableGlobalFilter: true,
//     },
//     {
//         accessorKey: "batch",
//         header: "Batch",
//         filterFn: createStringFilterFn(),
//         enableGlobalFilter: true,
//     },
//     {
//         accessorKey: "enrollmentNumber",
//         header: "Enrollment Number",
//         filterFn: createStringFilterFn(),
//         enableGlobalFilter: true,
//     },
//     {
//         accessorKey: "collegeSchool",
//         header: "College/School",
//         filterFn: createStringFilterFn(),
//         enableGlobalFilter: true,
//     },
//     {
//         accessorKey: "gender",
//         header: "Gender",
//         filterFn: createStringFilterFn(),
//         enableGlobalFilter: true,
//     },
//     {
//         accessorKey: "mobileNumber",
//         header: "Mobile Number",
//         filterFn: createStringFilterFn(),
//         enableGlobalFilter: true,
//     },
//     {
//         accessorKey: "emailId",
//         header: "Email ID",
//         filterFn: createStringFilterFn(),
//         enableGlobalFilter: true,
//     },
//     {
//         accessorKey: "fatherName",
//         header: "Father's Name",
//         filterFn: createStringFilterFn(),
//         enableGlobalFilter: true,
//     },
//     {
//         accessorKey: "motherName",
//         header: "Mother's Name",
//         filterFn: createStringFilterFn(),
//         enableGlobalFilter: true,
//     },
//     {
//         accessorKey: "guardianName",
//         header: "Guardian's Name",
//         filterFn: createStringFilterFn(),
//         enableGlobalFilter: true,
//     },
//     {
//         accessorKey: "guardianNumber",
//         header: "Parent/Guardian's Mobile Number",
//         filterFn: createStringFilterFn(),
//         enableGlobalFilter: true,
//     },
//     {
//         accessorKey: "guardianEmail",
//         header: "Parent/Guardian's Email ID",
//         filterFn: createStringFilterFn(),
//         enableGlobalFilter: true,
//     },
//     {
//         accessorKey: "city",
//         header: "City",
//         filterFn: createStringFilterFn(),
//         enableGlobalFilter: true,
//     },
//     {
//         accessorKey: "state",
//         header: "State",
//         filterFn: createStringFilterFn(),
//         enableGlobalFilter: true,
//     },
//     {
//         accessorKey: "sessionExpiry",
//         header: "Session Expiry",
//         enableGlobalFilter: true,
//     },
//     {
//         accessorKey: "status",
//         header: "Status",
//         filterFn: createStringFilterFn(),
//         enableGlobalFilter: true,
//         cell: ({ row }) => <StatusChips status={row.getValue("status") as ActivityStatus} />,
//     },
//     {
//         id: "options",
//         header: "",
//         cell: () => (
//             <MyButton
//                 buttonType="secondary"
//                 scale="small"
//                 layoutVariant="icon"
//                 className="flex items-center justify-center"
//             >
//                 <DotsThree />
//             </MyButton>
//         ),
//     },
// ];

import { ColumnDef } from "@tanstack/react-table";
import { StudentTable } from "@/schemas/student-list/table-schema";
import { ArrowSquareOut, DotsThree, CaretUp, CaretDown } from "@phosphor-icons/react";
import { Checkbox } from "@/components/ui/checkbox";
import { MyButton } from "../../button";
// import { StatusChips } from "../../chips";
// import { ActivityStatus } from "../types/chips-types";
import { MyDropdown } from "../../dropdown";

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
        header: () => (
            <MyDropdown dropdownList={["Asc", "Desc"]}>
                <button className="flex w-full cursor-pointer items-center justify-between">
                    <div>Student Name</div>
                    <div>
                        <CaretUp />
                        <CaretDown />
                    </div>
                </button>
            </MyDropdown>
        ),
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
        accessorKey: "state",
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
