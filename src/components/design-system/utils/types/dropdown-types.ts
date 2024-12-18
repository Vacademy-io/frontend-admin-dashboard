export interface myDropDownProps {
    currentValue?: string;
    handleChange?: (value: string) => void;
    dropdownList: string[];
    children?: React.ReactNode;
    onSelect?: (value: string) => void;
}
