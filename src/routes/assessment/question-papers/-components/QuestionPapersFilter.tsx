import { Button } from "@/components/ui/button";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { CheckIcon } from "@radix-ui/react-icons";
import { PlusCircle } from "phosphor-react";
import { useState } from "react";

export const QuestionPapersFilter = ({ label, data }: { label: string; data: string[] }) => {
    const [selectedItems, setSelectedItems] = useState<string[]>([]);

    const toggleSelection = (option: string) => {
        setSelectedItems(
            (prevSelected) =>
                prevSelected.includes(option)
                    ? prevSelected.filter((item) => item !== option) // Remove item
                    : [...prevSelected, option], // Add item
        );
    };

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button variant={"outline"} className="text-neutral-600">
                    <PlusCircle size={32} />
                    {label}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-0" align="start">
                <Command>
                    <CommandInput placeholder="Type a command or search..." />
                    <CommandList>
                        <CommandEmpty>No results found.</CommandEmpty>
                        <CommandGroup heading="Suggestions">
                            {data.map((option: string, index: number) => {
                                const isSelected = selectedItems.includes(option);
                                return (
                                    <CommandItem
                                        key={index}
                                        onSelect={() => toggleSelection(option)}
                                    >
                                        <div
                                            className={cn(
                                                "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-gray-300",
                                                isSelected
                                                    ? "border-none bg-primary-300 text-white"
                                                    : "opacity-70 [&_svg]:invisible",
                                            )}
                                        >
                                            <CheckIcon
                                                className={cn("h-4 w-4 rounded-sm bg-primary-500")}
                                            />
                                        </div>
                                        {option}
                                    </CommandItem>
                                );
                            })}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
};
