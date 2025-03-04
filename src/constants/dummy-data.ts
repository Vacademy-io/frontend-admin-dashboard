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
        data: [],
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

export const InstituteType = ["Coaching Institute", "School", "University", "Corporate"];

export const RoleType = [
    { id: "1", name: "ADMIN" },
    { id: "2", name: "COURSE CREATOR" },
    { id: "3", name: "ASSESSMENT CREATOR" },
    { id: "4", name: "EVALUATOR" },
];
export const RoleTypeUserStatus = [
    { id: "1", name: "ACTIVE" },
    { id: "2", name: "DISABLED" },
];

export const RolesDummyData = {
    instituteUsers: [
        {
            id: "1",
            name: "Test 1",
            email: "test1@gmail.com",
            roleType: ["ADMIN", "COURSE CREATOR", "ASSESSMENT CREATOR", "EVALUATOR"],
            status: "ACTIVE",
        },
        {
            id: "2",
            name: "Test 2",
            email: "test2@gmail.com",
            roleType: ["ADMIN"],
            status: "DISABLED",
        },
        {
            id: "3",
            name: "Test 3",
            email: "test3@gmail.com",
            roleType: ["COURSE CREATOR"],
            status: "DISABLED",
        },
    ],
    invites: [
        {
            id: "1",
            name: "Test 11",
            email: "test11@gmail.com",
            roleType: ["ADMIN", "COURSE CREATOR"],
            status: "ACTIVE",
        },
        {
            id: "2",
            name: "Test 22",
            email: "test22@gmail.com",
            roleType: ["ADMIN"],
            status: "DISABLED",
        },
        {
            id: "3",
            name: "Test 33",
            email: "test33@gmail.com",
            roleType: ["COURSE CREATOR"],
            status: "DISABLED",
        },
        {
            id: "4",
            name: "Test 44",
            email: "test44@gmail.com",
            roleType: ["COURSE CREATOR"],
            status: "DISABLED",
        },
    ],
};

export const BulkActionDropdownStudentSubmissionsList = [
    "Provide Reattempt",
    "Revaluate",
    "Release Result",
];
