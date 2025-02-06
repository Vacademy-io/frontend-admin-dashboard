"use client";

import { createContext, useContext, useState } from "react";

export interface ExportSettings {
    exportQuestionPaper: boolean;
    exportSolutionKey: boolean;
    exportFormat: "pdf" | "docx";
    columnsPerPage: number;
    questionsPerPage: number;
    showInstitutionLetterhead: boolean;
    showAdaptiveMarkingRules: boolean;
    showSectionInstructions: boolean;
    showSectionDuration: boolean;
    showMarksPerQuestion: boolean;
    showAdaptiveMarkingRulesSection: boolean;
    showCheckboxesBeforeOptions: boolean;
    spaceForRoughWork: "none" | "bottom" | "right";
    questionPaperSets: number;
    includeQuestionSetCode: boolean;
    randomizeQuestions: boolean;
    randomizeOptions: boolean;
    showPageNumbers: boolean;
    includeCustomInputFields: boolean;
    customFields?: string[];
    pagePadding: "low" | "medium" | "high";
    fontSize: "small" | "medium" | "large";
    roughWorkSize: "small" | "medium" | "large";
}

const defaultSettings: ExportSettings = {
    exportQuestionPaper: true,
    exportSolutionKey: true,
    exportFormat: "pdf",
    columnsPerPage: 1,
    questionsPerPage: 3,
    showInstitutionLetterhead: true,
    showAdaptiveMarkingRules: true,
    showSectionInstructions: true,
    showSectionDuration: true,
    showMarksPerQuestion: true,
    showAdaptiveMarkingRulesSection: true,
    showCheckboxesBeforeOptions: true,
    spaceForRoughWork: "none",
    questionPaperSets: 1,
    includeQuestionSetCode: true,
    randomizeQuestions: false,
    randomizeOptions: false,
    showPageNumbers: true,
    includeCustomInputFields: true,
    pagePadding: "medium",
    fontSize: "medium",
    roughWorkSize: "medium",
};

const ExportSettingsContext = createContext<{
    settings: ExportSettings;
    updateSettings: (settings: Partial<ExportSettings>) => void;
}>({
    settings: defaultSettings,
    updateSettings: () => {},
});

export function ExportSettingsProvider({ children }: { children: React.ReactNode }) {
    const [settings, setSettings] = useState<ExportSettings>(defaultSettings);

    const updateSettings = (newSettings: Partial<ExportSettings>) => {
        setSettings((prev) => ({ ...prev, ...newSettings }));
    };

    return (
        <ExportSettingsContext.Provider value={{ settings, updateSettings }}>
            {children}
        </ExportSettingsContext.Provider>
    );
}

export const useExportSettings = () => useContext(ExportSettingsContext);
