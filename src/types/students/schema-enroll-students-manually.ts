import { z } from "zod";

// Step One Schema
export const stepOneSchema = z.object({
    profilePicture: z.null().optional(),
});

// Step Two Schema
export const stepTwoSchema = z.object({
    fullName: z.string().min(1, "Full name is required"),
    // dateOfBirth: z.string().min(1, "Date of birth is required"),
    gender: z.string().min(1, "Gender is required"),
    enrollmentNumber: z.string().min(1, "Enrollment number is required"),
    batch: z.string().min(1, "Batch is required"),
    session: z.string().min(1, "Session is required"),
    // sessionId: z.string().min(1, "Session ID is required"),
    collegeName: z.string().min(1, "College name is required"),
});

// Step Three Schema
export const stepThreeSchema = z.object({
    mobileNumber: z.string().regex(/^\d{10}$/, "Mobile number must be 10 digits"),
    email: z.string().email("Invalid email format"),
    state: z.string().min(1, "State is required"),
    city: z.string().min(1, "City is required"),
});

// Step Four Schema
export const stepFourSchema = z.object({
    fatherName: z.string().min(1, "Father's name is required"),
    motherName: z.string().min(1, "Mother's name is required"),
    guardianName: z.string().optional(),
    guardianEmail: z.string().email("Invalid email format").min(1, "Guardian's email is required"),
    guardianMobileNumber: z.string().regex(/^\d{10}$/, "Mobile number must be 10 digits"),
});

// Step Five Schema
export const stepFiveSchema = z.object({
    username: z.string().min(1, "Username is required"),
    password: z
        .string()
        .min(8, "Password must be at least 8 characters")
        .regex(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
            "Password must contain at least one uppercase letter, one lowercase letter, and one number",
        ),
});

export type StepOneData = z.infer<typeof stepOneSchema>;
export type StepTwoData = z.infer<typeof stepTwoSchema>;
export type StepThreeData = z.infer<typeof stepThreeSchema>;
export type StepFourData = z.infer<typeof stepFourSchema>;
export type StepFiveData = z.infer<typeof stepFiveSchema>;
