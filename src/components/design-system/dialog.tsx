import { Dialog, DialogContent, DialogHeader, DialogTrigger } from "@/components/ui/dialog";
import { DialogDescription } from "@radix-ui/react-dialog";
import { ReactNode } from "react";

interface DialogProps {
    trigger: ReactNode;
    heading: string;
    children: React.ReactNode;
    dialogWidth?: string;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
}

export const MyDialog = ({
    trigger,
    heading,
    children,
    dialogWidth,
    open,
    onOpenChange,
}: DialogProps) => {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogTrigger asChild>{trigger}</DialogTrigger>
            <DialogContent className={`${dialogWidth} p-0 font-normal`}>
                <DialogHeader>
                    <div className="bg-primary-50 px-6 py-4 text-h3 font-semibold text-primary-500">
                        {heading}
                    </div>
                    <DialogDescription asChild className=" ">
                        <div className="p-6">{children}</div>
                    </DialogDescription>
                </DialogHeader>
            </DialogContent>
        </Dialog>
    );
};
