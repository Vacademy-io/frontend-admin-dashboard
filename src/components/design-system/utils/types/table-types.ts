import { ActivityStatus } from "./chips-types";

export interface TableDataType {
    id: string;
    studentName: string;
    batch: string;
    enrollmentNumber: string;
    collegeSchool: string;
    gender: string;
    mobileNumber: string;
    emailId: string;
    fatherName: string;
    motherName: string;
    guardianName: string;
    guardianNumber: string;
    guardianEmail: string;
    city: string;
    state: string;
    sessionExpiry: string;
    status: ActivityStatus;
}
