import { ColumnDef } from "@tanstack/react-table";

export type ColumnWidthConfig = Record<string, string>;

export interface DailyLearnerTimeSpent {
    activity_date: string;
    avg_daily_time_minutes: number;
}

export interface BatchReportResponse {
    percentage_course_completed_by_batch: number;
    avg_time_spent_by_batch_in_minutes: number;
    percentage_concentration_score_of_batch: number;
    daily_learner_time_spent_by_batch: DailyLearnerTimeSpent[];
}

export interface LearnerReport {
    daily_avg_time: number;
    avg_concentration: number;
    rank: number;
    total_time: number;
    user_id: string;
    email: string;
    full_name: string;
}

export const activityLogColumns: ColumnDef<{ date: string; timeSpent: string }>[] = [
    {
        accessorKey: "date",
        header: "Date",
    },
    {
        accessorKey: "timeSpent",
        header: "Time Spent",
    },
];

export interface LeaderBoardColumnType {
    rank: string;
    name: string;
    score: string;
    average: string;
    totalTime: string;
}

export const leaderBoardColumns: ColumnDef<LeaderBoardColumnType>[] = [
    {
        accessorKey: "rank",
        header: "Rank",
    },
    {
        accessorKey: "name",
        header: "Student Name",
    },
    {
        accessorKey: "score",
        header: "Concentration Score",
    },
    {
        accessorKey: "average",
        header: "Daily Time Spent (Avg)",
    },
    {
        accessorKey: "totalTime",
        header: "Total Time",
    },
];

export const CONCENTRATION_SCORE: ColumnWidthConfig = {
    date: "w-[60px]",
    timeSpent: "w-[50px]",
};

export const LEADERBOARD_WIDTH: Record<keyof LeaderBoardColumnType, string> = {
    rank: "w-[60px]",
    name: "w-[150px]",
    score: "w-[100px]", // Concentration Score column width
    average: "w-[120px]",
    totalTime: "w-[100px]",
};
