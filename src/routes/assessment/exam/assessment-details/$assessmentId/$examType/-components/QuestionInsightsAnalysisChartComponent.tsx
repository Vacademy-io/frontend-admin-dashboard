import { Pie, PieChart } from "recharts";
import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart";

import { QuestionInsights } from "@/types/assessments/question-insights-type";

const chartConfig = {
    correct: {
        label: "Correct",
        color: "hsl(var(--chart-1))",
    },
    partiallyCorrect: {
        label: "Partially Correct",
        color: "hsl(var(--chart-2))",
    },
    wrongResponse: {
        label: "Wrong Response",
        color: "hsl(var(--chart-3))",
    },
    skipped: {
        label: "Skipped",
        color: "hsl(var(--chart-4))",
    },
} satisfies ChartConfig;

export function QuestionInsightsAnalysisChartComponent({
    question,
}: {
    question: QuestionInsights;
}) {
    const chartData = [
        {
            responseType: "correct",
            value: question.questionAttemptedAnalysis.correct,
            fill: "#97D4B4",
        },
        {
            responseType: "partiallyCorrect",
            value: question.questionAttemptedAnalysis.partiallyCorrect,
            fill: "#FFDD82",
        },
        {
            responseType: "wrongResponse",
            value: question.questionAttemptedAnalysis.wrongResponse,
            fill: "#F49898",
        },
        {
            responseType: "skipped",
            value: question.questionAttemptedAnalysis.skipped,
            fill: "#EEE",
        },
    ];
    return (
        <ChartContainer config={chartConfig} className="mx-auto aspect-square h-[180px]">
            <PieChart>
                <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                <Pie
                    data={chartData}
                    dataKey="value"
                    nameKey="responseType"
                    innerRadius={42}
                    strokeWidth={2}
                />
            </PieChart>
        </ChartContainer>
    );
}
