"use client";

import { useEffect, useState } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { useRouter } from "@tanstack/react-router";
import { ArrowUpDown, FileText, Loader2 } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";
import { GET_PUBLIC_URL } from "@/constants/urls";

// Default token for authorization
const DEFAULT_ACCESS_TOKEN =
    "eyJhbGciOiJIUzI1NiJ9.eyJmdWxsbmFtZSI6IkRvZSBXYWxrZXIiLCJ1c2VyIjoiOTE3YjI1YWMtZjZhZi00ZjM5LTkwZGYtYmQxZDIxZTQyNTkzIiwiZW1haWwiOiJkb2VAZXhhbXBsZS5jb20iLCJpc19yb290X3VzZXIiOmZhbHNlLCJhdXRob3JpdGllcyI6eyI5ZDNmNGNjYi1hN2Y2LTQyM2YtYmM0Zi03NWM2ZDYxNzYzNDYiOnsicGVybWlzc2lvbnMiOltdLCJyb2xlcyI6WyJTVFVERU5UIl19fSwidXNlcm5hbWUiOiJkb2V3NjA2OSIsInN1YiI6ImRvZXc2MDY5IiwiaWF0IjoxNzQ1MzI2ODI2LCJleHAiOjE3NDU5MzE2MjZ9._O0T3Q0kxXLE9JnwC79IQCpwl-sAdFqR8nHa3MTpE5U";

// Helper function to get public URL
const getPublicUrl = async (fileId: string | undefined | null): Promise<string> => {
    const response = await axios.get(GET_PUBLIC_URL, {
        params: { fileId, expiryDays: 1 },
        headers: {
            Authorization: `Bearer ${DEFAULT_ACCESS_TOKEN}`,
        },
    });
    return response?.data;
};

interface Student {
    id: string;
    name: string;
    enrollmentId: string;
    assessment: string | null;
    status: "completed" | "pending";
    marks: string;
}

interface EnrolledStudent {
    name: string;
    enrollId: string;
    pdfId: string;
    fileId?: string;
}

export default function StudentEvaluationTable({ data }: { data: Student[] }) {
    const router = useRouter();
    const [enrolledStudents, setEnrolledStudents] = useState<EnrolledStudent[]>([]);
    const [loadingPdf, setLoadingPdf] = useState<Record<string, boolean>>({});

    // Load enrolled students from localStorage
    useEffect(() => {
        const savedStudents = JSON.parse(localStorage.getItem("students") || "[]");
        setEnrolledStudents(savedStudents);
    }, []);

    // Find fileId by matching enrollmentId with enrollId
    const findFileIdByEnrollmentId = (enrollmentId: string): string | undefined => {
        const matchedStudent = enrolledStudents.find(
            (student) => student.enrollId === enrollmentId,
        );
        return matchedStudent?.fileId;
    };

    // Handle preview PDF
    const handlePreviewPdf = async (enrollmentId: string) => {
        const fileId = findFileIdByEnrollmentId(enrollmentId);

        if (!fileId) {
            toast.error("No PDF submission found for this student");
            return;
        }

        try {
            setLoadingPdf((prev) => ({ ...prev, [enrollmentId]: true }));
            const url = await getPublicUrl(fileId);

            if (url) {
                // Open in new tab
                window.open(url, "_blank");
            } else {
                toast.error("Could not retrieve PDF URL");
            }
        } catch (error) {
            console.error("Error fetching PDF URL:", error);
            toast.error("Failed to retrieve PDF");
        } finally {
            setLoadingPdf((prev) => ({ ...prev, [enrollmentId]: false }));
        }
    };

    return (
        <div className="container mx-auto py-6">
            <div className="overflow-hidden rounded-md border">
                <Table>
                    <TableHeader className="bg-[#f9f7f0]">
                        <TableRow>
                            <TableHead>
                                <div className="flex items-center gap-1">
                                    Student Name
                                    <ArrowUpDown className="size-4" />
                                </div>
                            </TableHead>
                            <TableHead>Enrollment ID</TableHead>
                            <TableHead>Preview Submission</TableHead>
                            <TableHead>Evaluation Status</TableHead>
                            <TableHead>Marks</TableHead>
                            <TableHead className="w-24">Details</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {data.map((student) => {
                            const fileId = findFileIdByEnrollmentId(student.enrollmentId);
                            const hasSubmission = !!fileId;

                            return (
                                <TableRow key={student.id} className="hover:bg-muted/30">
                                    <TableCell>{student.name}</TableCell>
                                    <TableCell>{student.enrollmentId}</TableCell>
                                    <TableCell>
                                        {loadingPdf[student.enrollmentId] ? (
                                            <div className="flex items-center gap-1 text-orange-500">
                                                <Loader2 className="size-3.5 animate-spin" />
                                                <span>Loading...</span>
                                            </div>
                                        ) : hasSubmission ? (
                                            <div
                                                className="flex cursor-pointer items-center gap-1 text-orange-500 hover:underline"
                                                onClick={() =>
                                                    handlePreviewPdf(student.enrollmentId)
                                                }
                                            >
                                                <FileText className="size-3.5" />
                                                <span>Preview</span>
                                            </div>
                                        ) : (
                                            <span className="text-muted-foreground">
                                                No submission
                                            </span>
                                        )}
                                    </TableCell>

                                    <TableCell>
                                        {student.status === "completed" ? (
                                            <div className="flex items-center gap-1.5">
                                                <span className="size-2.5 rounded-full bg-green-500"></span>
                                                <span>Completed</span>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-1.5">
                                                <span className="size-2.5 rounded-full bg-amber-500"></span>
                                                <span>Pending</span>
                                            </div>
                                        )}
                                    </TableCell>
                                    <TableCell>{student.marks}</TableCell>

                                    <TableCell className="">
                                        <div
                                            onClick={() => {
                                                router.navigate({
                                                    to: `/evaluator-ai/evaluation/student-summary?studentId=${student.id}`,
                                                });
                                            }}
                                        >
                                            <span className="cursor-pointer text-orange-500 hover:underline">
                                                Details
                                            </span>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
