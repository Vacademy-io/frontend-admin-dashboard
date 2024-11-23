import { Icon } from "@phosphor-icons/react";

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

export interface StatusChipsProps {
    label?: React.ReactNode;
    status: ActivityStatus;
}

// Status Types
export type ActivityStatus = "active" | "inactive" | "pending" | "error";
