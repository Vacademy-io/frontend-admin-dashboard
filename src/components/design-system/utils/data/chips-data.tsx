import {
    Icon,
    CheckCircle,
    XCircle,
    WarningCircle,
    SealPercent,
    GraduationCap,
} from "@phosphor-icons/react";
import { ActivityStatus, FeeStatus, SuccessStatus } from "../types/chips-types";

export const FeeStatusData: Record<FeeStatus, Icon> = {
    refund: SealPercent,
    concession: SealPercent,
    "penalty waiver": XCircle,
    scholarship: GraduationCap,
    "change fee payment": GraduationCap,
};

export const SuccessStatusData: Record<
    SuccessStatus,
    {
        icon: Icon;
        color: {
            bg: string;
            icon: string;
        };
    }
> = {
    successful: {
        icon: CheckCircle,
        color: {
            bg: "bg-success-100",
            icon: "text-success-600",
        },
    },
    pending: {
        icon: XCircle,
        color: {
            bg: "bg-neutral-100",
            icon: "text-neutral-600",
        },
    },
    due: {
        icon: WarningCircle,
        color: {
            bg: "bg-warning-100",
            icon: "text-warning-600",
        },
    },
    failed: {
        icon: XCircle,
        color: {
            bg: "bg-danger-200",
            icon: "text-danger-500",
        },
    },
    "over-due": {
        icon: XCircle,
        color: {
            bg: "bg-primary-100",
            icon: "text-primary-400",
        },
    },
};

export const ActivityStatusData: Record<
    ActivityStatus,
    {
        icon: Icon;
        color: {
            bg: string;
            icon: string;
        };
    }
> = {
    active: {
        icon: CheckCircle,
        color: {
            bg: "bg-success-50",
            icon: "text-success-600",
        },
    },
    inactive: {
        icon: XCircle,
        color: {
            bg: "bg-neutral-100",
            icon: "text-neutral-600",
        },
    },
    pending: {
        icon: WarningCircle,
        color: {
            bg: "bg-warning-100",
            icon: "text-warning-600",
        },
    },
    error: {
        icon: XCircle,
        color: {
            bg: "bg-danger-100",
            icon: "text-danger-600",
        },
    },
};
