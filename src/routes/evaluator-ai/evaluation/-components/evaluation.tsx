/* eslint-disable */
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { StudentSelectionDialog } from "./select-students";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { UserX } from "lucide-react";
import StudentEvaluationTable from "./student-evaulation";
import { toast } from "sonner";
import { useLoaderStore } from "../-hooks/loader";
import { type StudentData } from "./select-students";
import { EVALUATION_TOOL_EVALUATE_ASSESSMENT, EVALUATION_TOOL_STATUS } from "@/constants/urls";
import { parseEvaluationResults, transformEvaluationData } from "../-utils/utils";
import axios from "axios";
import { MyButton } from "@/components/design-system/button";
import { FileMagnifyingGlass } from "@phosphor-icons/react";

const evaluatedStudentData = JSON.parse(localStorage.getItem("evaluatedStudentData") || "[]");
const studentData = JSON.parse(localStorage.getItem("students") || "[]");
const assessments = JSON.parse(localStorage.getItem("assessments") || "[]");

interface OutputData {
    id: string;
    response_id: string;
    full_name: string;
    email: string;
    contact_number: string;
}

interface TaskResponse {
    task_id: string;
    response: string;
    status: string;
}

const ShimmerLoadingTable = () => {
    return (
        <div className="flex w-full flex-col gap-4">
            <div className="text-base font-bold">Please wait we are Evaluating students...</div>
            <div className="w-full overflow-x-auto">
                <table className="min-w-full rounded-md border border-muted">
                    <thead>
                        <tr className="bg-muted/30">
                            <th className="p-3 text-left">
                                <div className="shimmer h-4 w-24 animate-pulse rounded bg-muted"></div>
                            </th>
                            <th className="p-3 text-left">
                                <div className="shimmer h-4 w-32 animate-pulse rounded bg-muted"></div>
                            </th>
                            <th className="p-3 text-left">
                                <div className="shimmer h-4 w-20 animate-pulse rounded bg-muted"></div>
                            </th>
                            <th className="p-3 text-left">
                                <div className="shimmer h-4 w-16 animate-pulse rounded bg-muted"></div>
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {[1, 2, 3, 4, 5].map((row) => (
                            <tr key={row} className="border-t border-muted">
                                <td className="p-4">
                                    <div className="shimmer h-4 w-28 animate-pulse rounded bg-muted"></div>
                                </td>
                                <td className="p-4">
                                    <div className="shimmer h-4 w-36 animate-pulse rounded bg-muted"></div>
                                </td>
                                <td className="p-4">
                                    <div className="shimmer h-4 w-20 animate-pulse rounded bg-muted"></div>
                                </td>
                                <td className="p-4">
                                    <div className="shimmer h-8 w-16 animate-pulse rounded bg-muted"></div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export const EvaluatedStudents = () => {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [evaluatedData, setEvaluatedData] = useState(evaluatedStudentData);

    const { isLoading, setLoading } = useLoaderStore();

    function transformStudentData(studentDataArray: StudentData[]): OutputData[] {
        return studentDataArray.map((student) => ({
            id: student.enrollId, // Assuming enrollId maps to id
            response_id: student.pdfId, // Assuming pdfId maps to response_id
            full_name: student.name, // name maps to full_name
            email: "", // Default empty string for email
            contact_number: "", // Default empty string for contact number
        }));
    }

    const handleStudentSubmit = async (students: StudentData[], selectedAssessment: string) => {
        try {
            setLoading(true);
            const data = transformStudentData(students);

            // First API call to start evaluation
            const evaluateResponse = await axios<TaskResponse>({
                method: "POST",
                url: EVALUATION_TOOL_EVALUATE_ASSESSMENT,
                data: data,
                params: {
                    assessmentId: selectedAssessment,
                },
            });

            if (evaluateResponse.status !== 200) {
                throw new Error("Failed to initiate evaluation");
            }

            const taskId = evaluateResponse.data.task_id;

            // Polling function
            const pollStatus = async (): Promise<TaskResponse> => {
                while (true) {
                    try {
                        const statusResponse = await axios<TaskResponse>({
                            method: "GET",
                            url: `${EVALUATION_TOOL_STATUS}/${taskId}`,
                            data: null,
                        });
                        // Check if task is completed
                        if (
                            statusResponse.data.status === "COMPLETED" ||
                            statusResponse.data.status === "FAILED"
                        ) {
                            return statusResponse.data;
                        }
                    } catch (error) {
                        console.error("Polling error:", error);
                    }
                    await new Promise((resolve) => setTimeout(resolve, 10000));
                }
            };
            const finalStatus = await pollStatus();

            if (finalStatus.status === "COMPLETED") {
                const parsedResults = parseEvaluationResults(finalStatus);
                const students = transformEvaluationData(parsedResults);
                localStorage.setItem("evaluatedStudentData", JSON.stringify(students));
                setEvaluatedData(students);

                toast.success(`Successfully evaluated ${students.length} students`);
            } else {
                toast.error(`Evaluation failed for ${selectedAssessment}`);
            }
        } catch (error) {
            console.error("Evaluation error:", error);
            toast.error("Failed to evaluate students");
        } finally {
            setLoading(false);
        }
    };
    return (
        <main className="flex min-h-screen flex-col items-center">
            <div className="flex w-full justify-between gap-4">
                <h1 className="mb-8 items-center text-xl font-bold">Evaluated Student List</h1>

                <MyButton
                    scale="large"
                    buttonType="primary"
                    layoutVariant="default"
                    className="ml-auto"
                    onClick={() => {
                        setIsDialogOpen(true);
                    }}
                >
                    <FileMagnifyingGlass size={32} />
                    Evaluate Students
                </MyButton>
            </div>
            {!isLoading && evaluatedData.length > 0 && (
                <StudentEvaluationTable data={evaluatedData} />
            )}

            {isLoading && <ShimmerLoadingTable />}

            {!isLoading && evaluatedData.length == 0 && (
                <Card className="mt-8 w-[75vw] border-2 border-dashed bg-muted/30">
                    <CardHeader className="flex flex-row items-center justify-center pb-2">
                        <UserX className="size-12 text-muted-foreground opacity-50" />
                    </CardHeader>
                    <CardContent className="flex flex-col items-center justify-center pb-6 text-center">
                        <CardTitle className="mb-2 mt-4 text-xl font-medium">
                            No Evaluated Students
                        </CardTitle>
                        <CardDescription className="max-w-md">
                            You haven&apos;t evaluated any students yet. Click the "Evaluate
                            Student" button to select students for evaluation.
                        </CardDescription>
                    </CardContent>
                    <CardFooter className="flex justify-center pb-6">
                        <MyButton
                            scale="large"
                            buttonType="primary"
                            layoutVariant="default"
                            className="ml-auto"
                            onClick={() => {
                                setIsDialogOpen(true);
                            }}
                        >
                            <FileMagnifyingGlass size={32} />
                            Evaluate Students
                        </MyButton>
                    </CardFooter>
                </Card>
            )}

            <StudentSelectionDialog
                isOpen={isDialogOpen}
                onOpenChange={setIsDialogOpen}
                // @ts-expect-error : //FIXME this error
                onSubmit={handleStudentSubmit}
                title="Select Students for Assignment"
            />
        </main>
    );
};
