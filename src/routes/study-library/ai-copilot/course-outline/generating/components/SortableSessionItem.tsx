import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Input } from '@/components/ui/input';
import { GripVertical, Edit2, Trash2, CheckCircle, X } from 'lucide-react';
import { SessionProgress } from '../../../shared/types';
import { CircularProgress } from './CircularProgress';

interface SortableSessionItemProps {
    session: SessionProgress;
    sessionIndex: number;
    onEdit: (sessionId: string, newTitle: string) => void;
    onDelete: (sessionId: string) => void;
    onRegenerate: (sessionId: string) => void;
    editingSessionId: string | null;
    editSessionTitle: string;
    onStartEdit: (sessionId: string, currentTitle: string) => void;
    onCancelEdit: () => void;
    onSaveEdit: (sessionId: string) => void;
    setEditSessionTitle: (title: string) => void;
    children: React.ReactNode;
}

export const SortableSessionItem = ({
    session,
    sessionIndex,
    onEdit,
    onDelete,
    onRegenerate,
    editingSessionId,
    editSessionTitle,
    onStartEdit,
    onCancelEdit,
    onSaveEdit,
    setEditSessionTitle,
    children,
}: SortableSessionItemProps) => {
    const isEditing = editingSessionId === session.sessionId;
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: session.sessionId });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    const handleSaveEdit = () => {
        if (editSessionTitle.trim()) {
            onSaveEdit(session.sessionId);
        }
    };

    const completedCount = session.slides.filter((s) => s.status === 'completed').length;

    return (
        <div ref={setNodeRef} style={style}>
            <AccordionItem
                value={session.sessionId}
                className="border-b border-neutral-200 last:border-b-0"
            >
                <AccordionTrigger className="group py-4 text-left hover:no-underline [&>svg]:hidden">
                    <div className="flex items-center justify-between w-full pr-4">
                        <div className="flex items-center gap-2 flex-1">
                            <button
                                {...attributes}
                                {...listeners}
                                className="cursor-grab active:cursor-grabbing text-neutral-400 hover:text-neutral-600 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <GripVertical className="h-4 w-4" />
                            </button>
                            {isEditing ? (
                                <Input
                                    value={editSessionTitle}
                                    onChange={(e) => setEditSessionTitle(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') handleSaveEdit();
                                        if (e.key === 'Escape') onCancelEdit();
                                    }}
                                    onClick={(e) => e.stopPropagation()}
                                    className="h-7 text-sm flex-1"
                                    autoFocus
                                />
                            ) : (
                                <h3 className="text-base font-semibold text-neutral-900">
                                    Chapter {sessionIndex + 1}: {session.sessionTitle}
                                </h3>
                            )}
                        </div>
                        <div className="flex items-center gap-4">
                            {!isEditing && (
                                <div className="flex items-center gap-1">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onStartEdit(session.sessionId, session.sessionTitle);
                                        }}
                                        className="rounded p-1 text-xs text-indigo-600 hover:bg-indigo-50 opacity-0 group-hover:opacity-100 transition-opacity"
                                        title="Edit"
                                    >
                                        <Edit2 className="h-3.5 w-3.5" />
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onDelete(session.sessionId);
                                        }}
                                        className="rounded p-1 text-xs text-red-600 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity"
                                        title="Delete"
                                    >
                                        <Trash2 className="h-3.5 w-3.5" />
                                    </button>
                                </div>
                            )}
                            {isEditing && (
                                <div className="flex items-center gap-1">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleSaveEdit();
                                        }}
                                        className="rounded p-1 text-xs text-indigo-600 hover:bg-indigo-50"
                                        title="Save"
                                    >
                                        <CheckCircle className="h-3.5 w-3.5" />
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onCancelEdit();
                                        }}
                                        className="rounded p-1 text-xs text-neutral-600 hover:bg-neutral-100"
                                        title="Cancel"
                                    >
                                        <X className="h-3.5 w-3.5" />
                                    </button>
                                </div>
                            )}
                            <div className="text-xs text-neutral-500">
                                {completedCount}/{session.slides.length} pages
                            </div>
                            {session.progress < 100 && (
                                <CircularProgress value={session.progress} size={32} strokeWidth={3} />
                            )}
                            {session.progress === 100 && (
                                <CheckCircle className="h-6 w-6 text-green-600" />
                            )}
                        </div>
                    </div>
                </AccordionTrigger>
                {children}
            </AccordionItem>
        </div>
    );
};
