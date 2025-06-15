import { Steps } from '@phosphor-icons/react';
import { useRouter } from '@tanstack/react-router';
import {
    ChalkboardTeacher,
    Clock,
    Code,
    File,
    FileDoc,
    FilePdf,
    PlayCircle,
    Question,
    Plus,
    CaretDown,
    CaretRight,
    Export,
} from 'phosphor-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import {
    CourseDetailsFormValues,
    courseDetailsSchema,
    transformApiDataToCourseData,
} from './course-details-schema';
import { useStudyLibraryStore } from '@/stores/study-library/use-study-library-store';
import { useGetPackageSessionId } from '@/utils/helpers/study-library-helpers.ts/get-list-from-stores/getPackageSessionId';
import { useAddSubject } from '../subjects/-services/addSubject';
import { useAddModule } from '../subjects/modules/-services/add-module';
import { useAddChapter } from '../subjects/modules/chapters/-services/add-chapter';
import {
    fetchModulesWithChapters,
    handleFetchModulesWithChapters,
} from '../../-services/getModulesWithChapters';
import {
    fetchChaptersWithSlides,
    handleFetchChaptersWithSlides,
    VideoSlide,
    DocumentSlide,
    QuestionSlide,
    AssignmentSlide,
    ChapterWithSlides,
} from '../../-services/getAllSlides';
import { useSuspenseQuery, useQueries } from '@tanstack/react-query';
import { useModulesWithChaptersQuery } from '../../-services/getModulesWithChapters';

type DialogType = 'subject' | 'module' | 'chapter' | 'slide' | null;

type SlideType = {
    id: string;
    name: string;
    type: string;
    description: string;
    status: string;
    order: number;
    videoSlide?: VideoSlide;
    documentSlide?: DocumentSlide;
    questionSlide?: QuestionSlide;
    assignmentSlide?: AssignmentSlide;
};

type ChapterType = {
    id: string;
    name: string;
    status: string;
    file_id: string;
    description: string;
    chapter_order: number;
    slides: SlideType[];
    isOpen?: boolean;
};

type ModuleType = {
    id: string;
    name: string;
    description: string;
    status: string;
    thumbnail_id: string;
    chapters: ChapterType[];
    isOpen?: boolean;
};

type SubjectType = {
    id: string;
    subject_name: string;
    subject_code: string;
    credit: number;
    thumbnail_id: string | null;
    created_at: string | null;
    updated_at: string | null;
    modules: ModuleType[];
};

type CourseStructure = {
    courseName: string;
    items: SubjectType[] | ModuleType[] | SlideType[];
};

type Course = {
    id: string;
    title: string;
    level: 1 | 2 | 3 | 4 | 5;
    structure: CourseStructure;
};

type LevelType = {
    id: string;
    name: string;
    duration_in_days: number;
    subjects: SubjectType[];
};

type SessionType = {
    sessionDetails: {
        id: string;
        session_name: string;
    };
    levelDetails: LevelType[];
};

type ModuleResponse = {
    module: {
        id: string;
        module_name: string;
        description: string;
        status: string;
        thumbnail_id: string;
    };
};

const mockCourses: Course[] = [
    {
        id: '1',
        title: '2-Level Course Structure',
        level: 2,
        structure: {
            courseName: 'Introduction to Web Development',
            items: [] as SlideType[],
        },
    },
    {
        id: '2',
        title: '3-Level Course Structure',
        level: 3,
        structure: {
            courseName: 'Frontend Fundamentals',
            items: [] as SlideType[],
        },
    },
    {
        id: '3',
        title: '4-Level Course Structure',
        level: 4,
        structure: {
            courseName: 'Full-Stack JavaScript Development Mastery',
            items: [] as ModuleType[],
        },
    },
    {
        id: '4',
        title: '5-Level Course Structure',
        level: 5,
        structure: {
            courseName: 'Advanced Software Engineering Principles',
            items: [] as SubjectType[],
        },
    },
];

export const CourseDetailsPage = () => {
    const router = useRouter();
    const searchParams = router.state.location.search;

    const { studyLibraryData } = useStudyLibraryStore();

    const courseDetailsData = useMemo(() => {
        return studyLibraryData?.find((item) => item.course.id === searchParams.courseId);
    }, [studyLibraryData]);

    const form = useForm<CourseDetailsFormValues>({
        resolver: zodResolver(courseDetailsSchema),
        defaultValues: {
            courseData: {
                id: '',
                title: '',
                description: '',
                tags: [],
                imageUrl: '',
                courseStructure: 1,
                whatYoullLearn: '',
                whyLearn: '',
                whoShouldLearn: '',
                aboutTheCourse: '',
                packageName: '',
                status: '',
                isCoursePublishedToCatalaouge: false,
                coursePreviewImageMediaId: '',
                courseBannerMediaId: '',
                courseMediaId: '',
                courseHtmlDescription: '',
                instructors: [],
                sessions: [],
            },
            mockCourses: [],
        },
        mode: 'onChange',
    });

    const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});

    const [selectedCourse, setSelectedCourse] = useState<Course | undefined>(() => {
        const mockCourses = form.getValues('mockCourses');
        const courseStructure = form.getValues('courseData').courseStructure;
        return mockCourses.find((course) => course.level === courseStructure) as Course | undefined;
    });
    const [dialogType, setDialogType] = useState<DialogType>(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [newItemName, setNewItemName] = useState('');
    const [selectedParentId, setSelectedParentId] = useState<string>('');

    const getInitials = (email: string) => {
        const name = email.split('@')[0];
        return name?.slice(0, 2).toUpperCase();
    };

    const [selectedSession, setSelectedSession] = useState<string>('');
    const [selectedLevel, setSelectedLevel] = useState<string>('');
    const [levelOptions, setLevelOptions] = useState<
        { _id: string; value: string; label: string }[]
    >([]);
    const [isLoadingModules, setIsLoadingModules] = useState(false);

    // Get current session and level IDs
    const currentSession = form
        .getValues('courseData')
        .sessions.find((session) => session.sessionDetails.id === selectedSession);
    const currentLevel = currentSession?.levelDetails.find((level) => level.id === selectedLevel);

    const packageSessionIds =
        useGetPackageSessionId(
            searchParams.courseId ?? '',
            currentSession?.sessionDetails.id ?? '',
            currentLevel?.id ?? ''
        ) || '';

    const addSubjectMutation = useAddSubject();
    const addModuleMutation = useAddModule();
    const addChapterMutation = useAddChapter();

    // Convert sessions to select options format
    const sessionOptions = useMemo(() => {
        const sessions = form.getValues('courseData')?.sessions || [];
        return sessions.map((session) => ({
            _id: session.sessionDetails.id,
            value: session.sessionDetails.id,
            label: session.sessionDetails.session_name,
        }));
    }, [form.watch('courseData.sessions')]);

    // Update level options when session changes
    const handleSessionChange = (sessionId: string) => {
        setSelectedSession(sessionId);
        const sessions = form.getValues('courseData')?.sessions || [];
        const selectedSessionData = sessions.find(
            (session) => session.sessionDetails.id === sessionId
        );

        if (selectedSessionData) {
            const newLevelOptions = selectedSessionData.levelDetails.map((level) => ({
                _id: level.id,
                value: level.id,
                label: level.name,
            }));
            setLevelOptions(newLevelOptions);

            // Select the first level when session changes
            if (newLevelOptions.length > 0 && newLevelOptions[0]?.value) {
                setSelectedLevel(newLevelOptions[0].value);
            } else {
                setSelectedLevel('');
            }
        }
    };

    // Move query logic outside useEffect
    const moduleQueries = useQueries({
        queries: ((currentLevel?.subjects as unknown as SubjectType[]) || []).map((subject) => ({
            ...handleFetchModulesWithChapters(subject.id, packageSessionIds),
            enabled: !!subject.id && !!packageSessionIds,
        })),
    });

    // Add chapter queries for each module
    const chapterQueries = useQueries({
        queries: moduleQueries.flatMap((moduleQuery) => {
            const modules = (moduleQuery.data as ModuleResponse[]) || [];
            return modules.map((module) => ({
                ...handleFetchChaptersWithSlides(module.module.id, packageSessionIds),
                enabled: !!module.module.id && !!packageSessionIds,
            }));
        }),
    });

    // Extract stable data from queries
    const moduleData = useMemo(() => {
        return moduleQueries.map((query) => query.data).filter(Boolean);
    }, [moduleQueries.map((q) => q.data).join(',')]);

    const chapterData = useMemo(() => {
        return chapterQueries.map((query) => query.data).filter(Boolean);
    }, [chapterQueries.map((q) => q.data).join(',')]);

    // Memoize the loading state using stable references
    const isLoading = useMemo(() => {
        return (
            moduleQueries.some((query) => query.isLoading) ||
            chapterQueries.some((query) => query.isLoading)
        );
    }, [
        moduleQueries.map((q) => q.isLoading).join(','),
        chapterQueries.map((q) => q.isLoading).join(','),
    ]);

    useEffect(() => {
        const fetchModulesAndChapters = async () => {
            if (currentLevel?.subjects && packageSessionIds && !isLoadingModules && !isLoading) {
                setIsLoadingModules(true);
                try {
                    // Process the results from moduleQueries
                    const subjectPromises = (currentLevel.subjects as unknown as SubjectType[]).map(
                        async (subject, subjectIndex) => {
                            if (!subject.id) return subject;

                            const response = moduleData[subjectIndex];

                            if (response) {
                                // For each module, get its chapters from chapterQueries
                                const modulesWithChaptersAndSlides = await Promise.all(
                                    (response as ModuleResponse[]).map(
                                        async (item, moduleIndex) => {
                                            // Calculate the index in chapterQueries
                                            const chapterQueryIndex =
                                                subjectIndex * response.length + moduleIndex;
                                            const chaptersWithSlides =
                                                chapterData[chapterQueryIndex] || [];

                                            return {
                                                id: item.module.id,
                                                name: item.module.module_name,
                                                description: item.module.description,
                                                status: item.module.status,
                                                thumbnail_id: item.module.thumbnail_id,
                                                chapters: chaptersWithSlides.map(
                                                    (chapterWithSlides: ChapterWithSlides) => ({
                                                        id: chapterWithSlides.chapter.id,
                                                        name: chapterWithSlides.chapter
                                                            .chapter_name,
                                                        status: chapterWithSlides.chapter.status,
                                                        file_id: chapterWithSlides.chapter.file_id,
                                                        description:
                                                            chapterWithSlides.chapter.description,
                                                        chapter_order:
                                                            chapterWithSlides.chapter.chapter_order,
                                                        slides: (
                                                            chapterWithSlides.slides || []
                                                        ).map((slide) => ({
                                                            id: slide.id,
                                                            name: slide.title,
                                                            type: slide.source_type,
                                                            description: slide.description || '',
                                                            status: slide.status || '',
                                                            order: slide.slide_order || 0,
                                                            videoSlide: slide.video_slide || null,
                                                            documentSlide:
                                                                slide.document_slide || null,
                                                            questionSlide:
                                                                slide.question_slide || null,
                                                            assignmentSlide:
                                                                slide.assignment_slide || null,
                                                        })),
                                                        isOpen: false,
                                                    })
                                                ),
                                                isOpen: false,
                                            };
                                        }
                                    )
                                );

                                // Update the subject with the modules
                                return {
                                    ...subject,
                                    modules: modulesWithChaptersAndSlides,
                                };
                            }
                            return subject;
                        }
                    );

                    const updatedSubjects = await Promise.all(subjectPromises);

                    // Update the form with new subjects
                    const updatedSessions = form.getValues('courseData').sessions.map((session) => {
                        if (session.sessionDetails.id === selectedSession) {
                            return {
                                ...session,
                                levelDetails: session.levelDetails.map((level) => {
                                    if (level.id === selectedLevel) {
                                        return {
                                            ...level,
                                            subjects: updatedSubjects,
                                        };
                                    }
                                    return level;
                                }),
                            };
                        }
                        return session;
                    });

                    form.setValue('courseData.sessions', updatedSessions);
                } catch (error) {
                    console.error('Error fetching modules and chapters:', error);
                } finally {
                    setIsLoadingModules(false);
                }
            }
        };

        fetchModulesAndChapters();
    }, [selectedSession, selectedLevel, moduleData, chapterData, packageSessionIds, isLoading]);

    // Modified toggle function to handle hierarchical closing
    const toggleExpand = (id: string) => {
        setExpandedItems((prev) => {
            const newState = { ...prev };
            const isExpanding = !prev[id];

            if (!isExpanding) {
                // When closing, only close children of the current item
                Object.keys(prev).forEach((key) => {
                    if (key.startsWith(`${id}-`)) {
                        newState[key] = false;
                    }
                });
            }
            newState[id] = !prev[id];
            return newState;
        });
    };

    const handleAddClick = (type: DialogType, parentId?: string) => {
        setDialogType(type);
        setSelectedParentId(parentId || '');
        setDialogOpen(true);
        setNewItemName('');
    };

    const updateSelectedCourseAndForm = useCallback(
        (newCourse: Course | undefined) => {
            if (!newCourse) {
                setSelectedCourse(undefined);
                return;
            }

            // Update local state
            setSelectedCourse(newCourse);

            // Update form immediately
            const currentMockCourses = form.getValues('mockCourses');
            const updatedMockCourses = currentMockCourses.map((mockCourse) => {
                if (mockCourse.level === newCourse.level) {
                    return { ...newCourse };
                }
                return mockCourse;
            });

            form.setValue('mockCourses', updatedMockCourses);
        },
        [form]
    );

    const handleAddItem = async () => {
        if (!newItemName.trim() || !selectedCourse) return;

        const newId = crypto.randomUUID();

        switch (dialogType) {
            case 'subject': {
                try {
                    const newSubject: SubjectType = {
                        id: '', // Let backend assign ID
                        subject_name: newItemName,
                        subject_code: '',
                        credit: 0,
                        thumbnail_id: '',
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString(),
                        modules: [], // Add empty modules array
                    };

                    const response = await addSubjectMutation.mutateAsync({
                        subject: newSubject,
                        packageSessionIds,
                    });

                    if (response) {
                        const updatedCourse: Course = {
                            ...selectedCourse,
                            structure: {
                                ...selectedCourse.structure,
                                items: [
                                    ...(selectedCourse.structure.items as SubjectType[]),
                                    {
                                        id: response.data.id,
                                        subject_name: response.data.subject_name,
                                        subject_code: '',
                                        credit: 0,
                                        thumbnail_id: '',
                                        created_at: new Date().toISOString(),
                                        updated_at: new Date().toISOString(),
                                        modules: [],
                                    },
                                ],
                            },
                        };

                        updateSelectedCourseAndForm(updatedCourse);
                    }
                } catch (error) {
                    console.error('Error adding subject:', error);
                }
                break;
            }

            case 'module': {
                try {
                    const newModule = {
                        id: '', // Let the backend assign the ID
                        module_name: newItemName,
                        description: '',
                        status: '',
                        thumbnail_id: '',
                    };

                    if (selectedCourse.level === 4) {
                        const response = await addModuleMutation.mutateAsync({
                            subjectId: selectedParentId,
                            module: newModule,
                        });

                        if (response) {
                            const updatedCourse = {
                                ...selectedCourse,
                                structure: {
                                    ...selectedCourse.structure,
                                    items: [
                                        ...(selectedCourse.structure.items as ModuleType[]),
                                        {
                                            id: response.data.id,
                                            name: newItemName,
                                            chapters: [],
                                            isOpen: false,
                                        },
                                    ],
                                },
                            };
                            updateSelectedCourseAndForm(updatedCourse);
                        }
                    } else if (selectedCourse.level === 5 && selectedParentId) {
                        // For level 5, selectedParentId is the subject ID
                        const response = await addModuleMutation.mutateAsync({
                            subjectId: selectedParentId,
                            module: newModule,
                        });

                        if (response) {
                            // Update the current level's subjects
                            const currentSession = form
                                .getValues('courseData')
                                .sessions.find(
                                    (session) => session.sessionDetails.id === selectedSession
                                );
                            const currentLevel = currentSession?.levelDetails.find(
                                (level) => level.id === selectedLevel
                            );

                            if (currentLevel) {
                                const updatedSubjects = currentLevel.subjects.map((subject) => {
                                    if (subject.id === selectedParentId) {
                                        return {
                                            ...subject,
                                            modules: [
                                                ...(subject.modules || []),
                                                {
                                                    id: response.data.id,
                                                    name: newItemName,
                                                    chapters: [],
                                                    isOpen: false,
                                                },
                                            ],
                                        };
                                    }
                                    return subject;
                                });

                                // Update the form with new subjects
                                const updatedSessions = form
                                    .getValues('courseData')
                                    .sessions.map((session) => {
                                        if (session.sessionDetails.id === selectedSession) {
                                            return {
                                                ...session,
                                                levelDetails: session.levelDetails.map((level) => {
                                                    if (level.id === selectedLevel) {
                                                        return {
                                                            ...level,
                                                            subjects: updatedSubjects,
                                                        };
                                                    }
                                                    return level;
                                                }),
                                            };
                                        }
                                        return session;
                                    });

                                form.setValue('courseData.sessions', updatedSessions);
                            }
                        }
                    }
                } catch (error) {
                    console.error('Error adding module:', error);
                }
                break;
            }

            case 'chapter': {
                if (selectedParentId) {
                    try {
                        const newChapter = {
                            id: '', // Let backend assign ID
                            chapter_name: newItemName,
                            status: 'true',
                            file_id: '',
                            description:
                                'Click to view and access eBooks and video lectures for this chapter.',
                            chapter_order: 0,
                        };

                        if (selectedCourse.level === 5) {
                            const [subjectId, moduleId] = selectedParentId.split('|');
                            const response = await addChapterMutation.mutateAsync({
                                moduleId,
                                commaSeparatedPackageSessionIds: packageSessionIds,
                                chapter: newChapter,
                            });

                            if (response) {
                                // Get current form data
                                const formData = form.getValues('courseData');
                                const currentSession = formData.sessions.find(
                                    (session) => session.sessionDetails.id === selectedSession
                                );
                                const currentLevel = currentSession?.levelDetails.find(
                                    (level) => level.id === selectedLevel
                                );

                                if (currentLevel && currentLevel.subjects) {
                                    // Fetch fresh module data for all subjects
                                    const modulePromises = currentLevel.subjects.map(
                                        async (subject) => {
                                            const moduleQuery = handleFetchModulesWithChapters(
                                                subject.id,
                                                packageSessionIds
                                            );
                                            const moduleResponse = await moduleQuery.queryFn();
                                            return {
                                                subjectId: subject.id,
                                                modules: moduleResponse,
                                            };
                                        }
                                    );

                                    const moduleResults = await Promise.all(modulePromises);

                                    // Fetch fresh chapter data for all modules
                                    const chapterPromises = moduleResults.flatMap(
                                        ({ subjectId, modules }) =>
                                            modules.map(async (module) => {
                                                const chapterQuery = handleFetchChaptersWithSlides(
                                                    module.module.id,
                                                    packageSessionIds
                                                );
                                                const chapterResponse =
                                                    await chapterQuery.queryFn();
                                                return {
                                                    subjectId,
                                                    moduleId: module.module.id,
                                                    chapters: chapterResponse,
                                                };
                                            })
                                    );

                                    const chapterResults = await Promise.all(chapterPromises);

                                    // Update subjects with fresh module and chapter data
                                    const updatedSubjects = currentLevel.subjects.map((subject) => {
                                        const subjectModules =
                                            moduleResults.find(
                                                (result) => result.subjectId === subject.id
                                            )?.modules || [];

                                        return {
                                            ...subject,
                                            modules: subjectModules.map((moduleData) => {
                                                const moduleChapters =
                                                    chapterResults.find(
                                                        (result) =>
                                                            result.subjectId === subject.id &&
                                                            result.moduleId === moduleData.module.id
                                                    )?.chapters || [];

                                                return {
                                                    id: moduleData.module.id,
                                                    name: moduleData.module.module_name,
                                                    description: moduleData.module.description,
                                                    status: moduleData.module.status,
                                                    thumbnail_id: moduleData.module.thumbnail_id,
                                                    chapters: moduleChapters.map(
                                                        (chapterWithSlides) => ({
                                                            id: chapterWithSlides.chapter.id,
                                                            name: chapterWithSlides.chapter
                                                                .chapter_name,
                                                            status: chapterWithSlides.chapter
                                                                .status,
                                                            file_id:
                                                                chapterWithSlides.chapter.file_id,
                                                            description:
                                                                chapterWithSlides.chapter
                                                                    .description,
                                                            chapter_order:
                                                                chapterWithSlides.chapter
                                                                    .chapter_order,
                                                            slides: (
                                                                chapterWithSlides.slides || []
                                                            ).map((slide) => ({
                                                                id: slide.id,
                                                                name: slide.title,
                                                                type: slide.source_type,
                                                                description:
                                                                    slide.description || '',
                                                                status: slide.status || '',
                                                                order: slide.slide_order || 0,
                                                                videoSlide:
                                                                    slide.video_slide || null,
                                                                documentSlide:
                                                                    slide.document_slide || null,
                                                                questionSlide:
                                                                    slide.question_slide || null,
                                                                assignmentSlide:
                                                                    slide.assignment_slide || null,
                                                            })),
                                                            isOpen: false,
                                                        })
                                                    ),
                                                    isOpen: false,
                                                };
                                            }),
                                        };
                                    });

                                    // Update the form with the new subjects
                                    const updatedSessions = formData.sessions.map((session) => {
                                        if (session.sessionDetails.id === selectedSession) {
                                            return {
                                                ...session,
                                                levelDetails: session.levelDetails.map((level) => {
                                                    if (level.id === selectedLevel) {
                                                        return {
                                                            ...level,
                                                            subjects: updatedSubjects,
                                                        };
                                                    }
                                                    return level;
                                                }),
                                            };
                                        }
                                        return session;
                                    });

                                    // Update the form with the new sessions
                                    form.setValue('courseData.sessions', updatedSessions);
                                }
                            }
                        } else if (selectedCourse.level === 4) {
                            const moduleId = selectedParentId;
                            const response = await addChapterMutation.mutateAsync({
                                moduleId,
                                commaSeparatedPackageSessionIds: packageSessionIds,
                                chapter: newChapter,
                            });

                            if (response) {
                                // Fetch fresh chapter data using the module ID
                                const chapterQuery = handleFetchChaptersWithSlides(
                                    moduleId,
                                    packageSessionIds
                                );
                                const chapterResponse = await chapterQuery.queryFn();

                                const updatedCourse = {
                                    ...selectedCourse,
                                    structure: {
                                        ...selectedCourse.structure,
                                        items: (selectedCourse.structure.items as ModuleType[]).map(
                                            (module) => {
                                                if (module.id === moduleId) {
                                                    return {
                                                        ...module,
                                                        chapters: chapterResponse.map(
                                                            (
                                                                chapterWithSlides: ChapterWithSlides
                                                            ) => ({
                                                                id: chapterWithSlides.chapter.id,
                                                                name: chapterWithSlides.chapter
                                                                    .chapter_name,
                                                                status: chapterWithSlides.chapter
                                                                    .status,
                                                                file_id:
                                                                    chapterWithSlides.chapter
                                                                        .file_id,
                                                                description:
                                                                    chapterWithSlides.chapter
                                                                        .description,
                                                                chapter_order:
                                                                    chapterWithSlides.chapter
                                                                        .chapter_order,
                                                                slides: (
                                                                    chapterWithSlides.slides || []
                                                                ).map((slide) => ({
                                                                    id: slide.id,
                                                                    name: slide.title,
                                                                    type: slide.source_type,
                                                                    description:
                                                                        slide.description || '',
                                                                    status: slide.status || '',
                                                                    order: slide.slide_order || 0,
                                                                    videoSlide:
                                                                        slide.video_slide || null,
                                                                    documentSlide:
                                                                        slide.document_slide ||
                                                                        null,
                                                                    questionSlide:
                                                                        slide.question_slide ||
                                                                        null,
                                                                    assignmentSlide:
                                                                        slide.assignment_slide ||
                                                                        null,
                                                                })),
                                                                isOpen: false,
                                                            })
                                                        ),
                                                    };
                                                }
                                                return module;
                                            }
                                        ),
                                    },
                                };
                                updateSelectedCourseAndForm(updatedCourse);
                            }
                        } else if (selectedCourse.level === 3) {
                            const response = await addChapterMutation.mutateAsync({
                                moduleId: selectedParentId,
                                commaSeparatedPackageSessionIds: packageSessionIds,
                                chapter: newChapter,
                            });

                            if (response) {
                                // Fetch fresh chapter data using the module ID
                                const chapterQuery = handleFetchChaptersWithSlides(
                                    selectedParentId,
                                    packageSessionIds
                                );
                                const chapterResponse = await chapterQuery.queryFn();

                                const updatedCourse = {
                                    ...selectedCourse,
                                    structure: {
                                        ...selectedCourse.structure,
                                        items: chapterResponse.map(
                                            (chapterWithSlides: ChapterWithSlides) => ({
                                                id: chapterWithSlides.chapter.id,
                                                name: chapterWithSlides.chapter.chapter_name,
                                                status: chapterWithSlides.chapter.status,
                                                file_id: chapterWithSlides.chapter.file_id,
                                                description: chapterWithSlides.chapter.description,
                                                chapter_order:
                                                    chapterWithSlides.chapter.chapter_order,
                                                slides: (chapterWithSlides.slides || []).map(
                                                    (slide) => ({
                                                        id: slide.id,
                                                        name: slide.title,
                                                        type: slide.source_type,
                                                        description: slide.description || '',
                                                        status: slide.status || '',
                                                        order: slide.slide_order || 0,
                                                        videoSlide: slide.video_slide || null,
                                                        documentSlide: slide.document_slide || null,
                                                        questionSlide: slide.question_slide || null,
                                                        assignmentSlide:
                                                            slide.assignment_slide || null,
                                                    })
                                                ),
                                                isOpen: false,
                                            })
                                        ),
                                    },
                                };
                                updateSelectedCourseAndForm(updatedCourse);
                            }
                        }
                    } catch (error) {
                        console.error('Error adding chapter:', error);
                    }
                }
                break;
            }

            case 'slide': {
                if (selectedParentId) {
                    const parts = selectedParentId.split('|');
                    let subjectId = '',
                        moduleId = '',
                        chapterId = '';

                    if (selectedCourse.level === 5) {
                        [subjectId = '', moduleId = '', chapterId = ''] = parts;
                    } else if (selectedCourse.level === 4) {
                        [moduleId = '', chapterId = ''] = parts;
                    } else if (selectedCourse.level === 3) {
                        [chapterId = ''] = parts;
                    }

                    try {
                        if (selectedCourse.level === 5) {
                            // Get current form data
                            const formData = form.getValues('courseData');
                            const currentSession = formData.sessions.find(
                                (session) => session.sessionDetails.id === selectedSession
                            );
                            const currentLevel = currentSession?.levelDetails.find(
                                (level) => level.id === selectedLevel
                            );

                            if (currentLevel && currentLevel.subjects) {
                                // Fetch fresh module data for all subjects
                                const modulePromises = currentLevel.subjects.map(
                                    async (subject) => {
                                        const moduleQuery = handleFetchModulesWithChapters(
                                            subject.id,
                                            packageSessionIds
                                        );
                                        const moduleResponse = await moduleQuery.queryFn();
                                        return { subjectId: subject.id, modules: moduleResponse };
                                    }
                                );

                                const moduleResults = await Promise.all(modulePromises);

                                // Fetch fresh chapter data for all modules
                                const chapterPromises = moduleResults.flatMap(
                                    ({ subjectId, modules }) =>
                                        modules.map(async (module) => {
                                            const chapterQuery = handleFetchChaptersWithSlides(
                                                module.module.id,
                                                packageSessionIds
                                            );
                                            const chapterResponse = await chapterQuery.queryFn();
                                            return {
                                                subjectId,
                                                moduleId: module.module.id,
                                                chapters: chapterResponse,
                                            };
                                        })
                                );

                                const chapterResults = await Promise.all(chapterPromises);

                                // Update subjects with fresh module and chapter data
                                const updatedSubjects = currentLevel.subjects.map((subject) => {
                                    const subjectModules =
                                        moduleResults.find(
                                            (result) => result.subjectId === subject.id
                                        )?.modules || [];

                                    return {
                                        ...subject,
                                        modules: subjectModules.map((moduleData) => {
                                            const moduleChapters =
                                                chapterResults.find(
                                                    (result) =>
                                                        result.subjectId === subject.id &&
                                                        result.moduleId === moduleData.module.id
                                                )?.chapters || [];

                                            return {
                                                id: moduleData.module.id,
                                                name: moduleData.module.module_name,
                                                description: moduleData.module.description,
                                                status: moduleData.module.status,
                                                thumbnail_id: moduleData.module.thumbnail_id,
                                                chapters: moduleChapters.map(
                                                    (chapterWithSlides) => ({
                                                        id: chapterWithSlides.chapter.id,
                                                        name: chapterWithSlides.chapter
                                                            .chapter_name,
                                                        status: chapterWithSlides.chapter.status,
                                                        file_id: chapterWithSlides.chapter.file_id,
                                                        description:
                                                            chapterWithSlides.chapter.description,
                                                        chapter_order:
                                                            chapterWithSlides.chapter.chapter_order,
                                                        slides: (
                                                            chapterWithSlides.slides || []
                                                        ).map((slide) => ({
                                                            id: slide.id,
                                                            name: slide.title,
                                                            type: slide.source_type,
                                                            description: slide.description || '',
                                                            status: slide.status || '',
                                                            order: slide.slide_order || 0,
                                                            videoSlide: slide.video_slide || null,
                                                            documentSlide:
                                                                slide.document_slide || null,
                                                            questionSlide:
                                                                slide.question_slide || null,
                                                            assignmentSlide:
                                                                slide.assignment_slide || null,
                                                        })),
                                                        isOpen: false,
                                                    })
                                                ),
                                                isOpen: false,
                                            };
                                        }),
                                    };
                                });

                                // Update the form with the new subjects
                                const updatedSessions = formData.sessions.map((session) => {
                                    if (session.sessionDetails.id === selectedSession) {
                                        return {
                                            ...session,
                                            levelDetails: session.levelDetails.map((level) => {
                                                if (level.id === selectedLevel) {
                                                    return {
                                                        ...level,
                                                        subjects: updatedSubjects,
                                                    };
                                                }
                                                return level;
                                            }),
                                        };
                                    }
                                    return session;
                                });

                                // Update the form with the new sessions
                                form.setValue('courseData.sessions', updatedSessions);
                            }
                        } else if (selectedCourse.level === 4) {
                            const chapterQuery = handleFetchChaptersWithSlides(
                                moduleId,
                                packageSessionIds
                            );
                            const chapterResponse = await chapterQuery.queryFn();

                            const updatedCourse = {
                                ...selectedCourse,
                                structure: {
                                    ...selectedCourse.structure,
                                    items: (selectedCourse.structure.items as ModuleType[]).map(
                                        (module) => {
                                            if (module.id === moduleId) {
                                                return {
                                                    ...module,
                                                    chapters: chapterResponse.map(
                                                        (chapterWithSlides: ChapterWithSlides) => ({
                                                            id: chapterWithSlides.chapter.id,
                                                            name: chapterWithSlides.chapter
                                                                .chapter_name,
                                                            status: chapterWithSlides.chapter
                                                                .status,
                                                            file_id:
                                                                chapterWithSlides.chapter.file_id,
                                                            description:
                                                                chapterWithSlides.chapter
                                                                    .description,
                                                            chapter_order:
                                                                chapterWithSlides.chapter
                                                                    .chapter_order,
                                                            slides: (
                                                                chapterWithSlides.slides || []
                                                            ).map((slide) => ({
                                                                id: slide.id,
                                                                name: slide.title,
                                                                type: slide.source_type,
                                                                description:
                                                                    slide.description || '',
                                                                status: slide.status || '',
                                                                order: slide.slide_order || 0,
                                                                videoSlide:
                                                                    slide.video_slide || null,
                                                                documentSlide:
                                                                    slide.document_slide || null,
                                                                questionSlide:
                                                                    slide.question_slide || null,
                                                                assignmentSlide:
                                                                    slide.assignment_slide || null,
                                                            })),
                                                            isOpen: false,
                                                        })
                                                    ),
                                                };
                                            }
                                            return module;
                                        }
                                    ),
                                },
                            };
                            updateSelectedCourseAndForm(updatedCourse);
                        } else if (selectedCourse.level === 3) {
                            const chapterQuery = handleFetchChaptersWithSlides(
                                selectedParentId,
                                packageSessionIds
                            );
                            const chapterResponse = await chapterQuery.queryFn();

                            const updatedCourse = {
                                ...selectedCourse,
                                structure: {
                                    ...selectedCourse.structure,
                                    items: chapterResponse.map(
                                        (chapterWithSlides: ChapterWithSlides) => ({
                                            id: chapterWithSlides.chapter.id,
                                            name: chapterWithSlides.chapter.chapter_name,
                                            status: chapterWithSlides.chapter.status,
                                            file_id: chapterWithSlides.chapter.file_id,
                                            description: chapterWithSlides.chapter.description,
                                            chapter_order: chapterWithSlides.chapter.chapter_order,
                                            slides: (chapterWithSlides.slides || []).map(
                                                (slide) => ({
                                                    id: slide.id,
                                                    name: slide.title,
                                                    type: slide.source_type,
                                                    description: slide.description || '',
                                                    status: slide.status || '',
                                                    order: slide.slide_order || 0,
                                                    videoSlide: slide.video_slide || null,
                                                    documentSlide: slide.document_slide || null,
                                                    questionSlide: slide.question_slide || null,
                                                    assignmentSlide: slide.assignment_slide || null,
                                                })
                                            ),
                                            isOpen: false,
                                        })
                                    ),
                                },
                            };
                            updateSelectedCourseAndForm(updatedCourse);
                        }
                    } catch (error) {
                        console.error('Error fetching updated chapter data:', error);
                    }
                }
                break;
            }
        }

        setDialogOpen(false);
        setNewItemName('');
    };

    const getDialogContent = () => {
        let title = '';
        let description = '';

        switch (dialogType) {
            case 'subject':
                title = 'Add New Subject';
                description = 'Create a new subject for your course.';
                break;
            case 'module':
                title = 'Add New Module';
                description = 'Create a new module within the course.';
                break;
            case 'chapter':
                title = 'Add New Chapter';
                description = 'Create a new chapter.'; // More generic
                break;
            case 'slide':
                title = 'Add New Slide';
                description = 'Create a new slide.'; // More generic
                break;
            default:
                return null;
        }

        return (
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{title}</DialogTitle>
                        <DialogDescription>{description}</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Name</Label>
                            <Input
                                id="name"
                                value={newItemName}
                                onChange={(e) => setNewItemName(e.target.value)}
                                placeholder={`Enter ${dialogType} name`}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleAddItem}>Add {dialogType}</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        );
    };

    const handleAddSlide = (parentId: string) => {
        const parts = parentId.split('|');
        let subjectId = '',
            moduleId = '',
            chapterId = '';

        if (selectedCourse?.level === 5) {
            // For level 5, format is: add|slide|subjectId|moduleId|chapterId
            subjectId = parts[2] || '';
            moduleId = parts[3] || '';
            chapterId = parts[4] || '';
        } else if (selectedCourse?.level === 4) {
            // For level 4, format is: add|slide|moduleId|chapterId
            moduleId = parts[2] || '';
            chapterId = parts[3] || '';
        } else if (selectedCourse?.level === 3) {
            // For level 3, format is: add|slide|chapterId
            chapterId = parts[2] || '';
        }

        const navigationParams = {
            courseId: router.state.location.search.courseId ?? '',
            levelId: selectedLevel,
            subjectId,
            moduleId,
            chapterId,
            slideId: '', // Empty for new slide
            sessionId: selectedSession,
        };

        router.navigate({
            to: '/study-library/courses/course-details/subjects/modules/chapters/slides',
            search: navigationParams,
        });
    };

    const renderTreeItem = (
        label: string,
        id: string,
        hasChildren: boolean,
        level: number,
        isAddButton = false,
        type?: 'subject' | 'module' | 'chapter' | 'slide',
        parentIds?: { subjectId?: string; moduleId?: string; chapterId?: string }
    ) => {
        const handleSlideClick = (e: React.MouseEvent, slideId: string) => {
            e.stopPropagation(); // Prevent event bubbling

            const navigationParams = {
                courseId: router.state.location.search.courseId ?? '',
                levelId: selectedLevel,
                subjectId: parentIds?.subjectId ?? '',
                moduleId: parentIds?.moduleId ?? '',
                chapterId: parentIds?.chapterId ?? '',
                slideId,
                sessionId: selectedSession,
            };

            router.navigate({
                to: '/study-library/courses/course-details/subjects/modules/chapters/slides',
                search: navigationParams,
            });
        };

        const handleExportClick = (e: React.MouseEvent, slideId: string) => {
            e.stopPropagation(); // Prevent event bubbling

            const navigationParams = {
                courseId: router.state.location.search.courseId ?? '',
                levelId: selectedLevel,
                subjectId: parentIds?.subjectId ?? '',
                moduleId: parentIds?.moduleId ?? '',
                chapterId: parentIds?.chapterId ?? '',
                slideId,
                sessionId: selectedSession,
            };

            router.navigate({
                to: '/study-library/courses/course-details/subjects/modules/chapters/slides',
                search: navigationParams,
            });
        };

        return (
            <div
                className={`flex items-center gap-2 py-1 ${isAddButton ? 'text-blue-600 hover:text-blue-700' : ''} ${type === 'slide' ? 'cursor-pointer hover:text-blue-600' : ''}`}
                style={{ paddingLeft: `${level * 20}px` }}
            >
                {!isAddButton && hasChildren && type && (
                    <button onClick={() => toggleExpand(id)} className="p-1">
                        {expandedItems[id] ? (
                            <CaretDown className="size-4" />
                        ) : (
                            <CaretRight className="size-4" />
                        )}
                    </button>
                )}
                {isAddButton ? (
                    <Button
                        variant="ghost"
                        className="h-8 gap-2 p-2 text-sm"
                        onClick={() => {
                            const parts = id.split('|');
                            if (parts[1] === 'subject') {
                                handleAddClick('subject');
                            } else if (parts[1] === 'module') {
                                if (selectedCourse?.level === 4) {
                                    handleAddClick('module');
                                } else if (selectedCourse?.level === 5) {
                                    handleAddClick('module', parts[2]);
                                }
                            } else if (parts[1] === 'chapter') {
                                if (selectedCourse?.level === 4) {
                                    handleAddClick('chapter', parts[2]);
                                } else if (selectedCourse?.level === 5) {
                                    handleAddClick('chapter', `${parts[2]}|${parts[3]}`);
                                } else if (selectedCourse?.level === 3) {
                                    handleAddClick('chapter');
                                }
                            } else if (parts[1] === 'slide') {
                                handleAddSlide(id);
                            }
                        }}
                    >
                        <Plus className="size-4" />
                        {label}
                    </Button>
                ) : (
                    <div className="flex w-full items-center justify-between">
                        <span
                            className="flex items-center gap-2"
                            onClick={type === 'slide' ? (e) => handleSlideClick(e, id) : undefined}
                        >
                            {!hasChildren && <div className="size-4" />}
                            {label}
                        </span>
                        {type === 'slide' && (
                            <button
                                onClick={(e) => handleExportClick(e, id)}
                                className="ml-2 rounded-full p-1 hover:bg-gray-100"
                                title="Export Slide"
                            >
                                <Export className="size-4 text-gray-600" />
                            </button>
                        )}
                    </div>
                )}
            </div>
        );
    };

    const renderCourseStructure = () => {
        if (!selectedCourse) return null;

        // Get current session and level subjects
        const currentSession = (form.getValues('courseData').sessions as SessionType[]).find(
            (session) => session.sessionDetails.id === selectedSession
        );
        const currentLevel = currentSession?.levelDetails.find(
            (level) => level.id === selectedLevel
        );

        switch (selectedCourse.level) {
            case 2:
                // Only slides, flat structure
                return (
                    <div className="rounded-lg border p-4">
                        {renderTreeItem('Add Slide', 'add|slide', false, 0, true)}
                        {(selectedCourse.structure.items as SlideType[]).map((slide) => (
                            <div key={slide.id}>
                                {renderTreeItem(slide.name, slide.id, false, 0, false, 'slide')}
                            </div>
                        ))}
                    </div>
                );

            case 3:
                // Chapters with slides
                return (
                    <div className="rounded-lg border p-4">
                        {renderTreeItem('Add Chapter', 'add|chapter', false, 0, true)}
                        {(selectedCourse.structure.items as ChapterType[]).map((chapter) => (
                            <div key={chapter.id}>
                                {renderTreeItem(
                                    chapter.name,
                                    chapter.id,
                                    true,
                                    0,
                                    false,
                                    'chapter'
                                )}
                                {expandedItems[chapter.id] && (
                                    <>
                                        {renderTreeItem(
                                            'Add Slide',
                                            `add|slide|${chapter.id}`,
                                            false,
                                            1,
                                            true
                                        )}
                                        {chapter.slides.map((slide) => (
                                            <div key={slide.id}>
                                                {renderTreeItem(
                                                    slide.name,
                                                    slide.id,
                                                    false,
                                                    1,
                                                    false,
                                                    'slide',
                                                    { chapterId: chapter.id }
                                                )}
                                            </div>
                                        ))}
                                    </>
                                )}
                            </div>
                        ))}
                    </div>
                );

            case 4:
                // Modules with chapters and slides
                return (
                    <div className="rounded-lg border p-4">
                        {renderTreeItem('Add Module', 'add|module', false, 0, true)}
                        {(selectedCourse.structure.items as ModuleType[]).map((module) => (
                            <div key={module.id}>
                                {renderTreeItem(module.name, module.id, true, 0, false, 'module')}
                                {expandedItems[module.id] && (
                                    <>
                                        {renderTreeItem(
                                            'Add Chapter',
                                            `add|chapter|${module.id}`,
                                            false,
                                            1,
                                            true
                                        )}
                                        {module.chapters?.map((chapter) => (
                                            <div key={chapter.id}>
                                                {renderTreeItem(
                                                    chapter.name,
                                                    `${module.id}|${chapter.id}`,
                                                    true,
                                                    1,
                                                    false,
                                                    'chapter'
                                                )}
                                                {expandedItems[`${module.id}|${chapter.id}`] && (
                                                    <>
                                                        {renderTreeItem(
                                                            'Add Slide',
                                                            `add|slide|${module.id}|${chapter.id}`,
                                                            false,
                                                            2,
                                                            true
                                                        )}
                                                        {chapter.slides.map((slide) => (
                                                            <div key={slide.id}>
                                                                {renderTreeItem(
                                                                    slide.name,
                                                                    slide.id,
                                                                    false,
                                                                    2,
                                                                    false,
                                                                    'slide',
                                                                    {
                                                                        moduleId: module.id,
                                                                        chapterId: chapter.id,
                                                                    }
                                                                )}
                                                            </div>
                                                        ))}
                                                    </>
                                                )}
                                            </div>
                                        ))}
                                    </>
                                )}
                            </div>
                        ))}
                    </div>
                );

            case 5:
                // Subjects with modules, chapters, and slides
                return (
                    <div className="rounded-lg border p-4">
                        {renderTreeItem('Add Subject', 'add|subject', false, 0, true)}
                        {currentLevel?.subjects?.map((subject) => (
                            <div key={subject.id}>
                                {renderTreeItem(
                                    subject.subject_name,
                                    subject.id,
                                    true,
                                    0,
                                    false,
                                    'subject'
                                )}
                                {expandedItems[subject.id] && (
                                    <>
                                        {renderTreeItem(
                                            'Add Module',
                                            `add|module|${subject.id}`,
                                            false,
                                            1,
                                            true
                                        )}
                                        {subject.modules?.map((module) => (
                                            <div key={module.id}>
                                                {renderTreeItem(
                                                    module.name,
                                                    `${subject.id}|${module.id}`,
                                                    true,
                                                    1,
                                                    false,
                                                    'module'
                                                )}
                                                {expandedItems[`${subject.id}|${module.id}`] && (
                                                    <>
                                                        {renderTreeItem(
                                                            'Add Chapter',
                                                            `add|chapter|${subject.id}|${module.id}`,
                                                            false,
                                                            2,
                                                            true
                                                        )}
                                                        {module.chapters?.map((chapter) => (
                                                            <div key={chapter.id}>
                                                                {renderTreeItem(
                                                                    chapter.name,
                                                                    `${subject.id}|${module.id}|${chapter.id}`,
                                                                    true,
                                                                    2,
                                                                    false,
                                                                    'chapter'
                                                                )}
                                                                {expandedItems[
                                                                    `${subject.id}|${module.id}|${chapter.id}`
                                                                ] && (
                                                                    <>
                                                                        {renderTreeItem(
                                                                            'Add Slide',
                                                                            `add|slide|${subject.id}|${module.id}|${chapter.id}`,
                                                                            false,
                                                                            3,
                                                                            true
                                                                        )}
                                                                        {chapter.slides.map(
                                                                            (slide) => (
                                                                                <div key={slide.id}>
                                                                                    {renderTreeItem(
                                                                                        slide.name,
                                                                                        slide.id,
                                                                                        false,
                                                                                        3,
                                                                                        false,
                                                                                        'slide',
                                                                                        {
                                                                                            subjectId:
                                                                                                subject.id,
                                                                                            moduleId:
                                                                                                module.id,
                                                                                            chapterId:
                                                                                                chapter.id,
                                                                                        }
                                                                                    )}
                                                                                </div>
                                                                            )
                                                                        )}
                                                                    </>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </>
                                                )}
                                            </div>
                                        ))}
                                    </>
                                )}
                            </div>
                        ))}
                    </div>
                );
        }
    };

    useEffect(() => {
        const mockCourses = form.getValues('mockCourses');
        const courseStructure = form.getValues('courseData').courseStructure;
        const course = mockCourses.find((course) => course.level === courseStructure) as Course;
        setSelectedCourse(course || undefined);
    }, [form.watch('courseData.courseStructure')]);

    // Set initial session and its levels
    useEffect(() => {
        if (sessionOptions.length > 0 && !selectedSession && sessionOptions[0]?.value) {
            const initialSessionId = sessionOptions[0].value;
            handleSessionChange(initialSessionId);
        }
    }, [sessionOptions]);

    // Update packageSessionIds when either session or level changes
    useEffect(() => {
        if (selectedSession && selectedLevel) {
            const session = form
                .getValues('courseData')
                .sessions.find((s) => s.sessionDetails.id === selectedSession);
            const level = session?.levelDetails.find((l) => l.id === selectedLevel);

            if (session && level) {
                // The packageSessionIds will automatically update due to the useGetPackageSessionId hook
                // which depends on selectedSession and selectedLevel
            }
        }
    }, [selectedSession, selectedLevel]);

    useEffect(() => {
        const loadCourseData = async () => {
            if (courseDetailsData?.course) {
                try {
                    const transformedData = await transformApiDataToCourseData(courseDetailsData);
                    if (transformedData) {
                        form.reset({
                            courseData: transformedData,
                            mockCourses: mockCourses,
                        });
                    }
                } catch (error) {
                    console.error('Error transforming course data:', error);
                }
            }
        };

        loadCourseData();
    }, [courseDetailsData]);

    console.log(form.getValues());

    return (
        <div className="flex min-h-screen flex-col bg-white">
            {/* Top Banner */}
            <div className="relative h-[300px]">
                {!form.watch('courseData').courseBannerMediaId ? (
                    <div className="absolute inset-0 bg-primary-500" />
                ) : (
                    <div className="absolute inset-0">
                        <img
                            src={form.watch('courseData').courseBannerMediaId}
                            alt="Course Banner"
                            className="size-full object-cover"
                            onError={(e) => {
                                e.currentTarget.style.display = 'none';
                                e.currentTarget.parentElement?.classList.add('bg-primary-500');
                            }}
                        />
                    </div>
                )}
                <div className="absolute inset-0 bg-primary-500/70" />{' '}
                {/* Primary color overlay with 70% opacity */}
                <div className="container relative mx-auto px-4 py-12 text-white">
                    <div className="flex items-start justify-between gap-8">
                        {/* Left side - Title and Description */}
                        <div className="max-w-2xl">
                            {!form.watch('courseData').title ? (
                                <div className="space-y-4">
                                    <div className="h-8 w-32 animate-pulse rounded bg-white/20" />
                                    <div className="h-12 w-3/4 animate-pulse rounded bg-white/20" />
                                    <div className="h-4 w-full animate-pulse rounded bg-white/20" />
                                    <div className="h-4 w-2/3 animate-pulse rounded bg-white/20" />
                                </div>
                            ) : (
                                <>
                                    <div className="mb-4 flex gap-2">
                                        {form.getValues('courseData').tags.map((tag, index) => (
                                            <span
                                                key={index}
                                                className="rounded-full bg-blue-600 px-3 py-1 text-sm"
                                            >
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                    <h1 className="mb-4 text-4xl font-bold">
                                        {form.getValues('courseData').title}
                                    </h1>
                                    <p className="text-lg opacity-90">
                                        {form.getValues('courseData').description}
                                    </p>
                                </>
                            )}
                        </div>

                        {/* Right side - Video Player */}
                        <div className="w-[400px] overflow-hidden rounded-lg shadow-xl">
                            <div className="relative aspect-video bg-black">
                                {!form.watch('courseData').courseMediaId ? (
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="flex size-16 items-center justify-center rounded-full bg-white/20">
                                            <svg
                                                className="size-8 text-white"
                                                fill="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path d="M8 5v14l11-7z" />
                                            </svg>
                                        </div>
                                    </div>
                                ) : (
                                    <video
                                        src={form.watch('courseData').courseMediaId}
                                        controls
                                        className="size-full rounded-lg object-contain"
                                        onError={(e) => {
                                            e.currentTarget.style.display = 'none';
                                            e.currentTarget.parentElement?.classList.add(
                                                'bg-black'
                                            );
                                        }}
                                    >
                                        Your browser does not support the video tag.
                                    </video>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="container mx-auto px-4 py-8">
                <div className="flex gap-8">
                    {/* Left Column - 2/3 width */}
                    <div className="w-2/3 grow">
                        {/* Session and Level Selectors */}
                        <div className="container mx-auto px-0 pb-6">
                            <div className="flex items-center gap-6">
                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-medium">Session</label>
                                    <Select
                                        value={selectedSession}
                                        onValueChange={handleSessionChange}
                                    >
                                        <SelectTrigger className="w-48">
                                            <SelectValue placeholder="Select Session" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {sessionOptions.map((option) => (
                                                <SelectItem key={option._id} value={option.value}>
                                                    {option.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-medium">Level</label>
                                    <Select
                                        value={selectedLevel}
                                        onValueChange={setSelectedLevel}
                                        disabled={!selectedSession}
                                    >
                                        <SelectTrigger className="w-48">
                                            <SelectValue placeholder="Select Level" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {levelOptions.map((option) => (
                                                <SelectItem key={option._id} value={option.value}>
                                                    {option.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>

                        {/* Course Structure */}
                        <div className="mb-8">
                            <h2 className="mb-4 text-xl font-semibold">Course Structure</h2>
                            {selectedCourse && renderCourseStructure()}
                        </div>

                        {/* What You'll Learn Section */}
                        <div className="mb-8">
                            <h2 className="mb-4 text-2xl font-bold">What you&apos;ll learn?</h2>
                            <div className="rounded-lg">
                                <p
                                    dangerouslySetInnerHTML={{
                                        __html: form.getValues('courseData').whatYoullLearn || '',
                                    }}
                                />
                            </div>
                        </div>

                        {/* About Content Section */}
                        <div className="mb-8">
                            <h2 className="mb-4 text-2xl font-bold">About this course</h2>
                            <div className="rounded-lg">
                                <p
                                    dangerouslySetInnerHTML={{
                                        __html: form.getValues('courseData').aboutTheCourse || '',
                                    }}
                                />
                            </div>
                        </div>

                        {/* Who Should Join Section */}
                        <div className="mb-8">
                            <h2 className="mb-4 text-2xl font-bold">Who should join?</h2>
                            <div className="rounded-lg">
                                <p
                                    dangerouslySetInnerHTML={{
                                        __html: form.getValues('courseData').whoShouldLearn || '',
                                    }}
                                />
                            </div>
                        </div>

                        {/* Instructors Section */}
                        <div className="mb-8">
                            <h2 className="mb-4 text-2xl font-bold">Instructors</h2>
                            {form.getValues('courseData').instructors.map((instructor, index) => (
                                <div key={index} className="flex gap-4 rounded-lg bg-gray-50 p-4">
                                    <Avatar className="size-8">
                                        <AvatarImage src="" alt={instructor.email} />
                                        <AvatarFallback className="bg-[#3B82F6] text-xs font-medium text-white">
                                            {getInitials(instructor.email)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <h3 className="text-lg">{instructor.name}</h3>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right Column - 1/3 width */}
                    <div className="w-1/3">
                        <div className="sticky top-4 rounded-lg border bg-white p-6 shadow-lg">
                            {/* Course Stats */}
                            <h2 className="mb-4 text-lg font-bold">Scratch Programming Language</h2>
                            <div className="space-y-4">
                                <div className="flex items-center gap-2">
                                    <Steps size={18} />
                                    <span>Beginner</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Clock size={18} />
                                    <span> 1 hr 38 min</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <PlayCircle size={18} />
                                    <span>11 Vidoes slides</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Code size={18} />
                                    <span>8 Code slides</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <FilePdf size={18} />
                                    <span>2 Pdf slides</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <FileDoc size={18} />
                                    <span>1 Doc slide</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Question size={18} />
                                    <span>1 Question slide</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <File size={18} />
                                    <span>1 Assignment slide</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <ChalkboardTeacher size={18} />
                                    <span>Satya Dillikar, Savir Dillikar</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {getDialogContent()}
        </div>
    );
};
