import { SidebarItemsType } from "./types";
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
                subItemLink: "/dashboard/students",
            },
            {
                subItem: "Manage Batches and Sessions",
                subItemLink: "/dashboard/students/manage-batches",
            },
            {
                subItem: "Enroll Requests",
                subItemLink: "/dashboard/students/enroll-requests",
            },
        ],
    },
    {
        icon: BookOpen,
        title: "Study Library",
        to: "/dashboard/study-library",
    },
    {
        icon: Scroll,
        title: "Assessment Centre",
        subItems: [
            {
                subItem: "Tests",
                subItemLink: "/dashboard/assessment/tests",
            },
            {
                subItem: "Question Papers",
                subItemLink: "/dashboard/assessment/question-papers",
            },
        ],
    },
];
