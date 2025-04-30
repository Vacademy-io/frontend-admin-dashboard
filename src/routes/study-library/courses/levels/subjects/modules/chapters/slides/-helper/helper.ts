import { QuestionType } from "@/constants/dummy-data";
import { UploadQuestionPaperFormType } from "@/routes/assessment/question-papers/-components/QuestionPaperUpload";
import { getEvaluationJSON } from "@/routes/assessment/question-papers/-utils/helper";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export const convertHtmlToPdf = async (htmlString: string): Promise<Blob> => {
    // Create temporary div to hold the HTML content
    const tempDiv: HTMLElement = document.createElement("div");
    tempDiv.innerHTML = htmlString;

    // Pre-process images
    const imageElements = tempDiv.querySelectorAll("img");
    for (const img of Array.from(imageElements)) {
        // Fix zero width/height images
        if (img.width === 0 || img.height === 0) {
            img.width = 400;
            img.height = 300;
            img.style.maxWidth = "100%";
            img.style.height = "auto";
        }

        // Make sure image has proper loading attributes
        img.crossOrigin = "anonymous";
        img.loading = "eager";
    }

    // Create an offscreen container that's outside the viewport
    tempDiv.style.position = "absolute";
    tempDiv.style.top = "-9999px";
    tempDiv.style.left = "-9999px";
    tempDiv.style.width = "210mm"; // A4 width
    tempDiv.style.backgroundColor = "white";
    tempDiv.style.padding = "10mm";
    // Don't constrain height

    // Append to body temporarily
    document.body.appendChild(tempDiv);

    try {
        // Wait for any potential image loading and layout
        await new Promise((resolve) => setTimeout(resolve, 500));

        // Initialize PDF
        const pdf = new jsPDF({
            orientation: "portrait",
            unit: "mm",
            format: "a4",
            compress: true,
        });

        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();

        // Get content HTML element with content
        const content = tempDiv.querySelector("body") || tempDiv;
        const contentHeight = content.scrollHeight;

        // Capture the entire content in one go
        const canvas = await html2canvas(content, {
            scale: 1.5,
            useCORS: true,
            logging: false,
            backgroundColor: "#ffffff",
            width: content.scrollWidth,
            height: contentHeight,
            windowWidth: content.scrollWidth,
            windowHeight: contentHeight,
            allowTaint: true,
        });

        // How many pages do we need?
        const pageHeightInPx = 277 * 3.78 * 1.5; // A4 height in px (with scale)
        const totalPages = Math.ceil(canvas.height / pageHeightInPx);

        // Add each page to the PDF
        for (let i = 0; i < totalPages; i++) {
            // Add new page if not the first page
            if (i > 0) {
                pdf.addPage();
            }

            // Set white background for the page
            pdf.setFillColor(255, 255, 255);
            pdf.rect(0, 0, pdfWidth, pdfHeight, "F");

            // Create a temporary canvas for this page slice
            const tempCanvas = document.createElement("canvas");
            const tempCtx = tempCanvas.getContext("2d");
            tempCanvas.width = canvas.width;
            tempCanvas.height = pageHeightInPx;

            if (tempCtx) {
                // Fill with white background
                tempCtx.fillStyle = "#ffffff";
                tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);

                // Position for this slice
                const sourceY = i * pageHeightInPx;
                const sourceHeight = Math.min(pageHeightInPx, canvas.height - sourceY);

                // Draw portion of original canvas to this temp canvas
                tempCtx.drawImage(
                    canvas,
                    0,
                    sourceY,
                    canvas.width,
                    sourceHeight,
                    0,
                    0,
                    canvas.width,
                    sourceHeight,
                );

                // Get optimized image data for this page
                const pageImgData = optimizeImage(tempCanvas);

                // Add to PDF - keep original dimensions
                pdf.addImage({
                    imageData: pageImgData,
                    format: "JPEG",
                    x: 0,
                    y: 0,
                    width: pdfWidth,
                    height: pdfHeight, // Use full page height
                    compression: "FAST",
                    rotation: 0,
                });
            }
        }

        // Generate the PDF blob
        const pdfOutput = pdf.output("datauristring");
        const pdfBlob = await fetch(pdfOutput).then((res) => res.blob());
        return new Blob([pdfBlob], { type: "application/pdf" });
    } finally {
        // Clean up
        if (document.body.contains(tempDiv)) {
            document.body.removeChild(tempDiv);
        }
    }
};

// Modified optimizeImage function with white background
const optimizeImage = (canvas: HTMLCanvasElement): string => {
    // Create a new canvas with optimal dimensions
    const optimizedCanvas = document.createElement("canvas");
    const ctx = optimizedCanvas.getContext("2d");

    // Set dimensions to A4 at 200 DPI (same as ExportHandler)
    optimizedCanvas.width = 1654;
    optimizedCanvas.height = 2339;

    if (ctx) {
        // Fill with white background first
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, optimizedCanvas.width, optimizedCanvas.height);

        // Enable image smoothing for better quality
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";

        // Draw original canvas onto optimized canvas
        ctx.drawImage(
            canvas,
            0,
            0,
            canvas.width,
            canvas.height,
            0,
            0,
            optimizedCanvas.width,
            optimizedCanvas.height,
        );
    }

    // Convert to compressed JPEG instead of PNG - same as ExportHandler
    return optimizedCanvas.toDataURL("image/jpeg", 0.8);
};

export function convertToSlideFormat(question: UploadQuestionPaperFormType) {
    const questionsData = question.questions[0];
    console.log(questionsData);
    if (!questionsData) return;
    const generateTextBlock = (content: string | null | undefined) => ({
        id: "",
        type: "text",
        content: content || "",
    });

    let options;
    if (questionsData?.questionType === QuestionType.MCQS) {
        options = questionsData?.singleChoiceOptions?.map((opt, idx) => ({
            id: null, // Assuming no direct mapping for option ID
            preview_id: idx, // Using index as preview_id
            question_id: null,
            text: {
                id: null, // Assuming no direct mapping for option text ID
                type: "HTML", // Assuming option content is HTML
                content: opt?.name?.replace(/<\/?p>/g, ""), // Remove <p> tags from content
            },
            explanation_text: {
                id: null, // Assuming no direct mapping for explanation text ID
                type: "HTML", // Assuming explanation for options is in HTML
                content: questionsData.explanation, // Assuming no explanation provided for options
            },
        }));
    } else if (questionsData?.questionType === QuestionType.TRUE_FALSE) {
        options = questionsData?.trueFalseOptions?.map((opt) => ({
            id: opt.id, // Assuming no direct mapping for option ID
            text: {
                id: null, // Assuming no direct mapping for option text ID
                type: "HTML", // Assuming option content is HTML
                content: opt?.name?.replace(/<\/?p>/g, ""), // Remove <p> tags from content
            },
            explanation_text: {
                id: null, // Assuming no direct mapping for explanation text ID
                type: "HTML", // Assuming explanation for options is in HTML
                content: questionsData.explanation, // Assuming no explanation provided for options
            },
        }));
    } else if (questionsData?.questionType === QuestionType.MCQM) {
        options = questionsData?.multipleChoiceOptions?.map((opt) => ({
            id: opt.id, // Assuming no direct mapping for option ID
            text: {
                id: null, // Assuming no direct mapping for option text ID
                type: "HTML", // Assuming option content is HTML
                content: opt?.name?.replace(/<\/?p>/g, ""), // Remove <p> tags from content
            },
            explanation_text: {
                id: null, // Assuming no direct mapping for explanation text ID
                type: "HTML", // Assuming explanation for options is in HTML
                content: questionsData.explanation, // Assuming no explanation provided for options
            },
        }));
    } else if (questionsData?.questionType === QuestionType.CMCQS) {
        options = questionsData?.csingleChoiceOptions?.map((opt) => ({
            id: opt.id, // Assuming no direct mapping for option ID
            text: {
                id: null, // Assuming no direct mapping for option text ID
                type: "HTML", // Assuming option content is HTML
                content: opt?.name?.replace(/<\/?p>/g, ""), // Remove <p> tags from content
            },
            explanation_text: {
                id: null, // Assuming no direct mapping for explanation text ID
                type: "HTML", // Assuming explanation for options is in HTML
                content: questionsData.explanation, // Assuming no explanation provided for options
            },
        }));
    } else if (questionsData?.questionType === QuestionType.CMCQM) {
        options = questionsData?.cmultipleChoiceOptions?.map((opt) => ({
            id: opt.id, // Assuming no direct mapping for option ID
            text: {
                id: null, // Assuming no direct mapping for option text ID
                type: "HTML", // Assuming option content is HTML
                content: opt?.name?.replace(/<\/?p>/g, ""), // Remove <p> tags from content
            },
            explanation_text: {
                id: null, // Assuming no direct mapping for explanation text ID
                type: "HTML", // Assuming explanation for options is in HTML
                content: questionsData.explanation, // Assuming no explanation provided for options
            },
        }));
    }

    // Extract correct option indices as strings
    let correctOptionIds;

    if (questionsData?.questionType === QuestionType.MCQS) {
        correctOptionIds = questionsData?.singleChoiceOptions
            ?.map((opt, idx) => (opt.isSelected ? (opt.id ? opt.id : idx.toString()) : null))
            .filter((idx) => idx !== null); // Remove null values
    } else if (questionsData?.questionType === QuestionType.MCQM) {
        correctOptionIds = questionsData?.multipleChoiceOptions
            ?.map((opt, idx) => (opt.isSelected ? (opt.id ? opt.id : idx.toString()) : null))
            .filter((idx) => idx !== null); // Remove null values
    } else if (questionsData?.questionType === QuestionType.CMCQS) {
        correctOptionIds = questionsData?.csingleChoiceOptions
            ?.map((opt, idx) => (opt.isSelected ? (opt.id ? opt.id : idx.toString()) : null))
            .filter((idx) => idx !== null); // Remove null values
    } else if (questionsData?.questionType === QuestionType.CMCQM) {
        correctOptionIds = questionsData?.cmultipleChoiceOptions
            ?.map((opt, idx) => (opt.isSelected ? (opt.id ? opt.id : idx.toString()) : null))
            .filter((idx) => idx !== null); // Remove null values
    } else if (questionsData?.questionType === QuestionType.TRUE_FALSE) {
        correctOptionIds = questionsData?.trueFalseOptions
            ?.map((opt, idx) => (opt.isSelected ? (opt.id ? opt.id : idx.toString()) : null))
            .filter((idx) => idx !== null); // Remove null values
    }

    const auto_evaluation_json = getEvaluationJSON(
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        questionsData!,
        correctOptionIds,
        questionsData?.validAnswers,
        questionsData?.subjectiveAnswerText,
    );

    return {
        id: crypto.randomUUID(),
        source_id: "",
        source_type: "QUESTION",
        title: "",
        image_file_id: "",
        description: "",
        status: "DRAFT",
        slide_order: 0,
        video_slide: {
            id: "",
            description: "",
            title: "",
            url: "",
            video_length_in_millis: 0,
            published_url: "",
            published_video_length_in_millis: 0,
            source_type: "",
        },
        document_slide: {
            id: "",
            type: "",
            data: "",
            title: "",
            cover_file_id: "",
            total_pages: 0,
            published_data: "",
            published_document_total_pages: 0,
        },
        question_slide: {
            id: crypto.randomUUID(),
            parent_rich_text: generateTextBlock(questionsData?.parentRichTextContent),
            text_data: generateTextBlock(questionsData?.questionName),
            explanation_text_data: generateTextBlock(questionsData?.explanation),
            media_id: "",
            question_response_type: "OPTION",
            question_type: questionsData?.questionType,
            access_level: "",
            auto_evaluation_json: auto_evaluation_json,
            evaluation_type: "AUTO",
            default_question_time_mins: parseInt(questionsData?.questionDuration?.min || "0"),
            re_attempt_count: questionsData?.reattemptCount || "",
            points: questionsData.questionPoints || "",
            options: options?.map((opt) => ({
                id: opt.id,
                questionSlideId: "",
                text: generateTextBlock(opt.text.content),
                explanationTextData: generateTextBlock(opt.explanation_text.content),
                mediaId: "",
            })),
        },
        assignment_slide: {
            id: "",
            parentRichText: {
                id: "",
                type: "",
                content: "",
            },
            textData: {
                id: "",
                type: "",
                content: "",
            },
            liveDate: "",
            endDate: "",
            reAttemptCount: 0,
            commaSeparatedMediaIds: "",
        },
        is_loaded: true,
        new_slide: true,
    };
}
