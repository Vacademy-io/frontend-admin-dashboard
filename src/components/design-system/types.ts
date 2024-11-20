import { Dispatch, SetStateAction } from "react";
import { ButtonProps } from "@/components/ui/button";

export interface myButtonProps {
    className: string;
    type: string;
    scale: string;
}

// Types
type ButtonVariantType = "primary" | "secondary" | "text";
type ButtonScale = "large" | "medium" | "small";
type ButtonLayoutVariant = "default" | "icon" | "floating" | "extendedFloating";

// Extend from Shadcn ButtonProps instead of HTML button attributes
export interface MyButtonProps extends Omit<ButtonProps, "variant"> {
    className?: string;
    buttonType?: ButtonVariantType; // renamed from 'type' to avoid confusion
    scale?: ButtonScale;
    layoutVariant?: ButtonLayoutVariant; // renamed from 'variant' to avoid confusion with Shadcn's variant
    children?: React.ReactNode;
}

export interface InputErrorProps {
    errorMessage: string;
}

// FormInput Props
export interface FormInputProps {
    inputType?: string;
    inputPlaceholder?: string;
    input: string;
    setInput: Dispatch<SetStateAction<string>>;
    error: string | null;
    required: boolean;
    className?: string;
    size?: "large" | "medium" | "small";
    disabled?: boolean;
    label?: string;
}
