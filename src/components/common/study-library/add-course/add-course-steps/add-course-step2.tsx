import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Form } from '@/components/ui/form';
import React, { useState, useEffect } from 'react';
import { Trash2, Plus, Calendar } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import AddCourseStep2StructureTypes from './add-course-step2-structure-types';
import { MyButton } from '@/components/design-system/button';
import SessionLevelMappingDialog from './SessionLevelMappingDialog';
import MultiSelectDropdown from '@/components/common/multi-select-dropdown';
import { fetchInstituteDashboardUsers } from '@/routes/dashboard/-services/dashboard-services';
import { getInstituteId } from '@/constants/helper';
import InviteInstructorForm from './InviteInstructorForm';
import { UserRolesDataEntry } from '@/types/dashboard/user-roles';
import { CODE_CIRCLE_INSTITUTE_ID } from '@/constants/urls';
import { getTokenDecodedData, getTokenFromCookie } from '@/lib/auth/sessionUtility';
import { TokenKey } from '@/constants/auth/tokens';
import { useInstituteDetailsStore } from '@/stores/students/students-list/useInstituteDetailsStore';
import { RoleType } from '@/constants/dummy-data';

interface Level {
    id: string;
    name: string;
    userIds: Instructor[];
    batchId: string;
}

interface Session {
    id: string;
    name: string;
    startDate: string;
    levels: Level[];
    batchId?: string;
}

interface Instructor {
    id: string;
    email: string;
    name: string;
    profilePicId: string;
}

// Update the schema
export const step2Schema = z.object({
    levelStructure: z.number(),
    hasLevels: z.string(),
    hasSessions: z.string(),
    sessions: z
        .array(
            z.object({
                id: z.string(),
                name: z.string(),
                startDate: z.string(),
                levels: z.array(
                    z.object({
                        id: z.string(),
                        name: z.string(),
                        userIds: z
                            .array(
                                z.object({
                                    id: z.string(),
                                    email: z.string(),
                                    name: z.string(),
                                    profilePicId: z.string(),
                                })
                            )
                            .default([]),
                    })
                ),
            })
        )
        .default([]),
    selectedInstructors: z
        .array(
            z.object({
                id: z.string(),
                name: z.string(),
                email: z.string(),
                profilePicId: z.string(),
            })
        )
        .default([]),
    instructors: z
        .array(
            z.object({
                id: z.string(),
                name: z.string(),
                email: z.string(),
                profilePicId: z.string(),
            })
        )
        .optional(),
    publishToCatalogue: z.boolean(),
});

export type Step2Data = z.infer<typeof step2Schema>;

// Add this interface before the AddCourseStep2 component
interface InstructorMapping {
    id: string;
    email: string;
    sessionLevels: Array<{
        sessionId: string;
        sessionName: string;
        levelId: string;
        levelName: string;
        batchId?: string;
    }>;
}

// Define a type for batches at the top of the file:
interface PackageDTO {
    id?: string;
    package_name?: string;
    thumbnail_file_id?: string;
    is_course_published_to_catalaouge?: boolean | null;
    course_preview_image_media_id?: string | null;
    course_banner_media_id?: string | null;
    course_media_id?: string | null;
    why_learn_html?: string | null;
    who_should_learn_html?: string | null;
    about_the_course_html?: string | null;
    tags?: string[];
    course_depth?: number;
    course_html_description_html?: string | null;
}
interface Group {
    id: string;
    group_name: string;
    parent_group: string | null;
    is_root: boolean | null;
    group_value: string;
}
type ExistingBatch = {
    id: string;
    level: {
        id: string;
        level_name: string;
        duration_in_days: number | null;
        thumbnail_id: string | null;
    };
    session: { id: string; session_name: string; status: string; start_date: string };
    start_time: string | null;
    status: string;
    package_dto?: PackageDTO;
    group?: Group;
};

export const AddCourseStep2 = ({
    onBack,
    onSubmit,
    initialData,
    isLoading = false,
    disableCreate = false,
    isEdit,
}: {
    onBack: () => void;
    onSubmit: (data: Step2Data) => void;
    initialData?: Step2Data;
    isLoading?: boolean;
    disableCreate?: boolean;
    isEdit?: boolean;
}) => {
    const { instituteDetails } = useInstituteDetailsStore();
    const existingBatches = instituteDetails?.batches_for_sessions || [];
    const accessToken = getTokenFromCookie(TokenKey.accessToken);
    const tokenData = getTokenDecodedData(accessToken);

    const instituteId = getInstituteId();
    const [hasLevels, setHasLevels] = useState(initialData?.hasLevels || 'yes');
    const [hasSessions, setHasSessions] = useState(
        instituteId === CODE_CIRCLE_INSTITUTE_ID ? 'no' : initialData?.hasSessions || 'yes'
    );
    const [sessions, setSessions] = useState<Session[]>(
        (initialData?.sessions || []).map((session) => ({
            ...session,
            levels: session.levels.map((level) => ({
                ...level,
                batchId: (level as Level).batchId || level.id,
            })),
        }))
    );
    const [showAddSession, setShowAddSession] = useState(false);
    const [showAddLevel, setShowAddLevel] = useState(false);
    const [newSessionName, setNewSessionName] = useState('');
    const [newSessionStartDate, setNewSessionStartDate] = useState('');
    const [newLevelName, setNewLevelName] = useState('');
    const [showInviteDialog, setShowInviteDialog] = useState(false);
    const [showMappingDialog, setShowMappingDialog] = useState(false);
    const [selectedInstructorId, setSelectedInstructorId] = useState('');
    const [selectedInstructorEmail, setSelectedInstructorEmail] = useState('');
    const [selectedInstructors, setSelectedInstructors] = useState<Instructor[]>([]);
    const [instructorMappings, setInstructorMappings] = useState<InstructorMapping[]>([]);
    const [instructors, setInstructors] = useState<Instructor[]>([]);

    const [publishToCatalogue, setPublishToCatalogue] = useState(
        initialData?.publishToCatalogue ? (initialData?.publishToCatalogue ? true : false) : true
    );

    const [showAssignmentCard, setShowAssignmentCard] = useState(false);
    const [selectedSessionLevels, setSelectedSessionLevels] = useState<
        Array<{
            sessionId: string;
            sessionName: string;
            levelId: string;
            levelName: string;
            batchId?: string;
        }>
    >([]);

    const [addSessionMode, setAddSessionMode] = useState<'new' | 'existing'>('new');
    const [selectedExistingBatchIds, setSelectedExistingBatchIds] = useState<string[]>([]);
    // Add state for addLevelMode and selectedExistingLevelBatchIds
    const [addLevelMode, setAddLevelMode] = useState<'new' | 'existing'>('new');
    const [selectedExistingLevelBatchIds, setSelectedExistingLevelBatchIds] = useState<string[]>(
        []
    );

    // Add state to track used existing batches
    const [usedExistingBatchIds, setUsedExistingBatchIds] = useState<Set<string>>(new Set());

    // Filter available existing batches (exclude used ones)
    const availableExistingBatches = existingBatches.filter(
        (batch: ExistingBatch) => !usedExistingBatchIds.has(batch.id)
    );

    const form = useForm<Step2Data>({
        resolver: zodResolver(step2Schema),
        defaultValues: initialData || {
            levelStructure: 2,
            hasLevels: 'yes',
            hasSessions: 'yes',
            sessions: [],
            selectedInstructors: [],
            instructors: [],
            publishToCatalogue: false,
        },
    });

    // Session management functions
    const addSession = () => {
        if (newSessionName.trim() && newSessionStartDate) {
            const newSession: Session = {
                id: Date.now().toString(),
                name: newSessionName.trim(),
                startDate: newSessionStartDate,
                levels: [],
            };
            const updatedSessions = [...sessions, newSession];
            setSessions(updatedSessions);
            form.setValue('sessions', updatedSessions);
            setNewSessionName('');
            setNewSessionStartDate('');
            setShowAddSession(false);
        }
    };

    const removeSession = (batchId: string) => {
        if (!batchId) return;
        const updatedSessions = sessions.filter((session) => session.batchId !== batchId);
        setSessions(updatedSessions);
        form.setValue('sessions', updatedSessions);
        setInstructorMappings((prev) =>
            prev.map((instructor) => ({
                ...instructor,
                sessionLevels: instructor.sessionLevels.filter((sl) => sl.batchId !== batchId),
            }))
        );
        setUsedExistingBatchIds((prev) => {
            const newSet = new Set(prev);
            newSet.delete(batchId);
            return newSet;
        });
    };

    const addLevel = (sessionId: string, levelName: string, levelId?: string) => {
        if (levelName.trim()) {
            const id = levelId || Date.now().toString();
            const newLevel: Level = {
                id,
                name: levelName.trim(),
                userIds: [],
                batchId: id,
            };
            const updatedSessions = sessions.map((session) =>
                session.id === sessionId
                    ? { ...session, levels: [...session.levels, newLevel] }
                    : session
            );
            setSessions(updatedSessions);
            form.setValue('sessions', updatedSessions);
        }
    };

    const removeLevel = (sessionId: string, batchId: string) => {
        if (!batchId) return;
        const updatedSessions = sessions.map((session) =>
            session.id === sessionId
                ? {
                      ...session,
                      levels: session.levels.filter((level) => level.batchId !== batchId),
                  }
                : session
        );
        setSessions(updatedSessions);
        form.setValue('sessions', updatedSessions);
        setInstructorMappings((prev) =>
            prev.map((instructor) => ({
                ...instructor,
                sessionLevels: instructor.sessionLevels.filter((sl) => sl.batchId !== batchId),
            }))
        );
        setUsedExistingBatchIds((prev) => {
            const newSet = new Set(prev);
            newSet.delete(batchId);
            return newSet;
        });
    };

    const handleSubmit = (data: Step2Data) => {
        const completeData = {
            ...data,
            levelStructure: data.levelStructure || 2,
            hasLevels: data.hasLevels,
            hasSessions: data.hasSessions,
            sessions: data.sessions,
            instructors: data.instructors,
            publishToCatalogue: data.publishToCatalogue,
        };
        onSubmit(completeData);
    };

    const handleInviteSuccess = (id: string, name: string, email: string, profilePicId: string) => {
        if (!id || !email || !name) return;

        const newInstructor: Instructor = { id, name, email, profilePicId };

        // Add to available instructors if not already there
        setInstructors((prev) => {
            if (!prev.some((i) => i.email === email)) {
                return [...prev, newInstructor];
            }
            return prev;
        });

        // Add to selected instructors if not already present
        setSelectedInstructors((prev) => {
            const safePrev = Array.isArray(prev) ? prev : [];
            const alreadySelected = safePrev.some((i) => i.email === newInstructor.email);
            if (alreadySelected) return safePrev;

            // Automatically open assignment card for this instructor
            setSelectedInstructorId(newInstructor.id);
            setSelectedInstructorEmail(newInstructor.email);
            setShowAssignmentCard(true);

            // --- Assign all batches (sessions/levels) automatically ---
            const allSessionLevels: Array<{
                sessionId: string;
                sessionName: string;
                levelId: string;
                levelName: string;
                batchId?: string;
            }> = [];
            if (hasSessions === 'yes' && hasLevels === 'yes') {
                sessions.forEach((session: Session) => {
                    session.levels.forEach((level: Level) => {
                        allSessionLevels.push({
                            sessionId: session.id,
                            sessionName: session.name,
                            levelId: level.id,
                            levelName: level.name,
                            batchId: level.batchId,
                        });
                    });
                });
            } else if (hasSessions === 'yes' && hasLevels !== 'yes') {
                sessions.forEach((session: Session) => {
                    allSessionLevels.push({
                        sessionId: session.id,
                        sessionName: session.name,
                        levelId: 'DEFAULT',
                        levelName: '',
                    });
                });
            } else if (hasSessions !== 'yes' && hasLevels === 'yes') {
                const standaloneSession = sessions.find((s: Session) => s.id === 'standalone');
                if (standaloneSession) {
                    standaloneSession.levels.forEach((level: Level) => {
                        allSessionLevels.push({
                            sessionId: 'DEFAULT',
                            sessionName: '',
                            levelId: level.id,
                            levelName: level.name,
                        });
                    });
                }
            }
            setSelectedSessionLevels(allSessionLevels);
            setInstructorMappings((prev) => [
                ...prev,
                {
                    id: newInstructor.id,
                    email: newInstructor.email,
                    sessionLevels: allSessionLevels,
                },
            ]);
            // Also update sessions state to reflect assignment
            setSessions((prevSessions) => {
                const updatedSessions = JSON.parse(JSON.stringify(prevSessions));
                if (hasSessions === 'yes' && hasLevels === 'yes') {
                    updatedSessions.forEach((session: Session) => {
                        session.levels.forEach((level: Level) => {
                            if (!level.userIds.some((i: Instructor) => i.id === newInstructor.id)) {
                                level.userIds.push(newInstructor);
                            }
                        });
                    });
                } else if (hasSessions === 'yes' && hasLevels !== 'yes') {
                    updatedSessions.forEach((session: Session) => {
                        if (session.levels.length === 0) {
                            session.levels = [
                                {
                                    id: 'DEFAULT',
                                    name: '',
                                    userIds: [newInstructor],
                                    batchId: 'DEFAULT',
                                },
                            ];
                        } else {
                            if (
                                session.levels[0]?.userIds &&
                                !session.levels[0].userIds.some(
                                    (i: Instructor) => i.id === newInstructor.id
                                )
                            ) {
                                session.levels[0].userIds.push(newInstructor);
                            }
                        }
                    });
                } else if (hasSessions !== 'yes' && hasLevels === 'yes') {
                    const standaloneSession = updatedSessions.find(
                        (s: Session) => s.id === 'standalone'
                    );
                    if (standaloneSession) {
                        standaloneSession.levels?.forEach((level: Level) => {
                            if (!level.userIds.some((i: Instructor) => i.id === newInstructor.id)) {
                                level.userIds.push(newInstructor);
                            }
                        });
                    }
                }
                return updatedSessions;
            });
            // ---------------------------------------------------------

            return [...safePrev, newInstructor];
        });
    };

    const handleSessionLevelMappingSave = (
        mappings: Array<{
            sessionId: string;
            sessionName: string;
            levelId: string;
            levelName: string;
            batchId?: string;
        }>
    ) => {
        if (selectedInstructorEmail) {
            setInstructorMappings((prev) => {
                const existingIndex = prev.findIndex((m) => m.email === selectedInstructorEmail);
                if (existingIndex >= 0) {
                    const updated = [...prev];
                    updated[existingIndex] = {
                        id: selectedInstructorId,
                        email: selectedInstructorEmail,
                        sessionLevels: mappings,
                    };
                    return updated;
                }
                return [
                    ...prev,
                    {
                        id: selectedInstructorId,
                        email: selectedInstructorEmail,
                        sessionLevels: mappings,
                    },
                ];
            });
        }
    };

    const getInitials = (email: string) => {
        const name = email.split('@')[0];
        return name?.slice(0, 2).toUpperCase();
    };

    const handlePublishChange = (checked: boolean | 'indeterminate') => {
        setPublishToCatalogue(checked === true);
    };

    // Add standalone level
    const addStandaloneLevel = () => {
        if (newLevelName.trim()) {
            const id = Date.now().toString();
            const dummySession: Session = {
                id: 'standalone',
                name: 'Standalone',
                startDate: new Date().toISOString(),
                levels: [],
            };
            const newLevel: Level = {
                id,
                name: newLevelName.trim(),
                userIds: [],
                batchId: id,
            };
            const standaloneSession = sessions.find((s) => s.id === 'standalone');
            if (!standaloneSession) {
                setSessions([{ ...dummySession, levels: [newLevel] }]);
            } else {
                const updatedSessions = sessions.map((session) =>
                    session.id === 'standalone'
                        ? { ...session, levels: [...session.levels, newLevel] }
                        : session
                );
                setSessions(updatedSessions);
            }
            setNewLevelName('');
            setShowAddLevel(false);
        }
    };

    // Remove standalone level
    const removeStandaloneLevel = (batchId: string) => {
        if (!batchId) return;
        const updatedSessions = sessions.map((session) =>
            session.id === 'standalone'
                ? {
                      ...session,
                      levels: session.levels.filter((level) => level.batchId !== batchId),
                  }
                : session
        );
        setSessions(updatedSessions);
        setUsedExistingBatchIds((prev) => {
            const newSet = new Set(prev);
            newSet.delete(batchId);
            return newSet;
        });
    };

    // Function to handle checkbox changes
    const handleSessionLevelCheckboxChange = (
        sessionId: string,
        sessionName: string,
        levelId: string,
        levelName: string
    ) => {
        setSelectedSessionLevels((prev) => {
            const exists = prev.some(
                (item) => item.sessionId === sessionId && item.levelId === levelId
            );

            if (exists) {
                return prev.filter(
                    (item) => !(item.sessionId === sessionId && item.levelId === levelId)
                );
            } else {
                return [...prev, { sessionId, sessionName, levelId, levelName }];
            }
        });
    };

    // Function to handle assignment save
    const handleAssignmentSave = () => {
        if (selectedInstructorId && selectedInstructorEmail) {
            let updatedSessions: Session[] = [];

            if (hasSessions !== 'yes' && hasLevels !== 'yes') {
                // When both are 'no', create or update the default session with default level
                if (sessions.length === 0) {
                    // Create default session and level if they don't exist
                    updatedSessions = [
                        {
                            id: 'DEFAULT',
                            name: '',
                            startDate: '',
                            levels: [
                                {
                                    id: 'DEFAULT',
                                    name: '',
                                    userIds: selectedInstructors.map((instructor) => instructor),
                                    batchId: 'DEFAULT',
                                },
                            ],
                        },
                    ];
                } else {
                    // Update existing default session
                    updatedSessions = sessions.map((session) => ({
                        ...session,
                        levels: session.levels.map((level) => ({
                            ...level,
                            userIds: selectedInstructors.map((instructor) => instructor),
                        })),
                    }));
                }
            } else {
                // First, remove the instructor from all levels they were previously assigned to
                updatedSessions = sessions.map((session) => ({
                    ...session,
                    levels: session.levels.map((level) => ({
                        ...level,
                        userIds: level.userIds.filter(
                            (instructor) => instructor.id !== selectedInstructorId
                        ),
                    })),
                }));

                // Then, add the instructor object to newly selected levels
                selectedSessionLevels.forEach(({ sessionId, levelId }) => {
                    const instructorObj = selectedInstructors.find(
                        (i) => i.id === selectedInstructorId
                    );
                    if (!instructorObj) return;
                    if (hasSessions === 'yes') {
                        // Handle sessions case
                        const session = updatedSessions.find((s: Session) => s.id === sessionId);
                        if (session) {
                            if (hasLevels === 'yes') {
                                // For sessions with levels, add to specific level
                                const level = session.levels.find((l: Level) => l.id === levelId);
                                if (
                                    level &&
                                    !level.userIds.some((i) => i.id === instructorObj.id)
                                ) {
                                    level.userIds.push(instructorObj);
                                }
                            } else {
                                // For sessions without levels, add to the default level
                                if (session.levels.length === 0) {
                                    // If no default level exists, create one
                                    session.levels = [
                                        {
                                            id: 'DEFAULT',
                                            name: '',
                                            userIds: [instructorObj],
                                            batchId: 'DEFAULT',
                                        },
                                    ];
                                } else if (
                                    session.levels[0] &&
                                    !session.levels[0].userIds.some(
                                        (i) => i.id === instructorObj.id
                                    )
                                ) {
                                    // Add to existing default level
                                    session.levels[0].userIds.push(instructorObj);
                                }
                            }
                        }
                    } else if (hasLevels === 'yes') {
                        // Handle levels-only case
                        const standaloneSession = updatedSessions.find(
                            (s: Session) => s.id === 'standalone'
                        );
                        if (standaloneSession) {
                            const level = standaloneSession.levels.find(
                                (l: Level) => l.id === levelId
                            );
                            if (level && !level.userIds.some((i) => i.id === instructorObj.id)) {
                                level.userIds.push(instructorObj);
                            }
                        }
                    }
                });
            }

            setSessions(updatedSessions);
            form.setValue('sessions', updatedSessions);
            form.setValue('selectedInstructors', selectedInstructors);

            // Update instructor mappings
            setInstructorMappings((prev) => {
                const existingIndex = prev.findIndex((m) => m.id === selectedInstructorId);
                if (existingIndex >= 0) {
                    const updated = [...prev];
                    updated[existingIndex] = {
                        id: selectedInstructorId,
                        email: selectedInstructorEmail,
                        sessionLevels: selectedSessionLevels,
                    };
                    return updated;
                }
                return [
                    ...prev,
                    {
                        id: selectedInstructorId,
                        email: selectedInstructorEmail,
                        sessionLevels: selectedSessionLevels,
                    },
                ];
            });
        }
        setShowAssignmentCard(false);
        setSelectedSessionLevels([]);
    };

    useEffect(() => {
        if (initialData) {
            setSelectedInstructors(form.getValues('selectedInstructors'));
            // Aggregate instructor mappings from session data
            const instructorMappingsFromSessions: InstructorMapping[] = [];
            const sessionsWithBatchIdLevels =
                form.getValues('sessions')?.map((session) => ({
                    ...session,
                    levels: session.levels.map((level) => ({
                        ...level,
                        batchId: (level as Level).batchId || level.id,
                    })),
                })) || [];
            sessionsWithBatchIdLevels.forEach((session) => {
                session.levels?.forEach((level) => {
                    level.userIds?.forEach((instructor) => {
                        const sessionLevelMapping = {
                            sessionId: session.id,
                            sessionName: session.name,
                            levelId: level.id,
                            levelName: level.name,
                            batchId: level.batchId,
                        };
                        // Find or create mapping for this instructor
                        const mapping = instructorMappingsFromSessions.find(
                            (m) => m.id === instructor.id
                        );
                        if (mapping) {
                            // Only add if not already present
                            if (
                                !mapping.sessionLevels.some(
                                    (sl) => sl.sessionId === session.id && sl.levelId === level.id
                                )
                            ) {
                                mapping.sessionLevels.push(sessionLevelMapping);
                            }
                        } else {
                            instructorMappingsFromSessions.push({
                                id: instructor.id,
                                email: instructor.email,
                                sessionLevels: [sessionLevelMapping],
                            });
                        }
                    });
                });
            });
            setInstructorMappings(instructorMappingsFromSessions);
        }
    }, [initialData]);

    // Effect to update form when state changes
    useEffect(() => {
        form.setValue('hasLevels', hasLevels);
        form.setValue('hasSessions', hasSessions);
        form.setValue('sessions', sessions);
        form.setValue('instructors', instructors);
        form.setValue('publishToCatalogue', publishToCatalogue);
    }, [hasLevels, hasSessions, sessions, instructors, publishToCatalogue, form]);

    useEffect(() => {
        fetchInstituteDashboardUsers(instituteId, {
            roles: RoleType,
            status: [{ id: '1', name: 'ACTIVE' }],
        })
            .then((res) => {
                setInstructors(
                    res
                        .map((instructor: UserRolesDataEntry) => ({
                            id: instructor.id,
                            email: instructor.email,
                            name: instructor.full_name,
                            profilePicId: instructor.profile_pic_file_id,
                        }))
                        .filter((instr: UserRolesDataEntry) => {
                            return instr.id !== tokenData?.user;
                        })
                );
            })
            .catch((err) => {
                console.log(err);
            });
    }, []);

    // Effect to update form when sessions change
    useEffect(() => {
        form.setValue('sessions', sessions);
    }, [sessions, form]);

    return (
        <>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSubmit)} className="flex h-full flex-col">
                    <div className="flex-1 overflow-y-auto pb-24">
                        <Card className="w-full rounded-none border-none bg-white shadow-sm">
                            <div className="flex items-center justify-between border-b border-gray-100 p-5">
                                <div>
                                    <div className="mt-1 flex items-center gap-2">
                                        <span className="text-sm text-gray-600">Step 2</span>
                                        <span className="text-sm font-medium text-gray-900">
                                            Course Structure
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <CardContent className="space-y-6 p-5">
                                {/* Warning Note */}
                                {!isEdit && (
                                    <div className="rounded-lg border border-red-200 bg-red-50 p-3">
                                        <p className="text-sm text-red-700">
                                            <strong>Note:</strong> Once you create the course, its
                                            structure—including sessions and levels—cannot be
                                            changed. Please review carefully before proceeding.
                                        </p>
                                    </div>
                                )}

                                {/* Structure Selection */}
                                {!isEdit && (
                                    <div>
                                        <h3 className="mb-3 text-base font-medium text-gray-900">
                                            Select course structure that is suitable for your
                                            institute
                                        </h3>
                                        <AddCourseStep2StructureTypes form={form} />
                                    </div>
                                )}

                                {instituteId !== CODE_CIRCLE_INSTITUTE_ID && (
                                    <>
                                        {!isEdit && <Separator className="bg-gray-200" />}
                                        <div className="space-y-2">
                                            <Label className="block text-base font-medium text-gray-900">
                                                Contains Sessions?
                                            </Label>
                                            <p className="text-sm text-gray-600">
                                                Sessions organize a course into different batches or
                                                time periods. For eg: January 2025 Batch, February
                                                2025 Batch
                                            </p>
                                            <RadioGroup
                                                value={hasSessions}
                                                onValueChange={(value) => {
                                                    setHasSessions(value);
                                                    // Clear sessions when switching to 'no'
                                                    if (value === 'no') {
                                                        setSessions(
                                                            sessions.map((session) => ({
                                                                ...session,
                                                                levels: [],
                                                            }))
                                                        );
                                                    }
                                                }}
                                                className="flex gap-6"
                                            >
                                                <div className="flex items-center space-x-2">
                                                    <RadioGroupItem value="yes" id="sessions-yes" />
                                                    <Label
                                                        htmlFor="sessions-yes"
                                                        className="text-sm font-normal"
                                                    >
                                                        Yes
                                                    </Label>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <RadioGroupItem value="no" id="sessions-no" />
                                                    <Label
                                                        htmlFor="sessions-no"
                                                        className="text-sm font-normal"
                                                    >
                                                        No
                                                    </Label>
                                                </div>
                                            </RadioGroup>
                                        </div>
                                    </>
                                )}

                                <Separator className="bg-gray-200" />

                                {/* Contains Levels Radio */}
                                <div className="space-y-2">
                                    <Label className="block text-base font-medium text-gray-900">
                                        Contains Levels?
                                    </Label>
                                    <p className="text-sm text-gray-600">
                                        Levels organize a course into structured learning stages.
                                        These stages may represent increasing difficulty, different
                                        modules, or key milestones within the course. For eg: Basic,
                                        Advanced
                                    </p>
                                    <RadioGroup
                                        value={hasLevels}
                                        onValueChange={(value) => {
                                            setHasLevels(value);
                                            // Clear levels when switching to 'no'
                                            if (value === 'no') {
                                                setSessions(
                                                    sessions.map((session) => ({
                                                        ...session,
                                                        levels: [],
                                                    }))
                                                );
                                            }
                                        }}
                                        className="flex gap-6"
                                    >
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="yes" id="levels-yes" />
                                            <Label
                                                htmlFor="levels-yes"
                                                className="text-sm font-normal"
                                            >
                                                Yes
                                            </Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="no" id="levels-no" />
                                            <Label
                                                htmlFor="levels-no"
                                                className="text-sm font-normal"
                                            >
                                                No
                                            </Label>
                                        </div>
                                    </RadioGroup>
                                </div>

                                {/* Info message when both are No */}
                                {hasSessions !== 'yes' && hasLevels !== 'yes' && (
                                    <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
                                        <p className="text-sm text-blue-700">
                                            This course will not have any sessions or levels.
                                            Students will directly access the course content.
                                        </p>
                                    </div>
                                )}

                                {/* Sessions Management */}
                                {hasSessions === 'yes' && (
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <Label className="text-base font-medium text-gray-900">
                                                    Course Sessions
                                                </Label>
                                                <p className="text-sm text-gray-600">
                                                    {hasLevels === 'yes'
                                                        ? 'Create sessions and add levels within each session'
                                                        : 'Create sessions for your course'}
                                                </p>
                                            </div>
                                            <MyButton
                                                type="button"
                                                buttonType="secondary"
                                                scale="medium"
                                                layoutVariant="default"
                                                onClick={() => setShowAddSession(true)}
                                                className="font-light"
                                            >
                                                <Plus />
                                                Add Session
                                            </MyButton>
                                        </div>

                                        {showAddSession && (
                                            <Card className="border-gray-200">
                                                <CardContent className="p-3">
                                                    <div className="mb-3">
                                                        <RadioGroup
                                                            value={addSessionMode}
                                                            onValueChange={(val) =>
                                                                setAddSessionMode(
                                                                    val as 'new' | 'existing'
                                                                )
                                                            }
                                                            className="flex gap-6"
                                                        >
                                                            <div className="flex items-center space-x-2">
                                                                <RadioGroupItem
                                                                    value="new"
                                                                    id="add-session-new"
                                                                />
                                                                <Label
                                                                    htmlFor="add-session-new"
                                                                    className="text-sm font-normal"
                                                                >
                                                                    New{' '}
                                                                    {hasSessions === 'yes' &&
                                                                    hasLevels === 'yes'
                                                                        ? 'Session'
                                                                        : hasSessions === 'yes'
                                                                          ? 'Session'
                                                                          : 'Level'}
                                                                </Label>
                                                            </div>
                                                            <div className="flex items-center space-x-2">
                                                                <RadioGroupItem
                                                                    value="existing"
                                                                    id="add-session-existing"
                                                                />
                                                                <Label
                                                                    htmlFor="add-session-existing"
                                                                    className="text-sm font-normal"
                                                                >
                                                                    {hasSessions === 'yes' &&
                                                                    hasLevels === 'yes'
                                                                        ? 'Existing Sessions'
                                                                        : hasSessions === 'yes'
                                                                          ? 'Existing Sessions'
                                                                          : 'Existing Levels'}
                                                                </Label>
                                                            </div>
                                                        </RadioGroup>
                                                    </div>
                                                    {addSessionMode === 'new' && (
                                                        <div className="grid grid-cols-2 gap-2">
                                                            {hasSessions === 'yes' && (
                                                                <div>
                                                                    <Label className="mb-1 block text-sm font-medium text-gray-700">
                                                                        Session Name
                                                                    </Label>
                                                                    <Input
                                                                        placeholder="e.g., January 2025 Batch"
                                                                        value={newSessionName}
                                                                        onChange={(e) =>
                                                                            setNewSessionName(
                                                                                e.target.value
                                                                            )
                                                                        }
                                                                        className="h-8 border-gray-300"
                                                                    />
                                                                </div>
                                                            )}
                                                            {hasSessions === 'yes' && (
                                                                <div>
                                                                    <Label className="mb-1 block text-sm font-medium text-gray-700">
                                                                        Start Date
                                                                    </Label>
                                                                    <Input
                                                                        type="date"
                                                                        value={newSessionStartDate}
                                                                        onChange={(e) =>
                                                                            setNewSessionStartDate(
                                                                                e.target.value
                                                                            )
                                                                        }
                                                                        className="h-8 border-gray-300"
                                                                    />
                                                                </div>
                                                            )}
                                                            {hasSessions !== 'yes' &&
                                                                hasLevels === 'yes' && (
                                                                    <div className="col-span-2">
                                                                        <Label className="mb-1 block text-sm font-medium text-gray-700">
                                                                            Level Name
                                                                        </Label>
                                                                        <Input
                                                                            placeholder="Enter level name (e.g., Basic)"
                                                                            value={newLevelName}
                                                                            onChange={(e) =>
                                                                                setNewLevelName(
                                                                                    e.target.value
                                                                                )
                                                                            }
                                                                            className="h-8 border-gray-300"
                                                                        />
                                                                    </div>
                                                                )}
                                                        </div>
                                                    )}
                                                    {addSessionMode === 'existing' && (
                                                        <div className="mt-2">
                                                            {/* Existing batch/session/level selection UI */}
                                                            {hasSessions === 'yes' &&
                                                                hasLevels === 'yes' && (
                                                                    <>
                                                                        <Label className="mb-2 block text-sm font-medium text-gray-700">
                                                                            Select Batches
                                                                        </Label>
                                                                        {availableExistingBatches.length ===
                                                                        0 ? (
                                                                            <div className="text-sm text-gray-500">
                                                                                No existing sessions
                                                                                found.
                                                                            </div>
                                                                        ) : (
                                                                            <>
                                                                                <div className="mb-2 flex items-center">
                                                                                    <Checkbox
                                                                                        checked={
                                                                                            availableExistingBatches.length >
                                                                                                0 &&
                                                                                            selectedExistingBatchIds.length ===
                                                                                                availableExistingBatches.length
                                                                                        }
                                                                                        onCheckedChange={() => {
                                                                                            if (
                                                                                                selectedExistingBatchIds.length ===
                                                                                                availableExistingBatches.length
                                                                                            ) {
                                                                                                setSelectedExistingBatchIds(
                                                                                                    []
                                                                                                );
                                                                                            } else {
                                                                                                setSelectedExistingBatchIds(
                                                                                                    availableExistingBatches.map(
                                                                                                        (
                                                                                                            b: ExistingBatch
                                                                                                        ) =>
                                                                                                            b.id
                                                                                                    )
                                                                                                );
                                                                                            }
                                                                                        }}
                                                                                        className="mr-2 size-4"
                                                                                        style={{
                                                                                            display:
                                                                                                availableExistingBatches.length ===
                                                                                                0
                                                                                                    ? 'none'
                                                                                                    : undefined,
                                                                                        }}
                                                                                    />
                                                                                    {availableExistingBatches.length >
                                                                                        0 && (
                                                                                        <span className="text-sm font-medium text-gray-700">
                                                                                            Select
                                                                                            All
                                                                                        </span>
                                                                                    )}
                                                                                </div>
                                                                                <div className="max-h-48 space-y-1 overflow-y-auto">
                                                                                    {availableExistingBatches.map(
                                                                                        (
                                                                                            batch: ExistingBatch
                                                                                        ) => (
                                                                                            <div
                                                                                                key={
                                                                                                    batch.id
                                                                                                }
                                                                                                className="flex items-center gap-2 rounded border border-gray-100 bg-gray-50 px-2 py-1"
                                                                                            >
                                                                                                <Checkbox
                                                                                                    checked={selectedExistingBatchIds.includes(
                                                                                                        batch.id
                                                                                                    )}
                                                                                                    onCheckedChange={() => {
                                                                                                        if (
                                                                                                            selectedExistingBatchIds.includes(
                                                                                                                batch.id
                                                                                                            )
                                                                                                        ) {
                                                                                                            setSelectedExistingBatchIds(
                                                                                                                selectedExistingBatchIds.filter(
                                                                                                                    (
                                                                                                                        id
                                                                                                                    ) =>
                                                                                                                        id !==
                                                                                                                        batch.id
                                                                                                                )
                                                                                                            );
                                                                                                        } else {
                                                                                                            setSelectedExistingBatchIds(
                                                                                                                [
                                                                                                                    ...selectedExistingBatchIds,
                                                                                                                    batch.id,
                                                                                                                ]
                                                                                                            );
                                                                                                        }
                                                                                                    }}
                                                                                                    className="size-4"
                                                                                                />
                                                                                                <span className="text-sm text-gray-700">
                                                                                                    {
                                                                                                        batch
                                                                                                            .session
                                                                                                            .session_name
                                                                                                    }{' '}
                                                                                                    -{' '}
                                                                                                    {
                                                                                                        batch
                                                                                                            .level
                                                                                                            .level_name
                                                                                                    }
                                                                                                </span>
                                                                                            </div>
                                                                                        )
                                                                                    )}
                                                                                </div>
                                                                            </>
                                                                        )}
                                                                    </>
                                                                )}
                                                            {hasSessions === 'yes' &&
                                                                hasLevels !== 'yes' && (
                                                                    <>
                                                                        <Label className="mb-2 block text-sm font-medium text-gray-700">
                                                                            Select Sessions
                                                                        </Label>
                                                                        {availableExistingBatches.length ===
                                                                        0 ? (
                                                                            <div className="text-sm text-gray-500">
                                                                                No existing sessions
                                                                                found.
                                                                            </div>
                                                                        ) : (
                                                                            <>
                                                                                <div className="mb-2 flex items-center">
                                                                                    <Checkbox
                                                                                        checked={
                                                                                            availableExistingBatches.length >
                                                                                                0 &&
                                                                                            selectedExistingBatchIds.length ===
                                                                                                availableExistingBatches.length
                                                                                        }
                                                                                        onCheckedChange={() => {
                                                                                            if (
                                                                                                selectedExistingBatchIds.length ===
                                                                                                availableExistingBatches.length
                                                                                            ) {
                                                                                                setSelectedExistingBatchIds(
                                                                                                    []
                                                                                                );
                                                                                            } else {
                                                                                                setSelectedExistingBatchIds(
                                                                                                    availableExistingBatches.map(
                                                                                                        (
                                                                                                            b: ExistingBatch
                                                                                                        ) =>
                                                                                                            b.id
                                                                                                    )
                                                                                                );
                                                                                            }
                                                                                        }}
                                                                                        className="mr-2 size-4"
                                                                                        style={{
                                                                                            display:
                                                                                                availableExistingBatches.length ===
                                                                                                0
                                                                                                    ? 'none'
                                                                                                    : undefined,
                                                                                        }}
                                                                                    />
                                                                                    {availableExistingBatches.length >
                                                                                        0 && (
                                                                                        <span className="text-sm font-medium text-gray-700">
                                                                                            Select
                                                                                            All
                                                                                        </span>
                                                                                    )}
                                                                                </div>
                                                                                <div className="max-h-48 space-y-1 overflow-y-auto">
                                                                                    {availableExistingBatches.map(
                                                                                        (
                                                                                            batch: ExistingBatch
                                                                                        ) => (
                                                                                            <div
                                                                                                key={
                                                                                                    batch.id
                                                                                                }
                                                                                                className="flex items-center gap-2 rounded border border-gray-100 bg-gray-50 px-2 py-1"
                                                                                            >
                                                                                                <Checkbox
                                                                                                    checked={selectedExistingBatchIds.includes(
                                                                                                        batch.id
                                                                                                    )}
                                                                                                    onCheckedChange={() => {
                                                                                                        if (
                                                                                                            selectedExistingBatchIds.includes(
                                                                                                                batch.id
                                                                                                            )
                                                                                                        ) {
                                                                                                            setSelectedExistingBatchIds(
                                                                                                                selectedExistingBatchIds.filter(
                                                                                                                    (
                                                                                                                        id
                                                                                                                    ) =>
                                                                                                                        id !==
                                                                                                                        batch.id
                                                                                                                )
                                                                                                            );
                                                                                                        } else {
                                                                                                            setSelectedExistingBatchIds(
                                                                                                                [
                                                                                                                    ...selectedExistingBatchIds,
                                                                                                                    batch.id,
                                                                                                                ]
                                                                                                            );
                                                                                                        }
                                                                                                    }}
                                                                                                    className="size-4"
                                                                                                />
                                                                                                <span className="text-sm text-gray-700">
                                                                                                    {
                                                                                                        batch
                                                                                                            .session
                                                                                                            .session_name
                                                                                                    }
                                                                                                </span>
                                                                                            </div>
                                                                                        )
                                                                                    )}
                                                                                </div>
                                                                            </>
                                                                        )}
                                                                    </>
                                                                )}
                                                            {hasSessions !== 'yes' &&
                                                                hasLevels === 'yes' && (
                                                                    <>
                                                                        <Label className="mb-2 block text-sm font-medium text-gray-700">
                                                                            Select Levels
                                                                        </Label>
                                                                        {availableExistingBatches.length ===
                                                                        0 ? (
                                                                            <div className="text-sm text-gray-500">
                                                                                No existing levels
                                                                                found.
                                                                            </div>
                                                                        ) : (
                                                                            <>
                                                                                <div className="mb-2 flex items-center">
                                                                                    <Checkbox
                                                                                        checked={
                                                                                            availableExistingBatches.length >
                                                                                                0 &&
                                                                                            selectedExistingBatchIds.length ===
                                                                                                availableExistingBatches.length
                                                                                        }
                                                                                        onCheckedChange={() => {
                                                                                            if (
                                                                                                selectedExistingBatchIds.length ===
                                                                                                availableExistingBatches.length
                                                                                            ) {
                                                                                                setSelectedExistingBatchIds(
                                                                                                    []
                                                                                                );
                                                                                            } else {
                                                                                                setSelectedExistingBatchIds(
                                                                                                    availableExistingBatches.map(
                                                                                                        (
                                                                                                            b: ExistingBatch
                                                                                                        ) =>
                                                                                                            b.id
                                                                                                    )
                                                                                                );
                                                                                            }
                                                                                        }}
                                                                                        className="mr-2 size-4"
                                                                                        style={{
                                                                                            display:
                                                                                                availableExistingBatches.length ===
                                                                                                0
                                                                                                    ? 'none'
                                                                                                    : undefined,
                                                                                        }}
                                                                                    />
                                                                                    {availableExistingBatches.length >
                                                                                        0 && (
                                                                                        <span className="text-sm font-medium text-gray-700">
                                                                                            Select
                                                                                            All
                                                                                        </span>
                                                                                    )}
                                                                                </div>
                                                                                <div className="max-h-48 space-y-1 overflow-y-auto">
                                                                                    {availableExistingBatches.map(
                                                                                        (
                                                                                            batch: ExistingBatch
                                                                                        ) => (
                                                                                            <div
                                                                                                key={
                                                                                                    batch.id
                                                                                                }
                                                                                                className="flex items-center gap-2 rounded border border-gray-100 bg-gray-50 px-2 py-1"
                                                                                            >
                                                                                                <Checkbox
                                                                                                    checked={selectedExistingBatchIds.includes(
                                                                                                        batch.id
                                                                                                    )}
                                                                                                    onCheckedChange={() => {
                                                                                                        if (
                                                                                                            selectedExistingBatchIds.includes(
                                                                                                                batch.id
                                                                                                            )
                                                                                                        ) {
                                                                                                            setSelectedExistingBatchIds(
                                                                                                                selectedExistingBatchIds.filter(
                                                                                                                    (
                                                                                                                        id
                                                                                                                    ) =>
                                                                                                                        id !==
                                                                                                                        batch.id
                                                                                                                )
                                                                                                            );
                                                                                                        } else {
                                                                                                            setSelectedExistingBatchIds(
                                                                                                                [
                                                                                                                    ...selectedExistingBatchIds,
                                                                                                                    batch.id,
                                                                                                                ]
                                                                                                            );
                                                                                                        }
                                                                                                    }}
                                                                                                    className="size-4"
                                                                                                />
                                                                                                <span className="text-sm text-gray-700">
                                                                                                    {
                                                                                                        batch
                                                                                                            .level
                                                                                                            .level_name
                                                                                                    }
                                                                                                </span>
                                                                                            </div>
                                                                                        )
                                                                                    )}
                                                                                </div>
                                                                            </>
                                                                        )}
                                                                    </>
                                                                )}
                                                        </div>
                                                    )}
                                                    <div className="mt-3 flex gap-2">
                                                        {addSessionMode === 'new' && (
                                                            <MyButton
                                                                type="button"
                                                                buttonType="primary"
                                                                scale="medium"
                                                                layoutVariant="default"
                                                                onClick={
                                                                    hasSessions === 'yes'
                                                                        ? addSession
                                                                        : addStandaloneLevel
                                                                }
                                                                disable={
                                                                    (hasSessions === 'yes' &&
                                                                        (!newSessionName.trim() ||
                                                                            !newSessionStartDate)) ||
                                                                    (hasSessions !== 'yes' &&
                                                                        hasLevels === 'yes' &&
                                                                        !newLevelName.trim())
                                                                }
                                                            >
                                                                {hasSessions === 'yes'
                                                                    ? 'Add Session'
                                                                    : 'Add Level'}
                                                            </MyButton>
                                                        )}
                                                        {addSessionMode === 'existing' && (
                                                            <MyButton
                                                                type="button"
                                                                buttonType="primary"
                                                                scale="medium"
                                                                layoutVariant="default"
                                                                onClick={() => {
                                                                    if (
                                                                        hasSessions === 'yes' &&
                                                                        hasLevels === 'yes'
                                                                    ) {
                                                                        // Add selected batches as sessions with levels
                                                                        const selectedBatches =
                                                                            availableExistingBatches.filter(
                                                                                (
                                                                                    b: ExistingBatch
                                                                                ) =>
                                                                                    selectedExistingBatchIds.includes(
                                                                                        b.id
                                                                                    )
                                                                            );
                                                                        const newSessions: Session[] =
                                                                            [];
                                                                        selectedBatches.forEach(
                                                                            (
                                                                                batch: ExistingBatch
                                                                            ) => {
                                                                                let session =
                                                                                    newSessions.find(
                                                                                        (s) =>
                                                                                            s.id ===
                                                                                            batch
                                                                                                .session
                                                                                                .id
                                                                                    );
                                                                                if (!session) {
                                                                                    session = {
                                                                                        id: batch
                                                                                            .session
                                                                                            .id,
                                                                                        name: batch
                                                                                            .session
                                                                                            .session_name,
                                                                                        startDate:
                                                                                            batch
                                                                                                .session
                                                                                                .start_date,
                                                                                        levels: [],
                                                                                        batchId:
                                                                                            batch.id, // <-- set batchId here
                                                                                    };
                                                                                    newSessions.push(
                                                                                        session
                                                                                    );
                                                                                }
                                                                                if (
                                                                                    !session.levels.some(
                                                                                        (l) =>
                                                                                            l.id ===
                                                                                            batch
                                                                                                .level
                                                                                                .id
                                                                                    )
                                                                                ) {
                                                                                    session.levels.push(
                                                                                        {
                                                                                            id: batch
                                                                                                .level
                                                                                                .id,
                                                                                            name: batch
                                                                                                .level
                                                                                                .level_name,
                                                                                            userIds:
                                                                                                [],
                                                                                            batchId:
                                                                                                batch.id, // <-- set batchId here
                                                                                        }
                                                                                    );
                                                                                }
                                                                            }
                                                                        );
                                                                        // Avoid duplicates in sessions list by batch id
                                                                        const sessionLevelIds =
                                                                            new Set(
                                                                                sessions.flatMap(
                                                                                    (s) =>
                                                                                        s.levels.map(
                                                                                            (l) =>
                                                                                                `${s.id}-${l.id}`
                                                                                        )
                                                                                )
                                                                            );
                                                                        newSessions.forEach((s) => {
                                                                            s.levels =
                                                                                s.levels.filter(
                                                                                    (l) =>
                                                                                        !sessionLevelIds.has(
                                                                                            `${s.id}-${l.id}`
                                                                                        )
                                                                                );
                                                                        });
                                                                        setSessions(
                                                                            ensureBatchIdInLevels([
                                                                                ...sessions,
                                                                                ...newSessions.filter(
                                                                                    (s) =>
                                                                                        s.levels
                                                                                            .length >
                                                                                        0
                                                                                ),
                                                                            ])
                                                                        );

                                                                        // Mark selected batches as used
                                                                        setUsedExistingBatchIds(
                                                                            (prev) => {
                                                                                const newSet =
                                                                                    new Set(prev);
                                                                                selectedBatches.forEach(
                                                                                    (batch) => {
                                                                                        newSet.add(
                                                                                            batch.id
                                                                                        );
                                                                                    }
                                                                                );
                                                                                return newSet;
                                                                            }
                                                                        );
                                                                    } else if (
                                                                        hasSessions === 'yes' &&
                                                                        hasLevels !== 'yes'
                                                                    ) {
                                                                        // Add selected sessions by batch id
                                                                        const selectedBatches =
                                                                            availableExistingBatches.filter(
                                                                                (
                                                                                    b: ExistingBatch
                                                                                ) =>
                                                                                    selectedExistingBatchIds.includes(
                                                                                        b.id
                                                                                    )
                                                                            );
                                                                        const newSessions: Session[] =
                                                                            [];
                                                                        selectedBatches.forEach(
                                                                            (
                                                                                batch: ExistingBatch
                                                                            ) => {
                                                                                if (
                                                                                    !sessions.some(
                                                                                        (s) =>
                                                                                            s.id ===
                                                                                            batch
                                                                                                .session
                                                                                                .id
                                                                                    )
                                                                                ) {
                                                                                    newSessions.push(
                                                                                        {
                                                                                            id: batch
                                                                                                .session
                                                                                                .id,
                                                                                            name: batch
                                                                                                .session
                                                                                                .session_name,
                                                                                            startDate:
                                                                                                batch
                                                                                                    .session
                                                                                                    .start_date,
                                                                                            levels: [],
                                                                                            batchId:
                                                                                                batch.id, // <-- set batchId here
                                                                                        }
                                                                                    );
                                                                                }
                                                                            }
                                                                        );
                                                                        setSessions(
                                                                            ensureBatchIdInLevels([
                                                                                ...sessions,
                                                                                ...newSessions,
                                                                            ])
                                                                        );

                                                                        // Mark selected batches as used
                                                                        setUsedExistingBatchIds(
                                                                            (prev) => {
                                                                                const newSet =
                                                                                    new Set(prev);
                                                                                selectedBatches.forEach(
                                                                                    (batch) => {
                                                                                        newSet.add(
                                                                                            batch.id
                                                                                        );
                                                                                    }
                                                                                );
                                                                                return newSet;
                                                                            }
                                                                        );
                                                                    } else if (
                                                                        hasSessions !== 'yes' &&
                                                                        hasLevels === 'yes'
                                                                    ) {
                                                                        // Add selected levels to standalone session by batch id
                                                                        const selectedBatches =
                                                                            availableExistingBatches.filter(
                                                                                (
                                                                                    b: ExistingBatch
                                                                                ) =>
                                                                                    selectedExistingBatchIds.includes(
                                                                                        b.id
                                                                                    )
                                                                            );
                                                                        const newLevels: Level[] =
                                                                            [];
                                                                        selectedBatches.forEach(
                                                                            (
                                                                                batch: ExistingBatch
                                                                            ) => {
                                                                                if (
                                                                                    !sessions
                                                                                        .find(
                                                                                            (s) =>
                                                                                                s.id ===
                                                                                                'standalone'
                                                                                        )
                                                                                        ?.levels.some(
                                                                                            (l) =>
                                                                                                l.id ===
                                                                                                batch
                                                                                                    .level
                                                                                                    .id
                                                                                        )
                                                                                ) {
                                                                                    newLevels.push({
                                                                                        id: batch
                                                                                            .level
                                                                                            .id,
                                                                                        name: batch
                                                                                            .level
                                                                                            .level_name,
                                                                                        userIds: [],
                                                                                        batchId:
                                                                                            batch.id, // <-- set batchId here
                                                                                    });
                                                                                }
                                                                            }
                                                                        );
                                                                        // Add to standalone session or create it
                                                                        const standaloneSession =
                                                                            sessions.find(
                                                                                (s) =>
                                                                                    s.id ===
                                                                                    'standalone'
                                                                            );
                                                                        if (standaloneSession) {
                                                                            standaloneSession.levels =
                                                                                [
                                                                                    ...standaloneSession.levels,
                                                                                    ...newLevels,
                                                                                ];
                                                                            setSessions(
                                                                                ensureBatchIdInLevels(
                                                                                    [...sessions]
                                                                                )
                                                                            );
                                                                        } else {
                                                                            setSessions([
                                                                                {
                                                                                    id: 'standalone',
                                                                                    name: 'Standalone',
                                                                                    startDate:
                                                                                        new Date().toISOString(),
                                                                                    levels: newLevels,
                                                                                },
                                                                            ]);
                                                                        }

                                                                        // Mark selected batches as used
                                                                        setUsedExistingBatchIds(
                                                                            (prev) => {
                                                                                const newSet =
                                                                                    new Set(prev);
                                                                                selectedBatches.forEach(
                                                                                    (batch) => {
                                                                                        newSet.add(
                                                                                            batch.id
                                                                                        );
                                                                                    }
                                                                                );
                                                                                return newSet;
                                                                            }
                                                                        );
                                                                    }
                                                                    setShowAddSession(false);
                                                                    setSelectedExistingBatchIds([]);
                                                                }}
                                                                disable={
                                                                    selectedExistingBatchIds.length ===
                                                                    0
                                                                }
                                                            >
                                                                Add Selected
                                                            </MyButton>
                                                        )}
                                                        <MyButton
                                                            type="button"
                                                            buttonType="secondary"
                                                            scale="medium"
                                                            layoutVariant="default"
                                                            onClick={() => {
                                                                setShowAddSession(false);
                                                                setNewSessionName('');
                                                                setNewSessionStartDate('');
                                                                setNewLevelName('');
                                                                setAddSessionMode('new');
                                                                setSelectedExistingBatchIds([]);
                                                            }}
                                                        >
                                                            Cancel
                                                        </MyButton>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        )}

                                        {/* Session Cards */}
                                        {sessions.map((session) => (
                                            <SessionCard
                                                key={session.batchId || session.id}
                                                session={session}
                                                hasLevels={hasLevels === 'yes'}
                                                onRemoveSession={() =>
                                                    removeSession(
                                                        (session.batchId || session.id).toString()
                                                    )
                                                }
                                                onAddLevel={addLevel}
                                                onRemoveLevel={(sessionId, batchId) =>
                                                    removeLevel(
                                                        sessionId,
                                                        (batchId || '').toString()
                                                    )
                                                }
                                                existingBatches={availableExistingBatches}
                                                onMarkBatchesAsUsed={(batchIds) => {
                                                    setUsedExistingBatchIds((prev) => {
                                                        const newSet = new Set(prev);
                                                        batchIds.forEach((id) => {
                                                            newSet.add(id);
                                                        });
                                                        return newSet;
                                                    });
                                                }}
                                            />
                                        ))}
                                    </div>
                                )}

                                {/* Standalone Levels (when sessions are disabled) */}
                                {hasSessions !== 'yes' && hasLevels === 'yes' && (
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <Label className="text-base font-medium text-gray-900">
                                                    Course Levels
                                                </Label>
                                                <p className="text-sm text-gray-600">
                                                    Create levels for your course
                                                </p>
                                            </div>
                                            <MyButton
                                                type="button"
                                                buttonType="secondary"
                                                scale="medium"
                                                layoutVariant="default"
                                                onClick={() => setShowAddLevel(true)}
                                                className="font-light"
                                            >
                                                <Plus />
                                                Add Level
                                            </MyButton>
                                        </div>

                                        {showAddLevel && (
                                            <Card className="border-gray-200">
                                                <CardContent className="p-3">
                                                    <div className="mb-3">
                                                        <RadioGroup
                                                            value={addLevelMode}
                                                            onValueChange={(val) =>
                                                                setAddLevelMode(
                                                                    val as 'new' | 'existing'
                                                                )
                                                            }
                                                            className="flex gap-6"
                                                        >
                                                            <div className="flex items-center space-x-2">
                                                                <RadioGroupItem
                                                                    value="new"
                                                                    id="add-level-new"
                                                                />
                                                                <Label
                                                                    htmlFor="add-level-new"
                                                                    className="text-sm font-normal"
                                                                >
                                                                    New Level
                                                                </Label>
                                                            </div>
                                                            <div className="flex items-center space-x-2">
                                                                <RadioGroupItem
                                                                    value="existing"
                                                                    id="add-level-existing"
                                                                />
                                                                <Label
                                                                    htmlFor="add-level-existing"
                                                                    className="text-sm font-normal"
                                                                >
                                                                    Existing Levels
                                                                </Label>
                                                            </div>
                                                        </RadioGroup>
                                                    </div>
                                                    {addLevelMode === 'new' && (
                                                        <div>
                                                            <Label className="mb-1 block text-sm font-medium text-gray-700">
                                                                Level Name
                                                            </Label>
                                                            <Input
                                                                placeholder="Enter level name (e.g., Basic)"
                                                                value={newLevelName}
                                                                onChange={(e) =>
                                                                    setNewLevelName(e.target.value)
                                                                }
                                                                className="h-8 border-gray-300"
                                                            />
                                                        </div>
                                                    )}
                                                    {addLevelMode === 'existing' && (
                                                        <div className="mt-2">
                                                            <Label className="mb-2 block text-sm font-medium text-gray-700">
                                                                Select Levels
                                                            </Label>
                                                            {availableExistingBatches.length ===
                                                            0 ? (
                                                                <div className="text-sm text-gray-500">
                                                                    No existing levels found.
                                                                </div>
                                                            ) : (
                                                                <>
                                                                    <div className="mb-2 flex items-center">
                                                                        <Checkbox
                                                                            checked={
                                                                                availableExistingBatches.length >
                                                                                    0 &&
                                                                                selectedExistingLevelBatchIds.length ===
                                                                                    availableExistingBatches.length
                                                                            }
                                                                            onCheckedChange={() => {
                                                                                if (
                                                                                    selectedExistingLevelBatchIds.length ===
                                                                                    availableExistingBatches.length
                                                                                ) {
                                                                                    setSelectedExistingLevelBatchIds(
                                                                                        []
                                                                                    );
                                                                                } else {
                                                                                    setSelectedExistingLevelBatchIds(
                                                                                        availableExistingBatches.map(
                                                                                            (
                                                                                                b: ExistingBatch
                                                                                            ) =>
                                                                                                b.id
                                                                                        )
                                                                                    );
                                                                                }
                                                                            }}
                                                                            className="mr-2 size-4"
                                                                        />
                                                                        <span className="text-sm font-medium text-gray-700">
                                                                            Select All
                                                                        </span>
                                                                    </div>
                                                                    <div className="max-h-48 space-y-1 overflow-y-auto">
                                                                        {availableExistingBatches.map(
                                                                            (
                                                                                batch: ExistingBatch
                                                                            ) => (
                                                                                <div
                                                                                    key={batch.id}
                                                                                    className="flex items-center gap-2 rounded border border-gray-100 bg-gray-50 px-2 py-1"
                                                                                >
                                                                                    <Checkbox
                                                                                        checked={selectedExistingLevelBatchIds.includes(
                                                                                            batch.id
                                                                                        )}
                                                                                        onCheckedChange={() => {
                                                                                            if (
                                                                                                selectedExistingLevelBatchIds.includes(
                                                                                                    batch.id
                                                                                                )
                                                                                            ) {
                                                                                                setSelectedExistingLevelBatchIds(
                                                                                                    selectedExistingLevelBatchIds.filter(
                                                                                                        (
                                                                                                            id
                                                                                                        ) =>
                                                                                                            id !==
                                                                                                            batch.id
                                                                                                    )
                                                                                                );
                                                                                            } else {
                                                                                                setSelectedExistingLevelBatchIds(
                                                                                                    [
                                                                                                        ...selectedExistingLevelBatchIds,
                                                                                                        batch.id,
                                                                                                    ]
                                                                                                );
                                                                                            }
                                                                                        }}
                                                                                        className="size-4"
                                                                                    />
                                                                                    <span className="text-sm text-gray-700">
                                                                                        {
                                                                                            batch
                                                                                                .level
                                                                                                .level_name
                                                                                        }
                                                                                    </span>
                                                                                </div>
                                                                            )
                                                                        )}
                                                                    </div>
                                                                </>
                                                            )}
                                                        </div>
                                                    )}
                                                    <div className="mt-3 flex gap-2">
                                                        {addLevelMode === 'new' && (
                                                            <MyButton
                                                                type="button"
                                                                buttonType="primary"
                                                                scale="medium"
                                                                layoutVariant="default"
                                                                onClick={addStandaloneLevel}
                                                                disable={!newLevelName.trim()}
                                                            >
                                                                Add Level
                                                            </MyButton>
                                                        )}
                                                        {addLevelMode === 'existing' && (
                                                            <MyButton
                                                                type="button"
                                                                buttonType="primary"
                                                                scale="medium"
                                                                layoutVariant="default"
                                                                onClick={() => {
                                                                    // Add selected levels to standalone session by batch id
                                                                    const selectedBatches =
                                                                        availableExistingBatches.filter(
                                                                            (b: ExistingBatch) =>
                                                                                selectedExistingLevelBatchIds.includes(
                                                                                    b.id
                                                                                )
                                                                        );
                                                                    const newLevels: Level[] = [];
                                                                    selectedBatches.forEach(
                                                                        (batch: ExistingBatch) => {
                                                                            if (
                                                                                !sessions
                                                                                    .find(
                                                                                        (s) =>
                                                                                            s.id ===
                                                                                            'standalone'
                                                                                    )
                                                                                    ?.levels.some(
                                                                                        (l) =>
                                                                                            l.id ===
                                                                                            batch
                                                                                                .level
                                                                                                .id
                                                                                    )
                                                                            ) {
                                                                                newLevels.push({
                                                                                    id: batch.level
                                                                                        .id,
                                                                                    name: batch
                                                                                        .level
                                                                                        .level_name,
                                                                                    userIds: [],
                                                                                    batchId:
                                                                                        batch.id, // <-- set batchId here
                                                                                });
                                                                            }
                                                                        }
                                                                    );
                                                                    // Add to standalone session or create it
                                                                    const standaloneSession =
                                                                        sessions.find(
                                                                            (s) =>
                                                                                s.id ===
                                                                                'standalone'
                                                                        );
                                                                    if (standaloneSession) {
                                                                        standaloneSession.levels = [
                                                                            ...standaloneSession.levels,
                                                                            ...newLevels,
                                                                        ];
                                                                        setSessions(
                                                                            ensureBatchIdInLevels([
                                                                                ...sessions,
                                                                            ])
                                                                        );
                                                                    } else {
                                                                        setSessions([
                                                                            {
                                                                                id: 'standalone',
                                                                                name: 'Standalone',
                                                                                startDate:
                                                                                    new Date().toISOString(),
                                                                                levels: newLevels,
                                                                            },
                                                                        ]);
                                                                    }

                                                                    // Mark selected batches as used
                                                                    setUsedExistingBatchIds(
                                                                        (prev) => {
                                                                            const newSet = new Set(
                                                                                prev
                                                                            );
                                                                            selectedBatches.forEach(
                                                                                (batch) => {
                                                                                    newSet.add(
                                                                                        batch.id
                                                                                    );
                                                                                }
                                                                            );
                                                                            return newSet;
                                                                        }
                                                                    );
                                                                    setShowAddLevel(false);
                                                                    setSelectedExistingLevelBatchIds(
                                                                        []
                                                                    );
                                                                    setAddLevelMode('new');
                                                                }}
                                                                disable={
                                                                    selectedExistingLevelBatchIds.length ===
                                                                    0
                                                                }
                                                            >
                                                                Add Selected
                                                            </MyButton>
                                                        )}
                                                        <MyButton
                                                            type="button"
                                                            buttonType="secondary"
                                                            scale="medium"
                                                            layoutVariant="default"
                                                            onClick={() => {
                                                                setShowAddLevel(false);
                                                                setNewLevelName('');
                                                                setAddLevelMode('new');
                                                                setSelectedExistingLevelBatchIds(
                                                                    []
                                                                );
                                                            }}
                                                        >
                                                            Cancel
                                                        </MyButton>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        )}

                                        {/* Level Cards */}
                                        {sessions
                                            .find((s) => s.id === 'standalone')
                                            ?.levels.map((level) => (
                                                <div
                                                    key={level.batchId}
                                                    className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 p-2"
                                                >
                                                    <span className="text-sm font-medium text-gray-900">
                                                        {level.name}
                                                    </span>
                                                    <MyButton
                                                        type="button"
                                                        buttonType="text"
                                                        scale="medium"
                                                        layoutVariant="icon"
                                                        onClick={() =>
                                                            removeStandaloneLevel(level.batchId)
                                                        }
                                                        className="text-red-600 hover:text-red-700"
                                                    >
                                                        <Trash2 className="size-3" />
                                                    </MyButton>
                                                </div>
                                            ))}
                                    </div>
                                )}

                                <Separator className="bg-gray-200" />

                                {/* Add Instructors Section */}
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <Label className="text-base font-medium text-gray-900">
                                            Add Authors to Course
                                        </Label>
                                        <MyButton
                                            type="button"
                                            buttonType="secondary"
                                            scale="medium"
                                            layoutVariant="default"
                                            onClick={() => setShowInviteDialog(true)}
                                            className="font-light"
                                        >
                                            <Plus className="size-4" />
                                            Invite
                                        </MyButton>
                                    </div>

                                    {showInviteDialog && (
                                        <InviteInstructorForm
                                            onInviteSuccess={(id, name, email, profilePicId) => {
                                                handleInviteSuccess(id, name, email, profilePicId);
                                                setShowInviteDialog(false);
                                            }}
                                            onCancel={() => setShowInviteDialog(false)}
                                        />
                                    )}

                                    <div className="flex flex-col gap-4">
                                        <MultiSelectDropdown
                                            options={instructors
                                                ?.filter(
                                                    (instructor) =>
                                                        !selectedInstructors?.some(
                                                            (si) => si.id === instructor.id
                                                        )
                                                )
                                                ?.map((instructor) => ({
                                                    id: instructor.id,
                                                    name: instructor.name,
                                                    email: instructor.email,
                                                }))}
                                            selected={selectedInstructors?.map((instructor) => ({
                                                id: instructor.id,
                                                name: instructor.name,
                                                email: instructor.email,
                                            }))}
                                            onChange={(selected) => {
                                                const selectedInstructorsList: Instructor[] =
                                                    selected
                                                        ?.map((s) => {
                                                            const instructor = instructors?.find(
                                                                (i) => i.id === s.id
                                                            );
                                                            return {
                                                                id: instructor?.id || '',
                                                                email: instructor?.email || '',
                                                                name: instructor?.name || '',
                                                                profilePicId:
                                                                    instructor?.profilePicId || '',
                                                            };
                                                        })
                                                        ?.filter((i) => i.id && i.email && i.name);
                                                setSelectedInstructors(selectedInstructorsList);
                                            }}
                                            placeholder="Select instructor emails"
                                            className="w-full"
                                        />

                                        {selectedInstructors && selectedInstructors.length > 0 && (
                                            <div className="space-y-2">
                                                {selectedInstructors?.map((instructor) => {
                                                    const isAssigning =
                                                        showAssignmentCard &&
                                                        selectedInstructorId === instructor.id;
                                                    return (
                                                        <Card
                                                            key={instructor.id}
                                                            className="border-gray-200"
                                                        >
                                                            <CardContent
                                                                className={`p-3 ${isAssigning ? 'pb-3' : 'pb-2'}`}
                                                            >
                                                                <div className="flex items-center justify-between">
                                                                    <div className="flex items-center gap-3">
                                                                        <Avatar className="size-8">
                                                                            <AvatarImage
                                                                                src=""
                                                                                alt={
                                                                                    instructor.email
                                                                                }
                                                                            />
                                                                            <AvatarFallback className="bg-[#3B82F6] text-xs font-medium text-white">
                                                                                {getInitials(
                                                                                    instructor.email
                                                                                )}
                                                                            </AvatarFallback>
                                                                        </Avatar>
                                                                        <div className="flex flex-col">
                                                                            <span className="text-sm font-medium text-gray-900">
                                                                                {instructor.name}{' '}
                                                                                --- &nbsp;
                                                                                {instructor.email}
                                                                            </span>
                                                                            {(hasSessions ===
                                                                                'yes' ||
                                                                                hasLevels ===
                                                                                    'yes') && (
                                                                                <span className="text-xs text-gray-500">
                                                                                    {instructorMappings.find(
                                                                                        (m) =>
                                                                                            m.id ===
                                                                                            instructor.id
                                                                                    )?.sessionLevels
                                                                                        .length ||
                                                                                        0}{' '}
                                                                                    batches assigned
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                    <div className="flex gap-2">
                                                                        {(hasSessions === 'yes' ||
                                                                            hasLevels ===
                                                                                'yes') && (
                                                                            <MyButton
                                                                                type="button"
                                                                                buttonType="secondary"
                                                                                scale="small"
                                                                                layoutVariant="default"
                                                                                onClick={() => {
                                                                                    setSelectedInstructorId(
                                                                                        instructor.id
                                                                                    );
                                                                                    setSelectedInstructorEmail(
                                                                                        instructor.email
                                                                                    );
                                                                                    const existingMappings =
                                                                                        instructorMappings.find(
                                                                                            (m) =>
                                                                                                m.id ===
                                                                                                instructor.id
                                                                                        );
                                                                                    setSelectedSessionLevels(
                                                                                        existingMappings?.sessionLevels ||
                                                                                            []
                                                                                    );
                                                                                    setShowAssignmentCard(
                                                                                        true
                                                                                    );
                                                                                }}
                                                                            >
                                                                                {instructorMappings.find(
                                                                                    (m) =>
                                                                                        m.id ===
                                                                                        instructor.id
                                                                                )
                                                                                    ? 'Edit'
                                                                                    : 'Assign'}
                                                                            </MyButton>
                                                                        )}
                                                                        <MyButton
                                                                            type="button"
                                                                            buttonType="text"
                                                                            scale="medium"
                                                                            layoutVariant="icon"
                                                                            onClick={() => {
                                                                                // 1. Remove from selectedInstructors
                                                                                const updatedInstructors =
                                                                                    (
                                                                                        selectedInstructors: Instructor[]
                                                                                    ) =>
                                                                                        selectedInstructors.filter(
                                                                                            (i) =>
                                                                                                i.id !==
                                                                                                instructor.id
                                                                                        );
                                                                                setSelectedInstructors(
                                                                                    updatedInstructors
                                                                                );
                                                                                form.setValue(
                                                                                    'selectedInstructors',
                                                                                    updatedInstructors(
                                                                                        selectedInstructors
                                                                                    )
                                                                                );
                                                                                // 2. Remove from all sessions -> levels -> userIds
                                                                                const updatedSessions =
                                                                                    form
                                                                                        .getValues(
                                                                                            'sessions'
                                                                                        )
                                                                                        .map(
                                                                                            (
                                                                                                session
                                                                                            ) => ({
                                                                                                ...session,
                                                                                                levels: session.levels.map(
                                                                                                    (
                                                                                                        level
                                                                                                    ) => ({
                                                                                                        ...level,
                                                                                                        userIds:
                                                                                                            level.userIds.filter(
                                                                                                                (
                                                                                                                    user
                                                                                                                ) =>
                                                                                                                    user.id !==
                                                                                                                    instructor.id
                                                                                                            ),
                                                                                                    })
                                                                                                ),
                                                                                            })
                                                                                        );
                                                                                form.setValue(
                                                                                    'sessions',
                                                                                    updatedSessions,
                                                                                    {
                                                                                        shouldDirty:
                                                                                            true,
                                                                                    }
                                                                                );

                                                                                setInstructorMappings(
                                                                                    (prev) =>
                                                                                        prev.filter(
                                                                                            (m) =>
                                                                                                m.id !==
                                                                                                instructor.id
                                                                                        )
                                                                                );
                                                                            }}
                                                                            className="!size-6 text-red-600 hover:text-red-700"
                                                                        >
                                                                            <Trash2 className="size-3" />
                                                                        </MyButton>
                                                                    </div>
                                                                </div>

                                                                {isAssigning && (
                                                                    <>
                                                                        <Separator className="my-3" />
                                                                        <div className="grid grid-cols-2 gap-4">
                                                                            {hasSessions ===
                                                                                'yes' &&
                                                                                hasLevels ===
                                                                                    'yes' &&
                                                                                // Show session-level combinations with select all for each session
                                                                                sessions.map(
                                                                                    (session) => {
                                                                                        // Check if all levels in this session are selected
                                                                                        const allLevelsSelected =
                                                                                            session
                                                                                                .levels
                                                                                                .length >
                                                                                                0 &&
                                                                                            session.levels.every(
                                                                                                (
                                                                                                    level
                                                                                                ) =>
                                                                                                    selectedSessionLevels.some(
                                                                                                        (
                                                                                                            item
                                                                                                        ) =>
                                                                                                            item.sessionId ===
                                                                                                                session.id &&
                                                                                                            item.levelId ===
                                                                                                                level.id
                                                                                                    )
                                                                                            );
                                                                                        return (
                                                                                            <div
                                                                                                key={
                                                                                                    session.id
                                                                                                }
                                                                                            >
                                                                                                <div className="mb-2 flex items-center">
                                                                                                    <Checkbox
                                                                                                        checked={
                                                                                                            allLevelsSelected
                                                                                                        }
                                                                                                        onCheckedChange={() => {
                                                                                                            if (
                                                                                                                allLevelsSelected
                                                                                                            ) {
                                                                                                                // Uncheck all levels in this session
                                                                                                                setSelectedSessionLevels(
                                                                                                                    (
                                                                                                                        prev
                                                                                                                    ) =>
                                                                                                                        prev.filter(
                                                                                                                            (
                                                                                                                                item
                                                                                                                            ) =>
                                                                                                                                item.sessionId !==
                                                                                                                                session.id
                                                                                                                        )
                                                                                                                );
                                                                                                            } else {
                                                                                                                // Check all levels in this session
                                                                                                                setSelectedSessionLevels(
                                                                                                                    (
                                                                                                                        prev
                                                                                                                    ) => {
                                                                                                                        const newLevels =
                                                                                                                            session.levels
                                                                                                                                .filter(
                                                                                                                                    (
                                                                                                                                        level
                                                                                                                                    ) =>
                                                                                                                                        !prev.some(
                                                                                                                                            (
                                                                                                                                                item
                                                                                                                                            ) =>
                                                                                                                                                item.sessionId ===
                                                                                                                                                    session.id &&
                                                                                                                                                item.levelId ===
                                                                                                                                                    level.id
                                                                                                                                        )
                                                                                                                                )
                                                                                                                                .map(
                                                                                                                                    (
                                                                                                                                        level
                                                                                                                                    ) => ({
                                                                                                                                        sessionId:
                                                                                                                                            session.id,
                                                                                                                                        sessionName:
                                                                                                                                            session.name,
                                                                                                                                        levelId:
                                                                                                                                            level.id,
                                                                                                                                        levelName:
                                                                                                                                            level.name,
                                                                                                                                    })
                                                                                                                                );
                                                                                                                        return [
                                                                                                                            ...prev,
                                                                                                                            ...newLevels,
                                                                                                                        ];
                                                                                                                    }
                                                                                                                );
                                                                                                            }
                                                                                                        }}
                                                                                                        className="mr-2 size-4"
                                                                                                    />
                                                                                                    <h4 className="text-sm font-medium text-gray-700">
                                                                                                        {
                                                                                                            session.name
                                                                                                        }
                                                                                                    </h4>
                                                                                                </div>
                                                                                                <div className="space-y-1">
                                                                                                    {session.levels.map(
                                                                                                        (
                                                                                                            level
                                                                                                        ) => {
                                                                                                            const isChecked =
                                                                                                                selectedSessionLevels.some(
                                                                                                                    (
                                                                                                                        item
                                                                                                                    ) =>
                                                                                                                        item.sessionId ===
                                                                                                                            session.id &&
                                                                                                                        item.levelId ===
                                                                                                                            level.id
                                                                                                                );
                                                                                                            return (
                                                                                                                <div
                                                                                                                    key={`${session.id}-${level.id}`}
                                                                                                                    className="flex items-center gap-2 rounded border border-gray-100 bg-gray-50 px-2 py-1"
                                                                                                                >
                                                                                                                    <Checkbox
                                                                                                                        checked={
                                                                                                                            isChecked
                                                                                                                        }
                                                                                                                        onCheckedChange={() =>
                                                                                                                            handleSessionLevelCheckboxChange(
                                                                                                                                session.id,
                                                                                                                                session.name,
                                                                                                                                level.id,
                                                                                                                                level.name
                                                                                                                            )
                                                                                                                        }
                                                                                                                        className="size-4"
                                                                                                                    />
                                                                                                                    <span className="text-sm text-gray-700">{`${session.name} - ${level.name}`}</span>
                                                                                                                </div>
                                                                                                            );
                                                                                                        }
                                                                                                    )}
                                                                                                </div>
                                                                                            </div>
                                                                                        );
                                                                                    }
                                                                                )}
                                                                            {hasSessions ===
                                                                                'yes' &&
                                                                                hasLevels !==
                                                                                    'yes' &&
                                                                                // Show only sessions with select all
                                                                                (() => {
                                                                                    const allSessionsSelected =
                                                                                        sessions.length >
                                                                                            0 &&
                                                                                        sessions.every(
                                                                                            (
                                                                                                session
                                                                                            ) =>
                                                                                                selectedSessionLevels.some(
                                                                                                    (
                                                                                                        item
                                                                                                    ) =>
                                                                                                        item.sessionId ===
                                                                                                        session.id
                                                                                                )
                                                                                        );
                                                                                    return (
                                                                                        <div className="space-y-1">
                                                                                            <div className="mb-2 flex items-center">
                                                                                                <Checkbox
                                                                                                    checked={
                                                                                                        allSessionsSelected
                                                                                                    }
                                                                                                    onCheckedChange={() => {
                                                                                                        if (
                                                                                                            allSessionsSelected
                                                                                                        ) {
                                                                                                            setSelectedSessionLevels(
                                                                                                                (
                                                                                                                    prev
                                                                                                                ) =>
                                                                                                                    prev.filter(
                                                                                                                        (
                                                                                                                            item
                                                                                                                        ) =>
                                                                                                                            !sessions.some(
                                                                                                                                (
                                                                                                                                    session
                                                                                                                                ) =>
                                                                                                                                    item.sessionId ===
                                                                                                                                    session.id
                                                                                                                            )
                                                                                                                    )
                                                                                                            );
                                                                                                        } else {
                                                                                                            setSelectedSessionLevels(
                                                                                                                (
                                                                                                                    prev
                                                                                                                ) => {
                                                                                                                    const newSessions =
                                                                                                                        sessions
                                                                                                                            .filter(
                                                                                                                                (
                                                                                                                                    session
                                                                                                                                ) =>
                                                                                                                                    !prev.some(
                                                                                                                                        (
                                                                                                                                            item
                                                                                                                                        ) =>
                                                                                                                                            item.sessionId ===
                                                                                                                                            session.id
                                                                                                                                    )
                                                                                                                            )
                                                                                                                            .map(
                                                                                                                                (
                                                                                                                                    session
                                                                                                                                ) => ({
                                                                                                                                    sessionId:
                                                                                                                                        session.id,
                                                                                                                                    sessionName:
                                                                                                                                        session.name,
                                                                                                                                    levelId:
                                                                                                                                        'DEFAULT',
                                                                                                                                    levelName:
                                                                                                                                        '',
                                                                                                                                })
                                                                                                                            );
                                                                                                                    return [
                                                                                                                        ...prev,
                                                                                                                        ...newSessions,
                                                                                                                    ];
                                                                                                                }
                                                                                                            );
                                                                                                        }
                                                                                                    }}
                                                                                                    className="mr-2 size-4"
                                                                                                />
                                                                                                <span className="text-sm font-medium text-gray-700">
                                                                                                    Select
                                                                                                    All
                                                                                                </span>
                                                                                            </div>
                                                                                            {sessions.map(
                                                                                                (
                                                                                                    session
                                                                                                ) => {
                                                                                                    const isChecked =
                                                                                                        selectedSessionLevels.some(
                                                                                                            (
                                                                                                                item
                                                                                                            ) =>
                                                                                                                item.sessionId ===
                                                                                                                session.id
                                                                                                        );
                                                                                                    return (
                                                                                                        <div
                                                                                                            key={
                                                                                                                session.id
                                                                                                            }
                                                                                                            className="flex items-center gap-2 rounded border border-gray-100 bg-gray-50 px-2 py-1"
                                                                                                        >
                                                                                                            <Checkbox
                                                                                                                checked={
                                                                                                                    isChecked
                                                                                                                }
                                                                                                                onCheckedChange={() =>
                                                                                                                    handleSessionLevelCheckboxChange(
                                                                                                                        session.id,
                                                                                                                        session.name,
                                                                                                                        'DEFAULT',
                                                                                                                        ''
                                                                                                                    )
                                                                                                                }
                                                                                                                className="size-4"
                                                                                                            />
                                                                                                            <span className="text-sm text-gray-700">
                                                                                                                {
                                                                                                                    session.name
                                                                                                                }
                                                                                                            </span>
                                                                                                        </div>
                                                                                                    );
                                                                                                }
                                                                                            )}
                                                                                        </div>
                                                                                    );
                                                                                })()}
                                                                            {hasSessions !==
                                                                                'yes' &&
                                                                                hasLevels ===
                                                                                    'yes' &&
                                                                                // Show only levels with select all
                                                                                (() => {
                                                                                    const standaloneSession =
                                                                                        sessions.find(
                                                                                            (s) =>
                                                                                                s.id ===
                                                                                                'standalone'
                                                                                        );
                                                                                    const levels =
                                                                                        standaloneSession?.levels ||
                                                                                        [];
                                                                                    const allLevelsSelected =
                                                                                        levels.length >
                                                                                            0 &&
                                                                                        levels.every(
                                                                                            (
                                                                                                level
                                                                                            ) =>
                                                                                                selectedSessionLevels.some(
                                                                                                    (
                                                                                                        item
                                                                                                    ) =>
                                                                                                        item.levelId ===
                                                                                                        level.id
                                                                                                )
                                                                                        );
                                                                                    return (
                                                                                        <div className="space-y-1">
                                                                                            <div className="mb-2 flex items-center">
                                                                                                <Checkbox
                                                                                                    checked={
                                                                                                        allLevelsSelected
                                                                                                    }
                                                                                                    onCheckedChange={() => {
                                                                                                        if (
                                                                                                            allLevelsSelected
                                                                                                        ) {
                                                                                                            setSelectedSessionLevels(
                                                                                                                (
                                                                                                                    prev
                                                                                                                ) =>
                                                                                                                    prev.filter(
                                                                                                                        (
                                                                                                                            item
                                                                                                                        ) =>
                                                                                                                            !levels.some(
                                                                                                                                (
                                                                                                                                    level
                                                                                                                                ) =>
                                                                                                                                    item.levelId ===
                                                                                                                                    level.id
                                                                                                                            )
                                                                                                                    )
                                                                                                            );
                                                                                                        } else {
                                                                                                            setSelectedSessionLevels(
                                                                                                                (
                                                                                                                    prev
                                                                                                                ) => {
                                                                                                                    const newLevels =
                                                                                                                        levels
                                                                                                                            .filter(
                                                                                                                                (
                                                                                                                                    level
                                                                                                                                ) =>
                                                                                                                                    !prev.some(
                                                                                                                                        (
                                                                                                                                            item
                                                                                                                                        ) =>
                                                                                                                                            item.levelId ===
                                                                                                                                            level.id
                                                                                                                                    )
                                                                                                                            )
                                                                                                                            .map(
                                                                                                                                (
                                                                                                                                    level
                                                                                                                                ) => ({
                                                                                                                                    sessionId:
                                                                                                                                        'DEFAULT',
                                                                                                                                    sessionName:
                                                                                                                                        '',
                                                                                                                                    levelId:
                                                                                                                                        level.id,
                                                                                                                                    levelName:
                                                                                                                                        level.name,
                                                                                                                                })
                                                                                                                            );
                                                                                                                    return [
                                                                                                                        ...prev,
                                                                                                                        ...newLevels,
                                                                                                                    ];
                                                                                                                }
                                                                                                            );
                                                                                                        }
                                                                                                    }}
                                                                                                    className="mr-2 size-4"
                                                                                                />
                                                                                                <span className="text-sm font-medium text-gray-700">
                                                                                                    Select
                                                                                                    All
                                                                                                </span>
                                                                                            </div>
                                                                                            {levels.map(
                                                                                                (
                                                                                                    level
                                                                                                ) => {
                                                                                                    const isChecked =
                                                                                                        selectedSessionLevels.some(
                                                                                                            (
                                                                                                                item
                                                                                                            ) =>
                                                                                                                item.levelId ===
                                                                                                                level.id
                                                                                                        );
                                                                                                    return (
                                                                                                        <div
                                                                                                            key={
                                                                                                                level.id
                                                                                                            }
                                                                                                            className="flex items-center gap-2 rounded border border-gray-100 bg-gray-50 px-2 py-1"
                                                                                                        >
                                                                                                            <Checkbox
                                                                                                                checked={
                                                                                                                    isChecked
                                                                                                                }
                                                                                                                onCheckedChange={() =>
                                                                                                                    handleSessionLevelCheckboxChange(
                                                                                                                        'DEFAULT',
                                                                                                                        '',
                                                                                                                        level.id,
                                                                                                                        level.name
                                                                                                                    )
                                                                                                                }
                                                                                                                className="size-4"
                                                                                                            />
                                                                                                            <span className="text-sm text-gray-700">
                                                                                                                {
                                                                                                                    level.name
                                                                                                                }
                                                                                                            </span>
                                                                                                        </div>
                                                                                                    );
                                                                                                }
                                                                                            )}
                                                                                        </div>
                                                                                    );
                                                                                })()}
                                                                        </div>
                                                                        <div className="mt-3 flex justify-end gap-2">
                                                                            <MyButton
                                                                                type="button"
                                                                                buttonType="secondary"
                                                                                scale="small"
                                                                                layoutVariant="default"
                                                                                onClick={() => {
                                                                                    setShowAssignmentCard(
                                                                                        false
                                                                                    );
                                                                                    setSelectedSessionLevels(
                                                                                        []
                                                                                    );
                                                                                }}
                                                                            >
                                                                                Cancel
                                                                            </MyButton>
                                                                            <MyButton
                                                                                type="button"
                                                                                buttonType="primary"
                                                                                scale="small"
                                                                                layoutVariant="default"
                                                                                onClick={
                                                                                    handleAssignmentSave
                                                                                }
                                                                                disable={
                                                                                    !instructorMappings.find(
                                                                                        (m) =>
                                                                                            m.id ===
                                                                                            selectedInstructorId
                                                                                    ) &&
                                                                                    selectedSessionLevels.length ===
                                                                                        0
                                                                                }
                                                                            >
                                                                                Save
                                                                            </MyButton>
                                                                        </div>
                                                                    </>
                                                                )}
                                                            </CardContent>
                                                        </Card>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <Separator className="bg-gray-200" />

                                {/* Course Catalogue Section */}
                                <div className="space-y-2">
                                    <div className="flex items-center space-x-3">
                                        <Checkbox
                                            id="publish-catalogue"
                                            checked={publishToCatalogue}
                                            onCheckedChange={handlePublishChange}
                                            className="data-[state=checked]:border-[#3B82F6] data-[state=checked]:bg-[#3B82F6]"
                                        />
                                        <Label
                                            htmlFor="publish-catalogue"
                                            className="text-base font-medium text-gray-900"
                                        >
                                            Publish to Course Catalogue
                                        </Label>
                                    </div>
                                    <p className="ml-7 text-sm text-gray-600">
                                        The course will be added to the course catalogue which will
                                        be viewed by the learners.
                                    </p>
                                </div>

                                <Separator className="bg-gray-200" />
                            </CardContent>
                        </Card>
                    </div>

                    {/* Fixed Footer */}
                    <div className="fixed inset-x-0 bottom-0 border-t bg-white px-8 py-4">
                        <div className="flex justify-between">
                            <MyButton
                                type="button"
                                buttonType="secondary"
                                scale="large"
                                layoutVariant="default"
                                onClick={onBack}
                            >
                                Back
                            </MyButton>
                            <MyButton
                                type="button"
                                buttonType="primary"
                                scale="large"
                                layoutVariant="default"
                                onClick={(e) => {
                                    e.preventDefault();
                                    handleSubmit(form.getValues());
                                }}
                                disable={
                                    disableCreate ||
                                    (hasSessions === 'yes' && hasLevels === 'yes'
                                        ? sessions.length === 0 ||
                                          sessions.every((s) => !s.levels || s.levels.length === 0)
                                        : hasSessions === 'yes'
                                          ? sessions.length === 0
                                          : hasLevels === 'yes'
                                            ? !sessions.find((s) => s.id === 'standalone') ||
                                              sessions.find((s) => s.id === 'standalone')?.levels
                                                  .length === 0
                                            : false)
                                }
                            >
                                {isLoading ? (
                                    <span className="flex items-center gap-2">
                                        <span className="size-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                        {isEdit ? 'Updating...' : 'Creating...'}
                                    </span>
                                ) : (
                                    <>
                                        {!isEdit && <Plus />}
                                        {isEdit ? 'Edit' : 'Create'}
                                    </>
                                )}
                            </MyButton>
                        </div>
                    </div>
                </form>
            </Form>

            {/* Move dialogs outside the Form component */}
            <SessionLevelMappingDialog
                open={showMappingDialog}
                onOpenChange={setShowMappingDialog}
                sessions={sessions}
                onSave={handleSessionLevelMappingSave}
            />
        </>
    );
};

export default AddCourseStep2;

// Update SessionCard component to conditionally show level functionality
const SessionCard: React.FC<{
    session: Session;
    hasLevels: boolean;
    onRemoveSession: (sessionId: string, batchId?: string) => void;
    onAddLevel: (sessionId: string, levelName: string, levelId?: string) => void;
    onRemoveLevel: (sessionId: string, batchId: string) => void;
    existingBatches?: ExistingBatch[];
    onMarkBatchesAsUsed?: (batchIds: string[]) => void;
}> = ({
    session,
    hasLevels,
    onRemoveSession,
    onAddLevel,
    onRemoveLevel,
    existingBatches = [],
    onMarkBatchesAsUsed,
}) => {
    const [showAddLevel, setShowAddLevel] = useState(false);
    const [newLevelName, setNewLevelName] = useState('');
    const [addLevelMode, setAddLevelMode] = useState<'new' | 'existing'>('new');
    const [selectedExistingLevelBatchIds, setSelectedExistingLevelBatchIds] = useState<string[]>(
        []
    );

    const handleAddLevel = () => {
        if (newLevelName.trim()) {
            onAddLevel(session.id, newLevelName);
            setNewLevelName('');
            setShowAddLevel(false);
        }
    };

    // Get existing levels for this specific session that are not already added
    const getExistingLevelsForSession = (sessionId: string) => {
        const allBatchesForSession = existingBatches.filter(
            (batch) => batch.session.id === sessionId
        );
        // Filter out levels that are already added to this session
        return allBatchesForSession.filter(
            (batch) => !session.levels.some((level) => level.id === batch.level.id)
        );
    };

    const existingLevelsForSession = getExistingLevelsForSession(session.id);

    return (
        <Card className="border-gray-200">
            <CardContent className="p-3">
                <div className="mb-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Calendar className="size-4 text-[#3B82F6]" />
                        <div>
                            <span className="text-sm font-medium text-gray-900">
                                {session.name}
                            </span>
                            <span className="ml-2 text-xs text-gray-500">
                                {new Date(session.startDate).toLocaleDateString()}
                            </span>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        {hasLevels && (
                            <MyButton
                                type="button"
                                buttonType="secondary"
                                scale="medium"
                                layoutVariant="default"
                                onClick={() => setShowAddLevel(true)}
                                className="font-light"
                            >
                                <Plus />
                                Add Level
                            </MyButton>
                        )}
                        <MyButton
                            type="button"
                            buttonType="text"
                            scale="medium"
                            layoutVariant="icon"
                            onClick={() =>
                                onRemoveSession((session.batchId || session.id).toString())
                            }
                            className="text-red-600 hover:text-red-700"
                        >
                            <Trash2 className="size-3" />
                        </MyButton>
                    </div>
                </div>

                {hasLevels && (
                    <>
                        {showAddLevel && (
                            <div className="mb-3 rounded-lg border bg-gray-50 p-3">
                                <div className="mb-3">
                                    <RadioGroup
                                        value={addLevelMode}
                                        onValueChange={(val) =>
                                            setAddLevelMode(val as 'new' | 'existing')
                                        }
                                        className="flex gap-6"
                                    >
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem
                                                value="new"
                                                id={`add-level-new-${session.id}`}
                                            />
                                            <Label
                                                htmlFor={`add-level-new-${session.id}`}
                                                className="text-sm font-normal"
                                            >
                                                New Level
                                            </Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem
                                                value="existing"
                                                id={`add-level-existing-${session.id}`}
                                            />
                                            <Label
                                                htmlFor={`add-level-existing-${session.id}`}
                                                className="text-sm font-normal"
                                            >
                                                Existing Levels
                                            </Label>
                                        </div>
                                    </RadioGroup>
                                </div>

                                {addLevelMode === 'new' && (
                                    <div>
                                        <Label className="mb-1 block text-sm font-medium text-gray-700">
                                            Level Name
                                        </Label>
                                        <Input
                                            placeholder="Enter level name (e.g., Basic)"
                                            value={newLevelName}
                                            onChange={(e) => setNewLevelName(e.target.value)}
                                            className="h-8 border-gray-300"
                                        />
                                    </div>
                                )}

                                {addLevelMode === 'existing' && (
                                    <div className="mt-2">
                                        <Label className="mb-2 block text-sm font-medium text-gray-700">
                                            Select Levels
                                        </Label>
                                        {existingLevelsForSession.length === 0 ? (
                                            <div className="text-sm text-gray-500">
                                                No existing levels found for this session.
                                            </div>
                                        ) : (
                                            <>
                                                <div className="mb-2 flex items-center">
                                                    <Checkbox
                                                        checked={
                                                            existingLevelsForSession.length > 0 &&
                                                            selectedExistingLevelBatchIds.length ===
                                                                existingLevelsForSession.length
                                                        }
                                                        onCheckedChange={() => {
                                                            if (
                                                                selectedExistingLevelBatchIds.length ===
                                                                existingLevelsForSession.length
                                                            ) {
                                                                setSelectedExistingLevelBatchIds(
                                                                    []
                                                                );
                                                            } else {
                                                                setSelectedExistingLevelBatchIds(
                                                                    existingLevelsForSession.map(
                                                                        (batch: ExistingBatch) =>
                                                                            batch.id
                                                                    )
                                                                );
                                                            }
                                                        }}
                                                        className="mr-2 size-4"
                                                    />
                                                    <span className="text-sm font-medium text-gray-700">
                                                        Select All
                                                    </span>
                                                </div>
                                                <div className="max-h-48 space-y-1 overflow-y-auto">
                                                    {existingLevelsForSession.map(
                                                        (batch: ExistingBatch) => (
                                                            <div
                                                                key={batch.id}
                                                                className="flex items-center gap-2 rounded border border-gray-100 bg-gray-50 px-2 py-1"
                                                            >
                                                                <Checkbox
                                                                    checked={selectedExistingLevelBatchIds.includes(
                                                                        batch.id
                                                                    )}
                                                                    onCheckedChange={() => {
                                                                        if (
                                                                            selectedExistingLevelBatchIds.includes(
                                                                                batch.id
                                                                            )
                                                                        ) {
                                                                            setSelectedExistingLevelBatchIds(
                                                                                selectedExistingLevelBatchIds.filter(
                                                                                    (id) =>
                                                                                        id !==
                                                                                        batch.id
                                                                                )
                                                                            );
                                                                        } else {
                                                                            setSelectedExistingLevelBatchIds(
                                                                                [
                                                                                    ...selectedExistingLevelBatchIds,
                                                                                    batch.id,
                                                                                ]
                                                                            );
                                                                        }
                                                                    }}
                                                                    className="size-4"
                                                                />
                                                                <span className="text-sm text-gray-700">
                                                                    {batch.level.level_name}
                                                                </span>
                                                            </div>
                                                        )
                                                    )}
                                                </div>
                                            </>
                                        )}
                                    </div>
                                )}

                                <div className="mt-3 flex gap-2">
                                    {addLevelMode === 'new' && (
                                        <MyButton
                                            type="button"
                                            buttonType="primary"
                                            scale="medium"
                                            layoutVariant="default"
                                            onClick={handleAddLevel}
                                            disable={!newLevelName.trim()}
                                        >
                                            Add Level
                                        </MyButton>
                                    )}
                                    {addLevelMode === 'existing' && (
                                        <MyButton
                                            type="button"
                                            buttonType="primary"
                                            scale="medium"
                                            layoutVariant="default"
                                            onClick={() => {
                                                // Add selected existing levels to this session
                                                const selectedBatches =
                                                    existingLevelsForSession.filter(
                                                        (batch: ExistingBatch) =>
                                                            selectedExistingLevelBatchIds.includes(
                                                                batch.id
                                                            )
                                                    );

                                                selectedBatches.forEach((batch: ExistingBatch) => {
                                                    // Check if this level already exists in the session
                                                    const levelExists = session.levels.some(
                                                        (level) => level.id === batch.level.id
                                                    );

                                                    if (!levelExists) {
                                                        onAddLevel(
                                                            session.id,
                                                            batch.level.level_name,
                                                            batch.level.id
                                                        );
                                                    }
                                                });

                                                // Mark selected batches as used
                                                if (onMarkBatchesAsUsed) {
                                                    onMarkBatchesAsUsed(
                                                        selectedBatches.map((batch) => batch.id)
                                                    );
                                                }

                                                setShowAddLevel(false);
                                                setSelectedExistingLevelBatchIds([]);
                                                setAddLevelMode('new');
                                            }}
                                            disable={selectedExistingLevelBatchIds.length === 0}
                                        >
                                            Add Selected
                                        </MyButton>
                                    )}
                                    <MyButton
                                        type="button"
                                        buttonType="secondary"
                                        scale="medium"
                                        layoutVariant="default"
                                        onClick={() => {
                                            setShowAddLevel(false);
                                            setNewLevelName('');
                                            setAddLevelMode('new');
                                            setSelectedExistingLevelBatchIds([]);
                                        }}
                                    >
                                        Cancel
                                    </MyButton>
                                </div>
                            </div>
                        )}

                        {session.levels.length > 0 && (
                            <div className="space-y-2">
                                {session.levels.map((level) => (
                                    <div
                                        key={level.batchId}
                                        className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 p-2"
                                    >
                                        <span className="text-sm font-medium text-gray-900">
                                            {level.name}
                                        </span>
                                        <MyButton
                                            type="button"
                                            buttonType="text"
                                            scale="medium"
                                            layoutVariant="icon"
                                            onClick={() => onRemoveLevel(session.id, level.batchId)}
                                            className="text-red-600 hover:text-red-700"
                                        >
                                            <Trash2 className="size-3" />
                                        </MyButton>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </CardContent>
        </Card>
    );
};

// Utility to ensure all levels in sessions have batchId
function ensureBatchIdInLevels(sessions: Session[]): Session[] {
    return sessions.map((session) => ({
        ...session,
        levels: session.levels.map((level) => ({
            ...level,
            batchId: (level as Level).batchId || level.id,
        })),
    }));
}
