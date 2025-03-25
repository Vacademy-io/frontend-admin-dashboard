import { House, Users, BookOpen, Scroll, Globe } from "@phosphor-icons/react";
import { SidebarItemsType } from "../../../../types/layout-container/layout-container-types";

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
            // {
            //     subItem: "Manage Batches and Sessions",
            //     subItemLink: "/students/manage-batches",
            // },
            // {
            //     subItem: "Enroll Requests",
            //     subItemLink: "/students/enroll-requests",
            // },
        ],
    },
    {
        icon: BookOpen,
        title: "Learning Center",
        id: "study-library",
        to: "/study-library",
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
                subItem: "Present",
                subItemLink: "/study-library/present",
            },
        ],
    },
    {
        icon: Scroll,
        title: "Assessment Centre",
        id: "assessment-centre",
        to: "/assessment",
        subItems: [
            {
                subItem: "Assessment List",
                subItemLink: "/assessment/assessment-list",
            },
            {
                subItem: "Question Papers",
                subItemLink: "/assessment/question-papers",
            },
        ],
    },
    {
        icon: Globe,
        id: "Community Centre",
        title: "Community Centre",
        to: "/community",
    },
];
