"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

interface Question {
    questionNo: number;
    scoredMarks: string;
    maxMarks: number;
}

interface EvaluationData {
    totalMarks: number;
    scoredMarks: number;
    questions: Question[];
    totalPages: number;
    pagesVisited: number[];
    pagesNotVisited: number[];
}

interface EvaluationProps {
    totalPages: number;
    pagesVisited: number[];
}

export default function Evaluation({ totalPages, pagesVisited }: EvaluationProps) {
    const [data, setData] = useState<EvaluationData>({
        totalMarks: 30,
        scoredMarks: 0,
        questions: [
            { questionNo: 1, scoredMarks: "", maxMarks: 4 },
            { questionNo: 2, scoredMarks: "", maxMarks: 2 },
            { questionNo: 3, scoredMarks: "", maxMarks: 2 },
            { questionNo: 4, scoredMarks: "", maxMarks: 4 },
            { questionNo: 5, scoredMarks: "", maxMarks: 2 },
            { questionNo: 6, scoredMarks: "", maxMarks: 2 },
            { questionNo: 7, scoredMarks: "", maxMarks: 4 },
            { questionNo: 8, scoredMarks: "", maxMarks: 2 },
            { questionNo: 9, scoredMarks: "", maxMarks: 4 },
            { questionNo: 10, scoredMarks: "", maxMarks: 4 },
        ],
        totalPages: totalPages,
        pagesVisited: pagesVisited,
        pagesNotVisited: Array.from({ length: totalPages }, (_, i) => i + 1).filter(
            (page) => !pagesVisited.includes(page),
        ),
    });

    const [timer, setTimer] = useState({ hours: 0, minutes: 0, seconds: 0 });

    useEffect(() => {
        const interval = setInterval(() => {
            setTimer((prevTimer) => {
                const newSeconds = prevTimer.seconds + 1;
                const newMinutes = prevTimer.minutes + Math.floor(newSeconds / 60);
                const newHours = prevTimer.hours + Math.floor(newMinutes / 60);
                return {
                    hours: newHours,
                    minutes: newMinutes % 60,
                    seconds: newSeconds % 60,
                };
            });
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    const handleScoreChange = useCallback((questionNo: number, value: string) => {
        setData((prevData) => {
            const newQuestions = prevData.questions.map((q) =>
                q.questionNo === questionNo ? { ...q, scoredMarks: value } : q,
            );
            const newScoredMarks = newQuestions.reduce(
                (sum, q) => sum + (Number.parseFloat(q.scoredMarks) || 0),
                0,
            );
            return { ...prevData, questions: newQuestions, scoredMarks: newScoredMarks };
        });
    }, []);

    return (
        <Card className="mx-auto w-full max-w-md">
            <CardHeader className="space-y-1">
                <div className="flex items-center justify-between rounded-lg bg-muted/50 px-4 py-2">
                    <div className="text-center">
                        <div className="text-sm text-muted-foreground">Scored Marks</div>
                        <div className="font-bold text-primary-300">
                            {data.scoredMarks.toFixed(1)}
                        </div>
                    </div>
                    <div className="text-center">
                        <div className="text-sm text-muted-foreground">Total Marks</div>
                        <div className="font-bold">{data.totalMarks}</div>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-6">
                <ScrollArea className="h-[400px] rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-24">Question No</TableHead>
                                <TableHead className="text-center">Scored Marks</TableHead>
                                <TableHead className="text-center">Max Marks</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {data.questions.map((question) => (
                                <TableRow key={question.questionNo}>
                                    <TableCell className="font-medium">
                                        {question.questionNo}
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <Input
                                            type="number"
                                            value={question.scoredMarks}
                                            onChange={(e) =>
                                                handleScoreChange(
                                                    question.questionNo,
                                                    e.target.value,
                                                )
                                            }
                                            className="mx-auto w-fit p-0.5 text-center"
                                            min="0"
                                            max={question.maxMarks}
                                            step="0.5"
                                        />
                                    </TableCell>
                                    <TableCell className="text-center">
                                        {question.maxMarks}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </ScrollArea>

                <Separator />

                <div className="space-y-4 rounded-md border p-2">
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Total Pages</span>
                        <span className="font-medium">{data.totalPages}</span>
                    </div>

                    <div className="space-y-2">
                        <div className="text-sm text-muted-foreground">Pages visited</div>
                        <div className="rounded bg-muted/50 p-2 text-sm">
                            {data.pagesVisited.join(", ")}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="text-sm text-muted-foreground">Pages not visited</div>
                        <div className="rounded bg-muted/50 p-2 text-sm">
                            {data.pagesNotVisited.join(", ")}
                        </div>
                    </div>
                </div>

                <Separator />

                <div className="space-y-2 rounded-md border p-2">
                    <div className="text-sm text-muted-foreground">Time taken for Evaluation</div>
                    <div className="flex items-center justify-center gap-2 font-mono">
                        <div className="rounded-md border px-2 py-1">
                            {timer.hours.toString().padStart(2, "0")}
                        </div>
                        <span>:</span>
                        <div className="rounded-md border px-2 py-1">
                            {timer.minutes.toString().padStart(2, "0")}
                        </div>
                        <span>:</span>
                        <div className="rounded-md border px-2 py-1">
                            {timer.seconds.toString().padStart(2, "0")}
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
