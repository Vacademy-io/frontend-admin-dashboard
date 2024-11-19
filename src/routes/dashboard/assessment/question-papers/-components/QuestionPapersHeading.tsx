import { Button } from "@/components/ui/button";
import { Plus } from "phosphor-react";

export const QuestionPapersHeading = () => {
    return (
        <div className="flex items-center justify-between gap-10">
            <div className="flex flex-col">
                <h1 className="text-[1.25rem] font-bold text-neutral-600">
                    Question Paper Access & Management
                </h1>
                <p className="text-neutral-600">
                    Quickly access and manage all question papers across classes and subjects.
                    Easily browse and organize papers to support smooth exam preparation.
                </p>
            </div>
            <Button className="bg-primary-500 text-white">
                <Plus />
                Add Question Paper
            </Button>
        </div>
    );
};
