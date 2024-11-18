import { useTranslation } from "react-i18next";
import { useSyncLanguage } from "@/hooks/useSyncLanguage";
import { Heading } from "@/components/common/LoginPages/ui/heading";
import { MyInput } from "@/components/design-system/input";
import { Link } from "@tanstack/react-router";
import { loginSchema } from "@/schemas/login";
import { z } from "zod";
import { useState } from "react";
import { SplashScreen } from "@/components/common/LoginPages/layout/splash-container";
import { LoginFormState } from "../types";
import { loginUser } from "@/components/common/LoginPages/hooks/dummy/login/login-button";
import { useMutation } from "@tanstack/react-query";
import { ErrorDialog } from "../ui/error-dialog";
import { MyButton } from "@/components/design-system/button";

export function LoginForm() {
    useSyncLanguage();
    const { t } = useTranslation();

    const [userEmail, setUserEmail] = useState<LoginFormState["userEmail"]>("");
    const [userPassword, setUserPassword] = useState<LoginFormState["userPassword"]>("");
    const [emailError, setEmailError] = useState<LoginFormState["emailError"]>(null);
    const [passwordError, setPasswordError] = useState<LoginFormState["passwordError"]>(null);

    // State for controlling the error dialog
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [dialogDescription, setDialogDescription] = useState("");

    const mutation = useMutation({
        mutationFn: () => loginUser(userEmail, userPassword),
        onSuccess: (response) => {
            if (response.status === "success") {
                // Handle successful login
                console.log("Logged in:", response);
            } else {
                // Show dialog on login failure
                setDialogDescription("Your password is incorrect or this account doesn't exist.");
                setIsDialogOpen(true);
                setUserEmail("");
                setUserPassword("");
                console.log("Your password is incorrect or this account doesn't exist.");
            }
        },
        onError: (error: unknown) => {
            // Show dialog on request error
            setDialogDescription("Your password is incorrect or this account doesn't exist.");
            setIsDialogOpen(true);
            console.log("Your password is incorrect or this account doesn't exist.", error);
        },
    });

    const handleSubmit = async () => {
        setEmailError(null);
        setPasswordError(null);

        if (!userEmail) {
            setEmailError("Email is required");
        }
        if (!userPassword) {
            setPasswordError("Password is required");
        }

        if (userEmail && userPassword) {
            try {
                loginSchema.parse({ email: userEmail, password: userPassword });
                mutation.mutate(); // Execute the login request
            } catch (error: unknown) {
                if (error instanceof z.ZodError) {
                    error.issues.forEach((issue) => {
                        if (issue.path[0] === "email") {
                            setEmailError(issue.message);
                        } else if (issue.path[0] === "password") {
                            setPasswordError(issue.message);
                        }
                    });
                } else {
                    console.error(error);
                }
            }
        }
    };

    return (
        <SplashScreen isAnimationEnabled={true}>
            <div className="flex w-full flex-col items-center justify-center gap-16">
                <Heading heading={t("loginHeading")} subHeading={t("loginSubheading")} />
                <div className="flex w-full flex-col items-center justify-center gap-5 px-16">
                    <MyInput
                        inputType="email"
                        inputPlaceholder={t("loginInput1")}
                        input={userEmail}
                        setInput={setUserEmail}
                        error={emailError}
                        required={true}
                        size="large"
                    />
                    <div className="flex flex-col gap-1">
                        <MyInput
                            inputType="password"
                            inputPlaceholder={t("loginInput2")}
                            input={userPassword}
                            setInput={setUserPassword}
                            error={passwordError}
                            required={true}
                            size="large"
                        />
                        <Link to="/login/forgot-password">
                            <div className="cursor-pointer pl-1 text-caption font-regular text-primary-500">
                                {t("loginText")}
                            </div>
                        </Link>
                    </div>
                </div>

                <div className="flex flex-col gap-1" onClick={handleSubmit}>
                    <MyButton scale="large" buttonType="primary" layoutVariant="default">
                        {t("loginBtn")}
                    </MyButton>
                </div>
            </div>

            {/* Error dialog */}
            <ErrorDialog
                open={isDialogOpen}
                description={dialogDescription}
                setIsDialogOpen={setIsDialogOpen}
            />
        </SplashScreen>
    );
}
