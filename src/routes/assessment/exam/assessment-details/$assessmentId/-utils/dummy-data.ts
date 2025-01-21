import { convertMarksRankData } from "./helper";

export const questionInsightsData = [
    {
        id: "1",
        sectionName: "Section 1",
        questions: [
            {
                questionId: "1",
                questionName: "What is the capital of France?",
                correctOptionIds: { type: "MCQM", data: [{ optionId: "0", optionName: "Paris" }] },
                questionExplanation:
                    "The iris is the colored part of the eye that adjusts the size of the pupil to control the amount of light entering.",
                quickResponses: [
                    { name: "Chomu Kumar 1", time: 0.35 },
                    { name: "Chomu Kumar 2", time: 0.45 },
                    { name: "Chomu Kumar 3", time: 0.4 },
                ],
                questionAttemptedAnalysis: {
                    totalAttempt: 48,
                    correct: 33,
                    partiallyCorrect: 2,
                    wrongResponse: 12,
                    skipped: 1,
                },
                studentResponseList: {
                    correctResponse: [
                        {
                            type: "internal",
                            studentDetails: [
                                {
                                    userId: "1",
                                    name: "John Doe",
                                    batch: "1",
                                    enrollmentNumber: "ENR12345",
                                    gender: "Male",
                                    responseTime: 2,
                                },
                                {
                                    userId: "2",
                                    name: "Jane Smith",
                                    batch: "2",
                                    enrollmentNumber: "ENR67890",
                                    gender: "Female",
                                    responseTime: 1,
                                },
                            ],
                        },
                        {
                            type: "external",
                            studentDetails: [
                                {
                                    userId: "1",
                                    name: "John Doe",
                                    gender: "male",
                                    responseTime: 1,
                                },
                                {
                                    userId: "2",
                                    name: "Jane Smith",
                                    gender: "male",
                                    responseTime: 1,
                                },
                            ],
                        },
                    ],
                    partiallyCorrect: [
                        {
                            type: "internal",
                            studentDetails: [
                                {
                                    userId: "1",
                                    name: "John Doe",
                                    batch: "1",
                                    enrollmentNumber: "ENR12345",
                                    gender: "Male",
                                    responseTime: 2,
                                },
                                {
                                    userId: "2",
                                    name: "Jane Smith",
                                    batch: "2",
                                    enrollmentNumber: "ENR67890",
                                    gender: "Female",
                                    responseTime: 1,
                                },
                            ],
                        },
                        {
                            type: "external",
                            studentDetails: [
                                {
                                    userId: "1",
                                    name: "John Doe",
                                    gender: "male",
                                    responseTime: 1,
                                },
                                {
                                    userId: "2",
                                    name: "Jane Smith",
                                    gender: "male",
                                    responseTime: 1,
                                },
                            ],
                        },
                    ],
                    wrongResponse: [
                        {
                            type: "internal",
                            studentDetails: [
                                {
                                    userId: "1",
                                    name: "John Doe",
                                    batch: "1",
                                    enrollmentNumber: "ENR12345",
                                    gender: "Male",
                                    responseTime: 2,
                                },
                                {
                                    userId: "2",
                                    name: "Jane Smith",
                                    batch: "2",
                                    enrollmentNumber: "ENR67890",
                                    gender: "Female",
                                    responseTime: 1,
                                },
                            ],
                        },
                        {
                            type: "external",
                            studentDetails: [
                                {
                                    userId: "1",
                                    name: "John Doe",
                                    gender: "male",
                                    responseTime: 1,
                                },
                                {
                                    userId: "2",
                                    name: "Jane Smith",
                                    gender: "male",
                                    responseTime: 1,
                                },
                            ],
                        },
                    ],
                    skipped: [
                        {
                            type: "internal",
                            studentDetails: [
                                {
                                    userId: "1",
                                    name: "John Doe",
                                    batch: "1",
                                    enrollmentNumber: "ENR12345",
                                    gender: "Male",
                                    responseTime: 2,
                                },
                                {
                                    userId: "2",
                                    name: "Jane Smith",
                                    batch: "2",
                                    enrollmentNumber: "ENR67890",
                                    gender: "Female",
                                    responseTime: 1,
                                },
                            ],
                        },
                        {
                            type: "external",
                            studentDetails: [
                                {
                                    userId: "1",
                                    name: "John Doe",
                                    gender: "male",
                                    responseTime: 1,
                                },
                                {
                                    userId: "2",
                                    name: "Jane Smith",
                                    gender: "male",
                                    responseTime: 1,
                                },
                            ],
                        },
                    ],
                },
            },
            {
                questionId: "2",
                questionName: "Which planet is known as the Red Planet?",
                correctOptionIds: { type: "MCQM", data: [{ optionId: "1", optionName: "Mars" }] },
                questionExplanation: "Mars is called the Red Planet due to its reddish appearance.",
                quickResponses: [
                    { name: "Chomu Kumar 4", time: 0.55 },
                    { name: "Chomu Kumar 5", time: 0.65 },
                ],
                questionAttemptedAnalysis: {
                    totalAttempt: 50,
                    correct: 35,
                    partiallyCorrect: 2,
                    wrongResponse: 12,
                    skipped: 1,
                },
                studentResponseList: {
                    correctResponse: [
                        {
                            type: "internal",
                            studentDetails: [
                                {
                                    userId: "1",
                                    name: "John Doe",
                                    batch: "1",
                                    enrollmentNumber: "ENR12345",
                                    gender: "Male",
                                    responseTime: 2,
                                },
                                {
                                    userId: "2",
                                    name: "Jane Smith",
                                    batch: "2",
                                    enrollmentNumber: "ENR67890",
                                    gender: "Female",
                                    responseTime: 1,
                                },
                            ],
                        },
                        {
                            type: "external",
                            studentDetails: [
                                {
                                    userId: "1",
                                    name: "John Doe",
                                    gender: "male",
                                    responseTime: 1,
                                },
                                {
                                    userId: "2",
                                    name: "Jane Smith",
                                    gender: "male",
                                    responseTime: 1,
                                },
                            ],
                        },
                    ],
                    partiallyCorrect: [
                        {
                            type: "internal",
                            studentDetails: [
                                {
                                    userId: "1",
                                    name: "John Doe",
                                    batch: "1",
                                    enrollmentNumber: "ENR12345",
                                    gender: "Male",
                                    responseTime: 2,
                                },
                                {
                                    userId: "2",
                                    name: "Jane Smith",
                                    batch: "2",
                                    enrollmentNumber: "ENR67890",
                                    gender: "Female",
                                    responseTime: 1,
                                },
                            ],
                        },
                        {
                            type: "external",
                            studentDetails: [
                                {
                                    userId: "1",
                                    name: "John Doe",
                                    gender: "male",
                                    responseTime: 1,
                                },
                                {
                                    userId: "2",
                                    name: "Jane Smith",
                                    gender: "male",
                                    responseTime: 1,
                                },
                            ],
                        },
                    ],
                    wrongResponse: [
                        {
                            type: "internal",
                            studentDetails: [
                                {
                                    userId: "1",
                                    name: "John Doe",
                                    batch: "1",
                                    enrollmentNumber: "ENR12345",
                                    gender: "Male",
                                    responseTime: 2,
                                },
                                {
                                    userId: "2",
                                    name: "Jane Smith",
                                    batch: "2",
                                    enrollmentNumber: "ENR67890",
                                    gender: "Female",
                                    responseTime: 1,
                                },
                            ],
                        },
                        {
                            type: "external",
                            studentDetails: [
                                {
                                    userId: "1",
                                    name: "John Doe",
                                    gender: "male",
                                    responseTime: 1,
                                },
                                {
                                    userId: "2",
                                    name: "Jane Smith",
                                    gender: "male",
                                    responseTime: 1,
                                },
                            ],
                        },
                    ],
                    skipped: [
                        {
                            type: "internal",
                            studentDetails: [
                                {
                                    userId: "1",
                                    name: "John Doe",
                                    batch: "1",
                                    enrollmentNumber: "ENR12345",
                                    gender: "Male",
                                    responseTime: 2,
                                },
                                {
                                    userId: "2",
                                    name: "Jane Smith",
                                    batch: "2",
                                    enrollmentNumber: "ENR67890",
                                    gender: "Female",
                                    responseTime: 1,
                                },
                            ],
                        },
                        {
                            type: "external",
                            studentDetails: [
                                {
                                    userId: "1",
                                    name: "John Doe",
                                    gender: "male",
                                    responseTime: 1,
                                },
                                {
                                    userId: "2",
                                    name: "Jane Smith",
                                    gender: "male",
                                    responseTime: 1,
                                },
                            ],
                        },
                    ],
                },
            },
            {
                questionId: "3",
                questionName: "What is 5 + 3?",
                correctOptionIds: { type: "MCQM", data: [{ optionId: "2", optionName: "8" }] },
                questionExplanation: "5 + 3 equals 8.",
                quickResponses: [
                    { name: "Chomu Kumar 6", time: 0.25 },
                    { name: "Chomu Kumar 7", time: 0.3 },
                ],
                questionAttemptedAnalysis: {
                    totalAttempt: 50,
                    correct: 35,
                    partiallyCorrect: 2,
                    wrongResponse: 12,
                    skipped: 1,
                },
                studentResponseList: {
                    correctResponse: [
                        {
                            type: "internal",
                            studentDetails: [
                                {
                                    userId: "1",
                                    name: "John Doe",
                                    batch: "1",
                                    enrollmentNumber: "ENR12345",
                                    gender: "Male",
                                    responseTime: 2,
                                },
                                {
                                    userId: "2",
                                    name: "Jane Smith",
                                    batch: "2",
                                    enrollmentNumber: "ENR67890",
                                    gender: "Female",
                                    responseTime: 1,
                                },
                            ],
                        },
                        {
                            type: "external",
                            studentDetails: [
                                {
                                    userId: "1",
                                    name: "John Doe",
                                    gender: "male",
                                    responseTime: 1,
                                },
                                {
                                    userId: "2",
                                    name: "Jane Smith",
                                    gender: "male",
                                    responseTime: 1,
                                },
                            ],
                        },
                    ],
                    partiallyCorrect: [
                        {
                            type: "internal",
                            studentDetails: [
                                {
                                    userId: "1",
                                    name: "John Doe",
                                    batch: "1",
                                    enrollmentNumber: "ENR12345",
                                    gender: "Male",
                                    responseTime: 2,
                                },
                                {
                                    userId: "2",
                                    name: "Jane Smith",
                                    batch: "2",
                                    enrollmentNumber: "ENR67890",
                                    gender: "Female",
                                    responseTime: 1,
                                },
                            ],
                        },
                        {
                            type: "external",
                            studentDetails: [
                                {
                                    userId: "1",
                                    name: "John Doe",
                                    gender: "male",
                                    responseTime: 1,
                                },
                                {
                                    userId: "2",
                                    name: "Jane Smith",
                                    gender: "male",
                                    responseTime: 1,
                                },
                            ],
                        },
                    ],
                    wrongResponse: [
                        {
                            type: "internal",
                            studentDetails: [
                                {
                                    userId: "1",
                                    name: "John Doe",
                                    batch: "1",
                                    enrollmentNumber: "ENR12345",
                                    gender: "Male",
                                    responseTime: 2,
                                },
                                {
                                    userId: "2",
                                    name: "Jane Smith",
                                    batch: "2",
                                    enrollmentNumber: "ENR67890",
                                    gender: "Female",
                                    responseTime: 1,
                                },
                            ],
                        },
                        {
                            type: "external",
                            studentDetails: [
                                {
                                    userId: "1",
                                    name: "John Doe",
                                    gender: "male",
                                    responseTime: 1,
                                },
                                {
                                    userId: "2",
                                    name: "Jane Smith",
                                    gender: "male",
                                    responseTime: 1,
                                },
                            ],
                        },
                    ],
                    skipped: [
                        {
                            type: "internal",
                            studentDetails: [
                                {
                                    userId: "1",
                                    name: "John Doe",
                                    batch: "1",
                                    enrollmentNumber: "ENR12345",
                                    gender: "Male",
                                    responseTime: 2,
                                },
                                {
                                    userId: "2",
                                    name: "Jane Smith",
                                    batch: "2",
                                    enrollmentNumber: "ENR67890",
                                    gender: "Female",
                                    responseTime: 1,
                                },
                            ],
                        },
                        {
                            type: "external",
                            studentDetails: [
                                {
                                    userId: "1",
                                    name: "John Doe",
                                    gender: "male",
                                    responseTime: 1,
                                },
                                {
                                    userId: "2",
                                    name: "Jane Smith",
                                    gender: "male",
                                    responseTime: 1,
                                },
                            ],
                        },
                    ],
                },
            },
            {
                questionId: "4",
                questionName: "Who wrote 'Hamlet'?",
                correctOptionIds: {
                    type: "MCQM",
                    data: [{ optionId: "3", optionName: "Shakespeare" }],
                },
                questionExplanation: "William Shakespeare wrote 'Hamlet'.",
                quickResponses: [
                    { name: "Chomu Kumar 8", time: 0.7 },
                    { name: "Chomu Kumar 9", time: 0.8 },
                ],
                questionAttemptedAnalysis: {
                    totalAttempt: 50,
                    correct: 35,
                    partiallyCorrect: 2,
                    wrongResponse: 12,
                    skipped: 1,
                },
                studentResponseList: {
                    correctResponse: [
                        {
                            type: "internal",
                            studentDetails: [
                                {
                                    userId: "1",
                                    name: "John Doe",
                                    batch: "1",
                                    enrollmentNumber: "ENR12345",
                                    gender: "Male",
                                    responseTime: 2,
                                },
                                {
                                    userId: "2",
                                    name: "Jane Smith",
                                    batch: "2",
                                    enrollmentNumber: "ENR67890",
                                    gender: "Female",
                                    responseTime: 1,
                                },
                            ],
                        },
                        {
                            type: "external",
                            studentDetails: [
                                {
                                    userId: "1",
                                    name: "John Doe",
                                    gender: "male",
                                    responseTime: 1,
                                },
                                {
                                    userId: "2",
                                    name: "Jane Smith",
                                    gender: "male",
                                    responseTime: 1,
                                },
                            ],
                        },
                    ],
                    partiallyCorrect: [
                        {
                            type: "internal",
                            studentDetails: [
                                {
                                    userId: "1",
                                    name: "John Doe",
                                    batch: "1",
                                    enrollmentNumber: "ENR12345",
                                    gender: "Male",
                                    responseTime: 2,
                                },
                                {
                                    userId: "2",
                                    name: "Jane Smith",
                                    batch: "2",
                                    enrollmentNumber: "ENR67890",
                                    gender: "Female",
                                    responseTime: 1,
                                },
                            ],
                        },
                        {
                            type: "external",
                            studentDetails: [
                                {
                                    userId: "1",
                                    name: "John Doe",
                                    gender: "male",
                                    responseTime: 1,
                                },
                                {
                                    userId: "2",
                                    name: "Jane Smith",
                                    gender: "male",
                                    responseTime: 1,
                                },
                            ],
                        },
                    ],
                    wrongResponse: [
                        {
                            type: "internal",
                            studentDetails: [
                                {
                                    userId: "1",
                                    name: "John Doe",
                                    batch: "1",
                                    enrollmentNumber: "ENR12345",
                                    gender: "Male",
                                    responseTime: 2,
                                },
                                {
                                    userId: "2",
                                    name: "Jane Smith",
                                    batch: "2",
                                    enrollmentNumber: "ENR67890",
                                    gender: "Female",
                                    responseTime: 1,
                                },
                            ],
                        },
                        {
                            type: "external",
                            studentDetails: [
                                {
                                    userId: "1",
                                    name: "John Doe",
                                    gender: "male",
                                    responseTime: 1,
                                },
                                {
                                    userId: "2",
                                    name: "Jane Smith",
                                    gender: "male",
                                    responseTime: 1,
                                },
                            ],
                        },
                    ],
                    skipped: [
                        {
                            type: "internal",
                            studentDetails: [
                                {
                                    userId: "1",
                                    name: "John Doe",
                                    batch: "1",
                                    enrollmentNumber: "ENR12345",
                                    gender: "Male",
                                    responseTime: 2,
                                },
                                {
                                    userId: "2",
                                    name: "Jane Smith",
                                    batch: "2",
                                    enrollmentNumber: "ENR67890",
                                    gender: "Female",
                                    responseTime: 1,
                                },
                            ],
                        },
                        {
                            type: "external",
                            studentDetails: [
                                {
                                    userId: "1",
                                    name: "John Doe",
                                    gender: "male",
                                    responseTime: 1,
                                },
                                {
                                    userId: "2",
                                    name: "Jane Smith",
                                    gender: "male",
                                    responseTime: 1,
                                },
                            ],
                        },
                    ],
                },
            },
            {
                questionId: "5",
                questionName: "What is the chemical symbol for gold?",
                correctOptionIds: { type: "MCQM", data: [{ optionId: "3", optionName: "Au" }] },
                questionExplanation: "The chemical symbol for gold is Au.",
                quickResponses: [{ name: "Chomu Kumar 10", time: 0.45 }],
                questionAttemptedAnalysis: {
                    totalAttempt: 50,
                    correct: 35,
                    partiallyCorrect: 2,
                    wrongResponse: 12,
                    skipped: 1,
                },
                studentResponseList: {
                    correctResponse: [
                        {
                            type: "internal",
                            studentDetails: [
                                {
                                    userId: "1",
                                    name: "John Doe",
                                    batch: "1",
                                    enrollmentNumber: "ENR12345",
                                    gender: "Male",
                                    responseTime: 2,
                                },
                                {
                                    userId: "2",
                                    name: "Jane Smith",
                                    batch: "2",
                                    enrollmentNumber: "ENR67890",
                                    gender: "Female",
                                    responseTime: 1,
                                },
                            ],
                        },
                        {
                            type: "external",
                            studentDetails: [
                                {
                                    userId: "1",
                                    name: "John Doe",
                                    gender: "male",
                                    responseTime: 1,
                                },
                                {
                                    userId: "2",
                                    name: "Jane Smith",
                                    gender: "male",
                                    responseTime: 1,
                                },
                            ],
                        },
                    ],
                    partiallyCorrect: [
                        {
                            type: "internal",
                            studentDetails: [
                                {
                                    userId: "1",
                                    name: "John Doe",
                                    batch: "1",
                                    enrollmentNumber: "ENR12345",
                                    gender: "Male",
                                    responseTime: 2,
                                },
                                {
                                    userId: "2",
                                    name: "Jane Smith",
                                    batch: "2",
                                    enrollmentNumber: "ENR67890",
                                    gender: "Female",
                                    responseTime: 1,
                                },
                            ],
                        },
                        {
                            type: "external",
                            studentDetails: [
                                {
                                    userId: "1",
                                    name: "John Doe",
                                    gender: "male",
                                    responseTime: 1,
                                },
                                {
                                    userId: "2",
                                    name: "Jane Smith",
                                    gender: "male",
                                    responseTime: 1,
                                },
                            ],
                        },
                    ],
                    wrongResponse: [
                        {
                            type: "internal",
                            studentDetails: [
                                {
                                    userId: "1",
                                    name: "John Doe",
                                    batch: "1",
                                    enrollmentNumber: "ENR12345",
                                    gender: "Male",
                                    responseTime: 2,
                                },
                                {
                                    userId: "2",
                                    name: "Jane Smith",
                                    batch: "2",
                                    enrollmentNumber: "ENR67890",
                                    gender: "Female",
                                    responseTime: 1,
                                },
                            ],
                        },
                        {
                            type: "external",
                            studentDetails: [
                                {
                                    userId: "1",
                                    name: "John Doe",
                                    gender: "male",
                                    responseTime: 1,
                                },
                                {
                                    userId: "2",
                                    name: "Jane Smith",
                                    gender: "male",
                                    responseTime: 1,
                                },
                            ],
                        },
                    ],
                    skipped: [
                        {
                            type: "internal",
                            studentDetails: [
                                {
                                    userId: "1",
                                    name: "John Doe",
                                    batch: "1",
                                    enrollmentNumber: "ENR12345",
                                    gender: "Male",
                                    responseTime: 2,
                                },
                                {
                                    userId: "2",
                                    name: "Jane Smith",
                                    batch: "2",
                                    enrollmentNumber: "ENR67890",
                                    gender: "Female",
                                    responseTime: 1,
                                },
                            ],
                        },
                        {
                            type: "external",
                            studentDetails: [
                                {
                                    userId: "1",
                                    name: "John Doe",
                                    gender: "male",
                                    responseTime: 1,
                                },
                                {
                                    userId: "2",
                                    name: "Jane Smith",
                                    gender: "male",
                                    responseTime: 1,
                                },
                            ],
                        },
                    ],
                },
            },
        ],
    },
    {
        id: "2",
        sectionName: "Section 2",
        questions: [
            {
                questionId: "6",
                questionName: "What is the largest ocean on Earth?",
                correctOptionIds: {
                    type: "MCQM",
                    data: [{ optionId: "0", optionName: "Pacific Ocean" }],
                },
                questionExplanation: "The Pacific Ocean is the largest ocean on Earth.",
                quickResponses: [{ name: "Chomu Kumar 11", time: 0.33 }],
                questionAttemptedAnalysis: {
                    totalAttempt: 50,
                    correct: 35,
                    partiallyCorrect: 2,
                    wrongResponse: 12,
                    skipped: 1,
                },
                studentResponseList: {
                    correctResponse: [
                        {
                            type: "internal",
                            studentDetails: [
                                {
                                    userId: "1",
                                    name: "John Doe",
                                    batch: "1",
                                    enrollmentNumber: "ENR12345",
                                    gender: "Male",
                                    responseTime: 2,
                                },
                                {
                                    userId: "2",
                                    name: "Jane Smith",
                                    batch: "2",
                                    enrollmentNumber: "ENR67890",
                                    gender: "Female",
                                    responseTime: 1,
                                },
                            ],
                        },
                        {
                            type: "external",
                            studentDetails: [
                                {
                                    userId: "1",
                                    name: "John Doe",
                                    gender: "male",
                                    responseTime: 1,
                                },
                                {
                                    userId: "2",
                                    name: "Jane Smith",
                                    gender: "male",
                                    responseTime: 1,
                                },
                            ],
                        },
                    ],
                    partiallyCorrect: [
                        {
                            type: "internal",
                            studentDetails: [
                                {
                                    userId: "1",
                                    name: "John Doe",
                                    batch: "1",
                                    enrollmentNumber: "ENR12345",
                                    gender: "Male",
                                    responseTime: 2,
                                },
                                {
                                    userId: "2",
                                    name: "Jane Smith",
                                    batch: "2",
                                    enrollmentNumber: "ENR67890",
                                    gender: "Female",
                                    responseTime: 1,
                                },
                            ],
                        },
                        {
                            type: "external",
                            studentDetails: [
                                {
                                    userId: "1",
                                    name: "John Doe",
                                    gender: "male",
                                    responseTime: 1,
                                },
                                {
                                    userId: "2",
                                    name: "Jane Smith",
                                    gender: "male",
                                    responseTime: 1,
                                },
                            ],
                        },
                    ],
                    wrongResponse: [
                        {
                            type: "internal",
                            studentDetails: [
                                {
                                    userId: "1",
                                    name: "John Doe",
                                    batch: "1",
                                    enrollmentNumber: "ENR12345",
                                    gender: "Male",
                                    responseTime: 2,
                                },
                                {
                                    userId: "2",
                                    name: "Jane Smith",
                                    batch: "2",
                                    enrollmentNumber: "ENR67890",
                                    gender: "Female",
                                    responseTime: 1,
                                },
                            ],
                        },
                        {
                            type: "external",
                            studentDetails: [
                                {
                                    userId: "1",
                                    name: "John Doe",
                                    gender: "male",
                                    responseTime: 1,
                                },
                                {
                                    userId: "2",
                                    name: "Jane Smith",
                                    gender: "male",
                                    responseTime: 1,
                                },
                            ],
                        },
                    ],
                    skipped: [
                        {
                            type: "internal",
                            studentDetails: [
                                {
                                    userId: "1",
                                    name: "John Doe",
                                    batch: "1",
                                    enrollmentNumber: "ENR12345",
                                    gender: "Male",
                                    responseTime: 2,
                                },
                                {
                                    userId: "2",
                                    name: "Jane Smith",
                                    batch: "2",
                                    enrollmentNumber: "ENR67890",
                                    gender: "Female",
                                    responseTime: 1,
                                },
                            ],
                        },
                        {
                            type: "external",
                            studentDetails: [
                                {
                                    userId: "1",
                                    name: "John Doe",
                                    gender: "male",
                                    responseTime: 1,
                                },
                                {
                                    userId: "2",
                                    name: "Jane Smith",
                                    gender: "male",
                                    responseTime: 1,
                                },
                            ],
                        },
                    ],
                },
            },
            {
                questionId: "7",
                questionName: "How many continents are there?",
                correctOptionIds: { type: "MCQM", data: [{ optionId: "1", optionName: "7" }] },
                questionExplanation: "There are 7 continents on Earth.",
                quickResponses: [{ name: "Chomu Kumar 12", time: 0.5 }],
                questionAttemptedAnalysis: {
                    totalAttempt: 50,
                    correct: 35,
                    partiallyCorrect: 2,
                    wrongResponse: 12,
                    skipped: 1,
                },
                studentResponseList: {
                    correctResponse: [
                        {
                            type: "internal",
                            studentDetails: [
                                {
                                    userId: "1",
                                    name: "John Doe",
                                    batch: "1",
                                    enrollmentNumber: "ENR12345",
                                    gender: "Male",
                                    responseTime: 2,
                                },
                                {
                                    userId: "2",
                                    name: "Jane Smith",
                                    batch: "2",
                                    enrollmentNumber: "ENR67890",
                                    gender: "Female",
                                    responseTime: 1,
                                },
                            ],
                        },
                        {
                            type: "external",
                            studentDetails: [
                                {
                                    userId: "1",
                                    name: "John Doe",
                                    gender: "male",
                                    responseTime: 1,
                                },
                                {
                                    userId: "2",
                                    name: "Jane Smith",
                                    gender: "male",
                                    responseTime: 1,
                                },
                            ],
                        },
                    ],
                    partiallyCorrect: [
                        {
                            type: "internal",
                            studentDetails: [
                                {
                                    userId: "1",
                                    name: "John Doe",
                                    batch: "1",
                                    enrollmentNumber: "ENR12345",
                                    gender: "Male",
                                    responseTime: 2,
                                },
                                {
                                    userId: "2",
                                    name: "Jane Smith",
                                    batch: "2",
                                    enrollmentNumber: "ENR67890",
                                    gender: "Female",
                                    responseTime: 1,
                                },
                            ],
                        },
                        {
                            type: "external",
                            studentDetails: [
                                {
                                    userId: "1",
                                    name: "John Doe",
                                    gender: "male",
                                    responseTime: 1,
                                },
                                {
                                    userId: "2",
                                    name: "Jane Smith",
                                    gender: "male",
                                    responseTime: 1,
                                },
                            ],
                        },
                    ],
                    wrongResponse: [
                        {
                            type: "internal",
                            studentDetails: [
                                {
                                    userId: "1",
                                    name: "John Doe",
                                    batch: "1",
                                    enrollmentNumber: "ENR12345",
                                    gender: "Male",
                                    responseTime: 2,
                                },
                                {
                                    userId: "2",
                                    name: "Jane Smith",
                                    batch: "2",
                                    enrollmentNumber: "ENR67890",
                                    gender: "Female",
                                    responseTime: 1,
                                },
                            ],
                        },
                        {
                            type: "external",
                            studentDetails: [
                                {
                                    userId: "1",
                                    name: "John Doe",
                                    gender: "male",
                                    responseTime: 1,
                                },
                                {
                                    userId: "2",
                                    name: "Jane Smith",
                                    gender: "male",
                                    responseTime: 1,
                                },
                            ],
                        },
                    ],
                    skipped: [
                        {
                            type: "internal",
                            studentDetails: [
                                {
                                    userId: "1",
                                    name: "John Doe",
                                    batch: "1",
                                    enrollmentNumber: "ENR12345",
                                    gender: "Male",
                                    responseTime: 2,
                                },
                                {
                                    userId: "2",
                                    name: "Jane Smith",
                                    batch: "2",
                                    enrollmentNumber: "ENR67890",
                                    gender: "Female",
                                    responseTime: 1,
                                },
                            ],
                        },
                        {
                            type: "external",
                            studentDetails: [
                                {
                                    userId: "1",
                                    name: "John Doe",
                                    gender: "male",
                                    responseTime: 1,
                                },
                                {
                                    userId: "2",
                                    name: "Jane Smith",
                                    gender: "male",
                                    responseTime: 1,
                                },
                            ],
                        },
                    ],
                },
            },
            {
                questionId: "8",
                questionName: "Who discovered gravity?",
                correctOptionIds: {
                    type: "MCQM",
                    data: [{ optionId: "2", optionName: "Isaac Newton" }],
                },
                questionExplanation:
                    "Isaac Newton discovered gravity when an apple fell from a tree.",
                quickResponses: [{ name: "Chomu Kumar 13", time: 0.6 }],
                questionAttemptedAnalysis: {
                    totalAttempt: 50,
                    correct: 35,
                    partiallyCorrect: 2,
                    wrongResponse: 12,
                    skipped: 1,
                },
                studentResponseList: {
                    correctResponse: [
                        {
                            type: "internal",
                            studentDetails: [
                                {
                                    userId: "1",
                                    name: "John Doe",
                                    batch: "1",
                                    enrollmentNumber: "ENR12345",
                                    gender: "Male",
                                    responseTime: 2,
                                },
                                {
                                    userId: "2",
                                    name: "Jane Smith",
                                    batch: "2",
                                    enrollmentNumber: "ENR67890",
                                    gender: "Female",
                                    responseTime: 1,
                                },
                            ],
                        },
                        {
                            type: "external",
                            studentDetails: [
                                {
                                    userId: "1",
                                    name: "John Doe",
                                    gender: "male",
                                    responseTime: 1,
                                },
                                {
                                    userId: "2",
                                    name: "Jane Smith",
                                    gender: "male",
                                    responseTime: 1,
                                },
                            ],
                        },
                    ],
                    partiallyCorrect: [
                        {
                            type: "internal",
                            studentDetails: [
                                {
                                    userId: "1",
                                    name: "John Doe",
                                    batch: "1",
                                    enrollmentNumber: "ENR12345",
                                    gender: "Male",
                                    responseTime: 2,
                                },
                                {
                                    userId: "2",
                                    name: "Jane Smith",
                                    batch: "2",
                                    enrollmentNumber: "ENR67890",
                                    gender: "Female",
                                    responseTime: 1,
                                },
                            ],
                        },
                        {
                            type: "external",
                            studentDetails: [
                                {
                                    userId: "1",
                                    name: "John Doe",
                                    gender: "male",
                                    responseTime: 1,
                                },
                                {
                                    userId: "2",
                                    name: "Jane Smith",
                                    gender: "male",
                                    responseTime: 1,
                                },
                            ],
                        },
                    ],
                    wrongResponse: [
                        {
                            type: "internal",
                            studentDetails: [
                                {
                                    userId: "1",
                                    name: "John Doe",
                                    batch: "1",
                                    enrollmentNumber: "ENR12345",
                                    gender: "Male",
                                    responseTime: 2,
                                },
                                {
                                    userId: "2",
                                    name: "Jane Smith",
                                    batch: "2",
                                    enrollmentNumber: "ENR67890",
                                    gender: "Female",
                                    responseTime: 1,
                                },
                            ],
                        },
                        {
                            type: "external",
                            studentDetails: [
                                {
                                    userId: "1",
                                    name: "John Doe",
                                    gender: "male",
                                    responseTime: 1,
                                },
                                {
                                    userId: "2",
                                    name: "Jane Smith",
                                    gender: "male",
                                    responseTime: 1,
                                },
                            ],
                        },
                    ],
                    skipped: [
                        {
                            type: "internal",
                            studentDetails: [
                                {
                                    userId: "1",
                                    name: "John Doe",
                                    batch: "1",
                                    enrollmentNumber: "ENR12345",
                                    gender: "Male",
                                    responseTime: 2,
                                },
                                {
                                    userId: "2",
                                    name: "Jane Smith",
                                    batch: "2",
                                    enrollmentNumber: "ENR67890",
                                    gender: "Female",
                                    responseTime: 1,
                                },
                            ],
                        },
                        {
                            type: "external",
                            studentDetails: [
                                {
                                    userId: "1",
                                    name: "John Doe",
                                    gender: "male",
                                    responseTime: 1,
                                },
                                {
                                    userId: "2",
                                    name: "Jane Smith",
                                    gender: "male",
                                    responseTime: 1,
                                },
                            ],
                        },
                    ],
                },
            },
            {
                questionId: "9",
                questionName: "What gas do plants absorb from the atmosphere?",
                correctOptionIds: {
                    type: "MCQM",
                    data: [{ optionId: "3", optionName: "Carbon Dioxide" }],
                },
                questionExplanation: "Plants absorb carbon dioxide during photosynthesis.",
                quickResponses: [{ name: "Chomu Kumar 14", time: 0.45 }],
                questionAttemptedAnalysis: {
                    totalAttempt: 50,
                    correct: 35,
                    partiallyCorrect: 2,
                    wrongResponse: 12,
                    skipped: 1,
                },
                studentResponseList: {
                    correctResponse: [
                        {
                            type: "internal",
                            studentDetails: [
                                {
                                    userId: "1",
                                    name: "John Doe",
                                    batch: "1",
                                    enrollmentNumber: "ENR12345",
                                    gender: "Male",
                                    responseTime: 2,
                                },
                                {
                                    userId: "2",
                                    name: "Jane Smith",
                                    batch: "2",
                                    enrollmentNumber: "ENR67890",
                                    gender: "Female",
                                    responseTime: 1,
                                },
                            ],
                        },
                        {
                            type: "external",
                            studentDetails: [
                                {
                                    userId: "1",
                                    name: "John Doe",
                                    gender: "male",
                                    responseTime: 1,
                                },
                                {
                                    userId: "2",
                                    name: "Jane Smith",
                                    gender: "male",
                                    responseTime: 1,
                                },
                            ],
                        },
                    ],
                    partiallyCorrect: [
                        {
                            type: "internal",
                            studentDetails: [
                                {
                                    userId: "1",
                                    name: "John Doe",
                                    batch: "1",
                                    enrollmentNumber: "ENR12345",
                                    gender: "Male",
                                    responseTime: 2,
                                },
                                {
                                    userId: "2",
                                    name: "Jane Smith",
                                    batch: "2",
                                    enrollmentNumber: "ENR67890",
                                    gender: "Female",
                                    responseTime: 1,
                                },
                            ],
                        },
                        {
                            type: "external",
                            studentDetails: [
                                {
                                    userId: "1",
                                    name: "John Doe",
                                    gender: "male",
                                    responseTime: 1,
                                },
                                {
                                    userId: "2",
                                    name: "Jane Smith",
                                    gender: "male",
                                    responseTime: 1,
                                },
                            ],
                        },
                    ],
                    wrongResponse: [
                        {
                            type: "internal",
                            studentDetails: [
                                {
                                    userId: "1",
                                    name: "John Doe",
                                    batch: "1",
                                    enrollmentNumber: "ENR12345",
                                    gender: "Male",
                                    responseTime: 2,
                                },
                                {
                                    userId: "2",
                                    name: "Jane Smith",
                                    batch: "2",
                                    enrollmentNumber: "ENR67890",
                                    gender: "Female",
                                    responseTime: 1,
                                },
                            ],
                        },
                        {
                            type: "external",
                            studentDetails: [
                                {
                                    userId: "1",
                                    name: "John Doe",
                                    gender: "male",
                                    responseTime: 1,
                                },
                                {
                                    userId: "2",
                                    name: "Jane Smith",
                                    gender: "male",
                                    responseTime: 1,
                                },
                            ],
                        },
                    ],
                    skipped: [
                        {
                            type: "internal",
                            studentDetails: [
                                {
                                    userId: "1",
                                    name: "John Doe",
                                    batch: "1",
                                    enrollmentNumber: "ENR12345",
                                    gender: "Male",
                                    responseTime: 2,
                                },
                                {
                                    userId: "2",
                                    name: "Jane Smith",
                                    batch: "2",
                                    enrollmentNumber: "ENR67890",
                                    gender: "Female",
                                    responseTime: 1,
                                },
                            ],
                        },
                        {
                            type: "external",
                            studentDetails: [
                                {
                                    userId: "1",
                                    name: "John Doe",
                                    gender: "male",
                                    responseTime: 1,
                                },
                                {
                                    userId: "2",
                                    name: "Jane Smith",
                                    gender: "male",
                                    responseTime: 1,
                                },
                            ],
                        },
                    ],
                },
            },
            {
                questionId: "10",
                questionName: "What is the hardest natural substance on Earth?",
                correctOptionIds: {
                    type: "MCQM",
                    data: [{ optionId: "3", optionName: "Diamond" }],
                },
                questionExplanation: "Diamond is the hardest known natural substance.",
                quickResponses: [{ name: "Chomu Kumar 15", time: 0.38 }],
                questionAttemptedAnalysis: {
                    totalAttempt: 50,
                    correct: 35,
                    partiallyCorrect: 2,
                    wrongResponse: 12,
                    skipped: 1,
                },
                studentResponseList: {
                    correctResponse: [
                        {
                            type: "internal",
                            studentDetails: [
                                {
                                    userId: "1",
                                    name: "John Doe",
                                    batch: "1",
                                    enrollmentNumber: "ENR12345",
                                    gender: "Male",
                                    responseTime: 2,
                                },
                                {
                                    userId: "2",
                                    name: "Jane Smith",
                                    batch: "2",
                                    enrollmentNumber: "ENR67890",
                                    gender: "Female",
                                    responseTime: 1,
                                },
                            ],
                        },
                        {
                            type: "external",
                            studentDetails: [
                                {
                                    userId: "1",
                                    name: "John Doe",
                                    gender: "male",
                                    responseTime: 1,
                                },
                                {
                                    userId: "2",
                                    name: "Jane Smith",
                                    gender: "male",
                                    responseTime: 1,
                                },
                            ],
                        },
                    ],
                    partiallyCorrect: [
                        {
                            type: "internal",
                            studentDetails: [
                                {
                                    userId: "1",
                                    name: "John Doe",
                                    batch: "1",
                                    enrollmentNumber: "ENR12345",
                                    gender: "Male",
                                    responseTime: 2,
                                },
                                {
                                    userId: "2",
                                    name: "Jane Smith",
                                    batch: "2",
                                    enrollmentNumber: "ENR67890",
                                    gender: "Female",
                                    responseTime: 1,
                                },
                            ],
                        },
                        {
                            type: "external",
                            studentDetails: [
                                {
                                    userId: "1",
                                    name: "John Doe",
                                    gender: "male",
                                    responseTime: 1,
                                },
                                {
                                    userId: "2",
                                    name: "Jane Smith",
                                    gender: "male",
                                    responseTime: 1,
                                },
                            ],
                        },
                    ],
                    wrongResponse: [
                        {
                            type: "internal",
                            studentDetails: [
                                {
                                    userId: "1",
                                    name: "John Doe",
                                    batch: "1",
                                    enrollmentNumber: "ENR12345",
                                    gender: "Male",
                                    responseTime: 2,
                                },
                                {
                                    userId: "2",
                                    name: "Jane Smith",
                                    batch: "2",
                                    enrollmentNumber: "ENR67890",
                                    gender: "Female",
                                    responseTime: 1,
                                },
                            ],
                        },
                        {
                            type: "external",
                            studentDetails: [
                                {
                                    userId: "1",
                                    name: "John Doe",
                                    gender: "male",
                                    responseTime: 1,
                                },
                                {
                                    userId: "2",
                                    name: "Jane Smith",
                                    gender: "male",
                                    responseTime: 1,
                                },
                            ],
                        },
                    ],
                    skipped: [
                        {
                            type: "internal",
                            studentDetails: [
                                {
                                    userId: "1",
                                    name: "John Doe",
                                    batch: "1",
                                    enrollmentNumber: "ENR12345",
                                    gender: "Male",
                                    responseTime: 2,
                                },
                                {
                                    userId: "2",
                                    name: "Jane Smith",
                                    batch: "2",
                                    enrollmentNumber: "ENR67890",
                                    gender: "Female",
                                    responseTime: 1,
                                },
                            ],
                        },
                        {
                            type: "external",
                            studentDetails: [
                                {
                                    userId: "1",
                                    name: "John Doe",
                                    gender: "male",
                                    responseTime: 1,
                                },
                                {
                                    userId: "2",
                                    name: "Jane Smith",
                                    gender: "male",
                                    responseTime: 1,
                                },
                            ],
                        },
                    ],
                },
            },
        ],
    },
];

export const asssessmentDetailsData = {
    type: "close",
    title: "The Human Eye and The Colourful World",
    mode: "offline",
    status: "active",
};

export const overviewTabOpenTestData = {
    createdOn: "13/10/2024",
    startDate: "13/10/2024, 11:15 AM",
    endDate: "15/10/2024, 08:30 PM",
    subject: "Physics",
    duration: 20,
    totalParticipants: 316,
    avgDuration: 17.3,
    avgMarks: 15,
    assessmentStatus: [
        {
            participantsType: "internal",
            studentsData: [
                {
                    type: "Attempted",
                    studentDetails: [
                        {
                            userId: "1",
                            name: "John Doe",
                            batch: "1",
                            enrollmentNumber: "ENR12345",
                            gender: "Male",
                            attemptDate: "13/10/2024",
                            startTime: "11:05 AM",
                            endTime: "11:18 AM",
                            duration: 20,
                            scoredMarks: 15,
                            totalMarks: 20,
                        },
                        {
                            userId: "2",
                            name: "Jane Smith",
                            batch: "2",
                            enrollmentNumber: "ENR67890",
                            gender: "Female",
                            attemptDate: "13/10/2024",
                            startTime: "11:05 AM",
                            endTime: "11:18 AM",
                            duration: 20,
                            scoredMarks: 15,
                            totalMarks: 20,
                        },
                    ],
                },
                {
                    type: "Pending",
                    studentDetails: [
                        {
                            userId: "1",
                            name: "John Doe",
                            batch: "1",
                            enrollmentNumber: "ENR12345",
                            gender: "Male",
                            phoneNo: "8782372322",
                            email: "test1@gmail.com",
                            city: "Noida",
                            state: "UP",
                        },
                        {
                            userId: "2",
                            name: "Jane Smith",
                            batch: "2",
                            enrollmentNumber: "ENR67890",
                            gender: "Female",
                            phoneNo: "8782372322",
                            email: "test1@gmail.com",
                            city: "Noida",
                            state: "UP",
                        },
                    ],
                },
                {
                    type: "Ongoing",
                    studentDetails: [
                        {
                            userId: "1",
                            name: "John Doe",
                            batch: "1",
                            enrollmentNumber: "ENR12345",
                            gender: "Male",
                            startTime: "11:05 AM",
                        },
                        {
                            userId: "2",
                            name: "Jane Smith",
                            batch: "2",
                            enrollmentNumber: "ENR67890",
                            gender: "Female",
                            startTime: "11:05 AM",
                        },
                    ],
                },
            ],
        },
        {
            participantsType: "external",
            studentsData: [
                {
                    type: "Attempted",
                    studentDetails: [
                        {
                            userId: "1",
                            name: "John Doe",
                            gender: "Male",
                            attemptDate: "13/10/2024",
                            startTime: "11:05 AM",
                            endTime: "11:18 AM",
                            duration: 20,
                            scoredMarks: 15,
                            totalMarks: 20,
                        },
                        {
                            userId: "2",
                            name: "Jane Smith",
                            gender: "Female",
                            attemptDate: "13/10/2024",
                            startTime: "11:05 AM",
                            endTime: "11:18 AM",
                            duration: 20,
                            scoredMarks: 15,
                            totalMarks: 20,
                        },
                    ],
                },
                {
                    type: "Pending",
                    studentDetails: [
                        {
                            userId: "1",
                            name: "John Doe",
                            gender: "Male",
                            phoneNo: "8782372322",
                            email: "test1@gmail.com",
                            city: "Noida",
                            state: "UP",
                        },
                        {
                            userId: "2",
                            name: "Jane Smith",
                            gender: "Female",
                            phoneNo: "8782372322",
                            email: "test1@gmail.com",
                            city: "Noida",
                            state: "UP",
                        },
                    ],
                },
                {
                    type: "Ongoing",
                    studentDetails: [
                        {
                            userId: "1",
                            name: "John Doe",
                            gender: "Male",
                            startTime: "11:05 AM",
                        },
                        {
                            userId: "2",
                            name: "Jane Smith",
                            gender: "Female",
                            startTime: "11:05 AM",
                        },
                    ],
                },
            ],
        },
    ],
    studentLeaderboard: [
        {
            userId: "1",
            rank: "1",
            name: "test 1",
            batch: "1",
            percentile: "100%",
            scoredMarks: 15,
            totalMarks: 20,
        },
        {
            userId: "2",
            rank: "1",
            name: "test 2",
            batch: "1",
            percentile: "100%",
            scoredMarks: 15,
            totalMarks: 20,
        },
        {
            userId: "3",
            rank: "2",
            name: "test 3",
            batch: "1",
            percentile: "100%",
            scoredMarks: 15,
            totalMarks: 20,
        },
    ],
    marksRankData: [],
};

// Extract studentLeaderboard first
const marksRankOpenData = convertMarksRankData(overviewTabOpenTestData.studentLeaderboard);

// Add marksRankData after defining studentLeaderboard
overviewTabOpenTestData.marksRankData = marksRankOpenData;

export const overviewTabCloseTestData = {
    createdOn: "13/10/2024",
    startDate: "13/10/2024, 11:15 AM",
    endDate: "15/10/2024, 08:30 PM",
    subject: "Physics",
    duration: 20,
    totalParticipants: 316,
    avgDuration: 17.3,
    avgMarks: 15,
    assessmentStatus: [
        {
            type: "Attempted",
            studentDetails: [
                {
                    userId: "1",
                    name: "John Doe",
                    batch: "1",
                    enrollmentNumber: "ENR12345",
                    gender: "Male",
                    attemptDate: "13/10/2024",
                    startTime: "11:05 AM",
                    endTime: "11:18 AM",
                    duration: 20,
                    scoredMarks: 15,
                    totalMarks: 20,
                },
                {
                    userId: "2",
                    name: "Jane Smith",
                    batch: "2",
                    enrollmentNumber: "ENR67890",
                    gender: "Female",
                    attemptDate: "13/10/2024",
                    startTime: "11:05 AM",
                    endTime: "11:18 AM",
                    duration: 20,
                    scoredMarks: 15,
                    totalMarks: 20,
                },
            ],
        },
        {
            type: "Pending",
            studentDetails: [
                {
                    userId: "1",
                    name: "John Doe",
                    batch: "1",
                    enrollmentNumber: "ENR12345",
                    gender: "Male",
                    phoneNo: "8782372322",
                    email: "test1@gmail.com",
                    city: "Noida",
                    state: "UP",
                },
                {
                    userId: "2",
                    name: "Jane Smith",
                    batch: "2",
                    enrollmentNumber: "ENR67890",
                    gender: "Female",
                    phoneNo: "8782372322",
                    email: "test1@gmail.com",
                    city: "Noida",
                    state: "UP",
                },
            ],
        },
        {
            type: "Ongoing",
            studentDetails: [
                {
                    userId: "1",
                    name: "John Doe",
                    batch: "1",
                    enrollmentNumber: "ENR12345",
                    gender: "Male",
                    startTime: "11:05 AM",
                },
                {
                    userId: "2",
                    name: "Jane Smith",
                    batch: "2",
                    enrollmentNumber: "ENR67890",
                    gender: "Female",
                    startTime: "11:05 AM",
                },
            ],
        },
    ],
    studentLeaderboard: [
        {
            userId: "1",
            rank: "1",
            name: "test 1",
            batch: "1",
            percentile: "100%",
            scoredMarks: 15,
            totalMarks: 20,
        },
        {
            userId: "2",
            rank: "1",
            name: "test 2",
            batch: "1",
            percentile: "100%",
            scoredMarks: 15,
            totalMarks: 20,
        },
        {
            userId: "3",
            rank: "2",
            name: "test 3",
            batch: "1",
            percentile: "100%",
            scoredMarks: 10,
            totalMarks: 20,
        },
        {
            userId: "4",
            rank: "3",
            name: "test 3",
            batch: "1",
            percentile: "100%",
            scoredMarks: 10,
            totalMarks: 20,
        },
        {
            userId: "5",
            rank: "4",
            name: "test 3",
            batch: "1",
            percentile: "100%",
            scoredMarks: 10,
            totalMarks: 20,
        },
        {
            userId: "6",
            rank: "5",
            name: "test 3",
            batch: "1",
            percentile: "100%",
            scoredMarks: 10,
            totalMarks: 20,
        },
        {
            userId: "7",
            rank: "6",
            name: "test 3",
            batch: "1",
            percentile: "100%",
            scoredMarks: 10,
            totalMarks: 20,
        },
        {
            userId: "8",
            rank: "7",
            name: "test 3",
            batch: "1",
            percentile: "100%",
            scoredMarks: 10,
            totalMarks: 20,
        },
        {
            userId: "9",
            rank: "8",
            name: "test 3",
            batch: "1",
            percentile: "100%",
            scoredMarks: 10,
            totalMarks: 20,
        },
    ],
    marksRankData: [],
};

// Extract studentLeaderboard first
const marksRankCloseData = convertMarksRankData(overviewTabCloseTestData.studentLeaderboard);

// Add marksRankData after defining studentLeaderboard
overviewTabCloseTestData.marksRankData = marksRankCloseData;
