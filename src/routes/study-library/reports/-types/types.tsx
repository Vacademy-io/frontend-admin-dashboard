import { ColumnDef } from "@tanstack/react-table";
import { ViewDetails } from "../-components/batch/viewDetailsDialogBox";

export type ColumnWidthConfig = Record<string, string>;

export interface DailyLearnerTimeSpent {
    activity_date: string;
    avg_daily_time_minutes: number;
}

export interface BatchReportResponse {
    percentage_course_completed: number;
    avg_time_spent_in_minutes: number;
    percentage_concentration_score: number;
    daily_time_spent: DailyLearnerTimeSpent[];
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

interface Module {
    module_id: string;
    module_name: string;
    module_completion_percentage: number;
    avg_time_spent_minutes: number;
}

interface SubjectProgress {
    subject_id: string;
    subject_name: string;
    modules: Module[];
}

export type SubjectProgressResponse = SubjectProgress[];

export interface SubjectOverviewColumnType {
    subject: string;
    module: string;
    module_completed: string;
    average_time_spent: string;
    details?: string;
    module_id: string;
}
export const SubjectOverviewColumns: ColumnDef<SubjectOverviewColumnType>[] = [
    {
        accessorKey: "subject",
        header: "Subject",
    },
    {
        accessorKey: "module",
        header: "Module",
    },
    {
        accessorKey: "module_id",
        header: "",
    },
    {
        accessorKey: "module_completed",
        header: "Module completed by batch",
    },
    {
        accessorKey: "average_time_spent",
        header: "Daily Time spent by batch (Avg)",
    },
    {
        accessorKey: "details",
        header: "",
        cell: ({ row }) => <ViewDetails row={row} />,
    },
];

export const SUBJECT_OVERVIEW_WIDTH: Record<keyof SubjectOverviewColumnType, string> = {
    subject: "w-[200px]",
    module: "w-[200px]",
    module_completed: "w-[200px]",
    average_time_spent: "w-[200px]",
    details: "w-[100px]",
    module_id: "w-[0px]",
};

export const df = () => {
    return <div>nothing</div>;
};
export interface Slide {
    slide_id: string;
    slide_title: string;
    slide_source_type: string;
    avg_time_spent: number;
    avg_concentration_score: number;
}

export interface Chapter {
    chapter_id: string;
    chapter_name: string;
    slides: Slide[];
}

export type ChapterReport = Chapter[];

export interface ChapterOverviewColumnType {
    study_slide: string;
    batch_concentration_score: string;
    average_time_spent: string;
}

export const ChapterOverviewColumns: ColumnDef<ChapterOverviewColumnType>[] = [
    {
        accessorKey: "study_slide",
        header: "Study Slide",
    },
    {
        accessorKey: "batch_concentration_score",
        header: "Batch Concentration Score (Avg)",
    },
    {
        accessorKey: "average_time_spent",
        header: "Time Spent (Avg)",
    },
];
export const CHAPTER_OVERVIEW_WIDTH: Record<keyof ChapterOverviewColumnType, string> = {
    study_slide: "w-[300px]",
    batch_concentration_score: "w-[300px]",
    average_time_spent: "w-[300px]",
};
