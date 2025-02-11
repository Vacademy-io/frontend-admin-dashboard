"use client";

import { Label } from "@/components/ui/label";
import { useExportSettings } from "../contexts/export-settings-context";
import { processHtmlString } from "../utils/utils";
import { Checkbox } from "@/components/ui/checkbox";
import { Question } from "../types/question";

interface QuestionComponentProps {
    question: Question;
    questionNumber: number;
    showMarks?: boolean;
    showCheckboxes?: boolean;
}

export function QuestionComponent({
    question,
    showMarks = true,
    showCheckboxes = false,
}: QuestionComponentProps) {
    const { settings } = useExportSettings();
    const marks = JSON.parse(question.marking_json)?.data?.totalMark || 0;

    // Determine font size class
    const getFontSizeClass = () => {
        switch (settings.fontSize) {
            case "small":
                return "text-xs";
            case "large":
                return "text-base";
            default:
                return "text-sm";
        }
    };

    return (
        <div className={`space-y-4 ${getFontSizeClass()}`}>
            <div className="flex items-start justify-between gap-4">
                <div className="text-slate-800">
                    <p className="question-container gap-x-1 font-bold">
                        {question.question_order}
                        {")"}.
                        <p>
                            {processHtmlString(question.question.content).map((item, index) =>
                                item.type === "text" ? (
                                    <span key={index}>{item.content}</span>
                                ) : (
                                    <img
                                        key={index}
                                        src={item.content}
                                        alt={`Question image ${index + 1}`}
                                        className=""
                                    />
                                ),
                            )}
                        </p>
                    </p>
                    <p>{}</p>
                </div>
                {showMarks && (
                    <div className="whitespace-nowrap rounded-md px-1 text-sm font-semibold text-gray-600">
                        {marks.toString()}
                    </div>
                )}
            </div>

            <div className="grid grid-cols-2 pl-6">
                {question.options_with_explanation.map((option, index) => (
                    <div key={index} className="option-container gap-x-1">
                        {showCheckboxes && <Checkbox className="pointer-events-none" />}
                        <Label className="">
                            {String.fromCharCode(97 + index)}
                            {")"}.{" "}
                            {processHtmlString(option.text.content).map((item, index) =>
                                item.type === "text" ? (
                                    <span key={index} id="text-content">
                                        {item.content}
                                    </span>
                                ) : (
                                    <img
                                        key={index}
                                        src={item.content}
                                        alt={`Question image ${index + 1}`}
                                        className=""
                                    />
                                ),
                            )}
                        </Label>
                    </div>
                ))}
            </div>
        </div>
    );
}
