import { useEffect, useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CaretDown, CaretUp, Check } from "phosphor-react";
import { FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { type Control } from "react-hook-form";
import { cn } from "@/lib/utils";

interface LevelOption {
    id: string;
    name: string;
}

interface EnhancedMultiSelectProps {
    form: any; // eslint-disable-line
    className?: string;
    label: string;
    labelStyle?: string;
    name: string;
    options: LevelOption[];
    required?: boolean;
    control: any; // eslint-disable-line
}

export default function EnhancedMultiSelect({
    form,
    label,
    labelStyle,
    name,
    options,
    required = false,
    control,
}: EnhancedMultiSelectProps) {
    // Track selected options as objects instead of just values
    const [selectedOptions, setSelectedOptions] = useState<LevelOption[]>([]);
    const [isOpen, setIsOpen] = useState(false);

    // Initialize from form values (assuming they're stored as IDs)
    useEffect(() => {
        const formValues = form.getValues("roleType") || [];
        if (Array.isArray(formValues) && formValues.length > 0) {
            // Convert IDs back to full objects
            const selectedObjects = formValues.map((id) => {
                const option = options.find((opt) => opt.id === id);
                return option || { id, name: id.toString() }; // Fallback if option not found
            });
            setSelectedOptions(selectedObjects);
        }
    }, [options]);

    const toggleSelection = (option: LevelOption) => {
        setSelectedOptions((prev) => {
            const isSelected = prev.some((item) => item.id === option.id);
            if (isSelected) {
                return prev.filter((item) => item.id !== option.id);
            } else {
                return [...prev, option];
            }
        });
    };

    // Update form value when selections change - store only IDs
    useEffect(() => {
        const ids = selectedOptions.map((option) => option.id);
        form.setValue("roleType", ids);
    }, [selectedOptions]);

    return (
        <>
            <FormField
                control={control as Control}
                name={name}
                render={() => {
                    return (
                        <div>
                            <FormItem className={cn("flex items-center gap-3")}>
                                <FormLabel className={labelStyle}>
                                    {label}
                                    {required && <span className="text-red-500">*</span>}
                                </FormLabel>
                                <FormControl>
                                    <Popover open={isOpen} onOpenChange={setIsOpen}>
                                        <PopoverTrigger>
                                            <div className="flex items-center justify-between rounded-lg border bg-white px-3 py-2">
                                                <h1 className="text-sm">Select options</h1>
                                                {isOpen ? <CaretUp /> : <CaretDown />}
                                            </div>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-full p-1">
                                            {options.map((option) => (
                                                <div
                                                    key={option.id}
                                                    className="flex cursor-pointer justify-between rounded-lg bg-white p-2 hover:bg-neutral-100"
                                                    onClick={() => toggleSelection(option)}
                                                >
                                                    <label className="text-sm">{option.name}</label>
                                                    {selectedOptions.some(
                                                        (item) => item.id === option.id,
                                                    ) && <Check size={18} />}
                                                </div>
                                            ))}
                                        </PopoverContent>
                                    </Popover>
                                </FormControl>
                            </FormItem>
                            <div className="flex flex-wrap justify-start gap-4">
                                {selectedOptions.map((option, index) => (
                                    <div
                                        key={index}
                                        className="rounded-lg border border-neutral-300 bg-neutral-50 px-2 py-1 text-body text-neutral-600"
                                    >
                                        {option.name}
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                }}
            />
        </>
    );
}
