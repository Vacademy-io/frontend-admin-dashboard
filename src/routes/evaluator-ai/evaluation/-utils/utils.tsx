interface QuestionResult {
    question_id: string;
    question_order: number;
    marks_obtained: number;
    total_marks: number;
    feedback: string;
    verdict: string;
}

interface SectionResult {
    section_id: string;
    section_name: string;
    marks_obtained: number;
    total_marks: number;
    verdict: string;
    question_wise_results: QuestionResult[];
}

export interface EvaluationResult {
    user_id: string;
    name: string;
    email: string;
    contact_number: string;
    total_marks_obtained: number;
    total_marks: number;
    overall_verdict: string;
    section_wise_results: SectionResult[];
}

export interface ApiResponse {
    task_id: string;
    response: string; // JSON string
    status: string;
}

export interface Student {
    id: string;
    name: string;
    enrollmentId: string;
    assessment: string | null;
    status: "completed" | "pending";
    marks: string;
}

export function parseEvaluationResults(data: ApiResponse): EvaluationResult[] {
    try {
        const cleaned = data.response
            .replace(/^```json\s*/i, "") // remove starting ```json
            .replace(/```$/, "") // remove ending ```
            .trim();
        const parsed = JSON.parse(cleaned);
        return parsed.evaluation_results as EvaluationResult[];
    } catch (error) {
        console.error("Failed to parse evaluation results:", error);
        return [];
    }
}

export function transformEvaluationData(evaluationResults: EvaluationResult[]): Student[] {
    if (!evaluationResults) return [];
    // @ts-expect-error : //FIXME this error
    return evaluationResults.map((result, index) => {
        const assessment =
            result.section_wise_results.length > 0
                ? result.section_wise_results[0]?.section_name
                : null;

        return {
            id: result.user_id || `temp-${index + 1}`,
            name: result.name || "Unknown Student",
            enrollmentId: result.user_id || `enroll-${index + 1}`,
            assessment: assessment,
            status: "completed",
            marks: `${result.total_marks_obtained}/${result.total_marks}`,
        };
    });
}
