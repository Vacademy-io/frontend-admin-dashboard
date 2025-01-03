import React, { useEffect } from "react";
import { z } from "zod";
import sectionDetailsSchema from "../../-utils/question-paper-form-schema";
import { FormProvider, useFieldArray } from "react-hook-form";
import { MyButton } from "@/components/design-system/button";
import { Separator } from "@/components/ui/separator";
import { PencilSimpleLine, Plus, TrashSimple, X } from "phosphor-react";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { MainViewQuillEditor } from "@/components/quill/MainViewQuillEditor";
import { FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { StepContentProps } from "@/types/step-content-props";
import { MyInput } from "@/components/design-system/input";
import { Switch } from "@/components/ui/switch";
import { QuestionPaperUpload } from "@/routes/assessment/question-papers/-components/QuestionPaperUpload";
import {
    AlertDialog,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import useDialogStore from "@/routes/assessment/question-papers/-global-states/question-paper-dialogue-close";
import { QuestionPapersTabs } from "@/routes/assessment/question-papers/-components/QuestionPapersTabs";
import { Dialog, DialogClose, DialogContent, DialogTrigger } from "@/components/ui/dialog";
// import {
//     Table,
//     TableBody,
//     TableCell,
//     TableHead,
//     TableHeader,
//     TableRow,
// } from "@/components/ui/table";
// import ViewQuestionPaper from "@/routes/assessment/question-papers/-components/ViewQuestionPaper";
// import {
//     getIdByLevelName,
//     getIdBySubjectName,
// } from "@/routes/assessment/question-papers/-utils/helper";
import { useInstituteDetailsStore } from "@/stores/student-list/useInstituteDetailsStore";
import { getStepKey } from "../../-utils/helper";
import { getAssessmentDetails } from "../../-services/assessment-services";
import { useSuspenseQuery } from "@tanstack/react-query";
import { DashboardLoader } from "@/components/core/dashboard-loader";
// import { Input } from "@/components/ui/input";
import { useSectionForm } from "../../-utils/useSectionForm";
// import { useUploadedQuestionPapersStore } from "../../-utils/global-states";

const Step2AddingQuestions: React.FC<StepContentProps> = ({
    currentStep,
    handleCompleteCurrentStep,
    completedSteps,
}) => {
    const {
        isManualQuestionPaperDialogOpen,
        isUploadFromDeviceDialogOpen,
        setIsManualQuestionPaperDialogOpen,
        setIsUploadFromDeviceDialogOpen,
        isSavedQuestionPaperDialogOpen,
        setIsSavedQuestionPaperDialogOpen,
    } = useDialogStore();
    const { instituteDetails } = useInstituteDetailsStore();
    const { data: assessmentDetails, isLoading } = useSuspenseQuery(
        getAssessmentDetails({
            assessmentId: "1",
            instituteId: instituteDetails?.id,
            type: "EXAM",
        }),
    );
    // const { sectionUploadedQuestionPapers, setSectionUploadedQuestionPapers } =
    //     useUploadedQuestionPapersStore();

    const form = useSectionForm();

    const { handleSubmit, getValues, control, watch } = form;
    watch(`section`);

    const allSections = getValues("section"); // Watches the `section` array for changes

    const onSubmit = (data: z.infer<typeof sectionDetailsSchema>) => {
        console.log(data);
        handleCompleteCurrentStep();
    };

    const onInvalid = (err: unknown) => {
        console.log(err);
    };

    const { append, remove } = useFieldArray({
        control,
        name: "section", // Matches the key in defaultValues
    });

    const handleAddSection = () => {
        append({
            uploaded_question_paper: null,
            section_description: "",
            section_duration: {
                hrs: "",
                min: "",
            },
            marks_per_question: "",
            total_marks: "",
            negative_marking: {
                checked: false,
                value: "",
            },
            partial_marking: false,
            cutoff_marks: {
                checked: false,
                value: "",
            },
            problem_randomization: false,
            adaptive_marking_for_each_question: [],
        });
    };

    const handleDeleteSection = (e: React.MouseEvent, index: number) => {
        remove(index); // Removes the section at the given index
        e.stopPropagation();
    };

    // const handleRemoveQuestionPaper = (index: number) => {
    //     setSectionUploadedQuestionPapers((prev) => {
    //         const updatedData = prev?.filter((_, i) => i !== index);
    //         return updatedData;
    //     });
    // };

    useEffect(() => {
        form.reset({
            status: completedSteps[currentStep] ? "COMPLETE" : "INCOMPLETE",
            section: [
                {
                    uploaded_question_paper: null,
                    section_description: "",
                    section_duration: {
                        hrs: "",
                        min: "",
                    },
                    marks_per_question: "",
                    total_marks: "",
                    negative_marking: {
                        checked: false,
                        value: "",
                    },
                    partial_marking: false,
                    cutoff_marks: {
                        checked: false,
                        value: "",
                    },
                    problem_randomization: false,
                    adaptive_marking_for_each_question: [],
                },
            ],
        });
    }, []);

    if (isLoading) return <DashboardLoader />;

    return (
        <FormProvider {...form}>
            <form onSubmit={handleSubmit(onSubmit, onInvalid)}>
                {allSections.length > 0 && (
                    <>
                        <div className="m-0 flex items-center justify-between p-0">
                            <h1>Add Questions</h1>
                            <MyButton
                                type="submit"
                                scale="large"
                                buttonType="primary"
                                disabled={allSections.some(
                                    (section) =>
                                        !section.uploaded_question_paper ||
                                        !section.section_duration?.hrs ||
                                        !section.section_duration?.min ||
                                        !section.marks_per_question,
                                )}
                            >
                                Next
                            </MyButton>
                        </div>
                        <Separator className="my-4" />
                        <Accordion type="single" collapsible>
                            {allSections.map((_, index) => (
                                <AccordionItem value={`section-${index}`} key={index}>
                                    <AccordionTrigger className="flex items-center justify-between">
                                        {/* {sectionUploadedQuestionPapers?.[index] ? (
                                            <span className="flex-grow text-left text-primary-500">
                                                {sectionUploadedQuestionPapers[index]?.subject}
                                                <span className="ml-4 font-thin !text-neutral-600">
                                                    (MCQ(Single Correct):&nbsp;
                                                    {
                                                        getQuestionTypeCounts(
                                                            sectionUploadedQuestionPapers[index],
                                                        ).MCQS
                                                    }
                                                    ,&nbsp; MCQ(Multiple Correct):&nbsp;
                                                    {
                                                        getQuestionTypeCounts(
                                                            sectionUploadedQuestionPapers[index],
                                                        ).MCQM
                                                    }
                                                    ,&nbsp; Total:&nbsp;
                                                    {
                                                        getQuestionTypeCounts(
                                                            sectionUploadedQuestionPapers[index],
                                                        ).totalQuestions
                                                    }
                                                    )
                                                </span>
                                            </span>
                                        ) : (
                                            <span className="flex-grow text-left text-primary-500">
                                                Section {index + 1}
                                            </span>
                                        )} */}
                                        <div className="flex items-center gap-4">
                                            <PencilSimpleLine
                                                size={20}
                                                className="text-neutral-600"
                                            />
                                            <TrashSimple
                                                size={20}
                                                className="text-danger-400"
                                                onClick={(e) => handleDeleteSection(e, index)}
                                            />
                                        </div>
                                    </AccordionTrigger>
                                    <AccordionContent className="flex flex-col gap-8">
                                        <div className="flex flex-wrap items-center justify-start gap-5">
                                            <h3>Upload Question Paper</h3>
                                            <AlertDialog
                                                open={isUploadFromDeviceDialogOpen}
                                                onOpenChange={setIsUploadFromDeviceDialogOpen}
                                            >
                                                <AlertDialogTrigger>
                                                    <MyButton
                                                        type="button"
                                                        scale="large"
                                                        buttonType="secondary"
                                                        className="font-thin"
                                                    >
                                                        Upload from Device
                                                    </MyButton>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent className="p-0">
                                                    <div className="flex items-center justify-between rounded-md bg-primary-50">
                                                        <h1 className="rounded-sm p-4 font-bold text-primary-500">
                                                            Upload Question Paper From Device
                                                        </h1>
                                                        <AlertDialogCancel
                                                            className="border-none bg-primary-50 shadow-none hover:bg-primary-50"
                                                            onClick={() =>
                                                                setIsUploadFromDeviceDialogOpen(
                                                                    false,
                                                                )
                                                            }
                                                        >
                                                            <X className="text-neutral-600" />
                                                        </AlertDialogCancel>
                                                    </div>
                                                    <QuestionPaperUpload
                                                        isManualCreated={false}
                                                        index={index}
                                                    />
                                                </AlertDialogContent>
                                            </AlertDialog>
                                            <AlertDialog
                                                open={isManualQuestionPaperDialogOpen}
                                                onOpenChange={setIsManualQuestionPaperDialogOpen}
                                            >
                                                <AlertDialogTrigger>
                                                    <MyButton
                                                        type="button"
                                                        scale="large"
                                                        buttonType="secondary"
                                                        className="font-thin"
                                                    >
                                                        Create Manually
                                                    </MyButton>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent className="p-0">
                                                    <div className="flex items-center justify-between rounded-md bg-primary-50">
                                                        <h1 className="rounded-sm p-4 font-bold text-primary-500">
                                                            Create Question Paper Manually
                                                        </h1>
                                                        <AlertDialogCancel
                                                            className="border-none bg-primary-50 shadow-none hover:bg-primary-50"
                                                            onClick={() =>
                                                                setIsManualQuestionPaperDialogOpen(
                                                                    false,
                                                                )
                                                            }
                                                        >
                                                            <X className="text-neutral-600" />
                                                        </AlertDialogCancel>
                                                    </div>
                                                    <QuestionPaperUpload
                                                        isManualCreated={true}
                                                        index={index}
                                                    />
                                                </AlertDialogContent>
                                            </AlertDialog>
                                            <Dialog
                                                open={isSavedQuestionPaperDialogOpen}
                                                onOpenChange={setIsSavedQuestionPaperDialogOpen}
                                            >
                                                <DialogTrigger>
                                                    <MyButton
                                                        type="button"
                                                        scale="large"
                                                        buttonType="secondary"
                                                        className="font-thin"
                                                    >
                                                        Choose Saved Paper
                                                    </MyButton>
                                                </DialogTrigger>
                                                <DialogContent className="no-scrollbar !m-0 flex h-full !w-full !max-w-full flex-col items-start !gap-0 overflow-y-auto !rounded-none !p-0 [&>button]:hidden">
                                                    <div className="flex h-14 w-full items-center justify-between rounded-md bg-primary-50">
                                                        <h1 className="rounded-sm p-4 font-bold text-primary-500">
                                                            Choose Saved Question Paper From List
                                                        </h1>
                                                        <DialogClose
                                                            className="mr-4 !border-none bg-primary-50 shadow-none hover:bg-primary-50"
                                                            onClick={() =>
                                                                setIsSavedQuestionPaperDialogOpen(
                                                                    false,
                                                                )
                                                            }
                                                        >
                                                            <X className="text-neutral-600" />
                                                        </DialogClose>
                                                    </div>
                                                    <div className="h-full w-screen overflow-y-auto p-8">
                                                        <QuestionPapersTabs
                                                            isAssessment={true}
                                                            index={index}
                                                        />
                                                    </div>
                                                </DialogContent>
                                            </Dialog>
                                        </div>
                                        {/* {sectionUploadedQuestionPapers &&
                                            sectionUploadedQuestionPapers?.[index] && (
                                                <div className="flex items-center justify-between rounded-md border border-primary-200 px-4 py-1">
                                                    <h1>
                                                        {sectionUploadedQuestionPapers[index].title}
                                                    </h1>
                                                    <div className="flex items-center">
                                                        <ViewQuestionPaper
                                                            questionPaperId={
                                                                sectionUploadedQuestionPapers[index]
                                                                    .questionPaperId
                                                            }
                                                            title={
                                                                sectionUploadedQuestionPapers[index]
                                                                    .title
                                                            }
                                                            subject={getIdBySubjectName(
                                                                instituteDetails?.subjects || [],
                                                                sectionUploadedQuestionPapers[index]
                                                                    .subject,
                                                            )}
                                                            level={getIdByLevelName(
                                                                instituteDetails?.levels || [],
                                                                sectionUploadedQuestionPapers[index]
                                                                    .yearClass,
                                                            )}
                                                            isAssessment={true}
                                                        />
                                                        <TrashSimple
                                                            size={20}
                                                            className="cursor-pointer text-danger-400"
                                                            onClick={() =>
                                                                handleRemoveQuestionPaper(index)
                                                            }
                                                        />
                                                    </div>
                                                </div>
                                            )} */}
                                        <div className="flex flex-col gap-2">
                                            <h1 className="font-thin">Section Description</h1>
                                            <FormField
                                                control={control}
                                                name={`section.${index}.section_description`}
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormControl>
                                                            <MainViewQuillEditor
                                                                onChange={field.onChange}
                                                                value={field.value}
                                                            />
                                                        </FormControl>
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                        <div className="flex w-96 items-center justify-between text-sm font-thin">
                                            <h1 className="font-normal">
                                                Section Duration{" "}
                                                {getStepKey({
                                                    assessmentDetails,
                                                    currentStep,
                                                    key: "section_duration",
                                                }) === "REQUIRED" && (
                                                    <span className="text-subtitle text-danger-600">
                                                        *
                                                    </span>
                                                )}
                                            </h1>
                                            <div className="flex items-center gap-4">
                                                <FormField
                                                    control={control}
                                                    name={`section.${index}.section_duration.hrs`}
                                                    render={({ field: { ...field } }) => (
                                                        <FormItem>
                                                            <FormControl>
                                                                <MyInput
                                                                    inputType="text"
                                                                    inputPlaceholder="00"
                                                                    input={field.value}
                                                                    onChangeFunction={(e) => {
                                                                        const inputValue =
                                                                            e.target.value.replace(
                                                                                /[^0-9]/g,
                                                                                "",
                                                                            ); // Remove non-numeric characters
                                                                        field.onChange(inputValue); // Call onChange with the sanitized value
                                                                    }}
                                                                    size="large"
                                                                    {...field}
                                                                    className="w-11"
                                                                />
                                                            </FormControl>
                                                        </FormItem>
                                                    )}
                                                />
                                                <span>hrs</span>
                                                <span>:</span>
                                                <FormField
                                                    control={control}
                                                    name={`section.${index}.section_duration.min`}
                                                    render={({ field: { ...field } }) => (
                                                        <FormItem>
                                                            <FormControl>
                                                                <MyInput
                                                                    inputType="text"
                                                                    inputPlaceholder="00"
                                                                    input={field.value}
                                                                    onChangeFunction={(e) => {
                                                                        const inputValue =
                                                                            e.target.value.replace(
                                                                                /[^0-9]/g,
                                                                                "",
                                                                            ); // Remove non-numeric characters
                                                                        field.onChange(inputValue); // Call onChange with the sanitized value
                                                                    }}
                                                                    size="large"
                                                                    {...field}
                                                                    className="w-11"
                                                                />
                                                            </FormControl>
                                                        </FormItem>
                                                    )}
                                                />
                                                <span>minutes</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4 text-sm font-thin">
                                            <div className="flex flex-col font-normal">
                                                <h1>
                                                    Marks Per Question
                                                    {getStepKey({
                                                        assessmentDetails,
                                                        currentStep,
                                                        key: "marks_per_question",
                                                    }) === "REQUIRED" && (
                                                        <span className="text-subtitle text-danger-600">
                                                            *
                                                        </span>
                                                    )}
                                                </h1>
                                                <h1>(Default)</h1>
                                            </div>
                                            <FormField
                                                control={control}
                                                name={`section.${index}.marks_per_question`}
                                                render={({ field: { ...field } }) => (
                                                    <FormItem>
                                                        <FormControl>
                                                            <MyInput
                                                                inputType="text"
                                                                inputPlaceholder="00"
                                                                input={field.value}
                                                                onChangeFunction={(e) => {
                                                                    const inputValue =
                                                                        e.target.value.replace(
                                                                            /[^0-9]/g,
                                                                            "",
                                                                        ); // Remove non-numeric characters
                                                                    field.onChange(inputValue); // Call onChange with the sanitized value
                                                                }}
                                                                size="large"
                                                                {...field}
                                                                className="ml-3 w-11"
                                                            />
                                                        </FormControl>
                                                    </FormItem>
                                                )}
                                            />
                                            <span>Total Marks</span>
                                            <span>:</span>
                                            <FormField
                                                control={control}
                                                name={`section.${index}.total_marks`}
                                                render={({ field: { ...field } }) => (
                                                    <FormItem>
                                                        <FormControl>
                                                            <MyInput
                                                                inputType="text"
                                                                inputPlaceholder="00"
                                                                input={field.value}
                                                                onChangeFunction={(e) => {
                                                                    const inputValue =
                                                                        e.target.value.replace(
                                                                            /[^0-9]/g,
                                                                            "",
                                                                        ); // Remove non-numeric characters
                                                                    field.onChange(inputValue); // Call onChange with the sanitized value
                                                                }}
                                                                size="large"
                                                                {...field}
                                                                className="w-11"
                                                            />
                                                        </FormControl>
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                        <div className="flex w-1/2 items-center justify-between">
                                            <div className="flex w-52 items-center justify-between gap-4">
                                                <h1>
                                                    Negative Marking
                                                    {getStepKey({
                                                        assessmentDetails,
                                                        currentStep,
                                                        key: "negative_marking",
                                                    }) === "REQUIRED" && (
                                                        <span className="text-subtitle text-danger-600">
                                                            *
                                                        </span>
                                                    )}
                                                </h1>
                                                <FormField
                                                    control={control}
                                                    name={`section.${index}.negative_marking.value`}
                                                    render={({ field: { ...field } }) => (
                                                        <FormItem>
                                                            <FormControl>
                                                                <MyInput
                                                                    disabled={
                                                                        form.getValues(
                                                                            `section.${index}.negative_marking.checked`,
                                                                        )
                                                                            ? false
                                                                            : true
                                                                    }
                                                                    inputType="text"
                                                                    inputPlaceholder="00"
                                                                    input={field.value}
                                                                    onChangeFunction={(e) => {
                                                                        const inputValue =
                                                                            e.target.value.replace(
                                                                                /[^0-9]/g,
                                                                                "",
                                                                            ); // Remove non-numeric characters
                                                                        field.onChange(inputValue); // Call onChange with the sanitized value
                                                                    }}
                                                                    size="large"
                                                                    {...field}
                                                                    className="mr-2 w-11"
                                                                />
                                                            </FormControl>
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>
                                            <FormField
                                                control={control}
                                                name={`section.${index}.negative_marking.checked`}
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormControl>
                                                            <Switch
                                                                checked={field.value}
                                                                onCheckedChange={field.onChange}
                                                            />
                                                        </FormControl>
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                        <FormField
                                            control={form.control}
                                            name={`section.${index}.partial_marking`}
                                            render={({ field }) => (
                                                <FormItem className="flex w-1/2 items-center justify-between">
                                                    <FormLabel>
                                                        Partial Marking
                                                        {getStepKey({
                                                            assessmentDetails,
                                                            currentStep,
                                                            key: "partial_marking",
                                                        }) === "REQUIRED" && (
                                                            <span className="text-subtitle text-danger-600">
                                                                *
                                                            </span>
                                                        )}
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Switch
                                                            checked={field.value}
                                                            onCheckedChange={field.onChange}
                                                        />
                                                    </FormControl>
                                                </FormItem>
                                            )}
                                        />
                                        <div className="flex w-1/2 items-center justify-between">
                                            <div className="flex w-52 items-center justify-between gap-4">
                                                <h1>Cut off Marks</h1>
                                                <FormField
                                                    control={control}
                                                    name={`section.${index}.cutoff_marks.value`}
                                                    render={({ field: { ...field } }) => (
                                                        <FormItem>
                                                            <FormControl>
                                                                <MyInput
                                                                    disabled={
                                                                        form.getValues(
                                                                            `section.${index}.cutoff_marks.checked`,
                                                                        )
                                                                            ? false
                                                                            : true
                                                                    }
                                                                    inputType="text"
                                                                    inputPlaceholder="00"
                                                                    input={field.value}
                                                                    onChangeFunction={(e) => {
                                                                        const inputValue =
                                                                            e.target.value.replace(
                                                                                /[^0-9]/g,
                                                                                "",
                                                                            );
                                                                        field.onChange(inputValue);
                                                                    }}
                                                                    size="large"
                                                                    {...field}
                                                                    className="mr-2 w-11"
                                                                />
                                                            </FormControl>
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>
                                            <FormField
                                                control={control}
                                                name={`section.${index}.cutoff_marks.checked`}
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormControl>
                                                            <Switch
                                                                checked={field.value}
                                                                onCheckedChange={field.onChange}
                                                            />
                                                        </FormControl>
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                        <FormField
                                            control={form.control}
                                            name={`section.${index}.problem_randomization`}
                                            render={({ field }) => (
                                                <FormItem className="flex w-1/2 items-center justify-between">
                                                    <FormLabel>
                                                        Problem Randamization
                                                        {getStepKey({
                                                            assessmentDetails,
                                                            currentStep,
                                                            key: "problem_randomization",
                                                        }) === "REQUIRED" && (
                                                            <span className="text-subtitle text-danger-600">
                                                                *
                                                            </span>
                                                        )}
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Switch
                                                            checked={field.value}
                                                            onCheckedChange={field.onChange}
                                                        />
                                                    </FormControl>
                                                </FormItem>
                                            )}
                                        />
                                        {/* {sectionUploadedQuestionPapers &&
                                            sectionUploadedQuestionPapers?.[index] &&
                                            sectionUploadedQuestionPapers?.[index].questions && (
                                                <div>
                                                    <h1 className="mb-4 text-primary-500">
                                                        Adaptive Marking Rules
                                                    </h1>
                                                    <Table>
                                                        <TableHeader className="bg-primary-200">
                                                            <TableRow>
                                                                <TableHead>Q.No.</TableHead>
                                                                <TableHead>Question</TableHead>
                                                                <TableHead>Question Type</TableHead>
                                                                <TableHead>Marks</TableHead>
                                                                <TableHead>Penalty</TableHead>
                                                            </TableRow>
                                                        </TableHeader>
                                                        <TableBody className="bg-neutral-50">
                                                            {allSections[index] &&
                                                                allSections[
                                                                    index
                                                                ].adaptive_marking_for_each_question?.map(
                                                                    (question, idx) => {
                                                                        return (
                                                                            <TableRow key={idx}>
                                                                                <TableCell>
                                                                                    {idx + 1}
                                                                                </TableCell>
                                                                                <TableCell>
                                                                                    {
                                                                                        question.questionName
                                                                                    }
                                                                                </TableCell>
                                                                                <TableCell>
                                                                                    {
                                                                                        question.questionType
                                                                                    }
                                                                                </TableCell>
                                                                                <TableCell>
                                                                                    <FormField
                                                                                        control={
                                                                                            control
                                                                                        }
                                                                                        name={`section.${index}.adaptive_marking_for_each_question.${idx}.questionMark`}
                                                                                        render={({
                                                                                            field: {
                                                                                                ...field
                                                                                            },
                                                                                        }) => (
                                                                                            <FormItem>
                                                                                                <FormControl>
                                                                                                    <MyInput
                                                                                                        inputType="text"
                                                                                                        inputPlaceholder="00"
                                                                                                        input={
                                                                                                            field.value
                                                                                                        }
                                                                                                        onChangeFunction={(
                                                                                                            e,
                                                                                                        ) => {
                                                                                                            const inputValue =
                                                                                                                e.target.value.replace(
                                                                                                                    /[^0-9]/g,
                                                                                                                    "",
                                                                                                                ); // Remove non-numeric characters
                                                                                                            field.onChange(
                                                                                                                inputValue,
                                                                                                            ); // Call onChange with the sanitized value
                                                                                                        }}
                                                                                                        size="small"
                                                                                                        {...field}
                                                                                                        className="w-9"
                                                                                                    />
                                                                                                </FormControl>
                                                                                            </FormItem>
                                                                                        )}
                                                                                    />
                                                                                </TableCell>
                                                                                <TableCell>
                                                                                    <FormField
                                                                                        control={
                                                                                            control
                                                                                        }
                                                                                        name={`section.${index}.adaptive_marking_for_each_question.${idx}.questionPenalty`}
                                                                                        render={({
                                                                                            field: {
                                                                                                ...field
                                                                                            },
                                                                                        }) => (
                                                                                            <FormItem>
                                                                                                <FormControl>
                                                                                                    <Input
                                                                                                        disabled={
                                                                                                            form.getValues(
                                                                                                                `section.${index}.negative_marking.checked`,
                                                                                                            )
                                                                                                                ? false
                                                                                                                : true
                                                                                                        }
                                                                                                        type="text"
                                                                                                        placeholder="00"
                                                                                                        className="w-9"
                                                                                                        value={getValues(
                                                                                                            `section.${index}.negative_marking.value`,
                                                                                                        )}
                                                                                                        onChange={
                                                                                                            field.onChange
                                                                                                        }
                                                                                                    />
                                                                                                </FormControl>
                                                                                            </FormItem>
                                                                                        )}
                                                                                    />
                                                                                </TableCell>
                                                                            </TableRow>
                                                                        );
                                                                    },
                                                                )}
                                                        </TableBody>
                                                    </Table>
                                                </div>
                                            )} */}
                                    </AccordionContent>
                                </AccordionItem>
                            ))}
                        </Accordion>
                    </>
                )}
                <MyButton
                    type="button"
                    scale="large"
                    buttonType="secondary"
                    className={`${allSections.length > 0 ? "mt-8" : ""} font-thin`}
                    onClick={handleAddSection}
                >
                    <Plus size={32} />
                    Add Section
                </MyButton>
            </form>
        </FormProvider>
    );
};

export default Step2AddingQuestions;
