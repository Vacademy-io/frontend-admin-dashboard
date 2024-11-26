export interface InputErrorProps {
    errorMessage: string;
}

// FormInput Props
export type InputSize = "small" | "medium" | "large";

export interface FormInputProps
    extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size" | "onChange"> {
    inputType?: string;
    inputPlaceholder?: string;
    input: string;
    setInput: (value: string) => void;
    error?: string | null;
    required?: boolean;
    size?: InputSize;
    label?: string;
    disabled?: boolean;
}
