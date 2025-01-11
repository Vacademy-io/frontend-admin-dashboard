import { Button } from "@/components/ui/button";
import { Plus, X } from "phosphor-react";
import {
    AlertDialog,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { QuestionPaperUpload } from "./QuestionPaperUpload";
import { useIsMobile } from "@/hooks/use-mobile";

export const QuestionPapersHeading = () => {
    const isMobile = useIsMobile();
    return (
        <div
            className={`flex items-center justify-between gap-10 ${
                isMobile ? "flex-wrap gap-4" : ""
            }`}
        >
            <div className="flex flex-col">
                <h1 className="text-[1.25rem] font-bold text-neutral-600">
                    Question Paper Access & Management
                </h1>
                <p className="text-neutral-600">
                    Quickly access and manage all question papers across classes and subjects.
                    Easily browse and organize papers to support smooth exam preparation.
                </p>
            </div>
            <AlertDialog>
                <AlertDialogTrigger>
                    <Button className="bg-primary-500 text-white">
                        <Plus />
                        Add Question Paper
                    </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="p-0">
                    <div className="flex items-center justify-between rounded-md bg-primary-50">
                        <h1 className="rounded-sm p-4 text-primary-500">Add Question Paper</h1>
                        <AlertDialogCancel className="border-none bg-primary-50 shadow-none hover:bg-primary-50">
                            <X className="text-neutral-600" />
                        </AlertDialogCancel>
                    </div>
                    <div className="mb-6 mt-2 flex flex-col items-center justify-center gap-6">
                        <AlertDialog>
                            <AlertDialogTrigger>
                                <Button variant="outline" className="w-40 text-neutral-600">
                                    Create Manually
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="p-0">
                                <div className="flex items-center justify-between rounded-md bg-primary-50">
                                    <h1 className="rounded-sm p-4 font-bold text-primary-500">
                                        Create Question Paper Manually
                                    </h1>
                                    <AlertDialogCancel className="border-none bg-primary-50 shadow-none hover:bg-primary-50">
                                        <X className="text-neutral-600" />
                                    </AlertDialogCancel>
                                </div>
                                <QuestionPaperUpload isManualCreated={true} />
                            </AlertDialogContent>
                        </AlertDialog>
                        <AlertDialog>
                            <AlertDialogTrigger>
                                <Button variant="outline" className="w-40 text-neutral-600">
                                    Upload from Device
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="p-0">
                                <div className="flex items-center justify-between rounded-md bg-primary-50">
                                    <h1 className="rounded-sm p-4 font-bold text-primary-500">
                                        Upload Question Paper From Device
                                    </h1>
                                    <AlertDialogCancel className="border-none bg-primary-50 shadow-none hover:bg-primary-50">
                                        <X className="text-neutral-600" />
                                    </AlertDialogCancel>
                                </div>
                                <QuestionPaperUpload isManualCreated={false} />
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};
