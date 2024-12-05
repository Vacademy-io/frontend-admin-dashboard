import { z } from "zod";

// Login Schema
export const loginSchema = z.object({
    username: z
        .string({
            required_error: "Username is required",
            invalid_type_error: "Username must be a valid string",
        })
        .trim()
        .min(1, "Username is required")
        .max(255, "Username must be less than 255 characters"),

    password: z
        .string({
            required_error: "Password is required",
        })
        .min(4, "Password must be at least 4 characters")
        .max(255, "Password must be less than 255 characters"),
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

// Set Password Schema with password match validation
export const setPasswordSchema = z
    .object({
        password: z
            .string({
                required_error: "Password is required",
            })
            .min(4, { message: "Password must be at least 4 characters" })
            .max(255, { message: "Password must be less than 255 characters" }),

        confirmPassword: z
            .string({
                required_error: "Confirm Password is required",
            })
            .min(4, { message: "Confirm Password must be at least 4 characters" })
            .max(255, { message: "Confirm Password must be less than 255 characters" }),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords do not match",
        path: ["confirmPassword"], // Specifies where the error will appear
    });
