import { useSuspenseQuery } from "@tanstack/react-query";
import { Route } from "..";
import { useInstituteQuery } from "@/services/student-list-section/getInstituteDetails";
import {
    getAssessmentDetails,
    getQuestionDataForSection,
} from "@/routes/assessment/create-assessment/$assessmentId/$examtype/-services/assessment-services";
import { DashboardLoader } from "@/components/core/dashboard-loader";
import { MyButton } from "@/components/design-system/button";
import {
    copyToClipboard,
    handleDownloadQRCode,
} from "@/routes/assessment/create-assessment/$assessmentId/$examtype/-utils/helper";
import { Copy, DotsSixVertical, DownloadSimple, SpeakerLow } from "phosphor-react";
import QRCode from "react-qr-code";
import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { transformSectionsAndQuestionsData } from "../-utils/helper";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { sectionsEditQuestionFormSchema } from "../-utils/sections-edit-question-form-schema";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Sortable, SortableDragHandle, SortableItem } from "@/components/ui/sortable";
import { Separator } from "@/components/ui/separator";
import { MainViewComponentFactory } from "./QuestionPaperTemplatesTypes/MainViewComponentFactory";
import { PPTComponentFactory } from "./QuestionPaperTemplatesTypes/PPTComponentFactory";

export type sectionsEditQuestionFormType = z.infer<typeof sectionsEditQuestionFormSchema>;
const AssessmentPreview = ({ handleCloseDialog }: { handleCloseDialog: () => void }) => {
    const { assessmentId, examType } = Route.useParams();
    const { data: instituteDetails } = useSuspenseQuery(useInstituteQuery());
    const { data: assessmentDetails, isLoading } = useSuspenseQuery(
        getAssessmentDetails({
            assessmentId: assessmentId,
            instituteId: instituteDetails?.id,
            type: examType,
        }),
    );
    const [currentQuestionIndexes, setCurrentQuestionIndexes] = useState<{
        [sectionId: string]: number;
    }>({});
    const [currentQuestionImageIndex, setCurrentQuestionImageIndex] = useState(0);
    const [selectedSection, setSelectedSection] = useState(
        assessmentDetails[1]?.saved_data.sections?.[0]?.id || "",
    );
    const { data: questionsDataSectionWise, isLoading: isQuestionsLoading } = useSuspenseQuery(
        getQuestionDataForSection({
            assessmentId,
            sectionIds: assessmentDetails[1]?.saved_data.sections
                ?.map((section) => section.id)
                .join(","),
        }),
    );

    const form = useForm<sectionsEditQuestionFormType>({
        resolver: zodResolver(sectionsEditQuestionFormSchema),
        mode: "onChange",
        defaultValues: {
            sections: [
                {
                    sectionId: "",
                    sectionName: "",
                    questions: [
                        {
                            id: "",
                            questionId: "",
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
            ],
        },
    });

    const { reset, getValues } = form;

    // Find the selected section index
    const selectedSectionIndex =
        assessmentDetails[1]?.saved_data.sections?.findIndex(
            (section) => section.id === selectedSection,
        ) || 0;

    // Get the total number of questions in the current section
    const currentSectionQuestions =
        form.getValues(`sections.${selectedSectionIndex}.questions`) || [];
    const maxQuestions = currentSectionQuestions.length;
    // Get the current question index for the selected section
    const currentQuestionIndex = currentQuestionIndexes[selectedSection] || 0;

    const handlePageClick = (pageIndex: number) => {
        if (pageIndex >= 0 && pageIndex < maxQuestions) {
            setCurrentQuestionIndexes((prev) => ({
                ...prev,
                [selectedSection]: pageIndex,
            }));
        }
    };

    const addQuestionToSelectedSection = () => {
        // Get the current list of questions for the selected section
        const currentQuestions = form.getValues(`sections.${selectedSectionIndex}.questions`) || [];

        // Prepare a new question object to append
        const newQuestion = {
            id: String(currentQuestions.length),
            questionId: "",
            questionName: "",
            explanation: "",
            questionType: "MCQS",
            questionMark: "",
            imageDetails: [],
            singleChoiceOptions: Array(4).fill({
                name: "",
                isSelected: false,
                image: {
                    imageId: "",
                    imageName: "",
                    imageTitle: "",
                    imageFile: "",
                    isDeleted: false,
                },
            }),
            multipleChoiceOptions: Array(4).fill({
                name: "",
                isSelected: false,
                image: {
                    imageId: "",
                    imageName: "",
                    imageTitle: "",
                    imageFile: "",
                    isDeleted: false,
                },
            }),
        };

        // Append the new question to the existing list
        const updatedQuestions = [...currentQuestions, newQuestion];

        // Update form state
        form.setValue(`sections.${selectedSectionIndex}.questions`, updatedQuestions);
        form.trigger(`sections.${selectedSectionIndex}.questions`);

        // Update current question index for the selected section
        setCurrentQuestionIndexes((prev) => ({
            ...prev,
            [selectedSection]: updatedQuestions.length - 1, // Move to the last added question
        }));
    };

    const onInvalid = (err: unknown) => {
        console.error(err);
    };

    function onSubmit(values: z.infer<typeof sectionsEditQuestionFormSchema>) {
        console.log(values);
        handleCloseDialog();
    }

    // Update section while keeping question index valid
    const handleSectionChange = (newSectionId: string) => {
        setSelectedSection(newSectionId);
        setCurrentQuestionIndexes((prev) => ({
            ...prev,
            [newSectionId]: prev[newSectionId] || 0, // Default to first question if not set
        }));
    };

    // When switching sections, ensure `currentQuestionIndex` is within bounds
    useEffect(() => {
        const maxQuestionsInNewSection =
            form.getValues(`sections.${selectedSectionIndex}.questions`)?.length || 0;
        setCurrentQuestionIndexes((prev) => ({
            ...prev,
            [selectedSection]: Math.min(prev[selectedSection] || 0, maxQuestionsInNewSection - 1),
        }));
    }, [selectedSection]); // Runs when section changes

    useEffect(() => {
        if (!assessmentDetails[1]?.saved_data.sections) return;

        const transformedData = transformSectionsAndQuestionsData(
            assessmentDetails[1]?.saved_data.sections || [],
            questionsDataSectionWise,
        );

        reset({ sections: transformedData });
    }, []);

    // Add this new useEffect to handle section/question changes
    useEffect(() => {
        if (selectedSection && currentQuestionIndexes[selectedSection] !== undefined) {
            const sectionIndex = form
                .getValues("sections")
                .findIndex((section) => section.sectionId === selectedSection);

            if (sectionIndex !== -1) {
                const questionIndex = currentQuestionIndexes[selectedSection];
                const currentQuestion = form.getValues(
                    `sections.${sectionIndex}.questions.${questionIndex}`,
                );

                if (currentQuestion) {
                    // Force a form update for the current question
                    form.setValue(
                        `sections.${sectionIndex}.questions.${questionIndex}`,
                        {
                            ...currentQuestion,
                        },
                        {
                            shouldDirty: true,
                            shouldTouch: true,
                        },
                    );
                }
            }
        }
    }, [selectedSection, currentQuestionIndexes]);

    if (isLoading || isQuestionsLoading) return <DashboardLoader />;
    return (
        <div className="flex flex-col">
            <div className="flex h-20 items-center justify-between bg-primary-100 p-6">
                <div className="flex items-center">
                    <h1 className="text-sm font-semibold">Join Link:</h1>
                    <div className="flex items-center gap-8">
                        <div className="flex items-center gap-4">
                            <span className="px-3 py-2 text-sm underline">
                                {assessmentDetails[0]?.saved_data.assessment_url}
                            </span>
                            <MyButton
                                type="button"
                                scale="small"
                                buttonType="secondary"
                                className="h-9 min-w-10"
                                onClick={() =>
                                    copyToClipboard(
                                        assessmentDetails[0]?.saved_data.assessment_url || "",
                                    )
                                }
                            >
                                <Copy size={32} />
                            </MyButton>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <QRCode
                        value={assessmentDetails[0]?.saved_data.assessment_url || ""}
                        className="size-14"
                        id={`qr-code-svg-participants`}
                    />
                    <MyButton
                        type="button"
                        scale="small"
                        buttonType="secondary"
                        className="h-9 min-w-10"
                        onClick={() => handleDownloadQRCode("qr-code-svg-participants")}
                    >
                        <DownloadSimple size={32} />
                    </MyButton>
                </div>
            </div>
            <Tabs value={selectedSection} onValueChange={handleSectionChange}>
                <div className="flex items-center justify-end gap-4 bg-primary-50 p-4">
                    <span className="rounded-full border p-2">
                        <SpeakerLow size={20} />
                    </span>
                    <MyButton
                        type="button"
                        scale="large"
                        buttonType="secondary"
                        layoutVariant="default"
                        className="text-sm"
                        onClick={form.handleSubmit(onSubmit, onInvalid)}
                    >
                        Save
                    </MyButton>
                    <MyButton
                        type="submit"
                        scale="large"
                        buttonType="secondary"
                        layoutVariant="default"
                        className="text-sm"
                        onClick={handleCloseDialog}
                    >
                        Exit
                    </MyButton>
                </div>
                <div className="bg-neutral-50 p-4">
                    <TabsList className="flex w-fit justify-start rounded-none border-b bg-neutral-50">
                        {assessmentDetails[1]?.saved_data?.sections?.map((section) => (
                            <TabsTrigger
                                key={section.id}
                                value={section.id}
                                className={`flex gap-1.5 rounded-none px-12 py-2 !shadow-none ${
                                    selectedSection === section.id
                                        ? "rounded-t-sm border border-primary-200 !border-b-neutral-200 !bg-primary-50"
                                        : "border-none bg-transparent"
                                }`}
                            >
                                {section.name}
                            </TabsTrigger>
                        ))}
                    </TabsList>
                </div>
                <FormProvider {...form}>
                    <form className="no-scrollbar h-screen space-y-8 overflow-y-auto px-4">
                        <TabsContent value={selectedSection}>
                            <div className="flex h-screen items-start">
                                <div className="mt-4 flex w-40 flex-col items-center justify-center gap-2">
                                    <Button
                                        type="button"
                                        className="max-w-sm bg-primary-500 text-xs text-white shadow-none"
                                        onClick={addQuestionToSelectedSection}
                                    >
                                        Add Question
                                    </Button>
                                    <div className="flex h-[325vh] w-40 flex-col items-start justify-between gap-4 overflow-x-hidden overflow-y-scroll p-2">
                                        <Sortable
                                            value={
                                                form.getValues(
                                                    `sections.${selectedSectionIndex}.questions`,
                                                ) || []
                                            }
                                            onMove={({ activeIndex, overIndex }) => {
                                                const currentQuestions =
                                                    form.getValues(
                                                        `sections.${selectedSectionIndex}.questions`,
                                                    ) || [];
                                                const updatedQuestions = [...currentQuestions];

                                                // Perform the move operation in the array
                                                const [removed] = updatedQuestions.splice(
                                                    activeIndex,
                                                    1,
                                                );

                                                // Ensure that removed is not undefined
                                                if (removed) {
                                                    updatedQuestions.splice(overIndex, 0, removed);

                                                    // Update the form with the new order of questions
                                                    form.setValue(
                                                        `sections.${selectedSectionIndex}.questions`,
                                                        updatedQuestions,
                                                    );
                                                }
                                            }}
                                        >
                                            <div className="flex origin-top-left scale-[0.26] flex-col gap-8 overflow-x-hidden">
                                                {form
                                                    .getValues(
                                                        `sections.${selectedSectionIndex}.questions`,
                                                    )
                                                    .map((field, index) => {
                                                        return (
                                                            <SortableItem
                                                                key={field.id}
                                                                value={field.id}
                                                                asChild
                                                            >
                                                                <div
                                                                    key={index}
                                                                    onClick={() =>
                                                                        handlePageClick(index)
                                                                    }
                                                                    className={`rounded-xl border-4 bg-primary-50 p-6 ${
                                                                        currentQuestionIndex ===
                                                                        index
                                                                            ? "border-primary-500 bg-none"
                                                                            : "bg-none"
                                                                    }`}
                                                                    onMouseEnter={() =>
                                                                        handlePageClick(index)
                                                                    }
                                                                >
                                                                    <div className="flex flex-col">
                                                                        <div className="flex items-center justify-start gap-4">
                                                                            <h1 className="left-0 w-96 whitespace-nowrap text-4xl font-bold">
                                                                                {index + 1}
                                                                                &nbsp;
                                                                                {getValues(
                                                                                    `sections.${selectedSectionIndex}.questions.${index}.questionType`,
                                                                                ) === "MCQS"
                                                                                    ? "MCQ (Single Correct)"
                                                                                    : getValues(
                                                                                            `sections.${selectedSectionIndex}.questions.${index}.questionType`,
                                                                                        ) === "MCQM"
                                                                                      ? "MCQ (Multiple Correct)"
                                                                                      : "MCQ (Multiple Correct)"}
                                                                            </h1>
                                                                            <SortableDragHandle
                                                                                variant="outline"
                                                                                size="icon"
                                                                                className="size-16"
                                                                            >
                                                                                <DotsSixVertical className="!size-12" />
                                                                            </SortableDragHandle>
                                                                        </div>
                                                                        <PPTComponentFactory
                                                                            type={
                                                                                getValues(
                                                                                    `sections.${selectedSectionIndex}.questions.${index}.questionType`,
                                                                                ) as "MCQS" | "MCQM"
                                                                            }
                                                                            props={{
                                                                                form: form,
                                                                                currentQuestionIndex:
                                                                                    index,
                                                                                currentQuestionImageIndex:
                                                                                    currentQuestionImageIndex,
                                                                                setCurrentQuestionImageIndex:
                                                                                    setCurrentQuestionImageIndex,
                                                                                className:
                                                                                    "relative mt-4 rounded-xl border-4 border-primary-300 bg-white p-4",
                                                                                selectedSectionIndex:
                                                                                    selectedSectionIndex,
                                                                            }}
                                                                        />
                                                                    </div>
                                                                </div>
                                                            </SortableItem>
                                                        );
                                                    })}
                                            </div>
                                        </Sortable>
                                    </div>
                                </div>
                                <Separator orientation="vertical" className="min-h-screen" />
                                <MainViewComponentFactory
                                    type={
                                        getValues(
                                            `sections.${selectedSectionIndex}.questions.${currentQuestionIndex}.questionType`,
                                        ) as "MCQS" | "MCQM"
                                    }
                                    props={{
                                        form: form,
                                        currentQuestionIndex: currentQuestionIndex,
                                        currentQuestionImageIndex: currentQuestionImageIndex,
                                        setCurrentQuestionImageIndex: setCurrentQuestionImageIndex,
                                        className: "ml-6 flex w-full flex-col gap-6 pr-6 pt-4",
                                        selectedSectionIndex: selectedSectionIndex,
                                    }}
                                />
                            </div>
                        </TabsContent>
                    </form>
                </FormProvider>
            </Tabs>
        </div>
    );
};

export default AssessmentPreview;
