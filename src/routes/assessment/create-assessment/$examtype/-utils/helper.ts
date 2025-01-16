import { getSubjectNameById } from "@/routes/assessment/question-papers/-utils/helper";
import { InstituteDetailsType } from "@/schemas/student/student-list/institute-schema";
import { Steps } from "@/types/assessment-data-type";
import { BatchData } from "@/types/batch-details";
import { useBasicInfoStore } from "./zustand-global-states/step1-basic-info";
import { AdaptiveMarkingQuestion } from "@/types/basic-details-type";
import { useSectionDetailsStore } from "./zustand-global-states/step2-add-questions";
import { UseFormReturn } from "react-hook-form";
import { useTestAccessStore } from "./zustand-global-states/step3-adding-participants";
import { useAccessControlStore } from "./zustand-global-states/step4-access-control";
import {
    AccessControlFormValues,
    QuestionData,
    QuestionDataObject,
    Section,
    SectionFormType,
    TestAccessFormType,
} from "@/types/assessment-steps";

export function getStepKey({
    assessmentDetails,
    currentStep,
    key,
}: {
    assessmentDetails: Steps;
    currentStep: number;
    key: string;
}) {
    // Get the step_keys for the current step
    const stepKeys = assessmentDetails[currentStep]?.step_keys;

    if (!stepKeys) {
        return undefined; // Return undefined if step_keys does not exist
    }

    // Find the value for the key in step_keys
    for (const keyValuePair of stepKeys) {
        if (keyValuePair[key]) {
            return keyValuePair[key]; // Return "REQUIRED" or "OPTIONAL"
        }
    }

    return undefined; // Return undefined if the key is not found
}

export const getFieldOptions = ({
    assessmentDetails,
    currentStep,
    key,
    value,
}: {
    assessmentDetails: Steps;
    currentStep: number;
    key: string;
    value: string;
}): boolean => {
    // Safely access the nested array using optional chaining
    return (
        assessmentDetails[currentStep]?.field_options?.[key]?.some(
            (item) => item.value === value,
        ) || false
    );
};

export const parseHTMLIntoString = (htmlString: string) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlString, "text/html");
    return doc;
};

export const getQuestionTypeCounts = (questions: AdaptiveMarkingQuestion[]) => {
    if (questions?.length === 0) return { MCQM: 0, MCQS: 0, totalQuestions: 0 };

    let mcqmCount = 0;
    let mcqsCount = 0;

    questions?.forEach((question) => {
        if (question.questionType === "MCQM") {
            mcqmCount++;
        } else if (question.questionType === "MCQS") {
            mcqsCount++;
        }
    });

    const totalQuestions = questions?.length;

    return {
        MCQM: mcqmCount,
        MCQS: mcqsCount,
        totalQuestions,
    };
};

export const handleDownloadQRCode = () => {
    const svg = document.getElementById("qr-code-svg");
    if (!svg) {
        alert("QR code not found!");
        return;
    }

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx?.drawImage(img, 0, 0);
        const pngFile = canvas.toDataURL("image/png");

        // Create a temporary link element to download the image
        const downloadLink = document.createElement("a");
        downloadLink.href = pngFile;
        downloadLink.download = "qr-code.png";
        downloadLink.click();
    };

    img.src = "data:image/svg+xml;base64," + btoa(svgData);
};

export const copyToClipboard = async (text: string) => {
    try {
        await navigator.clipboard.writeText(text);
    } catch (err) {
        console.log("Failed to copy text. Please try again.");
    }
};

export function transformBatchData(data: BatchData[]) {
    const batchDetails: Record<string, { name: string; id: string }[]> = {};

    data.forEach((item) => {
        // Extract level name, package name, and ID
        const levelName = item.level.level_name;
        const packageName = item.package_dto.package_name;
        const packageId = item.id;

        // Create the batch key
        const batchKey = `${levelName} Year/Class`;

        // Initialize the batch key if not present
        if (!batchDetails[batchKey]) {
            batchDetails[batchKey] = [];
        }

        // Add the package details (name and id) to the batch key
        batchDetails[batchKey]!.push({
            name: `${levelName} ${packageName}`,
            id: packageId || "",
        });
    });

    return batchDetails;
}

export const convertToUTCPlus530 = (dateString: string) => {
    // Parse the input ISO 8601 date string into a Date object
    const date = new Date(dateString);

    // Get the UTC time in milliseconds and add the UTC+5:30 offset
    const offsetMillis = 5 * 60 * 60 * 1000 + 30 * 60 * 1000; // 5 hours and 30 minutes in milliseconds
    const utcPlus530Date = new Date(date.getTime() + offsetMillis);

    // Format the date into the desired string format
    const year = utcPlus530Date.getFullYear();
    const month = String(utcPlus530Date.getMonth() + 1).padStart(2, "0");
    const day = String(utcPlus530Date.getDate()).padStart(2, "0");
    const hours = String(utcPlus530Date.getHours()).padStart(2, "0");
    const minutes = String(utcPlus530Date.getMinutes()).padStart(2, "0");
    const seconds = String(utcPlus530Date.getSeconds()).padStart(2, "0");
    const milliseconds = String(utcPlus530Date.getMilliseconds()).padStart(3, "0");

    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}.${milliseconds}+05:30`;
};

export const formatDateTimeLocal = (dateString: string | undefined) => {
    if (!dateString) return ""; // Handle empty or undefined values
    const date = new Date(dateString);
    return date.toISOString().slice(0, 16); // Extract `YYYY-MM-DDTHH:mm`
};

export const getTimeLimitString = (time: number, timeLimit: string[]) => {
    const timeStr = timeLimit.find((limit) => limit.startsWith(time.toString()));
    return timeStr || ""; // Returns the matching string or an empty string if no match is found
};

export function calculateTotalMarks(questions: AdaptiveMarkingQuestion[]) {
    let totalMarks = 0;

    questions.forEach((question) => {
        const questionMark = parseFloat(question.questionMark);

        if (!isNaN(questionMark)) {
            totalMarks += questionMark;
        }
    });

    return String(totalMarks);
}

export const syncStep1DataWithStore = (
    responseData: Steps,
    currentStep: number,
    instituteDetails: InstituteDetailsType,
) => {
    const setBasicInfo = useBasicInfoStore.getState().setBasicInfo;

    const basicInfoData = {
        assessmentPreview: {
            checked: !!responseData[currentStep]?.saved_data?.assessment_preview,
            previewTimeLimit:
                typeof responseData[currentStep]?.saved_data?.assessment_preview === "number"
                    ? responseData[currentStep]?.saved_data?.assessment_preview
                    : undefined, // Ensure it's either a number or undefined
        },
        durationDistribution: responseData[currentStep]?.saved_data?.duration_distribution as
            | string
            | undefined,
        evaluationType: responseData[currentStep]?.saved_data?.evaluation_type as
            | string
            | undefined,
        raiseReattemptRequest: responseData[currentStep]?.saved_data?.reattempt_consent as
            | boolean
            | undefined,
        raiseTimeIncreaseRequest: responseData[currentStep]?.saved_data?.add_time_consent as
            | boolean
            | undefined,
        status: responseData[currentStep]?.status as "INCOMPLETE" | "COMPLETE" | undefined,
        submissionType: responseData[currentStep]?.saved_data?.submission_type as
            | string
            | undefined,
        switchSections: responseData[currentStep]?.saved_data?.can_switch_section as
            | boolean
            | undefined,
        testCreation: {
            assessmentInstructions: responseData[currentStep]?.saved_data?.instructions?.content as
                | string
                | undefined,
            assessmentName: responseData[currentStep]?.saved_data?.name as string | undefined,
            liveDateRange: {
                startDate: responseData[currentStep]?.saved_data?.boundation_start_date as
                    | string
                    | undefined,
                endDate: responseData[currentStep]?.saved_data?.boundation_end_date as
                    | string
                    | undefined,
            },
            subject: getSubjectNameById(
                instituteDetails?.subjects || [],
                responseData[currentStep]?.saved_data?.subject_selection as string | null,
            ),
        },
        testDuration: {
            entireTestDuration: {
                checked:
                    responseData[currentStep]?.saved_data?.duration_distribution === "ASSESSMENT",
                testDuration: {
                    hrs: Math.floor((responseData[currentStep]?.saved_data?.duration ?? 0) / 60),
                    min: (responseData[currentStep]?.saved_data?.duration ?? 0) % 60,
                },
            },
            questionWiseDuration:
                responseData[currentStep]?.saved_data?.duration_distribution === "QUESTION",
            sectionWiseDuration:
                responseData[currentStep]?.saved_data?.duration_distribution === "SECTION",
        },
    };

    // Update Zustand Store
    setBasicInfo(basicInfoData);
};

export const syncStep2DataWithStore = (
    responseData: Steps,
    currentStep: number,
    form: UseFormReturn<SectionFormType>,
    questionsData: QuestionDataObject,
) => {
    const { getValues } = form;
    const allSections = getValues("section");
    const setSectionDetails = useSectionDetailsStore.getState().setSectionDetails;

    const currentStepData = responseData[currentStep]?.saved_data || { sections: [] };

    const sectionDetailsData = {
        status: responseData[currentStep]?.status || "",
        section: currentStepData?.sections?.map((section: Section, idx: number) => {
            // Get questions for the current section
            const questionsForSection = questionsData[section.id] || [];

            // Map questions to adaptive_marking_for_each_question format
            const adaptiveMarking = questionsForSection.map((questionData: QuestionData) => {
                const markingJson = questionData.marking_json
                    ? JSON.parse(questionData.marking_json)
                    : {};
                return {
                    questionId: questionData.question_id || "",
                    questionName: questionData.question?.content || "",
                    questionType: questionData.question_type || "",
                    questionMark: markingJson.data?.totalMark || "0",
                    questionPenalty: markingJson.data?.negativeMark || "0",
                    questionDuration: {
                        hrs:
                            typeof questionData.question_duration === "number"
                                ? String(Math.floor(questionData.question_duration / 60))
                                : "0",
                        min:
                            typeof questionData.question_duration === "number"
                                ? String(questionData.question_duration % 60)
                                : "0",
                    },
                };
            });

            return {
                sectionId: section.id || null,
                sectionName: section.name || "",
                questionPaperTitle: allSections[idx]?.questionPaperTitle || "",
                uploaded_question_paper: allSections[idx]?.uploaded_question_paper,
                subject: allSections[idx]?.subject || "",
                yearClass: allSections[idx]?.yearClass || "",
                section_description: section.description || "",
                question_duration: {
                    hrs:
                        typeof section.duration === "number"
                            ? String(Math.floor(section.duration / 60))
                            : "0",
                    min: typeof section.duration === "number" ? String(section.duration % 60) : "0",
                },
                section_duration: {
                    hrs:
                        typeof section.duration === "number"
                            ? String(Math.floor(section.duration / 60))
                            : "0",
                    min: typeof section.duration === "number" ? String(section.duration % 60) : "0",
                },
                marks_per_question: allSections[idx]?.marks_per_question,
                total_marks: String(section.total_marks) || "0",
                negative_marking: {
                    checked: allSections[idx]?.negative_marking?.checked || false,
                    value: allSections[idx]?.negative_marking?.value || "",
                },
                partialMarking: allSections[idx]?.partial_marking,
                cutoff_marks: {
                    checked: !!section.cutoff_marks,
                    value: String(section.cutoff_marks) || "0",
                },
                problem_randomization: !!section.problem_randomization,
                adaptive_marking_for_each_question: adaptiveMarking, // Assign the adaptive marking data here
            };
        }),
    };

    // Update Zustand Store
    setSectionDetails(sectionDetailsData);
};

export const syncStep3DataWithStore = (form: UseFormReturn<TestAccessFormType>) => {
    const setTestAccessInfo = useTestAccessStore.getState().setTestAccessInfo;
    const { getValues } = form;
    const testDetailsData = {
        closed_test: getValues("closed_test"),
        open_test: getValues("open_test"),
        select_batch: getValues("select_batch"),
        select_individually: getValues("select_individually"),
        join_link: getValues("join_link"),
        show_leaderboard: getValues("show_leaderboard"),
        notify_student: {
            when_assessment_created: getValues("notify_student.when_assessment_created"),
            before_assessment_goes_live: {
                checked: getValues("notify_student.before_assessment_goes_live.checked"),
                value: getValues("notify_student.before_assessment_goes_live.value"),
            },
            when_assessment_live: getValues("notify_student.when_assessment_live"),
            when_assessment_report_generated: getValues(
                "notify_student.when_assessment_report_generated",
            ),
        },
        notify_parent: {
            when_assessment_created: getValues("notify_parent.when_assessment_created"),
            before_assessment_goes_live: {
                checked: getValues("notify_parent.before_assessment_goes_live.checked"),
                value: getValues("notify_parent.before_assessment_goes_live.value"),
            },
            when_assessment_live: getValues("notify_parent.when_assessment_live"),
            when_student_appears: getValues("notify_parent.when_student_appears"),
            when_student_finishes_test: getValues("notify_parent.when_student_finishes_test"),
            when_assessment_report_generated: getValues(
                "notify_parent.when_assessment_report_generated",
            ),
        },
    };
    setTestAccessInfo(testDetailsData);
};

export const syncStep4DataWithStore = (form: UseFormReturn<AccessControlFormValues>) => {
    const setAccessControlData = useAccessControlStore.getState().setAccessControlData;
    const { getValues } = form;
    const testAccessData = {
        assessment_creation_access: getValues("assessment_creation_access"),
        live_assessment_notification: getValues("live_assessment_notification"),
        assessment_submission_and_report_access: getValues(
            "assessment_submission_and_report_access",
        ),
        evaluation_process: getValues("evaluation_process"),
    };
    setAccessControlData(testAccessData);
};
