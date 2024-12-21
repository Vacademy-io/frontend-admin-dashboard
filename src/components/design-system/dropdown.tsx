import { useState } from "react";
import { CaretDown, CaretUp } from "@phosphor-icons/react";
// import { VscError } from "react-icons/vsc";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuPortal,
} from "@radix-ui/react-dropdown-menu";
import { myDropDownProps } from "./utils/types/dropdown-types";

export const MyDropdown = ({
    currentValue,
    handleChange,
    dropdownList,
    children,
    onSelect,
    placeholder = "Select an option",
    error,
    disable,
}: myDropDownProps) => {
    const [isOpen, setIsOpen] = useState<boolean>(false);

    // const DropdownError = ({ errorMessage }: { errorMessage: string }) => {
    //     return (
    //         <div className="flex items-center gap-1 pl-1 text-body font-regular text-danger-600">
    //             <span>
    //                 <VscError />
    //             </span>
    //             <span className="mt-[3px]">{errorMessage}</span>
    //         </div>
    //     );
    // };

    const handleValueChange = (value: string) => {
        if (handleChange) {
            handleChange(value);
        }
        if (onSelect) {
            onSelect(value);
        }
        setIsOpen(false);
    };

    return (
        <div className="flex flex-col gap-1">
            <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
                {children ? (
                    <DropdownMenuTrigger className="w-full focus:outline-none">
                        {children}
                    </DropdownMenuTrigger>
                ) : (
                    <DropdownMenuTrigger
                        className={`inline-flex h-9 min-w-60 items-center justify-between rounded-lg border px-3 py-2 text-subtitle text-neutral-600 focus:outline-none ${
                            error
                                ? "border-danger-600"
                                : isOpen
                                  ? "border-primary-500"
                                  : "border-neutral-300 hover:border-primary-200 focus:border-primary-500"
                        }`}
                    >
                        <div className={`truncate ${!currentValue ? "text-neutral-400" : ""}`}>
                            {currentValue || placeholder}
                        </div>
                        <div className="ml-2 flex-shrink-0">
                            <CaretDown className={`${isOpen ? "hidden" : "visible"} size-[18px]`} />
                            <CaretUp className={`${isOpen ? "visible" : "hidden"} size-[18px]`} />
                        </div>
                    </DropdownMenuTrigger>
                )}
                <DropdownMenuPortal container={document.getElementById("portal-root")}>
                    <DropdownMenuContent
                        className="z-[9999] mt-2 w-60 rounded-lg bg-white py-2 shadow focus:outline-none"
                        sideOffset={5}
                        align="start"
                    >
                        {dropdownList.map((item, key) => (
                            <DropdownMenuItem
                                disabled={disable}
                                key={key}
                                className={`cursor-pointer truncate px-3 py-2 text-subtitle text-neutral-600 hover:bg-primary-50 ${
                                    currentValue == item ? "bg-primary-50" : "bg-none"
                                } hover:outline-none`}
                                onClick={() => handleValueChange(item)}
                            >
                                {item}
                            </DropdownMenuItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenuPortal>
            </DropdownMenu>
        </div>
    );
};
