import { getSubjectNameById } from "@/routes/assessment/question-papers/-utils/helper";
import { InstituteDetailsType } from "@/schemas/student/student-list/institute-schema";
import { Steps } from "@/types/assessment-data-type";
import { BatchData } from "@/types/batch-details";
import { MyQuestionPaperFormInterface } from "@/types/question-paper-form";
import { useBasicInfoStore } from "./zustand-global-states/step1-basic-info";
import { AdaptiveMarkingQuestion } from "@/types/basic-details-type";

// Output data structure
interface BatchDetails {
    [key: string]: string[]; // Key is the batch name (e.g., "10th_batch") and value is an array of formatted package names
}

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

export const getQuestionTypeCounts = (questionPaper: MyQuestionPaperFormInterface) => {
    const { questions } = questionPaper;
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
    const batchDetails: BatchDetails = {};
    data.forEach((item) => {
        // Extract level name and package details
        const levelName = item.level.level_name;
        const packageName = item.package_dto.package_name;

        // Create the batch key
        const batchKey = `${levelName} Batch`;

        // Initialize the batch key if not present
        if (!batchDetails[batchKey]) {
            batchDetails[batchKey] = [];
        }

        // Add the package name to the batch key
        batchDetails[batchKey]!.push(`${levelName} ${packageName}`);
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
                    hrs:
                        typeof responseData[currentStep]?.saved_data?.duration === "number"
                            ? Math.floor(responseData[currentStep]?.saved_data?.duration / 60)
                            : 0,
                    min:
                        typeof responseData[currentStep]?.saved_data?.duration === "number"
                            ? responseData[currentStep]?.saved_data?.duration % 60
                            : 0,
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
