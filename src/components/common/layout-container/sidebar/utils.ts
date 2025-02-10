import { SidebarItemsType } from "../../../../types/layout-container/layout-container-types";
import { House, Users, BookOpen, Scroll } from "@phosphor-icons/react";

export const SidebarItemsData: SidebarItemsType[] = [
    {
        icon: House,
        title: "Dashboard",
        id: "dashboard",
        to: "/dashboard",
    },
    {
        icon: Users,
        title: "Students",
        id: "student-mangement",
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
        id: "study-library",
        to: "/study-library",
    },
    {
        icon: Scroll,
        title: "Assessment Centre",
        id: "assessment-centre",
        to: "/assessment",
        subItems: [
            {
                subItem: "Examination",
                subItemLink: "/assessment/exam",
            },
            {
                subItem: "Mock Test",
                subItemLink: "/assessment/create-assessment/defaultId/LIVE_QUIZ?currentStep=0",
            },
            {
                subItem: "Practice Test",
                subItemLink: "/assessment/create-assessment/defaultId/PRACTICE?currentStep=0",
            },
            {
                subItem: "Survey",
                subItemLink: "/assessment/create-assessment/defaultId/SURVEY?currentStep=0",
            },
            {
                subItem: "Question Papers",
                subItemLink: "/assessment/question-papers",
            },
        ],
    },
];
