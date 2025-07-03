import { LayoutContainer } from '@/components/common/layout-container/layout-container';
import { SlideMaterial } from '@/routes/study-library/courses/course-details/subjects/modules/chapters/slides/-components/slide-material';
import { ChapterSidebarAddButton } from './-components/slides-sidebar/slides-sidebar-add-button';
import { ChapterSidebarSlides } from './-components/slides-sidebar/slides-sidebar-slides';
import './slides-sidebar-scrollbar.css';
import { studyLibrarySteps } from '@/constants/intro/steps';
import { StudyLibraryIntroKey } from '@/constants/storage/introKey';
import {
    Slide,
    slideOrderPayloadType,
    useSlidesMutations,
} from '@/routes/study-library/courses/course-details/subjects/modules/chapters/slides/-hooks/use-slides';
import useIntroJsTour from '@/hooks/use-intro';
import { InitStudyLibraryProvider } from '@/providers/study-library/init-study-library-provider';
import { ModulesWithChaptersProvider } from '@/providers/study-library/modules-with-chapters-provider';
import { useNavHeadingStore } from '@/stores/layout-container/useNavHeadingStore';
import { useChapterName } from '@/utils/helpers/study-library-helpers.ts/get-name-by-id/getChapterNameById';
import { getModuleName } from '@/utils/helpers/study-library-helpers.ts/get-name-by-id/getModuleNameById';
import { getSubjectName } from '@/utils/helpers/study-library-helpers.ts/get-name-by-id/getSubjectNameById';
import { ChevronRightIcon } from '@radix-ui/react-icons';
import { useNavigate } from '@tanstack/react-router';
import { createFileRoute } from '@tanstack/react-router';
import { CaretLeft } from 'phosphor-react';
import { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { SaveDraftProvider } from './-context/saveDraftContext';
import { useStudyLibraryStore } from '@/stores/study-library/use-study-library-store';
import { useModulesWithChaptersStore } from '@/stores/study-library/use-modules-with-chapters-store';
import { SidebarProvider } from '@/components/ui/sidebar';

interface ChapterSearchParams {
    courseId: string;
    levelId: string;
    subjectId: string;
    moduleId: string;
    chapterId: string;
    slideId: string;
    sessionId: string;
    timestamp?: number;
    currentPage?: number;
}

export const Route = createFileRoute(
    '/study-library/courses/course-details/subjects/modules/chapters/slides/'
)({
    component: RouteComponent,
    validateSearch: (search: Record<string, unknown>): ChapterSearchParams => {
        return {
            courseId: search.courseId as string,
            levelId: search.levelId as string,
            subjectId: search.subjectId as string,
            moduleId: search.moduleId as string,
            chapterId: search.chapterId as string,
            slideId: search.slideId as string,
            sessionId: search.sessionId as string,
            ...(typeof search.timestamp === 'number' && { timestamp: search.timestamp }),
            ...(typeof search.currentPage === 'number' && { currentPage: search.currentPage }),
        };
    },
});

function RouteComponent() {
    const { chapterId, courseId, levelId, subjectId, moduleId, sessionId } = Route.useSearch();
    const navigate = useNavigate();
    const { studyLibraryData } = useStudyLibraryStore();
    const { modulesWithChaptersData } = useModulesWithChaptersStore();
    const [subjectName, setSubjectName] = useState('');
    const [moduleName, setModuleName] = useState('');
    const chapterName = useChapterName(chapterId);
    const { updateSlideOrder } = useSlidesMutations(chapterId);
    const { setNavHeading } = useNavHeadingStore();

    useIntroJsTour({
        key: StudyLibraryIntroKey.addSlidesStep,
        steps: studyLibrarySteps.addSlidesStep,
    });

    const handleSubjectRoute = useCallback(() => {
        navigate({
            to: '/study-library/courses/course-details/subjects/modules',
            params: {},
            search: {
                courseId: courseId,
                levelId: levelId,
                subjectId: subjectId,
                sessionId: sessionId,
            },
            hash: '',
        });
    }, [courseId, levelId, subjectId, sessionId, navigate]);

    const handleModuleRoute = useCallback(() => {
        navigate({
            to: '/study-library/courses/course-details/subjects/modules/chapters',
            params: {},
            search: {
                courseId: courseId,
                levelId: levelId,
                subjectId: subjectId,
                moduleId: moduleId,
                sessionId: sessionId,
            },
            hash: '',
        });
    }, [courseId, levelId, subjectId, moduleId, sessionId, navigate]);

    const handleSlideOrderChange = useCallback(
        async (slideOrderPayload: slideOrderPayloadType) => {
            try {
                await updateSlideOrder({
                    chapterId: chapterId,
                    slideOrderPayload: slideOrderPayload,
                });
            } catch (error) {
                console.log('error updating slide order: ', error);
            }
        },
        [chapterId, updateSlideOrder]
    );

    useEffect(() => {
        setSubjectName(getSubjectName(subjectId || ''));
        setModuleName(getModuleName(moduleId || ''));
    }, [studyLibraryData, modulesWithChaptersData, subjectId, moduleId]);

    const handleBackClick = useCallback(() => {
        navigate({
            to: `/study-library/courses/course-details/subjects/modules/chapters`,
            search: {
                courseId,
                levelId,
                subjectId,
                moduleId,
                sessionId: sessionId,
            },
        });
    }, [courseId, levelId, subjectId, moduleId, sessionId, navigate]);

    const heading = useMemo(
        () => (
            <div className="flex items-center gap-4">
                <CaretLeft onClick={handleBackClick} className="cursor-pointer" />
                <div>{`${chapterName || ''} Slides`}</div>
            </div>
        ),
        [chapterName, handleBackClick]
    );

    const SidebarComponent = useMemo(
        () => (
            <div className="flex w-full flex-col items-center">
                <div className={`flex w-full flex-col gap-6 px-3 pb-3 `}>
                    <div className="flex flex-wrap items-center gap-1 text-neutral-500">
                        <p onClick={handleSubjectRoute} className="cursor-pointer ">
                            {subjectName}
                        </p>
                        <ChevronRightIcon className={`size-4 `} />
                        <p onClick={handleModuleRoute} className="cursor-pointer ">
                            {moduleName}
                        </p>
                        <ChevronRightIcon className={`size-4 `} />
                        <p className="cursor-pointer text-primary-500">{chapterName}</p>
                    </div>
                    <div className="flex w-full flex-col items-center gap-6 pb-10">
                        <ChapterSidebarSlides handleSlideOrderChange={handleSlideOrderChange} />
                    </div>
                </div>
                <div className="fixed bottom-0 flex w-[280px] items-center justify-center bg-primary-50 pb-3">
                    <ChapterSidebarAddButton />
                </div>
            </div>
        ),
        [
            subjectName,
            moduleName,
            chapterName,
            handleSubjectRoute,
            handleModuleRoute,
            handleSlideOrderChange,
        ]
    );

    useEffect(() => {
        setNavHeading(heading);
    }, [heading, setNavHeading]);

    const getCurrentEditorHTMLContentRef = useRef<() => string>(() => '');
    const saveDraftRef = useRef(async (slide: Slide) => {
        console.log('slide for saving draft: ', slide);
    });

    return (
        <SaveDraftProvider
            getCurrentEditorHTMLContent={() => getCurrentEditorHTMLContentRef.current()}
            saveDraft={(slide) => saveDraftRef.current(slide)}
        >
            <LayoutContainer
                internalSidebarComponent={SidebarComponent}
                hasInternalSidebarComponent={true}
            >
                <InitStudyLibraryProvider>
                    <ModulesWithChaptersProvider>
                        <SidebarProvider defaultOpen={false}>
                            <SlideMaterial
                                setGetCurrentEditorHTMLContent={(fn) =>
                                    (getCurrentEditorHTMLContentRef.current = fn)
                                }
                                setSaveDraft={(fn) => (saveDraftRef.current = fn)}
                            />
                        </SidebarProvider>
                    </ModulesWithChaptersProvider>
                </InitStudyLibraryProvider>
            </LayoutContainer>
        </SaveDraftProvider>
    );
}
