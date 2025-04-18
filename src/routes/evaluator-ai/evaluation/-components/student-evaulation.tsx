"use client";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { FaExternalLinkAlt } from "react-icons/fa";
import { useRouter } from "@tanstack/react-router";
import { ArrowUpDown } from "lucide-react";

interface Student {
    id: string;
    name: string;
    enrollmentId: string;
    assessment: string | null;
    status: "completed" | "pending";
    marks: string;
}

export default function StudentEvaluationTable({ data }: { data: Student[] }) {
    const router = useRouter();

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
                        {data.map((student) => (
                            <TableRow key={student.id} className="hover:bg-muted/30">
                                <TableCell>{student.name}</TableCell>
                                <TableCell>{student.enrollmentId}</TableCell>
                                <TableCell>
                                    <span className="cursor-pointer text-orange-500 hover:underline">
                                        Preview
                                    </span>
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

                                <TableCell className="ml-8">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="size-8"
                                        onClick={() => {
                                            router.navigate({
                                                to: `/evaluator-ai/evaluation/student-summary?studentId=${student.id}`,
                                            });
                                        }}
                                    >
                                        <FaExternalLinkAlt className="size-4 cursor-pointer text-primary-300" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
