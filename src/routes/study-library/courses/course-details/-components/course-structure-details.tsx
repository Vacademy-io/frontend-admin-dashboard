// class-study-material.tsx
import { useRouter } from '@tanstack/react-router';
import { useMutation } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { SubjectType, useStudyLibraryStore } from '@/stores/study-library/use-study-library-store';
import { DashboardLoader } from '@/components/core/dashboard-loader';
import { getCourseSubjects } from '@/utils/helpers/study-library-helpers.ts/get-list-from-stores/getSubjects';
import { useGetPackageSessionId } from '@/utils/helpers/study-library-helpers.ts/get-list-from-stores/getPackageSessionId';
import useIntroJsTour from '@/hooks/use-intro';
import { StudyLibraryIntroKey } from '@/constants/storage/introKey';
import { studyLibrarySteps } from '@/constants/intro/steps';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useInstituteDetailsStore } from '@/stores/students/students-list/useInstituteDetailsStore';
import { DropdownItemType } from '@/components/common/students/enroll-manually/dropdownTypesForPackageItems';
import { CaretDown, CaretRight, Plus, Folder, FileText, PresentationChart } from 'phosphor-react';
import { MyButton } from '@/components/design-system/button';
import AddTeachers from '@/routes/dashboard/-components/AddTeachers';
import { AddSubjectButton } from '../subjects/-components/add-subject.tsx/add-subject-button';
import { useAddSubject } from '../subjects/-services/addSubject';
import { useUpdateSubject } from '../subjects/-services/updateSubject';
import { useDeleteSubject } from '../subjects/-services/deleteSubject';
import { useUpdateSubjectOrder } from '../subjects/-services/updateSubjectOrder';
import { TabType, tabs } from '../subjects/-constants/constant';
import { fetchModulesWithChapters } from '../../-services/getModulesWithChapters';
import {
    UseSlidesFromModulesInput,
    fetchChaptersWithSlides,
    ChapterWithSlides,
    Slide,
} from '../../-services/getAllSlides';
import { useAddModule } from '../subjects/modules/-services/add-module';
import { AddModulesButton } from '../subjects/modules/-components/add-modules.tsx/add-modules-button';
import { AddChapterButton } from '../subjects/modules/chapters/-components/chapter-material/add-chapters/add-chapter-button';
import Students from '../subjects/-components/student-list';
import Assessments from '../subjects/-components/assessment-list';
import { getIcon } from '../subjects/modules/chapters/slides/-components/slides-sidebar/slides-sidebar-slides';
import { useContentStore } from '../subjects/modules/chapters/slides/-stores/chapter-sidebar-store';
import { TeachersList } from '../subjects/-components/teacher-list';
import { getTerminology } from '@/components/common/layout-container/sidebar/utils';
import { ContentTerms, RoleTerms, SystemTerms } from '@/routes/settings/-components/NamingSettings';

// Interfaces (assuming these are unchanged)
export interface Chapter {
    id: string;
    chapter_name: string;
    status: string;
    description: string;
    file_id: string | null;
    chapter_order: number;
}
export interface ChapterMetadata {
    chapter: Chapter;
    slides_count: {
        video_count: number;
        pdf_count: number;
        doc_count: number;
        unknown_count: number;
    };
    chapter_in_package_sessions: string[];
}
export interface Module {
    id: string;
    module_name: string;
    status: string;
    description: string;
    thumbnail_id: string;
}
export interface ModuleWithChapters {
    module: Module;
    chapters: ChapterMetadata[];
}
export type SubjectModulesMap = { [subjectId: string]: ModuleWithChapters[] };

export const CourseStructureDetails = ({
    selectedSession,
    selectedLevel,
    courseStructure,
}: {
    selectedSession: string;
    selectedLevel: string;
    courseStructure: number;
}) => {
    const router = useRouter();
    const searchParams = router.state.location.search;
    const { getSessionFromPackage, getPackageSessionId } = useInstituteDetailsStore();
    const { studyLibraryData } = useStudyLibraryStore();
    const { setActiveItem } = useContentStore();

    const courseId: string = searchParams.courseId || '';
    const levelId: string = selectedLevel || '';

    const [sessionList, setSessionList] = useState<DropdownItemType[]>(
        searchParams.courseId ? getSessionFromPackage({ courseId: courseId, levelId: levelId }) : []
    );
    const initialSession: DropdownItemType | undefined = {
        id: selectedSession || '',
        name: sessionList[0]?.name || '',
    };

    const [currentSession, setCurrentSession] = useState<DropdownItemType | undefined>(
        () => initialSession
    );

    useEffect(() => {
        setSessionList(
            searchParams.courseId
                ? getSessionFromPackage({ courseId: courseId, levelId: searchParams.levelId })
                : []
        );
    }, [searchParams.courseId, searchParams.levelId, getSessionFromPackage]);

    useEffect(() => {
        if (selectedSession) {
            // Find the session name from sessionList based on selectedSession ID
            const foundSession = sessionList.find(session => session.id === selectedSession);
            setCurrentSession({ 
                id: selectedSession, 
                name: foundSession?.name || '' 
            });
        } else {
            // Fallback to first session if no selectedSession
            setCurrentSession({ id: sessionList[0]?.id || '', name: sessionList[0]?.name || '' });
        }
    }, [sessionList, selectedSession]);

    const [selectedTab, setSelectedTab] = useState<string>(TabType.OUTLINE);
    const handleTabChange = (value: string) => setSelectedTab(value);

    const [subjectModulesMap, setSubjectModulesMap] = useState<SubjectModulesMap>({});
    const [chapterSlidesMap, setChapterSlidesMap] = useState<{ [chapterId: string]: Slide[] }>({});
    const [openSubjects, setOpenSubjects] = useState<Set<string>>(new Set());
    const [openModules, setOpenModules] = useState<Set<string>>(new Set());
    const [openChapters, setOpenChapters] = useState<Set<string>>(new Set());

    const addModuleMutation = useAddModule();
    const addSubjectMutation = useAddSubject();
    const updateSubjectMutation = useUpdateSubject();
    const deleteSubjectMutation = useDeleteSubject();
    const updateSubjectOrderMutation = useUpdateSubjectOrder();

    useIntroJsTour({
        key: StudyLibraryIntroKey.addSubjectStep,
        steps: studyLibrarySteps.addSubjectStep,
    });

    const initialSubjects = getCourseSubjects(courseId, selectedSession || '', levelId);
    const [subjects, setSubjects] = useState(initialSubjects);

    useEffect(() => {
        const newSubjects = getCourseSubjects(courseId, selectedSession || '', levelId);
        setSubjects(newSubjects);
    }, [selectedSession, studyLibraryData, courseId, levelId]);

    const packageSessionIds =
        useGetPackageSessionId(courseId, selectedSession || '', levelId) || '';

    const useSlidesByChapterMutation = () => {
        return useMutation({
            mutationFn: async ({ modules, packageSessionId }: UseSlidesFromModulesInput) => {
                const chapterSlidesMapUpdate: { [chapterId: string]: Slide[] } = {};
                await Promise.all(
                    modules.map(async (module) => {
                        const chaptersWithSlides = await fetchChaptersWithSlides(
                            module.id,
                            packageSessionId
                        );
                        chaptersWithSlides.forEach((chapterWithSlides: ChapterWithSlides) => {
                            chapterSlidesMapUpdate[chapterWithSlides.chapter.id] =
                                chapterWithSlides.slides;
                        });
                    })
                );
                return chapterSlidesMapUpdate;
            },
        });
    };
    const { mutateAsync: fetchSlides } = useSlidesByChapterMutation();

    const useModulesMutation = () => {
        return useMutation({
            mutationFn: async ({
                subjects: currentSubjects,
                packageSessionIds: currentPackageSessionIds,
            }: {
                subjects: SubjectType[];
                packageSessionIds: string;
            }) => {
                const results = await Promise.all(
                    currentSubjects.map(async (subject) => {
                        const res = await fetchModulesWithChapters(
                            subject.id,
                            currentPackageSessionIds
                        );
                        return { subjectId: subject.id, modules: res };
                    })
                );
                const modulesMap: SubjectModulesMap = {};
                results.forEach(({ subjectId, modules }) => {
                    modulesMap[subjectId] = modules;
                });
                return modulesMap;
            },
        });
    };
    const { mutateAsync: fetchModules } = useModulesMutation();

    const handleAddModule = (subjectId: string, module: Module) => {
        addModuleMutation.mutate(
            {
                subjectId,
                packageSessionIds:
                    getPackageSessionId({
                        courseId: courseId,
                        levelId: levelId,
                        sessionId: selectedSession || '',
                    }) || '',
                module,
            },
            {
                onSuccess: async () => {
                    const updatedSubjects = getCourseSubjects(
                        courseId,
                        selectedSession || '',
                        levelId
                    );
                    if (updatedSubjects.length > 0 && packageSessionIds) {
                        const updatedModulesMap = await fetchModules({
                            subjects: updatedSubjects,
                            packageSessionIds,
                        });
                        setSubjectModulesMap(updatedModulesMap);
                    }
                    setSubjects(updatedSubjects);
                },
            }
        );
    };

    useEffect(() => {
        const loadModules = async () => {
            if (subjects.length > 0 && packageSessionIds) {
                try {
                    const modulesMap = await fetchModules({ subjects, packageSessionIds });
                    setSubjectModulesMap(modulesMap);

                    // Expand all by default
                    const allSubjectIds = new Set(subjects.map((s) => s.id));
                    const allModuleIds = new Set<string>();
                    const allChapterIds = new Set<string>();

                    Object.values(modulesMap)
                        .flat()
                        .forEach((modWithChapters) => {
                            allModuleIds.add(modWithChapters.module.id);
                            modWithChapters.chapters.forEach((chapWithMeta) => {
                                allChapterIds.add(chapWithMeta.chapter.id);
                            });
                        });
                    setOpenSubjects(allSubjectIds);
                    setOpenModules(allModuleIds);
                    setOpenChapters(allChapterIds);
                } catch (error) {
                    console.error('Failed to fetch modules:', error);
                    setSubjectModulesMap({});
                }
            } else {
                setSubjectModulesMap({});
            }
        };
        loadModules();
    }, [subjects, packageSessionIds, fetchModules]);

    useEffect(() => {
        const loadSlides = async () => {
            const allModules: { id: string }[] = Object.values(subjectModulesMap)
                .flat()
                .map((m) => ({ id: m.module.id }));
            if (allModules.length > 0 && packageSessionIds) {
                try {
                    const slideMap = await fetchSlides({
                        modules: allModules,
                        packageSessionId: packageSessionIds,
                    });
                    setChapterSlidesMap(slideMap);
                } catch (error) {
                    console.error('Failed to fetch slides:', error);
                    setChapterSlidesMap({});
                }
            } else {
                setChapterSlidesMap({});
            }
        };
        if (Object.keys(subjectModulesMap).length > 0 && packageSessionIds) {
            loadSlides();
        } else {
            setChapterSlidesMap({});
        }
    }, [subjectModulesMap, packageSessionIds, fetchSlides]);

    const handleAddSubject = async (newSubject: SubjectType) => {
        if (!packageSessionIds) {
            console.error('No package session IDs found');
            return;
        }
        addSubjectMutation.mutate({ subject: newSubject, packageSessionIds });
    };

    const handleChapterNavigation = (subjectId: string, moduleId: string, chapterId: string) => {
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

    const handleSlideNavigation = (
        subjectId: string,
        moduleId: string,
        chapterId: string,
        slideId: string
    ) => {
        const slide = chapterSlidesMap[chapterId]?.find((s) => s.id === slideId);
        if (slide) {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            setActiveItem(slide);
        } else {
            // Fallback for safety, though this path should ideally not be taken
            setActiveItem({
                id: slideId,
                source_id: '',
                source_type: '',
                title: '',
                image_file_id: '',
                description: '',
                status: '',
                slide_order: 0,
                video_slide: null,
                document_slide: null,
                question_slide: null,
                assignment_slide: null,
                is_loaded: false,
                new_slide: false,
            });
        }

        const navigationParams = {
            courseId: router.state.location.search.courseId ?? '',
            levelId: selectedLevel,
            subjectId,
            moduleId,
            chapterId,
            slideId,
            sessionId: selectedSession,
        };

        router.navigate({
            to: '/study-library/courses/course-details/subjects/modules/chapters/slides',
            search: navigationParams,
        });
    };

    const toggleOpenState = (
        id: string,
        setter: React.Dispatch<React.SetStateAction<Set<string>>>
    ) => {
        setter((prev) => {
            const u = new Set(prev);
            u.has(id) ? u.delete(id) : u.add(id);
            return u;
        });
    };
    const toggleSubject = (id: string) => toggleOpenState(id, setOpenSubjects);
    const toggleModule = (id: string) => toggleOpenState(id, setOpenModules);
    const toggleChapter = (id: string) => toggleOpenState(id, setOpenChapters);
    const tabContent: Record<TabType, React.ReactNode> = {
        [TabType.OUTLINE]: (
            <div className="p-6 py-2">
                <div className="max-w-3xl space-y-1 rounded-lg border border-gray-200 px-2">
                    {courseStructure === 5 && (
                        <AddSubjectButton isTextButton onAddSubject={handleAddSubject} />
                    )}
                    {courseStructure === 5 &&
                        subjects.map((subject, idx) => {
                            const isSubjectOpen = openSubjects.has(subject.id);

                            return (
                                <Collapsible
                                    key={subject.id}
                                    open={isSubjectOpen}
                                    onOpenChange={() => toggleSubject(subject.id)}
                                    className="group"
                                >
                                    <CollapsibleTrigger className="flex w-full items-center rounded-md p-2 text-left text-sm font-semibold text-gray-800 transition-colors duration-150 hover:bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2">
                                        <div className="flex flex-1 items-center gap-2.5">
                                            {isSubjectOpen ? (
                                                <CaretDown
                                                    size={18}
                                                    weight="bold"
                                                    className="shrink-0 text-gray-500"
                                                />
                                            ) : (
                                                <CaretRight
                                                    size={18}
                                                    weight="bold"
                                                    className="shrink-0 text-gray-500"
                                                />
                                            )}
                                            <Folder
                                                size={20}
                                                weight="duotone"
                                                className="shrink-0 text-primary-500"
                                            />
                                            <span className="w-7 shrink-0 rounded-md bg-gray-100 py-0.5 text-center font-mono text-xs font-medium text-gray-600 group-hover:bg-white">
                                                S{idx + 1}
                                            </span>
                                            <span className="truncate" title={subject.subject_name}>
                                                {subject.subject_name}
                                            </span>
                                        </div>
                                    </CollapsibleTrigger>
                                    <CollapsibleContent className="py-1 pl-11">
                                        <div className="relative space-y-1.5 border-l-2 border-dashed border-gray-200 pl-6">
                                            <div className="absolute -left-[13px] top-0 h-full">
                                                <div className="sticky top-0 flex h-full flex-col items-center" />
                                            </div>

                                            <AddModulesButton
                                                isTextButton
                                                subjectId={subject.id}
                                                onAddModuleBySubjectId={handleAddModule}
                                            />
                                            {(subjectModulesMap[subject.id] ?? []).map(
                                                (mod, modIdx) => {
                                                    const isModuleOpen = openModules.has(
                                                        mod.module.id
                                                    );

                                                    return (
                                                        <Collapsible
                                                            key={mod.module.id}
                                                            open={isModuleOpen}
                                                            onOpenChange={() =>
                                                                toggleModule(mod.module.id)
                                                            }
                                                            className="group/module"
                                                        >
                                                            <CollapsibleTrigger className="flex w-full items-center rounded-md px-2 py-1.5 text-left text-sm font-medium text-gray-700 transition-colors duration-150 hover:bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2">
                                                                <div className="flex flex-1 items-center gap-2.5">
                                                                    {isModuleOpen ? (
                                                                        <CaretDown
                                                                            size={16}
                                                                            className="shrink-0 text-gray-500"
                                                                        />
                                                                    ) : (
                                                                        <CaretRight
                                                                            size={16}
                                                                            className="shrink-0 text-gray-500"
                                                                        />
                                                                    )}
                                                                    <FileText
                                                                        size={18}
                                                                        weight="duotone"
                                                                        className="shrink-0 text-blue-600"
                                                                    />
                                                                    <span className="w-7 shrink-0 rounded-md bg-gray-100 py-0.5 text-center font-mono text-xs font-medium text-gray-500 group-hover/module:bg-white">
                                                                        M{modIdx + 1}
                                                                    </span>
                                                                    <span
                                                                        className="truncate"
                                                                        title={
                                                                            mod.module.module_name
                                                                        }
                                                                    >
                                                                        {mod.module.module_name}
                                                                    </span>
                                                                </div>
                                                            </CollapsibleTrigger>
                                                            <CollapsibleContent className="py-1 pl-10">
                                                                <div className="relative space-y-1.5 border-l-2 border-dashed border-gray-200 pl-6">
                                                                    <AddChapterButton
                                                                        moduleId={mod.module.id}
                                                                        sessionId={selectedSession}
                                                                        levelId={selectedLevel}
                                                                        subjectId={subject.id}
                                                                        isTextButton
                                                                    />
                                                                    {(mod.chapters ?? []).map(
                                                                        (ch, chIdx) => {
                                                                            const isChapterOpen =
                                                                                openChapters.has(
                                                                                    ch.chapter.id
                                                                                );
                                                                            return (
                                                                                <Collapsible
                                                                                    key={
                                                                                        ch.chapter
                                                                                            .id
                                                                                    }
                                                                                    open={
                                                                                        isChapterOpen
                                                                                    }
                                                                                    onOpenChange={() =>
                                                                                        toggleChapter(
                                                                                            ch
                                                                                                .chapter
                                                                                                .id
                                                                                        )
                                                                                    }
                                                                                    className="group/chapter"
                                                                                >
                                                                                    <CollapsibleTrigger className="flex w-full items-center rounded-md px-2 py-1 text-left text-xs font-medium text-gray-600 transition-colors duration-150 hover:bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2">
                                                                                        <div className="flex flex-1 items-center gap-2">
                                                                                            {isChapterOpen ? (
                                                                                                <CaretDown
                                                                                                    size={
                                                                                                        14
                                                                                                    }
                                                                                                    className="shrink-0 text-gray-500"
                                                                                                />
                                                                                            ) : (
                                                                                                <CaretRight
                                                                                                    size={
                                                                                                        14
                                                                                                    }
                                                                                                    className="shrink-0 text-gray-500"
                                                                                                />
                                                                                            )}
                                                                                            <PresentationChart
                                                                                                size={
                                                                                                    16
                                                                                                }
                                                                                                weight="duotone"
                                                                                                className="shrink-0 text-green-600"
                                                                                            />
                                                                                            <span className="w-7 shrink-0 rounded-md bg-gray-100 py-0.5 text-center font-mono text-xs text-gray-500 group-hover/chapter:bg-white">
                                                                                                C
                                                                                                {chIdx +
                                                                                                    1}
                                                                                            </span>
                                                                                            <span
                                                                                                className="truncate"
                                                                                                title={
                                                                                                    ch
                                                                                                        .chapter
                                                                                                        .chapter_name
                                                                                                }
                                                                                            >
                                                                                                {
                                                                                                    ch
                                                                                                        .chapter
                                                                                                        .chapter_name
                                                                                                }
                                                                                            </span>
                                                                                        </div>
                                                                                    </CollapsibleTrigger>
                                                                                    <CollapsibleContent className="py-1 pl-9">
                                                                                        <div className="relative space-y-1.5 border-l-2 border-dashed border-gray-200 pl-6">
                                                                                            <MyButton
                                                                                                buttonType="text"
                                                                                                onClick={(
                                                                                                    e
                                                                                                ) => {
                                                                                                    e.stopPropagation();
                                                                                                    handleChapterNavigation(
                                                                                                        subject.id,
                                                                                                        mod
                                                                                                            .module
                                                                                                            .id,
                                                                                                        ch
                                                                                                            .chapter
                                                                                                            .id
                                                                                                    );
                                                                                                }}
                                                                                                className="!m-0 flex w-fit cursor-pointer flex-row items-center justify-start gap-2 px-0 pl-2 text-primary-500"
                                                                                            >
                                                                                                <Plus
                                                                                                    size={
                                                                                                        14
                                                                                                    }
                                                                                                    weight="bold"
                                                                                                    className="text-primary-400 group-hover:text-primary-500"
                                                                                                />
                                                                                                <span className="font-medium">
                                                                                                    Add{' '}
                                                                                                    {getTerminology(
                                                                                                        ContentTerms.Slides,
                                                                                                        SystemTerms.Slides
                                                                                                    )}
                                                                                                </span>
                                                                                            </MyButton>

                                                                                            {(
                                                                                                chapterSlidesMap[
                                                                                                    ch
                                                                                                        .chapter
                                                                                                        .id
                                                                                                ] ??
                                                                                                []
                                                                                            )
                                                                                                .length ===
                                                                                            0 ? (
                                                                                                <div className="px-2 py-1 text-xs text-gray-400">
                                                                                                    No{' '}
                                                                                                    {getTerminology(
                                                                                                        ContentTerms.Slides,
                                                                                                        SystemTerms.Slides
                                                                                                    )}{' '}
                                                                                                    in
                                                                                                    this
                                                                                                    chapter.
                                                                                                </div>
                                                                                            ) : (
                                                                                                (
                                                                                                    chapterSlidesMap[
                                                                                                        ch
                                                                                                            .chapter
                                                                                                            .id
                                                                                                    ] ??
                                                                                                    []
                                                                                                ).map(
                                                                                                    (
                                                                                                        slide,
                                                                                                        sIdx
                                                                                                    ) => (
                                                                                                        <div
                                                                                                            key={
                                                                                                                slide.id
                                                                                                            }
                                                                                                            className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1 text-xs text-gray-600 hover:bg-gray-100"
                                                                                                            onClick={() => {
                                                                                                                handleSlideNavigation(
                                                                                                                    subject.id,
                                                                                                                    mod
                                                                                                                        .module
                                                                                                                        .id,
                                                                                                                    ch
                                                                                                                        .chapter
                                                                                                                        .id,
                                                                                                                    slide.id
                                                                                                                );
                                                                                                            }}
                                                                                                        >
                                                                                                            <span className="w-7 shrink-0 text-center font-mono text-xs text-gray-400">
                                                                                                                S
                                                                                                                {sIdx +
                                                                                                                    1}
                                                                                                            </span>
                                                                                                            {getIcon(
                                                                                                                slide.source_type,
                                                                                                                slide
                                                                                                                    .document_slide
                                                                                                                    ?.type,
                                                                                                                '3'
                                                                                                            )}
                                                                                                            <span
                                                                                                                className="truncate"
                                                                                                                title={
                                                                                                                    slide.title
                                                                                                                }
                                                                                                            >
                                                                                                                {
                                                                                                                    slide.title
                                                                                                                }
                                                                                                            </span>
                                                                                                        </div>
                                                                                                    )
                                                                                                )
                                                                                            )}
                                                                                        </div>
                                                                                    </CollapsibleContent>
                                                                                </Collapsible>
                                                                            );
                                                                        }
                                                                    )}
                                                                </div>
                                                            </CollapsibleContent>
                                                        </Collapsible>
                                                    );
                                                }
                                            )}
                                        </div>
                                    </CollapsibleContent>
                                </Collapsible>
                            );
                        })}
                    {courseStructure === 4 &&
                        subjects.map((subject) => {
                            const isSubjectOpen = openSubjects.has(subject.id);

                            return (
                                <Collapsible
                                    key={subject.id}
                                    open={isSubjectOpen}
                                    onOpenChange={() => toggleSubject(subject.id)}
                                    className="group"
                                >
                                    <CollapsibleContent className="py-1">
                                        <div className="relative space-y-1.5 border-gray-200">
                                            <div className="absolute -left-[13px] top-0 h-full">
                                                <div className="sticky top-0 flex h-full flex-col items-center" />
                                            </div>

                                            <AddModulesButton
                                                isTextButton
                                                subjectId={subject.id}
                                                onAddModuleBySubjectId={handleAddModule}
                                            />
                                            {(subjectModulesMap[subject.id] ?? []).map(
                                                (mod, modIdx) => {
                                                    const isModuleOpen = openModules.has(
                                                        mod.module.id
                                                    );

                                                    return (
                                                        <Collapsible
                                                            key={mod.module.id}
                                                            open={isModuleOpen}
                                                            onOpenChange={() =>
                                                                toggleModule(mod.module.id)
                                                            }
                                                            className="group/module"
                                                        >
                                                            <CollapsibleTrigger className="flex w-full items-center rounded-md px-2 py-1.5 text-left text-sm font-medium text-gray-700 transition-colors duration-150 hover:bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2">
                                                                <div className="flex flex-1 items-center gap-2.5">
                                                                    {isModuleOpen ? (
                                                                        <CaretDown
                                                                            size={16}
                                                                            className="shrink-0 text-gray-500"
                                                                        />
                                                                    ) : (
                                                                        <CaretRight
                                                                            size={16}
                                                                            className="shrink-0 text-gray-500"
                                                                        />
                                                                    )}
                                                                    <FileText
                                                                        size={18}
                                                                        weight="duotone"
                                                                        className="shrink-0 text-blue-600"
                                                                    />
                                                                    <span className="w-7 shrink-0 rounded-md bg-gray-100 py-0.5 text-center font-mono text-xs font-medium text-gray-500 group-hover/module:bg-white">
                                                                        M{modIdx + 1}
                                                                    </span>
                                                                    <span
                                                                        className="truncate"
                                                                        title={
                                                                            mod.module.module_name
                                                                        }
                                                                    >
                                                                        {mod.module.module_name}
                                                                    </span>
                                                                </div>
                                                            </CollapsibleTrigger>
                                                            <CollapsibleContent className="py-1 pl-10">
                                                                <div className="relative space-y-1.5 border-l-2 border-dashed border-gray-200 pl-6">
                                                                    <AddChapterButton
                                                                        moduleId={mod.module.id}
                                                                        sessionId={selectedSession}
                                                                        levelId={selectedLevel}
                                                                        subjectId={subject.id}
                                                                        isTextButton
                                                                    />
                                                                    {(mod.chapters ?? []).map(
                                                                        (ch, chIdx) => {
                                                                            const isChapterOpen =
                                                                                openChapters.has(
                                                                                    ch.chapter.id
                                                                                );
                                                                            return (
                                                                                <Collapsible
                                                                                    key={
                                                                                        ch.chapter
                                                                                            .id
                                                                                    }
                                                                                    open={
                                                                                        isChapterOpen
                                                                                    }
                                                                                    onOpenChange={() =>
                                                                                        toggleChapter(
                                                                                            ch
                                                                                                .chapter
                                                                                                .id
                                                                                        )
                                                                                    }
                                                                                    className="group/chapter"
                                                                                >
                                                                                    <CollapsibleTrigger className="flex w-full items-center rounded-md px-2 py-1 text-left text-xs font-medium text-gray-600 transition-colors duration-150 hover:bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2">
                                                                                        <div className="flex flex-1 items-center gap-2">
                                                                                            {isChapterOpen ? (
                                                                                                <CaretDown
                                                                                                    size={
                                                                                                        14
                                                                                                    }
                                                                                                    className="shrink-0 text-gray-500"
                                                                                                />
                                                                                            ) : (
                                                                                                <CaretRight
                                                                                                    size={
                                                                                                        14
                                                                                                    }
                                                                                                    className="shrink-0 text-gray-500"
                                                                                                />
                                                                                            )}
                                                                                            <PresentationChart
                                                                                                size={
                                                                                                    16
                                                                                                }
                                                                                                weight="duotone"
                                                                                                className="shrink-0 text-green-600"
                                                                                            />
                                                                                            <span className="w-7 shrink-0 rounded-md bg-gray-100 py-0.5 text-center font-mono text-xs text-gray-500 group-hover/chapter:bg-white">
                                                                                                C
                                                                                                {chIdx +
                                                                                                    1}
                                                                                            </span>
                                                                                            <span
                                                                                                className="truncate"
                                                                                                title={
                                                                                                    ch
                                                                                                        .chapter
                                                                                                        .chapter_name
                                                                                                }
                                                                                            >
                                                                                                {
                                                                                                    ch
                                                                                                        .chapter
                                                                                                        .chapter_name
                                                                                                }
                                                                                            </span>
                                                                                        </div>
                                                                                    </CollapsibleTrigger>
                                                                                    <CollapsibleContent className="py-1 pl-9">
                                                                                        <div className="relative space-y-1.5 border-l-2 border-dashed border-gray-200 pl-6">
                                                                                            <MyButton
                                                                                                buttonType="text"
                                                                                                onClick={(
                                                                                                    e
                                                                                                ) => {
                                                                                                    e.stopPropagation();
                                                                                                    handleChapterNavigation(
                                                                                                        subject.id,
                                                                                                        mod
                                                                                                            .module
                                                                                                            .id,
                                                                                                        ch
                                                                                                            .chapter
                                                                                                            .id
                                                                                                    );
                                                                                                }}
                                                                                                className="!m-0 flex w-fit cursor-pointer flex-row items-center justify-start gap-2 px-0 pl-2 text-primary-500"
                                                                                            >
                                                                                                <Plus
                                                                                                    size={
                                                                                                        14
                                                                                                    }
                                                                                                    weight="bold"
                                                                                                    className="text-primary-400 group-hover:text-primary-500"
                                                                                                />
                                                                                                <span className="font-medium">
                                                                                                    Add{' '}
                                                                                                    {getTerminology(
                                                                                                        ContentTerms.Slides,
                                                                                                        SystemTerms.Slides
                                                                                                    )}
                                                                                                </span>
                                                                                            </MyButton>

                                                                                            {(
                                                                                                chapterSlidesMap[
                                                                                                    ch
                                                                                                        .chapter
                                                                                                        .id
                                                                                                ] ??
                                                                                                []
                                                                                            )
                                                                                                .length ===
                                                                                            0 ? (
                                                                                                <div className="px-2 py-1 text-xs text-gray-400">
                                                                                                    No{' '}
                                                                                                    {getTerminology(
                                                                                                        ContentTerms.Slides,
                                                                                                        SystemTerms.Slides
                                                                                                    )}{' '}
                                                                                                    in
                                                                                                    this
                                                                                                    chapter.
                                                                                                </div>
                                                                                            ) : (
                                                                                                (
                                                                                                    chapterSlidesMap[
                                                                                                        ch
                                                                                                            .chapter
                                                                                                            .id
                                                                                                    ] ??
                                                                                                    []
                                                                                                ).map(
                                                                                                    (
                                                                                                        slide,
                                                                                                        sIdx
                                                                                                    ) => (
                                                                                                        <div
                                                                                                            key={
                                                                                                                slide.id
                                                                                                            }
                                                                                                            className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1 text-xs text-gray-600 hover:bg-gray-100"
                                                                                                            onClick={() => {
                                                                                                                handleSlideNavigation(
                                                                                                                    subject.id,
                                                                                                                    mod
                                                                                                                        .module
                                                                                                                        .id,
                                                                                                                    ch
                                                                                                                        .chapter
                                                                                                                        .id,
                                                                                                                    slide.id
                                                                                                                );
                                                                                                            }}
                                                                                                        >
                                                                                                            <span className="w-7 shrink-0 text-center font-mono text-xs text-gray-400">
                                                                                                                S
                                                                                                                {sIdx +
                                                                                                                    1}
                                                                                                            </span>
                                                                                                            {getIcon(
                                                                                                                slide.source_type,
                                                                                                                slide
                                                                                                                    .document_slide
                                                                                                                    ?.type,
                                                                                                                '3'
                                                                                                            )}
                                                                                                            <span
                                                                                                                className="truncate"
                                                                                                                title={
                                                                                                                    slide.title
                                                                                                                }
                                                                                                            >
                                                                                                                {
                                                                                                                    slide.title
                                                                                                                }
                                                                                                            </span>
                                                                                                        </div>
                                                                                                    )
                                                                                                )
                                                                                            )}
                                                                                        </div>
                                                                                    </CollapsibleContent>
                                                                                </Collapsible>
                                                                            );
                                                                        }
                                                                    )}
                                                                </div>
                                                            </CollapsibleContent>
                                                        </Collapsible>
                                                    );
                                                }
                                            )}
                                        </div>
                                    </CollapsibleContent>
                                </Collapsible>
                            );
                        })}
                    {courseStructure === 3 &&
                        subjects.map((subject) => {
                            const isSubjectOpen = openSubjects.has(subject.id);

                            return (
                                <Collapsible
                                    key={subject.id}
                                    open={isSubjectOpen}
                                    onOpenChange={() => toggleSubject(subject.id)}
                                    className="group"
                                >
                                    <CollapsibleContent className="py-1">
                                        <div className="relative space-y-1.5 border-gray-200">
                                            <div className="absolute -left-[13px] top-0 h-full">
                                                <div className="sticky top-0 flex h-full flex-col items-center" />
                                            </div>

                                            {(subjectModulesMap[subject.id] ?? []).map((mod) => {
                                                const isModuleOpen = openModules.has(mod.module.id);

                                                return (
                                                    <Collapsible
                                                        key={mod.module.id}
                                                        open={isModuleOpen}
                                                        onOpenChange={() =>
                                                            toggleModule(mod.module.id)
                                                        }
                                                        className="group/module"
                                                    >
                                                        <CollapsibleContent className="py-1">
                                                            <div className="relative space-y-1.5  border-gray-200">
                                                                <AddChapterButton
                                                                    moduleId={mod.module.id}
                                                                    sessionId={selectedSession}
                                                                    levelId={selectedLevel}
                                                                    subjectId={subject.id}
                                                                    isTextButton
                                                                />
                                                                {(mod.chapters ?? []).map(
                                                                    (ch, chIdx) => {
                                                                        const isChapterOpen =
                                                                            openChapters.has(
                                                                                ch.chapter.id
                                                                            );
                                                                        return (
                                                                            <Collapsible
                                                                                key={ch.chapter.id}
                                                                                open={isChapterOpen}
                                                                                onOpenChange={() =>
                                                                                    toggleChapter(
                                                                                        ch.chapter
                                                                                            .id
                                                                                    )
                                                                                }
                                                                                className="group/chapter"
                                                                            >
                                                                                <CollapsibleTrigger className="flex w-full items-center rounded-md px-2 py-1 text-left text-xs font-medium text-gray-600 transition-colors duration-150 hover:bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2">
                                                                                    <div className="flex flex-1 items-center gap-2">
                                                                                        {isChapterOpen ? (
                                                                                            <CaretDown
                                                                                                size={
                                                                                                    14
                                                                                                }
                                                                                                className="shrink-0 text-gray-500"
                                                                                            />
                                                                                        ) : (
                                                                                            <CaretRight
                                                                                                size={
                                                                                                    14
                                                                                                }
                                                                                                className="shrink-0 text-gray-500"
                                                                                            />
                                                                                        )}
                                                                                        <PresentationChart
                                                                                            size={
                                                                                                16
                                                                                            }
                                                                                            weight="duotone"
                                                                                            className="shrink-0 text-green-600"
                                                                                        />
                                                                                        <span className="w-7 shrink-0 rounded-md bg-gray-100 py-0.5 text-center font-mono text-xs text-gray-500 group-hover/chapter:bg-white">
                                                                                            C
                                                                                            {chIdx +
                                                                                                1}
                                                                                        </span>
                                                                                        <span
                                                                                            className="truncate"
                                                                                            title={
                                                                                                ch
                                                                                                    .chapter
                                                                                                    .chapter_name
                                                                                            }
                                                                                        >
                                                                                            {
                                                                                                ch
                                                                                                    .chapter
                                                                                                    .chapter_name
                                                                                            }
                                                                                        </span>
                                                                                    </div>
                                                                                </CollapsibleTrigger>
                                                                                <CollapsibleContent className="py-1 pl-9">
                                                                                    <div className="relative space-y-1.5 border-l-2 border-dashed border-gray-200 pl-6">
                                                                                        <MyButton
                                                                                            buttonType="text"
                                                                                            onClick={(
                                                                                                e
                                                                                            ) => {
                                                                                                e.stopPropagation();
                                                                                                handleChapterNavigation(
                                                                                                    subject.id,
                                                                                                    mod
                                                                                                        .module
                                                                                                        .id,
                                                                                                    ch
                                                                                                        .chapter
                                                                                                        .id
                                                                                                );
                                                                                            }}
                                                                                            className="!m-0 flex w-fit cursor-pointer flex-row items-center justify-start gap-2 px-0 pl-2 text-primary-500"
                                                                                        >
                                                                                            <Plus
                                                                                                size={
                                                                                                    14
                                                                                                }
                                                                                                weight="bold"
                                                                                                className="text-primary-400 group-hover:text-primary-500"
                                                                                            />
                                                                                            <span className="font-medium">
                                                                                                Add{' '}
                                                                                                {getTerminology(
                                                                                                    ContentTerms.Slides,
                                                                                                    SystemTerms.Slides
                                                                                                )}
                                                                                            </span>
                                                                                        </MyButton>

                                                                                        {(
                                                                                            chapterSlidesMap[
                                                                                                ch
                                                                                                    .chapter
                                                                                                    .id
                                                                                            ] ?? []
                                                                                        ).length ===
                                                                                        0 ? (
                                                                                            <div className="px-2 py-1 text-xs text-gray-400">
                                                                                                No{' '}
                                                                                                {getTerminology(
                                                                                                    ContentTerms.Slides,
                                                                                                    SystemTerms.Slides
                                                                                                )}{' '}
                                                                                                in
                                                                                                this
                                                                                                chapter.
                                                                                            </div>
                                                                                        ) : (
                                                                                            (
                                                                                                chapterSlidesMap[
                                                                                                    ch
                                                                                                        .chapter
                                                                                                        .id
                                                                                                ] ??
                                                                                                []
                                                                                            ).map(
                                                                                                (
                                                                                                    slide,
                                                                                                    sIdx
                                                                                                ) => (
                                                                                                    <div
                                                                                                        key={
                                                                                                            slide.id
                                                                                                        }
                                                                                                        className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1 text-xs text-gray-600 hover:bg-gray-100"
                                                                                                        onClick={() => {
                                                                                                            handleSlideNavigation(
                                                                                                                subject.id,
                                                                                                                mod
                                                                                                                    .module
                                                                                                                    .id,
                                                                                                                ch
                                                                                                                    .chapter
                                                                                                                    .id,
                                                                                                                slide.id
                                                                                                            );
                                                                                                        }}
                                                                                                    >
                                                                                                        <span className="w-7 shrink-0 text-center font-mono text-xs text-gray-400">
                                                                                                            S
                                                                                                            {sIdx +
                                                                                                                1}
                                                                                                        </span>
                                                                                                        {getIcon(
                                                                                                            slide.source_type,
                                                                                                            slide
                                                                                                                .document_slide
                                                                                                                ?.type,
                                                                                                            '3'
                                                                                                        )}
                                                                                                        <span
                                                                                                            className="truncate"
                                                                                                            title={
                                                                                                                slide.title
                                                                                                            }
                                                                                                        >
                                                                                                            {
                                                                                                                slide.title
                                                                                                            }
                                                                                                        </span>
                                                                                                    </div>
                                                                                                )
                                                                                            )
                                                                                        )}
                                                                                    </div>
                                                                                </CollapsibleContent>
                                                                            </Collapsible>
                                                                        );
                                                                    }
                                                                )}
                                                            </div>
                                                        </CollapsibleContent>
                                                    </Collapsible>
                                                );
                                            })}
                                        </div>
                                    </CollapsibleContent>
                                </Collapsible>
                            );
                        })}

                    {courseStructure === 2 &&
                        subjects.map((subject) => {
                            const isSubjectOpen = openSubjects.has(subject.id);

                            return (
                                <Collapsible
                                    key={subject.id}
                                    open={isSubjectOpen}
                                    onOpenChange={() => toggleSubject(subject.id)}
                                    className="group"
                                >
                                    <CollapsibleContent className="py-1 ">
                                        <div className="relative space-y-1.5  border-gray-200 ">
                                            <div className="absolute -left-[13px] top-0 h-full">
                                                <div className="sticky top-0 flex h-full flex-col items-center" />
                                            </div>

                                            {(subjectModulesMap[subject.id] ?? []).map((mod) => {
                                                const isModuleOpen = openModules.has(mod.module.id);

                                                return (
                                                    <Collapsible
                                                        key={mod.module.id}
                                                        open={isModuleOpen}
                                                        onOpenChange={() =>
                                                            toggleModule(mod.module.id)
                                                        }
                                                        className="group/module"
                                                    >
                                                        <CollapsibleContent className="py-1">
                                                            <div className="relative space-y-1.5 border-gray-200">
                                                                {(mod.chapters ?? []).map((ch) => {
                                                                    const isChapterOpen =
                                                                        openChapters.has(
                                                                            ch.chapter.id
                                                                        );
                                                                    return (
                                                                        <Collapsible
                                                                            key={ch.chapter.id}
                                                                            open={isChapterOpen}
                                                                            onOpenChange={() =>
                                                                                toggleChapter(
                                                                                    ch.chapter.id
                                                                                )
                                                                            }
                                                                            className="group/chapter"
                                                                        >
                                                                            <CollapsibleContent className="py-1">
                                                                                <div className="relative space-y-1.5  border-gray-200 ">
                                                                                    <MyButton
                                                                                        buttonType="text"
                                                                                        onClick={(
                                                                                            e
                                                                                        ) => {
                                                                                            e.stopPropagation();
                                                                                            handleChapterNavigation(
                                                                                                subject.id,
                                                                                                mod
                                                                                                    .module
                                                                                                    .id,
                                                                                                ch
                                                                                                    .chapter
                                                                                                    .id
                                                                                            );
                                                                                        }}
                                                                                        className="!m-0 flex w-fit cursor-pointer flex-row items-center justify-start gap-2 px-0 pl-2 text-primary-500"
                                                                                    >
                                                                                        <Plus
                                                                                            size={
                                                                                                14
                                                                                            }
                                                                                            weight="bold"
                                                                                            className="text-primary-400 group-hover:text-primary-500"
                                                                                        />
                                                                                        <span className="font-medium">
                                                                                            Add{' '}
                                                                                            {getTerminology(
                                                                                                ContentTerms.Modules,
                                                                                                SystemTerms.Modules
                                                                                            )}
                                                                                        </span>
                                                                                    </MyButton>

                                                                                    {(
                                                                                        chapterSlidesMap[
                                                                                            ch
                                                                                                .chapter
                                                                                                .id
                                                                                        ] ?? []
                                                                                    ).length ===
                                                                                    0 ? (
                                                                                        <div className="px-2 py-1 text-xs text-gray-400">
                                                                                            No{' '}
                                                                                            {getTerminology(
                                                                                                ContentTerms.Slides,
                                                                                                SystemTerms.Slides
                                                                                            )}{' '}
                                                                                            in this
                                                                                            chapter.
                                                                                        </div>
                                                                                    ) : (
                                                                                        (
                                                                                            chapterSlidesMap[
                                                                                                ch
                                                                                                    .chapter
                                                                                                    .id
                                                                                            ] ?? []
                                                                                        ).map(
                                                                                            (
                                                                                                slide,
                                                                                                sIdx
                                                                                            ) => (
                                                                                                <div
                                                                                                    key={
                                                                                                        slide.id
                                                                                                    }
                                                                                                    className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1 text-xs text-gray-600 hover:bg-gray-100"
                                                                                                    onClick={() => {
                                                                                                        handleSlideNavigation(
                                                                                                            subject.id,
                                                                                                            mod
                                                                                                                .module
                                                                                                                .id,
                                                                                                            ch
                                                                                                                .chapter
                                                                                                                .id,
                                                                                                            slide.id
                                                                                                        );
                                                                                                    }}
                                                                                                >
                                                                                                    <span className="w-7 shrink-0 text-center font-mono text-xs text-gray-400">
                                                                                                        S
                                                                                                        {sIdx +
                                                                                                            1}
                                                                                                    </span>
                                                                                                    {getIcon(
                                                                                                        slide.source_type,
                                                                                                        slide
                                                                                                            .document_slide
                                                                                                            ?.type,
                                                                                                        '3'
                                                                                                    )}
                                                                                                    <span
                                                                                                        className="truncate"
                                                                                                        title={
                                                                                                            slide.title
                                                                                                        }
                                                                                                    >
                                                                                                        {
                                                                                                            slide.title
                                                                                                        }
                                                                                                    </span>
                                                                                                </div>
                                                                                            )
                                                                                        )
                                                                                    )}
                                                                                </div>
                                                                            </CollapsibleContent>
                                                                        </Collapsible>
                                                                    );
                                                                })}
                                                            </div>
                                                        </CollapsibleContent>
                                                    </Collapsible>
                                                );
                                            })}
                                        </div>
                                    </CollapsibleContent>
                                </Collapsible>
                            );
                        })}
                </div>
            </div>
        ),
        [TabType.STUDENT]: (
            <div className="rounded-md bg-white p-6 py-2 text-sm text-gray-600 shadow-sm">
                {currentSession && (
                    <Students
                        packageSessionId={packageSessionIds ?? ''}
                        currentSession={currentSession}
                    />
                )}
            </div>
        ),
        [TabType.TEACHERS]: (
            <div className="p-6 py-2">
                <div className="flex flex-col items-start justify-between gap-2 md:flex-row md:items-center">
                    <div className="flex-1">
                        <h2 className="text-base font-semibold text-gray-800">
                            Manage {getTerminology(RoleTerms.Teacher, SystemTerms.Teacher)}
                        </h2>
                        <p className="mt-0.5 text-xs text-gray-500">
                            View and manage{' '}
                            {getTerminology(
                                RoleTerms.Teacher,
                                SystemTerms.Teacher
                            ).toLocaleLowerCase()}
                            s assigned to this batch.
                        </p>
                    </div>
                    <AddTeachers packageSessionId={packageSessionIds} />
                </div>
                <TeachersList packageSessionId={packageSessionIds ?? ''} />
            </div>
        ),
        [TabType.ASSESSMENT]: (
            <div className="rounded-md bg-white p-6 py-2 text-sm text-gray-600 shadow-sm">
                <Assessments packageSessionId={packageSessionIds ?? ''} />
            </div>
        ),
    };

    const isLoading =
        addSubjectMutation.isPending ||
        deleteSubjectMutation.isPending ||
        updateSubjectMutation.isPending ||
        updateSubjectOrderMutation.isPending;

    return isLoading ? (
        <DashboardLoader />
    ) : (
        <div className="flex size-full flex-col gap-3 rounded-lg bg-white py-4 text-neutral-700">
            <Tabs value={selectedTab} onValueChange={handleTabChange} className="w-full">
                <div className="overflow-x-auto border-b border-gray-200">
                    <TabsList
                        className="h-auto min-w-max flex-nowrap bg-transparent p-0"
                        style={{ display: 'flex', justifyContent: 'left' }}
                    >
                        {tabs.map((tab) => (
                            <TabsTrigger
                                key={tab.value}
                                value={tab.value}
                                className={`data-[state=active]:text-primary-600 relative flex rounded-none border-b-2 border-transparent px-4 py-2 text-sm font-medium !shadow-none transition-colors duration-200 hover:bg-gray-100 data-[state=active]:border-primary-500 data-[state=active]:bg-primary-50`}
                            >
                                {tab.label}
                            </TabsTrigger>
                        ))}
                    </TabsList>
                </div>
                <TabsContent
                    key={selectedTab}
                    value={selectedTab}
                    className="mt-4 overflow-hidden rounded-r-md"
                >
                    {tabContent[selectedTab as TabType]}
                </TabsContent>
            </Tabs>
        </div>
    );
};
