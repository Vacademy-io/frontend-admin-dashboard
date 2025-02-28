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

export const RoleType = ["ADMIN", "CREATOR", "EVALUATOR"];

export const BulkActionDropdownStudentSubmissionsList = [
    "Provide Reattempt",
    "Revaluate",
    "Release Result",
];
