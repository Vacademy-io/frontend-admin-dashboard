import { Dispatch, SetStateAction } from "react";
import { ButtonProps } from "@/components/ui/button";
import { Icon } from "@phosphor-icons/react";

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

// Chips Types
export interface ChipsWrapperProps {
    children?: React.ReactNode;
    className?: string;
}

export interface ChipsProps {
    label?: React.ReactNode;
    trailingIcon?: Icon;
    leadingIcon?: Icon;
    avatarAddress?: string;
    selected?: boolean;
    disabled?: boolean;
}

export interface InputChipsProps extends ChipsProps {}

export interface FilterChipsProps {
    label?: React.ReactNode;
    leadingIcon?: Icon;
    selected?: boolean;
}

// Status Types
export type ActivityStatus = "active" | "inactive" | "pending" | "error";
export type FeeStatus =
    | "refund"
    | "concession"
    | "penalty waiver"
    | "scholarship"
    | "change fee payment";
export type SuccessStatus = "successful" | "pending" | "due" | "failed" | "over-due";

export interface StatusChipsProps {
    label?: React.ReactNode;
    status: ActivityStatus;
}
