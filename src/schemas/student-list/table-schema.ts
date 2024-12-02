import { z } from "zod";

// will change based on type from backend
export const TableSchema = z.object({
    id: z.string(),
    studentName: z.string(),
    batch: z.string(),
    enrollmentNumber: z.string(),
    collegeSchool: z.string(),
    gender: z.string(),
    mobileNumber: z.string().regex(/^\+?[1-9]\d{1,14}$/),
    emailId: z.string().email(),
    fatherName: z.string(),
    motherName: z.string(),
    guardianName: z.string(),
    guardianNumber: z.string().regex(/^\+?[1-9]\d{1,14}$/),
    guardianEmail: z.string().email(),
    city: z.string(),
    state: z.string(),
    sessionExpiry: z.string(),
    status: z.enum(["active", "inactive", "pending", "error"]),
});

export type tableType = z.infer<typeof TableSchema>;
