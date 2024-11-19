import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Checkbox } from "../ui/checkbox";

import { TableDummyData } from "./table-dummy-data";

const headerTextCss = "text-subtitle font-semibold text-neutral-600";

export function MyTable() {
    return (
        <div className="w-full rounded-lg border">
            <div className="max-w-full overflow-x-auto rounded-lg">
                <Table className="rounded-lg">
                    <TableHeader className="bg-primary-200">
                        <TableRow>
                            <TableHead className={`${headerTextCss} sticky left-0 bg-primary-200`}>
                                <Checkbox />
                            </TableHead>
                            <TableHead className={`${headerTextCss} sticky bg-primary-200`}>
                                Details
                            </TableHead>
                            <TableHead className={`${headerTextCss} sticky bg-primary-200`}>
                                Student Name
                            </TableHead>
                            <TableHead className={`${headerTextCss} `}>Batch</TableHead>
                            <TableHead className={`${headerTextCss} text-right`}>
                                Enrollment Number
                            </TableHead>
                            <TableHead className={`${headerTextCss} text-right`}>
                                College/School
                            </TableHead>
                            <TableHead className={`${headerTextCss} text-right`}>Gender</TableHead>
                            <TableHead className={`${headerTextCss} text-right`}>
                                Mobile Number
                            </TableHead>
                            <TableHead className={`${headerTextCss} text-right`}>
                                Email ID
                            </TableHead>
                            <TableHead className={`${headerTextCss} text-right`}>
                                Father&apos;s Name
                            </TableHead>
                            <TableHead className={`${headerTextCss} text-right`}>
                                Mother&apos;s Name
                            </TableHead>
                            <TableHead className={`${headerTextCss} text-right`}>
                                Guardian&apos;s Name
                            </TableHead>
                            <TableHead className={`${headerTextCss} text-right`}>
                                Parent/Guardian&apos;s Number
                            </TableHead>
                            <TableHead className={`${headerTextCss} text-right`}>
                                Parent/Guardian&apos;s Email
                            </TableHead>
                            <TableHead className={`${headerTextCss} text-right`}>City</TableHead>
                            <TableHead className={`${headerTextCss} text-right`}>State</TableHead>
                            <TableHead className={`${headerTextCss} text-right`}>
                                Session Expiry
                            </TableHead>
                            <TableHead className={`${headerTextCss} text-right`}>Status</TableHead>
                            <TableHead
                                className={`${headerTextCss} sticky right-0 z-20 w-[50px] bg-primary-200`}
                            ></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {TableDummyData.map((row) => (
                            <TableRow key={row.id}>
                                <TableCell className="sticky left-0 w-14 bg-primary-200">
                                    {row.checkbox}
                                </TableCell>
                                <TableCell className="sticky bg-primary-200">
                                    {row.details}
                                </TableCell>
                                <TableCell className="sticky bg-primary-200">
                                    {row.studentName}
                                </TableCell>
                                <TableCell>{row.batch}</TableCell>
                                <TableCell>{row.enrollmentNumber}</TableCell>
                                <TableCell>{row.collegeSchool}</TableCell>
                                <TableCell>{row.gender}</TableCell>
                                <TableCell>{row.mobileNumber}</TableCell>
                                <TableCell>{row.emailId}</TableCell>
                                <TableCell>{row.fatherName}</TableCell>
                                <TableCell>{row.motherName}</TableCell>
                                <TableCell>{row.guardianName}</TableCell>
                                <TableCell>{row.guardianNumber}</TableCell>
                                <TableCell>{row.guardianEmail}</TableCell>
                                <TableCell>{row.city}</TableCell>
                                <TableCell>{row.state}</TableCell>
                                <TableCell>{row.sessionExpiry}</TableCell>
                                <TableCell>{row.status}</TableCell>
                                <TableCell className="sticky right-0 z-20 w-[50px] bg-primary-200">
                                    {row.actions}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
