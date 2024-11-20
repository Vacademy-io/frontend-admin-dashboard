import { useTranslation } from "react-i18next";
import { useSyncLanguage } from "@/hooks/useSyncLanguage";
import { FormContainer } from "@/components/common/LoginPages/layout/form-container";
import { Heading } from "@/components/common/LoginPages/ui/heading";
import { MyInput } from "@/components/design-system/input";
import { Link } from "@tanstack/react-router";
import { forgotPasswordSchema } from "@/schemas/login";
import { z } from "zod";
import { useState } from "react";
import { ForgotPasswordState } from "../types";
import { forgotPassword } from "@/components/common/LoginPages/hooks/dummy/login/send-link-button";
import { sendResetLink } from "@/components/common/LoginPages/hooks/dummy/login/reset-link-click";
import { Dispatch, SetStateAction } from "react";
import { useMutation } from "@tanstack/react-query";
import { MyButton } from "@/components/design-system/button";
import { toast } from "sonner";

export function SendResetLink({
    setResetLinkClick,
}: {
    setResetLinkClick: Dispatch<SetStateAction<boolean>>;
}) {
    useSyncLanguage();
    const { t } = useTranslation();

    const [userEmail, setUserEmail] = useState<ForgotPasswordState["userEmail"]>("");
    const [emailError, setEmailError] = useState<ForgotPasswordState["emailError"]>(null);

    const forgotPasswordMutation = useMutation({
        mutationFn: () => forgotPassword(userEmail),
        onSuccess: async (response) => {
            if (response.status === "success") {
                console.log("Reset Link request successful");
                toast.success("Password Sent Successfully", {
                    className: "success-toast",
                    duration: 2000,
                });

                // Trigger the sendResetLink mutation on successful forgotPassword request
                sendResetLinkMutation.mutate();
            } else {
                toast.error("Login Error", {
                    description: "This account doesn't exist",
                    className: "error-toast",
                    duration: 2000,
                });
                console.error("Reset Link request failed:", response.message);
                setUserEmail(""); // Clear email field if request fails
            }
        },
        onError: (error) => {
            toast.error("Login Error", {
                description: "This account doesn't exist",
                className: "error-toast",
                duration: 2000,
            });
            console.error("Forgot password request failed:", error);
        },
    });

    const sendResetLinkMutation = useMutation({
        mutationFn: sendResetLink,
        onSuccess: (response) => {
            if (response.status === "success") {
                console.log("Password has been reset successfully");
                setResetLinkClick(true);
            } else {
                console.error("Failed to reset the password", response.message);
            }
        },
        onError: (error) => {
            console.error("Reset link request failed:", error);
        },
    });

    const handleSubmit = () => {
        setEmailError(null);

        if (!userEmail) {
            setEmailError("Email is required");
            return;
        }

        try {
            forgotPasswordSchema.parse({ email: userEmail });
            forgotPasswordMutation.mutate(); // Trigger forgot password mutation
        } catch (error: unknown) {
            if (error instanceof z.ZodError) {
                error.issues.forEach((issue) => {
                    if (issue.path[0] === "email") {
                        setEmailError(issue.message);
                    }
                });
            } else {
                console.error(error);
            }
        }
    };

    return (
        <div>
            <FormContainer>
                <div className="flex w-full flex-col items-center justify-center gap-16">
                    <Heading
                        heading={t("forgotPassHeading")}
                        subHeading={t("forgotPassSubheading")}
                    />
                    <MyInput
                        inputType="email"
                        inputPlaceholder={t("forgotPassInput1")}
                        input={userEmail}
                        setInput={setUserEmail}
                        error={emailError}
                        required={true}
                        size="large"
                    />
                    <div className="flex flex-col gap-3">
                        <div onClick={handleSubmit}>
                            <MyButton scale="large" buttonType="primary" layoutVariant="default">
                                {t("forgotPassBtn")}
                            </MyButton>
                        </div>
                        <div className="flex gap-1 text-xs">
                            <div className="text-neutral-500">{t("forgotPassBottomText")}</div>
                            <Link to="/login" className="cursor-pointer text-primary-500">
                                Back to Login
                            </Link>
                        </div>
                    </div>
                </div>
            </FormContainer>
        </div>
    );
}
