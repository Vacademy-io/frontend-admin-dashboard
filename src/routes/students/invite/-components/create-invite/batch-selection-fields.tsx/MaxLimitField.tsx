import { MyInput } from "@/components/design-system/input";
import { useState } from "react";

interface MaxLimitFieldProp {
    title: string;
    maxAllowed: number;
    isDisabled?: boolean;
}

export const MaxLimitField = ({ title, maxAllowed, isDisabled = false }: MaxLimitFieldProp) => {
    const [input, setInput] = useState("1");

    return (
        <div className="flex items-center gap-6">
            <p>Allowed limit for {title} preference</p>
            <MyInput
                input={input}
                inputType="number"
                onChangeFunction={(e) => {
                    const value = parseInt(e.target.value) || 0;
                    // Ensure the value is between 1 and maxAllowed
                    if (value < 1) {
                        const num = String(1);
                        setInput(num);
                    } else if (value > maxAllowed) {
                        const num = String(maxAllowed);
                        setInput(num);
                    } else {
                        const num = String(value);
                        setInput(num);
                    }
                }}
                className="w-[70px]"
                inputPlaceholder="1"
                disabled={isDisabled}
            />
        </div>
    );
};
