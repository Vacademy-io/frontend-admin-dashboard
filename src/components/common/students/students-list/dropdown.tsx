import { useState } from "react";
import { CaretDown, CaretUp } from "@phosphor-icons/react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@radix-ui/react-dropdown-menu";
import { myDropDownProps } from "@/types/students/students-list-types";

export const MyDropdown = ({ currentValue, setCurrentValue, dropdownList }: myDropDownProps) => {
    const [isOpen, setIsOpen] = useState<boolean>(false);
    return (
        <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
            <DropdownMenuTrigger
                className={`inline-flex h-9 min-w-60 items-center justify-between rounded-lg border border-neutral-300 px-3 py-2 text-subtitle text-neutral-600 focus:outline-none ${
                    isOpen
                        ? "border-primary-500"
                        : "hover:border-primary-200 focus:border-primary-500"
                }`}
            >
                <div>{currentValue}</div>
                <div>
                    <CaretDown className={`${isOpen ? "hidden" : "visible"} size-[18px]`} />
                    <CaretUp className={`${isOpen ? "visible" : "hidden"} size-[18px]`} />
                </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="z-50 mt-2 w-60 rounded-lg bg-white py-2 shadow">
                {dropdownList.map((item, key) => (
                    <DropdownMenuItem
                        key={key}
                        className={`cursor-pointer px-3 py-2 text-subtitle text-neutral-600 hover:bg-primary-50 ${
                            currentValue == item ? "bg-primary-50" : "bg-none"
                        } hover:outline-none`}
                        onClick={() => {
                            setCurrentValue(item);
                        }}
                    >
                        {item}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
};
