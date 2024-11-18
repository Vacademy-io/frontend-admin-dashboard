import { useState } from "react";
import { Input } from "@/components/ui/input";
import { IoEyeOutline, IoEyeOffOutline } from "react-icons/io5";
import { cn } from "@/lib/utils";
import { VscError } from "react-icons/vsc";
import { FormInputProps } from "./types";
import { InputErrorProps } from "./types";

// Input size variants
const inputSizeVariants = {
    large: "w-[348px] h-10 py-2 px-3 text-subtitle",
    medium: "w-60 h-9 py-2 px-3 text-body",
    small: "w-60 h-6 p-2 text-caption",
} as const;

const InputError = ({ errorMessage }: InputErrorProps) => {
    return (
        <div className="flex items-center gap-1 pl-1 text-body font-regular text-danger-600">
            <span>
                <VscError />
            </span>
            <span className="mt-[3px]">{errorMessage}</span>
        </div>
    );
};

export const MyInput = ({
    inputType,
    inputPlaceholder,
    input,
    setInput,
    error,
    required,
    className,
    size = "medium",
    disabled, // default size
    ...props
}: FormInputProps) => {
    const [showPassword, setShowPassword] = useState(false);

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setInput(event.target.value);
    };

    return (
        <div className="flex flex-col gap-1">
            <div className="flex flex-col gap-2">
                <label className="relative">
                    <Input
                        disabled={disabled}
                        type={
                            inputType === "password"
                                ? showPassword
                                    ? "text"
                                    : "password"
                                : inputType
                        }
                        className={cn(
                            inputSizeVariants[size],
                            error ? "border-danger-600" : "border-neutral-300",
                            inputType === "password" ? "pr-10" : "",
                            "shadow-none hover:border-primary-200 focus:border-primary-500 focus-visible:ring-0",
                            className,
                        )}
                        value={input}
                        onChange={handleInputChange}
                        required={required}
                        {...props}
                    />
                    <div
                        className={cn(
                            "pointer-events-none absolute left-3 top-2 select-none text-neutral-400",
                            size === "large"
                                ? "text-subtitle"
                                : size === "medium"
                                  ? "text-body"
                                  : "text-caption",
                            input === "" ? "visible" : "hidden",
                            disabled ? "text-neutral-300" : "text-neutral-400",
                        )}
                    >
                        {inputPlaceholder}
                        <span
                            className={cn(
                                "text-danger-600",
                                required ? "visible" : "hidden",
                                disabled ? "text-neutral-400" : "",
                            )}
                        >
                            *
                        </span>
                    </div>
                    <button
                        type="button"
                        onClick={togglePasswordVisibility}
                        className={cn(
                            "absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 focus:outline-none",
                            inputType === "password" ? "visible" : "hidden",
                        )}
                    >
                        {showPassword ? (
                            <IoEyeOutline className="size-4 text-neutral-600" />
                        ) : (
                            <IoEyeOffOutline className="size-4 text-neutral-600" />
                        )}
                    </button>
                </label>
            </div>
            {error && <InputError errorMessage={error} />}
        </div>
    );
};
