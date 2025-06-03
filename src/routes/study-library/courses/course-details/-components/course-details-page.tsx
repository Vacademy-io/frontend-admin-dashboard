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
} from 'phosphor-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useState, useEffect } from 'react';
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

type DialogType = 'subject' | 'module' | 'chapter' | 'slide' | null;

type Slide = {
    id: string;
    name: string;
    type: 'video' | 'pdf' | 'doc';
};

type Chapter = {
    id: string;
    name: string;
    slides: Slide[];
    isOpen?: boolean;
};

type Module = {
    id: string;
    name: string;
    chapters?: Chapter[];
    slides?: Slide[];
    isOpen?: boolean;
};

type Subject = {
    id: string;
    name: string;
    modules: Module[];
    isOpen?: boolean;
};

interface Course {
    id: string;
    title: string;
    level: 2 | 3 | 4 | 5;
    structure: {
        courseName: string;
        items: Subject[] | Module[] | Slide[];
    };
}

const mockCourses: Course[] = [
    {
        id: '1',
        title: '2-Level Course Structure',
        level: 2,
        structure: {
            courseName: 'Introduction to Web Development',
            items: [] as Slide[],
        },
    },
    {
        id: '2',
        title: '3-Level Course Structure',
        level: 3,
        structure: {
            courseName: 'Frontend Fundamentals',
            items: [] as Chapter[],
        },
    },
    {
        id: '3',
        title: '4-Level Course Structure',
        level: 4,
        structure: {
            courseName: 'Full-Stack JavaScript Development Mastery',
            items: [] as Module[],
        },
    },
    {
        id: '4',
        title: '5-Level Course Structure',
        level: 5,
        structure: {
            courseName: 'Advanced Software Engineering Principles',
            items: [] as Subject[],
        },
    },
];

export const CourseDetailsPage = () => {
    const router = useRouter();
    const searchParams = router.state.location.search;

    const getInitials = (email: string) => {
        const name = email.split('@')[0];
        return name?.slice(0, 2).toUpperCase();
    };

    // Mock data for static display
    const courseData = {
        title: 'Advanced Web Development Bootcamp',
        description:
            'Master modern web development with this comprehensive course covering React, Node.js, and more.',
        tags: ['Web Development', 'React', 'Node.js', 'Full Stack'],
        imageUrl: 'https://example.com/course-banner.jpg',
        stats: {
            students: 1234,
            rating: 4.8,
            reviews: 256,
            lastUpdated: 'December 2023',
        },
        courseStructure: 2, // Set to 4 for testing
        whatYoullLearn: [
            'Build full-stack web applications using React and Node.js',
            'Master modern JavaScript ES6+ features',
            'Implement authentication and authorization',
            'Deploy applications to production',
        ],
        instructors: [
            {
                id: '1',
                email: 'john.doe@example.com',
                name: 'John Doe',
            },
            {
                id: '2',
                email: 'john.doe@example.com',
                name: 'John Snow',
            },
        ],
        sessions: [
            {
                levelDetails: [
                    {
                        id: 'd5e66a68-ce39-4091-bf5a-e2803782d69e',
                        name: 'l1',
                        duration_in_days: 0,
                        subjects: [],
                    },
                    {
                        id: 'd5e66a68-ce39-4091-bf5a-e2803782d68e',
                        name: 'l2',
                        duration_in_days: 0,
                        subjects: [],
                    },
                ],
                sessionDetails: {
                    id: 'c5e5c465-778f-4e1d-9440-2f9d89646708',
                    session_name: 's1',
                    status: 'ACTIVE',
                    start_date: '2025-06-02',
                },
            },
            {
                levelDetails: [
                    {
                        id: 'd5e66a68-ce39-4091-bf5a-e2803782d69e2',
                        name: 'l1',
                        duration_in_days: 0,
                        subjects: [],
                    },
                    {
                        id: 'd5e66a68-ce39-4091-bf5a-e2803782d68e1',
                        name: 'l2',
                        duration_in_days: 0,
                        subjects: [],
                    },
                ],
                sessionDetails: {
                    id: 'c5e5c465-778f-4e1d-9440-2f9d89646709',
                    session_name: 's2',
                    status: 'ACTIVE',
                    start_date: '2025-06-02',
                },
            },
        ],
    };

    const [selectedSession, setSelectedSession] = useState<string>('');
    const [selectedLevel, setSelectedLevel] = useState<string>('');
    const [levelOptions, setLevelOptions] = useState<
        { _id: string; value: string; label: string }[]
    >([]);

    // Convert sessions to select options format
    const sessionOptions = courseData.sessions.map((session) => ({
        _id: session.sessionDetails.id,
        value: session.sessionDetails.id,
        label: session.sessionDetails.session_name,
    }));

    // Update level options when session changes
    const handleSessionChange = (sessionId: string) => {
        setSelectedSession(sessionId);
        const selectedSessionData = courseData.sessions.find(
            (session) => session.sessionDetails.id === sessionId
        );

        if (selectedSessionData) {
            const newLevelOptions = selectedSessionData.levelDetails.map((level) => ({
                _id: level.id,
                value: level.id,
                label: level.name,
            }));
            setLevelOptions(newLevelOptions);
            setSelectedLevel(''); // Reset level selection when session changes
        }
    };

    // Set initial session and its levels
    useEffect(() => {
        if (sessionOptions.length > 0 && !selectedSession) {
            const initialSessionId = sessionOptions[0]?.value || '';
            handleSessionChange(initialSessionId);
        }
    }, []);

    const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});

    // Modified toggle function to handle hierarchical closing
    const toggleExpand = (id: string, type: 'subject' | 'module' | 'chapter') => {
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

    const [selectedCourse, setSelectedCourse] = useState<Course | undefined>(
        mockCourses.find((course) => course.level === courseData.courseStructure)
    );
    const [dialogType, setDialogType] = useState<DialogType>(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [newItemName, setNewItemName] = useState('');
    const [selectedParentId, setSelectedParentId] = useState<string>('');

    useEffect(() => {
        const course = mockCourses.find((course) => course.level === courseData.courseStructure);
        setSelectedCourse(course);
    }, [courseData.courseStructure]);

    const handleAddClick = (type: DialogType, parentId?: string) => {
        setDialogType(type);
        setSelectedParentId(parentId || '');
        setDialogOpen(true);
        setNewItemName('');
    };
    console.log('selectedCourse', selectedCourse);

    const addModuleToSubject = (subjectId: string, moduleName: string) => {
        console.log('addModuleToSubject called with:', { subjectId, moduleName });
        if (!selectedCourse) return;

        const newModuleId = crypto.randomUUID();

        setSelectedCourse((prevCourse) => {
            if (!prevCourse) return prevCourse;

            const newCourse = {
                ...prevCourse,
                structure: {
                    ...prevCourse.structure,
                    items: (prevCourse.structure.items as Subject[]).map((subject) => {
                        if (subject.id === subjectId) {
                            const updatedSubject = {
                                ...subject,
                                modules: [
                                    ...subject.modules,
                                    {
                                        id: newModuleId,
                                        name: moduleName,
                                        chapters: [],
                                        isOpen: false,
                                    },
                                ],
                            };
                            return updatedSubject;
                        }
                        return subject;
                    }),
                },
            };

            return newCourse;
        });
    };

    const handleAddItem = () => {
        if (!newItemName.trim() || !selectedCourse) return;

        const newId = crypto.randomUUID();

        switch (dialogType) {
            case 'subject': {
                setSelectedCourse((prevCourse) => {
                    if (!prevCourse) return prevCourse;

                    const newCourse = { ...prevCourse };
                    const items = [...(newCourse.structure.items as Subject[])];

                    if (prevCourse.level === 5) {
                        const newSubject: Subject = {
                            id: newId,
                            name: newItemName,
                            modules: [],
                            isOpen: false,
                        };
                        items.push(newSubject);
                    }

                    newCourse.structure.items = items;
                    return newCourse;
                });
                break;
            }

            case 'module': {
                if (selectedCourse.level === 4) {
                    setSelectedCourse((prevCourse) => {
                        if (!prevCourse) return prevCourse;
                        const newCourse = {
                            ...prevCourse,
                            structure: {
                                ...prevCourse.structure,
                                items: [
                                    ...(prevCourse.structure.items as Module[]),
                                    {
                                        id: newId,
                                        name: newItemName,
                                        chapters: [],
                                        isOpen: false,
                                    },
                                ],
                            },
                        };
                        return newCourse;
                    });
                } else if (selectedParentId) {
                    addModuleToSubject(selectedParentId, newItemName);
                }
                break;
            }

            case 'chapter': {
                if (selectedParentId) {
                    setSelectedCourse((prevCourse) => {
                        if (!prevCourse) return prevCourse;

                        const newCourse = {
                            ...prevCourse,
                            structure: {
                                ...prevCourse.structure,
                                // Cast to appropriate type based on level
                                items: (
                                    prevCourse.structure.items as (Subject | Module | Chapter)[]
                                ).map((item) => {
                                    if (prevCourse.level === 5) {
                                        const [subjectId, moduleId] = selectedParentId.split('|');
                                        if ((item as Subject).id === subjectId) {
                                            const subject = item as Subject;
                                            return {
                                                ...subject,
                                                modules: subject.modules.map((module) => {
                                                    if (module.id === moduleId) {
                                                        return {
                                                            ...module,
                                                            chapters: [
                                                                ...(module.chapters || []),
                                                                {
                                                                    id: newId,
                                                                    name: newItemName,
                                                                    slides: [],
                                                                    isOpen: false,
                                                                },
                                                            ],
                                                        };
                                                    }
                                                    return module;
                                                }),
                                            };
                                        }
                                    } else if (prevCourse.level === 4) {
                                        // For 4-level structure, selectedParentId is just the moduleId
                                        const moduleId = selectedParentId;
                                        if ((item as Module).id === moduleId) {
                                            const module = item as Module;
                                            return {
                                                ...module,
                                                chapters: [
                                                    ...(module.chapters || []),
                                                    {
                                                        id: newId,
                                                        name: newItemName,
                                                        slides: [],
                                                        isOpen: false,
                                                    },
                                                ],
                                            };
                                        }
                                    } else if (prevCourse.level === 3) {
                                        // For 3-level structure, parentId is not applicable as chapters are top-level
                                        // This case should not be hit via 'add chapter' button with parentId
                                    }
                                    return item;
                                }),
                            },
                        };
                        return newCourse;
                    });
                } else if (selectedCourse.level === 3) {
                    // Directly add chapter for 3-level structure
                    setSelectedCourse((prevCourse) => {
                        if (!prevCourse) return prevCourse;
                        const newCourse = {
                            ...prevCourse,
                            structure: {
                                ...prevCourse.structure,
                                items: [
                                    ...(prevCourse.structure.items as Chapter[]),
                                    {
                                        id: newId,
                                        name: newItemName,
                                        slides: [],
                                        isOpen: false,
                                    },
                                ],
                            },
                        };
                        return newCourse;
                    });
                }
                break;
            }

            case 'slide': {
                if (selectedParentId) {
                    const parts = selectedParentId.split('|');
                    let subjectId, moduleId, chapterId;

                    if (selectedCourse.level === 5) {
                        [subjectId, moduleId, chapterId] = parts;
                    } else if (selectedCourse.level === 4) {
                        [moduleId, chapterId] = parts;
                    } else if (selectedCourse.level === 3) {
                        [chapterId] = parts;
                    }

                    setSelectedCourse((prevCourse) => {
                        if (!prevCourse) return prevCourse;

                        const newCourse = {
                            ...prevCourse,
                            structure: {
                                ...prevCourse.structure,
                                items: (
                                    prevCourse.structure.items as (Subject | Module | Chapter)[]
                                ).map((item) => {
                                    if (
                                        prevCourse.level === 5 &&
                                        (item as Subject).id === subjectId
                                    ) {
                                        const subject = item as Subject;
                                        return {
                                            ...subject,
                                            modules: subject.modules.map((module) => {
                                                if (module.id === moduleId) {
                                                    return {
                                                        ...module,
                                                        chapters:
                                                            module.chapters?.map((chapter) => {
                                                                if (chapter.id === chapterId) {
                                                                    return {
                                                                        ...chapter,
                                                                        slides: [
                                                                            ...chapter.slides,
                                                                            {
                                                                                id: newId,
                                                                                name: newItemName,
                                                                                type: 'video',
                                                                            },
                                                                        ],
                                                                    };
                                                                }
                                                                return chapter;
                                                            }) || [],
                                                    };
                                                }
                                                return module;
                                            }),
                                        };
                                    } else if (
                                        prevCourse.level === 4 &&
                                        (item as Module).id === moduleId
                                    ) {
                                        const module = item as Module;
                                        return {
                                            ...module,
                                            chapters:
                                                module.chapters?.map((chapter) => {
                                                    if (chapter.id === chapterId) {
                                                        return {
                                                            ...chapter,
                                                            slides: [
                                                                ...chapter.slides,
                                                                {
                                                                    id: newId,
                                                                    name: newItemName,
                                                                    type: 'video',
                                                                },
                                                            ],
                                                        };
                                                    }
                                                    return chapter;
                                                }) || [],
                                        };
                                    } else if (
                                        prevCourse.level === 3 &&
                                        (item as Chapter).id === chapterId
                                    ) {
                                        const chapter = item as Chapter;
                                        return {
                                            ...chapter,
                                            slides: [
                                                ...chapter.slides,
                                                {
                                                    id: newId,
                                                    name: newItemName,
                                                    type: 'video',
                                                },
                                            ],
                                        };
                                    }
                                    return item;
                                }),
                            },
                        };
                        return newCourse;
                    });
                } else if (selectedCourse.level === 2) {
                    // Directly add slide for 2-level structure
                    setSelectedCourse((prevCourse) => {
                        if (!prevCourse) return prevCourse;
                        const newCourse = {
                            ...prevCourse,
                            structure: {
                                ...prevCourse.structure,
                                items: [
                                    ...(prevCourse.structure.items as Slide[]),
                                    {
                                        id: newId,
                                        name: newItemName,
                                        type: 'video', // Default type
                                    },
                                ],
                            },
                        };
                        return newCourse;
                    });
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

    const renderTreeItem = (
        label: string,
        id: string,
        hasChildren: boolean,
        level: number,
        isAddButton = false,
        type?: 'subject' | 'module' | 'chapter'
    ) => (
        <div
            className={`flex items-center gap-2 py-1 ${isAddButton ? 'text-blue-600 hover:text-blue-700' : ''}`}
            style={{ paddingLeft: `${level * 20}px` }}
        >
            {!isAddButton && hasChildren && type && (
                <button onClick={() => toggleExpand(id, type)} className="p-1">
                    {expandedItems[id] ? (
                        <CaretDown className="h-4 w-4" />
                    ) : (
                        <CaretRight className="h-4 w-4" />
                    )}
                </button>
            )}
            {isAddButton ? (
                <Button
                    variant="ghost"
                    className="h-8 gap-2 p-2 text-sm"
                    onClick={() => {
                        const parts = id.split('|'); // Split the ID string
                        if (parts[1] === 'subject') {
                            handleAddClick('subject');
                        } else if (parts[1] === 'module') {
                            if (selectedCourse?.level === 4) {
                                handleAddClick('module'); // No parentId needed for top-level modules in 4-level
                            } else if (selectedCourse?.level === 5) {
                                handleAddClick('module', parts[2]); // subjectId for 5-level
                            }
                        } else if (parts[1] === 'chapter') {
                            if (selectedCourse?.level === 4) {
                                // For 4-level, parentId is the module ID
                                handleAddClick('chapter', parts[2]);
                            } else if (selectedCourse?.level === 5) {
                                // For 5-level, parentId is subjectId|moduleId
                                handleAddClick('chapter', `${parts[2]}|${parts[3]}`);
                            } else if (selectedCourse?.level === 3) {
                                handleAddClick('chapter'); // No parentId needed for top-level chapters in 3-level
                            }
                        } else if (parts[1] === 'slide') {
                            if (selectedCourse?.level === 2) {
                                handleAddClick('slide'); // No parentId needed for top-level slides in 2-level
                            } else if (selectedCourse?.level === 3) {
                                handleAddClick('slide', parts[2]); // chapterId for 3-level
                            } else if (selectedCourse?.level === 4) {
                                handleAddClick('slide', `${parts[2]}|${parts[3]}`); // moduleId|chapterId for 4-level
                            } else if (selectedCourse?.level === 5) {
                                handleAddClick('slide', `${parts[2]}|${parts[3]}|${parts[4]}`); // subjectId|moduleId|chapterId for 5-level
                            }
                        }
                    }}
                >
                    <Plus className="h-4 w-4" />
                    {label}
                </Button>
            ) : (
                <span className="flex items-center gap-2">
                    {!hasChildren && <div className="h-4 w-4" />}
                    {label}
                </span>
            )}
        </div>
    );

    const renderCourseStructure = () => {
        if (!selectedCourse) return null;

        switch (selectedCourse.level) {
            case 2:
                // Only slides, flat structure
                return (
                    <div className="rounded-lg border p-4">
                        {renderTreeItem('Add Slide', 'add|slide', false, 0, true)}
                        {(selectedCourse.structure.items as Slide[]).map((slide) => (
                            <div key={slide.id}>
                                {renderTreeItem(slide.name, slide.id, false, 0)}
                            </div>
                        ))}
                    </div>
                );

            case 3:
                // Chapters with slides
                return (
                    <div className="rounded-lg border p-4">
                        {renderTreeItem('Add Chapter', 'add|chapter', false, 0, true)}
                        {(selectedCourse.structure.items as Chapter[]).map((chapter) => (
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
                                        {chapter.slides.map((slide: Slide) => (
                                            <div key={slide.id}>
                                                {renderTreeItem(slide.name, slide.id, false, 1)}
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
                        {(selectedCourse.structure.items as Module[]).map((module) => (
                            <div key={module.id}>
                                {renderTreeItem(module.name, module.id, true, 0, false, 'module')}
                                {expandedItems[module.id] && (
                                    <>
                                        {renderTreeItem(
                                            'Add Chapter',
                                            `add|chapter|${module.id}`, // Pass module.id directly for 4-level
                                            false,
                                            1,
                                            true
                                        )}
                                        {module.chapters?.map((chapter: Chapter) => (
                                            <div key={chapter.id}>
                                                {renderTreeItem(
                                                    chapter.name,
                                                    `${module.id}|${chapter.id}`, // Use module.id|chapter.id for expansion key
                                                    true,
                                                    1,
                                                    false,
                                                    'chapter'
                                                )}
                                                {expandedItems[`${module.id}|${chapter.id}`] && (
                                                    <>
                                                        {renderTreeItem(
                                                            'Add Slide',
                                                            `add|slide|${module.id}|${chapter.id}`, // Pass moduleId|chapterId for slide
                                                            false,
                                                            2,
                                                            true
                                                        )}
                                                        {chapter.slides.map((slide: Slide) => (
                                                            <div key={slide.id}>
                                                                {renderTreeItem(
                                                                    slide.name,
                                                                    slide.id,
                                                                    false,
                                                                    2
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
                        {(selectedCourse.structure.items as Subject[]).map((subject) => (
                            <div key={subject.id}>
                                {renderTreeItem(
                                    subject.name,
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
                                        {subject.modules.map((module) => (
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
                                                                                        3
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

    return (
        <div className="flex min-h-screen flex-col bg-white">
            {/* Top Banner */}
            <div className="relative h-[300px] bg-gradient-to-r from-blue-900 to-blue-700 text-white">
                <div className="container mx-auto px-4 py-12">
                    <div className="flex items-start justify-between gap-8">
                        {/* Left side - Title and Description */}
                        <div className="max-w-2xl">
                            <div className="mb-4 flex gap-2">
                                {courseData.tags.map((tag, index) => (
                                    <span
                                        key={index}
                                        className="rounded-full bg-blue-600 px-3 py-1 text-sm"
                                    >
                                        {tag}
                                    </span>
                                ))}
                            </div>
                            <h1 className="mb-4 text-4xl font-bold">{courseData.title}</h1>
                            <p className="text-lg opacity-90">{courseData.description}</p>
                        </div>

                        {/* Right side - Video Player */}
                        <div className="w-[400px] overflow-hidden rounded-lg shadow-xl">
                            <div className="relative aspect-video bg-black">
                                {/* Video placeholder - replace with actual video component */}
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/20">
                                        <svg
                                            className="h-8 w-8 text-white"
                                            fill="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path d="M8 5v14l11-7z" />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="container mx-auto px-4 py-8">
                <div className="flex gap-8">
                    {/* Left Column - 2/3 width */}
                    <div className="w-2/3 flex-grow">
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
                            <h2 className="mb-4 text-2xl font-bold">What you'll learn?</h2>
                            <div className="rounded-lg">
                                <p>
                                    The Scratch Basics course is designed to introduce beginners to
                                    the exciting world of coding through simple, visual programming.
                                    Using Scratch's drag-and-drop interface, learners can easily
                                </p>
                            </div>
                        </div>

                        {/* About Content Section */}
                        <div className="mb-8">
                            <h2 className="mb-4 text-2xl font-bold">About this course</h2>
                            <div className="rounded-lg">
                                <p>
                                    The Scratch Basics course is designed to introduce beginners to
                                    the exciting world of coding through simple, visual programming.
                                    Using Scratch's drag-and-drop interface, learners can easily
                                </p>
                            </div>
                        </div>

                        {/* Who Should Join Section */}
                        <div className="mb-8">
                            <h2 className="mb-4 text-2xl font-bold">Who should join?</h2>
                            <div className="rounded-lg">
                                <p>
                                    The Scratch Basics course is designed to introduce beginners to
                                    the exciting world of coding through simple, visual programming.
                                    Using Scratch's drag-and-drop interface, learners can easily
                                </p>
                            </div>
                        </div>

                        {/* Instructors Section */}
                        <div className="mb-8">
                            <h2 className="mb-4 text-2xl font-bold">Instructors</h2>
                            {courseData.instructors.map((instructor, index) => (
                                <div key={index} className="flex gap-4 rounded-lg bg-gray-50 p-4">
                                    <Avatar className="h-8 w-8">
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
