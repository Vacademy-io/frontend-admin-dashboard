import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { MainViewComponentFactory } from "@/routes/assessment/question-papers/-components/QuestionPaperTemplatesTypes/MainViewComponentFactory";
import { UploadQuestionPaperFormType } from "@/routes/assessment/question-papers/-components/QuestionPaperUpload";
import { uploadQuestionPaperFormSchema } from "@/routes/assessment/question-papers/-utils/upload-question-paper-form-schema";
import { QuestionType } from "@/constants/dummy-data";
import { useEffect, useState } from "react";
import { Slide } from "../-hooks/use-slides";
import { useContentStore } from "../-stores/chapter-sidebar-store";

function updateDocumentDataInSlides(
    data: Slide[],
    slide: Slide,
    formData: UploadQuestionPaperFormType,
    setActiveItem: (item: Slide) => void,
): Slide[] {
    return data.map((item) => {
        if (item.slide_id === slide.slide_id) {
            const changedData: Slide = {
                ...item,
                document_data: JSON.stringify(formData),
            };
            setActiveItem(changedData);
            return changedData;
        }
        return item;
    });
}

export const StudyLibraryQuestionsPreview = ({ activeItem }: { activeItem: Slide }) => {
    const defaultValues = JSON.parse(activeItem.document_data!);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const { setItems, setActiveItem, items } = useContentStore();

    const form = useForm<UploadQuestionPaperFormType>({
        resolver: zodResolver(uploadQuestionPaperFormSchema),
        defaultValues,
    });

    const { watch } = form;

    useEffect(() => {
        const subscription = watch((_, { name }) => {
            if (name?.startsWith("questions")) {
                const modifiedItems = updateDocumentDataInSlides(
                    items,
                    activeItem,
                    form.getValues(),
                    setActiveItem,
                );
                setItems(modifiedItems);
            }
        });

        return () => subscription.unsubscribe(); // cleanup
    }, [watch, items, activeItem, form, setItems]);

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
