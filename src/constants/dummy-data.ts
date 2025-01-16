export const QUESTION_TYPES = [
    "MCQS",
    "MCQM",
    "Integer",
    "True or False",
    "Match the following",
    "Short answer",
];

export const QUESTION_LABELS = ["(1.)", "1.)", "(1)", "1)"];
export const OPTIONS_LABELS = ["(a.)", "a.)", "(a)", "a)", "(A.)", "A.)", "(A)", "A)"];
export const ANSWER_LABELS = ["Ans:", "Answer:", "Ans.", "Answer."];
export const EXPLANATION_LABELS = ["Exp:", "Explanation:", "Exp.", "Explanation."];
export const scheduleTestTabsData = [
    {
        value: "liveTests",
        message: "No tests are currently live.",
        data: [
            {
                id: "1",
                questionPaperTitle: "Test Title 1",
                mode: "offline",
                type: "close",
                status: "paused",
                batchDetails: ["1", "2", "3", "4"],
                createdOn: "13/11/2022",
                startDate: "13/10/2024, 11:15 AM",
                endDate: "15/10/2024, 08:30 PM",
                subject: "physics",
                duration: 100,
                totalParticipants: 672,
                attemptedParticipants: 267,
                remainingParticipants: 405,
                joinLink: "https://google.com",
            },
            {
                id: "2",
                questionPaperTitle: "Test Title 1",
                mode: "online",
                type: "open",
                status: "active",
                batchDetails: ["1", "2", "3", "4"],
                createdOn: "13/11/2022",
                startDate: "13/10/2024, 11:15 AM",
                endDate: "15/10/2024, 08:30 PM",
                subject: "physics",
                duration: 100,
                totalParticipants: 322,
                attemptedParticipants: 222,
                remainingParticipants: 100,
                joinLink: "https://facebook.com",
            },
        ],
    },
    {
        value: "upcomingTests",
        message: "No upcoming tests scheduled.",
        data: [],
    },
    {
        value: "previousTests",
        message: "No previous tests available.",
        data: [],
    },
    {
        value: "draftTests",
        message: "No draft tests available.",
        data: [],
    },
];

export const timeLimit = ["1 min", "2 min", "3 min", "5 min", "10 min", "15 min"];

export const EvaluationType = ["Auto", "Manual", "PDF", "VIDEO"];
