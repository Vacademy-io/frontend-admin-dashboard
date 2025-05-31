import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { MyInput } from '@/components/design-system/input';
import React, { useState, useEffect } from 'react';
import { Trash2, Plus, Calendar } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import AddCourseStep2StructureTypes from './add-course-step2-structure-types';
import { MyButton } from '@/components/design-system/button';
import InviteInstructorDialog from './InviteInstructorDialog';
import SessionLevelMappingDialog from './SessionLevelMappingDialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog } from '@/components/ui/dialog';
import MultiSelectDropdown from '@/components/common/multi-select-dropdown';

interface Level {
    id: string;
    name: string;
    userIds: string[];
}

interface Session {
    id: string;
    name: string;
    startDate: string;
    levels: Level[];
}

// Update the schema
export const step2Schema = z.object({
    levelStructure: z.number(),
    hasLevels: z.string(),
    hasSessions: z.string(),
    sessions: z.array(
        z.object({
            id: z.string(),
            name: z.string(),
            startDate: z.string(),
            levels: z.array(
                z.object({
                    id: z.string(),
                    name: z.string(),
                    userIds: z.array(z.string()).default([])
                })
            ),
        })
    ).default([]),
    instructors: z.array(z.string()).optional(),
    publishToCatalogue: z.boolean(),
});

export type Step2Data = z.infer<typeof step2Schema>;

// Add this interface before the AddCourseStep2 component
interface InstructorMapping {
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
}: {
    onBack: () => void;
    onSubmit: (data: Step2Data) => void;
    initialData?: Step2Data;
}) => {
    const [hasLevels, setHasLevels] = useState(initialData?.hasLevels || 'yes');
    const [hasSessions, setHasSessions] = useState(initialData?.hasSessions || 'yes');
    const [sessions, setSessions] = useState<Session[]>(initialData?.sessions || []);
    const [showAddSession, setShowAddSession] = useState(false);
    const [showAddLevel, setShowAddLevel] = useState(false);
    const [newSessionName, setNewSessionName] = useState('');
    const [newSessionStartDate, setNewSessionStartDate] = useState('');
    const [newLevelName, setNewLevelName] = useState('');
    const [showInviteDialog, setShowInviteDialog] = useState(false);
    const [showMappingDialog, setShowMappingDialog] = useState(false);
    const [selectedInstructorEmail, setSelectedInstructorEmail] = useState('');
    const [selectedInstructors, setSelectedInstructors] = useState<string[]>([]);
    const [instructorMappings, setInstructorMappings] = useState<InstructorMapping[]>([]);
    const [instructorEmails, setInstructorEmails] = useState<string[]>([
        'john.doe@example.com',
        'jane.smith@example.com',
        'robert.johnson@example.com',
        'sarah.wilson@example.com',
        'michael.brown@example.com'
    ]);
    const [publishToCatalogue, setPublishToCatalogue] = useState(initialData?.publishToCatalogue || false);
    const [newInstructorName, setNewInstructorName] = useState('');
    const [newInstructorEmail, setNewInstructorEmail] = useState('');
    const [showAssignmentCard, setShowAssignmentCard] = useState(false);
    const [selectedSessionLevels, setSelectedSessionLevels] = useState<Array<{
        sessionId: string;
        sessionName: string;
        levelId: string;
        levelName: string;
    }>>([]);

    const form = useForm<Step2Data>({
        resolver: zodResolver(step2Schema),
        defaultValues: initialData || {
            levelStructure: 2,
            hasLevels: 'yes',
            hasSessions: 'yes',
            sessions: [],
            instructors: [],
            publishToCatalogue: false,
        },
    });

    console.log(form.getValues());

    // Update form data when state changes
    useEffect(() => {
        form.setValue('hasLevels', hasLevels);
        form.setValue('hasSessions', hasSessions);
        form.setValue('sessions', sessions);
        form.setValue('instructors', instructorEmails);
        form.setValue('publishToCatalogue', publishToCatalogue);
    }, [
        hasLevels,
        hasSessions,
        sessions,
        instructorEmails,
        publishToCatalogue,
        form,
    ]);

    // Session management functions
    const addSession = () => {
        if (newSessionName.trim() && newSessionStartDate) {
            const newSession: Session = {
                id: Date.now().toString(),
                name: newSessionName.trim(),
                startDate: newSessionStartDate,
                levels: []
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
        const updatedSessions = sessions.filter(session => session.id !== sessionId);
        setSessions(updatedSessions);
        form.setValue('sessions', updatedSessions);

        // Remove all assignments for this session from all instructors
        setInstructorMappings(prev =>
            prev.map(instructor => ({
                ...instructor,
                sessionLevels: instructor.sessionLevels.filter(
                    sl => sl.sessionId !== sessionId
                )
            }))
        );
    };

    const addLevel = (sessionId: string, levelName: string) => {
        if (levelName.trim()) {
            const newLevel: Level = {
                id: Date.now().toString(),
                name: levelName.trim(),
                userIds: []
            };
            const updatedSessions = sessions.map(session =>
                session.id === sessionId
                    ? { ...session, levels: [...session.levels, newLevel] }
                    : session
            );
            setSessions(updatedSessions);
            form.setValue('sessions', updatedSessions);
        }
    };

    const removeLevel = (sessionId: string, levelId: string) => {
        const updatedSessions = sessions.map(session =>
            session.id === sessionId
                ? {
                      ...session,
                      levels: session.levels.filter(level => level.id !== levelId)
                  }
                : session
        );
        setSessions(updatedSessions);
        form.setValue('sessions', updatedSessions);

        // Remove all assignments for this level from all instructors
        setInstructorMappings(prev =>
            prev.map(instructor => ({
                ...instructor,
                sessionLevels: instructor.sessionLevels.filter(
                    sl => !(sl.sessionId === sessionId && sl.levelId === levelId)
                )
            }))
        );
    };

    // Effect to update form when sessions change
    useEffect(() => {
        form.setValue('sessions', sessions);
    }, [sessions, form]);

    const handleSubmit = (data: Step2Data) => {
        const completeData: Step2Data = {
            ...data,
            levelStructure: data.levelStructure || 2,
            hasLevels: data.hasLevels,
            hasSessions: data.hasSessions,
            sessions: sessions,
            instructors: instructorEmails,
            publishToCatalogue
        };
        console.log('Complete form data:', completeData);
        onSubmit(completeData);
    };

    const handleInviteSuccess = (email: string) => {
        // Add to available instructors list if not already present
        if (!instructorEmails.includes(email)) {
            setInstructorEmails(prev => [...prev, email]);
        }
        // Add to selected instructors list
        if (!selectedInstructors.includes(email)) {
            setSelectedInstructors(prev => [...prev, email]);
        }
    };

    const handleSessionLevelMappingSave = (mappings: Array<{
        sessionId: string;
        sessionName: string;
        levelId: string;
        levelName: string;
    }>) => {
        if (selectedInstructorEmail) {
            setInstructorMappings(prev => {
                const existingIndex = prev.findIndex(m => m.email === selectedInstructorEmail);
                if (existingIndex >= 0) {
                    const updated = [...prev];
                    updated[existingIndex] = {
                        email: selectedInstructorEmail,
                        sessionLevels: mappings,
                    };
                    return updated;
                }
                return [...prev, { email: selectedInstructorEmail, sessionLevels: mappings }];
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
                levels: []
            };

            const newLevel: Level = {
                id: Date.now().toString(),
                name: newLevelName.trim(),
                userIds: []
            };

            // If there's no standalone session yet, create one
            const standaloneSession = sessions.find(s => s.id === 'standalone');
            if (!standaloneSession) {
                setSessions([{ ...dummySession, levels: [newLevel] }]);
            } else {
                // Add level to existing standalone session
                const updatedSessions = sessions.map(session =>
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
        const updatedSessions = sessions.map(session =>
            session.id === 'standalone'
                ? {
                      ...session,
                      levels: session.levels.filter(level => level.id !== levelId)
                  }
                : session
        );
        setSessions(updatedSessions);
    };

    // Function to get all session-level combinations
    const getAllSessionLevelPairs = () => {
        return sessions.flatMap(session =>
            session.levels.map(level => ({
                sessionId: session.id,
                sessionName: session.name,
                levelId: level.id,
                levelName: level.name,
                key: `${session.id}-${level.id}`
            }))
        );
    };

    // Function to handle checkbox changes
    const handleSessionLevelCheckboxChange = (sessionId: string, sessionName: string, levelId: string, levelName: string) => {
        const key = `${sessionId}-${levelId}`;
        setSelectedSessionLevels(prev => {
            const exists = prev.some(item =>
                item.sessionId === sessionId && item.levelId === levelId
            );

            if (exists) {
                return prev.filter(item =>
                    !(item.sessionId === sessionId && item.levelId === levelId)
                );
            } else {
                return [...prev, { sessionId, sessionName, levelId, levelName }];
            }
        });
    };

    // Function to handle assignment save
    const handleAssignmentSave = () => {
        if (selectedInstructorEmail) {
            // First, remove the instructor's email from all levels they were previously assigned to
            const updatedSessions = sessions.map(session => ({
                ...session,
                levels: session.levels.map(level => ({
                    ...level,
                    userIds: level.userIds.filter(id => id !== selectedInstructorEmail)
                }))
            }));

            // Then, add the instructor's email to newly selected levels
            selectedSessionLevels.forEach(({ sessionId, levelId }) => {
                const sessionIndex = updatedSessions.findIndex(s => s.id === sessionId);
                if (sessionIndex !== -1) {
                    const levelIndex = updatedSessions[sessionIndex]?.levels.findIndex(l => l.id === levelId);
                    if (levelIndex !== -1) {
                        updatedSessions[sessionIndex]?.levels[levelIndex!]?.userIds.push(selectedInstructorEmail);
                    }
                }
            });

            setSessions(updatedSessions);
            form.setValue('sessions', updatedSessions);

            // Update instructor mappings
            setInstructorMappings(prev => {
                const existingIndex = prev.findIndex(m => m.email === selectedInstructorEmail);
                if (existingIndex >= 0) {
                    const updated = [...prev];
                    updated[existingIndex] = {
                        email: selectedInstructorEmail,
                        sessionLevels: selectedSessionLevels,
                    };
                    return updated;
                }
                return [...prev, {
                    email: selectedInstructorEmail,
                    sessionLevels: selectedSessionLevels
                }];
            });
        }
        setShowAssignmentCard(false);
        setSelectedSessionLevels([]);
    };

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
                                        structure—including sessions and levels—cannot be changed. Please review carefully before
                                        proceeding.
                                    </p>
                                </div>

                                {/* Structure Selection */}
                                <div>
                                    <h3 className="mb-3 text-base font-medium text-gray-900">
                                        Select course structure that is suitable for your institute
                                    </h3>
                                    <AddCourseStep2StructureTypes form={form} />
                                </div>

                                <Separator className="bg-gray-200" />

                                {/* Contains Sessions Radio */}
                                <div className="space-y-2">
                                    <Label className="block text-base font-medium text-gray-900">
                                        Contains Sessions?
                                    </Label>
                                    <p className="text-sm text-gray-600">
                                        Sessions organize a course into different batches or time periods.
                                        For eg: January 2025 Batch, February 2025 Batch
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
                                            <Label htmlFor="sessions-yes" className="text-sm font-normal">
                                                Yes
                                            </Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="no" id="sessions-no" />
                                            <Label htmlFor="sessions-no" className="text-sm font-normal">
                                                No
                                            </Label>
                                        </div>
                                    </RadioGroup>
                                </div>

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
                                                setSessions(sessions.map(session => ({
                                                    ...session,
                                                    levels: []
                                                })));
                                            }
                                        }}
                                        className="flex gap-6"
                                    >
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="yes" id="levels-yes" />
                                            <Label htmlFor="levels-yes" className="text-sm font-normal">
                                                Yes
                                            </Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="no" id="levels-no" />
                                            <Label htmlFor="levels-no" className="text-sm font-normal">
                                                No
                                            </Label>
                                        </div>
                                    </RadioGroup>
                                </div>

                                {/* Info message when both are No */}
                                {hasSessions === 'no' && hasLevels === 'no' && (
                                    <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
                                        <p className="text-sm text-blue-700">
                                            This course will not have any sessions or levels. Students will directly access the course content.
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
                                                        : 'Create sessions for your course'
                                                    }
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
                                                                onChange={(e) => setNewSessionName(e.target.value)}
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
                                                                onChange={(e) => setNewSessionStartDate(e.target.value)}
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
                                                            disable={!newSessionName.trim() || !newSessionStartDate}
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
                                                            onChange={(e) => setNewLevelName(e.target.value)}
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
                                            .find(s => s.id === 'standalone')
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
                                                        onClick={() => removeStandaloneLevel(level.id)}
                                                        className="text-red-600 hover:text-red-700"
                                                    >
                                                        <Trash2 className="h-3 w-3" />
                                                    </MyButton>
                                                </div>
                                            ))}
                                    </div>
                                )}

                                <Separator className="bg-gray-200" />

                                {/* Add Instructors Section */}
                                <div className="space-y-3 p-4">
                                    <div className="flex items-center justify-between">
                                        <Label className="text-base font-medium text-gray-900">
                                            Add Instructors to Course
                                        </Label>
                                        <MyButton
                                            type="button"
                                            buttonType="secondary"
                                            scale="medium"
                                            layoutVariant="default"
                                            onClick={() => setShowInviteDialog(true)}
                                            className="font-light"
                                        >
                                            <Plus className="h-4 w-4" />
                                            Invite
                                        </MyButton>
                                    </div>

                                    {showInviteDialog && (
                                        <Card className="border-gray-200">
                                            <CardContent className="p-3">
                                                <div className="grid gap-3">
                                                    <div>
                                                        <Label className="mb-1 block text-sm font-medium text-gray-700">
                                                            Full Name
                                                        </Label>
                                                        <Input
                                                            placeholder="Full name (First and Last)"
                                                            value={newInstructorName}
                                                            onChange={(e) => setNewInstructorName(e.target.value)}
                                                            className="h-8 border-gray-300"
                                                        />
                                                    </div>
                                                    <div>
                                                        <Label className="mb-1 block text-sm font-medium text-gray-700">
                                                            Email
                                                        </Label>
                                                        <Input
                                                            type="email"
                                                            placeholder="Enter Email"
                                                            value={newInstructorEmail}
                                                            onChange={(e) => setNewInstructorEmail(e.target.value)}
                                                            className="h-8 border-gray-300"
                                                        />
                                                    </div>
                                                    <div>
                                                        <Label className="mb-1 block text-sm font-medium text-gray-700">
                                                            Role Type
                                                        </Label>
                                                        <div className="rounded-lg border border-gray-300 bg-white p-2">
                                                            <div className="flex items-center gap-2">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={true}
                                                                    disabled
                                                                    className="h-4 w-4 rounded border-gray-300"
                                                                />
                                                                <Label className="text-sm">Teacher</Label>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="mt-3 flex gap-2">
                                                    <MyButton
                                                        type="button"
                                                        buttonType="primary"
                                                        scale="medium"
                                                        layoutVariant="default"
                                                        onClick={() => {
                                                            if (newInstructorEmail && newInstructorName) {
                                                                handleInviteSuccess(newInstructorEmail);
                                                                setNewInstructorName('');
                                                                setNewInstructorEmail('');
                                                                setShowInviteDialog(false);
                                                            }
                                                        }}
                                                        disable={!newInstructorEmail || !newInstructorName}
                                                    >
                                                        Add Instructor
                                                    </MyButton>
                                                    <MyButton
                                                        type="button"
                                                        buttonType="secondary"
                                                        scale="medium"
                                                        layoutVariant="default"
                                                        onClick={() => {
                                                            setShowInviteDialog(false);
                                                            setNewInstructorName('');
                                                            setNewInstructorEmail('');
                                                        }}
                                                    >
                                                        Cancel
                                                    </MyButton>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    )}

                                    <div className="flex flex-col gap-4">
                                        <MultiSelectDropdown
                                            options={instructorEmails
                                                .filter(email => !selectedInstructors.includes(email))
                                                .map(email => ({
                                                    id: email,
                                                    name: email
                                                }))}
                                            selected={selectedInstructors.map(email => ({
                                                id: email,
                                                name: email
                                            }))}
                                            onChange={(selected) => {
                                                const emails = selected.map(s => s.id.toString());
                                                setSelectedInstructors(emails);
                                            }}
                                            placeholder="Select instructor emails"
                                            className="w-full"
                                        />

                                        {selectedInstructors.length > 0 && (
                                            <div className="space-y-2">
                                                {selectedInstructors.map((email) => {
                                                    const isAssigning = showAssignmentCard && selectedInstructorEmail === email;
                                                    return (
                                                        <Card key={email} className="border-gray-200">
                                                            <CardContent className={`p-3 ${isAssigning ? 'pb-3' : 'pb-2'}`}>
                                                                <div className="flex items-center justify-between">
                                                                    <div className="flex items-center gap-3">
                                                                        <Avatar className="h-8 w-8">
                                                                            <AvatarImage src="" alt={email} />
                                                                            <AvatarFallback className="bg-[#3B82F6] text-xs font-medium text-white">
                                                                                {getInitials(email)}
                                                                            </AvatarFallback>
                                                                        </Avatar>
                                                                        <div className="flex flex-col">
                                                                            <span className="text-sm font-medium text-gray-900">
                                                                                {email}
                                                                            </span>
                                                                            <span className="text-xs text-gray-500">
                                                                                {instructorMappings.find(m => m.email === email)?.sessionLevels.length || 0} assignments
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                    <div className="flex gap-2">
                                                                        <MyButton
                                                                            type="button"
                                                                            buttonType="secondary"
                                                                            scale="small"
                                                                            layoutVariant="default"
                                                                            onClick={() => {
                                                                                setSelectedInstructorEmail(email);
                                                                                const existingMappings = instructorMappings.find(m => m.email === email);
                                                                                setSelectedSessionLevels(existingMappings?.sessionLevels || []);
                                                                                setShowAssignmentCard(true);
                                                                            }}
                                                                        >
                                                                            {instructorMappings.find(m => m.email === email) ? 'Edit' : 'Assign'}
                                                                        </MyButton>
                                                                        <MyButton
                                                                            type="button"
                                                                            buttonType="text"
                                                                            scale="medium"
                                                                            layoutVariant="icon"
                                                                            onClick={() => {
                                                                                setSelectedInstructors(prev =>
                                                                                    prev.filter(e => e !== email)
                                                                                );
                                                                                setInstructorMappings(prev =>
                                                                                    prev.filter(m => m.email !== email)
                                                                                );
                                                                            }}
                                                                            className="text-red-600 hover:text-red-700 !size-6"
                                                                        >
                                                                            <Trash2 className="h-3 w-3" />
                                                                        </MyButton>
                                                                    </div>
                                                                </div>

                                                                {isAssigning && (
                                                                    <>
                                                                        <Separator className="my-3" />
                                                                        <div className="grid grid-cols-2 gap-4">
                                                                            {sessions.map((session) => (
                                                                                <div key={session.id}>
                                                                                    <h4 className="mb-2 text-sm font-medium text-gray-700">
                                                                                        {session.name}
                                                                                    </h4>
                                                                                    <div className="space-y-1">
                                                                                        {session.levels.map((level) => {
                                                                                            const isChecked = selectedSessionLevels.some(
                                                                                                item => item.sessionId === session.id && item.levelId === level.id
                                                                                            );
                                                                                            return (
                                                                                                <div
                                                                                                    key={`${session.id}-${level.id}`}
                                                                                                    className="flex items-center gap-2 rounded border border-gray-100 bg-gray-50 px-2 py-1"
                                                                                                >
                                                                                                    <Checkbox
                                                                                                        checked={isChecked}
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
                                                                                                        {level.name}
                                                                                                    </span>
                                                                                                </div>
                                                                                            );
                                                                                        })}
                                                                                    </div>
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                        <div className="mt-3 flex justify-end gap-2">
                                                                            <MyButton
                                                                                type="button"
                                                                                buttonType="secondary"
                                                                                scale="small"
                                                                                layoutVariant="default"
                                                                                onClick={() => {
                                                                                    setShowAssignmentCard(false);
                                                                                    setSelectedSessionLevels([]);
                                                                                }}
                                                                            >
                                                                                Cancel
                                                                            </MyButton>
                                                                            <MyButton
                                                                                type="button"
                                                                                buttonType="primary"
                                                                                scale="small"
                                                                                layoutVariant="default"
                                                                                onClick={handleAssignmentSave}
                                                                                disable={!instructorMappings.find(m => m.email === selectedInstructorEmail) && selectedSessionLevels.length === 0}
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
                                        The course will be added to the course catalogue which will be
                                        viewed by the learners.
                                    </p>
                                </div>

                                <Separator className="bg-gray-200" />
                            </CardContent>
                        </Card>
                    </div>

                    {/* Fixed Footer */}
                    <div className="fixed bottom-0 left-0 right-0 border-t bg-white px-8 py-4">
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
                                onClick={() => handleSubmit(form.getValues())}
                            >
                                <Plus />
                                Create
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
                        <Calendar className="h-4 w-4 text-[#3B82F6]" />
                        <div>
                            <span className="text-sm font-medium text-gray-900">{session.name}</span>
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
                            <Trash2 className="h-3 w-3" />
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
                                            <Trash2 className="h-3 w-3" />
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
