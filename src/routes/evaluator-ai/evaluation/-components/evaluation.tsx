
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { StudentSelectionDialog } from "./select-students";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { UserX } from "lucide-react"
import StudentEvaluationTable from "./student-evaulation";
import { toast } from "sonner";
import { useLoaderStore } from "../-hooks/loader";
import { type StudentData } from "./select-students";
import authenticatedAxiosInstance from "@/lib/auth/axiosInstance";
import { EVALUATION_TOOL_EVALUATE_ASSESSMENT, EVALUATION_TOOL_STATUS } from "@/constants/urls";
import { parseEvaluationResults ,transformEvaluationData } from "../-utils/utils";
import axios from "axios";

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
        <div className="flex flex-col gap-4 w-full">
            <div className="text-base font-bold">Please wait we are Evaluating students...</div>
            <div className="w-full overflow-x-auto">
                <table className="min-w-full border border-muted rounded-md">
                    <thead>
                        <tr className="bg-muted/30">
                            <th className="p-3 text-left">
                                <div className="h-4 w-24 bg-muted rounded animate-pulse shimmer"></div>
                            </th>
                            <th className="p-3 text-left">
                                <div className="h-4 w-32 bg-muted rounded animate-pulse shimmer"></div>
                            </th>
                            <th className="p-3 text-left">
                                <div className="h-4 w-20 bg-muted rounded animate-pulse shimmer"></div>
                            </th>
                            <th className="p-3 text-left">
                                <div className="h-4 w-16 bg-muted rounded animate-pulse shimmer"></div>
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {[1, 2, 3, 4, 5].map((row) => (
                            <tr key={row} className="border-t border-muted">
                                <td className="p-4">
                                    <div className="h-4 w-28 bg-muted rounded animate-pulse shimmer"></div>
                                </td>
                                <td className="p-4">
                                    <div className="h-4 w-36 bg-muted rounded animate-pulse shimmer"></div>
                                </td>
                                <td className="p-4">
                                    <div className="h-4 w-20 bg-muted rounded animate-pulse shimmer"></div>
                                </td>
                                <td className="p-4">
                                    <div className="h-8 w-16 bg-muted rounded animate-pulse shimmer"></div>
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
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const[evaluatedData , setEvaluatedData] = useState(evaluatedStudentData)

    const { isLoading, setLoading } = useLoaderStore();

    function transformStudentData(studentDataArray: StudentData[]): OutputData[] {
        return studentDataArray.map(student => ({
            id: student.enrollId, // Assuming enrollId maps to id
            response_id: student.pdfId, // Assuming pdfId maps to response_id
            full_name: student.name, // name maps to full_name
            email: "", // Default empty string for email
            contact_number: "" // Default empty string for contact number
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
                    assessmentId: selectedAssessment
                }
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
                        if (statusResponse.data.status === "COMPLETED" ||
                            statusResponse.data.status === "FAILED") {
                            return statusResponse.data;
                        }
                    } catch (error) {
                        console.error("Polling error:", error);
                    }
                    await new Promise(resolve => setTimeout(resolve, 10000));
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
            <div className="flex justify-between gap-4 w-full">
                <h1 className="mb-8 text-xl font-bold items-center">Evaluated Student List</h1>
                <Button variant={"destructive"} onClick={() => { setIsDialogOpen(true) }}>Evaluat Student</Button>
            </div>
            {(!isLoading && evaluatedData.length > 0) && <StudentEvaluationTable data={evaluatedData} />}


            {isLoading && <ShimmerLoadingTable />}
          
            {!isLoading && evaluatedData.length == 0 && <Card className="border-dashed border-2 bg-muted/30 w-[75vw] mt-8">
                <CardHeader className="flex flex-row items-center justify-center pb-2">
                    <UserX className="h-12 w-12 text-muted-foreground opacity-50" />
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center text-center pb-6">
                    <CardTitle className="text-xl font-medium mt-4 mb-2">No Evaluated Students</CardTitle>
                    <CardDescription className="max-w-md">
                        You haven't evaluated any students yet. Click the "Evaluate Student" button to select students for
                        evaluation.
                    </CardDescription>
                </CardContent>
                <CardFooter className="flex justify-center pb-6">
                    <Button variant={"destructive"} onClick={() => { setIsDialogOpen(true) }}>Evaluat Student</Button>
                </CardFooter>
            </Card>}

     
            <StudentSelectionDialog
                isOpen={isDialogOpen}
                onOpenChange={setIsDialogOpen}
                onSubmit={handleStudentSubmit}
                students={studentData}
                assessments={assessments}
                title="Select Students for Assignment"
            />
        </main>
    );
};


