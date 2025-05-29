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
import { MyButton } from '@/components/design-system/button';

interface Level {
    id: string;
    name: string;
    startDate: string;
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
                    startDate: z.string(),
                })
            ),
        })
    ).default([]),
    instructors: z.array(z.string()).optional(),
    publishToCatalogue: z.boolean(),
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
    const [hasLevels, setHasLevels] = useState(initialData?.hasLevels || 'yes');
    const [sessions, setSessions] = useState<Session[]>(initialData?.sessions || []);
    const [showAddSession, setShowAddSession] = useState(false);
    const [newSessionName, setNewSessionName] = useState('');
    const [newSessionStartDate, setNewSessionStartDate] = useState('');
    const [instructorEmails, setInstructorEmails] = useState<string[]>(initialData?.instructors || []);
    const [newInstructorEmail, setNewInstructorEmail] = useState('');
    const [publishToCatalogue, setPublishToCatalogue] = useState(initialData?.publishToCatalogue || false);

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

    // Update form data when state changes
    useEffect(() => {
        form.setValue('hasLevels', 'yes');
        form.setValue('hasSessions', 'yes');
        form.setValue('sessions', sessions);
        form.setValue('instructors', instructorEmails);
        form.setValue('publishToCatalogue', publishToCatalogue);
    }, [
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
    };

    const addLevel = (sessionId: string, levelName: string, startDate: string) => {
        if (levelName.trim() && startDate) {
            const newLevel: Level = {
                id: Date.now().toString(),
                name: levelName.trim(),
                startDate: startDate
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

    const addInstructor = (e?: React.MouseEvent | React.KeyboardEvent) => {
        e?.preventDefault(); // Prevent form submission
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
                                        // Clear existing levels when switching to 'no'
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

                            {/* Sessions Management */}
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
                                        onClick={(e) => {
                                            e.preventDefault();
                                            addInstructor();
                                        }}
                                        disable={!newInstructorEmail.trim()}
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
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault(); // Prevent form submission
                                                addInstructor();
                                            }
                                        }}
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
    );
};

// Update SessionCard component to conditionally show level functionality
const SessionCard: React.FC<{
    session: Session;
    hasLevels: boolean;
    onRemoveSession: (sessionId: string) => void;
    onAddLevel: (sessionId: string, levelName: string, startDate: string) => void;
    onRemoveLevel: (sessionId: string, levelId: string) => void;
}> = ({ session, hasLevels, onRemoveSession, onAddLevel, onRemoveLevel }) => {
    const [showAddLevel, setShowAddLevel] = useState(false);
    const [newLevelName, setNewLevelName] = useState('');
    const [newLevelStartDate, setNewLevelStartDate] = useState('');

    const handleAddLevel = () => {
        if (newLevelName.trim() && newLevelStartDate) {
            onAddLevel(session.id, newLevelName, newLevelStartDate);
            setNewLevelName('');
            setNewLevelStartDate('');
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
                                <div className="grid grid-cols-2 gap-2 mb-2">
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
                                    <div>
                                        <Label className="mb-1 block text-sm font-medium text-gray-700">
                                            Start Date
                                        </Label>
                                        <Input
                                            type="date"
                                            value={newLevelStartDate}
                                            onChange={(e) => setNewLevelStartDate(e.target.value)}
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
                                        onClick={handleAddLevel}
                                        disable={!newLevelName.trim() || !newLevelStartDate}
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
                                            setNewLevelStartDate('');
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
                                        <div className="flex items-center gap-3">
                                            <span className="text-sm font-medium text-gray-900">
                                                {level.name}
                                            </span>
                                            <span className="text-xs text-gray-500">
                                                {new Date(level.startDate).toLocaleDateString()}
                                            </span>
                                        </div>
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
