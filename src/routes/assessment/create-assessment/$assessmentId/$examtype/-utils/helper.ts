import { RegistrationFormField, Steps } from "@/types/assessments/assessment-data-type";
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

export const convertToUTC = (dateString: string) => {
    if (dateString === "") return "";
    // Parse the input ISO 8601 date string into a Date object
    const date = new Date(dateString);
    return date.toISOString();
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
        assessmentPreview: getValues("assessmentPreview"),
        submissionType: getValues("submissionType"),
        reattemptCount: getValues("reattemptCount"),
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
        testDuration: getValues("testDuration"),
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
                is_updated: false,
            }),
        ),
    }));
};

interface QuestionAndMarking {
    question_id?: string | undefined;
    marking_json?: string | undefined;
    question_duration_in_min?: number | undefined;
    question_order?: number | undefined;
    is_added: boolean;
    is_deleted: boolean;
    is_updated: boolean;
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

    const newSectionMap = new Set(newSectionData.map((section) => section.section_id));

    // Step 2: Process new sections
    newSectionData.forEach((newSection, index) => {
        const oldSection = oldSectionMap[newSection.section_id];

        if (!newSection.section_id || !oldSection) {
            // Case 1: New section (either section_id is empty or doesn't exist in old data)
            added_sections.push({
                ...newSection,
                section_order: index + 1,
                total_marks: newSection.total_marks || 0,
                question_and_marking: newSection.question_and_marking?.map((item) => ({
                    ...item,
                    is_added: true,
                    is_deleted: false,
                    is_updated: false,
                })),
            });
        } else {
            // Case 2: Section exists in both old and new data - check for updates
            const hasChanged =
                oldSection?.section_description_html !== newSection.section_description_html ||
                oldSection?.section_name !== newSection.section_name ||
                oldSection?.section_duration !== newSection.section_duration ||
                oldSection?.total_marks !== newSection.total_marks ||
                oldSection?.cutoff_marks !== newSection.cutoff_marks ||
                oldSection?.problem_randomization !== newSection.problem_randomization;

            // Create maps for quick lookup
            const oldQuestionsMap = new Map(
                oldSection?.question_and_marking?.map((q) => [q.question_id, q]),
            );
            const newQuestionsMap = new Map(
                newSection?.question_and_marking?.map((q) => [q.question_id, q]),
            );

            const updatedQuestionAndMarking: QuestionAndMarking[] = [];

            // 1️⃣ Check for updated and deleted questions
            oldQuestionsMap.forEach((oldQuestion, questionId) => {
                if (newQuestionsMap.has(questionId)) {
                    const newQuestion = newQuestionsMap.get(questionId);
                    const isChanged = JSON.stringify(oldQuestion) !== JSON.stringify(newQuestion);
                    if (isChanged) {
                        updatedQuestionAndMarking.push({
                            ...newQuestion,
                            is_added: false,
                            is_updated: true,
                            is_deleted: false,
                        });
                    }
                } else {
                    // Question exists in oldData but not in newData (deleted)
                    updatedQuestionAndMarking.push({
                        ...oldQuestion,
                        is_added: false,
                        is_updated: false,
                        is_deleted: true,
                    });
                }
            });

            // 2️⃣ Check for newly added questions
            newQuestionsMap.forEach((newQuestion, questionId) => {
                if (!oldQuestionsMap.has(questionId)) {
                    updatedQuestionAndMarking.push({
                        ...newQuestion,
                        is_added: true,
                        is_updated: false,
                        is_deleted: false,
                    });
                }
            });

            // If there are any updates or section-level changes, add to updated_sections
            if (hasChanged || updatedQuestionAndMarking.length > 0) {
                updated_sections.push({
                    ...newSection,
                    section_order: index + 1,
                    question_and_marking: updatedQuestionAndMarking,
                });
            }
        }
    });

    // Step 3: Identify deleted sections
    oldSectionData.forEach((oldSection) => {
        if (!newSectionMap.has(oldSection.section_id)) {
            deleted_sections.push({
                ...oldSection,
                question_and_marking: oldSection.question_and_marking?.map((item) => ({
                    ...item,
                    is_added: false,
                    is_deleted: true,
                    is_updated: false,
                })),
            });
        }
    });

    return { added_sections, updated_sections, deleted_sections };
}

export function calculateTotalTime(testData: z.infer<typeof sectionDetailsSchema>) {
    if (testData.testDuration.sectionWiseDuration) {
        // Iterate through each section and sum up section durations
        const totalMinutes = testData.section.reduce((sum, section) => {
            const hrs = parseInt(section.section_duration.hrs, 10) || 0;
            const min = parseInt(section.section_duration.min, 10) || 0;
            return sum + hrs * 60 + min;
        }, 0);
        return totalMinutes;
    } else if (testData.testDuration.questionWiseDuration) {
        // Iterate through each question in each section and sum up question durations
        const totalMinutes = testData.section.reduce((sum, section) => {
            const questionMinutes = section.adaptive_marking_for_each_question.reduce(
                (qSum, question) => {
                    const hrs = parseInt(question.questionDuration.hrs, 10) || 0;
                    const min = parseInt(question.questionDuration.min, 10) || 0;
                    return qSum + hrs * 60 + min;
                },
                0,
            );
            return sum + questionMinutes;
        }, 0);
        return totalMinutes;
    }
    return (
        Number(testData?.testDuration?.entireTestDuration?.testDuration?.hrs) * 60 +
        Number(testData?.testDuration?.entireTestDuration?.testDuration?.min)
    );
}

export function convertToCustomFieldsData(data: RegistrationFormField[] | undefined) {
    if (!data) return [];
    return data?.map((field) => ({
        id: field.id,
        type: field.field_type,
        name: field.field_name,
        oldKey:
            field.field_key === "full_name" ||
            field.field_key === "phone_number" ||
            field.field_key === "email"
                ? true
                : false,
        isRequired: field.is_mandatory,
        ...(field.field_type === "dropdown" && {
            options: field.comma_separated_options.split(",").map((value, index) => ({
                id: String(index),
                value: value.trim(),
                disabled: false,
            })),
        }),
    }));
}
