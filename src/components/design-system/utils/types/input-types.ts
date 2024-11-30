export interface InputErrorProps {
    errorMessage?: string;
}

// FormInput Props
export type InputSize = "small" | "medium" | "large";

export interface FormInputProps {
    inputType: string;
    inputPlaceholder?: string;
    input: string;
    setInput: (value: string | ((prevState: string) => string)) => void; // Updated this line
    error?: string;
    required?: boolean;
    className?: string;
    size?: "large" | "medium" | "small";
    disabled?: boolean;
    label?: string;
}
