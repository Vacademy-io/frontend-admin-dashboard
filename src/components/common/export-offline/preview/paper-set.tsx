import { SectionHeader } from "./section-header";
import { QuestionComponent } from "./question-component";
import type { Section } from "../types/question";
import { useMemo, useRef, useEffect, useState } from "react";
import { ExportSettings } from "../contexts/export-settings-context";
import { Label } from "@/components/ui/label";

interface PaperSetProps {
    sections: Section[];
    setNumber: number;
    settings: ExportSettings;
    className?: string;
}

export function PaperSet({ sections, setNumber, settings }: PaperSetProps) {
    const [heights, setHeights] = useState({
        initialHeader: 0,
        sectionHeader: 0,
        questions: [] as number[],
    });

    const initialHeaderRef = useRef<HTMLDivElement>(null);
    const sectionHeaderRef = useRef<HTMLDivElement>(null);
    const questionRefs = useRef<(HTMLDivElement | null)[]>([]);

    // Constants for page layout (in mm)
    const PAGE_HEIGHT = 297; // A4 height
    const USABLE_HEIGHT = PAGE_HEIGHT;
    const MIN_SPACE_AFTER_CONTENT = 10; // Minimum space to leave after content

    // Height measurement effect with improved accuracy
    useEffect(() => {
        const measureHeight = (element: HTMLElement | null): number => {
            if (!element) return 0;
            const styles = window.getComputedStyle(element);
            const margin = parseFloat(styles.marginTop) + parseFloat(styles.marginBottom);
            return (element.offsetHeight + margin) / 3.7795275591; // Convert px to mm
        };

        const newHeights = {
            initialHeader: measureHeight(initialHeaderRef.current),
            sectionHeader: measureHeight(sectionHeaderRef.current),
            questions: questionRefs.current.map(measureHeight),
        };

        setHeights(newHeights);
    }, [sections, settings]);

    const pages = useMemo(() => {
        const pages: JSX.Element[] = [];
        let pageNumber = 1;

        // Calculate rough work height in mm
        const ROUGH_WORK_HEIGHT =
            settings.spaceForRoughWork === "none"
                ? 0
                : settings.roughWorkSize === "small"
                  ? 50
                  : settings.roughWorkSize === "large"
                    ? 150
                    : 100;

        // Function to create a new page
        const createPage = (
            content: JSX.Element[],
            isLast: boolean = false,
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

                    {/* Add rough work space if it's the last page or if configured */}
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

        let currentContent: JSX.Element[] = [];
        let remainingHeight = USABLE_HEIGHT;

        // Add initial header to first page
        if (pageNumber === 1) {
            const initialHeader = (
                <div ref={initialHeaderRef} key="initial-header">
                    {settings.showInstitutionLetterhead && (
                        <div className="mb-6 border-b pb-4 text-center">
                            <h1 className="text-2xl font-bold">Institute Letterhead</h1>
                        </div>
                    )}
                    {settings.includeQuestionSetCode && (
                        <div className="mb-4 text-right text-sm text-gray-600">
                            Set Code: {String.fromCharCode(65 + setNumber)}
                        </div>
                    )}
                    {settings.includeCustomInputFields && settings.customFields && (
                        <div className="mb-6">
                            {settings.customFields.map((field, index) => (
                                <div
                                    key={`custom-field-${index}`}
                                    className="mb-2 flex items-center"
                                >
                                    <Label className="w-1/4">{field}:</Label>
                                    <div className="w-3/4 border-b border-gray-300" />
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            );
            currentContent.push(initialHeader);
            remainingHeight -= heights.initialHeader;
        }

        // Track whether we've added a section header
        const sectionHeaderAdded: boolean[] = new Array(sections.length).fill(false);

        sections.forEach((section, sectionIndex) => {
            // Add separator line between sections (except for the first section)
            if (sectionIndex > 0) {
                // Check if separator fits on current page
                if (remainingHeight < 10 + MIN_SPACE_AFTER_CONTENT) {
                    pages.push(createPage(currentContent));
                    pageNumber++;
                    currentContent = [];
                    remainingHeight = USABLE_HEIGHT;
                }
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

            // Check if we need a new page for section header
            if (remainingHeight < heights.sectionHeader + MIN_SPACE_AFTER_CONTENT) {
                pages.push(createPage(currentContent));
                pageNumber++;
                currentContent = [];
                remainingHeight = USABLE_HEIGHT;
            }

            // Add section header only if it hasn't been added before
            if (!sectionHeaderAdded[sectionIndex]) {
                currentContent.push(sectionHeader);
                remainingHeight -= heights.sectionHeader;
                sectionHeaderAdded[sectionIndex] = true;
            }

            // Process questions in rows based on columns setting
            const columns = settings.columnsPerPage;
            let currentRow: JSX.Element[] = [];
            let currentRowMaxHeight = 0;

            section.questions.forEach((question, questionIndex) => {
                const questionHeight = heights.questions[questionIndex] || 0;
                currentRowMaxHeight = Math.max(currentRowMaxHeight, questionHeight);

                // Add question to current row
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

                // Check if row is complete or last question
                if (
                    currentRow.length === columns ||
                    questionIndex === section.questions.length - 1
                ) {
                    // Check if we need a new page
                    if (remainingHeight < currentRowMaxHeight + MIN_SPACE_AFTER_CONTENT) {
                        pages.push(createPage(currentContent));
                        pageNumber++;
                        currentContent = []; // Do not re-add section header
                        remainingHeight = USABLE_HEIGHT;
                    }

                    // Add row to current content
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
    }, [sections, settings, heights, setNumber]);

    return <div className="space-y-4">{pages}</div>;
}
