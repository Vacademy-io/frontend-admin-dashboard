import { ActivityStatus } from "@/components/design-system/utils/types/chips-types";

export interface TestReport {
    testInfo: TestInfo;
    charts: TestCharts;
    answerReview: AnswerReview[];
}

export interface TestInfo {
    testName: string;
    description?: string;
    subject: string;
    duration: string;
    attemptDate: string;
    marks: string;
    endTime: string;
    startTime: string;
}

export interface TestCharts {
    responseBreakdown: {
        attempted: number;
        skipped: number;
        total: number;
    };
    marksBreakdown: {
        correctAnswers?: {
            count: number;
            marks: string;
        };
        partiallyCorrectAnswers?: {
            count: number;
            marks: string;
        };
        incorrectAnswers?: {
            count: number;
            marks: string;
        };
        notAttempted?: {
            count: number;
            marks: string;
        };
        total: {
            count: number;
            marks: string;
        };
    };
}

export interface AnswerReview {
    questionNumber: number;
    question: string;
    marks: string;
    status: "correct" | "incorrect" | "not-attempted";
    studentAnswer?: string;
    correctAnswer: string;
    explanation: string;
}

// Update the TestRecordDetailsType interface
export interface TestRecordDetailsType {
    name: string;
    status: ActivityStatus;
    subject: string;
    testSchedule?: string;
    attemptDate?: string;
    marks?: string;
    duration?: string;
    testReport?: TestReport; // Add this field
}

// Update the TestRecordDetails array with test report data
export const TestRecordDetails: TestRecordDetailsType[] = [
    {
        name: "Polynomials",
        status: "pending",
        subject: "Mathematics",
        testSchedule: "13 Oct, 11:00am - 15 Oct 8:00pm",
    },
    {
        name: "Human Eye and The Colourful World",
        status: "active",
        subject: "Physics",
        attemptDate: "13/10/2024",
        marks: "13/20",
        duration: "13 min",
        testReport: {
            testInfo: {
                testName: "Human Eye and The Colourful World",
                description:
                    "This Biology paper covers key concepts in cellular processes, genetics, ecology, and human physiology. It tests foundational knowledge, critical thinking, and application of biological principles.",
                subject: "Physics",
                duration: "45 mins",
                attemptDate: "April 10th, 11:00 AM",
                marks: "13/20",
                endTime: "11:45 AM",
                startTime: "11:00AM",
            },
            charts: {
                responseBreakdown: {
                    attempted: 17,
                    skipped: 3,
                    total: 20,
                },
                marksBreakdown: {
                    correctAnswers: {
                        count: 12,
                        marks: "+24",
                    },
                    partiallyCorrectAnswers: {
                        count: 3,
                        marks: "+0",
                    },
                    incorrectAnswers: {
                        count: 2,
                        marks: "-2",
                    },
                    notAttempted: {
                        count: 3,
                        marks: "0",
                    },
                    total: {
                        count: 20,
                        marks: "22/40",
                    },
                },
            },
            answerReview: [
                {
                    questionNumber: 1,
                    question:
                        "Which part of the eye controls the amount of light entering the eye?",
                    marks: "+2",
                    status: "correct",
                    studentAnswer: "Iris",
                    correctAnswer: "Iris",
                    explanation:
                        "The iris is the colored part of the eye that adjusts the size of the pupil to control the amount of light entering.",
                },
                {
                    questionNumber: 2,
                    question:
                        "What causes the splitting of white light into its component colors in a glass prism?",
                    marks: "-1",
                    status: "incorrect",
                    studentAnswer: "Dispersion",
                    correctAnswer: "Refraction",
                    explanation:
                        "The light is split through prism due to refraction of light through different mediums.",
                },
                {
                    questionNumber: 3,
                    question: "Why does blue appear blue during the day?",
                    marks: "0",
                    status: "not-attempted",
                    correctAnswer: "Scattering of shorter wavelengths",
                    explanation:
                        "The sky appears blue due to Rayleigh scattering, where shorter blue wavelengths are scattered more than longer red wavelengths.",
                },
            ],
        },
    },
    {
        name: "Matters in our surroundings",
        status: "active",
        subject: "Chemistry",
        attemptDate: "13/10/2024",
        marks: "13/20",
        duration: "36 min",
    },
    {
        name: "Quadratic Equations and A.P.",
        status: "inactive",
        subject: "Mathematics",
        testSchedule: "7 Oct, 11:00 am - 8 Oct 8:00 pm",
    },
    {
        name: "Coordinate Geo, and Linear Equations",
        status: "active",
        subject: "Mathematics",
        attemptDate: "05/10/2024",
        marks: "15/20",
        duration: "42 min",
    },
];
