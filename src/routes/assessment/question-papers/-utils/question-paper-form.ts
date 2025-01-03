import { useForm, UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { uploadQuestionPaperFormSchema } from "./upload-question-paper-form-schema";

export type UploadQuestionPaperFormType = z.infer<typeof uploadQuestionPaperFormSchema>;

export const useUploadQuestionPaperForm = (): UseFormReturn<UploadQuestionPaperFormType> => {
    return useForm<UploadQuestionPaperFormType>({
        resolver: zodResolver(uploadQuestionPaperFormSchema),
        mode: "onChange",
        defaultValues: {
            questionPaperId: "1",
            isFavourite: false,
            title: "",
            createdOn: new Date(),
            yearClass: "",
            subject: "",
            questionsType: "",
            optionsType: "",
            answersType: "",
            explanationsType: "",
            fileUpload: undefined,
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
                            isSelected: true,
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
};
