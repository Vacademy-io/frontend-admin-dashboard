import { StepsIcon } from '@phosphor-icons/react';
import { useRouter } from '@tanstack/react-router';
import {
    ChalkboardTeacher,
    Code,
    File,
    FileDoc,
    FilePdf,
    PlayCircle,
    Question,
} from 'phosphor-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useState, useEffect, useMemo } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { CourseDetailsFormValues, courseDetailsSchema } from './course-details-schema';
import { useStudyLibraryStore } from '@/stores/study-library/use-study-library-store';
import { useGetPackageSessionId } from '@/utils/helpers/study-library-helpers.ts/get-list-from-stores/getPackageSessionId';
import {
    VideoSlide,
    DocumentSlide,
    QuestionSlide,
    AssignmentSlide,
} from '../../-services/getAllSlides';
import { useQuery } from '@tanstack/react-query';
import { handleGetSlideCountDetails } from '../-services/get-slides-count';
import { CourseDetailsRatingsComponent } from './course-details-ratings-page';
import { getInstructorsBySessionAndLevel, transformApiDataToCourseData } from '../-utils/helper';
import { CourseStructureDetails } from './course-structure-details';
import { ContentTerms, SystemTerms } from '@/routes/settings/-components/NamingSettings';
import { getTerminology } from '@/components/common/layout-container/sidebar/utils';
import { AddCourseForm } from '@/components/common/study-library/add-course/add-course-form';
import { MyButton } from '@/components/design-system/button';
import { getPublicUrl } from '@/services/upload_file';

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

export type ChapterType = {
    id: string;
    name: string;
    status: string;
    file_id: string;
    description: string;
    chapter_order: number;
    slides: SlideType[];
    isOpen?: boolean;
};

export type ModuleType = {
    id: string;
    name: string;
    description: string;
    status: string;
    thumbnail_id: string;
    chapters: ChapterType[];
    isOpen?: boolean;
};

export type SubjectType = {
    id: string;
    subject_name: string;
    subject_code: string;
    credit: number;
    thumbnail_id: string | null;
    created_at: string | null;
    updated_at: string | null;
    modules: ModuleType[];
};

type Course = {
    id: string;
    title: string;
    level: 1 | 2 | 3 | 4 | 5;
    structure: {
        courseName: string;
        items: SubjectType[] | ModuleType[] | ChapterType[] | SlideType[];
    };
};

type SlideCountType = {
    slide_count: number;
    source_type: string;
};

const mockCourses: Course[] = [
    {
        id: '1',
        title: `2-Level ${getTerminology(ContentTerms.Level, SystemTerms.Level)} Structure`,
        level: 2,
        structure: {
            courseName: 'Introduction to Web Development',
            items: [] as SlideType[],
        },
    },
    {
        id: '2',
        title: `3-Level ${getTerminology(ContentTerms.Level, SystemTerms.Level)} Structure`,
        level: 3,
        structure: {
            courseName: 'Frontend Fundamentals',
            items: [] as SlideType[],
        },
    },
    {
        id: '3',
        title: `4-Level ${getTerminology(ContentTerms.Level, SystemTerms.Level)} Structure`,
        level: 4,
        structure: {
            courseName: 'Full-Stack JavaScript Development Mastery',
            items: [] as ModuleType[],
        },
    },
    {
        id: '4',
        title: `5-Level ${getTerminology(ContentTerms.Level, SystemTerms.Level)} Structure`,
        level: 5,
        structure: {
            courseName: 'Advanced Software Engineering Principles',
            items: [] as SubjectType[],
        },
    },
];

interface InstructorWithPicUrl {
    id: string;
    name: string;
    email: string;
    profilePicId?: string;
    profilePicUrl: string;
}

// Utility to extract YouTube video ID
const extractYouTubeVideoId = (url: string): string | null => {
    const regExp = /^.*(?:youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[1] && match[1].length === 11 ? match[1] : null;
};

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
                courseMediaId: {
                    type: '',
                    id: '',
                },
                coursePreviewImageMediaPreview: '',
                courseBannerMediaPreview: '',
                courseMediaPreview: '',
                courseHtmlDescription: '',
                instructors: [],
                sessions: [],
            },
            mockCourses: [],
        },
        mode: 'onChange',
    });

    const getInitials = (email: string) => {
        const name = email.split('@')[0];
        return name?.slice(0, 2).toUpperCase();
    };

    const [selectedSession, setSelectedSession] = useState<string>('');
    const [selectedLevel, setSelectedLevel] = useState<string>('');
    const [levelOptions, setLevelOptions] = useState<
        { _id: string; value: string; label: string }[]
    >([]);

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

    // Handle level change - clear expanded items and reset state
    const handleLevelChange = (levelId: string) => {
        setSelectedLevel(levelId);
    };

    // Set initial session and its levels
    useEffect(() => {
        if (sessionOptions.length > 0 && !selectedSession && sessionOptions[0]?.value) {
            const initialSessionId = sessionOptions[0].value;
            handleSessionChange(initialSessionId);
        }
    }, [sessionOptions]);

    useEffect(() => {
        const loadCourseData = async () => {
            if (courseDetailsData?.course) {
                try {
                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    // @ts-expect-error
                    const transformedData = await transformApiDataToCourseData(courseDetailsData);
                    if (transformedData) {
                        form.reset({
                            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                            // @ts-expect-error
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

    // Add this with other queries at the top level of the component
    const slideCountQuery = useQuery({
        ...handleGetSlideCountDetails(packageSessionIds),
        enabled: !!packageSessionIds,
    });

    useEffect(() => {
        form.setValue(
            'courseData.instructors',
            getInstructorsBySessionAndLevel(
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-expect-error
                courseDetailsData?.sessions,
                selectedSession,
                selectedLevel
            )
        );
    }, [currentLevel, currentSession]);

    console.log(form.getValues('courseData.instructors'));
    const [resolvedInstructors, setResolvedInstructors] = useState<InstructorWithPicUrl[]>([]);
    const [loadingInstructors, setLoadingInstructors] = useState(false);
    const instructors: Omit<InstructorWithPicUrl, 'profilePicUrl'>[] =
        form.getValues('courseData').instructors || [];

    useEffect(() => {
        let isMounted = true;
        async function preloadInstructorAvatars() {
            setLoadingInstructors(true);
            const uniqueProfilePicIds = [
                ...new Set(
                    instructors.map((i) => i.profilePicId).filter((id): id is string => Boolean(id))
                ),
            ];
            const idToUrl: Record<string, string> = {};
            await Promise.all(
                uniqueProfilePicIds.map(async (id) => {
                    try {
                        idToUrl[id] = await getPublicUrl(id);
                    } catch {
                        idToUrl[id] = '';
                    }
                })
            );
            if (isMounted) {
                setResolvedInstructors(
                    instructors.map((inst) => ({
                        ...inst,
                        profilePicUrl:
                            inst.profilePicId && idToUrl[inst.profilePicId]
                                ? idToUrl[inst.profilePicId]
                                : '',
                    })) as InstructorWithPicUrl[]
                );
                setLoadingInstructors(false);
            }
        }
        preloadInstructorAvatars();
        return () => {
            isMounted = false;
        };
    }, [JSON.stringify(instructors)]);

    return (
        <div className="flex min-h-screen flex-col bg-gray-50">
            {/* Top Banner */}
            <div
                className={`relative ${form.getValues('courseData.isCoursePublishedToCatalaouge') ? 'h-[350px]' : 'h-[300px]'}`}
            >
                {/* Transparent black overlay */}
                {form.watch('courseData').courseBannerMediaId ? (
                    <div className="pointer-events-none absolute inset-0 z-10 bg-black/50" />
                ) : (
                    <div className="pointer-events-none absolute inset-0 z-10 bg-black/10" />
                )}
                {!form.watch('courseData').courseBannerMediaId ? (
                    <div className="absolute inset-0 z-0 bg-transparent" />
                ) : (
                    <div className="absolute inset-0 z-0 opacity-70">
                        <img
                            src={form.watch('courseData').courseBannerMediaPreview}
                            alt="Course Banner"
                            className="size-full object-cover"
                            onError={(e) => {
                                e.currentTarget.style.display = 'none';
                                e.currentTarget.parentElement?.classList.add('bg-primary-500');
                            }}
                        />
                    </div>
                )}
                {/* Primary color overlay with 70% opacity */}
                <div
                    className={`container relative z-20 mx-auto px-4 py-12 ${!form.watch('courseData').courseBannerMediaId ? 'text-black' : 'text-white'}`}
                >
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
                                    <h1 className="mb-4 text-4xl font-bold">
                                        {form.getValues('courseData').title}
                                    </h1>
                                    <p
                                        className="text-lg opacity-90"
                                        dangerouslySetInnerHTML={{
                                            __html: form.getValues('courseData').description || '',
                                        }}
                                    />
                                    {form.getValues('courseData.isCoursePublishedToCatalaouge') && (
                                        <MyButton
                                            type="button"
                                            scale="large"
                                            buttonType="primary"
                                            className="mt-2 bg-success-100 font-medium !text-black hover:bg-success-100  focus:bg-success-100 active:bg-success-100"
                                        >
                                            Added to catalog
                                        </MyButton>
                                    )}
                                    <div className="mt-4 flex gap-2">
                                        {form.getValues('courseData').tags.map((tag, index) => (
                                            <span
                                                key={index}
                                                className="rounded-md border px-3 py-1 text-sm shadow-lg"
                                            >
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                    <AddCourseForm
                                        isEdit={true}
                                        initialCourseData={form.getValues()}
                                    />
                                </>
                            )}
                        </div>

                        {/* Right side - Video Player */}
                        {form.watch('courseData').courseMediaId.id &&
                            (form.watch('courseData').courseMediaId.type === 'youtube' ? (
                                <div className="w-[400px] overflow-hidden rounded-lg shadow-xl">
                                    <div className="relative flex aspect-video items-center justify-center bg-black">
                                        <iframe
                                            width="100%"
                                            height="100%"
                                            src={`https://www.youtube.com/embed/${extractYouTubeVideoId(form.watch('courseData').courseMediaId.id || '')}`}
                                            title="YouTube video player"
                                            frameBorder="0"
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                            allowFullScreen
                                            className="size-full rounded-lg object-contain"
                                        />
                                    </div>
                                </div>
                            ) : form.watch('courseData').courseMediaId.type === 'video' ? (
                                <div className="w-[400px] overflow-hidden rounded-lg shadow-xl">
                                    <div className="relative aspect-video bg-black">
                                        <video
                                            src={form.watch('courseData').courseMediaPreview}
                                            controls
                                            controlsList="nodownload noremoteplayback"
                                            disablePictureInPicture
                                            disableRemotePlayback
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
                                    </div>
                                </div>
                            ) : (
                                <div className="w-[400px] overflow-hidden rounded-lg shadow-xl">
                                    <div className="relative aspect-video bg-black">
                                        <img
                                            src={form.watch('courseData').courseMediaPreview}
                                            alt="Course Banner"
                                            className="size-full rounded-lg object-contain"
                                        />
                                    </div>
                                </div>
                            ))}
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="container mx-auto px-4 py-8">
                <div className="flex gap-8">
                    {/* Left Column - 2/3 width */}
                    <div className="flex w-2/3 grow flex-col">
                        {/* Session and Level Selectors */}
                        <div className="container mx-auto px-0 pb-6">
                            <div className="flex items-center gap-6">
                                {sessionOptions.length === 1 ? (
                                    sessionOptions[0]?.label !== 'default' && (
                                        <div className="flex flex-col gap-2">
                                            <label className="text-sm font-medium">
                                                {sessionOptions[0]?.label}
                                            </label>
                                        </div>
                                    )
                                ) : (
                                    <div className="flex flex-col gap-2">
                                        <label className="text-sm font-medium">
                                            {getTerminology(
                                                ContentTerms.Session,
                                                SystemTerms.Session
                                            )}
                                        </label>
                                        <Select
                                            value={selectedSession}
                                            onValueChange={handleSessionChange}
                                        >
                                            <SelectTrigger className="w-48">
                                                <SelectValue
                                                    placeholder={`Select ${getTerminology(
                                                        ContentTerms.Session,
                                                        SystemTerms.Session
                                                    )}`}
                                                />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {sessionOptions.map((option) => (
                                                    <SelectItem
                                                        key={option._id}
                                                        value={option.value}
                                                    >
                                                        {option.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                )}
                                {levelOptions.length === 1 ? (
                                    levelOptions[0]?.label !== 'default' && (
                                        <div className="flex flex-col gap-2">
                                            <label className="text-sm font-medium">
                                                {levelOptions[0]?.label}
                                            </label>
                                        </div>
                                    )
                                ) : (
                                    <div className="flex flex-col gap-2">
                                        <label className="text-sm font-medium">
                                            {getTerminology(ContentTerms.Level, SystemTerms.Level)}
                                        </label>
                                        <Select
                                            value={selectedLevel}
                                            onValueChange={handleLevelChange}
                                            disabled={!selectedSession}
                                        >
                                            <SelectTrigger className="w-48">
                                                <SelectValue
                                                    placeholder={`Select ${getTerminology(
                                                        ContentTerms.Level,
                                                        SystemTerms.Level
                                                    )}`}
                                                />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {levelOptions.map((option) => (
                                                    <SelectItem
                                                        key={option._id}
                                                        value={option.value}
                                                    >
                                                        {option.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                )}
                            </div>
                        </div>

                        <CourseStructureDetails
                            selectedSession={selectedSession}
                            selectedLevel={selectedLevel}
                            courseStructure={form.getValues('courseData.courseStructure')}
                        />

                        {/* What You'll Learn Section */}
                        {form.getValues('courseData').whatYoullLearn && (
                            <div className="mb-8 mt-6 bg-white p-6">
                                <h2 className="mb-4 text-2xl font-bold">What you&apos;ll learn?</h2>
                                <div className="rounded-lg">
                                    <p
                                        dangerouslySetInnerHTML={{
                                            __html:
                                                form.getValues('courseData').whatYoullLearn || '',
                                        }}
                                    />
                                </div>
                            </div>
                        )}

                        {/* About Content Section */}
                        {form.getValues('courseData').aboutTheCourse && (
                            <div className="mb-8">
                                <h2 className="mb-4 text-2xl font-bold">
                                    About this{' '}
                                    {getTerminology(
                                        ContentTerms.Course,
                                        SystemTerms.Course
                                    ).toLocaleLowerCase()}
                                </h2>
                                <div className="rounded-lg">
                                    <p
                                        dangerouslySetInnerHTML={{
                                            __html:
                                                form.getValues('courseData').aboutTheCourse || '',
                                        }}
                                    />
                                </div>
                            </div>
                        )}

                        {/* Who Should Join Section */}
                        {form.getValues('courseData').whoShouldLearn && (
                            <div className="mb-8 bg-white p-6">
                                <h2 className="mb-4 text-2xl font-bold">Who should join?</h2>
                                <div className="rounded-lg">
                                    <p
                                        dangerouslySetInnerHTML={{
                                            __html:
                                                form.getValues('courseData').whoShouldLearn || '',
                                        }}
                                    />
                                </div>
                            </div>
                        )}

                        {/* Instructors Section */}
                        {instructors && instructors.length > 0 && (
                            <div className="mb-8 bg-white p-6">
                                <h2 className="mb-4 text-2xl font-bold">Authors</h2>
                                {loadingInstructors ? (
                                    <div>Loading instructors...</div>
                                ) : (
                                    resolvedInstructors.map((instructor, index) => (
                                        <div key={index} className="flex gap-4 rounded-lg">
                                            <Avatar className="size-8">
                                                {instructor.profilePicUrl ? (
                                                    <AvatarImage
                                                        src={instructor.profilePicUrl}
                                                        alt={instructor.email}
                                                    />
                                                ) : (
                                                    <AvatarFallback className="bg-[#3B82F6] text-xs font-medium text-white">
                                                        {getInitials(instructor.email)}
                                                    </AvatarFallback>
                                                )}
                                            </Avatar>
                                            <h3 className="text-lg">{instructor.name}</h3>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}
                    </div>

                    {/* Right Column - 1/3 width */}
                    <div className="w-1/3">
                        <div className="sticky top-4 rounded-lg border bg-white p-6 shadow-lg">
                            {/* Course Stats */}
                            <h2 className="mb-4 text-lg font-bold">
                                {' '}
                                {form.getValues('courseData').title}
                            </h2>
                            <div className="space-y-4">
                                {levelOptions[0]?.label !== 'default' && (
                                    <div className="flex items-center gap-2">
                                        <StepsIcon size={18} />
                                        <span>
                                            {
                                                levelOptions.find(
                                                    (option) => option.value === selectedLevel
                                                )?.label
                                            }
                                        </span>
                                    </div>
                                )}
                                {slideCountQuery.isLoading ? (
                                    <div className="space-y-2">
                                        {[1, 2, 3, 4, 5].map((i) => (
                                            <div
                                                key={i}
                                                className="h-6 w-32 animate-pulse rounded bg-gray-200"
                                            />
                                        ))}
                                    </div>
                                ) : slideCountQuery.error ? (
                                    <div className="text-sm text-red-500">
                                        Error loading slide counts
                                    </div>
                                ) : (
                                    <>
                                        {slideCountQuery.data?.map((count: SlideCountType) => (
                                            <div
                                                key={count.source_type}
                                                className="flex items-center gap-2"
                                            >
                                                {count.source_type === 'VIDEO' && (
                                                    <>
                                                        <PlayCircle size={18} />
                                                        <span>
                                                            {count.slide_count} Video{' '}
                                                            {getTerminology(
                                                                ContentTerms.Slides,
                                                                SystemTerms.Slides
                                                            ).toLocaleLowerCase()}
                                                            s
                                                        </span>
                                                    </>
                                                )}
                                                {count.source_type === 'CODE' && (
                                                    <>
                                                        <Code size={18} />
                                                        <span>
                                                            {count.slide_count} Code{' '}
                                                            {getTerminology(
                                                                ContentTerms.Slides,
                                                                SystemTerms.Slides
                                                            ).toLocaleLowerCase()}
                                                            s
                                                        </span>
                                                    </>
                                                )}
                                                {count.source_type === 'PDF' && (
                                                    <>
                                                        <FilePdf size={18} />
                                                        <span>
                                                            {count.slide_count} PDF{' '}
                                                            {getTerminology(
                                                                ContentTerms.Slides,
                                                                SystemTerms.Slides
                                                            ).toLocaleLowerCase()}
                                                            s
                                                        </span>
                                                    </>
                                                )}
                                                {count.source_type === 'DOCUMENT' && (
                                                    <>
                                                        <FileDoc size={18} />
                                                        <span>
                                                            {count.slide_count} Doc{' '}
                                                            {getTerminology(
                                                                ContentTerms.Slides,
                                                                SystemTerms.Slides
                                                            ).toLocaleLowerCase()}
                                                            s
                                                        </span>
                                                    </>
                                                )}
                                                {count.source_type === 'QUESTION' && (
                                                    <>
                                                        <Question size={18} />
                                                        <span>
                                                            {count.slide_count} Question{' '}
                                                            {getTerminology(
                                                                ContentTerms.Slides,
                                                                SystemTerms.Slides
                                                            ).toLocaleLowerCase()}
                                                            s
                                                        </span>
                                                    </>
                                                )}
                                                {count.source_type === 'ASSIGNMENT' && (
                                                    <>
                                                        <File size={18} />
                                                        <span>
                                                            {count.slide_count} Assignment{' '}
                                                            {getTerminology(
                                                                ContentTerms.Slides,
                                                                SystemTerms.Slides
                                                            ).toLocaleLowerCase()}
                                                            s
                                                        </span>
                                                    </>
                                                )}
                                            </div>
                                        ))}
                                        {form.getValues('courseData').instructors.length > 0 && (
                                            <div className="flex items-center gap-2">
                                                <ChalkboardTeacher size={18} />
                                                <span>
                                                    {form
                                                        .getValues('courseData')
                                                        .instructors.map((i) => i.name)
                                                        .join(', ')}
                                                </span>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
                <CourseDetailsRatingsComponent
                    currentSession={selectedSession}
                    currentLevel={selectedLevel}
                />
            </div>
        </div>
    );
};
