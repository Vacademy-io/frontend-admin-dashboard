export interface SidebarContentItem {
    id: string;
    type: "pdf" | "video" | "doc";
    name: string;
    url: string;
    createdAt: Date;
}
