// types/study-library/chapter-sidebar.ts
import { YooptaContentValue } from "@yoopta/editor";

export interface SidebarContentItem {
    id: string;
    type: "pdf" | "video" | "doc";
    name: string;
    url: string;
    content: string | YooptaContentValue; // Allow both string and YooptaContentValue
    createdAt: Date;
}
