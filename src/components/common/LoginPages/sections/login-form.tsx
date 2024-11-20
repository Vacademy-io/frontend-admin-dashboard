import { useTranslation } from "react-i18next";
import { useSyncLanguage } from "@/hooks/useSyncLanguage";
import { Heading } from "@/components/common/LoginPages/ui/heading";
import { MyInput } from "@/components/design-system/input";
import { Link } from "@tanstack/react-router";
import { loginSchema } from "@/schemas/login";
import { z } from "zod";
import { useState, useEffect } from "react";
import { SplashScreen } from "@/components/common/LoginPages/layout/splash-container";
import { LoginFormState } from "../types";
import { loginUser } from "@/components/common/LoginPages/hooks/dummy/login/login-button";
import { useMutation } from "@tanstack/react-query";
import { MyButton } from "@/components/design-system/button";
import { useAnimationStore } from "@/stores/login/animationStore";
import { toast } from "sonner";

export function LoginForm() {
    useSyncLanguage();
    const { t } = useTranslation();
    const { hasSeenAnimation, setHasSeenAnimation } = useAnimationStore();

    const [userEmail, setUserEmail] = useState<LoginFormState["userEmail"]>("");
    const [userPassword, setUserPassword] = useState<LoginFormState["userPassword"]>("");
    const [emailError, setEmailError] = useState<LoginFormState["emailError"]>(null);
    const [passwordError, setPasswordError] = useState<LoginFormState["passwordError"]>(null);

    useEffect(() => {
        if (!hasSeenAnimation) {
            setTimeout(() => {
                setHasSeenAnimation();
            }, 8000);
        }
    }, [hasSeenAnimation, setHasSeenAnimation]);

    const mutation = useMutation({
        mutationFn: () => loginUser(userEmail, userPassword),
        onSuccess: (response) => {
            if (response.status === "success") {
                // Handle successful login
                console.log("Logged in:", response);
            } else {
                // Show toast on login failure
                // showErrorToast("Your password is incorrect or this account doesn't exist.");
                toast.error("Login Error", {
                    description: "Your password is incorrect or this account doesn't exist.",
                    className: "error-toast",
                    duration: 2000,
                });
                setUserEmail("");
                setUserPassword("");
                console.log("Your password is incorrect or this account doesn't exist.");
            }
        },
        onError: (error: unknown) => {
            // Show toast on request error
            // showErrorToast("Your password is incorrect or this account doesn't exist.");
            toast.error("Login Error", {
                description: "Your password is incorrect or this account doesn't exist.",
                className: "error-toast",
                duration: 3000,
            });
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
        <SplashScreen isAnimationEnabled={!hasSeenAnimation}>
            <div className="flex w-full flex-col items-center justify-center gap-20">
                <Heading heading={t("loginHeading")} subHeading={t("loginSubheading")} />
                <div className="flex w-full flex-col items-center justify-center gap-8 px-16">
                    <MyInput
                        inputType="email"
                        inputPlaceholder={t("loginInput1")}
                        input={userEmail}
                        setInput={setUserEmail}
                        error={emailError}
                        required={true}
                        size="large"
                        label="Email"
                    />
                    <div className="flex flex-col gap-2">
                        <MyInput
                            inputType="password"
                            inputPlaceholder="••••••••"
                            input={userPassword}
                            setInput={setUserPassword}
                            error={passwordError}
                            required={true}
                            size="large"
                            label="Password"
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
        </SplashScreen>
    );
}
