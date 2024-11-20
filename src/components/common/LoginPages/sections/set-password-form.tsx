import { useSyncLanguage } from "@/hooks/useSyncLanguage";
import { FormContainer } from "@/components/common/LoginPages/layout/form-container";
import { Heading } from "@/components/common/LoginPages/ui/heading";
import { MyInput } from "@/components/design-system/input";
import { MyButton } from "@/components/design-system/button";
import { Link } from "@tanstack/react-router";
import { setPasswordSchema } from "@/schemas/login";
import { z } from "zod";
import { useState } from "react";
import { SetPasswordState } from "../types";
import { setPassword } from "@/components/common/LoginPages/hooks/dummy/login/reset-password-button";

export function SetPassword() {
    useSyncLanguage();

    const [userPassword, setUserPassword] = useState<SetPasswordState["userPassword"]>("");
    const [userConfirmPassword, setUserConfirmPassword] =
        useState<SetPasswordState["userConfirmPassword"]>("");

    const [passwordError, setPasswordError] = useState<SetPasswordState["passwordError"]>(null);
    const [confirmPasswordError, setConfirmPasswordError] =
        useState<SetPasswordState["confirmPasswordError"]>(null);

    const handleSubmit = async () => {
        // Reset errors before validation
        setPasswordError(null);
        setConfirmPasswordError(null);

        // Check if password and confirm password are empty
        if (!userPassword) {
            setPasswordError("Password is required");
        }
        if (!userConfirmPassword) {
            setConfirmPasswordError("Confirm Password is required");
        }

        // If both fields are not empty, try to validate the schema
        if (userPassword && userConfirmPassword) {
            try {
                setPasswordSchema.parse({
                    password: userPassword,
                    confirmPassword: userConfirmPassword,
                });
                console.log("Validation passed");

                const response = await setPassword(userPassword);

                if (response.status === "success") {
                    // Handle successful password set
                    console.log("Password set successfully");
                } else {
                    // Handle failed password set
                    console.error("Failed to set password:", response.message);
                }
            } catch (error: unknown) {
                if (error instanceof z.ZodError) {
                    error.issues.forEach((issue) => {
                        if (issue.path[0] === "password") {
                            setPasswordError(issue.message);
                        } else if (issue.path[0] === "confirmPassword") {
                            setConfirmPasswordError(issue.message);
                        }
                    });
                } else {
                    console.error(error);
                }
            }
        }
    };

    return (
        <FormContainer>
            <div className="flex w-full flex-col items-center gap-16">
                <Heading
                    heading="Set New Password"
                    subHeading="Secure your account with a new password"
                />

                <div className="flex w-full flex-col gap-5 px-16">
                    <MyInput
                        inputType="password"
                        inputPlaceholder="New password"
                        input={userPassword}
                        setInput={setUserPassword}
                        error={passwordError}
                        required={true}
                        size="large"
                    />
                    <MyInput
                        inputType="password"
                        inputPlaceholder="Confirm new password"
                        input={userConfirmPassword}
                        setInput={setUserConfirmPassword}
                        error={confirmPasswordError}
                        required={true}
                        size="large"
                    />
                </div>

                <div className="flex flex-col gap-1">
                    <div onClick={handleSubmit}>
                        <MyButton scale="large" buttonType="primary" layoutVariant="default">
                            Reset Password
                        </MyButton>
                    </div>
                    <div className={`flex gap-1 text-xs`}>
                        <div className="cursor-pointer text-neutral-600">Back to Login?</div>
                        <Link to="/login" className={`cursor-pointer text-primary-500`}>
                            Login
                        </Link>
                    </div>
                </div>
            </div>
        </FormContainer>
    );
}
