import { z } from "zod";

// Step One Schema
export const stepOneSchema = z.object({
    profilePicture: z.union([z.string(), z.null(), z.undefined()]),
});

// Step Two Schema
export const stepTwoSchema = z.object({
    fullName: z.string().min(1, "Full name is required"),
    gender: z.string().min(1, "Gender is required"),
    enrollmentNumber: z.string().min(1, "Enrollment number is required"),
    course: z.object({
        id: z.string(),
        name: z.string(),
    }),
    session: z.object({
        id: z.string(),
        name: z.string(),
    }),
    level: z.object({
        id: z.string(),
        name: z.string(),
    }),
    accessDays: z.string().min(1, "Access days are required"),
    collegeName: z.string().optional(),
});

// Step Three Schema
export const stepThreeSchema = z.object({
    mobileNumber: z.string(),
    email: z.string().email("Invalid email format"),
    addressLine: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    pincode: z.string().optional(),
});

// Step Four Schema
export const stepFourSchema = z.object({
    fatherName: z.string().optional(),
    motherName: z.string().optional(),
    guardianName: z.string().optional(),
    guardianEmail: z.string().email("Invalid email format").optional(),
    guardianMobileNumber: z.string().optional(),
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
