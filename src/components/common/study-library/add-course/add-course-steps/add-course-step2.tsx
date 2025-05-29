import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { MyInput } from '@/components/design-system/input';
import { MyButton } from '@/components/design-system/button';
import React, { useState } from 'react';
import { Trash2, Plus, Calendar } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import AddCourseStep2StructureTypes from './add-course-step2-structure-types';
interface Session {
    id: string;
    name: string;
    startDate: string;
}
interface Level {
    id: string;
    name: string;
    sessions: Session[];
}

// Step 2 Schema
export const step2Schema = z.object({
    price: z.string().optional(),
    duration: z.string().optional(),
    startDate: z.string().optional(),
    maxStudents: z.string().optional(),
});
export type Step2Data = z.infer<typeof step2Schema>;

export const AddCourseStep2 = ({
    onBack,
    onSubmit,
    initialData,
}: {
    onBack: () => void;
    onSubmit: (data: Step2Data) => void;
    initialData?: Step2Data;
}) => {
    const [hasLevels, setHasLevels] = useState('yes');
    const [hasSessions, setHasSessions] = useState('yes');
    const [levels, setLevels] = useState<Level[]>([]);
    const [globalSessions, setGlobalSessions] = useState<Session[]>([]);
    const [newLevelName, setNewLevelName] = useState('');
    const [showAddLevel, setShowAddLevel] = useState(false);
    const [existingSessions, setExistingSessions] = useState<Session[]>([]);
    const [instructorEmails, setInstructorEmails] = useState<string[]>([]);
    const [newInstructorEmail, setNewInstructorEmail] = useState('');
    const [publishToCatalogue, setPublishToCatalogue] = useState(false);
    const form = useForm<Step2Data>({
        resolver: zodResolver(step2Schema),
        defaultValues: initialData || {
            price: '',
            duration: '',
            startDate: '',
            maxStudents: '',
        },
    });

    const addLevel = () => {
        if (newLevelName.trim()) {
            const newLevel: Level = {
                id: Date.now().toString(),
                name: newLevelName.trim(),
                sessions: [],
            };
            setLevels([...levels, newLevel]);
            setNewLevelName('');
            setShowAddLevel(false);
        }
    };
    const removeLevel = (levelId: string) => {
        setLevels(levels.filter((level) => level.id !== levelId));
    };
    const addSession = (levelId: string | null, sessionName: string, startDate: string) => {
        if (sessionName.trim() && startDate) {
            const newSession: Session = {
                id: Date.now().toString(),
                name: sessionName.trim(),
                startDate,
            };

            if (levelId === null) {
                setGlobalSessions([...globalSessions, newSession]);
            } else {
                setLevels(
                    levels.map((level) =>
                        level.id === levelId
                            ? { ...level, sessions: [...level.sessions, newSession] }
                            : level
                    )
                );
            }

            setExistingSessions((prev) => [...prev, newSession]);
        }
    };

    console.log('existingSessions', existingSessions);
    const addExistingSession = (levelId: string, sessionId: string) => {
        const sessionToAdd = existingSessions.find((s) => s.id === sessionId);
        if (sessionToAdd) {
            const newSession = { ...sessionToAdd, id: Date.now().toString() };
            setLevels(
                levels.map((level) =>
                    level.id === levelId
                        ? { ...level, sessions: [...level.sessions, newSession] }
                        : level
                )
            );
        }
    };
    const removeSession = (levelId: string | null, sessionId: string) => {
        if (levelId === null) {
            setGlobalSessions(globalSessions.filter((session) => session.id !== sessionId));
        } else {
            setLevels(
                levels.map((level) =>
                    level.id === levelId
                        ? {
                              ...level,
                              sessions: level.sessions.filter(
                                  (session) => session.id !== sessionId
                              ),
                          }
                        : level
                )
            );
        }
    };
    const addInstructor = () => {
        if (newInstructorEmail.trim() && !instructorEmails.includes(newInstructorEmail.trim())) {
            setInstructorEmails([...instructorEmails, newInstructorEmail.trim()]);
            setNewInstructorEmail('');
        }
    };
    const removeInstructor = (email: string) => {
        setInstructorEmails(instructorEmails.filter((instructor) => instructor !== email));
    };
    const getInitials = (email: string) => {
        const name = email.split('@')[0];
        return name?.slice(0, 2).toUpperCase();
    };
    const handlePublishChange = (checked: boolean | 'indeterminate') => {
        setPublishToCatalogue(checked === true);
    };

    return (
        <div className="flex flex-col overflow-auto bg-[#F7FAFF]">
            <Card className="w-full overflow-auto  rounded-none border-none bg-white shadow-sm">
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
                            structure—including levels, subjects, modules, and chapters—cannot be
                            changed. Please review carefully before proceeding.
                        </p>
                    </div>

                    {/* Structure Selection */}
                    <div>
                        <h3 className="mb-3 text-base font-medium text-gray-900">
                            Select course structure that is suitable for your institute
                        </h3>
                        <AddCourseStep2StructureTypes />
                    </div>

                    <Separator className="bg-gray-200" />

                    {/* Course Configuration */}
                    <div className="space-y-5">
                        {/* Contains Levels */}
                        <div className="space-y-2">
                            <Label className="block text-base font-medium text-gray-900">
                                Contains Levels?
                            </Label>
                            <p className="text-sm text-gray-600">
                                Levels organize a course into structured learning stages. These
                                stages may represent increasing difficulty, different modules, or
                                key milestones within the course. For eg: Basic, Advanced
                            </p>
                            <RadioGroup
                                value={hasLevels}
                                onValueChange={setHasLevels}
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

                        {/* Level Management */}
                        {hasLevels === 'yes' && (
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <Label className="text-base font-medium text-gray-900">
                                        Course Levels
                                    </Label>
                                    <MyButton
                                        type="button"
                                        buttonType="secondary"
                                        scale="medium"
                                        layoutVariant="default"
                                        onClick={() => setShowAddLevel(true)}
                                        className="font-light"
                                    >
                                        <Plus />
                                        Add
                                    </MyButton>
                                </div>

                                {showAddLevel && (
                                    <Card className="border-gray-200">
                                        <CardContent className="p-3">
                                            <div className="flex gap-2">
                                                <Input
                                                    placeholder="Enter level name (e.g., Beginner, Intermediate, Advanced)"
                                                    value={newLevelName}
                                                    onChange={(e) =>
                                                        setNewLevelName(e.target.value)
                                                    }
                                                    onKeyPress={(e) =>
                                                        e.key === 'Enter' && addLevel()
                                                    }
                                                    className="h-9 border-gray-300"
                                                />
                                                <MyButton
                                                    buttonType="primary"
                                                    scale="medium"
                                                    layoutVariant="default"
                                                    onClick={addLevel}
                                                >
                                                    Add
                                                </MyButton>
                                                <MyButton
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

                                {levels.map((level) => (
                                    <LevelCard
                                        key={level.id}
                                        level={level}
                                        hasSessions={hasSessions === 'yes'}
                                        existingSessions={existingSessions}
                                        onRemoveLevel={removeLevel}
                                        onAddSession={addSession}
                                        onAddExistingSession={addExistingSession}
                                        onRemoveSession={removeSession}
                                    />
                                ))}
                            </div>
                        )}

                        {/* Contains Sessions */}
                        <div className="space-y-2">
                            <Label className="block text-base font-medium text-gray-900">
                                Contains Sessions/Cohorts?
                            </Label>
                            <p className="text-sm text-gray-600">
                                Sessions/cohorts group learners who start and progress through the
                                course together. Each cohort follows the same timeline, enabling
                                better interaction, tracking, and a tailored learning experience.
                                For example: January 2025 Batch, Summer Cohort, Q2 Session.
                            </p>
                            <RadioGroup
                                value={hasSessions}
                                onValueChange={setHasSessions}
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

                        {/* Global Sessions (when no levels) */}
                        {hasLevels === 'no' && hasSessions === 'yes' && (
                            <GlobalSessionsSection
                                sessions={globalSessions}
                                onAddSession={(name, date) => addSession(null, name, date)}
                                onRemoveSession={(sessionId) => removeSession(null, sessionId)}
                            />
                        )}
                    </div>

                    <Separator className="bg-gray-200" />

                    {/* Add Instructors Section */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <Label className="text-base font-medium text-gray-900">
                                Add Instructors to Course
                            </Label>
                            <MyButton
                                type="button"
                                buttonType="secondary"
                                scale="medium"
                                layoutVariant="default"
                                onClick={addInstructor}
                            >
                                <Plus />
                                Add
                            </MyButton>
                        </div>

                        <div className="flex gap-2">
                            <Input
                                type="email"
                                placeholder="Enter instructor email"
                                value={newInstructorEmail}
                                onChange={(e) => setNewInstructorEmail(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && addInstructor()}
                                className="h-9 border-gray-300"
                            />
                        </div>

                        {instructorEmails.length > 0 && (
                            <div className="space-y-2">
                                {instructorEmails.map((email, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 p-2"
                                    >
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-8 w-8">
                                                <AvatarImage src="" alt={email} />
                                                <AvatarFallback className="bg-[#3B82F6] text-xs font-medium text-white">
                                                    {getInitials(email)}
                                                </AvatarFallback>
                                            </Avatar>
                                            <span className="text-sm font-medium text-gray-900">
                                                {email}
                                            </span>
                                        </div>
                                        <MyButton
                                            type="button"
                                            buttonType="text"
                                            scale="medium"
                                            layoutVariant="icon"
                                            onClick={() => removeInstructor(email)}
                                            className="text-red-600 hover:text-red-700"
                                        >
                                            <Trash2 className="h-3 w-3" />
                                        </MyButton>
                                    </div>
                                ))}
                            </div>
                        )}
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
                            The course will be added to the course catalogue which will be viewed by
                            the learners.
                        </p>
                    </div>

                    <Separator className="bg-gray-200" />

                    {/* Action Buttons */}
                    <div className="flex justify-between pt-3">
                        <MyButton
                            type="button"
                            buttonType="secondary"
                            scale="medium"
                            layoutVariant="default"
                            onClick={onBack}
                        >
                            Back
                        </MyButton>
                        <MyButton
                            type="button"
                            buttonType="primary"
                            scale="medium"
                            layoutVariant="default"
                            onClick={() => onSubmit(form.getValues())}
                        >
                            <Plus />
                            Create
                        </MyButton>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

interface LevelCardProps {
    level: Level;
    hasSessions: boolean;
    existingSessions: Session[];
    onRemoveLevel: (levelId: string) => void;
    onAddSession: (levelId: string, sessionName: string, startDate: string) => void;
    onAddExistingSession: (levelId: string, sessionId: string) => void;
    onRemoveSession: (levelId: string, sessionId: string) => void;
}

const LevelCard: React.FC<LevelCardProps> = ({
    level,
    hasSessions,
    existingSessions,
    onRemoveLevel,
    onAddSession,
    onAddExistingSession,
    onRemoveSession,
}) => {
    const [showAddSession, setShowAddSession] = useState(false);
    const [sessionName, setSessionName] = useState('');
    const [startDate, setStartDate] = useState('');
    const [sessionType, setSessionType] = useState<'new' | 'existing'>('new');

    // Add validation check
    const isNewSessionValid =
        sessionType === 'new' && sessionName.trim() !== '' && startDate !== '';

    // Filter out sessions that are already added to this level
    const availableSessions = existingSessions.filter(
        session => !level.sessions.some(
            levelSession => levelSession.name === session.name &&
            levelSession.startDate === session.startDate
        )
    );

    console.log('Available sessions:', availableSessions);

    const handleAddSession = () => {
        if (sessionType === 'new' && sessionName.trim() && startDate) {
            onAddSession(level.id, sessionName, startDate);
            setSessionName('');
            setStartDate('');
            setShowAddSession(false);
        }
    };

    const handleExistingSessionSelect = (sessionId: string) => {
        onAddExistingSession(level.id, sessionId);
        setShowAddSession(false);
    };

    return (
        <Card className="border-gray-200">
            <CardContent className="p-3">
                <div className="mb-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-gray-900">{level.name}</span>
                        {hasSessions && (
                            <span className="text-xs text-gray-500">
                                {level.sessions.length} session
                                {level.sessions.length !== 1 ? 's' : ''}
                            </span>
                        )}
                    </div>
                    <div className="flex gap-2">
                        {hasSessions && (
                            <MyButton
                                type="button"
                                buttonType="secondary"
                                scale="medium"
                                layoutVariant="default"
                                onClick={() => setShowAddSession(true)}
                                className="font-light"
                            >
                                <Plus />
                                Add
                            </MyButton>
                        )}
                        <MyButton
                            type="button"
                            buttonType="text"
                            scale="medium"
                            layoutVariant="icon"
                            onClick={() => onRemoveLevel(level.id)}
                            className="text-red-600 hover:text-red-700"
                        >
                            <Trash2 className="h-3 w-3" />
                        </MyButton>
                    </div>
                </div>

                {showAddSession && (
                    <div className="mb-3 rounded-lg border bg-gray-50 p-3">
                        <div className="space-y-2">
                            <div>
                                <Label className="mb-2 block text-sm font-medium text-gray-700">
                                    Session Type
                                </Label>
                                <RadioGroup
                                    value={sessionType}
                                    onValueChange={(value: 'new' | 'existing') =>
                                        setSessionType(value)
                                    }
                                    className="flex gap-4"
                                >
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem
                                            value="new"
                                            id="new-session"
                                            className="h-4 w-4 border-gray-300"
                                        />
                                        <Label htmlFor="new-session" className="text-sm">
                                            Create New Session
                                        </Label>
                                    </div>
                                    {availableSessions.length > 0 && (
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem
                                                value="existing"
                                                id="existing-session"
                                                className="h-4 w-4 border-gray-300"
                                            />
                                            <Label htmlFor="existing-session" className="text-sm">
                                                Use Existing Session
                                            </Label>
                                        </div>
                                    )}
                                </RadioGroup>
                            </div>

                            {sessionType === 'new' ? (
                                <>
                                    <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                                        <div>
                                            <Label className="mb-1 block text-sm font-medium text-gray-700">
                                                Session Name
                                            </Label>
                                            <Input
                                                placeholder="e.g., January 2025 Batch"
                                                value={sessionName}
                                                onChange={(e) => setSessionName(e.target.value)}
                                                className="h-8 border-gray-300"
                                            />
                                        </div>
                                        <div>
                                            <Label className="mb-1 block text-sm font-medium text-gray-700">
                                                Start Date
                                            </Label>
                                            <Input
                                                type="date"
                                                value={startDate}
                                                onChange={(e) => setStartDate(e.target.value)}
                                                className="h-8 border-gray-300"
                                            />
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <MyButton
                                            type="button"
                                            buttonType="primary"
                                            scale="medium"
                                            layoutVariant="default"
                                            onClick={handleAddSession}
                                            disable={!isNewSessionValid}
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
                                                setSessionName('');
                                                setStartDate('');
                                            }}
                                        >
                                            Cancel
                                        </MyButton>
                                    </div>
                                </>
                            ) : (
                                <div>
                                    <Label className="mb-1 block text-sm font-medium text-gray-700">
                                        Select Existing Session
                                    </Label>
                                    <Select
                                        onValueChange={handleExistingSessionSelect}
                                    >
                                        <SelectTrigger className="h-8 border-gray-300">
                                            <SelectValue placeholder="Choose a session to copy" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {availableSessions.map((session) => (
                                                <SelectItem key={session.id} value={session.id}>
                                                    {session.name} - {new Date(session.startDate).toLocaleDateString()}
                                                </SelectItem>
                                            ))}
                                            {availableSessions.length === 0 && (
                                                <SelectItem value="no-sessions" disabled>
                                                    No sessions available
                                                </SelectItem>
                                            )}
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {hasSessions && level.sessions.length > 0 && (
                    <div className="space-y-2">
                        {level.sessions.map((session) => (
                            <div
                                key={session.id}
                                className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 p-2"
                            >
                                <div className="flex items-center gap-3">
                                    <Calendar className="h-4 w-4 text-[#3B82F6]" />
                                    <span className="text-sm font-medium text-gray-900">
                                        {session.name}
                                    </span>
                                    <span className="text-xs text-gray-500">
                                        {new Date(session.startDate).toLocaleDateString()}
                                    </span>
                                </div>
                                <MyButton
                                    type="button"
                                    buttonType="text"
                                    scale="medium"
                                    layoutVariant="icon"
                                    onClick={() => onRemoveSession(level.id, session.id)}
                                    className="text-red-600 hover:text-red-700"
                                >
                                    <Trash2 className="h-3 w-3" />
                                </MyButton>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

interface GlobalSessionsSectionProps {
    sessions: Session[];
    onAddSession: (sessionName: string, startDate: string) => void;
    onRemoveSession: (sessionId: string) => void;
}

const GlobalSessionsSection: React.FC<GlobalSessionsSectionProps> = ({
    sessions,
    onAddSession,
    onRemoveSession,
}) => {
    const [showAddSession, setShowAddSession] = useState(false);
    const [sessionName, setSessionName] = useState('');
    const [startDate, setStartDate] = useState('');

    // Add validation check
    const isAddSessionDisabled = !sessionName.trim() || !startDate;

    const handleAddSession = () => {
        if (sessionName.trim() && startDate) {
            onAddSession(sessionName, startDate);
            setSessionName('');
            setStartDate('');
            setShowAddSession(false);
        }
    };

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <Label className="text-base font-medium text-gray-900">Course Sessions</Label>
                <MyButton
                    type="button"
                    buttonType="secondary"
                    scale="medium"
                    layoutVariant="default"
                    onClick={() => setShowAddSession(true)}
                    className="font-light"
                >
                    <Plus />
                    Add
                </MyButton>
            </div>

            {showAddSession && (
                <Card className="border-gray-200">
                    <CardContent className="p-3">
                        <div className="mb-2 grid grid-cols-1 gap-2 md:grid-cols-2">
                            <div>
                                <Label className="mb-1 block text-sm font-medium text-gray-700">
                                    Session Name
                                </Label>
                                <Input
                                    placeholder="e.g., January 2025 Batch"
                                    value={sessionName}
                                    onChange={(e) => setSessionName(e.target.value)}
                                    className="h-8 border-gray-300"
                                />
                            </div>
                            <div>
                                <Label className="mb-1 block text-sm font-medium text-gray-700">
                                    Start Date
                                </Label>
                                <Input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    className="h-8 border-gray-300"
                                />
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <MyButton
                                type="button"
                                buttonType="primary"
                                scale="medium"
                                layoutVariant="default"
                                onClick={handleAddSession}
                                disable={isAddSessionDisabled}
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
                                    setSessionName('');
                                    setStartDate('');
                                }}
                            >
                                Cancel
                            </MyButton>
                        </div>
                    </CardContent>
                </Card>
            )}

            {sessions.length > 0 && (
                <div className="space-y-2">
                    {sessions.map((session) => (
                        <Card key={session.id} className="border-gray-200">
                            <CardContent className="p-2">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <Calendar className="h-4 w-4 text-[#3B82F6]" />
                                        <span className="text-sm font-medium text-gray-900">
                                            {session.name}
                                        </span>
                                        <span className="text-xs text-gray-500">
                                            {new Date(session.startDate).toLocaleDateString()}
                                        </span>
                                    </div>
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
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
};
