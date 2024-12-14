export interface myDropDownProps {
    currentValue?: string;
    handleChange?: (value: string) => void; // Change this to accept a regular function
    dropdownList: string[];
    children?: React.ReactNode;
    onSelect?: (value: string) => void;
}
