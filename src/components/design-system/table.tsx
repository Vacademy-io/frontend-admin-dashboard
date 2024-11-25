import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Checkbox } from "../ui/checkbox";
import { TableDummyData } from "./utils/data/table-dummy-data";
import { MyButton } from "./button";
import { ArrowSquareOut, DotsThree } from "@phosphor-icons/react";
import { StatusChips } from "./chips";

const headerTextCss = "p-3 border-r border-neutral-300";
const cellCommonCss = "p-3";

const COLUMN_WIDTHS = {
    checkbox: "min-w-[56px] w-[56px]",
    details: "min-w-[80px] w-[80px]",
    studentName: "min-w-[180px] w-[180px]",
    batch: "min-w-[240px] w-[240px]",
    enrollmentNumber: "min-w-[200px] w-[200px]",
    collegeSchool: "min-w-[240px] w-[240px]",
    gender: "min-w-[120px] w-[120px]",
    mobileNumber: "min-w-[180px] w-[180px]",
    emailId: "min-w-[240px] w-[240px]",
    fatherName: "min-w-[180px] w-[180px]",
    motherName: "min-w-[180px] w-[180px]",
    guardianName: "min-w-[180px] w-[180px]",
    guardianNumber: "min-w-[180px] w-[180px]",
    guardianEmail: "min-w-[240px] w-[240px]",
    city: "min-w-[180px] w-[180px]",
    state: "min-w-[180px] w-[180px]",
    sessionExpiry: "min-w-[180px] w-[180px]",
    status: "min-w-[180px] w-[180px]",
    actions: "min-w-[56px] w-[56px]",
};

export function MyTable() {
    return (
        <div className="w-full rounded-lg border">
            <div className="max-w-full overflow-x-auto rounded-lg">
                <Table className="rounded-lg">
                    <TableHeader className="bg-primary-200">
                        <TableRow className="hover:bg-primary-200">
                            <TableHead
                                className={`${headerTextCss} sticky left-0 bg-primary-200 text-subtitle font-semibold text-neutral-600 ${COLUMN_WIDTHS.checkbox}`}
                            >
                                <Checkbox className="bg-white" />
                            </TableHead>
                            <TableHead
                                className={`${headerTextCss} sticky left-[56px] bg-primary-200 text-subtitle font-semibold text-neutral-600 ${COLUMN_WIDTHS.details}`}
                            >
                                Details
                            </TableHead>
                            <TableHead
                                className={`${headerTextCss} sticky left-[136px] bg-primary-200 text-subtitle font-semibold text-neutral-600 ${COLUMN_WIDTHS.studentName}`}
                            >
                                Student Name
                            </TableHead>
                            <TableHead
                                className={`${headerTextCss} text-subtitle font-semibold text-neutral-600 ${COLUMN_WIDTHS.batch}`}
                            >
                                Batch
                            </TableHead>
                            <TableHead
                                className={`${headerTextCss} text-subtitle font-semibold text-neutral-600 ${COLUMN_WIDTHS.enrollmentNumber}`}
                            >
                                Enrollment Number
                            </TableHead>
                            <TableHead
                                className={`${headerTextCss} text-subtitle font-semibold text-neutral-600 ${COLUMN_WIDTHS.collegeSchool}`}
                            >
                                College/School
                            </TableHead>
                            <TableHead
                                className={`${headerTextCss} text-subtitle font-semibold text-neutral-600 ${COLUMN_WIDTHS.gender}`}
                            >
                                Gender
                            </TableHead>
                            <TableHead
                                className={`${headerTextCss} text-subtitle font-semibold text-neutral-600 ${COLUMN_WIDTHS.mobileNumber}`}
                            >
                                Mobile Number
                            </TableHead>
                            <TableHead
                                className={`${headerTextCss} text-subtitle font-semibold text-neutral-600 ${COLUMN_WIDTHS.emailId}`}
                            >
                                Email ID
                            </TableHead>
                            <TableHead
                                className={`${headerTextCss} text-subtitle font-semibold text-neutral-600 ${COLUMN_WIDTHS.fatherName}`}
                            >
                                Father&apos;s Name
                            </TableHead>
                            <TableHead
                                className={`${headerTextCss} text-subtitle font-semibold text-neutral-600 ${COLUMN_WIDTHS.motherName}`}
                            >
                                Mother&apos;s Name
                            </TableHead>
                            <TableHead
                                className={`${headerTextCss} text-subtitle font-semibold text-neutral-600 ${COLUMN_WIDTHS.guardianName}`}
                            >
                                Guardian&apos;s Name
                            </TableHead>
                            <TableHead
                                className={`${headerTextCss} text-subtitle font-semibold text-neutral-600 ${COLUMN_WIDTHS.guardianNumber}`}
                            >
                                Parent/Guardian&apos;s Number
                            </TableHead>
                            <TableHead
                                className={`${headerTextCss} text-subtitle font-semibold text-neutral-600 ${COLUMN_WIDTHS.guardianEmail}`}
                            >
                                Parent/Guardian&apos;s Email
                            </TableHead>
                            <TableHead
                                className={`${headerTextCss} text-subtitle font-semibold text-neutral-600 ${COLUMN_WIDTHS.city}`}
                            >
                                City
                            </TableHead>
                            <TableHead
                                className={`${headerTextCss} text-subtitle font-semibold text-neutral-600 ${COLUMN_WIDTHS.state}`}
                            >
                                State
                            </TableHead>
                            <TableHead
                                className={`${headerTextCss} text-subtitle font-semibold text-neutral-600 ${COLUMN_WIDTHS.sessionExpiry}`}
                            >
                                Session Expiry
                            </TableHead>
                            <TableHead
                                className={`${headerTextCss} text-subtitle font-semibold text-neutral-600 ${COLUMN_WIDTHS.status}`}
                            >
                                Status
                            </TableHead>
                            <TableHead
                                className={`${headerTextCss} sticky right-0 bg-primary-200 text-subtitle font-semibold text-neutral-600 ${COLUMN_WIDTHS.actions}`}
                            ></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {TableDummyData.map((row) => (
                            <TableRow key={row.id} className="hover:bg-white">
                                <TableCell
                                    className={`${cellCommonCss} sticky left-0 bg-white text-body font-regular text-neutral-600 ${COLUMN_WIDTHS.checkbox}`}
                                >
                                    <Checkbox className="size-4 border-[#e4e4e4] shadow-none" />
                                </TableCell>
                                <TableCell
                                    className={`${cellCommonCss} sticky left-[56px] bg-white text-body font-regular text-neutral-600 ${COLUMN_WIDTHS.details}`}
                                >
                                    <ArrowSquareOut className="size-6 text-neutral-600" />
                                </TableCell>
                                <TableCell
                                    className={`${cellCommonCss} sticky left-[136px] bg-white text-body font-regular text-neutral-600 ${COLUMN_WIDTHS.studentName}`}
                                >
                                    {row.studentName}
                                </TableCell>
                                <TableCell
                                    className={`${cellCommonCss} text-body font-regular text-neutral-600 ${COLUMN_WIDTHS.batch}`}
                                >
                                    {row.batch}
                                </TableCell>
                                <TableCell
                                    className={`${cellCommonCss} text-body font-regular text-neutral-600 ${COLUMN_WIDTHS.enrollmentNumber}`}
                                >
                                    {row.enrollmentNumber}
                                </TableCell>
                                <TableCell
                                    className={`${cellCommonCss} text-body font-regular text-neutral-600 ${COLUMN_WIDTHS.collegeSchool}`}
                                >
                                    {row.collegeSchool}
                                </TableCell>
                                <TableCell
                                    className={`${cellCommonCss} text-body font-regular text-neutral-600 ${COLUMN_WIDTHS.gender}`}
                                >
                                    {row.gender}
                                </TableCell>
                                <TableCell
                                    className={`${cellCommonCss} text-body font-regular text-neutral-600 ${COLUMN_WIDTHS.mobileNumber}`}
                                >
                                    {row.mobileNumber}
                                </TableCell>
                                <TableCell
                                    className={`${cellCommonCss} text-body font-regular text-neutral-600 ${COLUMN_WIDTHS.emailId}`}
                                >
                                    {row.emailId}
                                </TableCell>
                                <TableCell
                                    className={`${cellCommonCss} text-body font-regular text-neutral-600 ${COLUMN_WIDTHS.fatherName}`}
                                >
                                    {row.fatherName}
                                </TableCell>
                                <TableCell
                                    className={`${cellCommonCss} text-body font-regular text-neutral-600 ${COLUMN_WIDTHS.motherName}`}
                                >
                                    {row.motherName}
                                </TableCell>
                                <TableCell
                                    className={`${cellCommonCss} text-body font-regular text-neutral-600 ${COLUMN_WIDTHS.guardianName}`}
                                >
                                    {row.guardianName}
                                </TableCell>
                                <TableCell
                                    className={`${cellCommonCss} text-body font-regular text-neutral-600 ${COLUMN_WIDTHS.guardianNumber}`}
                                >
                                    {row.guardianNumber}
                                </TableCell>
                                <TableCell
                                    className={`${cellCommonCss} text-body font-regular text-neutral-600 ${COLUMN_WIDTHS.guardianEmail}`}
                                >
                                    {row.guardianEmail}
                                </TableCell>
                                <TableCell
                                    className={`${cellCommonCss} text-body font-regular text-neutral-600 ${COLUMN_WIDTHS.city}`}
                                >
                                    {row.city}
                                </TableCell>
                                <TableCell
                                    className={`${cellCommonCss} text-body font-regular text-neutral-600 ${COLUMN_WIDTHS.state}`}
                                >
                                    {row.state}
                                </TableCell>
                                <TableCell
                                    className={`${cellCommonCss} text-body font-regular text-neutral-600 ${COLUMN_WIDTHS.sessionExpiry}`}
                                >
                                    {row.sessionExpiry}
                                </TableCell>
                                <TableCell
                                    className={`${cellCommonCss} text-body font-regular text-neutral-600 ${COLUMN_WIDTHS.status}`}
                                >
                                    <StatusChips status={row.status} />
                                </TableCell>
                                <TableCell
                                    className={`${cellCommonCss} sticky right-0 bg-white text-body font-regular text-neutral-600 ${COLUMN_WIDTHS.actions}`}
                                >
                                    <MyButton
                                        buttonType="secondary"
                                        scale="small"
                                        layoutVariant="icon"
                                        className="flex items-center justify-center"
                                    >
                                        <DotsThree />
                                    </MyButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
