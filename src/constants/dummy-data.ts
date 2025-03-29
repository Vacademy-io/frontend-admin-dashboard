export const QUESTION_TYPES = ["MCQS", "MCQM"];

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

export const BulkActionDropdownStudentSubmissionsList = [
    "Provide Reattempt",
    "Revaluate",
    "Release Result",
];
