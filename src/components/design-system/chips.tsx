import React from "react";
import { cn } from "@/lib/utils";
import {
    InputChipsProps,
    FilterChipsProps,
    StatusChipsProps,
    ChipsProps,
    ChipsWrapperProps,
} from "./utils/types/chips-types";
import { PlusCircle } from "@phosphor-icons/react";
import { ActivityStatusData } from "./utils/data/chips-data";

const ChipsWrapper = ({ children, className }: ChipsWrapperProps) => {
    return (
        <div
            className={cn(
                "inline-flex h-8 flex-shrink-0 cursor-pointer items-center justify-center gap-2 rounded-lg border border-neutral-300 px-3 py-[6px] text-body font-regular text-neutral-600",
                className,
            )}
        >
            {children}
        </div>
    );
};

const Chips = ({
    label,
    trailingIcon,
    leadingIcon,
    avatarAddress,
    selected,
    disabled,
}: ChipsProps) => {
    return (
        <ChipsWrapper
            className={cn(
                avatarAddress ? "rounded-full" : "rounded-lg",
                "active:bg-[#e4d5c1]",
                disabled
                    ? "border-neutral-100"
                    : selected
                      ? "border-primary-500 bg-primary-100"
                      : "hover:border-primary-500 hover:bg-primary-50",
            )}
        >
            {leadingIcon &&
                React.createElement(leadingIcon, {
                    className: cn(
                        "size-[18px]",
                        disabled ? "text-neutral-300" : "text-neutral-600",
                    ),
                })}

            {avatarAddress && (
                <div className="size-5 overflow-hidden rounded-full">
                    <img src={avatarAddress} className="size-5 object-cover" alt="avatar" />
                </div>
            )}

            {label && (
                <div
                    className={cn(
                        "flex items-center text-[14px] leading-[22px]",
                        disabled ? "text-neutral-300" : "text-neutral-600",
                    )}
                >
                    {label}
                </div>
            )}
            {trailingIcon &&
                React.createElement(trailingIcon, {
                    className: cn("size-4", disabled ? "text-neutral-300" : "text-neutral-600"),
                })}
        </ChipsWrapper>
    );
};

export const InputChips = (props: InputChipsProps) => {
    return <Chips {...props} />;
};

export const FilterChips = ({ label, selected }: FilterChipsProps) => {
    return <Chips label={label} leadingIcon={PlusCircle} selected={selected} />;
};

export const StatusChips = ({ status }: StatusChipsProps) => {
    const statusData = ActivityStatusData[status];
    const StatusIcon = statusData.icon;

    return (
        <ChipsWrapper className={cn(statusData.color.bg, "")}>
            <StatusIcon className={cn(statusData.color.icon, "size-[18px]")} weight="fill" />
            <div className="text-body capitalize text-neutral-600">{status}</div>
        </ChipsWrapper>
    );
};
