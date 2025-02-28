export interface TopicActivityDetails {
    id: string;
    topic: string;
    status: "done" | "pending";
    last_viewed: string;
    activity_log?: ActivityLogType[]; // Change from 'ActivityLogType[] | ""' to optional array
}

// Define this where your ActivityLogType is defined
export interface ActivityLogType {
    activityDate: string;
    startTime: string;
    endTime: string;
    duration: string;
    lastPageRead: number;
    videos: {
        id: string;
        start_time_in_millis: number;
        end_time_in_millis: number;
    }[];
    documents: {
        id: string;
        start_time_in_millis: number;
        end_time_in_millis: number;
        page_number: number;
    }[];
}
export interface ChapterDetailsType {
    e_book?: TopicActivityDetails[];
    videos?: TopicActivityDetails[];
}

export const ChapterDetails: ChapterDetailsType = {
    e_book: [
        {
            id: "sdfa",
            topic: "Understanding the Human Eye",
            status: "done",
            last_viewed: "13/10/2024, 11:00AM",
            activity_log: [], // Add the activity log data instead of empty string
        },
        {
            id: "sdfa",
            topic: "Defects of Vision and Their Correction",
            status: "done",
            last_viewed: "13/10/2024, 11:00AM",
            activity_log: [],
        },
        {
            id: "sdfa",
            topic: "Refraction of Light Through the Eye",
            status: "pending",
            last_viewed: "13/10/2024, 11:00AM",
            activity_log: [],
        },
    ],
    videos: [
        {
            id: "sdfa",
            topic: "Understanding the Human Eye",
            status: "done",
            last_viewed: "13/10/2024, 11:00AM",
            activity_log: [],
        },
        {
            id: "sdfa",
            topic: "Refraction of Light Through the Eye",
            status: "pending",
            last_viewed: "13/10/2024, 11:00AM",
            activity_log: [],
        },
    ],
};

export interface ChapterType {
    number: number;
    status: "done" | "pending";
    name: string;
    chapter_details?: ChapterDetailsType;
    activity_log?: ActivityLogType[];
}

export interface LearningProgressSubjectType {
    subject: string;
    progress: number;
    chapters?: ChapterType[];
}

export const LearningProgressSubject: LearningProgressSubjectType[] = [
    {
        subject: "Physics",
        progress: 83,
        chapters: [
            {
                number: 1,
                status: "done",
                name: "Light - Reflection and Refraction",
                chapter_details: ChapterDetails,
                activity_log: [],
            },
            {
                number: 2,
                status: "done",
                name: "The Human Eye and The Colourful World",
            },
            {
                number: 3,
                status: "done",
                name: "Extra numericals for Light and Human Eye",
            },
            {
                number: 4,
                status: "pending",
                name: "Electricity",
                chapter_details: ChapterDetails,
                activity_log: [],
            },
            {
                number: 5,
                status: "pending",
                name: "Magnetic Effects of Electric Current",
            },
        ],
    },
    {
        subject: "Chemistry",
        progress: 0,
    },
    {
        subject: "Biology",
        progress: 0,
    },
];
