export interface SidebarContentItem {
    id: string;
    type: string;
    title: string;
    url?: string;
    content: string;
    status: string;
    source_type: string;
    slide_description?: string;
    document_title?: string;
    document_url?: string;
    document_path?: string;
    video_url?: string;
    video_description?: string;
    createdAt: Date;
}
