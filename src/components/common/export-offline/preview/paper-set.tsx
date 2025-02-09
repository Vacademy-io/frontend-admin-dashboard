import { SectionHeader } from "./section-header";
import { QuestionComponent } from "./question-component";
import type { Section } from "../types/question";
import { useMemo, useRef, useEffect, useState } from "react";
import type { ExportSettings } from "../contexts/export-settings-context";
import { useInstituteDetailsStore } from "@/stores/students/students-list/useInstituteDetailsStore";
import { dummyInstruction } from "../data/dummy-instruction";
import { Input } from "@/components/ui/input";

interface PaperSetProps {
    sections: Section[];
    setNumber: number;
    settings: ExportSettings;
    className?: string;
    // eslint-disable-next-line
    instructions?: any;
}
// eslint-disable-next-line
export function PaperSet({ sections, setNumber, settings, instructions }: PaperSetProps) {
    const [heights, setHeights] = useState({
        initialHeader: 0,
        instructionsHeight: 0,
        sectionHeader: 0,
        questions: [] as number[],
    });
    const { instituteDetails } = useInstituteDetailsStore();

    const initialHeaderRef = useRef<HTMLDivElement>(null);
    const instructionsRef = useRef<HTMLDivElement>(null);
    const sectionHeaderRef = useRef<HTMLDivElement>(null);
    const questionRefs = useRef<(HTMLDivElement | null)[]>([]);

    // Constants for page layout (in mm)
    const PAGE_HEIGHT = 297; // A4 height
    const USABLE_HEIGHT = PAGE_HEIGHT;
    const MIN_SPACE_AFTER_CONTENT = 10;

    useEffect(() => {
        const measureHeight = (element: HTMLElement | null): number => {
            if (!element) return 0;
            const styles = window.getComputedStyle(element);
            const margin =
                Number.parseFloat(styles.marginTop) + Number.parseFloat(styles.marginBottom);
            return (element.offsetHeight + margin) / 3.7795275591;
        };

        const newHeights = {
            initialHeader: measureHeight(initialHeaderRef.current),
            instructionsHeight: measureHeight(instructionsRef.current),
            sectionHeader: measureHeight(sectionHeaderRef.current),
            questions: questionRefs.current.map(measureHeight),
        };

        setHeights(newHeights);
    }, [sections, settings]);

    const renderHeader = (isInstructionPage = false) => (
        <div ref={initialHeaderRef} key="header" className="mb-6">
            {/* Institue letterhead */}
            {settings.showInstitutionLetterhead && (
                <div className="mb-6 border-b pb-4 text-center">
                    {settings.customLetterheadImage ? (
                        <img
                            src={settings.customLetterheadImage || "/placeholder.svg"}
                            alt="Custom Letterhead"
                            className="mx-auto mb-2 max-h-24"
                        />
                    ) : (
                        <h1 className="text-2xl font-bold">{instituteDetails?.institute_name}</h1>
                    )}
                </div>
            )}

            {/* Question paper set code */}
            {settings.includeQuestionSetCode && (
                <div className="mb-4 text-right text-sm text-gray-600">
                    Set Code: {String.fromCharCode(65 + setNumber)}
                </div>
            )}

            {/* Rendering Custom fields */}
            {settings.includeCustomInputFields && settings.customFields && (
                <div className="mb-6 space-y-4">
                    {settings.customFields
                        .filter((field) => field.enabled)
                        .map((field, index) => (
                            <div
                                key={index}
                                className="mb-4 flex items-center justify-between gap-4"
                            >
                                <label className="w-1/4 text-sm font-medium">{field.label}:</label>
                                <div className="w-3/4">
                                    {field.type === "blank" && (
                                        <div className="h-8 border-b border-gray-300" />
                                    )}
                                    {field.type === "blocks" && (
                                        <div className="flex">
                                            {[...Array(field.numberOfBlocks || 10)].map(
                                                (_, blockIndex) => (
                                                    <div
                                                        key={blockIndex}
                                                        className="size-6 border border-gray-300"
                                                    ></div>
                                                ),
                                            )}
                                        </div>
                                    )}
                                    {field.type === "input" && (
                                        <Input className="w-full" readOnly />
                                    )}
                                    {field.type === "checkbox" && (
                                        <div className="size-6 rounded-full border-2 border-gray-300" />
                                    )}
                                </div>
                            </div>
                        ))}
                </div>
            )}

            {/* Instructions */}
            {isInstructionPage && (
                <div ref={instructionsRef} className="mb-6">
                    <h2 className="mb-4 text-xl font-semibold">Instructions</h2>
                    <div
                        className="text-gray-700"
                        dangerouslySetInnerHTML={{
                            __html: dummyInstruction.instructions.content,
                        }}
                    />
                </div>
            )}
        </div>
    );

    const pages = useMemo(() => {
        const pages: JSX.Element[] = [];
        let pageNumber = 1;

        // Calculate rough work height
        const ROUGH_WORK_HEIGHT =
            settings.spaceForRoughWork === "none"
                ? 0
                : settings.roughWorkSize === "small"
                  ? 50
                  : settings.roughWorkSize === "large"
                    ? 150
                    : 100;

        const createPage = (
            content: JSX.Element[],
            isLast = false,
            remainingHeight: number = USABLE_HEIGHT,
        ): JSX.Element => {
            return (
                <div
                    key={`page-${pageNumber}`}
                    className="page relative bg-white"
                    style={{
                        height: `${PAGE_HEIGHT}mm`,
                        position: "relative",
                    }}
                >
                    <div className="content-wrapper">{content}</div>
                    {(isLast || settings.spaceForRoughWork !== "none") &&
                        remainingHeight >= ROUGH_WORK_HEIGHT && (
                            <div className="mt-4" style={{ height: `${ROUGH_WORK_HEIGHT}mm` }}>
                                <h3 className="mb-2 text-lg font-semibold">Space for Rough Work</h3>
                                <div className="h-full rounded-lg border-t-2 border-dashed" />
                            </div>
                        )}
                    {settings.showPageNumbers && (
                        <div className="absolute bottom-4 right-4 text-sm text-gray-500">
                            {pageNumber}
                        </div>
                    )}
                </div>
            );
        };

        // Handle first page with instructions if enabled
        if (settings.showFirstPageInstructions) {
            pages.push(createPage([renderHeader(true)]));
            pageNumber++;
        }

        // Start content pages
        let currentContent: JSX.Element[] = [];
        let remainingHeight = USABLE_HEIGHT;

        // Add header to first content page
        if (!settings.showFirstPageInstructions) {
            currentContent.push(renderHeader(false));
            remainingHeight -= heights.initialHeader;
        }

        // Process sections
        // eslint-disable-next-line
        sections.forEach((section, sectionIndex) => {
            // Always start a new page for each section
            if (currentContent.length > 0) {
                pages.push(createPage(currentContent));
                pageNumber++;
                currentContent = [];
                remainingHeight = USABLE_HEIGHT;
            }

            const sectionHeader = (
                <div ref={sectionHeaderRef} key={`section-${section.id}-header`}>
                    <SectionHeader
                        title={section.title}
                        description={section.description}
                        totalMarks={section.totalMarks}
                        duration={section.duration}
                        showDuration={settings.showSectionDuration}
                        showMarks={settings.showMarksPerQuestion}
                    />
                </div>
            );

            currentContent.push(sectionHeader);
            remainingHeight -= heights.sectionHeader;

            // Process questions in columns
            const columns = settings.columnsPerPage;
            let currentRow: JSX.Element[] = [];
            let currentRowMaxHeight = 0;

            section.questions.forEach((question, questionIndex) => {
                const questionHeight = heights.questions[questionIndex] || 0;
                currentRowMaxHeight = Math.max(currentRowMaxHeight, questionHeight);

                currentRow.push(
                    <div
                        key={question.question_id}
                        ref={(el) => {
                            questionRefs.current[questionIndex] = el;
                        }}
                        className="p-1"
                        style={{
                            fontSize:
                                settings.fontSize === "small"
                                    ? "12px"
                                    : settings.fontSize === "large"
                                      ? "16px"
                                      : "14px",
                        }}
                    >
                        <QuestionComponent
                            question={question}
                            questionNumber={questionIndex + 1}
                            showMarks={settings.showMarksPerQuestion}
                            showCheckboxes={settings.showCheckboxesBeforeOptions}
                        />
                    </div>,
                );

                if (
                    currentRow.length === columns ||
                    questionIndex === section.questions.length - 1
                ) {
                    if (remainingHeight < currentRowMaxHeight + MIN_SPACE_AFTER_CONTENT) {
                        pages.push(createPage(currentContent));
                        pageNumber++;
                        currentContent = [];
                        remainingHeight = USABLE_HEIGHT;
                    }

                    currentContent.push(
                        <div
                            key={`row-${section.id}-${Math.floor(questionIndex / columns)}`}
                            className={`grid gap-4 ${
                                columns === 2 ? "grid-cols-2" : columns === 3 ? "grid-cols-3" : ""
                            }`}
                        >
                            {currentRow}
                        </div>,
                    );

                    remainingHeight -= currentRowMaxHeight;
                    currentRow = [];
                    currentRowMaxHeight = 0;
                }
            });
        });

        // Add remaining content to the last page
        if (currentContent.length > 0) {
            pages.push(createPage(currentContent, true, remainingHeight));
        }

        return pages;
    }, [sections, settings, heights, USABLE_HEIGHT]);

    return <div className="space-y-4">{pages}</div>;
}
