import { z } from "zod";

// Define the request and response schemas using Zod
const loginRequestSchema = z.object({
    user_name: z.string(),
    password: z.string(),
    client_name: z.literal("ADMIN_PORTAL"),
    institute_id: z.string().uuid(),
});

const loginResponseSchema = z.object({
    accessToken: z.string(),
    refreshToken: z.string(),
});

// Dummy login function
async function loginUser(
    username: string,
    password: string,
): Promise<z.infer<typeof loginResponseSchema>> {
    const response = await fetch("https://backend-stage.vacademy.io/auth-service/v1/login-root", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            user_name: username,
            password: password,
            client_name: "ADMIN_PORTAL",
            institute_id: "c70f40a5-e4d3-4b6c-a498-e612d0d4b133",
        }),
    });

    if (!response.ok) {
        throw new Error("Login failed");
    }

    return response.json();
}

export { loginUser, loginRequestSchema, loginResponseSchema };
