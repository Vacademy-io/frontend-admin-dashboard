// components/field-error-display.tsx
import React from "react";
import { ValidationError } from "@/types/students/bulk-upload-types";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Warning } from "@phosphor-icons/react";

interface FieldErrorDisplayProps {
    error?: ValidationError;
    value: string | number | boolean;
}

export const FieldErrorDisplay: React.FC<FieldErrorDisplayProps> = ({ error, value }) => {
    if (!error) {
        return (
            <div className="max-w-[180px] overflow-hidden overflow-ellipsis whitespace-nowrap">
                {value?.toString() || ""}
            </div>
        );
    }

    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <div className="flex max-w-[180px] items-center gap-1">
                        <div className="overflow-hidden overflow-ellipsis whitespace-nowrap border-b border-dashed border-danger-500 text-danger-700">
                            {value?.toString() || ""}
                        </div>
                        <Warning className="h-4 w-4 min-w-4 text-danger-500" />
                    </div>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs space-y-1 p-3">
                    <p className="font-medium text-danger-700">{error.message}</p>
                    {error.resolution && (
                        <p className="text-sm text-neutral-600">{error.resolution}</p>
                    )}
                    {error.format && (
                        <p className="text-xs text-neutral-500">
                            <span className="font-medium">Expected format:</span> {error.format}
                        </p>
                    )}
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
};
