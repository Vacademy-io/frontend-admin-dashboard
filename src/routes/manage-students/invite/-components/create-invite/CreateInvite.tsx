import { MyButton } from '@/components/design-system/button';
import { useRef, useEffect } from 'react';
import { Plus, X, CaretDown, Check } from 'phosphor-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import GenerateInviteLinkDialog from './GenerateInviteLinkDialog';
import { useQueryClient, useSuspenseQuery } from '@tanstack/react-query';
import { useStudyLibraryQuery } from '@/routes/study-library/courses/-services/getStudyLibraryDetails';
import { transformApiDataToDummyStructure } from './-utils/helper';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
    createInviteSchema,
    CreateInviteFormValues,
    defaultCreateInviteValues,
    Course,
    Session,
    Level,
    Batch,
} from './CreateInviteSchema';

type DummyBatchesType = {
    [key: string]: Session[];
};

const CreateInvite = () => {
    const { data: studyLibraryCoursesData } = useSuspenseQuery(useStudyLibraryQuery());
    const dummyCourses = transformApiDataToDummyStructure(studyLibraryCoursesData).dummyCourses;
    const dummyBatches = transformApiDataToDummyStructure(studyLibraryCoursesData).dummyBatches;
    const dummyBatchesTyped: DummyBatchesType = dummyBatches;
    const queryClient = useQueryClient();

    // Initialize form with react-hook-form
    const form = useForm<CreateInviteFormValues>({
        resolver: zodResolver(createInviteSchema),
        defaultValues: defaultCreateInviteValues,
        mode: 'onChange',
    });

    const { watch, setValue } = form;

    // Watch form values
    const selectedCourse = watch('selectedCourse');
    const selectedSession = watch('selectedSession');
    const selectedLevel = watch('selectedLevel');
    const selectedBatches = watch('selectedBatches');
    const showCourseDropdown = watch('showCourseDropdown');
    const showSessionDropdown = watch('showSessionDropdown');
    const showLevelDropdown = watch('showLevelDropdown');
    const showSummaryDialog = watch('showSummaryDialog');
    const dialogOpen = watch('dialogOpen');

    // Refs for dropdowns
    const courseDropdownRef = useRef<HTMLDivElement>(null);
    const sessionDropdownRef = useRef<HTMLDivElement>(null);
    const levelDropdownRef = useRef<HTMLDivElement>(null);

    const handleSelectCourse = (course: Course): void => {
        setValue('selectedCourse', course);
        setValue('selectedSession', null);
        setValue('selectedLevel', null);
        setValue('selectedBatches', []);
        setValue('showCourseDropdown', false);
    };

    const handleSelectSession = (session: Session): void => {
        setValue('selectedSession', session);
        setValue('selectedLevel', null);
        setValue('showSessionDropdown', false);
    };

    const handleSelectLevel = (level: Level): void => {
        setValue('selectedLevel', level);
        setValue('showLevelDropdown', false);
    };

    const handleAddBatch = (): void => {
        if (selectedSession && selectedLevel) {
            const newBatch: Batch = {
                sessionId: selectedSession.sessionId,
                levelId: selectedLevel.levelId,
                sessionName: selectedSession.sessionName,
                levelName: selectedLevel.levelName,
            };
            setValue('selectedBatches', [...selectedBatches, newBatch]);
            setValue('selectedSession', null);
            setValue('selectedLevel', null);
        }
    };

    const handleRemoveBatch = (idx: number): void => {
        setValue(
            'selectedBatches',
            selectedBatches.filter((_, i) => i !== idx)
        );
    };

    const sessions: Session[] = selectedCourse ? dummyBatchesTyped[selectedCourse.id] || [] : [];
    const levels: Level[] = selectedSession ? selectedSession.levels : [];

    // Click outside for course dropdown
    useEffect(() => {
        if (!showCourseDropdown) return;
        function handleClick(e: MouseEvent) {
            if (
                courseDropdownRef.current &&
                !courseDropdownRef.current.contains(e.target as Node)
            ) {
                setValue('showCourseDropdown', false);
            }
        }
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, [showCourseDropdown, setValue]);

    // Click outside for session dropdown
    useEffect(() => {
        if (!showSessionDropdown) return;
        function handleClick(e: MouseEvent) {
            if (
                sessionDropdownRef.current &&
                !sessionDropdownRef.current.contains(e.target as Node)
            ) {
                setValue('showSessionDropdown', false);
            }
        }
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, [showSessionDropdown, setValue]);

    // Click outside for level dropdown
    useEffect(() => {
        if (!showLevelDropdown) return;
        function handleClick(e: MouseEvent) {
            if (levelDropdownRef.current && !levelDropdownRef.current.contains(e.target as Node)) {
                setValue('showLevelDropdown', false);
            }
        }
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, [showLevelDropdown, setValue]);

    return (
        <>
            <div>
                <Dialog open={dialogOpen} onOpenChange={(open) => setValue('dialogOpen', open)}>
                    <DialogTrigger asChild>
                        <MyButton
                            type="button"
                            scale="medium"
                            buttonType="secondary"
                            className="flex items-center gap-1 border-none bg-gray-100 p-4 py-5 font-semibold hover:bg-gray-200"
                        >
                            <Plus size={18} weight="fill" />
                            Create Invite Link
                        </MyButton>
                    </DialogTrigger>
                    <DialogContent className="animate-fadeIn min-w-[500px]">
                        <DialogHeader>
                            <DialogTitle>Select Course and Batches</DialogTitle>
                        </DialogHeader>
                        {/* Course Select */}
                        <div className="mb-1 mt-4 flex flex-col gap-2 text-sm font-medium">
                            <span>Select Course</span>
                            <div className="relative" ref={courseDropdownRef}>
                                <button
                                    className="flex w-full items-center justify-between rounded-lg border bg-white px-3 py-2 shadow-sm transition-all duration-150 hover:shadow-md"
                                    onClick={() =>
                                        setValue('showCourseDropdown', !showCourseDropdown)
                                    }
                                    type="button"
                                >
                                    <span
                                        className={
                                            selectedCourse ? 'text-gray-900' : 'text-gray-400'
                                        }
                                    >
                                        {selectedCourse ? selectedCourse.name : 'Choose a course'}
                                    </span>
                                    <CaretDown size={18} />
                                </button>
                                {showCourseDropdown && (
                                    <div className="absolute z-10 mt-1 w-full rounded border bg-white shadow">
                                        {dummyCourses.map((course) => (
                                            <div
                                                key={course.id}
                                                className="flex cursor-pointer items-center gap-2 px-3 py-2 transition-colors hover:bg-gray-100"
                                                onClick={() => handleSelectCourse(course)}
                                            >
                                                {selectedCourse ? (
                                                    <span
                                                        style={{
                                                            width: 20,
                                                            display: 'inline-block',
                                                        }}
                                                    >
                                                        {selectedCourse.id === course.id && (
                                                            <Check
                                                                size={18}
                                                                className="text-black"
                                                            />
                                                        )}
                                                    </span>
                                                ) : null}
                                                <span>{course.name}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                        {/* Add Batch Section */}
                        {selectedCourse && (
                            <div className="animate-fadeIn mt-3">
                                <div className="mb-2 text-sm font-semibold">Add Batch</div>
                                <div className="mb-2 flex gap-2">
                                    {/* Session Dropdown */}
                                    <div className="relative flex-1" ref={sessionDropdownRef}>
                                        <button
                                            className={`flex w-full items-center justify-between rounded-lg border bg-white px-3 py-2 shadow-sm transition-all duration-150 ${selectedBatches.length > 0 ? 'cursor-not-allowed opacity-50' : 'hover:shadow-md'}`}
                                            onClick={() =>
                                                selectedBatches.length === 0 &&
                                                setValue(
                                                    'showSessionDropdown',
                                                    !showSessionDropdown
                                                )
                                            }
                                            type="button"
                                            disabled={selectedBatches.length > 0}
                                        >
                                            <span
                                                className={
                                                    selectedSession
                                                        ? 'text-gray-900'
                                                        : 'text-gray-400'
                                                }
                                            >
                                                {selectedSession
                                                    ? selectedSession.sessionName
                                                    : 'Select session'}
                                            </span>
                                            <CaretDown size={18} />
                                        </button>
                                        {showSessionDropdown && selectedBatches.length === 0 && (
                                            <div className="absolute z-10 mt-1 w-full rounded border bg-white shadow">
                                                {sessions.map((session) => (
                                                    <div
                                                        key={session.sessionId}
                                                        className="flex cursor-pointer items-center gap-2 px-3 py-2 transition-colors hover:bg-gray-100"
                                                        onClick={() => handleSelectSession(session)}
                                                    >
                                                        {selectedSession ? (
                                                            <span
                                                                style={{
                                                                    width: 20,
                                                                    display: 'inline-block',
                                                                }}
                                                            >
                                                                {selectedSession.sessionId ===
                                                                    session.sessionId && (
                                                                    <Check
                                                                        size={18}
                                                                        className="text-black"
                                                                    />
                                                                )}
                                                            </span>
                                                        ) : null}
                                                        <span>{session.sessionName}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    {/* Level Dropdown */}
                                    <div className="relative flex-1" ref={levelDropdownRef}>
                                        <button
                                            className={`flex w-full items-center justify-between rounded-lg border bg-white px-3 py-2 shadow-sm transition-all duration-150 ${!selectedSession || selectedBatches.length > 0 ? 'cursor-not-allowed opacity-50' : 'hover:shadow-md'}`}
                                            onClick={() =>
                                                selectedSession &&
                                                selectedBatches.length === 0 &&
                                                setValue('showLevelDropdown', !showLevelDropdown)
                                            }
                                            type="button"
                                            disabled={
                                                !selectedSession || selectedBatches.length > 0
                                            }
                                        >
                                            <span
                                                className={
                                                    selectedLevel
                                                        ? 'text-gray-900'
                                                        : 'text-gray-400'
                                                }
                                            >
                                                {selectedLevel
                                                    ? selectedLevel.levelName
                                                    : 'Select level'}
                                            </span>
                                            <CaretDown size={18} />
                                        </button>
                                        {showLevelDropdown &&
                                            selectedSession &&
                                            selectedBatches.length === 0 && (
                                                <div className="absolute z-10 mt-1 w-full rounded border bg-white shadow">
                                                    {levels.map((level) => (
                                                        <div
                                                            key={level.levelId}
                                                            className="flex cursor-pointer items-center gap-2 px-3 py-2 transition-colors hover:bg-gray-100"
                                                            onClick={() => handleSelectLevel(level)}
                                                        >
                                                            {selectedLevel ? (
                                                                <span
                                                                    style={{
                                                                        width: 20,
                                                                        display: 'inline-block',
                                                                    }}
                                                                >
                                                                    {selectedLevel.levelId ===
                                                                        level.levelId && (
                                                                        <Check
                                                                            size={18}
                                                                            className="text-black"
                                                                        />
                                                                    )}
                                                                </span>
                                                            ) : null}
                                                            <span>{level.levelName}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                    </div>
                                </div>
                                <MyButton
                                    type="button"
                                    scale="small"
                                    buttonType="secondary"
                                    className="mt-2 w-full border-none bg-neutral-200 p-5 transition-transform duration-150 hover:border-none hover:bg-neutral-200 disabled:cursor-not-allowed disabled:bg-neutral-200 disabled:opacity-50"
                                    disable={
                                        !(selectedSession && selectedLevel) ||
                                        selectedBatches.length > 0
                                    }
                                    onClick={handleAddBatch}
                                >
                                    <Plus size={16} className="mr-1" /> Add Batch
                                </MyButton>
                                {/* Selected Batches List */}
                                {selectedBatches.length > 0 && (
                                    <div className="animate-fadeIn mt-4">
                                        <div className="mb-1 text-sm font-semibold">
                                            Selected Batches
                                        </div>
                                        <ul className="mt-2 space-y-1">
                                            {selectedBatches.map((batch, idx) => (
                                                <li
                                                    key={batch.sessionId + batch.levelId}
                                                    className="flex items-center justify-between rounded-lg bg-gray-50 px-5 py-3"
                                                >
                                                    <span className="text-xs font-bold">
                                                        {batch.sessionName} - {batch.levelName}
                                                    </span>
                                                    <button
                                                        className="ml-2 text-gray-400 transition-colors hover:text-red-500"
                                                        onClick={() => handleRemoveBatch(idx)}
                                                        type="button"
                                                    >
                                                        <X size={16} />
                                                    </button>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        )}
                        {/* Action Buttons */}
                        <div className="mt-8 flex justify-end gap-3">
                            <MyButton
                                type="button"
                                scale="medium"
                                buttonType="secondary"
                                onClick={() => setValue('dialogOpen', false)}
                                className="bg-neutral-100 hover:border-none hover:bg-neutral-200"
                            >
                                Cancel
                            </MyButton>
                            <MyButton
                                type="button"
                                scale="medium"
                                buttonType="primary"
                                disable={selectedBatches.length === 0}
                                onClick={async () => {
                                    setValue('showSummaryDialog', true);
                                    await queryClient.invalidateQueries({
                                        queryKey: ['GET_PAYMENT_DETAILS'],
                                    });
                                }}
                            >
                                Continue
                            </MyButton>
                        </div>
                    </DialogContent>
                    {/* Summary Dialog */}
                    <GenerateInviteLinkDialog
                        selectedCourse={selectedCourse}
                        selectedBatches={selectedBatches}
                        showSummaryDialog={showSummaryDialog}
                        setShowSummaryDialog={(open) => setValue('showSummaryDialog', open)}
                        setDialogOpen={(open) => setValue('dialogOpen', open)}
                        selectCourseForm={form}
                    />
                </Dialog>
            </div>
        </>
    );
};

export default CreateInvite;
