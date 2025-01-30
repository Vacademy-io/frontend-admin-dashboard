export interface Chapter {
    id: string;
    chapter_name: string;
    status: string;
    file_id: string;
    description: string;
    chapter_order: number;
}

export interface Module {
    id: string;
    module_name: string;
    status: string;
    description: string;
    thumbnail_id: string;
}

export interface ModulesWithChapters {
    module: Module;
    chapters: Chapter[];
}
