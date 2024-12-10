// import { z } from "zod";

// will change based on type from backend
// export const TableSchema = z.object({
//     id: z.string(),
//     studentName: z.string(),
//     batch: z.string(),
//     enrollmentNumber: z.string(),
//     collegeSchool: z.string(),
//     gender: z.string(),
//     mobileNumber: z.string().regex(/^\+?[1-9]\d{1,14}$/),
//     emailId: z.string().email(),
//     fatherName: z.string(),
//     motherName: z.string(),
//     guardianName: z.string(),
//     guardianNumber: z.string().regex(/^\+?[1-9]\d{1,14}$/),
//     guardianEmail: z.string().email(),
//     city: z.string(),
//     state: z.string(),
//     sessionExpiry: z.string(),
//     status: z.enum(["active", "inactive", "pending", "error"]),
// });

// export type tableType = z.infer<typeof TableSchema>;

// For the sort columns object
export interface StudentFilterRequest {
    name?: string;
    statuses?: string[];
    institute_ids?: string[];
    package_session_ids?: string[];
    group_ids?: string[];
    gender?: string[];
    sort_columns?: Record<string, string>;
}

// Response types
export interface StudentTable {
    id: string;
    username: string | null;
    user_id: string;
    email: string;
    full_name: string;
    address_line: string;
    region: string | null;
    city: string;
    pin_code: string;
    mobile_number: string;
    date_of_birth: string;
    gender: string;
    father_name: string;
    mother_name: string;
    parents_mobile_number: string;
    parents_email: string;
    linked_institute_name: string | null;
    created_at: string;
    updated_at: string;
    //extra dummy
    enrollment_no?: string;
    school_name?: string;
    guardian_name?: string;
    state?: string;
    session_expiry?: string;
    status?: string;
    batch_id?: string;
    session_id?: string;
}

export interface StudentListResponse {
    content: StudentTable[];
    page_no: number;
    page_size: number;
    total_elements: number;
    total_pages: number;
    last: boolean;
}
