import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTrigger,
    DialogClose,
} from '@/components/ui/dialog';
import { DialogDescription, DialogTitle } from '@radix-ui/react-dialog';
import React, { ReactNode } from 'react';
import { X } from '@phosphor-icons/react';

interface DialogProps {
    trigger?: ReactNode;
    heading: string;
    content?: React.ReactNode;
    dialogWidth?: string;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    children?: React.ReactNode;
    footer?: JSX.Element;
    isTour?: boolean;
    dialogId?: string;
    headerActions?: React.ReactNode;
    className?: string;
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
    isTour = false,
    dialogId,
    headerActions,
    className,
}: DialogProps) => {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogTrigger asChild>{trigger}</DialogTrigger>
            <DialogContent
                data-dialog-id={dialogId}
                className={`${dialogWidth} dialog-no-close-icon flex max-h-[80vh] max-w-[80vw] flex-col p-0 ${className}`}
                onInteractOutside={(e) => {
                    if (isTour) e.preventDefault();
                }}
            >
                <DialogTitle className="flex justify-between rounded-lg bg-primary-50">
                    <DialogHeader className="sticky top-0 z-10 flex w-full items-center justify-between rounded-t-lg px-6 py-4 font-semibold text-primary-500">
                        <span>{heading}</span>
                        <div className="flex items-center gap-2">
                            {headerActions && (
                                <div className="flex items-center gap-2">{headerActions}</div>
                            )}
                            <DialogClose asChild>
                                <button
                                    type="button"
                                    className="rounded-sm p-1 opacity-70 transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                                    aria-label="Close dialog"
                                >
                                    <X size={16} />
                                </button>
                            </DialogClose>
                        </div>
                    </DialogHeader>
                </DialogTitle>
                <DialogDescription asChild className="m-0 overflow-y-auto overflow-x-hidden p-0">
                    <div className="p-3">{children || content}</div>
                </DialogDescription>
                {footer && (
                    <DialogFooter className="sticky top-0 z-10 w-full rounded-b-lg border-t border-t-neutral-300 bg-white p-2">
                        {footer}
                    </DialogFooter>
                )}
            </DialogContent>
        </Dialog>
    );
};
