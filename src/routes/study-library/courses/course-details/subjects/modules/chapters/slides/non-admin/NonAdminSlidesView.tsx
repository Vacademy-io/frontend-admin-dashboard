import { LayoutContainer } from '@/components/common/layout-container/layout-container';
import { SlideMaterial } from '@/routes/study-library/courses/course-details/subjects/modules/chapters/slides/-components/slide-material';
import { ChapterSidebarAddButton } from '../-components/slides-sidebar/slides-sidebar-add-button';
import { ChapterSidebarSlides } from '../-components/slides-sidebar/slides-sidebar-slides';
import '../slides-sidebar-scrollbar.css';
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
import { CaretLeft, Eye, UserGear, Lock } from 'phosphor-react';
import { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { SaveDraftProvider } from '../-context/saveDraftContext';
import { useStudyLibraryStore } from '@/stores/study-library/use-study-library-store';
import { useModulesWithChaptersStore } from '@/stores/study-library/use-modules-with-chapters-store';
import { SidebarProvider } from '@/components/ui/sidebar';
import { getTerminology } from '@/components/common/layout-container/sidebar/utils';
import { ContentTerms, SystemTerms } from '@/routes/settings/-components/NamingSettings';
import { useLearnerViewStore } from '../-stores/learner-view-store';
import { useNonAdminSlides } from './hooks/useNonAdminSlides';
import { SendForApprovalButton } from './components/ApprovalWorkflow/SendForApprovalButton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { PreviewChangesButton } from '@/components/study-library/course-comparison/PreviewChangesButton';

interface NonAdminSlidesViewProps {
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

export function NonAdminSlidesView({
    chapterId,
    courseId,
    levelId,
    subjectId,
    moduleId,
    sessionId,
}: NonAdminSlidesViewProps) {
    const navigate = useNavigate();
    const { studyLibraryData } = useStudyLibraryStore();
    const { modulesWithChaptersData } = useModulesWithChaptersStore();
    const [subjectName, setSubjectName] = useState('');
    const [moduleName, setModuleName] = useState('');
    const chapterName = useChapterName(chapterId);
    const { updateSlideOrder } = useSlidesMutations(chapterId);
    const { setNavHeading } = useNavHeadingStore();

    // Get course data and status
    const courseData = studyLibraryData?.find((item) => item.course.id === courseId);
    const courseStatus = courseData?.course?.status;
    const originalCourseId = courseData?.course?.originalCourseId || null;
    const isDraftCourse = courseStatus === 'DRAFT';
    const isReadOnlyMode = !isDraftCourse;

    // Non-admin slides management
    const { unsavedChanges, showApprovalButton, saveSlideAsPublished } =
        useNonAdminSlides(chapterId);

    // Debug logging
    console.log('🔍 NonAdminSlidesView state:');
    console.log('  isDraftCourse:', isDraftCourse);
    console.log('  isReadOnlyMode:', isReadOnlyMode);
    console.log('  showApprovalButton:', showApprovalButton);
    console.log('  hasUnsavedChanges:', unsavedChanges.hasChanges);
    console.log('  courseStatus:', courseStatus);
    console.log('  courseId:', courseId);

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
            if (isReadOnlyMode) {
                return; // Don't allow reordering in read-only mode
            }

            try {
                await updateSlideOrder({
                    chapterId: chapterId,
                    slideOrderPayload: slideOrderPayload,
                });
            } catch (error) {
                console.log('error updating slide order: ', error);
            }
        },
        [chapterId, updateSlideOrder, isReadOnlyMode]
    );

    useEffect(() => {
        setSubjectName(getSubjectName(subjectId || ''));
        setModuleName(getModuleName(moduleId || ''));
    }, [studyLibraryData, modulesWithChaptersData, subjectId, moduleId]);

    const heading = useMemo(
        () => (
            <div className="flex items-center gap-4">
                <CaretLeft onClick={() => window.history.back()} className="cursor-pointer" />
                <div className="flex items-center gap-2">
                    <span>{`${chapterName || ''} ${getTerminology(
                        ContentTerms.Slides,
                        SystemTerms.Slides
                    )}s`}</span>
                    {isReadOnlyMode && <Lock size={16} className="text-gray-500" />}
                </div>
            </div>
        ),
        [chapterName, isReadOnlyMode]
    );

    // Learner View Toggle Switch Component
    const LearnerViewToggle = () => {
        const { isLearnerView, toggleLearnerView } = useLearnerViewStore();

        return (
            <div className="flex items-center gap-3">
                <span className="text-xs font-medium text-neutral-600">
                    <UserGear className="size-4" />
                </span>

                <button
                    onClick={toggleLearnerView}
                    className={`
                        relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
                        ${isLearnerView ? 'bg-primary-500' : 'bg-neutral-300'}
                    `}
                    title={isLearnerView ? 'Switch to Instructor View' : 'Switch to Learner View'}
                >
                    <span
                        className={`
                            flex size-4 items-center justify-center rounded-full bg-white shadow-lg transition-transform duration-200 ease-in-out
                            ${isLearnerView ? 'translate-x-6' : 'translate-x-1'}
                        `}
                    >
                        {isLearnerView ? (
                            <Eye className="text-primary-600 size-2.5" />
                        ) : (
                            <UserGear className="size-2.5 text-neutral-600" />
                        )}
                    </span>
                </button>

                <span className="text-xs font-medium text-neutral-600">
                    <Eye className="size-4" />
                </span>
            </div>
        );
    };

    const { isLearnerView } = useLearnerViewStore();

    const SidebarComponent = useMemo(
        () => (
            <div className="flex size-full flex-col items-center">
                {/* Course Status Alert for Read-Only Mode */}
                {isReadOnlyMode && (
                    <div className="w-full p-3">
                        <Alert className="border-orange-200 bg-orange-50">
                            <Lock className="size-4 text-orange-600" />
                            <AlertDescription className="text-sm text-orange-800">
                                This course is {courseStatus?.toLowerCase()}. You can only view
                                content and answer doubts.
                            </AlertDescription>
                        </Alert>
                    </div>
                )}

                {/* Unified Header Section with Learner View Toggle and Breadcrumb */}
                <div className="to-primary-25 -mt-10 flex w-full flex-col border-b border-primary-100 bg-gradient-to-b from-primary-50 shadow-sm">
                    {/* Learner View Toggle */}
                    <div className="flex w-full justify-center px-3 pb-2 pt-3">
                        <LearnerViewToggle />
                    </div>

                    {/* Enhanced Breadcrumb */}
                    {(() => {
                        const isSubjectDefault =
                            subjectName?.toLowerCase() === 'default' || !subjectName;
                        const isModuleDefault =
                            moduleName?.toLowerCase() === 'default' || !moduleName;
                        const isChapterDefault =
                            chapterName?.toLowerCase() === 'default' || !chapterName;

                        // Don't show breadcrumb if all three are default
                        if (isSubjectDefault && isModuleDefault && isChapterDefault) {
                            return null;
                        }

                        const breadcrumbItems = [];

                        // Add subject if not default
                        if (!isSubjectDefault) {
                            breadcrumbItems.push(
                                <div
                                    key="subject"
                                    onClick={handleSubjectRoute}
                                    className="group flex cursor-pointer items-center"
                                >
                                    <span className="group-hover:text-primary-600 truncate text-sm font-medium text-neutral-600 transition-colors duration-200">
                                        {subjectName}
                                    </span>
                                </div>
                            );
                        }

                        // Add first chevron if subject is not default and module is not default
                        if (!isSubjectDefault && !isModuleDefault) {
                            breadcrumbItems.push(
                                <ChevronRightIcon
                                    key="chevron1"
                                    className="size-3.5 shrink-0 text-neutral-400"
                                />
                            );
                        }

                        // Add module if not default
                        if (!isModuleDefault) {
                            breadcrumbItems.push(
                                <div
                                    key="module"
                                    onClick={handleModuleRoute}
                                    className="group flex cursor-pointer items-center"
                                >
                                    <span className="group-hover:text-primary-600 truncate text-sm font-medium text-neutral-600 transition-colors duration-200">
                                        {moduleName}
                                    </span>
                                </div>
                            );
                        }

                        // Add second chevron if module is not default and chapter is not default
                        if (!isModuleDefault && !isChapterDefault) {
                            breadcrumbItems.push(
                                <ChevronRightIcon
                                    key="chevron2"
                                    className="size-3.5 shrink-0 text-neutral-400"
                                />
                            );
                        }

                        // Add chapter if not default
                        if (!isChapterDefault) {
                            breadcrumbItems.push(
                                <div key="chapter" className="flex items-center">
                                    <span className="text-primary-700 truncate rounded-md bg-primary-100/50 px-2 py-1 text-sm font-semibold">
                                        {chapterName}
                                    </span>
                                </div>
                            );
                        }

                        return (
                            <div className="flex w-full px-3 pb-3">
                                <div className="flex w-full flex-wrap items-center gap-2">
                                    {breadcrumbItems}
                                </div>
                            </div>
                        );
                    })()}
                </div>

                <div className={`flex w-full flex-1 flex-col gap-4 px-3 pb-3 pt-4`}>
                    <div className="flex w-full flex-col items-center gap-6 pb-10">
                        <ChapterSidebarSlides handleSlideOrderChange={handleSlideOrderChange} />
                    </div>
                </div>

                {/* Add Button - Only show for draft courses and when not in learner view */}
                {!isLearnerView && isDraftCourse && (
                    <div className="fixed bottom-0 flex w-[280px] items-center justify-center bg-primary-50 pb-3">
                        <ChapterSidebarAddButton />
                    </div>
                )}

                {/* Unsaved Changes Reminder */}
                {unsavedChanges.hasChanges && (
                    <div className="fixed inset-x-4 bottom-20 z-40">
                        <Alert className="border-amber-200 bg-amber-50 shadow-lg">
                            <AlertDescription className="text-sm text-amber-800">
                                You have unsaved changes in &quot;{unsavedChanges.slideTitle}&quot;.
                                Don&apos;t forget to save before switching slides.
                            </AlertDescription>
                        </Alert>
                    </div>
                )}
            </div>
        ),
        [
            isReadOnlyMode,
            courseStatus,
            subjectName,
            moduleName,
            chapterName,
            handleSubjectRoute,
            handleModuleRoute,
            handleSlideOrderChange,
            isLearnerView,
            isDraftCourse,
            unsavedChanges,
        ]
    );

    useEffect(() => {
        setNavHeading(heading);
    }, [heading, setNavHeading]);

    const getCurrentEditorHTMLContentRef = useRef<() => string>(() => '');

    // Create our custom save function for non-admin users
    const customSaveDraft = useCallback(
        async (slide: Slide) => {
            console.log('💾 SaveDraft called for non-admin:', {
                slideTitle: slide.title,
                slideId: slide.id,
                isDraftCourse,
                sourceType: slide.source_type,
                status: slide.status,
            });

            if (isDraftCourse) {
                // For non-admin users in draft courses, save as published
                console.log('🔄 Non-admin saving slide as published:', slide.title);

                // Get current editor content for document slides
                const currentEditorContent = getCurrentEditorHTMLContentRef.current();
                await saveSlideAsPublished(slide, true, currentEditorContent); // Pass editor content
            } else {
                console.log('⚠️ Read-only mode, not saving slide:', slide.title);
            }
        },
        [isDraftCourse, saveSlideAsPublished]
    );

    return (
        <SaveDraftProvider
            getCurrentEditorHTMLContent={() => getCurrentEditorHTMLContentRef.current()}
            saveDraft={customSaveDraft}
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
                                setSaveDraft={() => {}} // Not used when customSaveFunction is provided
                                isLearnerView={isLearnerView}
                                hidePublishButtons={true}
                                customSaveFunction={customSaveDraft}
                            />
                        </SidebarProvider>
                    </ModulesWithChaptersProvider>
                </InitStudyLibraryProvider>
            </LayoutContainer>

            {/* Action Buttons Container */}
            <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
                {/* Preview Changes Button - Show for all courses */}
                <PreviewChangesButton
                    currentCourseId={courseId}
                    originalCourseId={originalCourseId}
                    subjectId={subjectId}
                    packageSessionId={sessionId}
                    chapterId={chapterId}
                    disabled={unsavedChanges.hasChanges}
                />

                {/* Send for Approval Button - Only show for draft courses with changes */}
                {isDraftCourse && (
                    <SendForApprovalButton
                        courseId={courseId}
                        hasChanges={showApprovalButton}
                        disabled={unsavedChanges.hasChanges}
                    />
                )}
            </div>
        </SaveDraftProvider>
    );
}
