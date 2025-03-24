import { MyInput } from "@/components/design-system/input";
import { useEffect, useState } from "react";

interface MaxLimitFieldProp {
    title: string;
    maxAllowed: number;
    isDisabled?: boolean;
    onMaxChange?: (value: number) => void;
}

export const MaxLimitField = ({
    title,
    maxAllowed,
    isDisabled = false,
    onMaxChange,
}: MaxLimitFieldProp) => {
    const [input, setInput] = useState(maxAllowed.toString() || "1");

    // Update input when maxAllowed changes externally
    useEffect(() => {
        setInput(maxAllowed.toString());
    }, [maxAllowed]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseInt(e.target.value) || 0;
        let newValue: number;

        // Ensure the value is between 1 and maxAllowed
        if (value < 1) {
            newValue = 1;
            setInput("1");
        } else if (value > maxAllowed) {
            newValue = maxAllowed;
            setInput(maxAllowed.toString());
        } else {
            newValue = value;
            setInput(value.toString());
        }

        // Call the callback if provided
        if (onMaxChange) {
            onMaxChange(newValue);
        }
    };

    return (
        <div className="flex items-center gap-6">
            <p>Allowed limit for {title} preference</p>
            <MyInput
                input={input}
                inputType="number"
                onChangeFunction={handleInputChange}
                className="w-[70px]"
                inputPlaceholder="1"
                disabled={isDisabled}
            />
        </div>
    );
};
