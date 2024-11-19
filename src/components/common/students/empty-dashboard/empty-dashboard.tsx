import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Share } from "@phosphor-icons/react";
import { MyButton } from "@/components/design-system/button";
import { EmptyDashboardImage } from "@/svgs";

export const EmptyDashboard = () => {
    return (
        <div
            className={`flex w-full flex-col items-center justify-center gap-4 rounded-md bg-neutral-50 py-10`}
            style={{ height: `calc(100vh - 160px)` }}
        >
            <EmptyDashboardImage />
            <div className="text-title font-regular text-neutral-600">
                No student data available
            </div>
            <Dialog>
                <DialogTrigger>
                    <MyButton buttonType="primary" scale="large" layoutVariant="default">
                        Enroll Students
                    </MyButton>
                </DialogTrigger>
                <DialogContent className="w-[400px] p-0 font-normal">
                    <DialogHeader>
                        <div className="bg-primary-50 px-6 py-4 text-h3 font-semibold text-primary-500">
                            Enroll Students
                        </div>
                        <DialogDescription className="flex flex-col items-center justify-center gap-6 p-6 text-neutral-600">
                            <MyButton buttonType="secondary" scale="large" layoutVariant="default">
                                Enroll Manually
                            </MyButton>
                            <MyButton buttonType="secondary" scale="large" layoutVariant="default">
                                Enroll From Requests
                            </MyButton>
                            <MyButton buttonType="primary" scale="large" layoutVariant="default">
                                <span>
                                    <Share />
                                </span>
                                Enroll in Bulk
                            </MyButton>
                        </DialogDescription>
                    </DialogHeader>
                </DialogContent>
            </Dialog>
        </div>
    );
};
