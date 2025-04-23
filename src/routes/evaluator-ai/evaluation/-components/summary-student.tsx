import { Button } from "@/components/ui/button";
import { useSearch } from "@tanstack/react-router";
import { usePDF } from "react-to-pdf";
import useLocalStorage from "../../-hooks/useLocalStorage";
import { useEffect, useState } from "react";

interface ISummary {
    overall_description: string;
    overall_verdict: string;
    total_marks: number;
    total_marks_obtained: number;
    user_id: string;
    name: string;
    section_wise_results: {
        question_wise_results: {
            description: string;
            feedback: string;
            total_marks: number;
            marks_obtained: number;
            question_order: number;
            question_text: string;
            question_id: string;
        }[];
    }[];
}
interface IEvaluationData {
    assessment: string;
    enrollmentId: string;
    id: string;
    marks: string;
    name: string;
    status: string;
    summary: ISummary;
}
export default function EvaluationSummary() {
    const { toPDF, targetRef } = usePDF({ filename: "report.pdf" });
    const [studentSummary, setSummaryData] = useState<IEvaluationData>();
    const { studentId } = useSearch({ from: "/evaluator-ai/evaluation/student-summary/" }) as {
        studentId: number;
    };
    const [evaluationData] = useLocalStorage("evaluatedStudentData", []) as [IEvaluationData[]];

    useEffect(() => {
        const studentData = evaluationData.find(
            (data) => data.enrollmentId === studentId.toString(),
        );
        setSummaryData(studentData);
    }, []);
    return (
        <div className="mx-auto w-[95vw] space-y-6 bg-white p-4" ref={targetRef}>
            {/* Header */}
            <div className="flex items-center justify-between">
                <h1 className="text-base font-bold text-gray-800">Evaluation Summary</h1>
                <Button
                    variant={"outline"}
                    onClick={() => {
                        toPDF();
                    }}
                >
                    Export Report
                </Button>
            </div>

            {/* Student Information */}
            <div className="rounded-md border border-[#e6e3d8]">
                <div className="rounded-t-md border-b border-[#e6e3d8] bg-[#faf9f5] px-4 py-2">
                    <h2 className="text-sm font-medium text-gray-700">Student Information</h2>
                </div>
            </div>

            <div className="-mt-4 flex flex-wrap justify-between px-1 text-sm">
                <div className="flex gap-2">
                    <span className="text-gray-600">Student Name:</span>
                    <span>{studentSummary?.name}</span>
                </div>
                <div className="flex gap-2">
                    <span className="text-gray-600">Student ID:</span>
                    <span>{studentSummary?.id}</span>
                </div>
                <div className="flex gap-2">
                    <span className="text-gray-600">Submission Document:</span>
                    <span className="text-orange-500">Preview</span>
                </div>
            </div>

            {/* Evaluation Summary */}
            <h2 className="mt-8 text-base font-bold text-gray-800">Evaluation Summary</h2>

            {/* Evaluation Details */}
            <div className="rounded-md border border-[#e6e3d8]">
                <div className="rounded-t-md border-b border-[#e6e3d8] bg-[#faf9f5] px-4 py-2">
                    <h3 className="text-sm font-medium text-gray-700">Evaluation Details</h3>
                </div>
            </div>

            <div className="-mt-4 space-y-4 px-1">
                <div className="flex flex-wrap gap-2 text-sm">
                    <span className="text-gray-600">Assessment:</span>
                    <span>{studentSummary?.assessment}</span>
                </div>

                <div className="flex flex-wrap items-start gap-2 text-sm">
                    <span className="w-16 text-gray-600">Summary:</span>
                    <span className="flex-1">{studentSummary?.summary.overall_description}</span>
                </div>
            </div>

            <div className="absolute right-8 mt-[-100px]">
                <div className="text-xs text-gray-600">Total Marks:</div>
                <div className="text-center text-2xl font-bold text-orange-500">
                    {studentSummary?.marks}
                </div>
            </div>

            {/* Performance Breakdown */}
            <div className="mt-8 flex items-center justify-between">
                <h2 className="text-base font-bold text-gray-800">Performance Breakdown</h2>
            </div>

            {/* Question-wise Marking */}
            <div className="rounded-md border border-[#e6e3d8]">
                <div className="rounded-t-md border-b border-[#e6e3d8] bg-[#faf9f5] px-4 py-2">
                    <h3 className="text-sm font-medium text-gray-700">Question-wise Marking</h3>
                </div>
            </div>

            <div className="-mt-4 overflow-x-auto">
                <table className="w-full border-collapse text-sm">
                    <thead>
                        <tr className="bg-[#f8f4e8]">
                            <th className="border border-[#e6e3d8] p-2 text-left font-medium">
                                Q No.
                            </th>
                            <th className="border border-[#e6e3d8] p-2 text-left font-medium">
                                Question
                            </th>
                            <th className="border border-[#e6e3d8] p-2 text-left font-medium">
                                Marks
                            </th>
                            <th className="border border-[#e6e3d8] p-2 text-left font-medium">
                                Feedback
                            </th>
                            <th className="border border-[#e6e3d8] p-2 text-left font-medium">
                                Description
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {studentSummary?.summary.section_wise_results[0]?.question_wise_results.map(
                            (question) => (
                                <tr className="bg-[#faf9f5]" key={question.question_id}>
                                    <td className="border border-[#e6e3d8] p-2">
                                        {question.question_order}
                                        {")"}
                                    </td>
                                    <td
                                        className="border border-[#e6e3d8] p-2"
                                        dangerouslySetInnerHTML={{
                                            __html: question.question_text || "",
                                        }}
                                    />

                                    <td className="border border-[#e6e3d8] p-2">
                                        {question.marks_obtained}
                                        {"/"}
                                        {question.total_marks}
                                    </td>
                                    <td className="w-72 border border-[#e6e3d8] p-2">
                                        {question.feedback}
                                    </td>
                                    <td className="w-72 border border-[#e6e3d8] p-2">
                                        {question.description}
                                    </td>
                                </tr>
                            ),
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
