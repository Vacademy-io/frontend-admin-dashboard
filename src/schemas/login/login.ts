import { z } from "zod";

// Login Schema
export const loginSchema = z.object({
    email: z
        .string({
            required_error: "Email is required",
            invalid_type_error: "Email must be a valid string",
        })
        .trim()
        .email("Invalid email address")
        .max(255, { message: "Email must be less than 255 characters" }),

    password: z
        .string({
            required_error: "Password is required",
        })
        .min(4, { message: "Password must be at least 4 characters" })
        .max(255, { message: "Password must be less than 255 characters" }),
});

// Forgot Password Schema
export const forgotPasswordSchema = z.object({
    email: z
        .string({
            required_error: "Email is required",
            invalid_type_error: "Email must be a valid string",
        })
        .trim()
        .email("Invalid email address")
        .max(255, { message: "Email must be less than 255 characters" }),
});
