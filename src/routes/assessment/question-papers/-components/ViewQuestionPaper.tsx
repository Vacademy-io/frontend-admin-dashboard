import { FormProvider, useForm } from "react-hook-form";
import { uploadQuestionPaperFormSchema } from "../-utils/upload-question-paper-form-schema";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { QuestionPaperTemplate } from "./QuestionPaperTemplate";
import { useQuestionStore } from "../-global-states/question-index";
import { useEffect } from "react";
import { getLevelNameById, getSubjectNameById } from "../-utils/helper";
import { useInstituteDetailsStore } from "@/stores/students/students-list/useInstituteDetailsStore";

export const ViewQuestionPaper = ({
    questionPaperId,
    title,
    subject,
    level,
    refetchData,
}: {
    questionPaperId: string;
    title: string;
    subject: string | null;
    level: string | null;
    refetchData: () => void;
}) => {
    const { instituteDetails } = useInstituteDetailsStore();
    const { setCurrentQuestionIndex } = useQuestionStore();
    const form = useForm<z.infer<typeof uploadQuestionPaperFormSchema>>({
        resolver: zodResolver(uploadQuestionPaperFormSchema),
        mode: "onChange",
        defaultValues: {
            questionPaperId: questionPaperId,
            isFavourite: false,
            title: title,
            createdOn: new Date(),
            yearClass: (instituteDetails && getLevelNameById(instituteDetails.levels, level)) || "",
            subject:
                (instituteDetails && getSubjectNameById(instituteDetails?.subjects, subject)) || "",
            questionsType: "",
            optionsType: "",
            answersType: "",
            explanationsType: "",
            fileUpload: null as unknown as File,
            questions: [
                {
                    questionId: "1",
                    questionName: "",
                    explanation: "",
                    questionType: "MCQS",
                    questionMark: "",
                    imageDetails: [],
                    singleChoiceOptions: [
                        {
                            name: "",
                            isSelected: false,
                            image: {
                                imageId: "",
                                imageName: "",
                                imageTitle: "",
                                imageFile: "",
                                isDeleted: false,
                            },
                        },
                        {
                            name: "",
                            isSelected: false,
                            image: {
                                imageId: "",
                                imageName: "",
                                imageTitle: "",
                                imageFile: "",
                                isDeleted: false,
                            },
                        },
                        {
                            name: "",
                            isSelected: false,
                            image: {
                                imageId: "",
                                imageName: "",
                                imageTitle: "",
                                imageFile: "",
                                isDeleted: false,
                            },
                        },
                        {
                            name: "",
                            isSelected: false,
                            image: {
                                imageId: "",
                                imageName: "",
                                imageTitle: "",
                                imageFile: "",
                                isDeleted: false,
                            },
                        },
                    ],
                    multipleChoiceOptions: [
                        {
                            name: "",
                            isSelected: false,
                            image: {
                                imageId: "",
                                imageName: "",
                                imageTitle: "",
                                imageFile: "",
                                isDeleted: false,
                            },
                        },
                        {
                            name: "",
                            isSelected: false,
                            image: {
                                imageId: "",
                                imageName: "",
                                imageTitle: "",
                                imageFile: "",
                                isDeleted: false,
                            },
                        },
                        {
                            name: "",
                            isSelected: false,
                            image: {
                                imageId: "",
                                imageName: "",
                                imageTitle: "",
                                imageFile: "",
                                isDeleted: false,
                            },
                        },
                        {
                            name: "",
                            isSelected: false,
                            image: {
                                imageId: "",
                                imageName: "",
                                imageTitle: "",
                                imageFile: "",
                                isDeleted: false,
                            },
                        },
                    ],
                },
            ],
        },
    });

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
            <form onSubmit={form.handleSubmit(onSubmit, onInvalid)}>
                <QuestionPaperTemplate
                    form={form}
                    questionPaperId={questionPaperId}
                    isViewMode={true}
                    refetchData={refetchData}
                />
            </form>
        </FormProvider>
    );
};

export default ViewQuestionPaper;
