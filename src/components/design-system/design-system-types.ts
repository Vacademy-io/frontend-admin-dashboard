import { Dispatch, SetStateAction } from "react";
import { ButtonProps } from "@/components/ui/button";

// Button Types
type ButtonVariantType = "primary" | "secondary" | "text";
type ButtonScale = "large" | "medium" | "small";
type ButtonLayoutVariant = "default" | "icon" | "floating" | "extendedFloating";

export interface MyButtonProps extends Omit<ButtonProps, "variant"> {
    className?: string;
    buttonType?: ButtonVariantType;
    scale?: ButtonScale;
    layoutVariant?: ButtonLayoutVariant;
    children?: React.ReactNode;
}

export interface InputErrorProps {
    errorMessage: string;
}

// FormInput Types
export interface FormInputProps {
    inputType?: string;
    inputPlaceholder?: string;
    input: string;
    setInput: Dispatch<SetStateAction<string>>;
    error?: string | null;
    required?: boolean;
    className?: string;
    size?: "large" | "medium" | "small";
    disabled?: boolean;
}
