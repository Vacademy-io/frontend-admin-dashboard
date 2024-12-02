import { z } from "zod";

// Define the request and response schemas using Zod
const loginRequestSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8),
});

const loginResponseSchema = z.object({
    userId: z.string().optional(),
    token: z.string().optional(),
    status: z.enum(["success", "error"]),
    message: z.string().optional(),
});

// Dummy login function
async function loginUser(
    email: string,
    password: string,
): Promise<z.infer<typeof loginResponseSchema>> {
    // Validate the input using the request schema
    const { email: validEmail, password: validPassword } = loginRequestSchema.parse({
        email,
        password,
    });

    // Simulate a successful login
    if (validEmail === "test@example.com" && validPassword === "password123") {
        return {
            userId: "123",
            token: "abc123",
            status: "success",
        };
    }

    // Simulate a failed login
    return {
        status: "error",
        message: "Invalid email or password",
    };
}

export { loginUser, loginRequestSchema, loginResponseSchema };
