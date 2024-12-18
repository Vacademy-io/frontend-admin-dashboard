import { ActivityStatus } from "@/components/design-system/utils/types/chips-types";

//Student Overview
interface OverviewDetailsType {
    heading: string;
    content: string[];
}

const OverviewDetails: OverviewDetailsType[] = [
    {
        heading: "Account Credentials",
        content: ["Username: Aar124", "Password: ES24nfsg"],
    },
    {
        heading: "General Details",
        content: [
            "Batch: 10th Premium Pro Group 1",
            "Enrollment No.: 2024T001",
            "Session: 2024-25",
            "Gender: Male",
            "School: St. Joseph's School",
        ],
    },
    {
        heading: "Contact Information",
        content: ["Mobile No.: 8839457294", "Email Id: aarav@gmail.com"],
    },
    {
        heading: "Contact Information",
        content: ["Mobile No.: 8839457294", "Email Id: aarav@gmail.com"],
    },
    {
        heading: "Location Details",
        content: ["State: Madhya Pradesh", "City: Bhopal"],
    },
    {
        heading: "Parent/Guardian's Details",
        content: [
            "Father's Name: Rajesh Sharma",
            "Mother's Name: Meera Sharma",
            "Guardian's Name: -",
            "Mobile No.: 9372048369",
            "Email Id: rajesh.sharma@gmail.com",
        ],
    },
];

//Student Learning Progress
export interface TopicActivityDetails {
    topic: string;
    status: "done" | "pending";
    last_viewed: string;
    activity_log?: ActivityLogType[]; // Change from 'ActivityLogType[] | ""' to optional array
}

export interface ActivityLogType {
    id: string;
    activityDate: string;
    startTime: string;
    endTime: string;
    duration: string;
    lastPageRead: string;
}
export interface ChapterDetailsType {
    e_book?: TopicActivityDetails[];
    videos?: TopicActivityDetails[];
}

export const ActivityLog: ActivityLogType[] = [
    {
        id: "1",
        activityDate: "13/10/2024",
        startTime: "11:05 AM",
        endTime: "11:16 AM",
        duration: "11 min",
        lastPageRead: "Page 2",
    },
    {
        id: "2",
        activityDate: "13/10/2024",
        startTime: "02:30 PM",
        endTime: "03:15 PM",
        duration: "45 min",
        lastPageRead: "Page 15",
    },
    {
        id: "3",
        activityDate: "14/10/2024",
        startTime: "09:15 AM",
        endTime: "10:00 AM",
        duration: "45 min",
        lastPageRead: "Page 28",
    },
    {
        id: "4",
        activityDate: "14/10/2024",
        startTime: "02:00 PM",
        endTime: "02:30 PM",
        duration: "30 min",
        lastPageRead: "Page 35",
    },
    {
        id: "5",
        activityDate: "15/10/2024",
        startTime: "10:20 AM",
        endTime: "11:05 AM",
        duration: "45 min",
        lastPageRead: "Page 48",
    },
    {
        id: "6",
        activityDate: "15/10/2024",
        startTime: "03:45 PM",
        endTime: "04:15 PM",
        duration: "30 min",
        lastPageRead: "Page 55",
    },
    {
        id: "7",
        activityDate: "16/10/2024",
        startTime: "11:30 AM",
        endTime: "12:15 PM",
        duration: "45 min",
        lastPageRead: "Page 67",
    },
    {
        id: "8",
        activityDate: "16/10/2024",
        startTime: "04:00 PM",
        endTime: "04:45 PM",
        duration: "45 min",
        lastPageRead: "Page 82",
    },
    {
        id: "9",
        activityDate: "17/10/2024",
        startTime: "09:45 AM",
        endTime: "10:30 AM",
        duration: "45 min",
        lastPageRead: "Page 95",
    },
    {
        id: "10",
        activityDate: "17/10/2024",
        startTime: "02:15 PM",
        endTime: "03:00 PM",
        duration: "45 min",
        lastPageRead: "Page 108",
    },
    {
        id: "11",
        activityDate: "18/10/2024",
        startTime: "10:00 AM",
        endTime: "10:45 AM",
        duration: "45 min",
        lastPageRead: "Page 120",
    },
    {
        id: "12",
        activityDate: "18/10/2024",
        startTime: "03:30 PM",
        endTime: "04:15 PM",
        duration: "45 min",
        lastPageRead: "Page 133",
    },
    {
        id: "14",
        activityDate: "19/10/2024",
        startTime: "11:15 AM",
        endTime: "12:00 PM",
        duration: "45 min",
        lastPageRead: "Page 145",
    },
    {
        id: "15",
        activityDate: "19/10/2024",
        startTime: "02:45 PM",
        endTime: "03:30 PM",
        duration: "45 min",
        lastPageRead: "Page 158",
    },
];

export const ChapterDetails: ChapterDetailsType = {
    e_book: [
        {
            topic: "Understanding the Human Eye",
            status: "done",
            last_viewed: "13/10/2024, 11:00AM",
            activity_log: ActivityLog, // Add the activity log data instead of empty string
        },
        {
            topic: "Defects of Vision and Their Correction",
            status: "done",
            last_viewed: "13/10/2024, 11:00AM",
            activity_log: ActivityLog,
        },
        {
            topic: "Refraction of Light Through the Eye",
            status: "pending",
            last_viewed: "13/10/2024, 11:00AM",
            activity_log: ActivityLog,
        },
    ],
    videos: [
        {
            topic: "Understanding the Human Eye",
            status: "done",
            last_viewed: "13/10/2024, 11:00AM",
            activity_log: ActivityLog,
        },
        {
            topic: "Refraction of Light Through the Eye",
            status: "pending",
            last_viewed: "13/10/2024, 11:00AM",
            activity_log: ActivityLog,
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
                activity_log: ActivityLog,
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
                activity_log: ActivityLog,
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

//Student Test Records
interface TestRecordDetailsType {
    name: string;
    status: ActivityStatus;
    subject: string;
    testSchedule?: string;
    attemptDate?: string;
    marks?: string;
    duration?: string;
}

const TestRecordDetails: TestRecordDetailsType[] = [
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

export interface StudentOverviewType {
    title: string;
    session_expiry: number;
    data: OverviewDetailsType[];
}
export interface StudentLearningProgressType {
    title: string;
    data: LearningProgressSubjectType[];
}
export interface StudentTestRecordsType {
    title: string;
    data: TestRecordDetailsType[];
}

export interface StudentSideViewType {
    student_pfp: string;
    student_name: string;
    status: ActivityStatus;
    overview: StudentOverviewType;
    learning_progress: StudentLearningProgressType;
    test_record: StudentTestRecordsType;
}

export const StudentSideViewData: StudentSideViewType = {
    student_pfp: "",
    student_name: "Aarav Sharma",
    status: "active",
    overview: {
        title: "Overview",
        session_expiry: 125,
        data: OverviewDetails,
    },
    learning_progress: {
        title: "Learning Progress",
        data: LearningProgressSubject,
    },
    test_record: {
        title: "Test Record",
        data: TestRecordDetails,
    },
};
