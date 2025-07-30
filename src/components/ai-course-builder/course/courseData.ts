export interface Slide {
    id: string;
    name: string;
    type: 'pdf' | 'text' | 'code' | 'youtube' | 'html' | 'assessment' | 'document' | 'video';
    key?: string;
    depth?: number;
    path?: string;
    content?: string;
}

export interface Chapter {
    id: string;
    name: string;
    key?: string;
    depth?: number;
    path?: string;
    slides: Slide[];
}

export interface Module {
    id: string;
    name: string;
    key?: string;
    depth?: number;
    path?: string;
    chapters: Chapter[];
}

export interface Subject {
    id: string;
    name: string;
    key?: string;
    depth?: number;
    path?: string;
    modules: Module[];
}

export const courseData: Subject[] = [
    {
        id: 'subj-3',
        name: 'Introduction to Python',
        modules: [
            {
                id: 'mod-1',
                name: 'Python Fundamentals',
                chapters: [
                    {
                        id: 'chap-1',
                        name: 'Introduction',
                        slides: [
                            { id: 'slide-1', name: 'Course Overview', type: 'pdf' },
                            { id: 'slide-2', name: 'The Power of Python', type: 'video' },
                            { id: 'slide-3', name: 'Further Reading', type: 'document' },
                            { id: 'slide-4', name: 'Initial Assessment', type: 'assessment' },
                        ],
                    },
                ],
            },
        ],
    },
];
