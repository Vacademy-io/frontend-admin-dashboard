import { SidebarItemsType } from "../../../../types/layout-container-types";
import { House, Users, BookOpen, Scroll } from "@phosphor-icons/react";

export const SidebarItemsData: SidebarItemsType[] = [
    {
        icon: House,
        title: "Dashboard",
        to: "/dashboard",
    },
    {
        icon: Users,
        title: "Students",
        subItems: [
            {
                subItem: "Students list",
                subItemLink: "/students/students-list",
            },
            {
                subItem: "Manage Batches and Sessions",
                subItemLink: "/students/manage-batches",
            },
            {
                subItem: "Enroll Requests",
                subItemLink: "/students/enroll-requests",
            },
        ],
    },
    {
        icon: BookOpen,
        title: "Study Library",
        to: "/study-library",
    },
    {
        icon: Scroll,
        title: "Assessment Centre",
        to: "/assessment",
        subItems: [
            {
                subItem: "Examination",
                subItemLink: "/assessment/exam",
            },
            {
                subItem: "Mock Test",
                subItemLink: "/assessment/create-assessment/LIVE_QUIZ",
            },
            {
                subItem: "Practice Test",
                subItemLink: "/assessment/create-assessment/PRACTICE",
            },
            {
                subItem: "Survey",
                subItemLink: "/assessment/create-assessment/SURVEY",
            },
            {
                subItem: "Question Papers",
                subItemLink: "/assessment/question-papers",
            },
        ],
    },
];
