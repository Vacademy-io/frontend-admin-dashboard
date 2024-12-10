export interface myDropDownProps {
    currentValue?: string;
    setCurrentValue?: React.Dispatch<React.SetStateAction<string>>;
    dropdownList: string[];
    children?: React.ReactNode;
    onSelect?: (value: string) => void;
}
