export type PageFilters = {
    session: string[];
    batch: string[];
    status: string[];
    gender: string[];
    session_expiry: string[];
};

export function page_setup(): PageFilters {
    return {
        session: ["2024-2025", "2023-2024", "2022-2023", "2021-2022", "2020-2021"],
        batch: [
            "10th Premium Pro Group 1",
            "10th Premium Pro Group 2",
            "10th Premium Plus Group 1",
            "10th Premium Plus Group 2",
            "9th Premium Pro Group 1",
            "9th Premium Pro Group 2",
            "9th Premium Plus Group 1",
            "9th Premium Plus Group 2",
        ],
        status: ["active", "inactive"],
        gender: ["Male", "Female", "Others"],
        session_expiry: ["Above Session Threshold", "Below Session Threshold", "Session Expired"],
    };
}
