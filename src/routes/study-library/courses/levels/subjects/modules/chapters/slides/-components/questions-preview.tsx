import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { MainViewComponentFactory } from "@/routes/assessment/question-papers/-components/QuestionPaperTemplatesTypes/MainViewComponentFactory";
import { UploadQuestionPaperFormType } from "@/routes/assessment/question-papers/-components/QuestionPaperUpload";
import { uploadQuestionPaperFormSchema } from "@/routes/assessment/question-papers/-utils/upload-question-paper-form-schema";
import { QuestionType } from "@/constants/dummy-data";
import { useState } from "react";
import { Slide } from "../-hooks/use-slides";

export const StudyLibraryQuestionsPreview = ({ activeItem }: { activeItem: Slide }) => {
    const defaultValues = JSON.parse(activeItem.document_data!);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

    const form = useForm<UploadQuestionPaperFormType>({
        resolver: zodResolver(uploadQuestionPaperFormSchema),
        defaultValues,
    });

    return (
        <div key={`question-${activeItem.slide_id}`} className="size-full">
            <FormProvider {...form}>
                <MainViewComponentFactory
                    key={currentQuestionIndex}
                    type={activeItem.document_type as QuestionType}
                    props={{
                        form,
                        currentQuestionIndex,
                        setCurrentQuestionIndex,
                        className:
                            "dialog-height overflow-auto ml-6 flex w-full flex-col gap-6 pr-6 pt-4",
                    }}
                />
            </FormProvider>
        </div>
    );
};
