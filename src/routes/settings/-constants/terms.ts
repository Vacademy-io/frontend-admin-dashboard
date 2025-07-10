export const CONTENT_TERMS = [
    'Course',
    'Level',
    'Session',
    'Subjects',
    'Modules',
    'Chapters',
    'Slides',
    'LiveSession',
] as const;

export const ROLE_TERMS = [
    'Admin',
    'Teacher',
    'CourseCreator',
    'AssessmentCreator',
    'Evaluator',
    'Learner',
] as const;

export type NamingSettingsType = {
    key: string;
    systemValue: string;
    customValue: string;
};
export const defaultNamingSettings: NamingSettingsType[] = [
    { key: 'Course', systemValue: 'Courses', customValue: 'Course' },
    { key: 'Level', systemValue: 'Level', customValue: 'Level' },
    { key: 'Session', systemValue: 'Session', customValue: 'Session' },
    { key: 'Subjects', systemValue: 'Subjects', customValue: 'Subjects' },
    { key: 'Modules', systemValue: 'Modules', customValue: 'Modules' },
    { key: 'Chapters', systemValue: 'Chapters', customValue: 'Chapters' },
    { key: 'Slides', systemValue: 'Slides', customValue: 'Slides' },
    { key: 'Admin', systemValue: 'Admin', customValue: 'Admin' },
    { key: 'Teacher', systemValue: 'Teacher', customValue: 'Teacher' },
    {
        key: 'CourseCreator',
        systemValue: 'Course Creator',
        customValue: 'Course Creator',
    },
    {
        key: 'AssessmentCreator',
        systemValue: 'Assessment Creator',
        customValue: 'Assessment Creator',
    },
    {
        key: 'Evaluator',
        systemValue: 'Evaluator',
        customValue: 'Evaluator',
    },
    { key: 'Learner', systemValue: 'Learner', customValue: 'Learner' },
    {
        key: 'LiveSession',
        systemValue: 'Live Session',
        customValue: 'Live Session',
    },
];

export const systemValueDescription = {
    Course: 'Course is the top level of the hierarchy. For eg: Mathematics, Science, English',
    Level: 'Levels organize a course into structured learning stages. These stages may represent increasing difficulty, different modules, or key milestones within the course. For eg: Basic, Advanced',
    Session:
        'Sessions organize a course into different batches or time periods. For eg: January 2025 Batch, February 2025 Batch',
    Subjects:
        'Subjects are the topics or subjects covered in a course. For eg: Mathematics, Science, English',
    Modules:
        'Modules are the sub-topics or units within a subject. For eg: Algebra, Geometry, Calculus',
    Chapters: 'Chapters are the sections within a module. For eg: Chapter 1, Chapter 2',
    Slides: 'Slides are the individual slides within a chapter. For eg: Slide 1, Slide 2',
    Admin: 'Admin is the user role that has access to all the features of the platform. For eg: Admin, Super Admin',
    Teacher:
        'Teacher is the user role that can teach the courses of the platform. For eg: Teacher, Instructor',
    CourseCreator:
        'Course Creator is the user role that can has access to create courses of the platform. For eg: Course Creator, Instructor',
    AssessmentCreator:
        'Assessment Creator is the user role that can has access to create assessments of the platform. For eg: Assessment Creator, Instructor',
    Evaluator:
        'Evaluator is the user role that can has access to evaluate the assessments of the platform. For eg: Evaluator, Instructor',
    Learner:
        'Student is the user role that can has access to the courses of the platform. For eg: Student, Learner',
    LiveSession: 'Live Session of the course. For eg: Live Session 1, Live Session 2',
};
