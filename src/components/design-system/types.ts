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
export type InputSize = "small" | "medium" | "large";

export interface FormInputProps
    extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size" | "onChange"> {
    inputType: string;
    inputPlaceholder: string;
    input: string;
    setInput: (value: string) => void;
    error?: string | null;
    required?: boolean;
    size?: InputSize;
    label?: string;
    disabled?: boolean;
}
