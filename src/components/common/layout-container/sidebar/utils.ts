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
        subItems: [
            {
                subItem: "Tests",
                subItemLink: "/assessment/tests",
            },
            {
                subItem: "Question Papers",
                subItemLink: "/assessment/question-papers",
            },
        ],
    },
];
