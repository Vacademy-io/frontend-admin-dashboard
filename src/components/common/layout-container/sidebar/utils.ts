import {
    House,
    Users,
    BookOpen,
    Scroll,
    Globe,
    FileMagnifyingGlass,
    HeadCircuit,
} from "@phosphor-icons/react";
import { SidebarItemsType } from "../../../../types/layout-container/layout-container-types";
import { NotePencil } from "phosphor-react";

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
                subItem: "Manage Batches",
                subItemLink: "/students/manage-batches",
            },
            {
                subItem: "Enroll Requests",
                subItemLink: "/students/enroll-requests",
            },
            {
                subItem: "Invite",
                subItemLink: "/students/invite",
            },
        ],
    },
    {
        icon: BookOpen,
        title: "Learning Center",
        id: "study-library",
        subItems: [
            {
                subItem: "Courses",
                subItemLink: "/study-library/courses",
            },
            {
                subItem: "Session",
                subItemLink: "/study-library/session",
            },
            {
                subItem: "Reports",
                subItemLink: "/study-library/reports",
            },
            {
                subItem: "Presentation",
                subItemLink: "/study-library/present",
            },
        ],
    },
    {
        icon: NotePencil,
        id: "Homework Creation",
        title: "Homework",
        to: "/homework-creation/assessment-list?selectedTab=liveTests",
    },
    {
        icon: Scroll,
        title: "Assessment Centre",
        id: "assessment-centre",
        to: "/assessment",
        subItems: [
            {
                subItem: "Assessment List",
                subItemLink: "/assessment/assessment-list?selectedTab=liveTests",
            },
            {
                subItem: "Question Papers",
                subItemLink: "/assessment/question-papers",
            },
        ],
    },
    {
        icon: FileMagnifyingGlass,
        title: "Evaluation Centre",
        id: "evaluation-centre",
        subItems: [
            {
                subItem: "Evaluations",
                subItemLink: "/evaluation/evaluations",
            },
            {
                subItem: "Evaluation tool",
                subItemLink: "/evaluation/evaluation-tool",
            },
        ],
    },
    {
        icon: Globe,
        id: "Community Centre",
        title: "Community Centre",
        to: "/community",
    },
    {
        icon: HeadCircuit,
        title: "VSmart AI Tools",
        id: "AI Center",
        to: "/ai-center",
    },
];
