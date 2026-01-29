import { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus } from '@phosphor-icons/react';
import { BatchConfig, LevelOption, SessionOption } from '../-types/bulk-create-types';
import { toast } from 'sonner';

interface BatchSelectorDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    levels: LevelOption[];
    sessions: SessionOption[];
    onAddLevel: (name: string) => Promise<LevelOption>;
    onAddSession: (name: string) => Promise<SessionOption>;
    onSelect: (batch: BatchConfig) => void;
    existingBatches?: BatchConfig[];
}

export function BatchSelectorDialog({
    open,
    onOpenChange,
    levels,
    sessions,
    onAddLevel,
    onAddSession,
    onSelect,
    existingBatches = [],
}: BatchSelectorDialogProps) {
    const [selectedLevel, setSelectedLevel] = useState<string>('');
    const [selectedSession, setSelectedSession] = useState<string>('');
    const [newLevelName, setNewLevelName] = useState('');
    const [newSessionName, setNewSessionName] = useState('');
    const [isCreatingLevel, setIsCreatingLevel] = useState(false);
    const [isCreatingSession, setIsCreatingSession] = useState(false);
    const [maxSlots, setMaxSlots] = useState<string>('');

    const handleCreateLevel = async () => {
        if (!newLevelName.trim()) {
            toast.error('Please enter a level name');
            return;
        }

        setIsCreatingLevel(true);
        try {
            const newLevel = await onAddLevel(newLevelName.trim());
            setSelectedLevel(newLevel.id);
            setNewLevelName('');
            toast.success(`Level "${newLevel.name}" created`);
        } catch (error) {
            toast.error('Failed to create level');
        } finally {
            setIsCreatingLevel(false);
        }
    };

    const handleCreateSession = async () => {
        if (!newSessionName.trim()) {
            toast.error('Please enter a session name');
            return;
        }

        setIsCreatingSession(true);
        try {
            const newSession = await onAddSession(newSessionName.trim());
            setSelectedSession(newSession.id);
            setNewSessionName('');
            toast.success(`Session "${newSession.name}" created`);
        } catch (error) {
            toast.error('Failed to create session');
        } finally {
            setIsCreatingSession(false);
        }
    };

    const handleConfirm = () => {
        const levelOption = levels.find((l) => l.id === selectedLevel);
        const sessionOption = sessions.find((s) => s.id === selectedSession);

        const batch: BatchConfig = {
            level_id: selectedLevel || null,
            session_id: selectedSession || null,
            level_name: levelOption?.name || 'DEFAULT',
            session_name: sessionOption?.name || 'DEFAULT',
            inventory_config: maxSlots
                ? {
                      max_slots: Number(maxSlots),
                      available_slots: Number(maxSlots),
                  }
                : undefined,
        };

        const isDuplicate = existingBatches.some(
            (b) => b.level_id === batch.level_id && b.session_id === batch.session_id
        );

        if (isDuplicate) {
            toast.error('This batch combination already exists');
            return;
        }

        onSelect(batch);
        resetForm();
    };

    const resetForm = () => {
        setSelectedLevel('');
        setSelectedSession('');
        setNewLevelName('');
        setNewSessionName('');
        setMaxSlots('');
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Add Batch</DialogTitle>
                    <DialogDescription>
                        Select or create a level-session combination for this batch.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {/* Level Selection */}
                    <div className="space-y-2">
                        <Label className="text-sm">Level</Label>
                        <Tabs defaultValue="existing" className="w-full">
                            <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="existing" className="text-xs">
                                    Select Existing
                                </TabsTrigger>
                                <TabsTrigger value="new" className="text-xs">
                                    Create New
                                </TabsTrigger>
                            </TabsList>
                            <TabsContent value="existing" className="mt-2">
                                <Select value={selectedLevel} onValueChange={setSelectedLevel}>
                                    <SelectTrigger className="h-9 text-sm">
                                        <SelectValue placeholder="Select level (or leave for DEFAULT)" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="">DEFAULT</SelectItem>
                                        {levels.map((level) => (
                                            <SelectItem key={level.id} value={level.id}>
                                                {level.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </TabsContent>
                            <TabsContent value="new" className="mt-2">
                                <div className="flex gap-2">
                                    <Input
                                        placeholder="Enter new level name"
                                        value={newLevelName}
                                        onChange={(e) => setNewLevelName(e.target.value)}
                                        className="h-9 text-sm"
                                    />
                                    <Button
                                        size="sm"
                                        onClick={handleCreateLevel}
                                        disabled={isCreatingLevel}
                                    >
                                        <Plus className="size-4" />
                                    </Button>
                                </div>
                            </TabsContent>
                        </Tabs>
                    </div>

                    {/* Session Selection */}
                    <div className="space-y-2">
                        <Label className="text-sm">Session</Label>
                        <Tabs defaultValue="existing" className="w-full">
                            <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="existing" className="text-xs">
                                    Select Existing
                                </TabsTrigger>
                                <TabsTrigger value="new" className="text-xs">
                                    Create New
                                </TabsTrigger>
                            </TabsList>
                            <TabsContent value="existing" className="mt-2">
                                <Select value={selectedSession} onValueChange={setSelectedSession}>
                                    <SelectTrigger className="h-9 text-sm">
                                        <SelectValue placeholder="Select session (or leave for DEFAULT)" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="">DEFAULT</SelectItem>
                                        {sessions.map((session) => (
                                            <SelectItem key={session.id} value={session.id}>
                                                {session.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </TabsContent>
                            <TabsContent value="new" className="mt-2">
                                <div className="flex gap-2">
                                    <Input
                                        placeholder="Enter new session name"
                                        value={newSessionName}
                                        onChange={(e) => setNewSessionName(e.target.value)}
                                        className="h-9 text-sm"
                                    />
                                    <Button
                                        size="sm"
                                        onClick={handleCreateSession}
                                        disabled={isCreatingSession}
                                    >
                                        <Plus className="size-4" />
                                    </Button>
                                </div>
                            </TabsContent>
                        </Tabs>
                    </div>

                    {/* Max Slots */}
                    <div className="space-y-2">
                        <Label className="text-sm">Max Seats (optional)</Label>
                        <Input
                            type="number"
                            placeholder="Leave empty for unlimited"
                            value={maxSlots}
                            onChange={(e) => setMaxSlots(e.target.value)}
                            className="h-9 text-sm"
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button onClick={handleConfirm}>Add Batch</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
