import { AIAssessmentCompleteQuestion } from "@/types/ai/generate-assessment/generate-complete-assessment";
import { MyQuestion } from "@/types/assessments/question-paper-form";

export const transformQuestionsToGenerateAssessmentAI = (
    data: AIAssessmentCompleteQuestion[] | undefined,
) => {
    return data?.map((item) => {
        const correctOptionIds =
            JSON.parse(item.auto_evaluation_json)?.data?.correctOptionIds || [];
        const baseQuestion: MyQuestion = {
            id: item.id || "",
            questionId: item.id || item.preview_id || undefined,
            questionName: convertSVGsToBase64(item.text?.content) || "",
            explanation: convertSVGsToBase64(item.explanation_text?.content) || "",
            questionType: item.question_type === "MCQS" ? "MCQS" : "MCQM",
            questionMark: "0",
            questionPenalty: "0",
            questionDuration: {
                hrs: String(Math.floor((item.default_question_time_mins ?? 0) / 60)), // Extract hours
                min: String((item.default_question_time_mins ?? 0) % 60), // Extract remaining minutes
            },
            singleChoiceOptions: [],
            multipleChoiceOptions: [],
        };

        if (item.question_type === "MCQS") {
            baseQuestion.singleChoiceOptions = item.options.map((option) => ({
                name: convertSVGsToBase64(option.text?.content) || "",
                isSelected: correctOptionIds.includes(option.id || option.preview_id),
            }));
            baseQuestion.multipleChoiceOptions = Array(4).fill({
                name: "",
                isSelected: false,
            });
        } else if (item.question_type === "MCQM") {
            baseQuestion.multipleChoiceOptions = item.options.map((option) => ({
                name: convertSVGsToBase64(option.text?.content) || "",
                isSelected: correctOptionIds.includes(option.id || option.preview_id),
            }));
            baseQuestion.singleChoiceOptions = Array(4).fill({
                name: "",
                isSelected: false,
            });
        }
        return baseQuestion;
    });
};

export function convertSVGsToBase64(htmlString: string) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlString, "text/html");

    const svgElements = doc.querySelectorAll("svg");

    svgElements.forEach((svg) => {
        const svgClone = svg.cloneNode(true);

        // Serialize the SVG element to a string
        const svgString = new XMLSerializer().serializeToString(svgClone);

        // Encode as Base64
        const base64 = btoa(unescape(encodeURIComponent(svgString)));
        const dataUrl = `data:image/svg+xml;base64,${base64}`;

        // Create an <img> element with the data URL
        const img = document.createElement("img");
        img.src = dataUrl;
        img.alt = "Converted SVG";

        // Replace the <svg> element with the <img> tag
        svg.replaceWith(img);
    });

    return doc.body.innerHTML;
}
