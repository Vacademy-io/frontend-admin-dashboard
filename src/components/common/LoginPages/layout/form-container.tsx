// import { LanguageDropdown } from "@/components/common/localization/language-dropdown";
import { FormContainerProps } from "@/types/loginTypes";
import { LoginImage } from "@/assets/svgs";
import { SSDC_Logo } from "@/assets/svgs";

export function FormContainer({ children }: FormContainerProps) {
    return (
        <div className="flex min-h-screen w-screen bg-white">
            <div className="relative flex w-full items-center justify-center bg-primary-100">
                <div className="absolute left-8 top-8">
                    <SSDC_Logo />
                </div>
                <LoginImage />
            </div>
            <div className="relative flex w-full items-center justify-center text-neutral-600">
                {/* <LanguageDropdown /> */}
                <div className="w-[500px] items-center justify-center">{children}</div>
            </div>
        </div>
    );
}
