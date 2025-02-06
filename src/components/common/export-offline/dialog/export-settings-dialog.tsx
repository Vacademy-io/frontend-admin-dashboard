"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useExportSettings, type ExportSettings } from "../contexts/export-settings-context";
import { useCallback } from "react";

interface ExportSettingsDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function ExportSettingsDialog({ open, onOpenChange }: ExportSettingsDialogProps) {
    const { settings, updateSettings } = useExportSettings();

    const handleSettingChange = useCallback(
        // @ts-expect-error : Parameter 'value' implicitly has an 'any' type.
        (key: keyof ExportSettings, value) => {
            updateSettings({ [key]: value });
        },
        [updateSettings],
    );

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Export Settings</DialogTitle>
                </DialogHeader>

                <div className="grid gap-6 py-2">
                    {/* Layout Settings */}
                    <div className="space-y-2">
                        <h3 className="font-medium">Layout Settings</h3>
                        <div className="space-y-4">
                            <div className="flex w-full gap-x-4">
                                <div className="w-1/2 space-y-2">
                                    <Label>Export Format</Label>
                                    <Select
                                        value={settings.exportFormat}
                                        onValueChange={(value) =>
                                            handleSettingChange(
                                                "exportFormat",
                                                value as "pdf" | "docx",
                                            )
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="pdf">PDF</SelectItem>
                                            <SelectItem value="docx">DOCX</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="w-1/2 space-y-2">
                                    <Label>Columns per Page</Label>
                                    <div className="flex gap-2">
                                        <Input
                                            type="number"
                                            min={1}
                                            max={3}
                                            value={settings.columnsPerPage}
                                            onChange={(e) =>
                                                handleSettingChange(
                                                    "columnsPerPage",
                                                    Number(e.target.value),
                                                )
                                            }
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Space for Rough Work</Label>
                                <RadioGroup
                                    value={settings.spaceForRoughWork}
                                    onValueChange={(value) =>
                                        handleSettingChange(
                                            "spaceForRoughWork",
                                            value as "none" | "bottom" | "right",
                                        )
                                    }
                                    className="flex gap-4"
                                >
                                    <div className="flex items-center gap-2">
                                        <RadioGroupItem value="none" id="rough-none" />
                                        <Label htmlFor="rough-none">None</Label>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <RadioGroupItem value="bottom" id="rough-bottom" />
                                        <Label htmlFor="rough-bottom">Bottom</Label>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <RadioGroupItem value="right" id="rough-right" />
                                        <Label htmlFor="rough-right">Right</Label>
                                    </div>
                                </RadioGroup>
                            </div>

                            <div className="space-y-2">
                                <Label>Rough Work Space Size</Label>
                                <RadioGroup
                                    value={settings.roughWorkSize}
                                    onValueChange={(value) =>
                                        handleSettingChange(
                                            "roughWorkSize",
                                            value as "small" | "medium" | "large",
                                        )
                                    }
                                    className="flex gap-4"
                                >
                                    <div className="flex items-center gap-2">
                                        <RadioGroupItem value="small" id="rough-size-small" />
                                        <Label htmlFor="rough-size-small">Small (50mm)</Label>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <RadioGroupItem value="medium" id="rough-size-medium" />
                                        <Label htmlFor="rough-size-medium">Medium (100mm)</Label>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <RadioGroupItem value="large" id="rough-size-large" />
                                        <Label htmlFor="rough-size-large">Large (150mm)</Label>
                                    </div>
                                </RadioGroup>
                            </div>

                            <div className="space-y-2">
                                <Label>Page Padding</Label>
                                <RadioGroup
                                    value={settings.pagePadding}
                                    onValueChange={(value) =>
                                        handleSettingChange(
                                            "pagePadding",
                                            value as "low" | "medium" | "high",
                                        )
                                    }
                                    className="flex gap-4"
                                >
                                    <div className="flex items-center gap-2">
                                        <RadioGroupItem value="low" id="padding-low" />
                                        <Label htmlFor="padding-low">Low (10mm)</Label>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <RadioGroupItem value="medium" id="padding-medium" />
                                        <Label htmlFor="padding-medium">Medium (20mm)</Label>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <RadioGroupItem value="high" id="padding-high" />
                                        <Label htmlFor="padding-high">High (30mm)</Label>
                                    </div>
                                </RadioGroup>
                            </div>

                            <div className="space-y-2">
                                <Label>Font Size</Label>
                                <RadioGroup
                                    value={settings.fontSize}
                                    onValueChange={(value) =>
                                        handleSettingChange(
                                            "fontSize",
                                            value as "small" | "medium" | "large",
                                        )
                                    }
                                    className="flex gap-4"
                                >
                                    <div className="flex items-center gap-2">
                                        <RadioGroupItem value="small" id="font-small" />
                                        <Label htmlFor="font-small">Small (10pt)</Label>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <RadioGroupItem value="medium" id="font-medium" />
                                        <Label htmlFor="font-medium">Medium (12pt)</Label>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <RadioGroupItem value="large" id="font-large" />
                                        <Label htmlFor="font-large">Large (14pt)</Label>
                                    </div>
                                </RadioGroup>
                            </div>
                        </div>
                    </div>

                    {/* Display Settings */}
                    <div className="space-y-4">
                        <h3 className="font-medium">Display Settings</h3>
                        <div className="flex flex-col gap-y-2">
                            {[
                                ["showInstitutionLetterhead", "Show Institute Letterhead"],
                                [
                                    "showAdaptiveMarkingRules",
                                    "Show Adaptive Marking Rules - Entire Assessment",
                                ],
                                ["showSectionInstructions", "Show Section-wise Instructions"],
                                ["showSectionDuration", "Show Section-wise Duration"],
                                ["showMarksPerQuestion", "Show Marks per Question"],
                                [
                                    "showAdaptiveMarkingRulesSection",
                                    "Show Adaptive Marking Rules - Section-wise",
                                ],
                                ["showCheckboxesBeforeOptions", "Show Checkboxes before Options"],
                                ["showPageNumbers", "Page Numbers"],
                            ].map(([key, label]) => (
                                <div key={key} className="flex items-center gap-4">
                                    <Checkbox
                                        id={key}
                                        checked={settings[key as keyof ExportSettings] as boolean}
                                        onCheckedChange={(checked) =>
                                            handleSettingChange(
                                                key as keyof ExportSettings,
                                                checked,
                                            )
                                        }
                                    />
                                    <label htmlFor={key}>{label}</label>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Paper Sets */}
                    <div className="space-y-4">
                        <h3 className="font-medium">Paper Sets</h3>
                        <div className="flex flex-col gap-y-2">
                            <div className="space-y-2">
                                <Label>Create Question Papers Sets</Label>
                                <div className="flex gap-2">
                                    <Input
                                        type="number"
                                        min={1}
                                        value={settings.questionPaperSets}
                                        onChange={(e) =>
                                            handleSettingChange(
                                                "questionPaperSets",
                                                Number.parseInt(e.target.value),
                                            )
                                        }
                                    />
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <Checkbox
                                    id="includeQuestionSetCode"
                                    checked={settings.includeQuestionSetCode}
                                    onCheckedChange={(checked) =>
                                        handleSettingChange("includeQuestionSetCode", checked)
                                    }
                                />
                                <label htmlFor="includeQuestionSetCode">
                                    Include Question Set Code
                                </label>
                            </div>

                            <div className="flex items-center gap-4">
                                <Checkbox
                                    id="randomizeQuestions"
                                    checked={settings.randomizeQuestions}
                                    onCheckedChange={(checked) =>
                                        handleSettingChange("randomizeQuestions", checked)
                                    }
                                />
                                <label htmlFor="randomizeQuestions">Randomize Questions</label>
                            </div>

                            <div className="flex items-center gap-4">
                                <Checkbox
                                    id="randomizeOptions"
                                    checked={settings.randomizeOptions}
                                    onCheckedChange={(checked) =>
                                        handleSettingChange("randomizeOptions", checked)
                                    }
                                />
                                <label htmlFor="randomizeOptions">Randomize Options</label>
                            </div>
                        </div>
                    </div>

                    {/* Custom Fields */}
                    <div className="space-y-4">
                        <h3 className="font-medium">Custom Fields</h3>
                        <div className="flex flex-col gap-y-2">
                            <div className="flex items-center gap-4">
                                <Checkbox
                                    id="includeCustomInputFields"
                                    checked={settings.includeCustomInputFields}
                                    onCheckedChange={(checked) =>
                                        handleSettingChange("includeCustomInputFields", checked)
                                    }
                                />
                                <label htmlFor="includeCustomInputFields">
                                    Include custom input fields
                                </label>
                            </div>
                            {settings.includeCustomInputFields && (
                                <Input
                                    placeholder="Enter custom field (e.g., Name, Roll No)"
                                    value={settings.customFields?.join(", ") || ""}
                                    onChange={(e) =>
                                        handleSettingChange(
                                            "customFields",
                                            e.target.value.split(",").map((field) => field.trim()),
                                        )
                                    }
                                />
                            )}
                        </div>
                    </div>
                </div>

                <div className="mt-6 flex justify-end gap-2">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button onClick={() => onOpenChange(false)}>Save</Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
