import { FormProvider, useForm } from "react-hook-form";
import { uploadQuestionPaperFormSchema } from "../-utils/upload-question-paper-form-schema";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { QuestionPaperTemplate } from "./QuestionPaperTemplate";
import { useQuestionStore } from "../-global-states/question-index";
import { useEffect } from "react";
type QuestionPaperForm = z.infer<typeof uploadQuestionPaperFormSchema>;

export const ViewQuestionPaper = ({ questionsPaper }: { questionsPaper: QuestionPaperForm }) => {
    const { setCurrentQuestionIndex } = useQuestionStore();

    const form = useForm<z.infer<typeof uploadQuestionPaperFormSchema>>({
        resolver: zodResolver(uploadQuestionPaperFormSchema),
        mode: "onChange",
        defaultValues: {
            questionPaperId: questionsPaper.questionPaperId,
            isFavourite: questionsPaper.isFavourite,
            title: questionsPaper.title,
            createdOn: questionsPaper.createdOn,
            yearClass: questionsPaper.yearClass,
            subject: questionsPaper.subject,
            questionsType: questionsPaper.questionsType,
            optionsType: questionsPaper.optionsType,
            answersType: questionsPaper.answersType,
            explanationsType: questionsPaper.explanationsType,
            fileUpload: questionsPaper.fileUpload,
            questions: questionsPaper.questions,
        },
    });
    const { getValues } = form;
    const questionPaperId = getValues("questionPaperId");

    function onSubmit(values: z.infer<typeof uploadQuestionPaperFormSchema>) {
        console.log(values);
    }

    const onInvalid = (err: unknown) => {
        console.error(err);
    };

    useEffect(() => {
        setCurrentQuestionIndex(0);
    }, []);
    return (
        <FormProvider {...form}>
            <form
                onSubmit={form.handleSubmit(onSubmit, onInvalid)}
                className="scrollbar-hidden no-scrollbar max-h-[60vh] space-y-8 overflow-y-auto p-4 pt-2"
            >
                <QuestionPaperTemplate
                    form={form}
                    questionPaperId={questionPaperId}
                    isViewMode={true}
                />
            </form>
        </FormProvider>
    );
};

export default ViewQuestionPaper;
