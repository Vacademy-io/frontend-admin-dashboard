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

interface Level {
    id: string;
    name: string;
    userIds: Instructor[];
}

interface Session {
    id: string;
    name: string;
    startDate: string;
    levels: Level[];
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
    }>;
}

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
    const instituteId = getInstituteId();
    const [hasLevels, setHasLevels] = useState(initialData?.hasLevels || 'yes');
    const [hasSessions, setHasSessions] = useState(
        instituteId === CODE_CIRCLE_INSTITUTE_ID ? 'no' : initialData?.hasSessions || 'yes'
    );
    const [sessions, setSessions] = useState<Session[]>(initialData?.sessions || []);
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
        initialData?.publishToCatalogue || false
    );
    const [showAssignmentCard, setShowAssignmentCard] = useState(false);
    const [selectedSessionLevels, setSelectedSessionLevels] = useState<
        Array<{
            sessionId: string;
            sessionName: string;
            levelId: string;
            levelName: string;
        }>
    >([]);

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

    const removeSession = (sessionId: string) => {
        const updatedSessions = sessions.filter((session) => session.id !== sessionId);
        setSessions(updatedSessions);
        form.setValue('sessions', updatedSessions);

        // Remove all assignments for this session from all instructors
        setInstructorMappings((prev) =>
            prev.map((instructor) => ({
                ...instructor,
                sessionLevels: instructor.sessionLevels.filter((sl) => sl.sessionId !== sessionId),
            }))
        );
    };

    const addLevel = (sessionId: string, levelName: string) => {
        if (levelName.trim()) {
            const newLevel: Level = {
                id: Date.now().toString(),
                name: levelName.trim(),
                userIds: [],
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

    const removeLevel = (sessionId: string, levelId: string) => {
        const updatedSessions = sessions.map((session) =>
            session.id === sessionId
                ? {
                      ...session,
                      levels: session.levels.filter((level) => level.id !== levelId),
                  }
                : session
        );
        setSessions(updatedSessions);
        form.setValue('sessions', updatedSessions);

        // Remove all assignments for this level from all instructors
        setInstructorMappings((prev) =>
            prev.map((instructor) => ({
                ...instructor,
                sessionLevels: instructor.sessionLevels.filter(
                    (sl) => !(sl.sessionId === sessionId && sl.levelId === levelId)
                ),
            }))
        );
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

    const handleInviteSuccess = (id: string, name: string, email: string) => {
        const newInstructor: Instructor = { id: id, email: email, name: name, profilePicId: '' };

        // Add to available instructors list if not already present
        if (!instructors.some((i) => i.email === email)) {
            setInstructors((prev) => [...prev, newInstructor]);
        }

        // Add to selected instructors list
        if (!selectedInstructors.some((i) => i.email === email)) {
            setSelectedInstructors((prev) => [...prev, newInstructor]);
        }
    };

    const handleSessionLevelMappingSave = (
        mappings: Array<{
            sessionId: string;
            sessionName: string;
            levelId: string;
            levelName: string;
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
            const dummySession: Session = {
                id: 'standalone',
                name: 'Standalone',
                startDate: new Date().toISOString(),
                levels: [],
            };

            const newLevel: Level = {
                id: Date.now().toString(),
                name: newLevelName.trim(),
                userIds: [],
            };

            // If there's no standalone session yet, create one
            const standaloneSession = sessions.find((s) => s.id === 'standalone');
            if (!standaloneSession) {
                setSessions([{ ...dummySession, levels: [newLevel] }]);
            } else {
                // Add level to existing standalone session
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
    const removeStandaloneLevel = (levelId: string) => {
        const updatedSessions = sessions.map((session) =>
            session.id === 'standalone'
                ? {
                      ...session,
                      levels: session.levels.filter((level) => level.id !== levelId),
                  }
                : session
        );
        setSessions(updatedSessions);
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

            if (hasSessions === 'no' && hasLevels === 'no') {
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

            form.getValues('sessions')?.forEach((session) => {
                session.levels?.forEach((level) => {
                    level.userIds?.forEach((instructor) => {
                        const sessionLevelMapping = {
                            sessionId: session.id,
                            sessionName: session.name,
                            levelId: level.id,
                            levelName: level.name,
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
            roles: [{ id: '5', name: 'TEACHER' }],
            status: [{ id: '1', name: 'ACTIVE' }],
        })
            .then((res) => {
                setInstructors(
                    res.map((instructor: UserRolesDataEntry) => ({
                        id: instructor.id,
                        email: instructor.email,
                        name: instructor.full_name,
                        profilePicId: instructor.profile_pic_file_id,
                    }))
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
                                <div className="rounded-lg border border-red-200 bg-red-50 p-3">
                                    <p className="text-sm text-red-700">
                                        <strong>Note:</strong> Once you create the course, its
                                        structure—including sessions and levels—cannot be changed.
                                        Please review carefully before proceeding.
                                    </p>
                                </div>

                                {/* Structure Selection */}
                                <div>
                                    <h3 className="mb-3 text-base font-medium text-gray-900">
                                        Select course structure that is suitable for your institute
                                    </h3>
                                    <AddCourseStep2StructureTypes form={form} />
                                </div>

                                {instituteId !== CODE_CIRCLE_INSTITUTE_ID && (
                                    <>
                                        <Separator className="bg-gray-200" />
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
                                                        setSessions([]);
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
                                {hasSessions === 'no' && hasLevels === 'no' && (
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
                                                    <div className="grid grid-cols-2 gap-2">
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
                                                    </div>
                                                    <div className="mt-3 flex gap-2">
                                                        <MyButton
                                                            type="button"
                                                            buttonType="primary"
                                                            scale="medium"
                                                            layoutVariant="default"
                                                            onClick={addSession}
                                                            disable={
                                                                !newSessionName.trim() ||
                                                                !newSessionStartDate
                                                            }
                                                        >
                                                            Add Session
                                                        </MyButton>
                                                        <MyButton
                                                            type="button"
                                                            buttonType="secondary"
                                                            scale="medium"
                                                            layoutVariant="default"
                                                            onClick={() => {
                                                                setShowAddSession(false);
                                                                setNewSessionName('');
                                                                setNewSessionStartDate('');
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
                                                key={session.id}
                                                session={session}
                                                hasLevels={hasLevels === 'yes'}
                                                onRemoveSession={removeSession}
                                                onAddLevel={addLevel}
                                                onRemoveLevel={removeLevel}
                                            />
                                        ))}
                                    </div>
                                )}

                                {/* Standalone Levels (when sessions are disabled) */}
                                {hasSessions === 'no' && hasLevels === 'yes' && (
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
                                                    <div className="mt-3 flex gap-2">
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
                                                        <MyButton
                                                            type="button"
                                                            buttonType="secondary"
                                                            scale="medium"
                                                            layoutVariant="default"
                                                            onClick={() => {
                                                                setShowAddLevel(false);
                                                                setNewLevelName('');
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
                                                    key={level.id}
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
                                                            removeStandaloneLevel(level.id)
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
                                            onInviteSuccess={(id, name, email) => {
                                                handleInviteSuccess(id, name, email);
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
                                                                                // Show session-level combinations
                                                                                sessions.map(
                                                                                    (session) => (
                                                                                        <div
                                                                                            key={
                                                                                                session.id
                                                                                            }
                                                                                        >
                                                                                            <h4 className="mb-2 text-sm font-medium text-gray-700">
                                                                                                {
                                                                                                    session.name
                                                                                                }
                                                                                            </h4>
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
                                                                                                                <span className="text-sm text-gray-700">
                                                                                                                    {`${session.name} - ${level.name}`}
                                                                                                                </span>
                                                                                                            </div>
                                                                                                        );
                                                                                                    }
                                                                                                )}
                                                                                            </div>
                                                                                        </div>
                                                                                    )
                                                                                )}
                                                                            {hasSessions ===
                                                                                'yes' &&
                                                                                hasLevels ===
                                                                                    'no' && (
                                                                                    // Show only sessions
                                                                                    <div className="space-y-1">
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
                                                                                )}
                                                                            {hasSessions === 'no' &&
                                                                                hasLevels ===
                                                                                    'yes' && (
                                                                                    // Show only levels
                                                                                    <div className="space-y-1">
                                                                                        {sessions
                                                                                            .find(
                                                                                                (
                                                                                                    s
                                                                                                ) =>
                                                                                                    s.id ===
                                                                                                    'standalone'
                                                                                            )
                                                                                            ?.levels.map(
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
                                                                                )}
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
                                disable={disableCreate}
                            >
                                {isLoading ? (
                                    <span className="flex items-center gap-2">
                                        <span className="size-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                        {isEdit ? 'Updating...' : 'Creating...'}
                                    </span>
                                ) : (
                                    <>
                                        <Plus />
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
    onRemoveSession: (sessionId: string) => void;
    onAddLevel: (sessionId: string, levelName: string) => void;
    onRemoveLevel: (sessionId: string, levelId: string) => void;
}> = ({ session, hasLevels, onRemoveSession, onAddLevel, onRemoveLevel }) => {
    const [showAddLevel, setShowAddLevel] = useState(false);
    const [newLevelName, setNewLevelName] = useState('');

    const handleAddLevel = () => {
        if (newLevelName.trim()) {
            onAddLevel(session.id, newLevelName);
            setNewLevelName('');
            setShowAddLevel(false);
        }
    };

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
                            onClick={() => onRemoveSession(session.id)}
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
                                <div className="mt-2 flex gap-2">
                                    <MyButton
                                        type="button"
                                        buttonType="primary"
                                        scale="medium"
                                        layoutVariant="default"
                                        onClick={handleAddLevel}
                                        disable={!newLevelName.trim()}
                                    >
                                        Add
                                    </MyButton>
                                    <MyButton
                                        type="button"
                                        buttonType="secondary"
                                        scale="medium"
                                        layoutVariant="default"
                                        onClick={() => {
                                            setShowAddLevel(false);
                                            setNewLevelName('');
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
                                        key={level.id}
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
                                            onClick={() => onRemoveLevel(session.id, level.id)}
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
