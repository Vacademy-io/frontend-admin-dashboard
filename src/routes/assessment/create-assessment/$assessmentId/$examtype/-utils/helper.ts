import { Steps } from "@/types/assessments/assessment-data-type";
import { BatchData } from "@/types/assessments/batch-details";
import { useBasicInfoStore } from "./zustand-global-states/step1-basic-info";
import { AdaptiveMarkingQuestion } from "@/types/assessments/basic-details-type";
import { useSectionDetailsStore } from "./zustand-global-states/step2-add-questions";
import { UseFormReturn } from "react-hook-form";
import { useTestAccessStore } from "./zustand-global-states/step3-adding-participants";
import { useAccessControlStore } from "./zustand-global-states/step4-access-control";
import {
    AccessControlFormValues,
    BasicSectionFormType,
    SectionFormType,
    TestAccessFormType,
} from "@/types/assessments/assessment-steps";
import { z } from "zod";
import sectionDetailsSchema from "./section-details-schema";

interface Role {
    roleId: string;
    roleName: string;
    isSelected: boolean;
}

export const getUsersStep4 = (users: string[]) => {
    return (
        users?.map((user, index) => ({
            userId: index.toString(),
            email: user,
        })) || []
    );
};

export const getSelectedRoles = (roles: Role[], selectedRoles: string[]) => {
    const rolesData =
        roles?.map((role) => ({
            roleId: role.roleId,
            roleName: role.roleName,
            isSelected: selectedRoles.includes(role.roleName),
        })) || [];
    return rolesData;
};

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

export const handleDownloadQRCode = (elementName: string) => {
    const svg = document.getElementById(elementName);
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

export const syncStep1DataWithStore = (form: UseFormReturn<BasicSectionFormType>) => {
    const setBasicInfo = useBasicInfoStore.getState().setBasicInfo;
    const { getValues } = form;
    const basicInfoData = {
        status: getValues("status"),
        testCreation: getValues("testCreation"),
        testDuration: getValues("testDuration"),
        assessmentPreview: getValues("assessmentPreview"),
        submissionType: getValues("submissionType"),
        durationDistribution: getValues("durationDistribution"),
        evaluationType: getValues("evaluationType"),
        switchSections: getValues("switchSections"),
        raiseReattemptRequest: getValues("raiseReattemptRequest"),
        raiseTimeIncreaseRequest: getValues("raiseTimeIncreaseRequest"),
    };
    setBasicInfo(basicInfoData);
};

export const syncStep2DataWithStore = (form: UseFormReturn<SectionFormType>) => {
    const setSectionDetails = useSectionDetailsStore.getState().setSectionDetails;
    const { getValues } = form;

    const sectionDetailsData = {
        status: getValues("status"),
        section: getValues("section"),
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

export const convertStep2OldData = (data: SectionFormType["section"]) => {
    return data.map((section, index) => ({
        section_description_html: section.section_description || "",
        section_name: section.sectionName,
        section_id: section.sectionId || "",
        section_duration:
            parseInt(section.section_duration.hrs) * 60 + parseInt(section.section_duration.min),
        section_order: index + 1,
        total_marks: parseInt(section.total_marks) || 0,
        cutoff_marks: section.cutoff_marks.checked ? parseInt(section.cutoff_marks.value) || 0 : 0,
        problem_randomization: section.problem_randomization,
        question_and_marking: section.adaptive_marking_for_each_question.map(
            (question, qIndex) => ({
                question_id: question.questionId,
                marking_json: JSON.stringify({
                    type: question.questionType,
                    data: {
                        totalMark: question.questionMark || "",
                        negativeMark: question.questionPenalty || "",
                        negativeMarkingPercentage:
                            question.questionMark && question.questionPenalty
                                ? (Number(question.questionPenalty) /
                                      Number(question.questionMark)) *
                                  100
                                : "",
                        ...(question.questionType === "MCQM" && {
                            partialMarking: question.correctOptionIdsCnt
                                ? 1 / question.correctOptionIdsCnt
                                : 0,
                            partialMarkingPercentage: question.correctOptionIdsCnt
                                ? (1 / question.correctOptionIdsCnt) * 100
                                : 0,
                        }),
                    },
                }),
                question_duration_in_min:
                    parseInt(section.question_duration.hrs) * 60 +
                        parseInt(section.question_duration.min) || 0,
                question_order: qIndex + 1,
                is_added: true,
                is_deleted: false,
            }),
        ),
    }));
};

export const convertStep2Data = (data: z.infer<typeof sectionDetailsSchema>) => {
    return data.section.map((section, index) => ({
        section_description_html: section.section_description || "",
        section_name: section.sectionName,
        section_id: section.sectionId || "",
        section_duration:
            parseInt(section.section_duration.hrs) * 60 + parseInt(section.section_duration.min),
        section_order: index + 1,
        total_marks: parseInt(section.total_marks) || 0,
        cutoff_marks: section.cutoff_marks.checked ? parseInt(section.cutoff_marks.value) || 0 : 0,
        problem_randomization: section.problem_randomization,
        question_and_marking: section.adaptive_marking_for_each_question.map(
            (question, qIndex) => ({
                question_id: question.questionId,
                marking_json: JSON.stringify({
                    type: question.questionType,
                    data: {
                        totalMark: question.questionMark || "",
                        negativeMark: question.questionPenalty || "",
                        negativeMarkingPercentage:
                            question.questionMark && question.questionPenalty
                                ? (Number(question.questionPenalty) /
                                      Number(question.questionMark)) *
                                  100
                                : "",
                        ...(question.questionType === "MCQM" && {
                            partialMarking: question.correctOptionIdsCnt
                                ? 1 / question.correctOptionIdsCnt
                                : 0,
                            partialMarkingPercentage: question.correctOptionIdsCnt
                                ? (1 / question.correctOptionIdsCnt) * 100
                                : 0,
                        }),
                    },
                }),
                question_duration_in_min:
                    parseInt(section.question_duration.hrs) * 60 +
                        parseInt(section.question_duration.min) || 0,
                question_order: qIndex + 1,
                is_added: true,
                is_deleted: false,
            }),
        ),
    }));
};

interface QuestionAndMarking {
    question_id: string | undefined;
    marking_json: string;
    question_duration_in_min: number;
    question_order: number;
    is_added: boolean;
    is_deleted: boolean;
}

interface Section {
    section_description_html: string;
    section_name: string;
    section_id: string;
    section_duration: number;
    section_order: number;
    total_marks: number;
    cutoff_marks: number;
    problem_randomization: boolean;
    question_and_marking: QuestionAndMarking[];
}

export function classifySections(oldSectionData: Section[], newSectionData: Section[]) {
    const added_sections: Section[] = [];
    const updated_sections: Section[] = [];
    const deleted_sections: Section[] = [];

    // Step 1: Create a map for easy lookup by sectionId
    const oldSectionMap = oldSectionData.reduce(
        (acc, section) => {
            acc[section.section_id] = section;
            return acc;
        },
        {} as { [key: string]: Section },
    );

    // Step 2: Process new sections
    newSectionData.forEach((newSection, index) => {
        if (newSection.section_id === "") {
            // Case 1: New section with no sectionId - add to added_sections
            added_sections.push({
                section_description_html: newSection.section_description_html,
                section_name: newSection.section_name,
                section_id: newSection.section_id,
                section_duration: newSection.section_duration,
                section_order: index + 1,
                total_marks: newSection.total_marks || 0,
                cutoff_marks: newSection.cutoff_marks,
                problem_randomization: newSection.problem_randomization,
                question_and_marking: newSection.question_and_marking,
            });
        } else {
            // Case 2: Section with sectionId - check for update
            const oldSection = oldSectionMap[newSection.section_id];
            if (oldSection) {
                // Case 3: If sectionId matches in oldSectionData and newSectionData, update the section
                updated_sections.push({
                    section_description_html: newSection.section_description_html || "",
                    section_name: newSection.section_name,
                    section_id: newSection.section_id,
                    section_duration: newSection.section_duration,
                    section_order: index + 1,
                    total_marks: newSection.total_marks,
                    cutoff_marks: newSection.cutoff_marks,
                    problem_randomization: newSection.problem_randomization,
                    question_and_marking: newSection.question_and_marking,
                });
            }
        }
    });

    // Step 3: Check for deleted sections (sections present in oldSectionData but not in newSectionData)
    oldSectionData.forEach((oldSection) => {
        if (!newSectionData.some((newSection) => newSection.section_id === oldSection.section_id)) {
            deleted_sections.push({
                section_description_html: oldSection.section_description_html,
                section_name: oldSection.section_name,
                section_id: oldSection.section_id,
                section_duration: oldSection.section_duration,
                section_order: oldSection.section_order,
                total_marks: oldSection.total_marks,
                cutoff_marks: oldSection.cutoff_marks,
                problem_randomization: oldSection.problem_randomization,
                question_and_marking: oldSection.question_and_marking,
            });
        }
    });

    return { added_sections, updated_sections, deleted_sections };
}
