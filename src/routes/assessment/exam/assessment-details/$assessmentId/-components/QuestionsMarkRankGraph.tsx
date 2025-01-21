import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart";
import { overviewTabCloseTestData } from "../-utils/dummy-data";
import { MyButton } from "@/components/design-system/button";
import { ArrowCounterClockwise, Export } from "phosphor-react";
import AssessmentDetailsRankMarkTable from "./QuestionsRankMarkTable";

const chartData = overviewTabCloseTestData.marksRankData.map(({ rank, marks }) => ({
    rank,
    mark: marks,
}));

const chartConfig = {
    mark: {
        label: "mark",
        color: "hsl(var(--chart-1))",
    },
} satisfies ChartConfig;

export function AssessmentDetailsMarkRankGraph() {
    return (
        <ChartContainer config={chartConfig}>
            <LineChart
                accessibilityLayer
                data={chartData}
                margin={{
                    left: 12,
                    right: 12,
                    bottom: 50,
                }}
            >
                <CartesianGrid vertical={false} />
                <XAxis
                    dataKey="rank"
                    tickLine={false}
                    axisLine={true}
                    tickMargin={8}
                    label={{
                        value: "Rank",
                        position: "left",
                        dx: 35,
                        dy: 30,
                        style: { fontSize: "14px", fill: "#ED7424" },
                    }}
                />
                <YAxis
                    dataKey="mark"
                    tickLine={false}
                    axisLine={true}
                    tickMargin={8}
                    label={{
                        value: "Marks Obtained",
                        angle: -90,
                        position: "left",
                        dx: 10,
                        dy: 10,
                        style: { fontSize: "14px", fill: "#ED7424" },
                    }}
                />
                <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                <Line
                    dataKey="mark"
                    type="natural"
                    stroke="var(--color-mark)"
                    strokeWidth={2}
                    activeDot={{
                        r: 6,
                    }}
                />
            </LineChart>
        </ChartContainer>
    );
}

export function QuestionsMarkRankGraph() {
    return (
        <div className="flex flex-col">
            <div className="flex items-center justify-between">
                <h1>Marks-Rank Graph</h1>
                <div className="flex items-center gap-6">
                    <MyButton
                        type="button"
                        scale="large"
                        buttonType="secondary"
                        className="font-medium"
                    >
                        <Export size={32} />
                        Export
                    </MyButton>
                    <MyButton
                        type="button"
                        scale="large"
                        buttonType="secondary"
                        className="min-w-8 font-medium"
                    >
                        <ArrowCounterClockwise size={32} />
                    </MyButton>
                </div>
            </div>
            <div className="mt-6 flex items-start gap-16">
                <div className="w-1/2">
                    <AssessmentDetailsMarkRankGraph />
                </div>
                <div className="w-1/2">
                    <AssessmentDetailsRankMarkTable />
                </div>
            </div>
        </div>
    );
}
