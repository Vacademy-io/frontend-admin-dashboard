import { LanguageDropdown } from "@/components/common/localization/language-dropdown";
import { FormContainerProps } from "../types";

export function FormContainer({ children }: FormContainerProps) {
    return (
        <div className="flex min-h-screen w-screen bg-white">
            <div className="relative flex w-full items-center justify-center bg-primary-100">
                <img
                    src="/images/ssdc_logo.png"
                    alt="logo"
                    width={80}
                    height={80}
                    className="absolute left-8 top-8"
                />
                <img src="/images/login-image.png" alt="login image" width={400} height={400} />
            </div>
            <div className="relative flex w-full items-center justify-center text-neutral-600">
                <LanguageDropdown />
                <div className="w-[500px] items-center justify-center">{children}</div>
            </div>
        </div>
    );
}