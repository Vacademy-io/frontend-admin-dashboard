import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTrigger,
} from "@/components/ui/dialog";
import { DialogDescription, DialogTitle } from "@radix-ui/react-dialog";
import React, { ReactNode } from "react";

interface DialogProps {
    trigger?: ReactNode;
    heading: string;
    content?: React.ReactNode;
    dialogWidth?: string;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    children?: React.ReactNode;
    footer?: JSX.Element;
}

export const MyDialog = ({
    trigger,
    heading,
    content,
    children,
    dialogWidth,
    open,
    onOpenChange,
    footer,
}: DialogProps) => {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogTrigger asChild>{trigger}</DialogTrigger>
            <DialogContent
                className={`${dialogWidth} dialog-no-close-icon flex max-h-[80vh] max-w-[80vw] flex-col p-0`}
            >
                <DialogTitle className="flex justify-between rounded-lg bg-primary-50">
                    <DialogHeader className="sticky top-0 z-10 rounded-t-lg px-6 py-4 font-semibold text-primary-500">
                        {heading}
                    </DialogHeader>
                </DialogTitle>
                <DialogDescription asChild className="flex-1 overflow-y-scroll">
                    <div className="p-3">{children || content}</div>
                </DialogDescription>
                {footer && (
                    <DialogFooter className="sticky top-0 z-10 w-full rounded-b-lg border-t border-t-neutral-300 bg-white px-4 py-4">
                        {footer}
                    </DialogFooter>
                )}
            </DialogContent>
        </Dialog>
    );
};
