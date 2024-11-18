import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { MdErrorOutline } from "react-icons/md";
import { ErrorDialogProps } from "../types";

export const ErrorDialog = ({ open, description, setIsDialogOpen }: ErrorDialogProps) => {
    return (
        <Dialog open={open} onOpenChange={() => setIsDialogOpen(false)}>
            <DialogContent className="w-[350px] bg-danger-100">
                <DialogHeader>
                    <DialogTitle className="flex gap-1 text-danger-600">
                        <div>Login Error</div>
                        <MdErrorOutline />
                    </DialogTitle>
                    <DialogDescription className="text-neutral-600">
                        {description}
                    </DialogDescription>
                </DialogHeader>
            </DialogContent>
        </Dialog>
    );
};
