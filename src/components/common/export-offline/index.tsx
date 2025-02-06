"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";
import { PaperSet } from "./preview/paper-set";
import { ExportHandler } from "./preview/export-handler";
import { ExportSettingsDialog } from "./dialog/export-settings-dialog";
import { ExportSettingsProvider, useExportSettings } from "./contexts/export-settings-context";
import { Toaster as Sonner } from "sonner";
import { useSuspenseQuery } from "@tanstack/react-query";
import { getQuestionDataForSection } from "@/routes/assessment/create-assessment/$assessmentId/$examtype/-services/assessment-services";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Loader2 } from "lucide-react";
import { Question, Section } from "./types/question";

function shuffleArray<T>(array: T[]): T[] {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const temp = newArray[i] as T;
        newArray[i] = newArray[j] as T;
        newArray[j] = temp;
    }
    return newArray;
}

function PreviewWithSettings({
    assessmentId,
    sectionIds,
}: {
    assessmentId: string;
    sectionIds: string[];
}) {
    const [showSettings, setShowSettings] = useState(false);
    const [currentSetIndex, setCurrentSetIndex] = useState(0);
    const { settings } = useExportSettings();
    const { data: questionData, isLoading } = useSuspenseQuery(
        getQuestionDataForSection({ assessmentId, sectionIds: sectionIds.join(",") }),
    );

    // Determine padding based on settings
    const getPadding = () => {
        switch (settings.pagePadding) {
            case "low":
                return "10mm";
            case "high":
                return "30mm";
            default:
                return "20mm"; // medium
        }
    };

    // Transform questions into sections
    const sections = useMemo(() => {
        return Object.entries(questionData).map(([sectionId, questions]) => ({
            id: sectionId,
            title: "Section 1: Physics",
            description:
                'Challenge your understanding of the chapter "Human Eye" with this test...',
            totalMarks: 20,
            duration: 40,
            questions: settings.randomizeQuestions
                ? shuffleArray(questions as Question[])
                : questions,
        }));
    }, [settings.randomizeQuestions]);

    // Generate paper sets
    const paperSets = useMemo(() => {
        return Array.from({ length: settings.questionPaperSets }, (_, i) => ({
            setNumber: i,
            sections: settings.randomizeQuestions
                ? sections.map((section) => ({
                      ...section,
                      questions: shuffleArray(section.questions as Question[]),
                  }))
                : (sections as Section[]),
        }));
    }, [sections, settings.questionPaperSets, settings.randomizeQuestions]);

    const handleNextSet = () => {
        if (currentSetIndex < paperSets.length - 1) {
            setCurrentSetIndex(currentSetIndex + 1);
        }
    };

    const handlePreviousSet = () => {
        if (currentSetIndex > 0) {
            setCurrentSetIndex(currentSetIndex - 1);
        }
    };

    const currentPaperSet = paperSets[currentSetIndex];

    if (isLoading) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                <div className="flex w-80 flex-col items-center gap-4 rounded-lg bg-white p-6 shadow-xl">
                    <Loader2 className="size-12 animate-spin text-primary-500" />
                    <h2 className="text-lg font-semibold">Generating Preview</h2>
                    <p className="text-sm text-muted-foreground">
                        Fetching questions and preparing paper...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen min-w-full bg-slate-50/50" style={{ boxSizing: "border-box" }}>
            <style>{`
                .page {
                    width: 210mm;
                    min-height: 297mm;
                    padding: ${getPadding()};
                    margin: 10mm auto;
                    border: 1px #d3d3d3 solid;
                    border-radius: 5px;
                    background: white;
                    box-shadow: 0 0 5px rgba(0, 0, 0, 0.1);
                }
            `}</style>
            <div className="no-print sticky top-0 z-10 border-b bg-white">
                <div className="flex items-center justify-between p-4">
                    <Button
                        variant="outline"
                        onClick={() => setShowSettings(true)}
                        className="gap-2"
                    >
                        <Settings className="size-4" />
                        Export Settings
                    </Button>

                    {paperSets.length > 1 && (
                        <div className="flex items-center gap-4">
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={handlePreviousSet}
                                disabled={currentSetIndex === 0}
                            >
                                <ChevronLeft className="size-4" />
                            </Button>
                            <span className="text-sm font-medium">
                                Set {currentSetIndex + 1} of {paperSets.length}
                            </span>
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={handleNextSet}
                                disabled={currentSetIndex === paperSets.length - 1}
                            >
                                <ChevronRight className="size-4" />
                            </Button>
                        </div>
                    )}

                    <ExportHandler
                        sections={currentPaperSet?.sections ?? []}
                        settings={settings}
                        {...(paperSets.length > 1 ? { setNumber: currentPaperSet?.setNumber } : {})}
                    />
                </div>
            </div>

            {showSettings && (
                <ExportSettingsDialog open={showSettings} onOpenChange={setShowSettings} />
            )}

            <div className="container mx-auto py-4">
                <PaperSet
                    sections={currentPaperSet?.sections ?? []}
                    settings={settings}
                    setNumber={currentPaperSet?.setNumber ?? 0}
                />
            </div>
            <Sonner />
        </div>
    );
}

export default function PreviewAndExport({
    assessmentId,
    sectionIds,
}: {
    assessmentId: string;
    sectionIds: string[];
}) {
    return (
        <ExportSettingsProvider>
            <PreviewWithSettings assessmentId={assessmentId} sectionIds={sectionIds} />
        </ExportSettingsProvider>
    );
}
