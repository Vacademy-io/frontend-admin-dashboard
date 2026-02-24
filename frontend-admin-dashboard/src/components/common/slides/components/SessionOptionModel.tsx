// components/SessionOptionsModal.tsx
/* eslint-disable */
// @ts-nocheck
'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, X, Settings2 } from 'lucide-react'; // Added Settings2
import { Switch } from '@/components/ui/switch'; // Using Switch for boolean options

export interface SessionOptions {
    can_join_in_between: boolean;
    show_results_at_last_slide: boolean;
    is_session_recorded: boolean;
    allow_chat: boolean;
    default_seconds_for_question: number;
    student_attempts: number;
}

interface SessionOptionsModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (options: SessionOptions) => void;
    isCreatingSession: boolean;
}

export const SessionOptionsModal: React.FC<SessionOptionsModalProps> = ({
    isOpen,
    onClose,
    onSubmit,
    isCreatingSession,
}) => {
    const [options, setOptions] = useState<SessionOptions>({
        can_join_in_between: true,
        show_results_at_last_slide: true,
        default_seconds_for_question: 60,
        student_attempts: 1,
        is_session_recorded: false,
        allow_chat: false,
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type } = e.target;
        setOptions((prev) => ({
            ...prev,
            [name]: type === 'number' ? parseInt(value, 10) || 0 : value,
        }));
    };

    const handleSwitchChange = (name: keyof SessionOptions, checked: boolean) => {
        setOptions((prev) => ({
            ...prev,
            [name]: checked,
        }));
    };

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(options);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm transition-opacity duration-300 ease-in-out">
            <div className="w-full max-w-md scale-100 transform rounded-xl bg-white p-6 shadow-2xl transition-all duration-300 ease-in-out sm:p-8">
                <div className="mb-6 flex items-center justify-between border-b border-slate-200 pb-3">
                    <h2 className="flex items-center text-xl font-semibold text-slate-800 sm:text-2xl">
                        <Settings2 className="mr-2.5 size-6 text-orange-500" />
                        Session Options
                    </h2>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onClose}
                        className="rounded-full text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                    >
                        <X className="size-5" />
                    </Button>
                </div>

                <form onSubmit={handleFormSubmit} className="space-y-6">
                    {/* Boolean Toggles */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50/50 p-3 transition-colors hover:border-orange-300/70">
                            <Label
                                htmlFor="can_join_in_between"
                                className="flex-1 cursor-pointer text-sm font-medium text-slate-700"
                            >
                                Allow Join In-Between
                            </Label>
                            <Switch
                                id="can_join_in_between"
                                name="can_join_in_between"
                                checked={options.can_join_in_between}
                                onCheckedChange={(checked) =>
                                    handleSwitchChange('can_join_in_between', checked)
                                }
                                className="data-[state=checked]:bg-orange-500"
                            />
                        </div>

                        <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50/50 p-3 transition-colors hover:border-orange-300/70">
                            <Label
                                htmlFor="show_results_at_last_slide"
                                className="flex-1 cursor-pointer text-sm font-medium text-slate-700"
                            >
                                Show Results at Last Slide
                            </Label>
                            <Switch
                                id="show_results_at_last_slide"
                                name="show_results_at_last_slide"
                                checked={options.show_results_at_last_slide}
                                onCheckedChange={(checked) =>
                                    handleSwitchChange('show_results_at_last_slide', checked)
                                }
                                className="data-[state=checked]:bg-orange-500"
                            />
                        </div>

                        <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50/50 p-3 transition-colors hover:border-orange-300/70">
                            <Label
                                htmlFor="allow_chat"
                                className="flex-1 cursor-pointer text-sm font-medium text-slate-700"
                            >
                                Allow Learners Chat
                            </Label>
                            <Switch
                                id="allow_chat"
                                name="allow_chat"
                                checked={options.allow_chat}
                                onCheckedChange={(checked) =>
                                    handleSwitchChange('allow_chat', checked)
                                }
                                className="data-[state=checked]:bg-orange-500"
                            />
                        </div>

                        <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50/50 p-3 transition-colors hover:border-orange-300/70">
                            <Label
                                htmlFor="is_session_recorded"
                                className="flex-1 cursor-pointer text-sm font-medium text-slate-700"
                            >
                                Record Presentation Audio
                            </Label>
                            <Switch
                                id="is_session_recorded"
                                name="is_session_recorded"
                                checked={options.is_session_recorded}
                                onCheckedChange={(checked) =>
                                    handleSwitchChange('is_session_recorded', checked)
                                }
                                className="data-[state=checked]:bg-green-500"
                            />
                        </div>
                    </div>

                    {/* Numeric Inputs */}
                    <div className="space-y-4 pt-2">
                        <div>
                            <Label
                                htmlFor="default_seconds_for_question"
                                className="mb-1.5 block text-sm font-medium text-slate-700"
                            >
                                Default Seconds per Question
                            </Label>
                            <Input
                                type="number"
                                id="default_seconds_for_question"
                                name="default_seconds_for_question"
                                value={options.default_seconds_for_question}
                                onChange={handleInputChange}
                                min="10"
                                className="w-full rounded-md border-slate-300 p-2.5 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm"
                                placeholder="e.g., 60"
                            />
                        </div>

                        <div>
                            <Label
                                htmlFor="student_attempts"
                                className="mb-1.5 block text-sm font-medium text-slate-700"
                            >
                                Student Attempts per Question
                            </Label>
                            <Input
                                type="number"
                                id="student_attempts"
                                name="student_attempts"
                                value={options.student_attempts}
                                onChange={handleInputChange}
                                min="1"
                                className="w-full rounded-md border-slate-300 p-2.5 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm"
                                placeholder="e.g., 1"
                            />
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end space-x-3 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            disabled={isCreatingSession}
                            className="rounded-lg border-slate-300 px-5 py-2 text-slate-700 hover:bg-slate-100 focus-visible:ring-slate-400"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={isCreatingSession}
                            className="flex items-center gap-2 rounded-lg bg-orange-500 px-5 py-2 text-white hover:bg-orange-600 focus-visible:ring-orange-400"
                        >
                            {isCreatingSession ? (
                                <>
                                    <Loader2 className="size-4 animate-spin" />
                                    Creating...
                                </>
                            ) : (
                                'Create & Start'
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};
