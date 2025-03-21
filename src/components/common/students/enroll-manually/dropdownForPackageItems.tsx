import { useEffect, useState } from "react";
import { CaretDown, CaretUp, CaretRight } from "@phosphor-icons/react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuPortal,
    DropdownMenuSub,
    DropdownMenuSubTrigger,
    DropdownMenuSubContent,
} from "@radix-ui/react-dropdown-menu";
import { myDropDownProps, DropdownItem, DropdownItemType } from "./dropdownTypesForPackageItems";

const isDropdownItem = (item: string | DropdownItem | DropdownItemType): item is DropdownItem => {
    return typeof item !== "string" && "label" in item;
};

const isDropdownItemType = (
    item: string | DropdownItem | DropdownItemType,
): item is DropdownItemType => {
    return typeof item !== "string" && "id" in item && "name" in item;
};

export const MyDropdown = ({
    currentValue,
    handleChange,
    dropdownList,
    children,
    onSelect,
    placeholder = "Select an option",
    error,
    disable,
    required = false,
}: myDropDownProps) => {
    const [isOpen, setIsOpen] = useState<boolean>(false);

    useEffect(() => {
        // Auto-select the only item if dropdownList has exactly one item and no current value is set
        if (dropdownList.length === 1) {
            const singleItem = dropdownList[0];
            if (handleChange) {
                singleItem && handleChange(singleItem);
            }
            if (onSelect) {
                singleItem && onSelect(singleItem);
            }
        }
    }, [dropdownList]);

    const handleValueChange = (value: string | DropdownItem | DropdownItemType) => {
        if (handleChange) {
            handleChange(value);
        }
        if (onSelect) {
            onSelect(value);
        }
        setIsOpen(false);
    };

    const handleClearAll = () => {
        handleValueChange(""); // Reset the value to an empty string or null
    };

    // Helper function to get display text from the currentValue
    const getDisplayText = () => {
        if (!currentValue) return placeholder;

        if (isDropdownItem(currentValue)) {
            return currentValue.label;
        } else if (isDropdownItemType(currentValue)) {
            return currentValue.name;
        } else {
            return currentValue; // It's a string
        }
    };

    const renderMenuItem = (item: string | DropdownItem | DropdownItemType) => {
        if (isDropdownItem(item)) {
            if (item.subItems) {
                return (
                    <DropdownMenuSub key={item.value}>
                        <DropdownMenuSubTrigger className="flex w-full cursor-pointer items-center justify-between rounded px-3 py-2 text-subtitle text-neutral-600 hover:bg-primary-50 focus:outline-none">
                            <div className="flex items-center gap-2">
                                {item.icon}
                                <span>{item.label}</span>
                            </div>
                            <CaretRight className="size-4" />
                        </DropdownMenuSubTrigger>
                        <DropdownMenuPortal>
                            <DropdownMenuSubContent className="z-[9999] min-w-32 rounded-lg bg-white py-2 shadow-lg">
                                {item.subItems.map((subItem) => renderMenuItem(subItem))}
                            </DropdownMenuSubContent>
                        </DropdownMenuPortal>
                    </DropdownMenuSub>
                );
            }
            return (
                <DropdownMenuItem
                    key={item.value}
                    className={`cursor-pointer truncate px-3 py-2 text-subtitle text-neutral-600 hover:bg-primary-50 ${
                        currentValue === item.value ? "bg-primary-50" : "bg-none"
                    } hover:outline-none`}
                    onClick={() => handleValueChange(item)}
                    disabled={disable}
                >
                    <div className="flex items-center gap-2">
                        {item.icon}
                        {item.label}
                    </div>
                </DropdownMenuItem>
            );
        }

        if (isDropdownItemType(item)) {
            return (
                <DropdownMenuItem
                    key={item.id}
                    className={`cursor-pointer truncate px-3 py-2 text-subtitle text-neutral-600 hover:bg-primary-50 ${
                        currentValue === item.id ? "bg-primary-50" : "bg-none"
                    } hover:outline-none`}
                    onClick={() => handleValueChange(item)}
                    disabled={disable}
                >
                    {item.name}
                </DropdownMenuItem>
            );
        }

        return (
            <DropdownMenuItem
                key={item}
                className={`cursor-pointer truncate px-3 py-2 text-subtitle text-neutral-600 hover:bg-primary-50 ${
                    currentValue === item ? "bg-primary-50" : "bg-none"
                } hover:outline-none`}
                onClick={() => handleValueChange(item)}
                disabled={disable}
            >
                {item}
            </DropdownMenuItem>
        );
    };

    return (
        <div className="flex flex-col gap-1">
            <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
                {children ? (
                    <DropdownMenuTrigger className="w-full focus:outline-none" disabled={disable}>
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
                        disabled={disable}
                    >
                        <div className={`truncate ${!currentValue ? "text-neutral-400" : ""}`}>
                            {getDisplayText()}
                        </div>
                        <div className="ml-2 flex-shrink-0">
                            <CaretDown className={`${isOpen ? "hidden" : "visible"} size-[18px]`} />
                            <CaretUp className={`${isOpen ? "visible" : "hidden"} size-[18px]`} />
                        </div>
                    </DropdownMenuTrigger>
                )}
                <DropdownMenuPortal container={document.getElementById("portal-root")}>
                    <DropdownMenuContent
                        className="z-[9999] mt-2 min-w-60 rounded-lg bg-white py-2 shadow focus:outline-none"
                        sideOffset={5}
                        align="start"
                    >
                        {/* Add "Clear All Fields" option */}
                        {dropdownList.length == 1 && required == true ? (
                            <></>
                        ) : (
                            <DropdownMenuItem
                                className="cursor-pointer truncate px-3 py-2 text-center text-subtitle text-neutral-400 hover:bg-primary-50 hover:outline-none"
                                onClick={handleClearAll}
                            >
                                Clear All Fields
                            </DropdownMenuItem>
                        )}
                        {dropdownList.map((item) => renderMenuItem(item))}
                    </DropdownMenuContent>
                </DropdownMenuPortal>
            </DropdownMenu>
            {error && <p className="text-caption text-danger-500">This field is required</p>}
        </div>
    );
};
