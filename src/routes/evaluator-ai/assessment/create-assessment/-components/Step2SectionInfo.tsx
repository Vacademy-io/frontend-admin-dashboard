/* eslint-disable */
import { AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import React, { MutableRefObject, useEffect, useState } from "react";
import { useFieldArray, UseFormReturn } from "react-hook-form";
import { PencilSimpleLine, TrashSimple, X } from "phosphor-react";
import {
    AlertDialog,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import useDialogStore from "@/routes/assessment/question-papers/-global-states/question-paper-dialogue-close";
import { MyButton } from "@/components/design-system/button";
import { QuestionPaperUpload } from "@/routes/assessment/question-papers/-components/QuestionPaperUpload";
import { FormControl, FormField, FormItem } from "@/components/ui/form";
import { calculateTotalMarks } from "../-utils/helper";
import { MyInput } from "@/components/design-system/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { DashboardLoader } from "@/components/core/dashboard-loader";
import { Input } from "@/components/ui/input";
import { z } from "zod";
import sectionDetailsSchema from "../-utils/section-details-sechma";
import { useQuestionsForSection } from "../-hooks/getQuestionsDataForSection";

type SectionFormType = z.infer<typeof sectionDetailsSchema>;

export const Step2SectionInfo = ({
    form,
    index,
    currentStep,
    oldData,
}: {
    form: UseFormReturn<SectionFormType>;
    index: number;
    currentStep: number;
    oldData: MutableRefObject<SectionFormType>;
}) => {
    const [enableSectionName, setEnableSectionName] = useState(true);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

    console.log(currentStep, oldData);
    // get the assessmentId from the savedStore after successfull submisstion of step 1
    const adaptiveMarking = useQuestionsForSection(
        "c7d9a324-5b29-4b5e-b089-9611640ee727",
        form.getValues(`section.${index}.sectionId`),
    );

    const {
        isManualQuestionPaperDialogOpen,
        isUploadFromDeviceDialogOpen,
        setIsManualQuestionPaperDialogOpen,
        setIsUploadFromDeviceDialogOpen,
    } = useDialogStore();

    const { setValue, getValues, control, watch } = form;
    const allSections = getValues("section");

    const { remove } = useFieldArray({
        control,
        name: "section", // Matches the key in defaultValues
    });

    const handleDeleteSection = (e: React.MouseEvent, index: number) => {
        e.stopPropagation();
        remove(index);
    };

    useEffect(() => {
        const marksPerQuestion = getValues(`section.${index}`).marks_per_question;

        // Loop through adaptive_marking_for_each_question and assign questionMark
        const updatedQuestions = getValues(
            `section.${index}`,
        ).adaptive_marking_for_each_question.map((question) => ({
            ...question,
            questionMark: marksPerQuestion, // Assign marks_per_question to questionMark
        }));

        // Update the section's adaptive_marking_for_each_question
        setValue(`section.${index}.adaptive_marking_for_each_question`, updatedQuestions);
        setValue(
            `section.${index}.total_marks`,
            calculateTotalMarks(getValues(`section.${index}.adaptive_marking_for_each_question`)),
        );
    }, [watch(`section.${index}.marks_per_question`)]);

    useEffect(() => {
        setValue(
            `section.${index}.adaptive_marking_for_each_question`,
            adaptiveMarking.adaptiveMarking,
        );
    }, [watch(`section.${index}`)]);

    if (adaptiveMarking.isLoading) return <DashboardLoader />;

    return (
        <AccordionItem value={`section-${index}`} key={index}>
            <AccordionTrigger className="flex items-center justify-between" id="section-details">
                <div className="flex w-full items-center justify-between">
                    <div className="flex items-center justify-start text-primary-500">
                        <FormField
                            control={control}
                            name={`section.${index}.sectionName`}
                            render={({ field: { ...field } }) => (
                                <FormItem>
                                    <FormControl>
                                        <MyInput
                                            inputType="text"
                                            inputPlaceholder="00"
                                            input={field.value}
                                            onChangeFunction={field.onChange}
                                            size="large"
                                            {...field}
                                            className="!ml-0 w-20 border-none !pl-0 text-primary-500"
                                            disabled={enableSectionName}
                                        />
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                    </div>

                    <div className="flex items-center gap-4">
                        <PencilSimpleLine
                            size={20}
                            className="text-neutral-600"
                            onClick={() => setEnableSectionName(!enableSectionName)}
                        />
                        <TrashSimple
                            size={20}
                            className="text-danger-400"
                            onClick={(e) => handleDeleteSection(e, index)}
                        />
                    </div>
                </div>
            </AccordionTrigger>
            <AccordionContent className="flex flex-col gap-8">
                <div
                    className="flex flex-wrap items-center justify-start gap-5"
                    id="upload-question-paper"
                >
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
                                    onClick={() => setIsUploadFromDeviceDialogOpen(false)}
                                >
                                    <X className="text-neutral-600" />
                                </AlertDialogCancel>
                            </div>
                            <QuestionPaperUpload
                                isManualCreated={false}
                                index={index}
                                sectionsForm={form}
                                currentQuestionIndex={currentQuestionIndex}
                                setCurrentQuestionIndex={setCurrentQuestionIndex}
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
                                    onClick={() => setIsManualQuestionPaperDialogOpen(false)}
                                >
                                    <X className="text-neutral-600" />
                                </AlertDialogCancel>
                            </div>
                            <QuestionPaperUpload
                                isManualCreated={true}
                                index={index}
                                sectionsForm={form}
                                currentQuestionIndex={currentQuestionIndex}
                                setCurrentQuestionIndex={setCurrentQuestionIndex}
                            />
                        </AlertDialogContent>
                    </AlertDialog>
                </div>

                {Boolean(allSections?.[index]?.adaptive_marking_for_each_question?.length) && (
                    <div>
                        <h1 className="mb-4 text-primary-500">Adaptive Marking Rules</h1>
                        <Table>
                            <TableHeader className="bg-primary-200">
                                <TableRow>
                                    <TableHead>Q.No.</TableHead>
                                    <TableHead>Question</TableHead>
                                    <TableHead>Marks</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody className="bg-neutral-50">
                                {allSections[index] &&
                                    allSections[index]?.adaptive_marking_for_each_question?.map(
                                        (question, idx) => {
                                            return (
                                                <TableRow key={idx}>
                                                    <TableCell>{idx + 1}</TableCell>
                                                    <TableCell
                                                        dangerouslySetInnerHTML={{
                                                            __html: question.questionName || "",
                                                        }}
                                                    />
                                                    <TableCell>
                                                        <FormField
                                                            control={control}
                                                            name={`section.${index}.adaptive_marking_for_each_question.${idx}.questionMark`}
                                                            render={({ field: { ...field } }) => (
                                                                <FormItem>
                                                                    <FormControl>
                                                                        <Input
                                                                            type="text"
                                                                            placeholder="00"
                                                                            className="w-11"
                                                                            value={field.value}
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
                )}
                {(watch(`section.${index}.marks_per_question`) ||
                    watch(`section.${index}.total_marks`)) && (
                    <div className="flex items-center justify-end gap-1">
                        <span>Total Marks</span>
                        <span>:</span>
                        <h1>
                            {calculateTotalMarks(
                                getValues(`section.${index}.adaptive_marking_for_each_question`),
                            )}
                        </h1>
                    </div>
                )}
            </AccordionContent>
        </AccordionItem>
    );
};

export default Step2SectionInfo;
